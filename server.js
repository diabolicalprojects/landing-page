const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Helper para obtener configuración con valores por defecto
const getSettings = () => {
    const defaults = {
        title: "Diabolical | Automatización con IA para Empresas en Aguascalientes",
        description: "Agencia de automatización con IA en Aguascalientes. Instalamos sistemas inteligentes que venden, responden y recuperan clientes por ti. Auditoría de fricción gratuita.",
        keywords: "automatización IA, inteligencia artificial empresas, agencia IA Aguascalientes, chatbot IA, automatización ventas, diseño digital élite, sistemas autónomos",
        siteUrl: "https://diabolicalservices.tech",
        favicon: "/src/assets/logo/LOGO-DIABOLICAL-CUADRADO-NEGRO.svg",
        ogImage: "/og-image.png",
        twitterHandle: "@diabolical",
        sitemapXml: "",
        robotsTxt: "User-agent: *\nAllow: /\nSitemap: https://diabolicalservices.tech/sitemap.xml",
        structuredData: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Diabolical Services",
            "description": "Agencia de automatización con inteligencia artificial en Aguascalientes. Diseñamos e instalamos sistemas autónomos de IA que venden, responden y recuperan clientes para tu empresa.",
            "url": "https://diabolicalservices.tech",
            "telephone": "+524495136907",
            "email": "contacto@diabolicalservices.tech",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Aguascalientes",
              "addressRegion": "Aguascalientes",
              "addressCountry": "MX"
            },
            "areaServed": [
              {
                "@type": "City",
                "name": "Aguascalientes"
              },
              {
                "@type": "Country",
                "name": "México"
              }
            ],
            "serviceType": ["Automatización con IA", "Chatbots Inteligentes", "Ingeniería de Sistemas Autónomos", "Diseño Digital Élite"],
            "priceRange": "$$",
            "image": "https://diabolicalservices.tech/og-image.png",
            "knowsAbout": ["Inteligencia Artificial", "Automatización de Procesos", "Chatbots", "CRM Autónomo", "Diseño UX/UI"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Servicios de Automatización",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Auditoría de Fricción con IA",
                    "description": "Diagnóstico completo de los procesos que frenan el crecimiento de tu negocio, con plan de automatización personalizado."
                  }
                }
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "¿Qué hace exactamente Diabolical?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Diseñamos e instalamos \"empleados digitales\" y sistemas autónomos basados en Inteligencia Artificial. No somos una agencia de marketing tradicional; creamos infraestructura técnica que automatiza tus ventas, atención al cliente y operaciones 24/7."
              }
            }, {
              "@type": "Question",
              "name": "¿Cómo sé si mi negocio está listo para la automatización con IA?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Si tu negocio ya tiene un flujo constante de clientes o prospectos (por WhatsApp, Instagram, correo o publicidad pagada) y tu equipo pasa horas respondiendo las mismas preguntas o agendando citas manualmente, estás 100% listo."
              }
            }, {
              "@type": "Question",
              "name": "¿La IA va a reemplazar a mi equipo humano?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. La IA se encarga de las tareas repetitivas y de bajo valor (como la primera respuesta, filtrado y agendamiento 24/7), liberando a tu equipo para que se concentre en el cierre de ventas complejas y la atención estratégica."
              }
            }, {
              "@type": "Question",
              "name": "¿Cómo es el proceso de implementación y cuánto tarda?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nuestra integración toma entre 2 y 4 semanas. Nos encargamos de todo: desde el diseño del flujo conversacional y la conexión con tus sistemas actuales (CRM, bases de datos), hasta las pruebas y puesta en marcha."
              }
            }, {
              "@type": "Question",
              "name": "¿Qué es la Auditoría de Fricción Gratuita?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Es un diagnóstico completo donde analizamos los cuellos de botella y procesos manuales en los que tu negocio está perdiendo prospectos o dinero. Te entregamos un reporte detallado con las soluciones exactas de IA que necesitas."
              }
            }]
          }
        ], null, 2),
        googleTagManager: "",
        metaPixel: "",
        customHeaderScripts: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-7C6BCDND8S"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-7C6BCDND8S');
</script>`
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
        // Sitemap básico por defecto sin tags obsoletos (changefreq y priority)
        const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${s.siteUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
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
