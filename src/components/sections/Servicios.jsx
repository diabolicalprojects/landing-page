import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SERVICIOS_POR_CATEGORIA } from '../../data/servicios';

/*
 * El catálogo completo en la portada, agrupado por el recorrido real de un
 * cliente y no por tipo de disciplina: que te encuentren, que te elijan, que
 * los atiendas, que te recuerden, y saber si funciona.
 *
 * Sustituye a la sección Modulos, que solo cubría la automatización de la
 * atención — la cuarta parte del ciclo. Los cuatro módulos siguen vivos dentro
 * de la categoría "Atención y venta".
 *
 * Cada tarjeta muestra el resumen; el límite y el detalle viven en /servicios,
 * para que la portada se pueda barrer de un vistazo sin perder la disciplina
 * de publicar siempre dónde se detiene cada servicio.
 */
const Servicios = () => (
    <section id="servicios" className="seccion bg-black">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    Todo el ciclo, no solo el chatbot
                </h2>
                <p className="text-white/60 text-base leading-relaxed font-light">
                    Que te encuentren, que te elijan, que los atiendas sin perder a nadie, y
                    saber cuál de esas cosas está fallando. Cada servicio dice también dónde
                    se detiene.
                </p>
            </div>

            <div className="space-y-12 md:space-y-16">
                {SERVICIOS_POR_CATEGORIA.map((grupo) => (
                    <div key={grupo.categoria}>
                        <h3 className="etiqueta text-white/55 mb-5 md:mb-6 pb-3 border-b border-white/10">
                            {grupo.categoria}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
                            {grupo.servicios.map((servicio) => (
                                <article key={servicio.slug}>
                                    <h4 className="text-base md:text-lg font-title uppercase tracking-tight text-white leading-tight mb-2">
                                        {servicio.nombre}
                                    </h4>
                                    <p className="text-sm text-white/60 leading-relaxed font-light">
                                        {servicio.resumen}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Link
                to="/servicios"
                className="accion inline-flex items-center gap-2 mt-12 py-3 text-sm text-white/70 hover:text-white"
            >
                Ver qué incluye cada uno y dónde se detiene <ArrowRight size={15} aria-hidden="true" />
            </Link>
        </div>
    </section>
);

export default Servicios;
