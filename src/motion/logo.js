import icono from '../assets/logo/icono-diabolical-chatbot.svg?raw';

/*
 * Las piezas del logo, sacadas del archivo del logo y no copiadas a mano: si
 * el logo cambia, las escenas que lo construyen cambian con él.
 *
 * En el orden del archivo: el marco (blanco sobre el disco), la cabeza, el ojo
 * y la pupila. El disco es el círculo de 68 de radio que las contiene. Todo en
 * unidades del logo: un cuadrado de 136.
 */
const rutas = [...icono.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);

export const LOGO = {
    lado: 136,
    radio: 68,
    marco: rutas[0],
    cabeza: rutas[1],
    ojo: rutas[2],
    pupila: rutas[3],
    // Puntos de construcción: las puntas de los cuernos y el centro del ojo.
    cuernos: [
        [35.05, 26.34],
        [102.42, 25.43],
    ],
    centroOjo: [68.4, 72],
    radioOjo: 19.2,
};
