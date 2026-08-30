const SECTORES = require('../src/data/sectores.json');
const ARTICULOS = require('../src/data/articulos.json');
const config = require('./config');

const SITE = config.siteUrl;

/**
 * Identificadores estables. Referenciar entidades por @id en lugar de repetirlas
 * evita que Google (y los motores de IA) crean que hay varias empresas
 * distintas descritas en el mismo sitio.
 */
const ID_NEGOCIO = `${SITE}/#negocio`;
const ID_WEBSITE = `${SITE}/#website`;

const TELEFONO = '+524495136907';
const EMAIL = 'contacto@diabolicalservices.tech';

const rutaSector = (slug) => `/automatizacion-para-${slug}`;
const rutaArticulo = (slug) => `/blog/${slug}`;

/** Índice del blog. Existe como constante porque la referencian las migas,
 *  los metadatos, el JSON-LD y el sitemap, y un literal repetido cinco veces
 *  es justo el tipo de dato que se desincroniza al renombrar. */
const RUTA_BLOG = '/blog';

/** Los más recientes primero, igual que en el cliente. */
const ARTICULOS_POR_FECHA = [...ARTICULOS].sort((a, b) => b.fecha.localeCompare(a.fecha));

/**
 * La entidad principal. `areaServed` y `knowsAbout` son las señales que usan
 * los motores generativos para decidir si esta empresa responde a una consulta
 * local sobre automatización.
 *
 * Los campos de dirección exacta, coordenadas, horario y ficha de Google se
 * añaden solo si están configurados por entorno: inventarlos sería publicar
 * datos falsos, y una dirección equivocada hace más daño que la ausencia.
 */
function negocio() {
    const entidad = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': ID_NEGOCIO,
        name: 'Diabolical Services',
        alternateName: 'Diabolical',
        description:
            'Agencia de automatización con inteligencia artificial en Aguascalientes. Diseñamos e instalamos sistemas autónomos que atienden, agendan y dan seguimiento a los clientes de clínicas, spas, gimnasios, despachos y pequeñas empresas.',
        url: SITE,
        telephone: TELEFONO,
        email: EMAIL,
        priceRange: '$$',
        image: `${SITE}/og-image.png`,
        logo: `${SITE}/favicon.svg`,
        currenciesAccepted: 'MXN',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Aguascalientes',
            addressRegion: 'Aguascalientes',
            addressCountry: 'MX',
        },
        areaServed: [
            { '@type': 'City', name: 'Aguascalientes' },
            { '@type': 'State', name: 'Aguascalientes' },
            { '@type': 'Country', name: 'México' },
        ],
        serviceType: [
            'Automatización con inteligencia artificial',
            'Chatbots y agentes conversacionales',
            'Automatización de agenda y citas',
            'Seguimiento automatizado de prospectos',
            'Integración de sistemas y CRM',
        ],
        knowsAbout: [
            'Inteligencia artificial aplicada a negocios',
            'Automatización de procesos',
            'Chatbots de WhatsApp',
            'Agendamiento automático de citas',
            'Recuperación de prospectos',
            'Integración con CRM',
        ],
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Servicios de automatización con IA',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Auditoría de fricción con IA',
                        description:
                            'Diagnóstico gratuito de los procesos manuales donde el negocio pierde prospectos o tiempo, con el plan de automatización que corresponde.',
                    },
                },
                ...SECTORES.map((s) => ({
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: `Automatización para ${s.nombre}`,
                        description: s.descripcion,
                        url: `${SITE}${rutaSector(s.slug)}`,
                    },
                })),
            ],
        },
    };

    if (config.streetAddress) entidad.address.streetAddress = config.streetAddress;
    if (config.postalCode) entidad.address.postalCode = config.postalCode;

    // Las coordenadas se publican como número, no como el texto que venga de la
    // variable de entorno. Se teclean a mano una sola vez, y con notación
    // española ("21,8853") o con un grado pegado saldría un JSON-LD que valida
    // pero apunta a otro sitio. Si no son números dentro de rango se omite el
    // bloque entero: la misma regla que para el resto de la ficha, mejor sin
    // dato que con uno falso.
    const lat = Number(config.latitude);
    const lon = Number(config.longitude);
    const coordenadasValidas =
        config.latitude !== '' &&
        config.longitude !== '' &&
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lon) <= 180;

    if (coordenadasValidas) {
        entidad.geo = {
            '@type': 'GeoCoordinates',
            latitude: lat,
            longitude: lon,
        };
    }

    if (config.googleMapsUrl) entidad.hasMap = config.googleMapsUrl;

    if (config.openingHours.length > 0) {
        entidad.openingHoursSpecification = [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: config.openingHours,
                opens: config.opensAt,
                closes: config.closesAt,
            },
        ];
    }

    if (config.sameAs.length > 0) entidad.sameAs = config.sameAs;

    return entidad;
}

function sitioWeb() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': ID_WEBSITE,
        name: 'Diabolical Services',
        url: SITE,
        inLanguage: 'es-MX',
        publisher: { '@id': ID_NEGOCIO },
    };
}

function faqPage(preguntas) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: preguntas.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
        })),
    };
}

function migas(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.nombre,
            item: `${SITE}${item.ruta}`,
        })),
    };
}

/**
 * Preguntas frecuentes de la portada.
 *
 * Viven en src/data/faq.json porque el componente FAQSection las pinta y este
 * módulo las publica como FAQPage: Google exige que el contenido del schema sea
 * el mismo que ve el visitante, así que no pueden ser dos listas distintas.
 */
const FAQ_PORTADA = require('../src/data/faq.json').map(({ pregunta, respuesta }) => ({
    q: pregunta,
    a: respuesta,
}));

/**
 * Metadatos por ruta: lo que va en <title>, <meta name="description"> y
 * keywords. Sin esto todas las páginas comparten el mismo título y Google lo
 * trata como contenido duplicado.
 */
function metadatosPorRuta() {
    const meta = {
        '/politica-privacidad': {
            title: 'Política de Privacidad | Diabolical Services',
            description:
                'Cómo Diabolical Services recopila, usa y protege los datos personales de quienes visitan el sitio y solicitan una auditoría de fricción.',
            robots: 'index, follow',
        },
        '/admin': {
            title: 'Panel de administración | Diabolical Services',
            description: '',
            robots: 'noindex, nofollow',
        },
    };

    for (const sector of SECTORES) {
        meta[rutaSector(sector.slug)] = {
            title: sector.titulo,
            description: sector.descripcion,
            keywords: sector.keywords,
            robots: 'index, follow',
        };
    }

    meta[RUTA_BLOG] = {
        title: 'Blog sobre automatización con IA para negocios | Diabolical Services',
        description:
            'Artículos sobre automatización con inteligencia artificial, posicionamiento en motores generativos y atención por WhatsApp para negocios en Aguascalientes.',
        keywords:
            'blog automatización IA, GEO, aparecer en ChatGPT, automatizar WhatsApp negocio, Aguascalientes',
        robots: 'index, follow',
    };

    for (const articulo of ARTICULOS) {
        meta[rutaArticulo(articulo.slug)] = {
            title: articulo.titulo,
            description: articulo.descripcion,
            keywords: articulo.keywords,
            robots: 'index, follow',
        };
    }

    return meta;
}

/** Los bloques JSON-LD que corresponden a una ruta. */
function datosEstructurados(ruta) {
    if (ruta === '/') {
        return [negocio(), sitioWeb(), faqPage(FAQ_PORTADA)];
    }

    const sector = SECTORES.find((s) => rutaSector(s.slug) === ruta);
    if (sector) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: `Automatización con IA para ${sector.nombre}`,
                description: sector.descripcion,
                url: `${SITE}${ruta}`,
                serviceType: 'Automatización de procesos con inteligencia artificial',
                provider: { '@id': ID_NEGOCIO },
                areaServed: [
                    { '@type': 'City', name: 'Aguascalientes' },
                    { '@type': 'Country', name: 'México' },
                ],
                audience: { '@type': 'BusinessAudience', name: sector.nombre },
            },
            faqPage(sector.faq),
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: sector.nombreCorto, ruta },
            ]),
        ];
    }

    if (ruta === RUTA_BLOG) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'Blog',
                '@id': `${SITE}${RUTA_BLOG}#blog`,
                name: 'Blog de Diabolical Services',
                description:
                    'Artículos sobre automatización con inteligencia artificial, posicionamiento en motores generativos y atención por WhatsApp para negocios.',
                url: `${SITE}${RUTA_BLOG}`,
                inLanguage: 'es-MX',
                publisher: { '@id': ID_NEGOCIO },
                blogPost: ARTICULOS_POR_FECHA.map((a) => ({
                    '@type': 'BlogPosting',
                    '@id': `${SITE}${rutaArticulo(a.slug)}#articulo`,
                    headline: a.titular,
                    url: `${SITE}${rutaArticulo(a.slug)}`,
                    datePublished: a.fecha,
                })),
            },
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Blog', ruta: RUTA_BLOG },
            ]),
        ];
    }

    const articulo = ARTICULOS.find((a) => rutaArticulo(a.slug) === ruta);
    if (articulo) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                '@id': `${SITE}${ruta}#articulo`,
                headline: articulo.titular,
                description: articulo.descripcion,
                url: `${SITE}${ruta}`,
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${ruta}` },
                datePublished: articulo.fecha,
                dateModified: articulo.actualizado || articulo.fecha,
                inLanguage: 'es-MX',
                // Autor y editor son la misma entidad y se referencian por @id en
                // vez de repetirse: es lo que evita que los motores crean que hay
                // varias empresas distintas describiéndose en el mismo sitio.
                author: { '@id': ID_NEGOCIO },
                publisher: { '@id': ID_NEGOCIO },
                isPartOf: { '@id': `${SITE}${RUTA_BLOG}#blog` },
                keywords: articulo.keywords,
            },
            faqPage(articulo.faq),
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Blog', ruta: RUTA_BLOG },
                { nombre: articulo.titular, ruta },
            ]),
        ];
    }

    if (ruta === '/politica-privacidad') {
        return [
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Política de privacidad', ruta },
            ]),
        ];
    }

    return [];
}

/** Rutas indexables, para el router del servidor, el sitemap y el prerender. */
const RUTAS_PUBLICAS = [
    '/',
    ...SECTORES.map((s) => rutaSector(s.slug)),
    RUTA_BLOG,
    ...ARTICULOS_POR_FECHA.map((a) => rutaArticulo(a.slug)),
    '/politica-privacidad',
];

/**
 * Rutas que se prerenderizan a HTML. El resto reciben el shell vacío.
 *
 * El blog entra entero: es contenido de texto y su público son precisamente los
 * rastreadores que no ejecutan JavaScript. Servirlo como shell vacío haría
 * inútil el esfuerzo de escribirlo.
 */
const RUTAS_PRERENDER = [
    '/',
    ...SECTORES.map((s) => rutaSector(s.slug)),
    RUTA_BLOG,
    ...ARTICULOS_POR_FECHA.map((a) => rutaArticulo(a.slug)),
];

/**
 * Fichero del build que corresponde a una ruta. Lo comparten el prerender (que
 * los escribe) y el servidor (que los sirve), para que no se desincronicen.
 */
function archivoPrerender(ruta) {
    return ruta === '/' ? 'index.html' : `prerender${ruta}.html`;
}

module.exports = {
    SECTORES,
    ARTICULOS,
    ARTICULOS_POR_FECHA,
    RUTAS_PUBLICAS,
    RUTAS_PRERENDER,
    RUTA_BLOG,
    FAQ_PORTADA,
    rutaSector,
    rutaArticulo,
    archivoPrerender,
    metadatosPorRuta,
    datosEstructurados,
};
