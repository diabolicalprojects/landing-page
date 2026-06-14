import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import InteractiveGrid from '../common/InteractiveGrid';

const Hero = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-content > *", {
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: "power3.out"
            });
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

            <div className="hero-content relative z-10 w-full mx-auto px-5 text-center max-w-5xl flex flex-col items-center">
                <div className="hero-logo-container mb-10 md:mb-20 animate-float">
                    <div className="hero-glow !scale-125" />
                    <img
                        src="/logo-cuadrado-blanco.svg"
                        alt="Diabolical Logo"
                        width="208"
                        height="208"
                        className="w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 glitch-logo"
                    />
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title mb-6 md:mb-10 leading-[0.9] tracking-tighter text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] max-w-full">
                    Vende más con{' '}
                    <span className="text-white/10 outline-text">Inteligencia Artificial</span>
                </h1>

                <p className="text-base sm:text-lg md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed font-light tracking-wide px-2">
                    Instalamos sistemas de IA que venden, responden y recuperan clientes por ti mientras tú escalas.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 w-full">
                    <button
                        onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                        className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] hover:invert transition-all duration-500 magnetic-btn shadow-[0_0_40px_rgba(255,255,255,0.2)] min-h-[56px] flex items-center justify-center"
                    >
                        Obtener mi Auditoría
                    </button>
                    <div className="hidden md:block text-[10px] uppercase tracking-[0.6em] font-mono text-white/40 border-b border-white/20 pb-2">
                        [ SYSTEM_STATUS: OPERATIONAL_v2.0 ]
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 opacity-30 flex flex-col items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.4em] font-mono hidden sm:block">Scroll to explore</span>
                <div className="w-px h-16 md:h-24 bg-gradient-to-b from-white to-transparent" />
            </div>
        </section>
    );
};

export default Hero;
