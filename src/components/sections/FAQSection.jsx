import React, { useState } from 'react';
import { cn } from '../../utils/cn';

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "¿Qué hace exactamente Diabolical?",
            answer: "Diseñamos e instalamos \"empleados digitales\" y sistemas autónomos basados en Inteligencia Artificial. No somos una agencia de marketing tradicional; creamos infraestructura técnica que automatiza tus ventas, atención al cliente y operaciones 24/7."
        },
        {
            question: "¿Cómo sé si mi negocio está listo para la automatización con IA?",
            answer: "Si tu negocio ya tiene un flujo constante de clientes o prospectos (por WhatsApp, Instagram, correo o publicidad pagada) y tu equipo pasa horas respondiendo las mismas preguntas o agendando citas manualmente, estás 100% listo."
        },
        {
            question: "¿La IA va a reemplazar a mi equipo humano?",
            answer: "No. La IA se encarga de las tareas repetitivas y de bajo valor (como la primera respuesta, filtrado y agendamiento 24/7), liberando a tu equipo para que se concentre en el cierre de ventas complejas y la atención estratégica."
        },
        {
            question: "¿Cómo es el proceso de implementación y cuánto tarda?",
            answer: "Nuestra integración toma entre 2 y 4 semanas. Nos encargamos de todo: desde el diseño del flujo conversacional y la conexión con tus sistemas actuales (CRM, bases de datos), hasta las pruebas y puesta en marcha."
        },
        {
            question: "¿Qué es la Auditoría de Fricción Gratuita?",
            answer: "Es un diagnóstico completo donde analizamos los cuellos de botella y procesos manuales en los que tu negocio está perdiendo prospectos o dinero. Te entregamos un reporte detallado con las soluciones exactas de IA que necesitas."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-16 md:py-28 bg-[#030303] border-t border-white/5 relative">
            <div className="max-w-4xl mx-auto px-5 md:px-6 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full mb-4">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-white/40 font-black">Respuestas</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-3">Preguntas Frecuentes</h2>
                    <p className="text-white/40 uppercase tracking-[0.3em] text-[9px] font-bold">Claridad técnica sobre la integración de sistemas</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div 
                                key={i} 
                                className="glass-card rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFAQ(i)}
                                    className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 text-white hover:text-white/80 transition-colors"
                                >
                                    <span className="text-sm md:text-base font-bold tracking-wide">{faq.question}</span>
                                    <span className={cn(
                                        "w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs transition-transform duration-300 flex-shrink-0",
                                        isOpen && "rotate-45"
                                    )}>
                                        ＋
                                    </span>
                                </button>
                                <div 
                                    className={cn(
                                        "transition-all duration-300 ease-in-out overflow-hidden",
                                        isOpen ? "max-h-60 border-t border-white/5" : "max-h-0"
                                    )}
                                >
                                    <p className="px-6 py-5 text-xs md:text-sm text-white/50 leading-relaxed font-light">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
