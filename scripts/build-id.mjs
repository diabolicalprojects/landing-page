/**
 * Identificador de build: una huella del código fuente que determina lo que
 * sirve el servidor.
 *
 * Existe por un fallo real del 13/09/2026. El workflow "Desplegar" comprobaba
 * que producción estuviera actualizada comparando `llms.txt`, pero ese fichero
 * se genera de src/data y aquella release no tocó ninguno: el fichero era
 * idéntico en la versión vieja y en la nueva. La comprobación dio verde en un
 * segundo contra el contenedor ANTERIOR, mientras el despliegue real moría a
 * mitad de build. Un verde que no significaba nada.
 *
 * La huella se calcula sobre los ficheros FUENTE, no sobre el resultado del
 * build: así el valor que calcula el CI y el que queda dentro de la imagen que
 * construye la plataforma coinciden siempre para un mismo commit, sin depender
 * de que dos builds distintos produzcan bytes idénticos.
 *
 * Solo entran rutas que existen tanto en el repositorio como en el contexto de
 * Docker (ver .dockerignore): si se añadiera aquí algo excluido de la imagen,
 * las dos huellas no coincidirían nunca y el despliegue no pasaría jamás.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RUTAS = [
    'index.html',
    'package.json',
    'package-lock.json',
    'vite.config.js',
    'vite.config.ssr.js',
    'server.js',
    'server',
    'src',
    'scripts',
];

function ficheros(raiz, rel) {
    const absoluta = path.join(raiz, rel);
    if (!fs.existsSync(absoluta)) return [];
    if (fs.statSync(absoluta).isFile()) return [rel];
    return fs
        .readdirSync(absoluta)
        .flatMap((entrada) => ficheros(raiz, path.posix.join(rel, entrada)));
}

/** Huella hexadecimal de 16 caracteres del código fuente en `raiz`. */
export function buildId(raiz) {
    const resumen = crypto.createHash('sha256');

    for (const rel of RUTAS.flatMap((r) => ficheros(raiz, r)).sort()) {
        // Los saltos de línea se normalizan a LF: en Windows git entrega CRLF y
        // sin esto la huella dependería del sistema en que se calcula.
        const contenido = fs.readFileSync(path.join(raiz, rel)).toString('utf8').replace(/\r\n/g, '\n');
        resumen.update(`${rel}\0${crypto.createHash('sha256').update(contenido).digest('hex')}\n`);
    }

    return resumen.digest('hex').slice(0, 16);
}
