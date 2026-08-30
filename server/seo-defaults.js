const config = require('./config');

const structuredData = [
    {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'Diabolical Services',
        description:
            'Agencia de automatización con inteligencia artificial en Aguascalientes. Diseñamos e instalamos sistemas autónomos de IA que venden, responden y recuperan clientes para tu empresa.',
        url: config.siteUrl,
        telephone: '+524495136907',
        email: 'contacto@diabolicalservices.tech',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Aguascalientes',
            addressRegion: 'Aguascalientes',
            addressCountry: 'MX',
        },
        areaServed: [
            { '@type': 'City', name: 'Aguascalientes' },
            { '@type': 'Country', name: 'México' },
        ],
        serviceType: [
            'Automatización con IA',
            'Chatbots Inteligentes',
            'Ingeniería de Sistemas Autónomos',
            'Diseño Digital Élite',
        ],
        priceRange: '$$',
        image: `${config.siteUrl}/og-image.png`,
        knowsAbout: [
            'Inteligencia Artificial',
            'Automatización de Procesos',
            'Chatbots',
            'CRM Autónomo',
            'Diseño UX/UI',
        ],
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Servicios de Automatización',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Auditoría de Fricción con IA',
                        description:
                            'Diagnóstico completo de los procesos que frenan el crecimiento de tu negocio, con plan de automatización personalizado.',
                    },
                },
            ],
        },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: '¿Qué hace exactamente Diabolical?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Diseñamos e instalamos "empleados digitales" y sistemas autónomos basados en Inteligencia Artificial. No somos una agencia de marketing tradicional; creamos infraestructura técnica que automatiza tus ventas, atención al cliente y operaciones 24/7.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo sé si mi negocio está listo para la automatización con IA?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Si tu negocio ya tiene un flujo constante de clientes o prospectos (por WhatsApp, Instagram, correo o publicidad pagada) y tu equipo pasa horas respondiendo las mismas preguntas o agendando citas manualmente, estás 100% listo.',
                },
            },
            {
                '@type': 'Question',
                name: '¿La IA va a reemplazar a mi equipo humano?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. La IA se encarga de las tareas repetitivas y de bajo valor (como la primera respuesta, filtrado y agendamiento 24/7), liberando a tu equipo para que se concentre en el cierre de ventas complejas y la atención estratégica.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo es el proceso de implementación y cuánto tarda?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Nuestra integración toma entre 2 y 4 semanas. Nos encargamos de todo: desde el diseño del flujo conversacional y la conexión con tus sistemas actuales (CRM, bases de datos), hasta las pruebas y puesta en marcha.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Qué es la Auditoría de Fricción Gratuita?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Es un diagnóstico completo donde analizamos los cuellos de botella y procesos manuales en los que tu negocio está perdiendo prospectos o dinero. Te entregamos un reporte detallado con las soluciones exactas de IA que necesitas.',
                },
            },
        ],
    },
];

/**
 * Valores por defecto del SEO. Deben coincidir con los estáticos de index.html:
 * index.html es lo que ven los crawlers cuando se sirve el build sin este servidor
 * (p. ej. Firebase Hosting), y esto es lo que se inyecta cuando sí corre Express.
 *
 * GTM y Google Analytics viven estáticos en index.html, fuera de los marcadores
 * SEO_INJECT, para que carguen en cualquiera de los dos despliegues. Por eso
 * `googleTagManager` y `customHeaderScripts` van vacíos aquí: rellenarlos desde
 * /admin duplicaría las etiquetas.
 */
const defaults = {
    title: 'Diabolical | Automatización con IA para Empresas en Aguascalientes',
    description:
        'Agencia de automatización con IA en Aguascalientes. Instalamos sistemas inteligentes que venden, responden y recuperan clientes por ti. Auditoría de fricción gratuita.',
    keywords:
        'automatización IA, inteligencia artificial empresas, agencia IA Aguascalientes, chatbot IA, automatización ventas, diseño digital élite, sistemas autónomos',
    siteUrl: config.siteUrl,
    favicon: '/favicon.svg',
    ogImage: `${config.siteUrl}/og-image.png`,
    twitterHandle: '@diabolical',
    sitemapXml: '',
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /app-shell.html\n\nSitemap: ${config.siteUrl}/sitemap.xml`,
    structuredData: JSON.stringify(structuredData, null, 2),
    googleTagManager: '',
    metaPixel: '',
    customHeaderScripts: '',
};

/** Solo estas claves se aceptan al guardar; cualquier otra se descarta. */
const ALLOWED_KEYS = Object.keys(defaults);

/**
 * Metadatos propios por ruta. Sin esto todas las páginas comparten el mismo
 * título y descripción, que Google trata como contenido duplicado.
 */
const ROUTE_META = {
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

module.exports = { defaults, ALLOWED_KEYS, ROUTE_META };
