import { Identidad, Nucleo, Sello } from './marca';
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
    Clinicas,
    Comercio,
    Despachos,
    Gimnasios,
    Inmobiliarias,
    SalonesDeBelleza,
} from './sectores';

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

const escena = (Escena, duracion, poster) => ({ Escena, duracion, poster });

export const ESCENAS = {
    // Marca
    nucleo: escena(Nucleo, 340, 150),
    identidad: escena(Identidad, 360, 200),
    sello: escena(Sello, 420, 180),

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

    // Sectores
    inmobiliarias: escena(Inmobiliarias, 300, 160),
    'salones-de-belleza': escena(SalonesDeBelleza, 300, 160),
    clinicas: escena(Clinicas, 300, 160),
    gimnasios: escena(Gimnasios, 300, 160),
    'despachos-y-oficinas': escena(Despachos, 300, 160),
    comercio: escena(Comercio, 300, 160),
};

/** ¿Hay escena para esta clave? Lo usan las páginas generadas por datos. */
export const hayEscena = (clave) => Boolean(ESCENAS[clave]);
