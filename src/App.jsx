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
    Search,
    Share2,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import Logos correctly for Vite/Production
import logoHorizontalNegro from './assets/logo/LOGO-DIABOLICAL-HORIZONTAL-NEGRO.svg';
import logoHorizontalBlanco from './assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';
import logoCuadradoBlanco from './assets/logo/LOGO-DIABOLICAL-CUADRADO-BLANCO.svg';
import chatbotIcon from './assets/logo/icono-diabolical-chatbot.svg';

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
    // Only activate on devices with a fine pointer (mouse), not touch
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    useEffect(() => {
        if (isTouchDevice) return;

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
    }, [isTouchDevice]);

    if (isTouchDevice) return null;

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
        const triggers = [
            ScrollTrigger.create({
                trigger: "#problem",
                start: "top 70px",
                end: "bottom 70px",
                onToggle: self => { if (self.isActive) setIsLight(true); }
            }),
            ScrollTrigger.create({
                trigger: "#comparison",
                start: "top 70px",
                end: "bottom 70px",
                onToggle: self => { if (self.isActive) setIsLight(true); }
            })
        ];

        const handleLightOff = () => {
            const problemEl = document.getElementById('problem');
            const comparisonEl = document.getElementById('comparison');
            if (!problemEl || !comparisonEl) return;
            const py = problemEl.getBoundingClientRect();
            const cy = comparisonEl.getBoundingClientRect();
            const isInLight = (py.top < 80 && py.bottom > 80) || (cy.top < 80 && cy.bottom > 80);
            setIsLight(isInLight);
        };
        window.addEventListener('scroll', handleLightOff, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleLightOff);
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
                        src={logoCuadradoBlanco}
                        alt="Diabolical Logo"
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




const DiabolicalChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [contact, setContact] = useState({ name: '', whatsapp: '' });

    const questions = [
        {
            id: 'friction', tag: '01 / FRICCIÓN',
            label: '¿Cuál es el proceso que más detiene el crecimiento de tu negocio hoy?',
            options: [
                { label: 'Tardamos en responder leads', value: 'Ventas / Velocidad de respuesta' },
                { label: 'Seguimiento desordenado', value: 'Retención / Seguimiento manual' },
                { label: 'Gestión de citas y agenda', value: 'Operaciones / Gestión de agenda' },
                { label: 'Tareas repetitivas del equipo', value: 'Eficiencia / Automatización interna' },
            ]
        },
        {
            id: 'volume', tag: '02 / VOLUMEN',
            label: '¿Cuántos prospectos o mensajes nuevos recibe tu negocio mensualmente?',
            options: [
                { label: 'Menos de 50', value: 'Menos de 50 leads/mes' },
                { label: '50 — 200', value: '50–200 leads/mes' },
                { label: '200 — 500', value: '200–500 leads/mes' },
                { label: 'Más de 500 🔥', value: '500+ leads/mes' },
            ]
        },
        {
            id: 'dependency', tag: '03 / DEPENDENCIA',
            label: 'Si tu equipo deja de responder 48 horas, ¿qué pasa con tus ventas?',
            options: [
                { label: 'Seguirían normales', value: 'Baja dependencia humana' },
                { label: 'Bajarían un poco', value: 'Dependencia moderada' },
                { label: 'Se detienen casi por completo', value: 'Alta dependencia (crítica)' },
                { label: 'El negocio colapsaría', value: 'Dependencia total (urgente)' },
            ]
        },
        {
            id: 'budget', tag: '04 / IMPACTO',
            label: '¿Cuánto estimas que pierdes al mes por no tener atención 24/7?',
            options: [
                { label: '$0 – $500 USD', value: '$0–500 USD/mes' },
                { label: '$500 – $2,000 USD', value: '$500–2,000 USD/mes' },
                { label: '$2,000 – $10,000 USD', value: '$2,000–10,000 USD/mes' },
                { label: '$10,000+ USD', value: '$10,000+ USD/mes' },
            ]
        },
        {
            id: 'impact', tag: '05 / POTENCIAL',
            label: 'Si este proceso fuera automático, ¿qué tan grande sería el cambio?',
            options: [
                { label: 'Ahorraría 1–5 hrs/semana', value: '1–5 horas/semana liberadas' },
                { label: '10–20 hrs/semana', value: '10–20 horas/semana liberadas' },
                { label: 'Más del 50% de mi tiempo', value: '+50% del tiempo liberado' },
                { label: 'Podría duplicar mi negocio', value: 'Potencial de duplicar operaciones' },
            ]
        },
    ];

    const openWA = (msg) => {
        const encoded = encodeURIComponent(msg);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        let url = `https://api.whatsapp.com/send?phone=524495136907&text=${encoded}`;
        if (isAndroid) {
            url = `intent://send/?phone=524495136907&text=${encoded}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
        } else if (isIOS) {
            url = `whatsapp://send?phone=524495136907&text=${encoded}`;
        }

        const a = document.createElement('a');
        a.href = url;
        if (!isAndroid && !isIOS) a.target = '_blank';
        else a.target = '_top';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 150);
    };

    useEffect(() => {
        const handler = () => setIsOpen(true);
        window.addEventListener('open-diabolical-chat', handler);
        return () => window.removeEventListener('open-diabolical-chat', handler);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => { setStep(0); setAnswers({}); setContact({ name: '', whatsapp: '' }); }, 350);
    };

    const handleAnswer = (value) => {
        setAnswers(prev => ({ ...prev, [questions[step].id]: value }));
        setStep(prev => prev + 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const msg = `🔴 *NUEVO DIAGNÓSTICO DIABOLICAL*\n\n*Nombre:* ${contact.name}\n*WhatsApp:* ${contact.whatsapp}\n\n*1. Fricción:* ${answers.friction}\n*2. Volumen:* ${answers.volume}\n*3. Dependencia:* ${answers.dependency}\n*4. Impacto Estimado:* ${answers.budget}\n*5. Potencial:* ${answers.impact}`;
        openWA(msg);
        setStep(questions.length + 1);
    };

    const isContactStep = step === questions.length;
    const isSuccess = step > questions.length;
    const progress = Math.min((step / (questions.length + 1)) * 100, 100);
    const currentQ = !isContactStep && !isSuccess ? questions[step] : null;
    const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all min-h-[52px] placeholder:text-white/25';

    return (
        <>
            {/* Backdrop — blurs the rest of the landing */}
            {isOpen && (
                <div
                    className="chatbot-backdrop fixed inset-0 z-40 bg-black/50"
                    style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                    onClick={handleClose}
                />
            )}

            {/* Floating Trigger Button */}
            <button
                onClick={() => isOpen ? handleClose() : setIsOpen(true)}
                aria-label="Diagnóstico Diabolical"
                className={cn(
                    "fixed bottom-6 right-5 md:bottom-8 md:right-8 z-[60] w-16 h-16 rounded-full bg-black border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95",
                    !isOpen && "chatbot-btn-idle"
                )}
            >
                {isOpen
                    ? <X size={20} className="text-white" />
                    : <img src={chatbotIcon} alt="Diabolical" className="w-10 h-10" />
                }
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="chatbot-panel fixed z-50 flex flex-col bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    style={{ bottom: '6rem', right: '1.25rem', width: 'min(calc(100vw - 2.5rem), 22rem)', maxHeight: 'calc(100dvh - 8rem)' }}
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <img src={chatbotIcon} alt="" className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase tracking-widest text-white leading-none">Diagnóstico Diabolical</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Sistema Autónomo · Online</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] text-white/20 font-mono uppercase">Live</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {!isSuccess && (
                        <div className="h-px bg-white/5 flex-shrink-0">
                            <div className="h-full bg-white/40 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {isSuccess && (
                            <div className="flex flex-col items-center text-center py-8 gap-5">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                                    <CheckCircle2 size={28} className="text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base font-title uppercase tracking-tight text-white">¡Diagnóstico Enviado!</h3>
                                    <p className="text-xs text-white/50 leading-relaxed">Te contactaremos vía WhatsApp en las próximas horas con tu plan de automatización personalizado.</p>
                                </div>
                                <button onClick={handleClose} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">Cerrar</button>
                            </div>
                        )}

                        {currentQ && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">{currentQ.tag}</span>
                                    <p className="text-sm font-bold text-white leading-snug">{currentQ.label}</p>
                                </div>
                                <div className="space-y-2">
                                    {currentQ.options.map((opt, i) => (
                                        <button key={i} onClick={() => handleAnswer(opt.value)}
                                            className="w-full text-left px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.09] hover:border-white/25 text-white/70 hover:text-white text-sm transition-all active:scale-[0.98] min-h-[52px] leading-snug">
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isContactStep && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">06 / CONTACTO</span>
                                    <p className="text-sm font-bold text-white leading-snug">Perfecto. ¿A dónde enviamos tu análisis?</p>
                                </div>
                                <div className="space-y-3">
                                    <input required type="text" placeholder="Tu nombre" value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))} className={inp} />
                                    <input required type="tel" placeholder="WhatsApp (+52 449 000 0000)" value={contact.whatsapp} onChange={e => setContact(p => ({ ...p, whatsapp: e.target.value }))} className={inp} />
                                </div>
                                <button type="submit" className="w-full py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all min-h-[56px]">Enviar por WhatsApp →</button>
                                <p className="text-[9px] text-white/20 text-center">Solo te contactamos si tu negocio es un buen candidato.</p>
                            </form>
                        )}
                    </div>

                    {/* Step counter footer */}
                    {!isSuccess && (
                        <div className="px-5 py-2.5 border-t border-white/5 flex-shrink-0">
                            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest text-center">
                                {isContactStep ? 'Paso 6 de 6' : `Paso ${step + 1} de ${questions.length + 1}`}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
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
        <footer ref={footerRef} className="py-14 md:py-24 bg-black border-t border-white/10">
            <div className="container mx-auto px-5 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 mb-12 md:mb-16 footer-content">
                    <div className="w-full md:max-w-2xl">
                        <img src={logoHorizontalBlanco} alt="Diabolical" className="h-6 md:h-7 mb-6 md:mb-8 opacity-80" />
                        <h2 className="text-2xl md:text-4xl font-title mb-4 md:mb-6 leading-[0.9] tracking-tighter">
                            ¿LISTO PARA TU{' '}
                            <span className="text-white/15 italic">TRANSFORMACIÓN?</span>
                        </h2>
                        <p className="text-sm md:text-base text-white/40 font-light mb-6 md:mb-8 leading-relaxed italic">
                            "La IA no es una herramienta. Es tu nueva <strong className="text-white/60 not-italic">infraestructura de dominio.</strong>"
                        </p>
                        <button
                            onClick={() => window.dispatchEvent(new Event('open-diabolical-chat'))}
                            className="inline-flex items-center px-8 py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl min-h-[52px]"
                        >
                            Reservar Auditoría de Fricción
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-2 pt-6 md:pt-8 border-t border-white/10 text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
                    <div>Powered by Diabolical Logic — © 2026</div>
                    <div>DIABOLICAL_STABLE_v2.5</div>
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
            <div className="min-h-screen bg-black flex items-center justify-center p-5 font-jakarta relative overflow-hidden">
                <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-md border-white/10 text-center relative z-10">
                    <img src={logoCuadradoBlanco} className="w-24 mx-auto mb-10 opacity-80" alt="Diabolical" />
                    <div className="space-y-2 mb-10">
                        <h2 className="text-2xl font-title tracking-[0.2em] uppercase text-white">Admin_Access</h2>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Secure Infrastructure Node</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-3">
                            <input type="text" placeholder="USERNAME" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center text-white focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest transition-all min-h-[52px]" value={username} onChange={(e) => setUsername(e.target.value)} />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="AUTH_TOKEN" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center text-white focus:outline-none focus:border-white/30 font-mono text-sm tracking-widest transition-all min-h-[52px]" value={password} onChange={(e) => setPassword(e.target.value)} />
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
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-jakarta">

            {/* Header Dashboard */}
            <header className="px-4 md:px-8 py-4 md:py-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-4 md:gap-6">
                    <img src={logoCuadradoBlanco} alt="" className="w-7 md:w-8" />
                    <div className="h-6 w-px bg-white/10" />
                    <div>
                        <h1 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] flex items-center gap-2">
                            Monster_SEO <span className="text-[8px] bg-red-500/80 text-white px-2 py-0.5 rounded-full animate-pulse">Live</span>
                        </h1>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">Infrastructure Control Center</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", score > 70 ? "bg-green-500" : "bg-yellow-500")} />
                        <span className="text-[8px] md:text-[9px] font-mono text-white/40 uppercase tracking-widest">SEO: {score}%</span>
                    </div>
                    <button onClick={() => navigate('/')} className="px-4 md:px-6 py-2 glass rounded-full text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all whitespace-nowrap">Exit_Node</button>
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
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-16">
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
                                "fixed bottom-5 right-4 md:bottom-12 md:right-12 px-8 md:px-12 py-4 md:py-6 rounded-full font-black text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all z-50",
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

const Problem = () => {
    return (
        <section id="problem" className="py-20 md:py-32 bg-white relative border-b border-black/10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center text-left">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-px bg-black/30"></span>
                            <span className="text-[9px] uppercase tracking-[0.6em] text-black/40 font-bold">El Reencuadre</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-title leading-[0.9] tracking-tighter uppercase mb-8 text-black">
                            El modelo de <br />
                            <span className="text-black/20 italic">"contratar para crecer"</span><br />
                            <strong>está roto.</strong>
                        </h2>
                    </div>
                    <div className="space-y-6">
                        <p className="text-base md:text-lg text-black/60 leading-relaxed">
                            La mayoría de los dueños de negocio en <strong className="text-black">Aguascalientes</strong> creen que para vender más necesitan más empleados. Pero más empleados significa <strong className="text-black">más sueldos, más supervisión y más errores humanos.</strong>
                        </p>
                        <div className="p-6 md:p-8 bg-black rounded-2xl">
                            <h3 className="text-[9px] uppercase tracking-[0.4em] font-black mb-4 text-white/50">La Diferencia Diabolical</h3>
                            <p className="text-sm md:text-base text-white/70 leading-relaxed">
                                No somos una agencia de marketing ni una empresa de software. <strong className="text-white">Somos ingenieros de libertad.</strong> Instalamos <strong className="text-white">"empleados digitales"</strong> que no duermen, no piden aumentos y atienden a mil clientes al mismo tiempo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SolutionCards = () => {
    const solutions = [
        {
            tag: "VENTAS",
            title: "El Vendedor que no duerme",
            desc: <>¿Te ha pasado que un cliente escribe a las <strong>11 PM</strong> y nadie le contesta hasta el día siguiente? Para entonces, <strong>ya le compró a tu competencia.</strong> Nuestro sistema responde, da precios y cierra la cita en segundos, a cualquier hora.</>,
            icon: <Users size={20} />
        },
        {
            tag: "SEGUIMIENTO",
            title: "El Olvido Cero",
            desc: <>Muchos clientes dicen <strong>'luego te aviso'</strong> y se pierden para siempre porque a tu equipo se le olvidó marcarles. Nuestro sistema les da <strong>seguimiento automático</strong> hasta que digan que sí. Tú solo recibes la confirmación.</>,
            icon: <Activity size={20} />
        },
        {
            tag: "OPERACIONES",
            title: "El Administrador Perfecto",
            desc: <>Deja de ser el <strong>secretario de tu propio negocio.</strong> El sistema registra datos, agenda en tu calendario y te avisa qué tienes que hacer. <strong>Tú solo ejecutas, el sistema organiza.</strong></>,
            icon: <Cpu size={20} />
        }
    ];

    return (
        <section id="solutions" className="py-16 md:py-28 bg-black relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-3">Soluciones Autónomas</h2>
                    <p className="text-white/30 uppercase tracking-[0.3em] text-[9px] font-bold">Identificación de Fricción & Resolución Digital</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 text-left">
                    {solutions.map((s, i) => (
                        <div key={i} className="glass-card p-7 md:p-9 rounded-3xl border-white/5 hover:border-white/20 transition-all group flex flex-col gap-5">
                            <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                {s.icon}
                            </div>
                            <div>
                                <span className="text-[8px] font-black tracking-[0.5em] text-white/20 block mb-2 uppercase">{s.tag}</span>
                                <h3 className="text-lg md:text-xl font-title mb-3 leading-tight">{s.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Contact = () => {
    const [form, setForm] = useState({ source: 'WhatsApp / Instagram', people: '', aspiration: '', name: '', email: '', whatsapp: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const msg = `🟢 *DIAGNÓSTICO RÁPIDO — DIABOLICAL*\n\n*Nombre:* ${form.name}\n*WhatsApp:* ${form.whatsapp}\n*Email:* ${form.email}\n\n*¿Cómo llegan sus clientes?:* ${form.source}\n*Personas que atienden:* ${form.people}\n*Si fuera automático:* ${form.aspiration}`;
        const encoded = encodeURIComponent(msg);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        let url = `https://api.whatsapp.com/send?phone=524495136907&text=${encoded}`;
        if (isAndroid) {
            url = `intent://send/?phone=524495136907&text=${encoded}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
        } else if (isIOS) {
            url = `whatsapp://send?phone=524495136907&text=${encoded}`;
        }

        const a = document.createElement('a');
        a.href = url;
        if (!isAndroid && !isIOS) a.target = '_blank';
        else a.target = '_top';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 150);

        setSent(true);
    };

    const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-all min-h-[52px] placeholder:text-white/25';

    return (
        <section id="contact" className="py-16 md:py-28 bg-black relative border-t border-white/5">
            <div className="max-w-3xl mx-auto px-5 md:px-6">
                <div className="text-center mb-10 md:mb-12">
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full mb-4">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-black">Diagnóstico</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-4 leading-[0.9]">
                        ¿Tu negocio es apto para{' '}
                        <span className="text-white/25 italic">ser autónomo?</span>
                    </h2>
                    <p className="text-white/50 text-sm max-w-xl mx-auto italic font-light leading-relaxed">
                        "Solo trabajamos con negocios que tienen <strong className="text-white/70 not-italic">flujo de clientes</strong> y quieren dejar de operarlos manualmente."
                    </p>
                </div>

                <div className="glass-card p-6 md:p-10 rounded-3xl border-white/10 shadow-2xl">
                    {sent ? (
                        <div className="flex flex-col items-center text-center py-10 gap-5">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <CheckCircle2 size={28} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-title uppercase text-white mb-2">¡Mensaje Enviado!</h3>
                                <p className="text-sm text-white/50 leading-relaxed">Te contactaremos pronto por WhatsApp para presentarte tu plan de automatización.</p>
                            </div>
                            <button onClick={() => setSent(false)} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">Enviar otro</button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-[9px] uppercase tracking-[0.4em] font-black mb-6 md:mb-8 text-center text-white/30">Cuestionario de Fricción</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">¿Cómo llegan tus clientes?</label>
                                        <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} className={inp + ' appearance-none'}>
                                            <option className="bg-black">WhatsApp / Instagram</option>
                                            <option className="bg-black">Boca en Boca</option>
                                            <option className="bg-black">Publicidad Pagada (Ads)</option>
                                            <option className="bg-black">Google / SEO Local</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">¿Cuántas personas atienden hoy?</label>
                                        <input type="number" placeholder="Ej: 3" value={form.people} onChange={e => setForm(p => ({ ...p, people: e.target.value }))} className={inp} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">Si fuera automático, ¿qué harías con tu tiempo libre?</label>
                                    <input type="text" placeholder="Ej: escalar, viajar, pasar tiempo con mi familia..." value={form.aspiration} onChange={e => setForm(p => ({ ...p, aspiration: e.target.value }))} className={inp} />
                                </div>

                                <div className="border-t border-white/5 pt-4 space-y-4">
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black text-center">Datos de Contacto</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">Tu nombre</label>
                                            <input required type="text" placeholder="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">WhatsApp</label>
                                            <input required type="tel" placeholder="+52 449 000 0000" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} className={inp} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">Correo electrónico</label>
                                        <input required type="email" placeholder="tu@correo.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inp} />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mt-2 min-h-[60px]">
                                    Solicitar Diagnóstico Gratuito →
                                </button>
                                <p className="text-[9px] text-white/20 text-center">Te contactaremos solo si tu negocio es un buen candidato.</p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

const ComparisonSection = () => {
    const rows = [
        { bad: "Pagas nóminas, seguros y bonos cada mes.", good: "Una inversión fija que se paga sola." },
        { bad: "El crecimiento depende de tu cansancio.", good: "El sistema escala sin que tú trabajes más." },
        { bad: "Ventas perdidas por falta de respuesta.", good: "Cada mensaje es una oportunidad cerrada." },
        { bad: "Vives pegado al celular.", good: "Recuperas tus domingos." },
    ];
    return (
        <section id="comparison" className="py-16 md:py-28 bg-white border-y border-black/10 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-5 md:px-6 relative z-10">
                <div className="text-center mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-title uppercase tracking-tighter mb-2 text-black">La Lógica del Ahorro</h2>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-black/30 font-bold">Escalabilidad vs Estancamiento</p>
                </div>

                {/* Header row */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 px-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-black/20 flex-shrink-0"></span>
                        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-black/40 font-black">Si sigues igual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0"></span>
                        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-black font-black">Con Diabolical</span>
                    </div>
                </div>

                {/* Comparison rows */}
                <div className="space-y-1.5 md:space-y-2">
                    {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 gap-1.5 md:gap-4 rounded-xl md:rounded-2xl overflow-hidden">
                            <div className="bg-black/5 px-3 md:px-5 py-3.5 md:py-4 flex items-start gap-2 md:gap-3">
                                <span className="text-black/30 text-base leading-none flex-shrink-0 mt-0.5">✗</span>
                                <span className="text-[11px] md:text-sm text-black/50 leading-snug">{row.bad}</span>
                            </div>
                            <div className="bg-black px-3 md:px-5 py-3.5 md:py-4 flex items-start gap-2 md:gap-3">
                                <span className="text-white text-base leading-none flex-shrink-0 mt-0.5">✓</span>
                                <span className="text-[11px] md:text-sm text-white font-bold leading-snug">{row.good}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const BoldHook = () => {
    return (
        <section className="py-16 md:py-36 bg-black relative">
            <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
                <div className="inline-block px-4 py-1.5 border border-red-500/20 rounded-full mb-6 md:mb-8">
                    <span className="text-[8px] text-red-500 uppercase tracking-[0.5em] font-black animate-pulse">Alerta Financiera</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-6xl font-title tracking-tighter uppercase mb-6 md:mb-8 leading-[0.9]">
                    Cada minuto que pasas leyendo esto,{' '}
                    <span className="text-white/20">estás perdiendo dinero.</span>
                </h2>
                <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
                    <p className="text-sm md:text-lg text-white/60 leading-relaxed">
                        Mientras tu equipo dedica horas a contestar las <strong className="text-white">mismas 10 preguntas</strong> por WhatsApp, tus competidores más ágiles te están <strong className="text-white">robando mercado.</strong> No estás ahorrando al no automatizar; estás pagando un <span className="text-white underline underline-offset-4 decoration-white/20">"impuesto por ineficiencia"</span> que te sale más caro que cualquier nómina.
                    </p>
                    <p className="text-lg md:text-2xl font-title text-white italic tracking-tight pt-5 md:pt-6 border-t border-white/5">
                        "No tienes un problema de ventas, tienes un <strong>problema de sistema.</strong>"
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
        <main className="relative bg-black min-h-screen selection:bg-white selection:text-black font-jakarta overflow-x-hidden">
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
            <DiabolicalChatbot />
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

