import React from 'react';
import CicloPanel from './CicloPanel';

/*
 * Primer viewport: la posición a la izquierda, el ciclo completo a la derecha.
 *
 * La versión anterior tenía de titular "Tu WhatsApp contesta, agenda y da
 * seguimiento solo" y una demo de WhatsApp como pieza central. Encerraba a una
 * agencia de IA completa en un solo servicio: quien llegaba entendía que aquí
 * solo se hacen chatbots. El titular ahora nombra las tres cosas que el negocio
 * necesita —que lo encuentren, que lo elijan, que no pierda a nadie— y el panel
 * enseña las cinco etapas con sus servicios.
 *
 * Sin animación de entrada de GSAP a propósito: el HTML llega prerenderizado y
 * se muestra al instante — mejor LCP, ningún flash, y funciona idéntico sin
 * JavaScript, que es como lo leen los rastreadores de motores generativos. La
 * entrada la pone CSS (.entrada en index.css) y reduced-motion la anula.
 */
const Hero = () => (
    <section className="relative w-full overflow-hidden bg-black pt-32 md:pt-44 pb-16 md:pb-24">
        <div className="relative z-10 w-full mx-auto px-5 md:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
                <div className="entrada">
                    <p className="etiqueta text-white/60 mb-5">
                        Aguascalientes · Clínicas, spas, gimnasios y despachos
                    </p>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-title leading-[0.92] tracking-tighter text-white uppercase mb-6 md:mb-8">
                        Algún punto de tu negocio está perdiendo clientes.{' '}
                        <span className="text-white/40">Te decimos cuál, gratis.</span>
                    </h1>

                    <p className="text-base md:text-lg text-white/60 max-w-xl mb-8 md:mb-10 leading-relaxed font-light">
                        Revisamos tu sitio, tu Google, tu WhatsApp y tu seguimiento, y te
                        decimos por escrito dónde se te están yendo los clientes. Si después
                        quieres, lo arreglamos nosotros.
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                        <button
                            onClick={() => {
                                if (typeof window.gtag === 'function') {
                                    window.gtag('event', 'cta_click', { cta_id: 'hero_diagnostico' });
                                }
                                window.dispatchEvent(new Event('open-diabolical-chat'));
                            }}
                            className="accion w-full sm:w-auto px-9 py-4 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-white/85 min-h-[56px] flex items-center justify-center"
                        >
                            Quiero mi diagnóstico gratis
                        </button>
                        <p className="text-sm text-white/55 leading-snug max-w-[16rem] font-light">
                            Te lo entregamos por escrito. Sin costo, trabajes o no con nosotros después.
                        </p>
                    </div>
                </div>

                <div className="entrada flex lg:justify-end">
                    <CicloPanel />
                </div>
            </div>
        </div>
    </section>
);

export default Hero;
