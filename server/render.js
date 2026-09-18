const { escapeHtml, serializeJsonLd, sanitizeTrackingId } = require('./html');
const { metadatosPorRuta, datosEstructurados, articuloDeRuta } = require('./schema');

const MARKER_START = '<!-- SEO_INJECT_START -->';
const MARKER_END = '<!-- SEO_INJECT_END -->';

const RUTA_META = metadatosPorRuta();

/**
 * Construye el bloque <head> de una ruta: metadatos editables desde /admin,
 * más los propios de la ruta y su JSON-LD.
 *
 * Todo lo que viene de settings se escapa: son datos, no markup.
 */
function buildSeoBlock(settings, requestPath, { indexable = true } = {}) {
    const propios = RUTA_META[requestPath] || {};
    const meta = { robots: 'index, follow', ...settings, ...propios };

    const canonical = escapeHtml(`${settings.siteUrl}${requestPath}`);
    const title = escapeHtml(meta.title);
    const description = escapeHtml(meta.description);
    const ogImage = escapeHtml(settings.ogImage);
    const robots = indexable ? escapeHtml(meta.robots) : 'noindex, nofollow';
    const gtmId = sanitizeTrackingId(settings.googleTagManager);
    const pixelId = sanitizeTrackingId(settings.metaPixel);

    // Una entrada del blog anunciada como og:type=website pierde la tarjeta de
    // artículo en las redes y no le dice a ningún motor cuándo se publicó.
    const articulo = articuloDeRuta(requestPath);

    const bloques = datosEstructurados(requestPath)
        .map((dato) => `    <script type="application/ld+json">${serializeJsonLd(dato)}</script>`)
        .join('\n');

    // Bloque adicional opcional que se puede cargar desde /admin.
    const extra = settings.structuredData
        ? `\n    <script type="application/ld+json">${serializeJsonLd(settings.structuredData)}</script>`
        : '';

    return `${MARKER_START}
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${escapeHtml(meta.keywords || settings.keywords)}">
    <meta name="robots" content="${robots}">
    <meta name="author" content="Diabolical Services">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="${escapeHtml(settings.favicon)}">

    <meta name="geo.region" content="MX-AGU">
    <meta name="geo.placename" content="Aguascalientes">

    <meta property="og:type" content="${articulo ? 'article' : 'website'}">${
        articulo
            ? `
    <meta property="article:published_time" content="${escapeHtml(articulo.publicado)}">
    <meta property="article:modified_time" content="${escapeHtml(articulo.modificado)}">`
            : ''
    }
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:locale" content="es_MX">
    <meta property="og:site_name" content="Diabolical Services">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonical}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImage}">
    <meta name="twitter:site" content="${escapeHtml(settings.twitterHandle)}">

${bloques}${extra}
${gtmId ? gtmSnippet(gtmId) : ''}${pixelId ? pixelSnippet(pixelId) : ''}${settings.customHeaderScripts || ''}
    ${MARKER_END}`;
}

/*
 * Contenedor adicional de Tag Manager, configurable desde /admin.
 *
 * Difiere la descarga igual que el contenedor principal de index.html: el
 * `dataLayer` se crea al instante —así nada que se empuje antes se pierde— y el
 * script del contenedor solo se pide a lo primero que ocurra de load, primera
 * interacción, o 3,5 s de respaldo. Un contenedor de Tag Manager son más de
 * 100 KiB, y ninguna etiqueta necesita ejecutarse antes de que la página se
 * vea.
 */
function gtmSnippet(id) {
    return `    <script>(function(w,d,ID){w.dataLayer=w.dataLayer||[];
    w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var l=false,E=['pointerdown','keydown','touchstart','scroll'];
    function c(){if(l)return;l=true;E.forEach(function(e){w.removeEventListener(e,c,true)});
    var s=d.createElement('script');s.async=true;
    s.src='https://www.googletagmanager.com/gtm.js?id='+ID;d.head.appendChild(s)}
    E.forEach(function(e){w.addEventListener(e,c,{capture:true,once:true,passive:true})});
    w.setTimeout(c,3500);
    if(d.readyState==='complete')c();else w.addEventListener('load',c,{once:true});
    })(window,document,'${id}');</script>\n`;
}

function pixelSnippet(id) {
    return `    <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${id}'); fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none" alt=""
    src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"></noscript>\n`;
}

/**
 * Sustituye el bloque marcado dentro del index.html construido. Si los
 * marcadores no están, se avisa y se devuelve el HTML intacto en lugar de
 * fallar en silencio.
 */
function injectSeo(html, settings, requestPath, options) {
    const start = html.indexOf(MARKER_START);
    const end = html.indexOf(MARKER_END);

    if (start === -1 || end === -1 || end < start) {
        console.warn(
            '[render] index.html no contiene los marcadores SEO_INJECT. Se sirve el HTML estático sin inyección.'
        );
        return html;
    }

    return (
        html.slice(0, start) +
        buildSeoBlock(settings, requestPath, options) +
        html.slice(end + MARKER_END.length)
    );
}

module.exports = { injectSeo, buildSeoBlock, MARKER_START, MARKER_END };
