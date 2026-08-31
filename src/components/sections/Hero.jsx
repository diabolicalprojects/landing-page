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
                        Agencia de IA · Aguascalientes
                    </p>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-title leading-[0.92] tracking-tighter text-white uppercase mb-6 md:mb-8">
                        Que te encuentren, que te elijan y que{' '}
                        <span className="text-white/40">nadie se quede sin respuesta</span>
                    </h1>

                    <p className="text-base md:text-lg text-white/60 max-w-xl mb-8 md:mb-10 leading-relaxed font-light">
                        Inteligencia artificial aplicada a las cinco etapas por las que pasa un
                        cliente, no solo al chat. Posicionamiento, publicidad, sitio web, marca,
                        atención automática y la medición que dice cuál de ellas está fallando.
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                        <button
                            onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                            className="accion w-full sm:w-auto px-9 py-4 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-white/85 min-h-[56px] flex items-center justify-center"
                        >
                            Pedir el diagnóstico gratuito
                        </button>
                        <p className="text-sm text-white/55 leading-snug max-w-[16rem] font-light">
                            Sales con el diagnóstico escrito aunque no trabajes con nosotros.
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
