/*
 * Diccionario que convierte el árbol de contenido en formularios que entiende
 * alguien que no ha visto un JSON en su vida.
 *
 * La alternativa sería un editor de JSON en crudo, y eso NO es un CMS: es pedir
 * que el equipo aprenda a poner comas. Aquí cada clave tiene nombre en
 * castellano, una pista de para qué sirve, y el tipo de control que le toca.
 *
 * Las claves se repiten mucho entre bloques (titulo, texto, destino...), así que
 * el diccionario general cubre casi todo y solo se sobrescribe donde una clave
 * significa algo distinto en su bloque.
 */

/** Orden y presentación de los bloques en la barra lateral. */
export const BLOQUES = [
    {
        clave: 'hero',
        nombre: 'Portada',
        ayuda: 'Lo primero que ve alguien al entrar. La frase, el botón y el panel de la noche.',
        ancla: '#top',
    },
    {
        clave: 'stack',
        nombre: 'Herramientas',
        ayuda: 'La tira que pasa con las herramientas a las que nos conectamos.',
        ancla: '#top',
    },
    {
        clave: 'pilares',
        nombre: 'Qué hacemos',
        ayuda: 'Los tres frentes: sitios web, agendamiento y automatizaciones.',
        ancla: '#pilares',
    },
    {
        clave: 'verticales',
        nombre: 'Para quién',
        ayuda: 'Un bloque por giro de negocio, con la escena donde pierden clientes.',
        ancla: '#verticales',
    },
    {
        clave: 'proceso',
        nombre: 'Cómo trabajamos',
        ayuda: 'Los cuatro pasos, con su plazo. Sección de fondo claro.',
        ancla: '#proceso',
    },
    {
        clave: 'demo',
        nombre: 'La muestra',
        ayuda: 'La conversación de ejemplo dentro del teléfono.',
        ancla: '#demo',
    },
    {
        clave: 'servicios',
        nombre: 'Catálogo',
        ayuda: 'Encabezado del catálogo. Los 17 servicios se editan en su propio fichero.',
        ancla: '#servicios',
    },
    {
        clave: 'limites',
        nombre: 'Reglas de la casa',
        ayuda: 'Lo que NO hacemos. Es la sección que más confianza genera: cuídala.',
        ancla: '#limites',
    },
    {
        clave: 'faq',
        nombre: 'Preguntas frecuentes',
        ayuda: 'Encabezado. Las preguntas se editan en el fichero faq.json.',
        ancla: '#faq',
    },
    {
        clave: 'cta',
        nombre: 'Llamada final',
        ayuda: 'La tarjeta negra antes del formulario.',
        ancla: '#contacto',
    },
    {
        clave: 'contacto',
        nombre: 'Formulario',
        ayuda: 'Los textos del formulario. Los campos y el envío no se tocan desde aquí.',
        ancla: '#contacto',
    },
    { clave: 'nav', nombre: 'Menú', ayuda: 'Los enlaces de la barra de arriba.', ancla: '#top' },
    { clave: 'footer', nombre: 'Pie', ayuda: 'Columnas de enlaces y aviso legal.', ancla: '#contacto' },
];

/** Nombre legible de cada clave. */
export const ETIQUETAS = {
    visible: 'Mostrar esta sección',
    insignia: 'Etiqueta pequeña de la sección',
    titulo: 'Título',
    subtitulo: 'Segunda parte del título (sale en gris)',
    entradilla: 'Párrafo de entrada',
    texto: 'Texto',
    detalle: 'Nota pequeña del final',
    nota: 'Aviso',
    lema: 'Frase de la marca',
    legal: 'Aviso legal',
    nombre: 'Nombre',
    gancho: 'Frase gancho (sale en color)',
    puntos: 'Lo que hace (una línea por punto)',
    items: 'Elementos',
    pasos: 'Pasos',
    piezas: 'Herramientas',
    enlaces: 'Enlaces',
    columnas: 'Columnas',
    destino: 'A dónde lleva',
    duracion: 'Plazo',
    boton: 'Botón',
    pie: 'Letra pequeña de debajo',
    cta: 'Botón de acción',
    ctaPrimario: 'Botón principal',
    ctaSecundario: 'Botón secundario',
    alternativa: 'Enlace alternativo',
    escena: 'Panel de la guardia nocturna',
    eventos: 'Avisos que aparecen',
    reloj: 'Hora que marca el reloj',
    etiqueta: 'Estado (arriba a la derecha)',
    hora: 'Hora',
    canal: 'Canal',
    icono: 'Ilustración',
    fraseA: 'Primera frase (sale en gris)',
    fraseB: 'Segunda frase (sale en blanco)',
    apoyo: 'Párrafo de apoyo',
    id: 'Identificador interno',
};

/** Pistas donde el nombre no basta. */
export const AYUDAS = {
    destino:
        'Una ruta del sitio (/servicios), un ancla de la portada (#contacto), la palabra whatsapp, o una dirección completa (https://...).',
    insignia: 'Dos o tres palabras. Es la etiqueta con el punto de color.',
    icono: 'Elige qué ilustración acompaña a la tarjeta.',
    id: 'No lo cambies salvo que sepas lo que haces: se usa para no duplicar tarjetas.',
    fraseB: 'Aquí va el remate. Es la parte que más se lee de toda la página.',
    puntos: 'Tres como mucho. Di lo que el sistema HACE, nunca cuánto mejora.',
    reloj: 'De madrugada a propósito: es la prueba de que el sistema no duerme.',
};

/** Claves que no se enseñan: son estructura, no contenido. */
export const OCULTAS = new Set(['version']);

/** Valores cerrados. */
export const OPCIONES = {
    icono: [
        { valor: 'monitor', texto: 'Ventana de navegador' },
        { valor: 'calendar', texto: 'Agenda de la semana' },
        { valor: 'workflow', texto: 'Diagrama de flujo' },
    ],
};

/** Cuántas tarjetas tiene sentido tener en cada lista. */
export const LIMITES_LISTA = {
    items: 12,
    pasos: 8,
    piezas: 20,
    enlaces: 10,
    columnas: 4,
    eventos: 6,
    puntos: 5,
};

export const etiquetaDe = (clave) =>
    ETIQUETAS[clave] ?? clave.charAt(0).toUpperCase() + clave.slice(1).replace(/([A-Z])/g, ' $1');

/**
 * Qué control le toca a un valor.
 *
 * Se decide por la forma del dato y no por una tabla exhaustiva: así, si mañana
 * se añade un campo nuevo al contenido, el panel ya sabe pintarlo sin que haya
 * que tocar este fichero.
 */
export function tipoDe(clave, valor) {
    if (OPCIONES[clave]) return 'opciones';
    if (typeof valor === 'boolean') return 'interruptor';
    if (typeof valor === 'number') return 'numero';
    if (Array.isArray(valor)) {
        return valor.every((v) => typeof v === 'string') ? 'lista-texto' : 'lista-objetos';
    }
    if (valor !== null && typeof valor === 'object') return 'grupo';
    // Un párrafo necesita caja alta; un título, una línea. El umbral está en
    // donde una frase deja de caber cómodamente en un campo de una línea.
    return String(valor ?? '').length > 90 ? 'parrafo' : 'texto';
}

/** Resumen de una tarjeta para poder plegarla sin perder de vista cuál es. */
export function resumirElemento(elemento) {
    if (typeof elemento === 'string') return elemento;
    return (
        elemento?.nombre ||
        elemento?.titulo ||
        elemento?.texto ||
        elemento?.pregunta ||
        elemento?.id ||
        'Sin título'
    );
}

/** Plantilla para el botón «añadir» de cada lista. */
export function elementoNuevo(modelo) {
    if (typeof modelo === 'string') return '';
    if (!modelo || typeof modelo !== 'object') return '';

    const nuevo = {};
    for (const [clave, valor] of Object.entries(modelo)) {
        if (clave === 'id') {
            nuevo.id = `nuevo-${Math.random().toString(36).slice(2, 8)}`;
        } else if (Array.isArray(valor)) {
            nuevo[clave] = [];
        } else if (valor !== null && typeof valor === 'object') {
            nuevo[clave] = elementoNuevo(valor);
        } else if (typeof valor === 'boolean') {
            nuevo[clave] = valor;
        } else if (typeof valor === 'number') {
            nuevo[clave] = valor;
        } else {
            nuevo[clave] = '';
        }
    }
    return nuevo;
}
