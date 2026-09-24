import { getServicio } from '../data/servicios';
import { getSector } from '../data/sectores';

/*
 * Llamadas a la acción.
 *
 * Todas llevan a lo mismo: que la persona pregunte por el servicio concreto que
 * estaba viendo. Por eso el botón no dice «Contacto» sino «Cotizar mi chatbot»,
 * y el enlace lleva el servicio y el giro en la dirección
 * (/contacto?servicio=chatbots&giro=spas). El formulario los lee y deja escrito
 * «Me interesa un chatbot con inteligencia artificial para mi spa»: el lead
 * llega diciendo qué quiere sin que lo tenga que redactar.
 *
 * Una sola etiqueta por intención y por página: en la landing de chatbots
 * todos los botones dicen «Cotizar mi chatbot», no cinco variantes de
 * «contáctenos».
 */

const INTERES = {
    'sitio-web': 'una página web',
    chatbots: 'un chatbot con inteligencia artificial',
    'agendamiento-automatizado': 'automatizar el agendamiento de citas',
};

const ETIQUETA = {
    'sitio-web': 'Cotizar mi página web',
    chatbots: 'Cotizar mi chatbot',
    'agendamiento-automatizado': 'Cotizar mi agenda',
};

/** Texto del botón para un servicio o un giro. */
export function etiquetaCta({ servicio, giro } = {}) {
    const s = getServicio(servicio);
    if (s) return ETIQUETA[s.slug] ?? 'Cotizar este servicio';
    const g = getSector(giro);
    if (g?.singular) return `Cotizar para mi ${g.singular}`;
    return 'Cotizar mi proyecto';
}

/** La frase que el lead deja escrita: qué le interesa y para qué negocio. */
export function interesDe({ servicio, giro, detalle } = {}) {
    const s = getServicio(servicio);
    const g = getSector(giro);
    const que = s
        ? (INTERES[s.slug] ?? `el servicio de ${s.nombre.charAt(0).toLowerCase()}${s.nombre.slice(1)}`)
        : 'cotizar un proyecto';
    const tipo = detalle ? ` (${detalle.charAt(0).toLowerCase()}${detalle.slice(1)})` : '';
    const para = g?.singular ? ` para mi ${g.singular}` : '';
    return `Me interesa ${que}${tipo}${para}.`;
}

/** Destino del botón: el formulario, con el servicio y el giro en la dirección. */
export function destinoCta({ servicio, giro, detalle } = {}) {
    const parametros = new URLSearchParams();
    if (servicio) parametros.set('servicio', servicio);
    if (giro) parametros.set('giro', giro);
    if (detalle) parametros.set('detalle', detalle);
    const consulta = parametros.toString();
    return consulta ? `/contacto?${consulta}` : '/contacto';
}

/** Alternativa por WhatsApp, con el mensaje ya redactado. */
export const whatsappCta = (datos = {}) => `whatsapp:Hola. ${interesDe(datos)}`;

/** Lee el interés de la dirección actual. Solo en el navegador. */
export function interesDeLaDireccion(busqueda = '') {
    const p = new URLSearchParams(busqueda);
    if (!p.get('servicio') && !p.get('giro')) return '';
    return interesDe({
        servicio: p.get('servicio') ?? undefined,
        giro: p.get('giro') ?? undefined,
        detalle: p.get('detalle') ?? undefined,
    });
}
