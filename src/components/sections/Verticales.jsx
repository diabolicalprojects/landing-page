import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import { SECTORES } from '../../data/sectores';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import Enlace from '../common/Enlace';

/*
 * Los sectores en la portada.
 *
 * Salen de src/data/sectores.json y no de un bloque editable propio: eran dos
 * listas del mismo contenido, y dos listas del mismo contenido siempre acaban
 * diciendo cosas distintas. El texto de cada tarjeta es el mismo que preside su
 * página.
 *
 * Cada tarjeta lleva el titular completo —«Inteligencia artificial para X»—
 * porque ese es el enlace interno que le dice a un buscador de qué trata la
 * página de destino.
 */
const Verticales = () => {
    const { visible, insignia, titulo, entradilla } = useBloque('verticales');

    if (visible === false) return null;

    return (
        <section id="sectores" className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    id="sectores"
                    insignia={insignia}
                    titulo={titulo}
                    entradilla={entradilla}
                />

                <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
                    {SECTORES.map((sector) => (
                        <article
                            key={sector.slug}
                            className="tarjeta tarjeta-enlace flex flex-col p-6 md:p-7"
                        >
                            <h3 className="text-[1rem] font-extrabold leading-snug tracking-tight text-white">
                                {sector.titular}
                            </h3>
                            <p className="cuerpo mt-3 flex-1">{sector.entradilla}</p>

                            <Enlace
                                destino={`/sectores/${sector.slug}`}
                                className="enlace mt-6 inline-flex min-h-[1.75rem] items-center gap-1.5 self-start py-1 text-[0.9375rem] font-bold"
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
