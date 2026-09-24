import React from 'react';

import { SERVICIOS_POR_CATEGORIA, rutaServicio } from '../../data/servicios';
import { useBloque } from '../../contenido';
import EncabezadoSeccion from '../common/EncabezadoSeccion';
import ServiciosPrincipales from '../common/ServiciosPrincipales';
import CtaServicio from '../common/CtaServicio';
import Enlace from '../common/Enlace';

/*
 * El catálogo entero en la portada: primero los tres servicios principales,
 * cada uno con su escena y su landing, y debajo los complementarios agrupados
 * por el recorrido real de un cliente —que le encuentren, que le elijan, que
 * le atiendan, que le recuerden y saber si funciona—.
 *
 * Sale de src/data/servicios.json, que es también de donde server/schema.js
 * construye el OfferCatalog y server/llms.js la guía para motores de IA. Una
 * sola fuente: lo que se ve y lo que se marca no pueden divergir.
 *
 * Aquí va el resumen; el límite de cada servicio vive en su página para que la
 * portada se barra de un vistazo. Cada nombre enlaza a esa página: el texto del
 * enlace es lo que le dice a un buscador de qué trata el destino. El límite no es opcional, es parte de la
 * oferta — por eso el enlace de abajo lo dice con esas palabras.
 */
const Servicios = () => {
    const { visible, titulo, entradilla } = useBloque('servicios');

    if (visible === false) return null;

    return (
        <section id="servicios" className="zona-oscura zona-oscura-1 seccion">
            <div className="contenedor">
                <EncabezadoSeccion titulo={titulo} entradilla={entradilla} />

                <div className="mt-12 md:mt-16">
                    <ServiciosPrincipales />
                </div>

                <h3 className="titular-m mt-16 md:mt-20">Servicios complementarios</h3>
                <p className="cuerpo mt-3">
                    Misma calidad y mismo alcance publicado. Se contratan solos o para completar
                    lo principal.
                </p>

                <div className="mt-10 space-y-12 md:space-y-14">
                    {SERVICIOS_POR_CATEGORIA.map((grupo) => (
                        <div key={grupo.categoria}>
                            <h4 className="etiqueta border-b border-white/[0.09] pb-3 text-white/70">
                                {grupo.categoria}
                            </h4>

                            <div className="mt-6 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                                {grupo.servicios.map((servicio) => (
                                    <article key={servicio.slug}>
                                        <p className="cuerpo-destacado m-0 font-extrabold leading-tight tracking-tight text-white">
                                            <Enlace
                                                destino={rutaServicio(servicio.slug)}
                                                className="enlace inline-flex min-h-[1.75rem] items-center"
                                            >
                                                {servicio.nombre}
                                            </Enlace>
                                        </p>
                                        <p className="cuerpo mt-2">{servicio.resumen}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <CtaServicio
                    secundario={{ texto: 'Ver todos los servicios', destino: '/servicios' }}
                    ubicacion="portada-servicios"
                    className="mt-14"
                />
            </div>
        </section>
    );
};

export default Servicios;
