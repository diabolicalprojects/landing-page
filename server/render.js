const { escapeHtml, serializeJsonLd, sanitizeTrackingId } = require('./html');
const { ROUTE_META } = require('./seo-defaults');

const MARKER_START = '<!-- SEO_INJECT_START -->';
const MARKER_END = '<!-- SEO_INJECT_END -->';

/**
 * Construye el bloque <head> con los valores guardados desde /admin, más los
 * metadatos propios de la ruta. Todo lo que viene de settings se escapa: son
 * datos, no markup.
 */
function buildSeoBlock(settings, requestPath, { indexable = true } = {}) {
    const meta = { robots: 'index, follow', ...settings, ...(ROUTE_META[requestPath] || {}) };

    const canonical = escapeHtml(`${settings.siteUrl}${requestPath}`);
    const title = escapeHtml(meta.title);
    const description = escapeHtml(meta.description);
    const ogImage = escapeHtml(settings.ogImage);
    const robots = indexable ? escapeHtml(meta.robots) : 'noindex, nofollow';
    const gtmId = sanitizeTrackingId(settings.googleTagManager);
    const pixelId = sanitizeTrackingId(settings.metaPixel);

    return `${MARKER_START}
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${escapeHtml(settings.keywords)}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="${escapeHtml(settings.favicon)}">

    <meta property="og:type" content="website">
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

    <script type="application/ld+json">${serializeJsonLd(settings.structuredData)}</script>
${gtmId ? gtmSnippet(gtmId) : ''}${pixelId ? pixelSnippet(pixelId) : ''}${settings.customHeaderScripts || ''}
    ${MARKER_END}`;
}

function gtmSnippet(id) {
    return `    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${id}');</script>\n`;
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
 * fallar en silencio como hacía el `replace('</head>')` anterior.
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

module.exports = { injectSeo, MARKER_START, MARKER_END };
