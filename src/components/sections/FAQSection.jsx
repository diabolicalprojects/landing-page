import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import faqs from '../../data/faq.json';

/**
 * Las preguntas salen de src/data/faq.json, el mismo archivo del que
 * server/schema.js construye el FAQPage. Google exige que lo marcado en el
 * schema sea exactamente lo que ve el visitante: si fueran dos listas
 * separadas, acabarían divergiendo y el marcado sería infractor.
 */
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="seccion superficie-1 border-t border-white/5 relative">
            <div className="max-w-4xl mx-auto px-5 md:px-6 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-3">Preguntas Frecuentes</h2>
                    <p className="text-white/60 uppercase tracking-[0.3em] text-[9px] font-bold">Claridad técnica sobre la integración de sistemas</p>
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
                                    <span className="text-sm md:text-base font-bold tracking-wide">{faq.pregunta}</span>
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
                                        isOpen ? "max-h-[32rem] border-t border-white/5" : "max-h-0"
                                    )}
                                >
                                    <p className="px-6 py-5 text-xs md:text-sm text-white/50 leading-relaxed font-light">
                                        {faq.respuesta}
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
