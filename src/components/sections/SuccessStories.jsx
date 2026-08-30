import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

/*
 * Esta sección describe SISTEMAS, no resultados de clientes.
 *
 * Antes mostraba tres casos con cifras (+340% citas, 18 h/semana, +42% conversión)
 * bajo el rótulo "Métricas Reales" y con clientes nombrados. Ninguna venía de un
 * proyecto documentado, así que se reformuló: mismo formato, pero describiendo lo
 * que el sistema hace, que es verificable, en lugar de lo que consiguió, que no lo era.
 *
 * Si algún día hay un caso medido y defendible, va aquí con su cifra y su origen.
 * Mientras tanto se aplica la misma regla que en sectores.json: capacidades y
 * problemas típicos, nunca resultados atribuidos a un cliente.
 */
const SuccessStories = () => {
    const sistemas = [
        {
            sistema: "Agenda que se llena sola",
            ambito: "Clínicas · Spas · Gimnasios",
            detalle: "Un agente conversacional atiende WhatsApp a cualquier hora, consulta los huecos libres reales y deja la cita puesta en el calendario que ya usas.",
            alcance: "Confirma y recuerda antes de cada cita, sin que nadie lleve la lista."
        },
        {
            sistema: "Filtrado antes de la primera llamada",
            ambito: "Despachos y oficinas",
            detalle: "Las consultas entrantes se califican solas y el sistema reúne la documentación previa necesaria antes de que el caso llegue a una persona.",
            alcance: "El equipo dedica su tiempo a lo que encaja con el servicio."
        },
        {
            sistema: "Seguimiento que no se olvida",
            ambito: "Comercial y ventas",
            detalle: "Las cotizaciones sin cerrar entran en un flujo de recordatorios escalonados por WhatsApp y correo, conectado al CRM que ya tengas en uso.",
            alcance: "El seguimiento ocurre aunque nadie se acuerde de hacerlo."
        }
    ];

    return (
        <section id="cases" className="py-16 md:py-28 bg-[#050505] border-t border-white/5 relative">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/[0.01] blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full mb-4">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-white/60 font-black">Sistemas</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-3">Qué Instalamos</h2>
                    <p className="text-white/60 uppercase tracking-[0.3em] text-[9px] font-bold">Automatizaciones que quedan operando solas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {sistemas.map((s, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/15 transition-all group flex flex-col justify-between min-h-[320px]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">{s.ambito}</span>
                                    <Sparkles size={14} className="text-white/20 group-hover:text-white transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl md:text-3xl font-title tracking-tighter text-white font-black leading-[1.05]">{s.sistema}</div>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed font-light">{s.detalle}</p>
                            </div>
                            <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-white/60 flex-shrink-0" />
                                <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider leading-snug">{s.alcance}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
