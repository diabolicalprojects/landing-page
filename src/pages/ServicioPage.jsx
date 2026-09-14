import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

import Pagina, { Migas } from '../components/common/Pagina';
import Enlace from '../components/common/Enlace';
import MotionGrafico from '../motion/MotionGrafico';
import { hayEscena } from '../motion/escenas';
import { SERVICIOS, getServicio } from '../data/servicios';

/*
 * Página de un servicio.
 *
 * Trece páginas salidas de un solo componente y de src/data/servicios.json, que
 * es la misma fuente de la que server/schema.js construye el catálogo de
 * ofertas y server/llms.js la guía para motores de IA. Escribir trece páginas a
 * mano garantizaría que en unos meses dijeran cosas distintas.
 *
 * El alcance («hasta dónde llega») va en la página, no en letra pequeña: es la
 * información que hace que un motor generativo pueda recomendar con criterio, y
 * la que evita una conversación incómoda a los quince días de firmar.
 */
const ServicioPage = ({ slug }) => {
    const servicio = getServicio(slug);
    if (!servicio) return null;

    const hermanos = SERVICIOS.filter(
        (s) => s.categoria === servicio.categoria && s.slug !== servicio.slug
    );

    return (
        <Pagina>
            <Migas
                ruta={[
                    { texto: 'Servicios', destino: '/servicios' },
                    { texto: servicio.nombre },
                ]}
            />

            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
                        <header className="lg:col-span-6">
                            <p className="insignia">{servicio.categoria}</p>
                            <h1 className="titular-xl mt-5">{servicio.nombre}</h1>
                            <p className="cuerpo-l mt-6">{servicio.resumen}</p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Enlace destino="/contacto" className="boton boton-acento">
                                    Solicitar auditoría gratuita
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Enlace>
                                <Enlace destino="/servicios" className="boton boton-fantasma">
                                    Ver todos los servicios
                                </Enlace>
                            </div>
                        </header>

                        <div className="lg:col-span-6">
                            {hayEscena(servicio.slug) && (
                                <MotionGrafico
                                    escena={servicio.slug}
                                    prioridad
                                    etiqueta={`Ilustración animada del mecanismo de ${servicio.nombre.toLowerCase()}.`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="zona-clara seccion">
                <div className="contenedor">
                    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-5">
                            <h2 className="titular-l">
                                En qué <span className="titular-apagado">consiste.</span>
                            </h2>
                            <p className="cuerpo-l mt-6">{servicio.detalle}</p>
                        </div>

                        <div className="lg:col-span-7">
                            <h3 className="etiqueta" style={{ color: 'var(--texto-3)' }}>
                                Qué incluye
                            </h3>
                            <ul className="mt-5">
                                {(servicio.incluye ?? []).map((punto) => (
                                    <li
                                        key={punto}
                                        className="flex items-start gap-4 py-4"
                                        style={{ borderTop: '1px solid var(--linea)' }}
                                    >
                                        <span
                                            className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full"
                                            style={{ background: 'var(--tinta)' }}
                                            aria-hidden="true"
                                        >
                                            <Check size={13} style={{ color: 'var(--papel)' }} />
                                        </span>
                                        <span className="cuerpo max-w-none">{punto}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="zona-oscura seccion">
                <div className="contenedor">
                    <div className="tarjeta max-w-3xl p-7 md:p-10">
                        <h2 className="etiqueta text-white/55">Hasta dónde llega</h2>
                        <p className="cuerpo-destacado mt-4 max-w-none">{servicio.limite}</p>
                    </div>

                    {hermanos.length > 0 && (
                        <div className="mt-16">
                            <h2 className="titular-m">
                                También en {servicio.categoria.toLowerCase()}
                            </h2>
                            <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {hermanos.map((otro) => (
                                    <li key={otro.slug}>
                                        <Enlace
                                            destino={`/servicios/${otro.slug}`}
                                            className="tarjeta tarjeta-enlace flex h-full flex-col p-5"
                                        >
                                            <span className="text-[0.9375rem] font-extrabold tracking-tight text-white">
                                                {otro.nombre}
                                            </span>
                                            <span className="cuerpo mt-2 text-[0.9375rem]">
                                                {otro.resumen}
                                            </span>
                                        </Enlace>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </Pagina>
    );
};

export default ServicioPage;
