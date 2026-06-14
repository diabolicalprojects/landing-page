import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import logoHorizontalBlanco from '../../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';

const Footer = () => {
    const footerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".footer-content > *", {
                scrollTrigger: {
                    trigger: ".footer-content",
                    start: "top 90%",
                    once: true
                },
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all"
            });
        }, footerRef);
        return () => ctx.revert();
    }, []);

    return (
        <footer ref={footerRef} className="py-14 md:py-24 bg-black border-t border-white/10">
            <div className="container mx-auto px-5 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 mb-12 md:mb-16 footer-content">
                    <div className="w-full md:max-w-2xl">
                        <img src={logoHorizontalBlanco} alt="Diabolical" width="140" height="28" className="h-6 md:h-7 mb-6 md:mb-8 opacity-80" />
                        <h2 className="text-2xl md:text-4xl font-title mb-4 md:mb-6 leading-[0.9] tracking-tighter">
                            ¿LISTO PARA TU{' '}
                            <span className="text-white/15 italic">TRANSFORMACIÓN?</span>
                        </h2>
                        <p className="text-sm md:text-base text-white/60 font-light mb-6 md:mb-8 leading-relaxed italic">
                            "La IA no es una herramienta. Es tu nueva <strong className="text-white/70 not-italic">infraestructura de dominio.</strong>"
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                            className="inline-flex items-center px-8 py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl min-h-[52px]"
                        >
                            Reservar Auditoría de Fricción
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-2 pt-6 md:pt-8 border-t border-white/10 text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
                    <div>Powered by Diabolical Logic — © 2026</div>
                    <div className="flex gap-4">
                        <Link to="/politica-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
                        <span>|</span>
                        <span>DIABOLICAL_STABLE_v2.5</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
