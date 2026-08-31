import React from 'react';
import ChatDemo from './ChatDemo';

/*
 * Primer viewport: la oferta a la izquierda, el mecanismo demostrándose a la
 * derecha. Es la composición del estándar que este sitio eligió (ver contrato
 * de dirección en index.html): enseñar el producto vale más que describirlo,
 * y una conversación resolviéndose sola es lo único que este negocio puede
 * probar sin inventar cifras.
 *
 * Sin animación de entrada de GSAP a propósito: el HTML llega prerenderizado
 * y se muestra al instante — mejor LCP, ningún flash, y funciona idéntico sin
 * JavaScript, que es como lo leen los rastreadores de motores generativos. La
 * entrada sutil la pone CSS (ver .entrada en index.css) y se anula sola con
 * prefers-reduced-motion.
 */
const Hero = () => (
    <section className="relative w-full overflow-hidden bg-black pt-32 md:pt-44 pb-16 md:pb-24">
        <div className="relative z-10 w-full mx-auto px-5 md:px-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
                <div className="entrada">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-title leading-[0.92] tracking-tighter text-white uppercase mb-6 md:mb-8">
                        Tu WhatsApp contesta, agenda y da seguimiento{' '}
                        <span className="text-white/40">solo</span>
                    </h1>

                    <p className="text-base md:text-lg text-white/60 max-w-xl mb-8 md:mb-10 leading-relaxed font-light">
                        Lo instalamos encima del WhatsApp, la agenda y el CRM que ya usas.
                        Para clínicas, spas, gimnasios y despachos de Aguascalientes.
                        Funcionando en 2 a 4 semanas.
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
                    <ChatDemo />
                </div>
            </div>
        </div>
    </section>
);

export default Hero;
