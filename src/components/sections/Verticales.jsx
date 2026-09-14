import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import Enlace from '../common/Enlace';

/*
 * Por giro.
 *
 * El gancho de cada tarjeta es la escena concreta en la que ese negocio pierde
 * al cliente —las manos en un tinte con el teléfono sonando, el lead que
 * pregunta a las once de la noche— y no una lista de beneficios. Quien se
 * reconoce en la escena ya no necesita que le expliquen el producto.
 *
 * Los tres puntos de abajo son el alcance, no promesas: dicen qué hace el
 * sistema, nunca cuánto mejora.
 */
const Verticales = () => {
    const { visible, insignia, titulo, entradilla, items = [] } = useBloque('verticales');

    if (visible === false || items.length === 0) return null;

    return (
        <section id="verticales" className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    id="verticales"
                    insignia={insignia}
                    titulo={titulo}
                    entradilla={entradilla}
                />

                <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <article
                            key={item.id}
                            className="tarjeta tarjeta-enlace flex flex-col p-6 md:p-7"
                        >
                            <h3 className="text-lg font-extrabold tracking-tight text-white">
                                {item.nombre}
                            </h3>

                            <p
                                className="mt-4 text-[0.9375rem] font-semibold leading-snug"
                                style={{ color: 'var(--acento)' }}
                            >
                                {item.gancho}
                            </p>

                            <p className="cuerpo mt-3 flex-1">{item.texto}</p>

                            <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
                                {(item.puntos ?? []).map((punto) => (
                                    <li
                                        key={punto}
                                        className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-white/60"
                                    >
                                        <span
                                            className="mt-1.5 block h-1 w-1 flex-none rounded-full"
                                            style={{ background: 'var(--acento)' }}
                                            aria-hidden="true"
                                        />
                                        {punto}
                                    </li>
                                ))}
                            </ul>

                            <Enlace
                                destino={item.destino}
                                className="enlace mt-6 inline-flex min-h-[1.75rem] items-center gap-1.5 self-start py-1 text-sm font-bold"
                            >
                                Ver el detalle
                                <ArrowUpRight size={15} aria-hidden="true" />
                            </Enlace>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Verticales;
