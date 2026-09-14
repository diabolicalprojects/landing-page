import { loadFont as cargarJakarta } from '@remotion/google-fonts/PlusJakartaSans';
import { continueRender, delayRender, staticFile } from 'remotion';

/*
 * Tipografías de la pieza.
 *
 * CODE Bold es la cara de la marca y vive en el directorio público del SITIO
 * (ver remotion.config.mjs), así que el video usa exactamente el mismo fichero
 * que la web en lugar de una copia que acabaría desfasada.
 *
 * Plus Jakarta Sans llega por @remotion/google-fonts, que la trae empaquetada
 * en lugar de pedirla a un CDN: un render que dependa de la red sale con la
 * tipografía de sistema el día que falle, y eso no se nota hasta que el
 * anuncio ya está publicado.
 *
 * delayRender frena el render hasta que la fuente está lista. Sin esto los
 * primeros fotogramas salen con la tipografía de respaldo y el salto se ve.
 */

export const { fontFamily: JAKARTA } = cargarJakarta();

const espera = delayRender('Cargando CODE Bold');

const codeBold = new FontFace(
    'CODE Bold',
    `url(${staticFile('fonts/CODE-Bold.otf')}) format('opentype')`
);

codeBold
    .load()
    .then((cargada) => {
        document.fonts.add(cargada);
        continueRender(espera);
    })
    .catch((error) => {
        // Que falte la fuente no puede abortar el render entero: se avisa y la
        // pieza sale con la de respaldo, que es mejor que no salir.
        console.warn('[video] No se pudo cargar CODE Bold:', error);
        continueRender(espera);
    });
