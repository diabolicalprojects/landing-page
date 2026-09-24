import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import MotionGrafico from '../motion/MotionGrafico';
import { SERVICIOS_POR_CATEGORIA, rutaServicio } from '../data/servicios';

/*
 * Índice de servicios.
 *
 * Agrupados por el recorrido real de un cliente y no por disciplina: que le
 * encuentren, que le elijan, que le atiendan sin perder a nadie, que le
 * recuerden, y saber si funciona.
 *
 * Cada servicio enlaza a su propia página. El resumen y el alcance salen de
 * src/data/servicios.json, la misma fuente de la que server/schema.js construye
 * el catálogo de ofertas y server/llms.js la guía para motores de IA.
 */
const ServiciosPage = () => (
    <Pagina>
        <Migas ruta={[{ texto: 'Servicios' }]} />

        <section className="zona-oscura seccion">
            <div className="contenedor">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
                    <header className="lg:col-span-7">
                        <p className="insignia">Catálogo</p>
                        <h1 className="titular-xl mt-5">
                            Servicios de inteligencia artificial{' '}
                            <span className="titular-apagado">para negocios en Aguascalientes.</span>
                        </h1>
                        <p className="cuerpo-l mt-7">
                            Trece servicios repartidos en las cinco etapas del recorrido de un
                            cliente. Cada uno tiene su página con lo que incluye y hasta dónde
                            llega, porque conviene saberlo antes de contratar.
                        </p>

                        <Enlace destino="/contacto" className="boton boton-acento mt-9">
                            Solicitar auditoría gratuita
                            <ArrowRight size={16} aria-hidden="true" />
                        </Enlace>
                    </header>

                    <div className="lg:col-span-5">
                        <MotionGrafico
                            escena="nucleo"
                            prioridad
                            etiqueta="La marca de Diabolical en el centro, con los canales del negocio conectados alrededor."
                        />
                    </div>
                </div>
            </div>
        </section>

        <section className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor space-y-14 md:space-y-20">
                {SERVICIOS_POR_CATEGORIA.map((grupo, indice) => (
                    <div key={grupo.categoria}>
                        <h2 className="flex items-baseline gap-3 border-b border-white/[0.09] pb-3">
                            <span className="etiqueta-mono text-white/55">
                                {String(indice + 1).padStart(2, '0')}
                            </span>
                            <span className="etiqueta text-white/70">{grupo.categoria}</span>
                            <span className="etiqueta-mono ml-auto text-white/55">
                                {grupo.servicios.length}
                            </span>
                        </h2>

                        <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {grupo.servicios.map((servicio) => (
                                <li key={servicio.slug}>
                                    <Enlace
                                        destino={rutaServicio(servicio.slug)}
                                        className="tarjeta tarjeta-enlace flex h-full flex-col p-6"
                                    >
                                        <h3 className="text-[1rem] font-extrabold leading-tight tracking-tight text-white">
                                            {servicio.nombre}
                                        </h3>
                                        <p className="cuerpo mt-2.5 flex-1">{servicio.resumen}</p>
                                        <span className="etiqueta mt-5 inline-flex items-center gap-1.5 text-white/55">
                                            Ver el detalle
                                            <ArrowUpRight size={13} aria-hidden="true" />
                                        </span>
                                    </Enlace>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    </Pagina>
);

export default ServiciosPage;
