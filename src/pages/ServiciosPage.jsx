import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import Enlace from '../components/common/Enlace';
import EncabezadoSeccion from '../components/common/EncabezadoSeccion';
import ServiciosPrincipales from '../components/common/ServiciosPrincipales';
import CtaServicio from '../components/common/CtaServicio';
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
        <HeroPagina
            migas={[{ texto: 'Servicios' }]}
            largo
            titulo={
                <>
                    Servicios de inteligencia artificial{' '}
                    <span className="titular-apagado">para negocios en Aguascalientes.</span>
                </>
            }
            entradilla="Tres servicios principales (sitios web, chatbots y agendamiento automatizado) y diez complementarios con la misma calidad. Cada uno tiene su página con lo que incluye y hasta dónde llega."
            bajada="Sitios web, chatbots y agendamiento automatizado, más diez servicios complementarios con la misma calidad."
            cta={<CtaServicio ubicacion="servicios-hero" />}
            escena={{
                clave: 'nucleo',
                etiqueta: 'La marca de Diabolical en el centro, con los canales del negocio conectados alrededor.',
            }}
        />

        <section className="zona-clara seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    titulo="Sitios web, chatbots y agendamiento."
                    entradilla="El sitio atrae, el chatbot responde y la agenda confirma. Se pueden contratar por separado, pero rinden más como una sola pieza."
                />
                <div className="mt-12 md:mt-16">
                    <ServiciosPrincipales nivel="h2" />
                </div>
            </div>
        </section>

        <section className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor space-y-14 md:space-y-20">
                <EncabezadoSeccion titulo="Diez servicios complementarios." />
                {SERVICIOS_POR_CATEGORIA.map((grupo) => (
                    <div key={grupo.categoria}>
                        <h3 className="etiqueta border-b border-white/[0.09] pb-3 text-white/70">
                            {grupo.categoria}
                        </h3>

                        <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {grupo.servicios.map((servicio) => (
                                <li key={servicio.slug}>
                                    <Enlace
                                        destino={rutaServicio(servicio.slug)}
                                        className="tarjeta tarjeta-enlace flex h-full flex-col p-6"
                                    >
                                        <h4 className="text-[1rem] font-extrabold leading-tight tracking-tight text-white">
                                            {servicio.nombre}
                                        </h4>
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
                <CtaServicio ubicacion="servicios-complementarios" />
            </div>
        </section>
    </Pagina>
);

export default ServiciosPage;
