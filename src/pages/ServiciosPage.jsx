import React from 'react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import EncabezadoSeccion from '../components/common/EncabezadoSeccion';
import TarjetaEscena from '../components/common/TarjetaEscena';
import CtaServicio from '../components/common/CtaServicio';
import { SERVICIOS_COMPLEMENTARIOS, SERVICIOS_PRINCIPALES, rutaServicio } from '../data/servicios';

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
            entradilla="Tres servicios principales (sitios web, chatbots y agendamiento automatizado) y ocho complementarios con la misma calidad. Cada uno tiene su página con lo que incluye y hasta dónde llega."
            bajada="Sitios web, chatbots y agendamiento automatizado, más ocho servicios complementarios con la misma calidad."
            cta={<CtaServicio ubicacion="servicios-hero" />}
            escena={{
                clave: 'nucleo',
                etiqueta: 'La marca de Diabolical en el centro, con los canales del negocio conectados alrededor.',
            }}
        />

        {/* Los principales, uno por fila: la escena a la izquierda y a la derecha
            qué resuelve y qué incluye. */}
        <section className="zona-clara seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    titulo="Sitios web, chatbots y agendamiento."
                    entradilla="El sitio atrae, el chatbot responde y la agenda confirma. Se pueden contratar por separado, pero rinden más como una sola pieza."
                />
                <ul className="mt-12 grid gap-4 md:mt-16">
                    {SERVICIOS_PRINCIPALES.map((servicio) => (
                        <li key={servicio.slug}>
                            <TarjetaEscena
                                ancha
                                nivel="h2"
                                escena={servicio.slug}
                                titulo={servicio.nombre}
                                texto={servicio.resumen}
                                incluye={servicio.incluye ?? []}
                                destino={rutaServicio(servicio.slug)}
                                enlace="Ver el servicio"
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* Los complementarios, cada uno con su escena. */}
        <section className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor">
                <EncabezadoSeccion
                    titulo="Ocho servicios complementarios."
                    entradilla="Con la misma calidad y el mismo alcance publicado que los tres principales. Se contratan solos o para completar el sitio web, el chatbot y la agenda."
                />
                <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                    {SERVICIOS_COMPLEMENTARIOS.map((servicio) => (
                        <li key={servicio.slug}>
                            <TarjetaEscena
                                nivel="h3"
                                escena={servicio.slug}
                                titulo={servicio.nombre}
                                texto={servicio.resumen}
                                incluye={(servicio.incluye ?? []).slice(0, 2)}
                                destino={rutaServicio(servicio.slug)}
                                enlace="Ver qué incluye"
                            />
                        </li>
                    ))}
                </ul>
                <CtaServicio ubicacion="servicios-complementarios" className="mt-12" />
            </div>
        </section>
    </Pagina>
);

export default ServiciosPage;
