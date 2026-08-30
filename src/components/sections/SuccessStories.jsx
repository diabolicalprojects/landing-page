import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const SuccessStories = () => {
    const cases = [
        {
            client: "Clínica Médica Premium",
            metric: "+340%",
            metricLabel: "Citas Agendadas",
            detail: "Sustitución de agendamiento manual por un agente conversacional de WhatsApp con IA 24/7 integrado al CRM de la clínica.",
            result: "Cero fricción en la agenda y respuestas en <10 segundos."
        },
        {
            client: "Despacho Legal & Fiscal",
            metric: "18 hrs/sem",
            metricLabel: "Tiempo Liberado",
            detail: "Automatización de filtrado de prospectos de alto valor y recopilación autónoma de documentos contables preliminares.",
            result: "El equipo legal solo atiende casos ya calificados."
        },
        {
            client: "Distribuidora Industrial",
            metric: "+42%",
            metricLabel: "Conversión de Leads",
            detail: "Flujo inteligente 'Olvido Cero' para reactivación automática de cotizaciones no concluidas mediante integraciones dinámicas.",
            result: "Recuperación de cartera vencida de forma 100% pasiva."
        }
    ];

    return (
        <section id="cases" className="py-16 md:py-28 bg-[#050505] border-t border-white/5 relative">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/[0.01] blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full mb-4">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-white/60 font-black">Prueba Social</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-3">Casos de Éxito</h2>
                    <p className="text-white/60 uppercase tracking-[0.3em] text-[9px] font-bold">Métricas Reales e Impacto de Negocio</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {cases.map((c, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/15 transition-all group flex flex-col justify-between min-h-[320px]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">{c.client}</span>
                                    <Sparkles size={14} className="text-white/20 group-hover:text-white transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-4xl md:text-5xl font-title tracking-tighter text-white font-black">{c.metric}</div>
                                    <div className="text-[9px] font-mono tracking-[0.2em] text-white/60 uppercase font-bold">{c.metricLabel}</div>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed font-light">{c.detail}</p>
                            </div>
                            <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-white/60 flex-shrink-0" />
                                <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider leading-snug">{c.result}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
