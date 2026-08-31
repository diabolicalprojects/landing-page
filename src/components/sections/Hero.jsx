import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import InteractiveGrid from '../common/InteractiveGrid';
import { prefiereMenosMovimiento } from '../../utils/movimiento';

const Hero = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        // Con movimiento reducido no se anima nada: la regla de index.css deja
        // el contenido ya visible, así que salir aquí lo muestra colocado en su
        // posición final en lugar de esconderlo a la espera de una animación
        // que no va a ocurrir.
        if (prefiereMenosMovimiento()) return undefined;

        const ctx = gsap.context(() => {
            // fromTo, no from: el HTML viene prerenderizado y el CSS ya deja
            // estos elementos en opacity 0 (regla `.js`), así que un `from`
            // animaría de 0 a 0. Ver index.css.
            gsap.fromTo(".hero-content > *",
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out"
                    // Sin clearProps: la regla `.js` de index.css deja estos
                    // elementos en opacity 0, así que limpiar el estilo inline
                    // los volvería a esconder al terminar la animación.
                }
            );
        }, heroRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={heroRef} className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-28 md:pt-36 pb-20 bg-black">
            {/* Interactive Background */}
            <div className="absolute inset-0 z-0">
                <InteractiveGrid />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_100%)]" />
            </div>

            <div className="hero-content relative z-10 w-full mx-auto px-5 md:px-8 max-w-6xl">
                {/* El logo baja de tamaño: en el primer viewport manda lo que se
                    ofrece, no quién lo ofrece. La marca ya está en el navbar. */}
                <div className="hero-logo-container mb-10 md:mb-14">
                    <div className="hero-glow" />
                    <img
                        src="/logo-cuadrado-blanco.svg"
                        alt="Diabolical Services"
                        width="208"
                        height="208"
                        className="w-16 h-16 md:w-20 md:h-20 glitch-logo"
                    />
                </div>

                {/* El h1 anterior era "Vende más con Inteligencia Artificial": servía
                    para cualquier empresa del planeta, sin ciudad, sin sector y sin
                    mecanismo. Este nombra el objeto que el cliente reconoce (su
                    WhatsApp) y las tres cosas que el sistema hace, en una frase que
                    se sostiene sola fuera de la página: que es lo que un motor
                    generativo puede citar. */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title mb-6 md:mb-8 leading-[0.9] tracking-tighter text-white uppercase max-w-4xl">
                    Tu WhatsApp contesta, agenda y da seguimiento{' '}
                    <span className="text-white/40">solo</span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mb-10 md:mb-12 leading-relaxed font-light">
                    Lo instalamos encima del WhatsApp, la agenda y el CRM que ya usas.
                    Para clínicas, spas, gimnasios y despachos de Aguascalientes.
                    Funcionando en dos a cuatro semanas.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full">
                    <button
                        onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                        className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] hover:invert transition-all duration-500 magnetic-btn shadow-[0_0_40px_rgba(255,255,255,0.2)] min-h-[56px] flex items-center justify-center"
                    >
                        Pedir el diagnóstico gratuito
                    </button>
                    <p className="text-sm text-white/50 leading-relaxed max-w-xs font-light">
                        Sales con el diagnóstico escrito aunque no trabajes con nosotros.
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 opacity-30 flex flex-col items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.4em] font-mono hidden sm:block">Desliza para ver</span>
                <div className="w-px h-16 md:h-24 bg-gradient-to-b from-white to-transparent" />
            </div>
        </section>
    );
};

export default Hero;
