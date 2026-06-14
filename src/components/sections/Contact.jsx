import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Contact = () => {
    const [form, setForm] = useState({ source: 'WhatsApp / Instagram', people: '', aspiration: '', company: '', name: '', email: '', whatsapp: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await fetch('https://n8n.diabolicalservices.tech/webhook/9b0c65c5-32f4-4f80-aa01-0730f9812e88', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'contact_form',
                    ...form
                })
            });
        } catch (error) {
            console.error('Error sending to n8n:', error);
        }

        const msg = `🟢 *DIAGNÓSTICO RÁPIDO — DIABOLICAL*\n\n*Empresa:* ${form.company}\n*Nombre:* ${form.name}\n*WhatsApp:* ${form.whatsapp}\n*Email:* ${form.email}\n\n*¿Cómo llegan sus clientes?:* ${form.source}\n*Personas que atienden:* ${form.people}\n*Si fuera automático:* ${form.aspiration}`;
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
                        <span className="text-[8px] uppercase tracking-[0.4em] text-white/60 font-black">Diagnóstico</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-4 leading-[0.9]">
                        ¿Tu negocio es apto para{' '}
                        <span className="text-white/50 italic">ser autónomo?</span>
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
                                        <label htmlFor="source-select" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">¿Cómo llegan tus clientes?</label>
                                        <select id="source-select" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} className={inp + ' appearance-none'}>
                                            <option className="bg-black">WhatsApp / Instagram</option>
                                            <option className="bg-black">Boca en Boca</option>
                                            <option className="bg-black">Publicidad Pagada (Ads)</option>
                                            <option className="bg-black">Google / SEO Local</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="people-input" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">¿Cuántas personas atienden hoy?</label>
                                        <input id="people-input" type="number" placeholder="Ej: 3" aria-label="Cantidad de personas que atienden" value={form.people} onChange={e => setForm(p => ({ ...p, people: e.target.value }))} className={inp} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="aspiration-input" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">Si fuera automático, ¿qué harías con tu tiempo libre?</label>
                                    <input id="aspiration-input" type="text" placeholder="Ej: escalar, viajar, pasar tiempo con mi familia..." aria-label="Qué harías con tu tiempo libre" value={form.aspiration} onChange={e => setForm(p => ({ ...p, aspiration: e.target.value }))} className={inp} />
                                </div>

                                <div className="border-t border-white/5 pt-4 space-y-4">
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black text-center">Datos de Contacto</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="company-input" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">Nombre de la Empresa</label>
                                            <input id="company-input" required type="text" placeholder="Empresa" aria-label="Nombre de la empresa" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className={inp} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="name-input" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">Tu nombre (Contacto)</label>
                                            <input id="name-input" required type="text" placeholder="Nombre" aria-label="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="whatsapp-input" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">WhatsApp</label>
                                            <input id="whatsapp-input" required type="tel" placeholder="+52 449 000 0000" aria-label="Número de WhatsApp" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} className={inp} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="email-input" className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold">Correo electrónico</label>
                                            <input id="email-input" required type="email" placeholder="tu@correo.com" aria-label="Correo electrónico" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inp} />
                                        </div>
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

export default Contact;
