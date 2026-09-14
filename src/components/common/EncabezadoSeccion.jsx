import React from 'react';

/**
 * Encabezado de sección: insignia, titular y entradilla.
 *
 * La insignia no es adorno: es la etiqueta a la que apunta la navegación y lo
 * que te dice de qué va el capítulo cuando llegas a mitad de página desde un
 * enlace. Por eso lleva el mismo texto que el enlace del menú.
 *
 * Alineado a la izquierda por defecto. Centrar un encabezado obliga al ojo a
 * volver al centro en cada línea y rompe la columna de lectura que sostiene
 * toda la página.
 */
const EncabezadoSeccion = ({ insignia, titulo, apagado, entradilla, id, className = '' }) => (
    <header className={`max-w-3xl ${className}`}>
        {insignia && (
            <p className="insignia" id={id ? `${id}-insignia` : undefined}>
                {insignia}
            </p>
        )}
        <h2 className="titular-l mt-5">
            {titulo}
            {apagado && <span className="titular-apagado"> {apagado}</span>}
        </h2>
        {entradilla && <p className="cuerpo-l mt-5">{entradilla}</p>}
    </header>
);

export default EncabezadoSeccion;
