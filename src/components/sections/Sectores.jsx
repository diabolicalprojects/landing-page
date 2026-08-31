import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SECTORES } from '../../data/sectores';

/*
 * Índice de sectores como filas, no como tarjetas decorativas. Cada fila es
 * una entrada real a la página del sector — el activo SEO más valioso del
 * sitio — con el dolor del sector como gancho, sacado de la misma fuente
 * única (sectores.json) que genera esas páginas.
 *
 * Un test comprueba que la portada enlaza a las cuatro: si se toca esto, que
 * los enlaces sobrevivan.
 */
const Sectores = () => (
    <section id="sectores" className="seccion bg-black">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-10 md:mb-14">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    Hecho para tu giro
                </h2>
                <p className="text-white/55 text-base leading-relaxed font-light">
                    La fricción de una clínica no es la de un gimnasio. Cada sector tiene su
                    página, con sus problemas, sus soluciones y sus preguntas.
                </p>
            </div>

            <div className="border-t border-white/10">
                {SECTORES.map((sector) => (
                    <Link
                        key={sector.slug}
                        to={`/automatizacion-para-${sector.slug}`}
                        className="accion group flex items-center justify-between gap-6 py-6 md:py-8 border-b border-white/10 hover:bg-white/[0.03] px-2 md:px-4 -mx-2 md:-mx-4"
                    >
                        <div className="min-w-0">
                            <h3 className="text-lg md:text-2xl font-title uppercase tracking-tight text-white leading-tight mb-1.5 group-hover:translate-x-1 transition-transform">
                                {sector.nombre}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed font-light max-w-2xl">
                                {sector.dolores[0]}
                            </p>
                        </div>
                        <ArrowRight
                            size={20}
                            className="text-white/35 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0"
                            aria-hidden="true"
                        />
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

export default Sectores;
