const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const config = require('./config');
const { leerContenido } = require('./contenido');

/*
 * Render en caliente.
 *
 * Antes la portada se prerenderizaba una vez en el build y se servía tal cual.
 * Eso deja de valer en cuanto el contenido se edita desde el panel: el HTML
 * seguiría llevando el texto del último despliegue, y justo ese HTML es el que
 * leen los rastreadores y los motores de IA. El panel diría «guardado» y el
 * mundo seguiría viendo lo viejo.
 *
 * Así que el HTML se construye por petición con el mismo bundle de servidor que
 * usa el prerender, y se cachea en memoria por (ruta, versión del contenido).
 * Guardar en el panel cambia la versión y todo el caché queda obsoleto de golpe
 * sin tener que invalidar nada a mano.
 *
 * Si el bundle no está —una imagen construida sin él, o un `build:client` a
 * secas— esto devuelve null y server.js sirve el HTML estático de siempre. El
 * sitio nunca depende de que esto funcione.
 */

const ficheroSsr = path.join(config.distPath, '..', '.ssr', 'entry-server.mjs');

let cargando = null;
let render = null;
let motivoFallo = null;

/** Arranca la carga del bundle. Se llama una vez al levantar el servidor. */
function prepararSsr() {
    if (cargando) return cargando;

    cargando = (async () => {
        if (!fs.existsSync(ficheroSsr)) {
            motivoFallo = `no existe ${path.relative(process.cwd(), ficheroSsr)}`;
            return null;
        }
        try {
            // pathToFileURL es obligatorio en Windows: sin él, Node lee la
            // "D:" de la ruta absoluta como si fuera un protocolo.
            const modulo = await import(pathToFileURL(ficheroSsr).href);
            render = modulo.render;
            return render;
        } catch (error) {
            motivoFallo = error.message;
            console.error('[ssr] No se pudo cargar el bundle de servidor:', error.message);
            return null;
        }
    })();

    return cargando;
}

const cache = new Map();

/*
 * Tope del caché. Cada entrada es el HTML entero de una ruta (del orden de
 * 60 kB), y las rutas son un conjunto cerrado y pequeño, así que este número
 * solo existe para que un bug de invalidación no se convierta en una fuga de
 * memoria en un contenedor con poca RAM.
 */
const MAX_ENTRADAS = 40;

/**
 * Devuelve el markup de una ruta con el contenido actual, o null si no hay
 * bundle. `version` es la huella del contenido: mientras no cambie, la misma
 * ruta se sirve desde memoria.
 */
async function renderizar(ruta) {
    await prepararSsr();
    if (typeof render !== 'function') return null;

    const { valor, version } = leerContenido();
    const clave = `${version}:${ruta}`;

    const guardado = cache.get(clave);
    if (guardado) return guardado;

    let markup;
    try {
        markup = render(ruta, valor);
    } catch (error) {
        // Un fallo de render no puede tumbar la petición: se cae al HTML
        // estático, que como mucho está desactualizado pero se ve.
        console.error(`[ssr] Falló el render de ${ruta}:`, error.message);
        return null;
    }

    if (!markup || markup.length < 500) {
        console.error(`[ssr] El render de ${ruta} devolvió ${markup?.length ?? 0} caracteres.`);
        return null;
    }

    // Al cambiar la versión del contenido las claves viejas quedan huérfanas;
    // se limpian de golpe en vez de una a una.
    if (cache.size >= MAX_ENTRADAS) cache.clear();
    cache.set(clave, { markup, version });

    return { markup, version };
}

function estadoSsr() {
    return { disponible: typeof render === 'function', motivoFallo, entradas: cache.size };
}

function vaciarCache() {
    cache.clear();
}

module.exports = { prepararSsr, renderizar, estadoSsr, vaciarCache };
