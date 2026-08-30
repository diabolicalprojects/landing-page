const config = require('./config');

/**
 * Valores por defecto de lo que se puede editar desde /admin.
 *
 * Los datos estructurados (JSON-LD) ya NO viven aquí: los construye
 * server/schema.js por ruta, a partir de src/data/sectores.json. Tenerlos en
 * código evita que la portada y las páginas de sector se desincronicen, y
 * permite enlazar las entidades por @id. El campo `structuredData` queda como
 * bloque adicional opcional para casos puntuales.
 *
 * GTM y Google Analytics viven estáticos en index.html, fuera de los
 * marcadores SEO_INJECT, para que carguen en cualquier despliegue. Por eso
 * `googleTagManager` y `customHeaderScripts` van vacíos: rellenarlos desde
 * /admin duplicaría las etiquetas.
 */
const defaults = {
    title: 'Automatización con IA en Aguascalientes | Diabolical Services',
    description:
        'Instalamos sistemas de IA que atienden, agendan y dan seguimiento por ti: clínicas, spas, gimnasios, despachos y oficinas en Aguascalientes. Auditoría de fricción gratuita.',
    keywords:
        'automatización con IA Aguascalientes, agencia de inteligencia artificial, chatbot WhatsApp para negocios, agendar citas automático, automatización de ventas, IA para clínicas, IA para spas, IA para gimnasios',
    siteUrl: config.siteUrl,
    favicon: '/favicon.svg',
    ogImage: `${config.siteUrl}/og-image.png`,
    twitterHandle: '@diabolical',
    sitemapXml: '',
    robotsTxt: '',
    structuredData: '',
    googleTagManager: '',
    metaPixel: '',
    customHeaderScripts: '',
};

/** Solo estas claves se aceptan al guardar; cualquier otra se descarta. */
const ALLOWED_KEYS = Object.keys(defaults);

module.exports = { defaults, ALLOWED_KEYS };
