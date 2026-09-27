import React from 'react';

import icono from '../../assets/logo/icono-diabolical-chatbot.svg?raw';

/*
 * El logo de la portada: se dibuja y luego respira.
 *
 *   0,1 s   el anillo y el contorno de la cabeza se trazan en blanco
 *   1,1 s   el disco se llena y la cabeza queda en negro, como en el logo
 *   1,6 s   se abre el ojo
 *   después un halo que late despacio, una onda que sale del disco y, de vez
 *           en cuando, un parpadeo
 *
 * Es el mismo archivo del logo, no un redibujo: se incrusta tal cual y la
 * animación va en CSS (index.css, «HERO DE LA PORTADA») sobre sus piezas. El
 * estado final es el logo exacto. Con `pathLength="1"` el trazo se anima sin
 * medir cada contorno.
 *
 * Todo en CSS a propósito: llega con la hoja de estilos, antes que el
 * JavaScript, y el HTML que sirve el servidor ya trae el logo animándose.
 * Quien pide menos movimiento ve el logo terminado, sin bucles.
 */
const marcado = icono
    .replace(/ width="136" height="136"/, ' focusable="false"')
    .replace(/<path /g, '<path pathLength="1" ');

const LogoAnimado = () => (
    <div className="logo-animado" aria-hidden="true">
        <span className="logo-animado__halo" />
        <span className="logo-animado__onda" />
        <svg className="logo-animado__anillo" viewBox="0 0 100 100" focusable="false">
            <circle cx="50" cy="50" r="48.5" pathLength="1" />
        </svg>
        <span className="logo-animado__icono" dangerouslySetInnerHTML={{ __html: marcado }} />
    </div>
);

export default LogoAnimado;
