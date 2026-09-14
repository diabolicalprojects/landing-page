const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const config = require('./config');

const BASE = require('../src/data/contenido.json');

const ficheroContenido = path.join(config.dataDir, 'contenido.json');

/*
 * Contenido editable desde /admin.
 *
 * Espejo exacto de src/contenido/index.jsx: misma fusión, mismo respaldo. Si
 * las dos versiones divergieran, el HTML servido y el que React reconstruye al
 * hidratar dejarían de coincidir y React tiraría el servidor entero.
 *
 * El fichero de fábrica vive en src/data y NUNCA se escribe; lo editado vive en
 * el volumen (data/contenido.json) y se fusiona encima.
 */

const esObjetoPlano = (valor) =>
    valor !== null && typeof valor === 'object' && !Array.isArray(valor);

function fusionar(base, encima) {
    if (!esObjetoPlano(encima)) return encima === undefined ? base : encima;
    if (!esObjetoPlano(base)) return encima;

    const salida = { ...base };
    for (const clave of Object.keys(encima)) {
        salida[clave] = fusionar(base[clave], encima[clave]);
    }
    return salida;
}

/*
 * Límites de tamaño. El contenido entra por una API autenticada, así que esto
 * no protege de un atacante sino de un accidente: un pegado enorme en un campo
 * de texto multiplicaría el HTML de todas las páginas, porque el contenido
 * viaja entero en cada respuesta.
 */
const MAX_BYTES = 512 * 1024;
const MAX_PROFUNDIDAD = 8;

function validar(entrada) {
    if (!esObjetoPlano(entrada)) {
        return { ok: false, error: 'El contenido debe ser un objeto.' };
    }

    const bytes = Buffer.byteLength(JSON.stringify(entrada), 'utf8');
    if (bytes > MAX_BYTES) {
        return {
            ok: false,
            error: `El contenido ocupa ${Math.round(bytes / 1024)} kB y el máximo son ${MAX_BYTES / 1024} kB.`,
        };
    }

    // Un árbol demasiado profundo suele ser una estructura mal formada, y
    // recorrerlo en cada render cuesta en cada petición.
    const demasiadoHondo = (valor, nivel) => {
        if (nivel > MAX_PROFUNDIDAD) return true;
        if (Array.isArray(valor)) return valor.some((v) => demasiadoHondo(v, nivel + 1));
        if (esObjetoPlano(valor)) {
            return Object.values(valor).some((v) => demasiadoHondo(v, nivel + 1));
        }
        return false;
    };

    if (demasiadoHondo(entrada, 0)) {
        return { ok: false, error: `El contenido anida más de ${MAX_PROFUNDIDAD} niveles.` };
    }

    return { ok: true };
}

let cache = null;

/** Contenido ya fusionado, listo para renderizar. */
function leerContenido() {
    if (cache) return cache;

    let guardado = {};
    if (fs.existsSync(ficheroContenido)) {
        try {
            guardado = JSON.parse(fs.readFileSync(ficheroContenido, 'utf8'));
        } catch (error) {
            console.error(
                '[contenido] contenido.json ilegible, se usa el de fábrica:',
                error.message
            );
            guardado = {};
        }
    }

    const valor = fusionar(BASE, esObjetoPlano(guardado) ? guardado : {});
    cache = { valor, version: huella(valor) };
    return cache;
}

/**
 * Huella del contenido. Es lo que invalida el HTML cacheado: mientras no
 * cambie, la misma ruta puede servirse desde memoria sin volver a renderizar.
 */
function huella(valor) {
    return crypto.createHash('sha1').update(JSON.stringify(valor)).digest('hex').slice(0, 12);
}

const VERSION_BASE = huella(BASE);

/**
 * ¿Hay algo editado encima del contenido de fábrica?
 *
 * Lo consulta server.js para decidir qué HTML servir cuando no hay render en
 * caliente: con el contenido de fábrica el HTML estático del build sigue siendo
 * correcto, pero con contenido editado estaría desfasado y React lo tiraría al
 * hidratar. En ese caso vale más montar en cliente que servir texto viejo.
 */
function esPersonalizado() {
    return leerContenido().version !== VERSION_BASE;
}

function escribirContenido(entrada) {
    const comprobacion = validar(entrada);
    if (!comprobacion.ok) return comprobacion;

    if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
    }

    // Escritura atómica: un corte a media escritura dejaría el JSON corrupto y
    // el sitio entero volvería al contenido de fábrica.
    const temporal = `${ficheroContenido}.tmp`;
    fs.writeFileSync(temporal, JSON.stringify(entrada, null, 2), { mode: 0o600 });
    fs.renameSync(temporal, ficheroContenido);

    cache = null;
    return { ok: true, ...leerContenido() };
}

/** Devuelve el sitio al contenido de fábrica borrando lo guardado. */
function restablecerContenido() {
    if (fs.existsSync(ficheroContenido)) fs.unlinkSync(ficheroContenido);
    cache = null;
    return leerContenido();
}

/** Solo para pruebas: obliga a releer del disco. */
function olvidarCache() {
    cache = null;
}

module.exports = {
    BASE,
    VERSION_BASE,
    fusionar,
    leerContenido,
    escribirContenido,
    restablecerContenido,
    esPersonalizado,
    olvidarCache,
    ficheroContenido,
};
