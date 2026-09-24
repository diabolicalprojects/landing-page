import SECTORES from './sectores.json';

/**
 * Sectores a los que va dirigida la oferta. Cada uno genera una página propia
 * (/sectores/<slug>) con sus metadatos, su JSON-LD y sus preguntas
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
 * Regla al editar: se describe lo que el sistema HACE en ese giro, nunca
 * resultados atribuidos a clientes concretos ni lo malo que le pasaría a quien
 * no contrate. Cualquier cifra que se añada debe venir de un proyecto real y
 * ser defendible.
 *
 * Campos de cada sector:
 *   slug, nombre, nombreCorto  identidad y rutas
 *   titulo, descripcion,       lo que se inyecta en <title>, <meta> y JSON-LD
 *   keywords
 *   titular, entradilla        encabezado visible de la página
 *   momentos[]                 lo que ocurre en ese giro con el sistema puesto
 *   soluciones[]               {titulo, detalle} de lo que se instala
 *   faq[]                      {q, a} propias del sector, con FAQPage schema
 */
export { SECTORES };

export const getSector = (slug) => SECTORES.find((s) => s.slug === slug);

/** Rutas que genera este módulo, para el router, el sitemap y el prerender. */
export const RUTAS_SECTORES = SECTORES.map((s) => `/sectores/${s.slug}`);

/** Los cuatro giros del enfoque —inmobiliarias, gimnasios, spas y salones de
 *  uñas— y los que se siguen atendiendo sin encabezar nada. */
export const SECTORES_PRINCIPALES = SECTORES.filter((s) => s.principal);
export const SECTORES_SECUNDARIOS = SECTORES.filter((s) => !s.principal);
