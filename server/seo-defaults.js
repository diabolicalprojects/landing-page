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
 * Tag Manager vive estático en index.html, fuera de los marcadores SEO_INJECT,
 * para que cargue en cualquier despliegue. Por eso `googleTagManager` y
 * `customHeaderScripts` van vacíos: rellenarlos desde /admin añadiría un
 * SEGUNDO contenedor, no sustituiría al primero.
 *
 * Google Analytics no aparece por ninguna parte a propósito. GA4 está
 * configurado dentro del contenedor de Tag Manager, así que el gtag.js suelto
 * que había en index.html medía la misma propiedad por segunda vez: 167 KiB de
 * carga para contar cada visita dos veces. Si alguna vez hace falta volver a
 * ponerlo, primero hay que quitar GA4 de Tag Manager.
 */
const defaults = {
    title: 'Agencia de páginas web e IA en Aguascalientes | Diabolical',
    // 150 caracteres: por encima de ~160 Google la corta, y lo primero que
    // se pierde es lo del final.
    description:
        'Agencia de diseño y desarrollo de páginas web e inteligencia artificial en Aguascalientes: sitios, tiendas en línea, SEO y atención automática.',
    keywords:
        'agencia de páginas web Aguascalientes, empresa de diseño web Aguascalientes, páginas web Aguascalientes, inteligencia artificial para negocios en Aguascalientes, agencia de IA Aguascalientes, tiendas en línea Aguascalientes, posicionamiento web Aguascalientes, chatbot WhatsApp',
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
