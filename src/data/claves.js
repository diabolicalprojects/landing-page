import CLAVES from './claves.json';

/*
 * Landings de frase clave.
 *
 * Cada frase clave que el negocio persigue tiene su propia página, con la frase
 * en la dirección y en el título: «Sitios web en Aguascalientes» vive en
 * /sitios-web-en-aguascalientes. Las que coinciden con un servicio principal
 * (páginas web, chatbots) son la landing de ese servicio; estas son las que no
 * tienen un servicio propio detrás.
 *
 * El texto de cada una es un bloque del contenido editable (`bloque`), y de
 * aquí salen también las rutas, el JSON-LD y los llms.txt del servidor.
 */
export { CLAVES };

export const getClave = (slug) => CLAVES.find((c) => c.slug === slug);
