import React from 'react';

/**
 * Encabezado de sección: titular y, si hace falta, entradilla.
 *
 * Ya no lleva etiqueta encima. Una etiqueta sobre cada titular es el ritmo de
 * las páginas hechas en serie, y el titular ya dice de qué trata la sección.
 * La única etiqueta del sitio está en el hero de la portada.
 *
 * Alineado a la izquierda. Centrar un encabezado obliga al ojo a volver al
 * centro en cada línea y rompe la columna de lectura que sostiene la página.
 */
const EncabezadoSeccion = ({ titulo, apagado, entradilla, className = '' }) => (
    <header className={`max-w-3xl ${className}`}>
        <h2 className="titular-l">
            {titulo}
            {apagado && <span className="titular-apagado"> {apagado}</span>}
        </h2>
        {entradilla && <p className="cuerpo-l mt-5">{entradilla}</p>}
    </header>
);

export default EncabezadoSeccion;
