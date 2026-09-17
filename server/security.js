const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./config');

const GOOGLE_TAG = ['https://www.googletagmanager.com', 'https://tagmanager.google.com'];
const GOOGLE_ANALYTICS = [
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://*.analytics.google.com',
    'https://*.google-analytics.com',
];
const META_PIXEL = ['https://connect.facebook.net', 'https://www.facebook.com'];

/**
 * CSP ajustada a lo que la página usa de verdad: GTM/GA, Meta Pixel, Google Fonts
 * y el webhook de n8n. `unsafe-inline` es inevitable mientras GTM y los estilos
 * inline de Tailwind/React sigan en la página.
 *
 * Con CSP_REPORT_ONLY=true se puede desplegar en modo observación y revisar la
 * consola antes de forzarla.
 */
function buildHelmet() {
    return helmet({
        contentSecurityPolicy: {
            reportOnly: config.cspReportOnly,
            useDefaults: false,
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                // 'self' y no 'none': el panel /admin muestra el sitio real
                // dentro de un <iframe> para la vista previa en vivo. Sigue
                // bloqueando que lo enmarque cualquier otro dominio, que es de
                // lo que protege esta directiva (clickjacking).
                frameAncestors: ["'self'"],
                formAction: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", ...GOOGLE_TAG, ...GOOGLE_ANALYTICS, ...META_PIXEL],
                scriptSrcAttr: ["'none'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
                imgSrc: ["'self'", 'data:', 'blob:', ...GOOGLE_TAG, ...GOOGLE_ANALYTICS, ...META_PIXEL],
                // @remotion/player inyecta un MP3 silencioso en data: para
                // desbloquear el autoplay del navegador. Sin esta directiva cae
                // a default-src, el reproductor lo intenta en bucle y cada
                // intento deja un error en la consola. El reproductor va
                // muteado, así que no se oía nada: solo costaba puntos.
                mediaSrc: ["'self'", 'data:', 'blob:'],
                connectSrc: [
                    "'self'",
                    config.n8nOrigin,
                    ...GOOGLE_TAG,
                    ...GOOGLE_ANALYTICS,
                    ...META_PIXEL,
                ],
                frameSrc: ["'self'", ...GOOGLE_TAG],
                manifestSrc: ["'self'"],
                upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
            },
        },
        crossOriginEmbedderPolicy: false,
        // Los assets (og-image, logos) se embeben desde WhatsApp, Facebook y X.
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });
}

/**
 * La API solo la consume el propio front. Sin CORS_ORIGINS configurado se
 * rechaza cualquier origen cruzado en lugar de abrirla a todo internet.
 */
function buildCors() {
    return cors({
        origin(origin, callback) {
            // Sin cabecera Origin: misma página, curl o app nativa. Se permite.
            if (!origin) return callback(null, true);
            if (config.corsOrigins.includes(origin)) return callback(null, true);
            return callback(null, false);
        },
        credentials: true,
    });
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de acceso. Espera 15 minutos.' },
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones.' },
});

/*
 * Alta de prospectos: la única ruta de escritura que no exige sesión, y por eso
 * la que un bot intentaría inundar. Veinte envíos por IP cada diez minutos deja
 * holgura de sobra a una persona que se equivoca y reenvía, y corta en seco el
 * relleno automático.
 */
const leadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiados envíos. Espera unos minutos.' },
});

module.exports = { buildHelmet, buildCors, loginLimiter, apiLimiter, leadLimiter };
