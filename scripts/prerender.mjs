/**
 * Prerenderiza la portada a HTML estático tras el build.
 *
 * Los crawlers que no ejecutan JavaScript (buscadores secundarios, previsuali-
 * zadores de enlaces, rastreadores de LLMs) recibían un <div id="root"> vacío.
 * Con esto reciben la página entera.
 *
 * Produce dos ficheros:
 *   dist/index.html      portada con el HTML ya renderizado
 *   dist/app-shell.html  shell vacío para el resto de rutas
 *
 * El shell existe porque el servidor sirve el mismo fichero para todas las
 * rutas: servir la portada prerenderizada en /politica-privacidad haría que
 * React tuviera que descartarla al hidratar.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const indexFile = path.join(distDir, 'index.html');
const shellFile = path.join(distDir, 'app-shell.html');

const ROOT_TAG = '<div id="root"></div>';

const shell = fs.readFileSync(indexFile, 'utf8');

if (!shell.includes(ROOT_TAG)) {
    throw new Error(`No se encontró ${ROOT_TAG} en dist/index.html; el prerender no puede continuar.`);
}

// El shell se guarda antes de tocar nada: es el index.html tal cual lo dejó Vite.
fs.writeFileSync(shellFile, shell);

const { render } = await import(path.join(rootDir, '.ssr', 'entry-server.mjs'));
const markup = render('/');

if (!markup || markup.length < 500) {
    throw new Error(`El prerender devolvió ${markup?.length ?? 0} caracteres; se esperaba la portada completa.`);
}

fs.writeFileSync(indexFile, shell.replace(ROOT_TAG, `<div id="root">${markup}</div>`));

console.log(`[prerender] Portada prerenderizada (${(markup.length / 1024).toFixed(1)} kB de HTML).`);
console.log('[prerender] Shell para el resto de rutas en dist/app-shell.html.');
