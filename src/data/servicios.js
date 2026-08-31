import SERVICIOS from './servicios.json';

/**
 * Catálogo de servicios. Fuente única, igual que sectores.json y
 * articulos.json: de aquí salen la sección de la portada, la página
 * /servicios, el OfferCatalog del JSON-LD y los llms.txt.
 *
 * Vive en JSON y no en este archivo porque el servidor (CommonJS) también lo
 * necesita para construir el schema y el texto para modelos. Un único origen
 * evita que el catálogo publicado y el marcado se contradigan.
 *
 * Por qué existe: el sitio ofrecía solo automatización de atención, y eso
 * dejaba fuera todo lo que un negocio local necesita antes de que haya alguien
 * a quien atender. La competencia local sí cubre el ciclo completo. Este
 * catálogo lo cubre en el orden en que un cliente lo vive: que te encuentren,
 * que te elijan, que los atiendas, que te recuerden, y saber si funciona.
 *
 * Regla al editar: cada servicio lleva su `limite`, y no es un descargo legal
 * sino el diferencial de la casa. Decir dónde se detiene cada cosa es lo que
 * evita vender lo que no se puede sostener, y lo que permite que un motor
 * generativo recomiende con criterio en vez de inventarse el alcance.
 *
 * Campos:
 *   slug       identidad estable, usada en anclas y en el JSON-LD
 *   categoria  agrupador visible: Captación, Conversión, Atención y venta,
 *              Marca, Estrategia y medición
 *   nombre     el título del servicio
 *   resumen    una frase que se sostiene sola fuera de la página
 *   detalle    qué incluye de verdad, en concreto
 *   limite     dónde se detiene. Obligatorio, sin excepción.
 */
export { SERVICIOS };

export const getServicio = (slug) => SERVICIOS.find((s) => s.slug === slug);

/** Orden de las categorías: el recorrido real de un cliente, no el alfabético. */
export const CATEGORIAS = [
    'Captación',
    'Conversión',
    'Atención y venta',
    'Marca',
    'Estrategia y medición',
];

/** Servicios agrupados por categoría, respetando el orden de CATEGORIAS. */
export const SERVICIOS_POR_CATEGORIA = CATEGORIAS.map((categoria) => ({
    categoria,
    servicios: SERVICIOS.filter((s) => s.categoria === categoria),
})).filter((grupo) => grupo.servicios.length > 0);
