import React from 'react';

import FOTOS from '../../data/fotos.json';

/*
 * Una fotografía de banco gratuito, servida desde el propio sitio.
 *
 * Las escenas animadas siguen siendo el centro visual: la foto acompaña, no
 * sustituye. Por eso va después del hero y no dentro de él, y en blanco y
 * negro, que es como las escenas y el resto del sitio.
 *
 * Todas salen de src/data/fotos.json: el archivo, el texto alternativo, el
 * autor y la licencia. Se sirven desde /imagenes (la CSP no carga imágenes de
 * otros dominios) en dos anchos, y el navegador elige el que le toca.
 *
 * El crédito no se muestra bajo la foto (la licencia de Unsplash no lo exige),
 * pero viaja en el JSON-LD de la página como ImageObject con autor y licencia
 * (server/schema.js, imagenDe), que es donde Google lo lee.
 */
const Fotografia = ({ clave, prioridad = false, proporcion = '21 / 9', className = '' }) => {
    const foto = FOTOS[clave];
    if (!foto) return null;

    return (
        <figure className={className}>
            {/* La proporción va en una variable y no fija en el estilo: el hero
                móvil de los artículos la cambia para que la foto sea su banner. */}
            <div className="foto-marco" style={{ '--proporcion': proporcion }}>
                <img
                    src={`/imagenes/${foto.archivo}-1600.webp`}
                    srcSet={`/imagenes/${foto.archivo}-800.webp 800w, /imagenes/${foto.archivo}-1600.webp 1600w`}
                    sizes="(min-width: 1280px) 1160px, 100vw"
                    alt={foto.alt}
                    width="1600"
                    height="900"
                    loading={prioridad ? 'eager' : 'lazy'}
                    fetchPriority={prioridad ? 'high' : undefined}
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: foto.encuadre ?? 'center' }}
                />
            </div>
        </figure>
    );
};

export default Fotografia;
