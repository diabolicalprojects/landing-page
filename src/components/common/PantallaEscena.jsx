import React from 'react';

import MotionGrafico from '../../motion/MotionGrafico';
import { ESCENAS } from '../../motion/escenas';

/**
 * Una escena animada metida en una pantalla negra, para llevarla dentro de una
 * tarjeta.
 *
 * Las escenas se dibujan en blanco sobre transparente: sobre una tarjeta clara
 * no se verían. En lugar de pintar una segunda versión invertida de cada una,
 * se les pone su fondo: una franja oscura a sangre en la cabecera de la
 * tarjeta, que es además el mismo gesto que la tarjeta negra incrustada del
 * cierre.
 *
 * `decorativa` la esconde del lector de pantalla. Va cuando la tarjeta entera
 * es un enlace: el nombre del enlace tiene que ser el del tipo de sitio, no el
 * texto alternativo de la ilustración pegado delante.
 */
const PantallaEscena = ({ escena, etiqueta, decorativa = false }) => {
    const definicion = ESCENAS[escena];
    if (!definicion) return null;

    return (
        <div
            className="pantalla-escena zona-oscura px-3 pt-3 md:px-4 md:pt-4"
            aria-hidden={decorativa ? 'true' : undefined}
        >
            <MotionGrafico escena={escena} etiqueta={etiqueta ?? definicion.descripcion} />
        </div>
    );
};

export default PantallaEscena;
