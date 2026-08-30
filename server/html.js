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

/** Los IDs de tracking son alfanuméricos con guiones; cualquier otra cosa se descarta. */
function sanitizeTrackingId(value) {
    if (!value) return '';
    return /^[A-Za-z0-9-_]{1,32}$/.test(value) ? value : '';
}

module.exports = { escapeHtml, serializeJsonLd, sanitizeTrackingId };
