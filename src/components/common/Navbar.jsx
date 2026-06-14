import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

gsap.registerPlugin(ScrollTrigger);

import logoHorizontalNegro from '../../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-NEGRO.svg';
import logoHorizontalBlanco from '../../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLight, setIsLight] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Detect white background sections
        const triggers = [
            ScrollTrigger.create({
                trigger: "#problem",
                start: "top 80px",
                end: "bottom 80px",
                id: "prob-trigger",
                onToggle: self => {
                    if (self.isActive) {
                        setIsLight(true);
                    } else {
                        const compActive = ScrollTrigger.getById('comp-trigger')?.isActive;
                        setIsLight(!!compActive);
                    }
                }
            }),
            ScrollTrigger.create({
                trigger: "#comparison",
                start: "top 80px",
                end: "bottom 80px",
                id: "comp-trigger",
                onToggle: self => {
                    if (self.isActive) {
                        setIsLight(true);
                    } else {
                        const probActive = ScrollTrigger.getById('prob-trigger')?.isActive;
                        setIsLight(!!probActive);
                    }
                }
            })
        ];

        return () => {
            window.removeEventListener('scroll', handleScroll);
            triggers.forEach(t => t.kill());
        };
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out px-4 md:px-8 py-2.5 md:py-4 rounded-full flex items-center justify-between gap-4 md:gap-12 w-[94%] max-w-7xl",
                isLight
                    ? (isScrolled ? "bg-white/90 backdrop-blur-xl border border-black/10 shadow-xl" : "bg-white/70 backdrop-blur-xl border border-black/10")
                    : (isScrolled ? "glass" : "bg-black/70 backdrop-blur-xl border border-white/10")
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <img
                    src={isLight ? logoHorizontalNegro : logoHorizontalBlanco}
                    alt="Diabolical"
                    width="150"
                    height="30"
                    className="h-5 md:h-8 transition-all flex-shrink-0"
                />
            </div>

            {/* Desktop Navigation */}
            <div className={cn(
                "hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-[0.25em] font-bold transition-colors",
                isLight ? "text-black/60" : "text-white/60"
            )}>
                <a href="#problem" className={cn("hover:opacity-100 transition-opacity", !isLight && "hover:text-white")}>Problema</a>
                <a href="#solutions" className={cn("hover:opacity-100 transition-opacity", !isLight && "hover:text-white")}>Soluciones</a>
                <a href="#contact" className={cn("hover:opacity-100 transition-opacity", !isLight && "hover:text-white")}>Contacto</a>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                {/* CTA shown on medium+ screens */}
                <button
                    onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                    className={cn(
                        "hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all magnetic-btn whitespace-nowrap",
                        isLight ? "bg-black text-white hover:bg-black/80" : "bg-white text-black hover:bg-white/90"
                    )}
                >
                    Auditoría <ArrowRight size={12} />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    className={cn(
                        "lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0",
                        isLight ? "text-black bg-black/5 active:bg-black/10" : "text-white bg-white/10 active:bg-white/20"
                    )}
                >
                    {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-[calc(100%+10px)] left-0 w-full rounded-3xl bg-black border border-white/10 backdrop-blur-2xl px-5 py-5 flex flex-col gap-1 lg:hidden shadow-2xl">
                    <a
                        href="#problem"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-sm font-title tracking-widest py-4 border-b border-white/10 text-white active:text-white/60 transition-colors"
                    >
                        Problema
                    </a>
                    <a
                        href="#solutions"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-sm font-title tracking-widest py-4 border-b border-white/10 text-white active:text-white/60 transition-colors"
                    >
                        Soluciones
                    </a>
                    <a
                        href="#contact"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-sm font-title tracking-widest py-4 border-b border-white/10 text-white active:text-white/60 transition-colors"
                    >
                        Contacto
                    </a>
                    <button
                        onClick={() => { setIsMenuOpen(false); window.dispatchEvent(new Event('open-diabolical-chat')); }}
                        className="w-full flex items-center justify-center py-4 rounded-full font-black text-sm uppercase tracking-widest mt-3 bg-white text-black active:scale-95 transition-transform"
                    >
                        Obtener Auditoría
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
