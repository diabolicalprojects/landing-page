const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const config = require('./config');

const COOKIE_NAME = 'diabolical_admin';

/**
 * Sesión sin estado: cookie httpOnly con `expiración.HMAC(expiración)`. No guarda
 * nada en disco, así que sobrevive a reinicios y a varias réplicas del contenedor.
 */
function signSession(expiresAt) {
    const payload = String(expiresAt);
    const signature = crypto
        .createHmac('sha256', config.sessionSecret)
        .update(payload)
        .digest('hex');
    return `${payload}.${signature}`;
}

function verifySession(token) {
    if (!token || !config.sessionSecret) return false;

    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expected = crypto
        .createHmac('sha256', config.sessionSecret)
        .update(payload)
        .digest('hex');

    const given = Buffer.from(signature, 'utf8');
    const valid = Buffer.from(expected, 'utf8');
    if (given.length !== valid.length) return false;
    if (!crypto.timingSafeEqual(given, valid)) return false;

    return Number(payload) > Date.now();
}

async function verifyCredentials(username, password) {
    if (!config.adminEnabled) return false;
    if (typeof username !== 'string' || typeof password !== 'string') return false;

    const userBuffer = Buffer.from(username, 'utf8');
    const expectedBuffer = Buffer.from(config.adminUsername, 'utf8');
    const userMatches =
        userBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(userBuffer, expectedBuffer);

    // Se comprueba la contraseña siempre, incluso con usuario incorrecto, para no
    // filtrar por tiempo de respuesta qué usuario existe.
    const passwordMatches = await bcrypt.compare(password, config.adminPasswordHash);

    return userMatches && passwordMatches;
}

function sessionCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'strict',
        secure: config.nodeEnv === 'production',
        maxAge: config.sessionTtlMs,
        path: '/',
    };
}

/** Middleware: corta con 401 cualquier petición sin sesión válida. */
function requireAuth(req, res, next) {
    if (!config.adminEnabled) {
        return res.status(503).json({
            error: 'El panel de administración está deshabilitado. Configura ADMIN_USERNAME, ADMIN_PASSWORD_HASH y SESSION_SECRET.',
        });
    }

    if (!verifySession(req.cookies?.[COOKIE_NAME])) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    return next();
}

module.exports = {
    COOKIE_NAME,
    signSession,
    verifySession,
    verifyCredentials,
    sessionCookieOptions,
    requireAuth,
};
