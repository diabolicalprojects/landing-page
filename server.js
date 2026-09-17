const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const config = require('./server/config');
const { buildHelmet, buildCors, loginLimiter, apiLimiter, leadLimiter } = require('./server/security');
const { readSettings, writeSettings, ensureDataDir } = require('./server/settings');
const {
    leerContenido,
    escribirContenido,
    restablecerContenido,
    esPersonalizado,
    BASE: CONTENIDO_BASE,
} = require('./server/contenido');
const { registrarLead, listarLeads, marcarLead, resumenLeads } = require('./server/leads');
const { prepararSsr, renderizar, estadoSsr } = require('./server/ssr');
const { injectSeo } = require('./server/render');
const { escapeHtml, serializeJson } = require('./server/html');
const { construirRobots } = require('./server/robots');
const { construirLlms, construirLlmsFull } = require('./server/llms');
const {
    RUTAS_PUBLICAS,
    RUTAS_PRERENDER,
    REDIRECCIONES,
    archivoPrerender,
} = require('./server/schema');
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
// soft-404 con estado 200, que Google penaliza. Las públicas salen de
// server/schema.js para que router, sitemap y prerender no se desincronicen.
const APP_ROUTES = new Set([...RUTAS_PUBLICAS, '/admin']);
const PRERENDER = new Set(RUTAS_PRERENDER);

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

// --- Contenido editable ----------------------------------------------------

// Lectura pública: es el mismo contenido que ya viaja dentro del HTML servido,
// así que no revela nada. La expone para que el panel pueda cargar el estado
// actual antes de identificarse y para poder comprobarlo desde fuera.
app.get('/api/contenido', buildCors(), apiLimiter, (req, res) => {
    const { valor, version } = leerContenido();
    res.json({ contenido: valor, version, base: CONTENIDO_BASE });
});

app.post('/api/contenido', buildCors(), apiLimiter, requireAuth, (req, res) => {
    try {
        const resultado = escribirContenido(req.body);
        if (!resultado.ok) return res.status(400).json({ error: resultado.error });
        res.json({ success: true, version: resultado.version });
    } catch (error) {
        console.error('[contenido] Error al guardar:', error);
        res.status(500).json({ error: 'No se pudo guardar el contenido.' });
    }
});

// Vuelve al contenido de fábrica. Es la salida de emergencia cuando una edición
// deja la página inservible y no se acierta a deshacerla a mano.
app.post('/api/contenido/restablecer', buildCors(), apiLimiter, requireAuth, (req, res) => {
    try {
        res.json({ success: true, ...restablecerContenido() });
    } catch (error) {
        console.error('[contenido] Error al restablecer:', error);
        res.status(500).json({ error: 'No se pudo restablecer el contenido.' });
    }
});

// --- Bandeja de prospectos -------------------------------------------------

/*
 * Alta pública. El formulario y el chatbot siguen enviando a n8n igual que
 * siempre; esto es una copia local que además convierte un fallo del webhook en
 * un prospecto guardado en vez de un prospecto perdido.
 *
 * Usa leadLimiter, más estrecho que el de la API general: es la única ruta de
 * escritura sin sesión, y la que un bot intentaría inundar.
 */
app.post('/api/leads', buildCors(), leadLimiter, (req, res) => {
    try {
        const resultado = registrarLead(req.body, { origen: req.get('referer') || '' });
        if (!resultado.ok) return res.status(400).json({ error: resultado.error });
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('[leads] Error al registrar:', error);
        res.status(500).json({ error: 'No se pudo registrar el envío.' });
    }
});

app.get('/api/leads', buildCors(), apiLimiter, requireAuth, (req, res) => {
    const limite = Math.min(Number(req.query.limite) || 100, 300);
    const desde = Math.max(Number(req.query.desde) || 0, 0);
    res.json({ ...listarLeads({ limite, desde }), resumen: resumenLeads() });
});

app.patch('/api/leads/:id', buildCors(), apiLimiter, requireAuth, (req, res) => {
    const resultado = marcarLead(req.params.id, req.body || {});
    if (!resultado.ok) return res.status(400).json({ error: resultado.error });
    res.json({ success: true, ...resultado });
});

// --- robots.txt y sitemap.xml dinámicos ------------------------------------

// Guía del negocio para los motores generativos. Se sirve como texto plano y
// se genera de los mismos datos que las páginas, para que no se desactualice.
app.get('/llms.txt', (req, res) => {
    res.type('text/plain; charset=utf-8').send(construirLlms());
});

app.get('/llms-full.txt', (req, res) => {
    res.type('text/plain; charset=utf-8').send(construirLlmsFull());
});

// Huella del código fuente con el que se construyó esta imagen. La escribe el
// prerender y la compara el workflow de despliegue: sin ella, una comprobación
// contra producción puede dar por buena la versión anterior.
const BUILD_ID = (() => {
    try {
        return fs.readFileSync(path.join(config.distPath, 'build-id.txt'));
    } catch {
        return null;
    }
})();

app.get('/build-id.txt', (req, res) => {
    if (!BUILD_ID) return res.status(503).type('text/plain').send('sin build-id\n');
    res.type('text/plain; charset=utf-8').send(BUILD_ID);
});

app.get('/robots.txt', (req, res) => {
    // Lo editado desde /admin manda; si no, se genera con la lista de
    // rastreadores de IA (ver server/robots.js).
    res.type('text/plain').send(readSettings().robotsTxt || construirRobots());
});

app.get('/sitemap.xml', (req, res) => {
    const settings = readSettings();
    if (settings.sitemapXml) {
        return res.type('application/xml').send(settings.sitemapXml);
    }

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = escapeHtml(settings.siteUrl);
    const urls = RUTAS_PUBLICAS
        .map(
            (route) =>
                `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
        )
        .join('\n');

    return res.type('application/xml').send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    );
});

// Una URL, una versión. `/servicios/` devolvía un 404 mientras `/servicios`
// devolvía la página: cualquier enlace externo escrito con barra final se
// perdía, y un rastreador que normaliza las URLs con barra no encontraba nada.
// Solo redirige a rutas de la lista blanca, así que no puede convertirse en un
// redirector abierto.
app.get(/^\/(.+)\/$/, (req, res, next) => {
    const sinBarra = req.path.slice(0, -1);
    if (!APP_ROUTES.has(sinBarra)) return next();
    return res.redirect(301, sinBarra + req.url.slice(req.path.length));
});

// Fichero de verificación de IndexNow. Se registra la ruta exacta al arrancar,
// en vez de un patrón, para que no pueda ensombrecer a robots.txt ni a llms.txt.
if (config.indexNowKey) {
    app.get(`/${config.indexNowKey}.txt`, (req, res) => {
        res.type('text/plain').send(config.indexNowKey);
    });
}

// --- Estáticos --------------------------------------------------------------

// app-shell.html y prerender/ son artefactos internos del build, no páginas.
// Sin esto quedarían accesibles como URLs duplicadas del contenido real.
app.get('/app-shell.html', (req, res) => res.redirect(301, '/'));
app.get('/prerender/*', (req, res) => res.redirect(301, '/'));

/*
 * Direcciones antiguas que ya estaban indexadas.
 *
 * Al pasar los sectores de /automatizacion-para-X a /sectores/X, esas URLs
 * seguían existiendo en el índice de Google y en enlaces de fuera. Devolverles
 * un 404 tiraría a la basura todo lo que esas páginas hubieran ganado; un 301
 * traslada esa autoridad a la dirección nueva.
 */
for (const [vieja, nueva] of Object.entries(REDIRECCIONES)) {
    app.get(vieja, (req, res) => res.redirect(301, nueva));
}

// Sirve la variante precomprimida cuando el build la dejó lista.
//
// scripts/prerender.mjs escribe un .br y un .gz junto a cada asset con hash,
// comprimidos a calidad máxima. Eso importa porque `compression` comprime en
// caliente con Brotli de calidad 4, que sobre el bundle principal produce
// 147 kB: más que su propio gzip (145 kB) y bastante más que Brotli al máximo
// (126 kB). Como los navegadores anuncian `br` antes que `gzip`, sin esto
// reciben la peor de las tres versiones.
//
// Solo se aplica a rutas con hash en el nombre (/assets/), que son inmutables:
// ahí el fichero comprimido no puede quedar desfasado respecto al original.
const CODIFICACIONES = [
    { nombre: 'br', extension: '.br' },
    { nombre: 'gzip', extension: '.gz' },
];

// Sin punto de montaje a propósito: `app.use('/assets', ...)` recorta el
// prefijo de req.url dentro del handler y lo restaura al salir, así que la
// reescritura se perdería antes de llegar a express.static.
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (!req.path.startsWith('/assets/')) return next();

    // Las variantes comprimidas se sirven por negociación, nunca por su nombre.
    // Pedirlas directamente solo lo haría un rastreador, y descargaría un blob
    // binario con el mismo contenido que el asset original.
    if (/\.(br|gz)$/i.test(req.path)) return res.sendStatus(404);

    const aceptadas = String(req.headers['accept-encoding'] || '');

    let relativa;
    try {
        relativa = decodeURIComponent(req.path);
    } catch {
        return next(); // porcentaje mal formado en la URL
    }

    // Sin esta comprobación un `..` en la ruta alcanzaría ficheros fuera de dist.
    const raizAssets = path.resolve(config.distPath, 'assets');
    const destino = path.resolve(config.distPath, '.' + relativa);
    if (!destino.startsWith(raizAssets + path.sep)) return next();

    for (const { nombre, extension } of CODIFICACIONES) {
        if (!aceptadas.includes(nombre)) continue;
        if (!fs.existsSync(destino + extension)) continue;

        // El tipo se toma de la extensión original: el navegador debe recibir
        // application/javascript, no el tipo del contenedor comprimido.
        res.type(path.extname(destino));
        res.setHeader('Content-Encoding', nombre);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        // Sin Vary, una caché intermedia podría entregar la versión brotli a un
        // cliente que no la entiende.
        res.setHeader('Vary', 'Accept-Encoding');
        req.url = `${req.path}${extension}`;
        return next();
    }

    return next();
});

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
                return;
            }

            // Lo de public/ no lleva hash, así que no puede ser immutable: si se
            // reemplaza, el nombre no cambia. Pero una hora es demasiado poco
            // para una fuente, y PageSpeed lo señala. Se reparte por tipo:
            // las fuentes no se editan nunca —se sustituyen por otro archivo—,
            // mientras una imagen de marca sí puede cambiar sin renombrarse.
            if (/\.(woff2?|otf|ttf|eot)$/i.test(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else if (/\.(png|jpe?g|webp|avif|svg|ico|gif)$/i.test(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
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

const ETIQUETA_ROOT = '<div id="root">';

/*
 * Identidad del build.
 *
 * El ETag de una página tiene que cambiar cuando cambia CUALQUIERA de las dos
 * cosas que la componen: el contenido editado y el código desplegado.
 *
 * Con solo la versión del contenido había un agujero serio: un despliegue que
 * tocara únicamente código dejaba el ETag idéntico, el navegador revalidaba,
 * recibía 304 y seguía usando el HTML guardado. Ese HTML apunta a los assets
 * con hash del build ANTERIOR, que ya no existen en dist. Resultado para quien
 * ya había visitado el sitio: página en blanco hasta vaciar la caché.
 *
 * dist/build-id.txt es la huella del código fuente de este commit y la genera
 * el propio build (scripts/build-id.mjs), así que sirve exactamente para esto.
 */
const idBuild = (() => {
    try {
        return fs.readFileSync(path.join(config.distPath, 'build-id.txt'), 'utf8').trim().slice(0, 12);
    } catch {
        // Sin build todavía; el servidor responde 503 igualmente más abajo.
        return 'sin-build';
    }
})();

/**
 * Construye el HTML de una ruta con el contenido actual.
 *
 * Tres caminos, en este orden:
 *
 *   1. Render en caliente. Es el normal: coge el shell del build y le mete el
 *      markup recién renderizado con el contenido que hay guardado ahora. Lo
 *      que se edita en el panel sale aquí, y por tanto lo ven los rastreadores.
 *   2. HTML estático del build, solo si NADIE ha editado nada. Con el contenido
 *      de fábrica ese HTML sigue siendo exacto.
 *   3. Shell vacío. Si hay contenido editado y el render en caliente no está
 *      disponible, servir el estático daría texto viejo y además React lo
 *      tiraría al hidratar por no coincidir. Vale más montar en cliente.
 *
 * El nombre del fichero se deriva de la ruta, así que solo se consulta para
 * rutas de la lista blanca: construirlo con un req.path arbitrario abriría un
 * path traversal.
 */
async function construirPagina(ruta, { indexable }) {
    const { valor, version } = leerContenido();

    let html = null;

    if (PRERENDER.has(ruta)) {
        const renderizado = await renderizar(ruta);
        if (renderizado) {
            const shell = loadHtml('app-shell.html') || loadHtml('index.html');
            if (shell) {
                html = shell.replace(
                    ETIQUETA_ROOT,
                    `${ETIQUETA_ROOT}${renderizado.markup}`
                );
            }
        } else if (!esPersonalizado()) {
            html = loadHtml(archivoPrerender(ruta));
        }
    }

    html = html || loadHtml('app-shell.html') || loadHtml('index.html');
    if (!html) return null;

    // El contenido viaja en el propio HTML para que React hidrate con el mismo
    // dato con el que se generó el markup. Si llegara por fetch después, la
    // página parpadearía del texto de fábrica al editado en cada carga.
    html = html.replace(
        ETIQUETA_ROOT,
        `<script>window.__CONTENIDO__=${serializeJson(valor)}</script>${ETIQUETA_ROOT}`
    );

    return { html: injectSeo(html, readSettings(), ruta, { indexable }), version };
}

app.get('*', async (req, res, next) => {
    try {
        const isKnownRoute = APP_ROUTES.has(req.path);
        const pagina = await construirPagina(req.path, { indexable: isKnownRoute });

        if (!pagina) {
            return res
                .status(503)
                .type('text/plain')
                .send('El build no existe todavía. Ejecuta `npm run build`.');
        }

        // Build + contenido: las dos cosas que pueden cambiar esta página. Si
        // faltara cualquiera de las dos, un 304 devolvería HTML desfasado.
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('ETag', `W/"${idBuild}-${pagina.version}"`);

        return res
            .status(isKnownRoute ? 200 : 404)
            .type('html')
            .send(pagina.html);
    } catch (error) {
        // Express 4 no captura el rechazo de un handler async: sin este catch,
        // un fallo aquí deja la petición colgada hasta que el cliente desiste.
        return next(error);
    }
});

// Red de seguridad: cualquier error no capturado devuelve 500 en vez de dejar
// la petición colgada, y nunca expone el stack al cliente. Los cuatro
// argumentos son obligatorios para que Express lo trate como manejador de
// errores, aunque `next` no se use.
app.use((error, req, res, next) => {
    if (res.headersSent) return;

    /*
     * Cuerpo demasiado grande o JSON mal formado.
     *
     * express.json rechaza estas dos antes de que el handler llegue a correr, y
     * sin este caso salían como «Error interno del servidor»: el panel decía
     * que el fallo era nuestro cuando el problema era un pegado enorme o un
     * JSON roto, y quien editaba no tenía forma de saber qué corregir.
     */
    if (error?.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'El contenido enviado es demasiado grande. Acorta los textos o usa menos elementos.',
        });
    }
    if (error?.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'El contenido enviado no es JSON válido.' });
    }

    console.error('[server] Error no capturado:', error);
    res.status(500).type('text/plain').send('Error interno del servidor');
});

// El bundle de servidor se carga al arrancar, no en la primera petición: así el
// coste del import no se lo come el primer visitante, y si falta se ve en los
// logs del arranque en vez de descubrirse cuando alguien edita algo.
prepararSsr().then(() => {
    const { disponible, motivoFallo } = estadoSsr();
    if (disponible) {
        console.log('[ssr] Render en caliente activo: lo editado en /admin sale en el HTML servido.');
    } else {
        console.warn(
            `[ssr] Sin render en caliente (${motivoFallo}). Se sirve el HTML del build; ` +
                'el contenido editado desde /admin solo se verá tras hidratar.'
        );
    }
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
