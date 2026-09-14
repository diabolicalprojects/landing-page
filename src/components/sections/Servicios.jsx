import React from 'react';
import { ArrowRight } from 'lucide-react';

import { SERVICIOS_POR_CATEGORIA } from '../../data/servicios';
import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import Enlace from '../common/Enlace';

/*
 * El catálogo entero en la portada, agrupado por el recorrido real de un
 * cliente y no por disciplina: que te encuentren, que te elijan, que los
 * atiendas sin perder a nadie, que te recuerden, y saber si funciona.
 *
 * Sale de src/data/servicios.json, que es también de donde server/schema.js
 * construye el OfferCatalog y server/llms.js la guía para motores de IA. Una
 * sola fuente: lo que se ve y lo que se marca no pueden divergir.
 *
 * Aquí va el resumen; el límite de cada servicio vive en /servicios para que la
 * portada se barra de un vistazo. El límite no es opcional, es parte de la
 * oferta — por eso el enlace de abajo lo dice con esas palabras.
 */
const Servicios = () => {
    const { visible, insignia, titulo, entradilla, cta } = useBloque('servicios');

    if (visible === false) return null;

    return (
        <section id="servicios" className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    id="servicios"
                    insignia={insignia}
                    titulo={titulo}
                    entradilla={entradilla}
                />

                <div className="mt-12 space-y-12 md:mt-16 md:space-y-14">
                    {SERVICIOS_POR_CATEGORIA.map((grupo, indice) => (
                        <div key={grupo.categoria}>
                            <h3 className="flex items-baseline gap-3 border-b border-white/[0.09] pb-3">
                                <span
                                    className="etiqueta-mono"
                                    style={{ color: 'var(--acento)' }}
                                >
                                    {String(indice + 1).padStart(2, '0')}
                                </span>
                                <span className="etiqueta text-white/70">{grupo.categoria}</span>
                                <span className="etiqueta-mono ml-auto text-white/55">
                                    {grupo.servicios.length}
                                </span>
                            </h3>

                            <div className="mt-6 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                                {grupo.servicios.map((servicio) => (
                                    <article key={servicio.slug}>
                                        <h4 className="cuerpo-destacado font-extrabold leading-tight tracking-tight text-white">
                                            {servicio.nombre}
                                        </h4>
                                        <p className="cuerpo mt-2">{servicio.resumen}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Enlace
                    destino={cta?.destino}
                    className="boton boton-fantasma mt-12 inline-flex"
                >
                    {cta?.texto}
                    <ArrowRight size={16} aria-hidden="true" />
                </Enlace>
            </div>
        </section>
    );
};

export default Servicios;
