const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/**
 * Escapa texto destinado a contenido o atributos HTML. Sin esto, cualquier valor
 * guardado desde /admin puede cerrar el atributo e inyectar markup arbitrario.
 */
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

/**
 * Serializa JSON-LD para incrustarlo en <script>. Escapar `<` impide que un
 * `</script>` dentro de los datos cierre el bloque antes de tiempo.
 */
function serializeJsonLd(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (!text) return '{}';
    try {
        JSON.parse(text);
    } catch {
        return '{}';
    }
    return text.replace(/</g, '\\u003c');
}

/*
 * Caracteres que hay que neutralizar al meter JSON dentro de un <script>:
 *
 *   <          porque un `</script>` dentro del texto cierra el bloque y
 *              convierte el resto en markup ejecutable.
 *   U+2028/9   porque son separadores de línea válidos en JSON pero terminan
 *              la línea en JavaScript. Llegan pegando un párrafo desde Word, y
 *              sin escaparlos el <script> se parte por la mitad.
 *
 * La clase y las secuencias de escape se construyen por código de carácter a
 * propósito: un U+2028 literal dentro de un literal de expresión regular es un
 * error de sintaxis, y escrito como escape es invisible en cualquier revisión.
 */
const BARRA = String.fromCharCode(92);
const PELIGROSOS = new RegExp(`[<${String.fromCharCode(0x2028, 0x2029)}]`, 'g');

const escaparUnicode = (char) =>
    `${BARRA}u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;

/** Serializa un objeto para incrustarlo dentro de <script> como dato. */
function serializeJson(value) {
    return JSON.stringify(value).replace(PELIGROSOS, escaparUnicode);
}

/** Los IDs de tracking son alfanuméricos con guiones; cualquier otra cosa se descarta. */
function sanitizeTrackingId(value) {
    if (!value) return '';
    return /^[A-Za-z0-9-_]{1,32}$/.test(value) ? value : '';
}

module.exports = { escapeHtml, serializeJsonLd, serializeJson, sanitizeTrackingId };
