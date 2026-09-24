import { Giros, Identidad, Nucleo, Sello } from './marca';
import { CICLO_GUIAS, Guias } from './guias';
import {
    AgentesYChatbots,
    AuditoriaDeFriccion,
    EmbudosDeVenta,
    FichaDeGoogle,
    GoogleAds,
    IaDeVentas,
    IaParaTienda,
    IaWhatsapp,
    IdentidadDeMarca,
    PosicionamientoEnIa,
    PosicionamientoOrganico,
    PresenciaEnEventos,
    SitioWeb,
} from './servicios';
import {
    CICLO_CORPORATIVO,
    CICLO_LANDING,
    CICLO_MEDIDA,
    CICLO_TIENDA,
    TipoCorporativo,
    TipoLanding,
    TipoMedida,
    TipoTienda,
} from './tipos';
import {
    Clinicas,
    Comercio,
    Despachos,
    Gimnasios,
    Inmobiliarias,
    SalonesDeUnas,
    Spas,
} from './sectores';
import {
    Agendamiento,
    Chatbots,
    CICLO_AGENDAMIENTO,
    CICLO_CHATBOTS,
    LIENZO_PROCESO,
    Proceso,
    cicloProceso,
    posterProceso,
} from './estrella';

/*
 * Registro de escenas.
 *
 * `duracion` es el ciclo completo en fotogramas a 30 fps. `poster` es el
 * fotograma que se dibuja en el servidor y cuando alguien pide menos
 * movimiento: se elige donde la escena ya ha contado lo suyo, nunca el
 * fotograma 0, que casi siempre está vacío.
 *
 * Las claves de servicios y sectores coinciden con sus `slug` para que una
 * página pueda pedir su escena sin ninguna tabla intermedia que mantener.
 */

/*
 * `descripcion` es el texto alternativo por defecto. Solo lo llevan las escenas
 * que se pintan desde datos (los tipos de sitio), donde no hay un componente
 * escrito a mano que pueda describir la ilustración que tiene al lado.
 */
const escena = (Escena, duracion, poster, descripcion, lienzo) => ({
    Escena,
    duracion,
    poster,
    descripcion,
    lienzo,
});

export const ESCENAS = {
    // Marca
    nucleo: escena(Nucleo, 340, 150),
    identidad: escena(Identidad, 360, 200),
    sello: escena(Sello, 420, 180),
    giros: escena(
        Giros,
        340,
        150,
        'Ilustración animada: la marca de Diabolical en el centro, conectada con una inmobiliaria, un gimnasio, un spa y un salón de uñas.'
    ),
    guias: escena(
        Guias,
        CICLO_GUIAS,
        118,
        'Ilustración animada: una pregunta se escribe en el buscador y aparece la respuesta con el botón a la guía.'
    ),

    // Servicios principales con escena propia en su landing. La de sitio web
    // es 'sitio-web', más abajo, porque ya existía con el resto del catálogo.
    chatbots: escena(
        Chatbots,
        CICLO_CHATBOTS,
        230,
        'Ilustración animada: WhatsApp, el sitio web e Instagram llegan al mismo chatbot, que responde, confirma la cita y pasa a una persona cuando hace falta.'
    ),
    'agendamiento-automatizado': escena(
        Agendamiento,
        CICLO_AGENDAMIENTO,
        250,
        'Ilustración animada: una cita pedida por WhatsApp ocupa su hueco en la agenda, sale el recordatorio y otra cita se mueve de día sin perder el hueco.'
    ),

    // Proceso: se dibuja con los pasos del contenido, así que su duración y su
    // póster dependen de cuántos pasos haya.
    proceso: escena(
        Proceso,
        cicloProceso,
        posterProceso,
        'Diagrama animado del proceso de trabajo, paso por paso.',
        LIENZO_PROCESO
    ),

    // Servicios
    'posicionamiento-organico': escena(PosicionamientoOrganico, 240, 120),
    'ficha-de-google': escena(FichaDeGoogle, 240, 130),
    'google-ads': escena(GoogleAds, 260, 140),
    'posicionamiento-en-ia': escena(PosicionamientoEnIa, 280, 150),
    'sitio-web': escena(SitioWeb, 260, 140),
    'embudos-de-venta': escena(EmbudosDeVenta, 260, 130),
    'ia-whatsapp': escena(IaWhatsapp, 280, 150),
    'agentes-y-chatbots': escena(AgentesYChatbots, 280, 140),
    'ia-de-ventas': escena(IaDeVentas, 280, 140),
    'ia-para-tienda': escena(IaParaTienda, 260, 140),
    'identidad-de-marca': escena(IdentidadDeMarca, 280, 150),
    'presencia-en-eventos': escena(PresenciaEnEventos, 280, 150),
    'auditoria-de-friccion': escena(AuditoriaDeFriccion, 300, 170),

    // Tipos de página web. Las claves son los `id` de paginasWeb.tipos.items
    // en el contenido, por la misma razón que las de servicios son su slug.
    'tipo-landing': escena(
        TipoLanding,
        CICLO_LANDING,
        200,
        'Ilustración animada: una landing page que se recorre hasta un solo botón, y la solicitud que llega al teléfono del negocio.'
    ),
    'tipo-corporativo': escena(
        TipoCorporativo,
        CICLO_CORPORATIVO,
        210,
        'Ilustración animada: la portada de un sitio corporativo que se ramifica en una página por servicio, cada una indexada en Google.'
    ),
    'tipo-tienda': escena(
        TipoTienda,
        CICLO_TIENDA,
        262,
        'Ilustración animada: un producto que pasa al carrito, se paga y avanza por los estados del pedido hasta entregarse.'
    ),
    'tipo-medida': escena(
        TipoMedida,
        CICLO_MEDIDA,
        220,
        'Ilustración animada: un texto que se edita en el panel y cambia a la vez en la página, con la agenda, el CRM y el asistente conectados.'
    ),

    // Sectores
    inmobiliarias: escena(Inmobiliarias, 300, 160),
    spas: escena(Spas, 300, 160),
    'salones-de-unas': escena(SalonesDeUnas, 300, 160),
    clinicas: escena(Clinicas, 300, 160),
    gimnasios: escena(Gimnasios, 300, 160),
    'despachos-y-oficinas': escena(Despachos, 300, 160),
    comercio: escena(Comercio, 300, 160),
};

/*
 * Encuadre en el teléfono: la parte del lienzo que se ve en el hero móvil,
 * como [x, y, ancho, alto] en unidades del lienzo (640 × 400).
 *
 * Las escenas se dibujaron para una columna de escritorio y dejan aire
 * alrededor. En un teléfono ese aire se come la mitad del ancho; recortarlo
 * hace la escena hasta un tercio más grande sin redibujar nada. El recorte
 * deja siempre margen alrededor de lo que se mueve, no solo del póster.
 *
 * Sin encuadre, la escena se ve entera.
 */
const ENCUADRE_SECTOR = [66, 44, 546, 322];

export const ENCUADRES = {
    nucleo: [40, 44, 560, 330],
    giros: [30, 44, 580, 330],
    identidad: [120, 10, 400, 380],
    sello: [150, 40, 340, 320],
    guias: [80, 44, 480, 300],
    'sitio-web': [76, 34, 488, 330],
    chatbots: [40, 44, 590, 352],
    'agendamiento-automatizado': [24, 34, 596, 352],
    inmobiliarias: ENCUADRE_SECTOR,
    gimnasios: ENCUADRE_SECTOR,
    spas: ENCUADRE_SECTOR,
    'salones-de-unas': ENCUADRE_SECTOR,
    clinicas: ENCUADRE_SECTOR,
    'despachos-y-oficinas': ENCUADRE_SECTOR,
    comercio: ENCUADRE_SECTOR,
};

/** ¿Hay escena para esta clave? Lo usan las páginas generadas por datos. */
export const hayEscena = (clave) => Boolean(ESCENAS[clave]);
