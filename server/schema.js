const SECTORES = require('../src/data/sectores.json');
const ARTICULOS = require('../src/data/articulos.json');
const SERVICIOS = require('../src/data/servicios.json');
const config = require('./config');
const { leerContenido } = require('./contenido');

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

/*
 * El sitio pasa de una landing a varias paginas. Las rutas de sector cambian de
 * /automatizacion-para-X a /sectores/X porque la frase clave del negocio pasa a
 * ser "inteligencia artificial para X" y la URL tiene que acompanarla.
 *
 * Las viejas NO se borran: se redirigen con 301 desde server.js (ver
 * REDIRECCIONES). Una URL indexada que devuelve 404 tira a la basura todo lo
 * que esa pagina hubiera ganado.
 */
const rutaSector = (slug) => `/sectores/${slug}`;
/*
 * Un servicio puede tener su página fuera de /servicios cuando compite por una
 * búsqueda con nombre propio. Es el caso del diseño web: su página es
 * /paginas-web-aguascalientes (campo `ruta` en servicios.json), y la antigua
 * /servicios/sitio-web redirige ahí. Dos URL persiguiendo la misma búsqueda se
 * quitan la posición la una a la otra.
 */
const rutaServicio = (slug) =>
    SERVICIOS.find((s) => s.slug === slug)?.ruta ?? `/servicios/${slug}`;
const rutaArticulo = (slug) => `/blog/${slug}`;

/** Índice del blog. Existe como constante porque la referencian las migas,
 *  los metadatos, el JSON-LD y el sitemap, y un literal repetido cinco veces
 *  es justo el tipo de dato que se desincroniza al renombrar. */
const RUTA_BLOG = '/blog';
const RUTA_SERVICIOS = '/servicios';
const RUTA_SECTORES = '/sectores';
const RUTA_NOSOTROS = '/nosotros';
const RUTA_CONTACTO = '/contacto';
const RUTA_PAGINAS_WEB = rutaServicio('sitio-web');

/*
 * Direcciones antiguas que ya estaban indexadas, con su destino actual.
 *
 * Escritas a mano y no derivadas de SECTORES a proposito: la lista tiene que
 * reflejar lo que Google ya tiene indexado, no lo que existe hoy. El caso que
 * lo demuestra es /automatizacion-para-spas, cuyo slug ya no existe —el sector
 * pasó a llamarse salones-de-belleza— y que aun asi debe llevar a algun sitio
 * util en lugar de a un 404.
 */
const REDIRECCIONES = {
    '/automatizacion-para-clinicas': rutaSector('clinicas'),
    '/automatizacion-para-spas': rutaSector('salones-de-belleza'),
    '/automatizacion-para-gimnasios': rutaSector('gimnasios'),
    '/automatizacion-para-despachos-y-oficinas': rutaSector('despachos-y-oficinas'),
    '/servicios/sitio-web': RUTA_PAGINAS_WEB,
};

/** Los más recientes primero, igual que en el cliente. */
const ARTICULOS_POR_FECHA = [...ARTICULOS].sort((a, b) => b.fecha.localeCompare(a.fecha));

/**
 * Descripción de un servicio para los datos estructurados: el resumen MÁS su
 * límite.
 *
 * El límite (qué NO hace el servicio y dónde se detiene) estaba en el texto
 * visible y en los llms.txt, pero no aquí: el bloque Service publicaba solo el
 * resumen. Es la parte más original del catálogo y quedaba invisible justo en
 * la capa que los buscadores y los motores generativos leen con más fiabilidad,
 * que además es la que permite a un modelo recomendar con criterio en vez de
 * inventarse el alcance.
 *
 * Los dos textos ya están a la vista en /servicios, así que juntarlos no rompe
 * la regla de que el schema diga lo mismo que ve el visitante.
 */
function descripcionServicio(servicio) {
    return servicio.limite ? `${servicio.resumen} Límite: ${servicio.limite}` : servicio.resumen;
}

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
            'Agencia de diseño y desarrollo de páginas web e inteligencia artificial en Aguascalientes. Landing pages, sitios corporativos, tiendas en línea y sitios a medida, posicionamiento en Google y en motores de IA, publicidad, identidad de marca y sistemas que atienden, agendan y dan seguimiento sobre las herramientas que la empresa ya utiliza. Para inmobiliarias, salones de belleza, clínicas, gimnasios, despachos y comercio.',
        slogan: 'Páginas web e inteligencia artificial para negocios en Aguascalientes.',
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
        serviceType: [...new Set(SERVICIOS.map((s) => s.nombre))],
        // Las páginas web van primero: son la mitad del oficio y la entidad
        // tiene que decirlo igual que lo dice la portada.
        knowsAbout: [
            'Diseño de páginas web',
            'Diseño y desarrollo de páginas web',
            'Landing pages',
            'Tiendas en línea',
            'Inteligencia artificial aplicada a negocios',
            'Posicionamiento en buscadores y en motores generativos',
            'Marketing digital para negocios locales',
            'Publicidad en Google',
            'Identidad de marca',
            'Automatización de procesos',
            'Chatbots de WhatsApp',
            'Agendamiento automático de citas',
            'Integración con CRM',
        ],
        // El catálogo sale entero de servicios.json: si se añade un servicio
        // allí, aparece aquí, en /servicios y en los llms.txt sin tocar nada.
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Páginas web e inteligencia artificial para negocios en Aguascalientes',
            itemListElement: [
                ...SERVICIOS.map((s) => ({
                    '@type': 'Offer',
                    category: s.categoria,
                    itemOffered: {
                        '@type': 'Service',
                        name: s.nombre,
                        description: descripcionServicio(s),
                        url: `${SITE}${rutaServicio(s.slug)}`,
                    },
                })),
                ...SECTORES.map((s) => ({
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: s.titular,
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

    meta[RUTA_SERVICIOS] = {
        title: 'Servicios de páginas web e IA en Aguascalientes | Diabolical',
        description:
            'Trece servicios para negocios en Aguascalientes: páginas web, posicionamiento, Google Ads, marca y atención con IA. Cada uno con su alcance publicado.',
        keywords:
            'servicios de páginas web Aguascalientes, agencia de páginas web Aguascalientes, inteligencia artificial para negocios en Aguascalientes, agencia de IA Aguascalientes, posicionamiento web Aguascalientes',
        robots: 'index, follow',
    };

    for (const servicio of SERVICIOS) {
        meta[rutaServicio(servicio.slug)] = {
            title: `${servicio.nombre} en Aguascalientes | Diabolical`,
            description: servicio.resumen,
            keywords: `${servicio.nombre.toLowerCase()} Aguascalientes, inteligencia artificial para negocios en Aguascalientes, ${servicio.categoria.toLowerCase()}`,
            robots: 'index, follow',
        };
    }

    /*
     * La landing de páginas web no hereda el título genérico de servicio: tiene
     * su propia búsqueda. Las tres frases clave se reparten en vez de repetirse:
     *
     *   URL     páginas web Aguascalientes
     *   title   diseño de páginas web en Aguascalientes
     *   h1      diseño y desarrollo de páginas web en Aguascalientes
     */
    meta[RUTA_PAGINAS_WEB] = {
        title: 'Diseño de páginas web en Aguascalientes | Diabolical',
        description:
            'Diseño y desarrollo de páginas web en Aguascalientes: landing pages, sitios corporativos, tiendas en línea y sitios a medida, legibles para Google y la IA.',
        keywords:
            'diseño de páginas web, diseño y desarrollo de páginas web en Aguascalientes, páginas web Aguascalientes, diseño web Aguascalientes, desarrollo web Aguascalientes, tiendas en línea Aguascalientes, landing page Aguascalientes',
        robots: 'index, follow',
    };

    meta[RUTA_SECTORES] = {
        title: 'Inteligencia artificial por sector en Aguascalientes | Diabolical',
        description:
            'Inteligencia artificial para inmobiliarias, salones de belleza, clínicas, gimnasios, despachos y comercio en Aguascalientes. Cada giro con su propio sistema.',
        keywords:
            'inteligencia artificial para negocios en Aguascalientes, IA por sector, automatización por giro, agencia de IA Aguascalientes',
        robots: 'index, follow',
    };

    meta[RUTA_NOSOTROS] = {
        title: 'Quiénes somos | Agencia de páginas web e IA en Aguascalientes',
        description:
            'Agencia de páginas web e inteligencia artificial en Aguascalientes: sitios a medida y sistemas que atienden, agendan y dan seguimiento a sus clientes.',
        keywords:
            'agencia de páginas web Aguascalientes, empresa de diseño web Aguascalientes, agencia de inteligencia artificial Aguascalientes, quiénes somos Diabolical Services',
        robots: 'index, follow',
    };

    meta[RUTA_CONTACTO] = {
        title: 'Contacto | Páginas web e inteligencia artificial en Aguascalientes',
        description:
            'Solicite la auditoría gratuita o una propuesta de página web. Salimos de ella con un diagnóstico escrito de lo que conviene hacer en su negocio y lo que no.',
        keywords:
            'contacto agencia de IA Aguascalientes, auditoría de fricción gratuita, inteligencia artificial para negocios en Aguascalientes',
        robots: 'index, follow',
    };

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

/**
 * Ficha del negocio sin el catálogo, para las páginas que no son la portada.
 *
 * Las subpáginas apuntan al proveedor con {'@id': ID_NEGOCIO}, y ese
 * identificador solo estaba definido en la portada. Un motor generativo que
 * rastrea /automatizacion-para-clinicas y nada más se encontraba un proveedor
 * sin nombre, sin teléfono y sin ciudad: una referencia colgando. Esto la
 * resuelve en la propia página.
 *
 * Se quitan el catálogo de ofertas, serviceType y knowsAbout porque son ~4 kB
 * que ya están en la portada y en /servicios, y repetirlos en cada página no
 * añade información nueva sobre quién es el proveedor.
 */
function negocioCompacto() {
    // eslint-disable-next-line no-unused-vars
    const { hasOfferCatalog, serviceType, knowsAbout, ...ficha } = negocio();
    return ficha;
}

/**
 * Preguntas que la landing de páginas web publica como FAQPage.
 *
 * Salen del contenido editable (bloque paginasWeb) y no de un fichero aparte:
 * Google exige que lo marcado sea lo que ve el visitante, y si el equipo edita
 * una respuesta en el panel, el marcado tiene que cambiar con ella. La pregunta
 * del precio tiene sección propia en la página y entra aquí con su respuesta
 * completa, factores incluidos.
 */
function preguntasPaginasWeb(bloque) {
    const preguntas = [];
    const precio = bloque.precio;
    if (precio?.titulo && precio?.respuesta) {
        const factores = (precio.factores ?? []).filter(Boolean);
        preguntas.push({
            q: precio.titulo,
            a: [precio.respuesta, ...factores].join(' '),
        });
    }
    for (const item of bloque.faq?.items ?? []) {
        if (item?.pregunta && item?.respuesta) preguntas.push({ q: item.pregunta, a: item.respuesta });
    }
    return preguntas;
}

/**
 * JSON-LD de /paginas-web-aguascalientes.
 *
 * Un Service con los cuatro tipos de sitio como catálogo, sin precio: el precio
 * no se publica, y un Offer con un precio inventado sería peor que ninguno.
 */
function bloquesPaginasWeb() {
    const servicio = SERVICIOS.find((x) => rutaServicio(x.slug) === RUTA_PAGINAS_WEB);
    const bloque = leerContenido().valor.paginasWeb ?? {};
    const url = `${SITE}${RUTA_PAGINAS_WEB}`;
    const tipos = (bloque.tipos?.items ?? []).filter((t) => t?.nombre);
    const preguntas = preguntasPaginasWeb(bloque);

    const bloques = [
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${url}#servicio`,
            name: 'Diseño y desarrollo de páginas web en Aguascalientes',
            alternateName: ['Diseño de páginas web', 'Páginas web Aguascalientes'],
            description: bloque.definicion?.texto || servicio.resumen,
            url,
            serviceType: 'Diseño y desarrollo de páginas web',
            category: servicio.categoria,
            provider: { '@id': ID_NEGOCIO },
            areaServed: [
                { '@type': 'City', name: 'Aguascalientes' },
                { '@type': 'State', name: 'Aguascalientes' },
                { '@type': 'Country', name: 'México' },
            ],
            termsOfService: servicio.limite,
            ...(tipos.length > 0 && {
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Tipos de página web',
                    itemListElement: tipos.map((t) => ({
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: t.nombre,
                            description: t.noIncluye ? `${t.paraQuien} No incluye: ${t.noIncluye}` : t.paraQuien,
                        },
                    })),
                },
            }),
        },
    ];

    if (preguntas.length > 0) bloques.push(faqPage(preguntas));

    bloques.push(
        migas([
            { nombre: 'Inicio', ruta: '/' },
            { nombre: 'Servicios', ruta: RUTA_SERVICIOS },
            { nombre: servicio.nombre, ruta: RUTA_PAGINAS_WEB },
        ])
    );

    return bloques;
}

/** Los bloques JSON-LD que corresponden a una ruta. */
function bloquesDeRuta(ruta) {
    if (ruta === RUTA_PAGINAS_WEB) return bloquesPaginasWeb();

    /*
     * Página de un servicio.
     *
     * Cada una declara su Service enlazado al proveedor por @id y sus migas.
     * Sin las migas, un resultado de búsqueda de una página profunda aparece
     * suelto, sin decir de qué sección del sitio viene.
     */
    const servicio = SERVICIOS.find((x) => rutaServicio(x.slug) === ruta);
    if (servicio) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: servicio.nombre,
                description: servicio.resumen,
                url: `${SITE}${ruta}`,
                serviceType: servicio.categoria,
                provider: { '@id': ID_NEGOCIO },
                areaServed: [
                    { '@type': 'City', name: 'Aguascalientes' },
                    { '@type': 'Country', name: 'México' },
                ],
                // El alcance publicado entra en el marcado, no solo en la
                // página: es lo que permite a un motor generativo recomendar
                // con criterio en lugar de por parecido.
                termsOfService: servicio.limite,
            },
            negocioCompacto(),
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Servicios', ruta: RUTA_SERVICIOS },
                { nombre: servicio.nombre, ruta },
            ]),
        ];
    }

    if (ruta === RUTA_SECTORES) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: 'Inteligencia artificial por sector',
                url: `${SITE}${RUTA_SECTORES}`,
                inLanguage: 'es-MX',
                about: { '@id': ID_NEGOCIO },
                mainEntity: {
                    '@type': 'ItemList',
                    itemListElement: SECTORES.map((x, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        name: x.titular,
                        url: `${SITE}${rutaSector(x.slug)}`,
                    })),
                },
            },
            negocioCompacto(),
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Sectores', ruta: RUTA_SECTORES },
            ]),
        ];
    }

    if (ruta === RUTA_NOSOTROS) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'AboutPage',
                name: 'Quiénes somos',
                url: `${SITE}${RUTA_NOSOTROS}`,
                inLanguage: 'es-MX',
                mainEntity: { '@id': ID_NEGOCIO },
            },
            negocioCompacto(),
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Quiénes somos', ruta: RUTA_NOSOTROS },
            ]),
        ];
    }

    if (ruta === RUTA_CONTACTO) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'ContactPage',
                name: 'Contacto',
                url: `${SITE}${RUTA_CONTACTO}`,
                inLanguage: 'es-MX',
                mainEntity: { '@id': ID_NEGOCIO },
            },
            negocioCompacto(),
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Contacto', ruta: RUTA_CONTACTO },
            ]),
        ];
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
                { nombre: 'Sectores', ruta: RUTA_SECTORES },
                { nombre: sector.nombreCorto, ruta },
            ]),
        ];
    }

    if (ruta === RUTA_SERVICIOS) {
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: 'Servicios de Diabolical Services',
                url: `${SITE}${RUTA_SERVICIOS}`,
                inLanguage: 'es-MX',
                about: { '@id': ID_NEGOCIO },
                mainEntity: {
                    '@type': 'ItemList',
                    itemListElement: SERVICIOS.map((s, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        item: {
                            '@type': 'Service',
                            name: s.nombre,
                            description: descripcionServicio(s),
                            category: s.categoria,
                            url: `${SITE}${rutaServicio(s.slug)}`,
                            provider: { '@id': ID_NEGOCIO },
                        },
                    })),
                },
            },
            migas([
                { nombre: 'Inicio', ruta: '/' },
                { nombre: 'Servicios', ruta: RUTA_SERVICIOS },
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
                // Google no da resultado enriquecido de artículo sin imagen, y
                // los motores generativos la usan en la tarjeta de la cita.
                // Mientras no haya una por artículo se usa la del sitio, que es
                // real y está publicada; dejarlo vacío descarta la página.
                image: articulo.imagen ? `${SITE}${articulo.imagen}` : `${SITE}/og-image.png`,
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

/**
 * Los bloques JSON-LD de una ruta, con la ficha del negocio delante.
 *
 * La portada lleva la ficha completa; el resto una compacta. Así cualquier
 * página, leída sola, dice quién la publica.
 */
function datosEstructurados(ruta) {
    if (ruta === '/') {
        return [negocio(), sitioWeb(), faqPage(FAQ_PORTADA)];
    }

    const bloques = bloquesDeRuta(ruta);
    return bloques.length > 0 ? [negocioCompacto(), ...bloques] : [];
}

/**
 * Fechas de un artículo del blog, o null si la ruta no es un artículo.
 * Lo consume render.js para poner og:type=article y sus fechas: hasta ahora
 * cada entrada del blog se anunciaba a las redes y a los motores como si fuera
 * la portada de un sitio.
 */
function articuloDeRuta(ruta) {
    const articulo = ARTICULOS.find((a) => rutaArticulo(a.slug) === ruta);
    if (!articulo) return null;
    return { publicado: articulo.fecha, modificado: articulo.actualizado || articulo.fecha };
}

/** Rutas indexables, para el router del servidor, el sitemap y el prerender. */
const RUTAS_PUBLICAS = [
    '/',
    RUTA_NOSOTROS,
    RUTA_SERVICIOS,
    ...SERVICIOS.map((s) => rutaServicio(s.slug)),
    RUTA_SECTORES,
    ...SECTORES.map((s) => rutaSector(s.slug)),
    RUTA_CONTACTO,
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
 *
 * La política de privacidad también, y se había quedado fuera: está en
 * RUTAS_PUBLICAS, o sea que entra en el sitemap y se sirve con `index, follow`,
 * pero al no prerenderizarse devolvía el shell vacío. Google pedía la página,
 * la leía sin una sola palabra y la descartaba. Toda ruta pública tiene que
 * estar aquí; si alguna vez hay una que no deba prerenderizarse, lo que sobra
 * es su presencia en el sitemap, no su contenido.
 */
const RUTAS_PRERENDER = [
    '/',
    RUTA_NOSOTROS,
    RUTA_SERVICIOS,
    ...SERVICIOS.map((s) => rutaServicio(s.slug)),
    RUTA_SECTORES,
    ...SECTORES.map((s) => rutaSector(s.slug)),
    RUTA_CONTACTO,
    RUTA_BLOG,
    ...ARTICULOS_POR_FECHA.map((a) => rutaArticulo(a.slug)),
    '/politica-privacidad',
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
    RUTA_SERVICIOS,
    RUTA_SECTORES,
    RUTA_NOSOTROS,
    RUTA_CONTACTO,
    RUTA_PAGINAS_WEB,
    REDIRECCIONES,
    SERVICIOS,
    FAQ_PORTADA,
    preguntasPaginasWeb,
    rutaSector,
    rutaServicio,
    rutaArticulo,
    archivoPrerender,
    metadatosPorRuta,
    datosEstructurados,
    articuloDeRuta,
};
