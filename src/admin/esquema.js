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

/**
 * Orden y presentación de los bloques en la barra lateral.
 *
 * `ruta` es la página que abre la vista previa al elegir el bloque. Sin ella se
 * abre la portada; con ella, un bloque que vive en otra página se edita viendo
 * esa página y no una que no lo contiene.
 */
export const BLOQUES = [
    {
        clave: 'hero',
        nombre: 'Portada',
        ayuda: 'Lo primero que ve alguien al entrar: la etiqueta de arriba, la frase principal y los botones. La frase lleva «inteligencia artificial para negocios en Aguascalientes»: no la quites.',
        ancla: '#top',
    },
    {
        clave: 'pilares',
        nombre: 'Qué hacemos',
        ayuda: 'Los tres servicios principales: sitios web, chatbots y agendamiento, cada uno enlazado a su página.',
        ancla: '#pilares',
    },
    {
        clave: 'webPortada',
        nombre: 'Páginas web (portada)',
        ayuda: 'La sección de páginas web de la portada. Los cuatro tipos de sitio se editan en «Página: páginas web» y salen en las dos páginas.',
        ancla: '#paginas-web',
    },
    {
        clave: 'invisibles',
        nombre: 'Invisibles para la IA',
        ayuda: 'La medición propia. Cambia las cifras solo si repites la medición.',
        ancla: '#invisibles',
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
        nombre: 'Servicios complementarios',
        ayuda: 'Encabezado de los diez servicios complementarios en la portada. Los tres principales se presentan en «Qué hacemos»; todos se editan en su propio fichero.',
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
    {
        clave: 'nav',
        nombre: 'Menú',
        ayuda: 'Inicio, Nosotros, Servicios y Contacto. Servicios despliega sus grupos; Contacto va marcado como botón.',
        ancla: '#top',
    },
    { clave: 'footer', nombre: 'Pie', ayuda: 'Columnas de enlaces y aviso legal.', ancla: '#contacto' },
    {
        clave: 'paginasWeb',
        nombre: 'Página: páginas web',
        ayuda:
            'La página /paginas-web-aguascalientes. El título principal lleva la frase «diseño y desarrollo de páginas web en Aguascalientes»: cámbialo solo si sabes por qué. Las preguntas que edites aquí se publican también para Google.',
        ancla: '#top',
        ruta: '/paginas-web-aguascalientes',
    },
    {
        clave: 'chatbots',
        nombre: 'Página: chatbots',
        ayuda: 'La página /chatbots-aguascalientes. El título principal lleva «chatbots con inteligencia artificial en Aguascalientes». Las preguntas se publican también para Google.',
        ancla: '#top',
        ruta: '/chatbots-aguascalientes',
    },
    {
        clave: 'agendamiento',
        nombre: 'Página: agendamiento',
        ayuda: 'La página /agendamiento-automatizado-aguascalientes. Cada tipo lleva la escena del giro con el mismo identificador.',
        ancla: '#top',
        ruta: '/agendamiento-automatizado-aguascalientes',
    },
    {
        clave: 'nosotros',
        nombre: 'Página: nosotros',
        ayuda: 'La página /nosotros: de dónde sale el nombre y los principios.',
        ancla: '#top',
        ruta: '/nosotros',
    },
];

/** Nombre legible de cada clave. */
export const ETIQUETAS = {
    visible: 'Mostrar esta sección',
    insignia: 'Etiqueta sobre el titular',
    titulo: 'Título',
    subtitulo: 'Segunda parte del título (sale en gris)',
    apagado: 'Segunda parte del título (sale en gris)',
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
    escena: 'Escena animada',
    eventos: 'Avisos que aparecen',
    reloj: 'Hora que marca el reloj',
    etiqueta: 'Estado (arriba a la derecha)',
    hora: 'Hora',
    canal: 'Canal',
    icono: 'Ilustración',
    fraseA: 'Primera frase (sale en gris)',
    fraseB: 'Segunda frase (sale en blanco)',
    apoyo: 'Párrafo de apoyo',
    bajada: 'Frase corta para el teléfono',
    id: 'Identificador interno',
    definicion: 'En pocas palabras',
    grupos: 'Grupos del desplegable',
    destacado: 'Mostrar como botón',
    servicio: 'Servicio que se cotiza con el botón',
    tipos: 'Tipos de sitio',
    paraQuien: 'Para quién es',
    incluye: 'Qué incluye (una línea por punto)',
    noIncluye: 'Qué no incluye',
    alcance: 'Alcance',
    plazo: 'Plazo típico',
    diferencias: 'La diferencia',
    tituloApagado: 'Segunda parte del título (sale en gris)',
    precio: 'Precio',
    respuesta: 'Respuesta',
    factores: 'De qué depende (una línea por factor)',
    cierre: 'Cierre',
    portafolio: 'Portafolio',
    proyectos: 'Proyectos',
    relacionados: 'Servicios relacionados',
    pregunta: 'Pregunta',
    faq: 'Preguntas frecuentes',
    url: 'Dirección del sitio publicado',
    imagen: 'Captura',
    alt: 'Descripción de la captura',
    giro: 'Giro del cliente',
    tipo: 'Tipo de sitio',
    descripcion: 'Descripción',
};

/** Pistas donde el nombre no basta. */
export const AYUDAS = {
    destino:
        'Una ruta del sitio (/servicios), un ancla de la portada (#contacto), la palabra whatsapp, o una dirección completa (https://...).',
    insignia: 'Solo existe en la portada: dice qué es la empresa, con las palabras que se buscan.',
    icono: 'Elige qué ilustración acompaña a la tarjeta.',
    id: 'No lo cambies salvo que sepas lo que haces: se usa para no duplicar tarjetas.',
    fraseB: 'Aquí va el remate. Es la parte que más se lee de toda la página.',
    puntos: 'Tres como mucho. Di lo que el sistema HACE, nunca cuánto mejora.',
    reloj: 'De madrugada a propósito: es la prueba de que el sistema no duerme.',
    definicion:
        'Un párrafo que se entienda solo, sin nada alrededor. Es el que citan ChatGPT y Google cuando preguntan quién hace páginas web en Aguascalientes.',
    noIncluye: 'Decir qué no incluye es lo que evita malentendidos después de firmar.',
    proyectos:
        'Solo sitios publicados y funcionando, con permiso del cliente. Una tarjeta que lleva a un error es peor que no tener portafolio.',
    imagen:
        'Ruta de una imagen subida al propio sitio, por ejemplo /portafolio/cliente.webp. Las imágenes de otros dominios no se muestran.',
    url: 'La dirección completa del sitio del cliente, empezando por https://',
    escena: 'Identificador de una escena animada (por ejemplo chatbots o agendamiento-automatizado). Vacío: se usa la ilustración.',
    destacado: 'Solo uno: el enlace que se pinta como botón a la derecha del menú.',
    bajada:
        'Lo que se lee bajo el título en el teléfono, en lugar del párrafo largo. Una frase de 20 palabras como mucho: así el botón cabe en la primera pantalla. Vacía, el teléfono enseña el párrafo largo.',
};

/** Claves que no se enseñan: son estructura, no contenido. */
export const OCULTAS = new Set(['version']);

/** Valores cerrados. */
export const OPCIONES = {
    servicio: [
        { valor: 'sitio-web', texto: 'Sitios web' },
        { valor: 'chatbots', texto: 'Chatbots con IA' },
        { valor: 'agendamiento-automatizado', texto: 'Agendamiento automatizado' },
    ],
    icono: [
        { valor: 'monitor', texto: 'Ventana de navegador' },
        { valor: 'calendar', texto: 'Agenda de la semana' },
        { valor: 'workflow', texto: 'Diagrama de flujo' },
    ],
};

/**
 * Forma de un elemento nuevo en las listas que pueden empezar vacías. Con la
 * lista vacía no hay un elemento del que copiar la forma, y sin esto el botón
 * «añadir» metería un texto suelto donde van tarjetas.
 */
export const MODELOS = {
    proyectos: {
        id: '',
        nombre: '',
        tipo: '',
        giro: '',
        descripcion: '',
        url: '',
        imagen: '',
        alt: '',
    },
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
    incluye: 5,
    factores: 6,
    proyectos: 8,
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
    if (MODELOS[clave]) return 'lista-objetos';
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
