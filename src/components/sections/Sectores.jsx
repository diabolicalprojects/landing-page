import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { SECTORES } from '../../data/sectores';

/**
 * Puerta de entrada a las páginas por sector. Además de orientar al visitante,
 * es lo que da a esas páginas enlaces internos desde la portada: sin ellos,
 * los buscadores las tratarían como páginas huérfanas.
 */
const Sectores = () => (
    <section id="sectores" className="py-16 md:py-28 superficie-1 border-t border-white/5 relative">
        <div className="max-w-6xl mx-auto px-5 md:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
                <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-4 leading-[0.95]">
                    Cada negocio pierde clientes <span className="text-white/50 italic">en un punto distinto</span>
                </h2>
                <p className="text-white/50 text-sm leading-relaxed font-light">
                    Una clínica los pierde en la agenda; un gimnasio, en la baja silenciosa.
                    Entra al tuyo y mira dónde se está yendo el dinero.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {SECTORES.map((sector) => (
                    <Link
                        key={sector.slug}
                        to={`/automatizacion-para-${sector.slug}`}
                        className="glass-card p-7 md:p-8 rounded-3xl border-white/5 hover:border-white/20 transition-all group flex flex-col justify-between min-h-[190px]"
                    >
                        <div>
                            <h3 className="text-base md:text-lg font-title uppercase tracking-tight text-white mb-3 leading-snug">
                                {sector.nombre}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed font-light">
                                {sector.entradilla.split('.')[0]}.
                            </p>
                        </div>
                        <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-black text-white/55 group-hover:text-white transition-colors mt-6">
                            Ver soluciones <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

export default Sectores;
