const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('--- DIABOLICAL SEO_MONSTER BOOT SEQUENCE ---');
console.log('Entorno:', process.env.NODE_ENV);
console.log('Puerto asignado:', PORT);

// Rutas críticas
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');
const settingsFile = path.join(dataDir, 'settings.json');

// Asegurar persistencia
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Helper para obtener configuración con valores por defecto
const getSettings = () => {
    const defaults = {
        title: "DIABOLICAL | Elite AI Automation & Design",
        description: "Exponential scaling through autonomous AI systems and high-end digital engineering.",
        keywords: "AI Automation, Elite Design, Business Intelligence, Digital Engineering",
        siteUrl: "https://diabolicalservices.tech",
        favicon: "/favicon.ico",
        ogImage: "/og-image.jpg",
        twitterHandle: "@diabolical",
        sitemapXml: "",
        robotsTxt: "User-agent: *\nAllow: /",
        structuredData: "{}",
        googleTagManager: "",
        metaPixel: "",
        customHeaderScripts: ""
    };

    if (fs.existsSync(settingsFile)) {
        try {
            return { ...defaults, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) };
        } catch (e) {
            console.error("Error leyendo settings.json:", e);
            return defaults;
        }
    }
    return defaults;
};

// API
app.get('/api/settings', (req, res) => {
    res.json(getSettings());
});

app.post('/api/settings', (req, res) => {
    fs.writeFileSync(settingsFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// Servir Robots.txt y Sitemap.xml dinámicamente
app.get('/robots.txt', (req, res) => {
    const s = getSettings();
    res.type('text/plain').send(s.robotsTxt);
});

app.get('/sitemap.xml', (req, res) => {
    const s = getSettings();
    if (s.sitemapXml) {
        res.type('application/xml').send(s.sitemapXml);
    } else {
        // Sitemap básico por defecto si no hay uno configurado
        const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${s.siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        res.type('application/xml').send(basicSitemap);
    }
});

// Servir archivos estáticos
app.use(express.static(distPath));

// Fallback para React Router con INYECCIÓN DINÁMICA DE SEO
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');

    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        const s = getSettings();

        // Inyección de Meta Tags & SEO
        const seoInject = `
    <title>${s.title}</title>
    <meta name="description" content="${s.description}">
    <meta name="keywords" content="${s.keywords}">
    <link rel="canonical" href="${s.siteUrl}${req.path}">
    <link rel="icon" href="${s.favicon}" type="image/x-icon">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${s.siteUrl}${req.path}">
    <meta property="og:title" content="${s.title}">
    <meta property="og:description" content="${s.description}">
    <meta property="og:image" content="${s.ogImage}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${s.siteUrl}${req.path}">
    <meta property="twitter:title" content="${s.title}">
    <meta property="twitter:description" content="${s.description}">
    <meta property="twitter:image" content="${s.ogImage}">
    <meta name="twitter:site" content="${s.twitterHandle}">

    <!-- Google Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    ${s.structuredData || '{}'}
    </script>
    
    <!-- Tracking Pixels -->
    ${s.googleTagManager ? `
    <!-- GTM -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${s.googleTagManager}');</script>
    ` : ''}

    ${s.metaPixel ? `
    <!-- Meta Pixel -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${s.metaPixel}');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${s.metaPixel}&ev=PageView&noscript=1"
    /></noscript>
    ` : ''}

    <!-- Custom User Scripts -->
    ${s.customHeaderScripts}
        `;

        // Reemplazar o Inyectar en el <head>
        if (html.includes('<!-- SEO_INJECT_START -->')) {
            html = html.replace(/<!-- SEO_INJECT_START -->[\s\S]*<!-- SEO_INJECT_END -->/, seoInject);
        } else {
            html = html.replace('</head>', `${seoInject}\n</head>`);
        }

        res.send(html);
    } else {
        res.status(404).send('Build folder "dist" is missing index.html');
    }
});

// ESCUCHA EN 0.0.0.0 PARA DOCKER
app.listen(PORT, '0.0.0.0', () => {
    console.log('-------------------------------------------');
    console.log(`🚀 MONSTER_SEO SERVER LIVE ON 0.0.0.0:${PORT}`);
    console.log('-------------------------------------------');
});
