import React from 'react';

import { useBloque } from '../../contenido';
import { CONTACT_EMAIL } from '../../config';
import Enlace from './Enlace';
import logoHorizontalBlanco from '../../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';

/*
 * Pie.
 *
 * La marca a tamaño gigante, recortada por el borde inferior: es el ancla
 * visual del final de la página y lo último que queda en la retina.
 *
 * La entrada por GSAP que tenía antes está retirada a propósito. Escondía el
 * pie entero con `.js .footer-content > * { opacity: 0 }` y lo devolvía al
 * llegar el scroll; si el script tardaba o fallaba, el pie —con los enlaces a
 * blog, servicios y privacidad— se quedaba invisible. Un pie no necesita
 * animación de entrada que valga ese riesgo.
 */
const Footer = () => {
    const { visible, lema, columnas = [], legal } = useBloque('footer');
    const anio = new Date().getFullYear();

    if (visible === false) return null;

    return (
        <footer className="zona-oscura relative overflow-hidden border-t border-white/10 pt-16 md:pt-20">
            <div className="contenedor relative">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4">
                        <img
                            src={logoHorizontalBlanco}
                            alt="Diabolical"
                            width="150"
                            height="30"
                            className="h-7 opacity-90"
                        />
                        <p className="cuerpo mt-5 max-w-xs">{lema}</p>

                        <ul className="mt-7 space-y-2 text-sm">
                            <li>
                                <Enlace destino="whatsapp" className="enlace inline-flex min-h-[1.75rem] items-center py-1">
                                    WhatsApp +52 449 513 6907
                                </Enlace>
                            </li>
                            <li>
                                <a href={`mailto:${CONTACT_EMAIL}`} className="enlace inline-flex min-h-[1.75rem] items-center py-1">
                                    {CONTACT_EMAIL}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {columnas.map((columna) => (
                        <nav
                            key={columna.id ?? columna.titulo}
                            className="lg:col-span-2 xl:col-span-2"
                            aria-label={columna.titulo}
                        >
                            <h2 className="etiqueta text-white/55">{columna.titulo}</h2>
                            <ul className="mt-4 space-y-2.5">
                                {(columna.enlaces ?? []).map((enlace) => (
                                    <li key={enlace.texto}>
                                        <Enlace
                                            destino={enlace.destino}
                                            className="inline-flex min-h-[1.75rem] items-center py-1 text-sm text-white/65 transition-colors duration-150 hover:text-white"
                                        >
                                            {enlace.texto}
                                        </Enlace>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-14 flex flex-col gap-3 border-t border-white/10 py-7 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
                    <p>
                        {legal} · © {anio}
                    </p>
                    <p className="etiqueta-mono">
                        Hecho por diablillos en Aguascalientes
                    </p>
                </div>
            </div>

            {/* La marca a escala de rótulo, recortada abajo. No lleva texto
                alternativo ni sale del flujo de lectura: es superficie, no
                contenido, y el nombre ya está en el logotipo de arriba. */}
            <p
                aria-hidden="true"
                className="rotulo font-title pointer-events-none select-none text-center text-white/[0.045]"
            >
                Diabolical
            </p>
        </footer>
    );
};

export default Footer;
