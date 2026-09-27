import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { useBloque } from '../../contenido';
import { SECTORES_PRINCIPALES, SECTORES_SECUNDARIOS } from '../../data/sectores';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import Enlace from '../common/Enlace';
import CtaServicio from '../common/CtaServicio';
import FOTOS from '../../data/fotos.json';

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
 *
 * Solo los cuatro giros del enfoque llevan tarjeta. Los demás se siguen
 * atendiendo y se nombran debajo, con enlace, sin competir por la atención.
 *
 * Cada tarjeta abre con la fotografía de su giro (la misma de su página, en
 * blanco y negro como el resto del sitio): se reconoce el negocio antes de
 * leer. La tarjeta entera lleva a la página; el enlace se estira sobre ella.
 */
const Verticales = () => {
    const { visible, titulo, entradilla } = useBloque('verticales');

    if (visible === false) return null;

    return (
        <section id="sectores" className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor">
                <EncabezadoSeccion titulo={titulo} entradilla={entradilla} />

                <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2">
                    {SECTORES_PRINCIPALES.map((sector) => {
                        const foto = FOTOS[sector.slug];
                        return (
                            <article
                                key={sector.slug}
                                className="giro-tarjeta tarjeta tarjeta-enlace group relative flex flex-col overflow-hidden"
                            >
                                {foto && (
                                    <div className="giro-tarjeta__foto">
                                        <img
                                            src={`/imagenes/${foto.archivo}-800.webp`}
                                            srcSet={`/imagenes/${foto.archivo}-800.webp 800w, /imagenes/${foto.archivo}-1600.webp 1600w`}
                                            sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
                                            alt={foto.alt}
                                            width="800"
                                            height="450"
                                            loading="lazy"
                                            decoding="async"
                                            style={{ objectPosition: foto.encuadre ?? 'center' }}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-1 flex-col p-6 md:p-7">
                                    <h3 className="text-[1rem] font-extrabold leading-snug tracking-tight text-white">
                                        {sector.titular}
                                    </h3>
                                    <p className="cuerpo mt-3 flex-1">{sector.entradilla}</p>

                                    <Enlace
                                        destino={`/sectores/${sector.slug}`}
                                        className="giro-tarjeta__enlace enlace mt-6 inline-flex min-h-[1.75rem] items-center gap-1.5 self-start py-1 text-[0.9375rem] font-bold"
                                    >
                                        Ver cómo funciona
                                        <ArrowUpRight size={15} aria-hidden="true" />
                                    </Enlace>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {SECTORES_SECUNDARIOS.length > 0 && (
                    <div className="mt-8">
                        <p className="cuerpo">También atendemos:</p>
                        <ul className="mt-2 flex flex-col gap-x-6 sm:flex-row sm:flex-wrap">
                            {SECTORES_SECUNDARIOS.map((sector) => (
                                <li key={sector.slug}>
                                    <Enlace
                                        destino={`/sectores/${sector.slug}`}
                                        className="enlace inline-flex min-h-[2.25rem] items-center text-[0.9375rem]"
                                    >
                                        {sector.titular}
                                    </Enlace>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <CtaServicio ubicacion="portada-giros" className="mt-12" />
            </div>
        </section>
    );
};

export default Verticales;
