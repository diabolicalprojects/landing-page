/**
 * Prerenderiza a HTML estático todas las rutas de contenido tras el build.
 *
 * Los crawlers que no ejecutan JavaScript (buscadores secundarios,
 * previsualizadores de enlaces, rastreadores de LLMs) recibían un
 * <div id="root"> vacío. Con esto reciben la página entera, con su <head>
 * completo y su JSON-LD.
 *
 * Produce:
 *   dist/index.html                  portada
 *   dist/prerender/<ruta>.html       una por cada página de sector
 *   dist/app-shell.html              shell vacío para el resto de rutas
 *
 * El <head> se inyecta con el mismo código que usa el servidor
 * (server/render.js), de modo que el HTML estático y el servido por Express
 * nunca difieren.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import zlib from 'node:zlib';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const indexFile = path.join(distDir, 'index.html');
const shellFile = path.join(distDir, 'app-shell.html');

const require = createRequire(import.meta.url);
const { RUTAS_PRERENDER, RUTAS_PUBLICAS, archivoPrerender } = require('../server/schema.js');
const { buildSeoBlock, MARKER_START, MARKER_END } = require('../server/render.js');
const { defaults } = require('../server/seo-defaults.js');
const { construirRobots } = require('../server/robots.js');
const { construirLlms, construirLlmsFull } = require('../server/llms.js');

const ROOT_TAG = '<div id="root"></div>';

const shell = fs.readFileSync(indexFile, 'utf8');

if (!shell.includes(ROOT_TAG)) {
    throw new Error(`No se encontró ${ROOT_TAG} en dist/index.html; el prerender no puede continuar.`);
}
if (!shell.includes(MARKER_START) || !shell.includes(MARKER_END)) {
    throw new Error('dist/index.html no tiene los marcadores SEO_INJECT; el prerender no puede continuar.');
}

// El shell se guarda antes de tocar nada: es el index.html tal cual lo dejó Vite.
fs.writeFileSync(shellFile, shell);

const { render } = await import(pathToFileURL(path.join(rootDir, '.ssr', 'entry-server.mjs')).href);

function inyectarCabecera(html, ruta) {
    const inicio = html.indexOf(MARKER_START);
    const fin = html.indexOf(MARKER_END);
    return (
        html.slice(0, inicio) +
        buildSeoBlock(defaults, ruta) +
        html.slice(fin + MARKER_END.length)
    );
}

let total = 0;

for (const ruta of RUTAS_PRERENDER) {
    const markup = render(ruta);

    if (!markup || markup.length < 500) {
        throw new Error(
            `El prerender de ${ruta} devolvió ${markup?.length ?? 0} caracteres; se esperaba la página completa.`
        );
    }

    const html = inyectarCabecera(shell, ruta).replace(ROOT_TAG, `<div id="root">${markup}</div>`);

    const destino = path.join(distDir, archivoPrerender(ruta));
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);

    console.log(`[prerender] ${ruta.padEnd(38)} ${(markup.length / 1024).toFixed(1)} kB`);
    total += 1;
}

console.log(`[prerender] ${total} rutas prerenderizadas.`);
console.log('[prerender] Shell para el resto de rutas en dist/app-shell.html.');

// robots.txt, sitemap.xml y los llms.txt se escriben también como ficheros
// estáticos: el servidor Express los genera en caliente, pero así el build es
// autosuficiente si alguna vez se sirve dist/ como estático.
const hoy = new Date().toISOString().split('T')[0];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${RUTAS_PUBLICAS.map(
    (r) =>
        `  <url>\n    <loc>${defaults.siteUrl}${r}</loc>\n    <lastmod>${hoy}</lastmod>\n  </url>`
).join('\n')}
</urlset>
`;

const estaticos = {
    'robots.txt': construirRobots(),
    'sitemap.xml': sitemap,
    'llms.txt': construirLlms(),
    'llms-full.txt': construirLlmsFull(),
};

for (const [nombre, contenido] of Object.entries(estaticos)) {
    fs.writeFileSync(path.join(distDir, nombre), contenido);
    console.log(`[prerender] ${nombre.padEnd(38)} ${(contenido.length / 1024).toFixed(1)} kB`);
}

// Precompresión de los assets con hash.
//
// El middleware `compression` de Express comprime en caliente, y por velocidad
// usa Brotli de calidad 4: sobre este bundle da 147 kB, MÁS que gzip (145 kB).
// Como los navegadores modernos anuncian `br` antes que `gzip`, hoy reciben
// precisamente la peor de las dos versiones.
//
// Estos ficheros llevan hash en el nombre y se sirven `immutable`, así que
// comprimirlos una vez aquí a calidad máxima no cuesta nada en cada petición y
// baja el bundle a 126 kB. El servidor sirve la variante ya comprimida cuando
// existe (ver server.js) y `compression` se aparta al ver Content-Encoding.
const COMPRIMIBLES = /\.(js|css|svg|json|txt|xml|map)$/i;
const MINIMO_BYTES = 1024;

function precomprimir(dir) {
    let n = 0;
    let ahorro = 0;
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
        const ruta = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            const r = precomprimir(ruta);
            n += r.n;
            ahorro += r.ahorro;
            continue;
        }
        if (!COMPRIMIBLES.test(entrada.name) || /\.(br|gz)$/i.test(entrada.name)) continue;

        const datos = fs.readFileSync(ruta);
        if (datos.length < MINIMO_BYTES) continue;

        const br = zlib.brotliCompressSync(datos, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
                [zlib.constants.BROTLI_PARAM_SIZE_HINT]: datos.length,
            },
        });
        const gz = zlib.gzipSync(datos, { level: zlib.constants.Z_BEST_COMPRESSION });

        fs.writeFileSync(`${ruta}.br`, br);
        fs.writeFileSync(`${ruta}.gz`, gz);
        n += 1;
        ahorro += datos.length - br.length;
    }
    return { n, ahorro };
}

const { n: comprimidos, ahorro } = precomprimir(distDir);
console.log(
    `[prerender] precomprimidos ${comprimidos} ficheros (br + gz), ${(ahorro / 1024).toFixed(1)} kB menos que sin comprimir`
);
