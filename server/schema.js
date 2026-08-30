const SECTORES = require('../src/data/sectores.json');
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

    if (config.latitude && config.longitude) {
        entidad.geo = {
            '@type': 'GeoCoordinates',
            latitude: config.latitude,
            longitude: config.longitude,
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
const RUTAS_PUBLICAS = ['/', ...SECTORES.map((s) => rutaSector(s.slug)), '/politica-privacidad'];

/** Rutas que se prerenderizan a HTML. El resto reciben el shell vacío. */
const RUTAS_PRERENDER = ['/', ...SECTORES.map((s) => rutaSector(s.slug))];

/**
 * Fichero del build que corresponde a una ruta. Lo comparten el prerender (que
 * los escribe) y el servidor (que los sirve), para que no se desincronicen.
 */
function archivoPrerender(ruta) {
    return ruta === '/' ? 'index.html' : `prerender${ruta}.html`;
}

module.exports = {
    SECTORES,
    RUTAS_PUBLICAS,
    RUTAS_PRERENDER,
    FAQ_PORTADA,
    rutaSector,
    archivoPrerender,
    metadatosPorRuta,
    datosEstructurados,
};
