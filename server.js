const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const config = require('./server/config');
const { buildHelmet, buildCors, loginLimiter, apiLimiter } = require('./server/security');
const { readSettings, writeSettings, ensureDataDir } = require('./server/settings');
const { injectSeo } = require('./server/render');
const { escapeHtml } = require('./server/html');
const {
    COOKIE_NAME,
    signSession,
    verifySession,
    verifyCredentials,
    sessionCookieOptions,
    requireAuth,
} = require('./server/auth');

const app = express();

// Rutas que sirve React Router. Cualquier otra devuelve 404 real en vez de un
// soft-404 con estado 200, que Google penaliza.
const APP_ROUTES = new Set(['/', '/admin', '/politica-privacidad']);

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(compression());
app.use(buildHelmet());
app.use(cookieParser());
app.use(express.json({ limit: '256kb' }));

try {
    ensureDataDir();
} catch (error) {
    // Un DATA_DIR no escribible no debe tumbar el sitio: solo impide guardar
    // desde /admin, y eso se ve al intentarlo.
    console.error('[settings] No se pudo preparar DATA_DIR:', error.message);
}

// --- API -------------------------------------------------------------------

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/api/login', buildCors(), loginLimiter, async (req, res) => {
    if (!config.adminEnabled) {
        return res.status(503).json({
            error: 'Panel deshabilitado. Faltan ADMIN_USERNAME, ADMIN_PASSWORD_HASH o SESSION_SECRET.',
        });
    }

    const { username, password } = req.body || {};

    // Express 4 no captura rechazos de handlers async: sin este try, un hash mal
    // formado dejaría la petición colgada sin respuesta.
    try {
        if (!(await verifyCredentials(username, password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('[auth] Error verificando credenciales:', error.message);
        return res.status(500).json({ error: 'Error de autenticación' });
    }

    const expiresAt = Date.now() + config.sessionTtlMs;
    res.cookie(COOKIE_NAME, signSession(expiresAt), sessionCookieOptions());
    return res.json({ ok: true, expiresAt });
});

app.post('/api/logout', buildCors(), (req, res) => {
    res.clearCookie(COOKIE_NAME, { ...sessionCookieOptions(), maxAge: undefined });
    res.json({ ok: true });
});

app.get('/api/session', buildCors(), (req, res) => {
    res.json({
        authenticated: verifySession(req.cookies?.[COOKIE_NAME]),
        adminEnabled: config.adminEnabled,
    });
});

// Lectura pública: son los mismos metadatos que ya salen en el HTML.
app.get('/api/settings', buildCors(), apiLimiter, (req, res) => {
    res.json(readSettings());
});

// Escritura solo con sesión válida.
app.post('/api/settings', buildCors(), apiLimiter, requireAuth, (req, res) => {
    try {
        res.json({ success: true, settings: writeSettings(req.body) });
    } catch (error) {
        console.error('[settings] Error al guardar:', error);
        res.status(500).json({ error: 'No se pudo guardar la configuración' });
    }
});

// --- robots.txt y sitemap.xml dinámicos ------------------------------------

app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(readSettings().robotsTxt);
});

app.get('/sitemap.xml', (req, res) => {
    const settings = readSettings();
    if (settings.sitemapXml) {
        return res.type('application/xml').send(settings.sitemapXml);
    }

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = escapeHtml(settings.siteUrl);
    const urls = ['/', '/politica-privacidad']
        .map(
            (route) =>
                `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
        )
        .join('\n');

    return res.type('application/xml').send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    );
});

// --- Estáticos --------------------------------------------------------------

// app-shell.html es un artefacto interno del prerender, no una página.
app.get('/app-shell.html', (req, res) => res.redirect(301, '/'));

// `index: false` es imprescindible: si express.static resuelve el index.html de
// "/" por su cuenta, el handler de abajo nunca corre y la home se queda sin
// meta-tags inyectados (el bug que dejaba /admin sin efecto sobre la portada).
app.use(
    express.static(config.distPath, {
        index: false,
        setHeaders(res, filePath) {
            // Los assets de Vite llevan hash en el nombre: cachear a un año es seguro.
            if (filePath.includes(`${path.sep}assets${path.sep}`)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
        },
    })
);

// --- Shell de la SPA con SEO inyectado -------------------------------------

// dist/index.html lleva la portada ya renderizada (ver scripts/prerender.mjs).
// El resto de rutas reciben el shell vacío: servirles el HTML de la portada
// obligaría a React a descartarlo al hidratar.
const cache = new Map();

function loadHtml(fileName) {
    const filePath = path.join(config.distPath, fileName);
    if (!fs.existsSync(filePath)) return null;

    const { mtimeMs } = fs.statSync(filePath);
    const cached = cache.get(fileName);
    if (cached && cached.mtimeMs === mtimeMs) return cached.html;

    const html = fs.readFileSync(filePath, 'utf8');
    cache.set(fileName, { html, mtimeMs });
    return html;
}

app.get('*', (req, res) => {
    const html =
        req.path === '/'
            ? loadHtml('index.html')
            : (loadHtml('app-shell.html') || loadHtml('index.html'));

    if (!html) {
        return res
            .status(503)
            .type('text/plain')
            .send('El build no existe todavía. Ejecuta `npm run build`.');
    }

    const isKnownRoute = APP_ROUTES.has(req.path);

    res.setHeader('Cache-Control', 'no-cache');
    return res
        .status(isKnownRoute ? 200 : 404)
        .type('html')
        .send(injectSeo(html, readSettings(), req.path, { indexable: isKnownRoute }));
});

// Red de seguridad: cualquier error no capturado devuelve 500 en vez de dejar
// la petición colgada, y nunca expone el stack al cliente. Los cuatro
// argumentos son obligatorios para que Express lo trate como manejador de
// errores, aunque `next` no se use.
app.use((error, req, res, next) => {
    console.error('[server] Error no capturado:', error);
    if (res.headersSent) return;
    res.status(500).type('text/plain').send('Error interno del servidor');
});

const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Diabolical landing escuchando en 0.0.0.0:${config.port} (${config.nodeEnv})`);
    if (!config.adminEnabled) {
        console.warn(
            '[auth] Panel /admin deshabilitado: faltan ADMIN_USERNAME, ADMIN_PASSWORD_HASH o SESSION_SECRET.'
        );
    }
    if (config.cspReportOnly) {
        console.warn('[security] CSP en modo report-only: no bloquea, solo reporta.');
    }
});

// Cierre ordenado: sin esto Docker mata el proceso a los 10s y corta las
// peticiones en vuelo durante cada despliegue.
for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
        console.log(`[server] ${signal} recibido, cerrando...`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 10000).unref();
    });
}
