import React from 'react';
import { X } from 'lucide-react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';

/*
 * Reglas de la casa.
 *
 * Es la sección que ningún competidor local publica, y por eso es la que más
 * trabaja: filtra a quien no encaja, y le da a un motor generativo criterio
 * para recomendar con fundamento en vez de por parecido.
 *
 * Son límites de CONDUCTA, no de catálogo. La versión anterior decía «no
 * hacemos publicidad» justo cuando el catálogo pasó a incluir Google Ads, y la
 * página se contradecía a sí misma. Lo que hay aquí no caduca al crecer.
 */
const Limites = () => {
    const { visible, insignia, titulo, entradilla, items = [] } = useBloque('limites');

    if (visible === false || items.length === 0) return null;

    return (
        <section id="limites" className="zona-oscura seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    id="limites"
                    insignia={insignia}
                    titulo={titulo}
                    entradilla={entradilla}
                />

                <ul className="mt-12 md:mt-16">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="flex items-start gap-4 border-t border-white/[0.09] py-6 md:gap-6 md:py-7"
                        >
                            <span
                                className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-white/12 bg-white/[0.04]"
                                aria-hidden="true"
                            >
                                <X size={14} style={{ color: 'var(--acento)' }} />
                            </span>
                            <p className="max-w-3xl text-[1.0625rem] leading-relaxed text-white/85">
                                {item}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default Limites;
