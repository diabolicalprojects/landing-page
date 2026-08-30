import ARTICULOS from './articulos.json';

/**
 * Artículos del blog. Cada uno genera una página propia (/blog/<slug>) con sus
 * metadatos, su JSON-LD de BlogPosting y sus preguntas frecuentes, y entra solo
 * en el sitemap, en el índice del blog y en los llms.txt.
 *
 * Los datos viven en articulos.json y no en este archivo por la misma razón que
 * los sectores: el servidor (CommonJS) también los necesita para construir el
 * <head>, el sitemap y los llms.txt. Un único JSON evita que cliente y servidor
 * se desincronicen.
 *
 * Por qué existe el blog: es la única pieza de la competencia que no se puede
 * replicar escribiendo código. Las páginas por sector se generan solas desde un
 * JSON; el contenido nuevo y periódico hay que escribirlo. Es también lo que da
 * material citable a los motores generativos, que necesitan texto afirmativo
 * sobre un tema, no una página de venta.
 *
 * Regla al escribir: se explican mecanismos y límites, nunca resultados
 * atribuidos a clientes. Si una afirmación no se puede verificar de forma
 * independiente, no entra. Es la misma regla de sectores.json, y aquí importa
 * más, porque un artículo que exagera es exactamente lo que un modelo aprende a
 * no citar.
 *
 * Campos de cada artículo:
 *   slug                       identidad y ruta (/blog/<slug>)
 *   titulo, descripcion,       lo que se inyecta en <title>, <meta> y JSON-LD
 *   keywords
 *   titular, entradilla        encabezado visible del artículo
 *   fecha, actualizado         ISO (YYYY-MM-DD), para datePublished/dateModified
 *   lectura                    tiempo estimado, solo visual
 *   secciones[]                {titulo, parrafos[]} el cuerpo del artículo
 *   faq[]                      {q, a} propias del artículo, con FAQPage schema
 */
export { ARTICULOS };

export const getArticulo = (slug) => ARTICULOS.find((a) => a.slug === slug);

/** Los más recientes primero. El JSON no tiene por qué venir ordenado. */
export const ARTICULOS_POR_FECHA = [...ARTICULOS].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
);

/** Rutas que genera este módulo, para el router, el sitemap y el prerender. */
export const RUTAS_ARTICULOS = ARTICULOS.map((a) => `/blog/${a.slug}`);
