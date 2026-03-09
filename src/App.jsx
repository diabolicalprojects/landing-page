import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ArrowRight,
    Cpu,
    Scan,
    Globe,
    CheckCircle2,
    Sparkles,
    Lock,
    TrendingUp,
    Zap,
    Users,
    Activity,
    Cloud,
    MousePointer2,
    Terminal as TerminalIcon,
    Shield,
    Menu,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import Logos correctly for Vite/Production
import logoHorizontalNegro from './assets/logo/LOGO-DIABOLICAL-HORIZONTAL-NEGRO.svg';
import logoHorizontalBlanco from './assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';
import logoCuadradoBlanco from './assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';

// Utility for tailwind classes
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

// --- Components ---

const InteractiveGrid = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const gridSize = 50;
        const points = [];

        const initPoints = () => {
            points.length = 0;
            for (let x = 0; x <= width + gridSize; x += gridSize) {
                for (let y = 0; y <= height + gridSize; y += gridSize) {
                    points.push({
                        x, y,
                        originalX: x,
                        originalY: y,
                        vx: 0,
                        vy: 0
                    });
                }
            }
        };

        initPoints();

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initPoints();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            const mouse = mouseRef.current;
            const radius = 180;
            const strength = 0.4;

            points.forEach(p => {
                const dx = mouse.x - p.originalX;
                const dy = mouse.y - p.originalY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let targetX = p.originalX;
                let targetY = p.originalY;

                if (dist < radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (radius - dist) / radius;
                    targetX = p.originalX - Math.cos(angle) * force * radius * strength;
                    targetY = p.originalY - Math.sin(angle) * force * radius * strength;
                }

                // Smooth interpolation for both entering and leaving the "influence zone"
                // This ensures it returns smoothly if the mouse stops or leaves
                p.x += (targetX - p.x) * 0.08;
                p.y += (targetY - p.y) * 0.08;
            });

            // Draw horizontal lines
            for (let y = 0; y <= height + gridSize; y += gridSize) {
                ctx.beginPath();
                let first = true;
                for (let x = 0; x <= width + gridSize; x += gridSize) {
                    const p = points.find(p => p.originalX === x && p.originalY === y);
                    if (!p) continue;
                    if (first) {
                        ctx.moveTo(p.x, p.y);
                        first = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke();
            }

            // Draw vertical lines
            for (let x = 0; x <= width + gridSize; x += gridSize) {
                ctx.beginPath();
                let first = true;
                for (let y = 0; y <= height + gridSize; y += gridSize) {
                    const p = points.find(p => p.originalX === x && p.originalY === y);
                    if (!p) continue;
                    if (first) {
                        ctx.moveTo(p.x, p.y);
                        first = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

const CustomCursor = () => {
    const dotRef = useRef(null);
    const outlineRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            const { clientX, clientY } = e;
            gsap.to(dotRef.current, { x: clientX, y: clientY, duration: 0.1 });
            gsap.to(outlineRef.current, { x: clientX, y: clientY, duration: 0.3 });
        };

        const handleMouseEnter = () => {
            gsap.to(outlineRef.current, { scale: 1.8, borderColor: 'rgba(255,255,255,1)', borderWidth: '2px', duration: 0.3 });
        };

        const handleMouseLeave = () => {
            gsap.to(outlineRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.5)', borderWidth: '1px', duration: 0.3 });
        };

        window.addEventListener('mousemove', moveCursor);

        const interactiveElements = document.querySelectorAll('button, a, .magnetic-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot !w-2 !h-2" />
            <div ref={outlineRef} className="cursor-outline !w-10 !h-10" />
        </>
    );
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLight, setIsLight] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Detect white background sections
        const trigger = ScrollTrigger.create({
            trigger: "#impact",
            start: "top 80px",
            end: "bottom 80px",
            onToggle: self => setIsLight(self.isActive)
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            trigger.kill();
        };
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out px-10 py-5 rounded-full flex items-center justify-between gap-12 w-[95%] max-w-7xl",
                isLight
                    ? (isScrolled ? "bg-white/70 backdrop-blur-xl border border-black/10 shadow-xl" : "bg-white/40 backdrop-blur-xl border border-black/10")
                    : (isScrolled ? "glass" : "bg-black/40 backdrop-blur-xl border border-white/10")
            )}
        >
            <div className="flex items-center gap-3">
                <img
                    src={isLight
                        ? logoHorizontalNegro
                        : logoHorizontalBlanco
                    }
                    alt="Diabolical"
                    className="h-6 md:h-10 transition-all"
                />
            </div>

            {/* Desktop Navigation */}
            <div className={cn(
                "hidden lg:flex items-center gap-12 text-[11px] uppercase tracking-[0.25em] font-bold transition-colors",
                isLight ? "text-black/60" : "text-white/60"
            )}>
                <a href="#problem" className={cn("hover:text-black transition-colors", !isLight && "hover:text-white")}>Problema</a>
                <a href="#solution" className={cn("hover:text-black transition-colors", !isLight && "hover:text-white")}>Ventaja</a>
                <a href="#protocols" className={cn("hover:text-black transition-colors", !isLight && "hover:text-white")}>Protocolos</a>
            </div>

            <div className="flex items-center gap-4">
                <button className={cn(
                    "hidden sm:flex items-center gap-3 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-tighter hover:scale-105 transition-all magnetic-btn",
                    isLight ? "bg-black text-white" : "bg-white text-black"
                )}>
                    Auditoría <ArrowRight size={14} />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={cn(
                        "lg:hidden p-2 rounded-full transition-colors",
                        isLight ? "text-black hover:bg-black/5" : "text-white hover:bg-white/5"
                    )}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className={cn(
                    "absolute top-24 left-0 w-full rounded-[2rem] p-8 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300",
                    isLight ? "bg-white/90 backdrop-blur-2xl border border-black/10 text-black shadow-2xl" : "glass text-white"
                )}>
                    <a href="#problem" onClick={() => setIsMenuOpen(false)} className="text-xl font-title tracking-widest py-2 border-b border-current/10">Problema</a>
                    <a href="#solution" onClick={() => setIsMenuOpen(false)} className="text-xl font-title tracking-widest py-2 border-b border-current/10">Ventaja</a>
                    <a href="#protocols" onClick={() => setIsMenuOpen(false)} className="text-xl font-title tracking-widest py-2 border-b border-current/10">Protocolos</a>
                    <button className={cn(
                        "w-full py-5 rounded-full font-black text-sm uppercase tracking-widest mt-4",
                        isLight ? "bg-black text-white" : "bg-white text-black"
                    )}>
                        Obtener Auditoría
                    </button>
                </div>
            )}
        </nav>
    );
};

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
        <section ref={heroRef} className="relative min-h-[110vh] w-full flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 bg-black">
            {/* Interactive Background */}
            <div className="absolute inset-0 z-0">
                <InteractiveGrid />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_100%)]" />
            </div>

            <div className="hero-content relative z-10 container mx-auto px-6 text-center max-w-6xl flex flex-col items-center">
                <div className="hero-logo-container mb-24 animate-float">
                    <div className="hero-glow !scale-125" />
                    <img
                        src={logoCuadradoBlanco}
                        alt="Diabolical Logo"
                        className="w-36 h-36 md:w-56 md:h-56 glitch-logo"
                    />
                </div>

                <h1 className="text-5xl md:text-7xl font-title mb-10 leading-[0.9] tracking-tighter text-white uppercase text-balance drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Vende más con <br />
                    <span className="text-white/10 outline-text">Inteligencia Artificial</span>
                </h1>

                <p className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto mb-16 leading-relaxed font-light tracking-wide uppercase">
                    Instalamos sistemas de IA que venden, responden y recuperan clientes por ti mientras tú escalas.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full px-6">
                    <button className="w-full md:w-auto px-16 py-8 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-[0.4em] hover:invert transition-all duration-500 magnetic-btn shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                        Obtener mi Auditoría
                    </button>
                    <div className="hidden md:block text-[10px] uppercase tracking-[0.6em] font-mono text-white/40 border-b border-white/20 pb-2">
                        [ SYSTEM_STATUS: OPERATIONAL_v2.0 ]
                    </div>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 flex flex-col items-center gap-6">
                <span className="text-[10px] uppercase tracking-[0.5em] font-mono">Scroll to explore</span>
                <div className="w-px h-24 bg-gradient-to-b from-white to-transparent" />
            </div>
        </section>
    );
};

const Problem = () => {
    const sectionRef = useRef(null);
    const issues = [
        {
            title: "Ventas que se escapan",
            desc: "Clientes que no esperan y se van porque nadie les respondió al instante. La lentitud es muerte comercial.",
            icon: <Scan size={32} className="text-white/60" />
        },
        {
            title: "Seguimientos olvidados",
            desc: "Dinero que se queda sobre la mesa porque \"se nos pasó\" volver a llamar. La IA nunca olvida.",
            icon: <Lock size={32} className="text-white/60" />
        },
        {
            title: "Talento desperdiciado",
            desc: "Tu equipo gasta horas en tareas repetitivas que una IA hace mejor, más rápido y sin errores.",
            icon: <Cpu size={32} className="text-white/60" />
        }
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".reveal-title > *", {
                scrollTrigger: {
                    trigger: ".reveal-title",
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });

            gsap.from(".problem-card", {
                scrollTrigger: {
                    trigger: ".problem-cards-grid",
                    start: "top 80%",
                },
                y: 60,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: "power4.out",
                once: true,
                clearProps: "all"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="problem" className="py-32 md:py-64 bg-black">
            <div className="container mx-auto px-6">
                <div className="max-w-5xl mx-auto text-center mb-48 reveal-title">
                    <h2 className="text-3xl md:text-5xl font-title mb-10 tracking-tight leading-none">
                        LO QUE NO VES, TE ESTÁ <br />
                        <span className="text-white/10 uppercase italic">COSTANDO UNA FORTUNA.</span>
                    </h2>
                    <p className="text-xl md:text-3xl font-light text-white/50 max-w-2xl mx-auto leading-relaxed">
                        No necesitas más personal, necesitas un sistema que no duerma ni cometa errores.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 problem-cards-grid">
                    {issues.map((item, i) => (
                        <div key={i} className="problem-card glass-card p-16 rounded-[3rem] border-white/10 group hover:border-white/30 transition-all duration-700">
                            <div className="mb-12 p-6 w-fit rounded-2xl bg-white/[0.05] group-hover:bg-white/[0.1] transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-title mb-8 leading-tight">{item.title}</h3>
                            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SolutionCards = () => {
    const sectionRef = useRef(null);
    const cards = [
        {
            title: "Inmediatez Absoluta",
            desc: "Tus clientes reciben atención premium en segundos. Siempre. Sin excepciones. Ganamos por velocidad.",
            id: "01",
            icon: (
                <svg className="w-full h-full text-white/20" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="10" strokeWidth="1" />
                    <circle cx="50" cy="50" r="30" strokeWidth="0.5" strokeDasharray="4 4" />
                    <circle cx="50" cy="50" r="45" strokeWidth="0.2" />
                    <path d="M50 5 L50 95 M5 50 L95 50" strokeWidth="0.2" />
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite" />
                </svg>
            )
        },
        {
            title: "Retención Implacable",
            desc: "El sistema no olvida a ningún prospecto. El seguimiento es automático, persistente y altamente efectivo.",
            id: "02",
            icon: (
                <svg className="w-full h-full text-white/20" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <rect x="25" y="25" width="50" height="50" strokeWidth="1" />
                    <rect x="35" y="35" width="30" height="30" strokeWidth="0.5" />
                    <path d="M10 10 L90 90 M90 10 L10 90" strokeWidth="0.2" />
                    <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.4" />
                </svg>
            )
        },
        {
            title: "Imagen de Vanguardia",
            desc: "Tu marca se posiciona instantáneamente como líder tecnológico. La percepción de valor se duplica.",
            id: "03",
            icon: (
                <svg className="w-full h-full text-white/20" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path d="M20 50 Q50 10 80 50 Q50 90 20 50" strokeWidth="1" />
                    <circle cx="50" cy="50" r="15" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="2" fill="currentColor" />
                    <circle cx="50" cy="50" r="40" strokeWidth="0.1" strokeDasharray="2 2" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".solution-title > *", {
                scrollTrigger: {
                    trigger: ".solution-title",
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power2.out"
            });

            // Animar la entrada de las tarjetas del sistema de forma segura (sin tocar la posición sticky)
            gsap.from(".card-content", {
                scrollTrigger: {
                    trigger: ".solution-cards-stack",
                    start: "top 80%",
                    once: true
                },
                y: 80,
                opacity: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: "power4.out",
                clearProps: "all"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="solution" className="bg-black py-48">
            <div className="container mx-auto px-6">
                <div className="text-center mb-48 solution-title">
                    <h2 className="text-4xl md:text-6xl font-title mb-8 tracking-tight leading-none">NO ES MAGIA. ES UN SISTEMA <br /><span className="text-white/10 italic">DIABOLICAL.</span></h2>
                    <p className="text-white/50 uppercase tracking-[0.5em] text-xs md:text-sm font-bold">Implementamos IA de forma fluida y brutal</p>
                </div>

                <div className="space-y-[30vh] solution-cards-stack pb-[20vh]">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            style={{ top: `${48 + i * 20}px`, zIndex: i + 1 }}
                            className="sticky-card sticky glass-card rounded-[4rem] p-16 md:p-32 overflow-hidden group hover:bg-white/[0.05] border-white/10 transition-all duration-1000"
                        >
                            <div className="card-content relative w-full h-full">
                                <div className="absolute top-0 right-[-10%] w-1/2 h-full opacity-10 group-hover:opacity-40 transition-opacity duration-1000">
                                    {card.icon}
                                </div>
                                <div className="relative z-10 flex flex-col xl:flex-row gap-20 items-center">
                                    <div className="w-full xl:w-1/2">
                                        <div className="text-sm font-mono text-white/30 mb-8 tracking-[1em]">PROTOCOLO_ID_{card.id}</div>
                                        <h3 className="text-4xl md:text-5xl font-title uppercase mb-12 leading-none tracking-tighter">{card.title}</h3>
                                        <p className="text-xl md:text-3xl text-white/60 font-light leading-relaxed">{card.desc}</p>
                                    </div>
                                    <div className="hidden xl:block w-px h-80 bg-white/10" />
                                    <div className="w-full xl:w-1/3">
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-6 text-white/80">
                                                <CheckCircle2 size={24} className="text-white/30" />
                                                <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold">Ejecución Autónoma</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-white/80">
                                                <CheckCircle2 size={24} className="text-white/30" />
                                                <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold">Precisión Técnica</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-white/80">
                                                <CheckCircle2 size={24} className="text-white/30" />
                                                <span className="text-xs md:text-sm uppercase tracking-[0.3em] font-bold">Zero Fricción</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Impact = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".impact-title", {
                scrollTrigger: {
                    trigger: ".impact-title",
                    start: "top 85%",
                },
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            });

            gsap.from(".stats-card", {
                scrollTrigger: {
                    trigger: ".stats-card",
                    start: "top 80%",
                },
                x: -50,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out"
            });

            gsap.from(".quote-content", {
                scrollTrigger: {
                    trigger: ".quote-content",
                    start: "top 80%",
                },
                x: 50,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="impact" className="py-48 md:py-64 bg-white text-black overflow-hidden relative">
            <div className="container mx-auto px-6 text-center">
                <h2 className="impact-title text-3xl md:text-5xl font-title mb-32 tracking-tighter leading-none">TRABAJA MENOS. <br /><span className="opacity-20 uppercase italic">VENDE MUCHO MÁS.</span></h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left max-w-6xl mx-auto">
                    <div className="stats-card border border-black/10 bg-black/[0.03] p-16 md:p-24 rounded-[4rem]">
                        <div className="text-6xl md:text-8xl font-title mb-8 leading-none">+30%</div>
                        <div className="text-xl md:text-2xl text-black/60 uppercase tracking-[0.15em] font-bold leading-tight">
                            Eficiencia bruta <br /> en gestión comercial
                        </div>
                        <p className="mt-16 text-sm md:text-base opacity-50 italic font-medium">
                            Es lo que logran nuestros clientes al eliminar el error humano y la fatiga del proceso de venta.
                        </p>
                    </div>

                    <div className="quote-content p-12 space-y-16">
                        <div className="text-2xl md:text-4xl border-l-4 border-black pl-12 font-light italic leading-tight text-black/90">
                            "Tener un sistema autónomo es la ventaja injusta para escalar sin contratar más personal."
                        </div>
                        <div className="pl-12 flex items-center gap-6">
                            <div className="w-16 h-px bg-black opacity-30" />
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black">Ventaja Diabolical</span>
                        </div>
                        <div className="pl-12 pt-8">
                            <button className="px-12 py-6 bg-black text-white rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:scale-110 transition-all magnetic-btn">
                                Activar Protocolo <ArrowRight size={14} className="inline ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Protocols = () => {
    const sectionRef = useRef(null);
    const protocols = [
        {
            name: "Crecimiento Acelerado",
            badge: "01",
            note: "Ideal para pequeñas empresas que pierden leads hoy.",
            features: ["Atención automática 24/7", "Filtro inteligente de prospectos", "Configuración técnica rápida"],
            cta: "Activar Protocolo"
        },
        {
            name: "Sistema Implacable",
            badge: "02",
            isPopular: true,
            note: "Domina tu mercado con tecnología profunda.",
            features: ["Automatización total de flujos", "Retención y recuperación activa", "Soporte técnico dedicado", "Integración con CRM"],
            cta: "Dominar Mercado"
        },
        {
            name: "Dominio Total",
            badge: "03",
            note: "Tu negocio funcionando como un reactor nuclear.",
            features: ["IA personalizada con voz propia", "Integración total en ecosistema", "Consultoría estratégica mensual", "Escalado masivo"],
            cta: "Control Total"
        }
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".protocols-title > *", {
                scrollTrigger: {
                    trigger: ".protocols-title",
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power2.out"
            });

            gsap.from(".pricing-card", {
                scrollTrigger: {
                    trigger: ".pricing-grid",
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power2.out",
                clearProps: "all"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="protocols" className="py-32 md:py-64 bg-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-48 protocols-title">
                    <h2 className="text-4xl md:text-6xl font-title mb-8 tracking-tighter">PROTOCOLOS DE PODER</h2>
                    <p className="text-white/40 text-xs md:text-sm tracking-[0.6em] uppercase font-bold">Superioridad tecnológica por diseño</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto font-jakarta pricing-grid">
                    {protocols.map((p, i) => (
                        <div key={i} className={cn(
                            "pricing-card glass-card p-12 md:p-16 rounded-[4rem] flex flex-col group",
                            p.isPopular ? "border-white/30 bg-white/[0.05] ring-2 ring-white/10" : "border-white/10"
                        )}>
                            <div className="mb-16">
                                <div className="text-xs opacity-30 font-mono mb-6 tracking-[0.5em]">LEVEL_{p.badge}</div>
                                <h3 className="text-2xl md:text-3xl font-title mb-6 tracking-tighter uppercase leading-none">{p.name}</h3>
                                <p className="text-sm md:text-base text-white/40 italic font-light">{p.note}</p>
                            </div>

                            <ul className="space-y-8 mb-20 flex-grow">
                                {p.features.map((f, j) => (
                                    <li key={j} className="flex gap-6 text-sm md:text-lg text-white/60 leading-relaxed font-light items-start">
                                        <div className="w-2 h-2 rounded-full bg-white/20 mt-2.5 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={cn(
                                "w-full py-7 rounded-full text-xs md:text-sm font-black uppercase tracking-[0.4em] transition-all",
                                p.isPopular ? "bg-white text-black hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)]" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                            )}>
                                {p.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

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
        <footer ref={footerRef} className="py-32 md:py-48 bg-black border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-32 mb-48">
                    <div className="max-w-3xl footer-content">
                        <div className="flex items-center gap-4 mb-20">
                            <img src={logoHorizontalBlanco} alt="Diabolical" className="h-10" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-title mb-16 leading-[0.9] tracking-tighter">
                            ¿LISTO PARA TU <br />
                            <span className="text-white/10 italic">TRANSFORMACIÓN?</span>
                        </h2>
                        <p className="text-xl md:text-3xl text-white/50 font-light mb-24 max-w-2xl leading-relaxed italic">
                            "La IA no es una herramienta. Es tu nueva infraestructura de dominio."
                        </p>
                        <button className="px-16 py-8 bg-white text-black font-black text-xs md:text-sm uppercase tracking-[0.5em] rounded-full hover:scale-105 transition-all shadow-2xl">
                            Reservar Auditoría de Fricción
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-white/10 text-[10px] md:text-xs font-mono uppercase tracking-[0.5em] text-white/20">
                    <div>Powered by Diabolical Logic — © 2026</div>
                    <div className="flex items-center gap-6 mt-8 md:mt-0 underline underline-offset-[12px] decoration-white/10">
                        Status_Active: [DIABOLICAL_STABLE_v2.5]
                    </div>
                </div>
            </div>
        </footer>
    );
};


// --- SEO & GEO Management (Yoast Style) ---

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seo');
    const [formData, setFormData] = useState({
        // SEO الأساسية
        title: "DIABOLICAL | Elite AI Automation & Design",
        description: "Exponential scaling through autonomous AI systems and high-end digital engineering.",
        keywords: "AI Automation, Elite Design, Business Intelligence, Digital Engineering",
        siteUrl: "https://diabolicalservices.tech",

        // Social & Brand
        favicon: "/favicon.ico",
        ogImage: "",
        twitterHandle: "@diabolical",

        // Advanced Técnico
        sitemapXml: "",
        robotsTxt: "User-agent: *\nAllow: /",
        structuredData: "{}",

        // Analytics & Tracking
        googleTagManager: "",
        metaPixel: "",
        customHeaderScripts: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (formData.title) document.title = formData.title;
    }, [formData.title]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/settings');
                if (res.data) setFormData({ ...formData, ...res.data });
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === "admin" && password === "Diabolical1502") {
            setIsLoggedIn(true);
        } else {
            alert("ACCESO DENEGADO: Identidad o Protocolo Inválido");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axios.post('/api/settings', formData);
            alert('INFRAESTRUCTURA ACTUALIZADA: La información se ha propagado a los motores de búsqueda.');
        } catch (error) {
            console.error("Error updating SEO:", error);
            alert('Error al sincronizar con el centro de mando.');
        } finally {
            setIsSaving(false);
        }
    };

    const getSEOScore = () => {
        let score = 0;
        if (formData.title.length > 30 && formData.title.length < 60) score += 25;
        if (formData.description.length > 120 && formData.description.length < 160) score += 25;
        if (formData.ogImage) score += 25;
        if (formData.googleTagManager || formData.metaPixel) score += 25;
        return score;
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-jakarta relative overflow-hidden cursor-none">
                <CustomCursor />
                <div className="glass-card p-12 rounded-[3.5rem] w-full max-w-md border-white/10 text-center relative z-10">
                    <img src={logoCuadradoBlanco} className="w-24 mx-auto mb-10 opacity-80" alt="Diabolical" />
                    <div className="space-y-2 mb-10">
                        <h2 className="text-2xl font-title tracking-[0.2em] uppercase text-white">Admin_Access</h2>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Secure Infrastructure Node</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <input type="text" placeholder="USERNAME" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-white focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest transition-all" value={username} onChange={(e) => setUsername(e.target.value)} />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="AUTH_TOKEN" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-white focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 p-2 transition-colors">
                                    {showPassword ? <Lock size={16} /> : <Zap size={16} />}
                                </button>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.5em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mt-4">UNLOCK_TERMINAL</button>
                    </form>
                </div>
            </div>
        );
    }

    const score = getSEOScore();

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-jakarta cursor-none">
            <CustomCursor />

            {/* Header Dashboard */}
            <header className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <img src={logoCuadradoBlanco} alt="" className="w-8" />
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                        <h1 className="text-xs font-black uppercase tracking-[0.5em] flex items-center gap-3">
                            Monster_SEO <span className="text-[8px] bg-red-500/80 text-white px-2 py-0.5 rounded-full animate-pulse">Live</span>
                        </h1>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Infrastructure Control Center</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                        <div className={cn("w-2 h-2 rounded-full", score > 70 ? "bg-green-500" : "bg-yellow-500")} />
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">HealthIndex: {score}%</span>
                    </div>
                    <button onClick={() => navigate('/')} className="px-6 py-2 glass rounded-full text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Exit_Node</button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-20 md:w-64 border-r border-white/5 bg-black flex flex-col p-4 gap-2">
                    {[
                        { id: 'seo', icon: <Search size={18} />, label: 'SEO Core' },
                        { id: 'social', icon: <Share2 size={18} />, label: 'Social & Branding' },
                        { id: 'tech', icon: <TerminalIcon size={18} />, label: 'Technical XML/IA' },
                        { id: 'analytics', icon: <Activity size={18} />, label: 'Tracking Tags' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all group",
                                activeTab === tab.id ? "bg-white text-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
                            <span className="hidden md:block text-[10px] uppercase font-black tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto p-4 md:p-6 bg-white/[0.02] rounded-3xl border border-white/5 hidden md:block">
                        <h4 className="text-[8px] uppercase tracking-widest text-white/20 mb-2">Build_Status</h4>
                        <div className="flex justify-between items-center text-[9px] font-mono text-green-500/60 uppercase">
                            <span>Sitemap</span>
                            <span>Valid</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Areas */}
                <main className="flex-1 overflow-y-auto p-8 md:p-16">
                    <form onSubmit={handleSubmit} className="max-w-4xl space-y-12">

                        {activeTab === 'seo' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic level-label">Main Search Title</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all text-xl" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic level-label">Meta Description (Max 160)</label>
                                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic level-label">Canonical Site URL</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white/50 focus:outline-none focus:border-white/30 transition-all font-mono" value={formData.siteUrl} onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Social Preview Image (OG Image URL)</label>
                                    <input type="text" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all font-mono" value={formData.ogImage} onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Favicon Path</label>
                                    <input type="text" placeholder="/favicon.ico" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30 transition-all font-mono" value={formData.favicon} onChange={(e) => setFormData({ ...formData, favicon: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tech' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Structured Data (Scheme JSON)</label>
                                    <textarea rows="6" className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white/50 focus:outline-none focus:border-white/30 transition-all font-mono text-xs" value={formData.structuredData} onChange={(e) => setFormData({ ...formData, structuredData: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Sitemap.xml Config</label>
                                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white/50 focus:outline-none focus:border-white/30 transition-all font-mono text-xs" value={formData.sitemapXml} onChange={(e) => setFormData({ ...formData, sitemapXml: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold">Google Tag Manager (ID)</label>
                                        <input type="text" placeholder="GTM-XXXXXX" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30" value={formData.googleTagManager} onChange={(e) => setFormData({ ...formData, googleTagManager: e.target.value })} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold">Meta Pixel (ID)</label>
                                        <input type="text" placeholder="1234567890" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/30" value={formData.metaPixel} onChange={(e) => setFormData({ ...formData, metaPixel: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 px-2 font-bold italic">Head Injection Scripts</label>
                                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white/30 focus:outline-none focus:border-white/30 transition-all font-mono text-[10px]" value={formData.customHeaderScripts} onChange={(e) => setFormData({ ...formData, customHeaderScripts: e.target.value })} />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className={cn(
                                "fixed bottom-12 right-12 px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] transition-all z-50",
                                isSaving ? "bg-white/20 text-white/40" : "bg-white text-black hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                            )}
                        >
                            {isSaving ? "SYNCHRONIZING..." : "PROPAGATE_ALL_DATA"}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

// Removed old Problem and SolutionCards to resolve duplication

const ComparisonSection = () => {
    return (
        <section className="py-24 md:py-40 bg-black border-y border-white/5 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-4">La Lógica del Ahorro</h2>
                    <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold">Escalabilidad vs Estancamiento</p>
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                    <div className="bg-black/80 p-8 md:p-12">
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-10 font-black">Si sigues igual...</h4>
                        <ul className="space-y-10 md:space-y-14">
                            <li className="text-[11px] md:text-sm text-white/30 leading-snug">Pagas nóminas, seguros y bonos cada mes.</li>
                            <li className="text-[11px] md:text-sm text-white/30 leading-snug">El crecimiento depende de tu cansancio.</li>
                            <li className="text-[11px] md:text-sm text-white/30 leading-snug">Ventas perdidas por falta de respuesta.</li>
                            <li className="text-[11px] md:text-sm text-white/30 leading-snug">Vives pegado al celular.</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 p-8 md:p-12 relative flex flex-col h-full">
                        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none"></div>
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-white mb-10 font-black">Con Sistema Diabolical</h4>
                        <ul className="space-y-10 md:space-y-14 relative z-10">
                            <li className="text-[11px] md:text-sm text-white leading-snug font-bold">Una inversión fija que se paga sola.</li>
                            <li className="text-[11px] md:text-sm text-white leading-snug font-bold">El sistema escala sin que tú trabajes más.</li>
                            <li className="text-[11px] md:text-sm text-white leading-snug font-bold">Cada mensaje es una oportunidad cerrada.</li>
                            <li className="text-[11px] md:text-sm text-white leading-snug font-bold">Recuperas tus domingos.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const BoldHook = () => {
    return (
        <section className="py-32 md:py-60 bg-black relative">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <div className="inline-block px-6 py-2 border border-red-500/20 rounded-full mb-12">
                    <span className="text-[9px] text-red-500 uppercase tracking-[0.6em] font-black animate-pulse underline">Alerta_Financiera</span>
                </div>
                <h2 className="text-4xl md:text-8xl font-title tracking-tighter uppercase mb-12 leading-[0.85]">
                    Cada minuto que pasas leyendo esto, <span className="text-white/20">estás perdiendo dinero.</span>
                </h2>
                <div className="max-w-3xl mx-auto space-y-10">
                    <p className="text-lg md:text-2xl text-white/60 leading-relaxed font-light">
                        Mientras tu equipo (o tú mismo) dedica horas a contestar las mismas 10 preguntas por WhatsApp o a pasar datos de un papel a un Excel, tus competidores más ágiles te están robando mercado. No estás ahorrando dinero al no automatizar; estás pagando un <span className="text-white underline underline-offset-8 decoration-white/20">"impuesto por ineficiencia"</span> que te sale más caro que cualquier nómina.
                    </p>
                    <p className="text-2xl md:text-4xl font-title text-white italic tracking-tight pt-8 border-t border-white/5">
                        "No tienes un problema de ventas, tienes un problema de sistema."
                    </p>
                </div>
            </div>
        </section>
    );
};

const GEOTags = ({ data }) => {
    useEffect(() => {
        if (!data.title) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'geotag-schema';
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ConsultingService",
            "name": data.title,
            "description": data.description,
            "provider": {
                "@type": "Organization",
                "name": "Diabolical Logic",
                "logo": "https://diabolicalservices.tech/logo.svg"
            },
            "serviceType": "AI Automation, Digital Infrastructure",
            "areaServed": "Worldwide",
            "keywords": data.keywords
        });

        const existingScript = document.getElementById('geotag-schema');
        if (existingScript) existingScript.remove();
        document.head.appendChild(script);

        document.title = data.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.description);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, [data]);

    return null;
};

const LandingPage = () => {
    const [seoData, setSeoData] = useState({
        title: "Diabolical | IA Services & Elite Design",
        description: "Consultoría de Ingeniería en Sistemas Autónomos.",
        keywords: ""
    });

    useEffect(() => {
        const loadSEO = async () => {
            try {
                const res = await axios.get('/api/settings');
                setSeoData(res.data);
            } catch (error) {
                console.warn("Using default SEO data");
            }
        };
        loadSEO();
    }, []);

    return (
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta cursor-none overflow-x-hidden">
            <GEOTags data={seoData} />
            <CustomCursor />
            {/* Soft Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[150px] rounded-full" />
            </div>

            <Navbar />
            <Hero />
            <Problem />
            <SolutionCards />
            <ComparisonSection />
            <BoldHook />
            <Contact />
            <Footer />
        </main>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </Router>
    );
}

export default App;

