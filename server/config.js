// quiet: dotenv imprime un banner promocional en cada arranque y en cada build.
require('dotenv').config({ quiet: true });

const path = require('path');

const rootDir = path.join(__dirname, '..');

const config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    distPath: path.join(rootDir, 'dist'),
    // Sobrescribible para apuntar a un volumen persistente en Docker/Cloud Run.
    dataDir: process.env.DATA_DIR || path.join(rootDir, 'data'),

    siteUrl: process.env.SITE_URL || 'https://diabolicalservices.tech',

    // Credenciales del panel /admin. Sin ellas el panel queda deshabilitado (fail-closed).
    adminUsername: process.env.ADMIN_USERNAME || '',
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
    sessionSecret: process.env.SESSION_SECRET || '',
    sessionTtlMs: Number(process.env.SESSION_TTL_HOURS || 8) * 60 * 60 * 1000,

    // Orígenes permitidos para la API. Vacío = solo mismo origen.
    corsOrigins: (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),

    // Permite validar la CSP en producción sin romper nada antes de forzarla.
    cspReportOnly: process.env.CSP_REPORT_ONLY === 'true',

    // Dominios externos que la página necesita contactar (webhook de captación de leads).
    n8nOrigin: process.env.N8N_ORIGIN || 'https://n8n.diabolicalservices.tech',

    // --- Ficha local para el JSON-LD ---------------------------------------
    // Todo esto es opcional y solo se publica si está definido. Son los datos
    // que Google usa para el paquete local y que los motores de IA citan al
    // recomendar un proveedor cercano; inventarlos sería publicar información
    // falsa, así que se omiten mientras no se configuren.
    streetAddress: process.env.BUSINESS_STREET || '',
    postalCode: process.env.BUSINESS_POSTAL_CODE || '',
    latitude: process.env.BUSINESS_LATITUDE || '',
    longitude: process.env.BUSINESS_LONGITUDE || '',
    googleMapsUrl: process.env.BUSINESS_MAPS_URL || '',
    opensAt: process.env.BUSINESS_OPENS || '09:00',
    closesAt: process.env.BUSINESS_CLOSES || '18:00',
    openingHours: (process.env.BUSINESS_OPEN_DAYS || '')
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
    // Perfiles oficiales (Instagram, Facebook, LinkedIn, ficha de Google).
    sameAs: (process.env.BUSINESS_PROFILES || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean),
};

config.adminEnabled = Boolean(
    config.adminUsername && config.adminPasswordHash && config.sessionSecret
);

module.exports = config;
