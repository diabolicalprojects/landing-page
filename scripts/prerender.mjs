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
import { fileURLToPath } from 'node:url';

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

const { render } = await import(path.join(rootDir, '.ssr', 'entry-server.mjs'));

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
