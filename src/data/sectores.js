import SECTORES from './sectores.json';

/**
 * Sectores a los que va dirigida la oferta. Cada uno genera una página propia
 * (/automatizacion-para-<slug>) con sus metadatos, su JSON-LD y sus preguntas
 * frecuentes.
 *
 * Los datos viven en sectores.json y no en este archivo porque el servidor
 * (CommonJS) también los necesita para construir el <head> y el sitemap: un
 * único JSON evita que cliente y servidor se desincronicen.
 *
 * Esta segmentación es la ventaja competitiva: ni Mango ni Inédito segmentan
 * por sector, así que quien busca "automatizar las citas de mi clínica en
 * Aguascalientes" no encuentra a nadie hablándole directamente.
 *
 * Regla al editar: aquí se describen capacidades y problemas típicos del
 * sector, nunca resultados atribuidos a clientes concretos. Cualquier cifra que
 * se añada debe venir de un proyecto real y ser defendible.
 *
 * Campos de cada sector:
 *   slug, nombre, nombreCorto  identidad y rutas
 *   titulo, descripcion,       lo que se inyecta en <title>, <meta> y JSON-LD
 *   keywords
 *   titular, entradilla        encabezado visible de la página
 *   dolores[]                  fricción típica del sector
 *   soluciones[]               {titulo, detalle} de lo que se instala
 *   faq[]                      {q, a} propias del sector, con FAQPage schema
 */
export { SECTORES };

export const getSector = (slug) => SECTORES.find((s) => s.slug === slug);

/** Rutas que genera este módulo, para el router, el sitemap y el prerender. */
export const RUTAS_SECTORES = SECTORES.map((s) => `/automatizacion-para-${s.slug}`);
