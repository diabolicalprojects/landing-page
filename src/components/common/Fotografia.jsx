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
 * El crédito va visible aunque la licencia de Unsplash no lo exige: cuesta una
 * línea y es lo correcto con quien hizo la foto.
 */
const Fotografia = ({ clave, prioridad = false, proporcion = '21 / 9', className = '' }) => {
    const foto = FOTOS[clave];
    if (!foto) return null;

    return (
        <figure className={className}>
            <div
                className="overflow-hidden border"
                style={{ borderRadius: 'var(--radio)', borderColor: 'var(--linea)', aspectRatio: proporcion }}
            >
                <img
                    src={`/imagenes/${foto.archivo}-1600.webp`}
                    srcSet={`/imagenes/${foto.archivo}-800.webp 800w, /imagenes/${foto.archivo}-1600.webp 1600w`}
                    sizes="(min-width: 1280px) 1160px, calc(100vw - 2.5rem)"
                    alt={foto.alt}
                    width="1600"
                    height="900"
                    loading={prioridad ? 'eager' : 'lazy'}
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: foto.encuadre ?? 'center' }}
                />
            </div>
            <figcaption className="etiqueta-mono mt-3" style={{ color: 'var(--texto-3)' }}>
                Foto: {foto.autor} · Unsplash
            </figcaption>
        </figure>
    );
};

export default Fotografia;
