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
    title: 'Agencia de IA y Marketing en Aguascalientes | Diabolical',
    // 150 caracteres: por encima de ~160 Google la corta, y lo primero que
    // se pierde es lo del final.
    description:
        'Agencia de IA en Aguascalientes: posicionamiento, Google Ads, sitio web, marca y atención automática. 17 servicios, cada uno con su alcance publicado.',
    keywords:
        'agencia de IA Aguascalientes, agencia de marketing digital Aguascalientes, inteligencia artificial para negocios, posicionamiento web Aguascalientes, Google Ads Aguascalientes, diseño web, automatización con IA, chatbot WhatsApp',
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
