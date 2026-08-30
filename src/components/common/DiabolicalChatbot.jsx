import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { openWhatsApp, sendLead } from '../../utils/leads';
import { CONTACT_EMAIL } from '../../config';
import chatbotIcon from '../../assets/logo/icono-diabolical-chatbot.svg';

const EMPTY_CONTACT = { name: '', company: '', whatsapp: '', email: '' };

const DiabolicalChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [contact, setContact] = useState(EMPTY_CONTACT);
    const [isSending, setIsSending] = useState(false);
    const [delivered, setDelivered] = useState(true);
    const [botTrap, setBotTrap] = useState('');

    const panelRef = useRef(null);
    const triggerRef = useRef(null);

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

    const handleClose = useCallback(() => {
        setIsOpen(false);
        triggerRef.current?.focus();
        setTimeout(() => {
            setStep(0);
            setAnswers({});
            setContact(EMPTY_CONTACT);
            setDelivered(true);
        }, 350);
    }, []);

    // Diálogo modal: Escape lo cierra y Tab no puede salirse del panel.
    useEffect(() => {
        if (!isOpen) return undefined;

        const focusables = () =>
            Array.from(
                panelRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) ?? []
            ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleClose();
                return;
            }
            if (event.key !== 'Tab') return;

            const items = focusables();
            if (items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        // Deja el foco dentro del panel al abrirlo.
        const timer = setTimeout(() => focusables()[0]?.focus(), 50);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            clearTimeout(timer);
        };
    }, [isOpen, step, handleClose]);

    const handleAnswer = (value) => {
        setAnswers(prev => ({ ...prev, [questions[step].id]: value }));
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (botTrap) return;

        setIsSending(true);
        const ok = await sendLead({ type: 'chatbot', contact, answers });
        setDelivered(ok);
        setIsSending(false);

        openWhatsApp(
            `🔴 *NUEVO DIAGNÓSTICO DIABOLICAL*\n\n*Empresa:* ${contact.company}\n*Nombre:* ${contact.name}\n*WhatsApp:* ${contact.whatsapp}\n*Email:* ${contact.email}\n\n*1. Fricción:* ${answers.friction}\n*2. Volumen:* ${answers.volume}\n*3. Dependencia:* ${answers.dependency}\n*4. Impacto Estimado:* ${answers.budget}\n*5. Potencial:* ${answers.impact}`
        );

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
                ref={triggerRef}
                onClick={() => isOpen ? handleClose() : setIsOpen(true)}
                aria-label={isOpen ? 'Cerrar diagnóstico Diabolical' : 'Abrir diagnóstico Diabolical'}
                aria-expanded={isOpen}
                aria-controls="diabolical-chat-panel"
                className={cn(
                    "fixed bottom-6 right-5 md:bottom-8 md:right-8 z-[60] w-16 h-16 rounded-full bg-black border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95",
                    !isOpen && "chatbot-btn-idle"
                )}
            >
                {isOpen
                    ? <X size={20} className="text-white" />
                    : <img src={chatbotIcon} alt="Diabolical" width="40" height="40" className="w-10 h-10" />
                }
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    id="diabolical-chat-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="diabolical-chat-title"
                    className="chatbot-panel fixed z-50 flex flex-col bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    style={{ bottom: '6rem', right: '1.25rem', width: 'min(calc(100vw - 2.5rem), 22rem)', maxHeight: 'calc(100dvh - 8rem)' }}
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <img src={chatbotIcon} alt="" width="24" height="24" className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p id="diabolical-chat-title" className="text-xs font-black uppercase tracking-widest text-white leading-none">Diagnóstico Diabolical</p>
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
                                    {!delivered && (
                                        <p role="alert" className="text-[11px] text-yellow-500/90 leading-relaxed pt-2">
                                            No pudimos registrar tus datos automáticamente. Si WhatsApp no se
                                            abrió, escríbenos a{' '}
                                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline">{CONTACT_EMAIL}</a>.
                                        </p>
                                    )}
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
                                    <input required type="text" placeholder="Nombre de tu empresa" aria-label="Nombre de tu empresa" value={contact.company} onChange={e => setContact(p => ({ ...p, company: e.target.value }))} className={inp} />
                                    <input required type="text" placeholder="Tu nombre (Contacto)" aria-label="Tu nombre" value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))} className={inp} />
                                    <input required type="tel" placeholder="WhatsApp (+52 449 000 0000)" aria-label="Teléfono o WhatsApp" value={contact.whatsapp} onChange={e => setContact(p => ({ ...p, whatsapp: e.target.value }))} className={inp} />
                                    <input required type="email" placeholder="tu@correo.com" aria-label="Correo electrónico" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} className={inp} />
                                </div>
                                {/* Honeypot: oculto para personas, irresistible para bots. */}
                                <div className="absolute left-[-9999px]" aria-hidden="true">
                                    <label htmlFor="chat-website">No rellenar</label>
                                    <input id="chat-website" name="chat-website" type="text" tabIndex={-1} autoComplete="off" value={botTrap} onChange={e => setBotTrap(e.target.value)} />
                                </div>

                                <button type="submit" disabled={isSending} className="w-full py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all min-h-[56px] disabled:opacity-50 disabled:hover:scale-100">
                                    {isSending ? 'Enviando...' : 'Enviar por WhatsApp →'}
                                </button>
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

export default DiabolicalChatbot;
