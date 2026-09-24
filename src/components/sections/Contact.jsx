import React, { useState } from 'react';

import { interesDeLaDireccion } from '../../utils/cta';
import { useHydrated } from '../../utils/useHydrated';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

import { openWhatsApp, sendLead } from '../../utils/leads';
import { medir } from '../../utils/medicion';
import { CONTACT_EMAIL } from '../../config';
import { useBloque } from '../../contenido';

/*
 * El formulario. El embudo no cambia: se envía el prospecto y se abre WhatsApp
 * con el resumen escrito. Eso es intocable (ver PRODUCT.md); lo que cambia es
 * cómo se ve y cómo se dice.
 *
 * Sigue avisando cuando el envío no llegó, con la salida por correo a la vista:
 * el peor final posible es que alguien crea que escribió y no le conteste nadie.
 */

const VACIO = {
    source: 'WhatsApp / Instagram',
    people: '',
    aspiration: '',
    company: '',
    name: '',
    email: '',
    whatsapp: '',
};

const Campo = ({ etiqueta, id, children }) => (
    <div className="flex flex-col gap-2">
        <label htmlFor={id} className="etiqueta text-white/55">
            {etiqueta}
        </label>
        {children}
    </div>
);

const Contact = () => {
    const [form, setForm] = useState(VACIO);
    const [enviado, setEnviado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [entregado, setEntregado] = useState(true);
    // Trampa para bots: rellenan todos los campos, las personas no ven este.
    const [trampa, setTrampa] = useState('');

    // Quien llega desde «Cotizar mi chatbot» trae el servicio y el giro en la
    // dirección: se deja escrito en «qué le gustaría» para que no tenga que
    // redactarlo. Solo en el navegador (el servidor no ve la consulta), y solo
    // si el campo sigue vacío. Se ajusta durante el render, no en un efecto.
    const hidratado = useHydrated();
    const [interesLeido, setInteresLeido] = useState(false);
    if (hidratado && !interesLeido) {
        setInteresLeido(true);
        const interes = interesDeLaDireccion(window.location.search);
        if (interes) setForm((previo) => (previo.aspiration ? previo : { ...previo, aspiration: interes }));
    }

    const { visible, titulo, subtitulo, entradilla, boton, pie } = useBloque('contacto');

    if (visible === false) return null;

    const resumen = `🟢 *DIAGNÓSTICO RÁPIDO — DIABOLICAL*\n\n*Empresa:* ${form.company}\n*Nombre:* ${form.name}\n*WhatsApp:* ${form.whatsapp}\n*Email:* ${form.email}\n\n*¿Cómo llegan sus clientes?:* ${form.source}\n*Personas que atienden:* ${form.people}\n*Si fuera automático:* ${form.aspiration}`;

    const enviar = async (evento) => {
        evento.preventDefault();
        if (trampa) return;

        setEnviando(true);
        const ok = await sendLead({ type: 'contact_form', ...form });
        setEntregado(ok);

        medir('generate_lead', {
            form_id: 'contact_form',
            delivered: ok,
            lead_source: form.source,
        });

        setEnviando(false);
        openWhatsApp(resumen);
        setEnviado(true);
    };

    const campo =
        'min-h-[3.25rem] w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-white transition-colors duration-150 placeholder:text-white/25 focus:border-white/30 focus:outline-none';

    return (
        <section id="contacto" className="zona-oscura seccion">
            <div className="contenedor">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-5">
                        <h2 className="titular-l">
                            {titulo} <span className="titular-apagado">{subtitulo}</span>
                        </h2>
                        <p className="cuerpo-l mt-6">{entradilla}</p>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="tarjeta p-6 md:p-9">
                            {enviado ? (
                                <div className="flex flex-col items-start gap-5 py-6">
                                    <span
                                        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
                                        aria-hidden="true"
                                    >
                                        {entregado ? (
                                            <CheckCircle2
                                                size={26}
                                                style={{ color: 'var(--acento)' }}
                                            />
                                        ) : (
                                            <AlertCircle size={26} style={{ color: 'var(--acento)' }} />
                                        )}
                                    </span>

                                    <div>
                                        <h3 className="titular-m">
                                            {entregado ? 'Recibido' : 'Falta un paso'}
                                        </h3>
                                        <p className="cuerpo mt-3">
                                            {entregado
                                                ? 'Se abrió su WhatsApp con el resumen. Pulse enviar y seguimos por ahí.'
                                                : 'Se abrió su WhatsApp con el resumen, pero sus datos no llegaron a nuestro sistema. Pulse enviar en WhatsApp o use el botón de abajo: con cualquiera de los dos nos llega.'}
                                        </p>
                                    </div>

                                    {!entregado && (
                                        <div role="alert" className="w-full">
                                            <a
                                                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                                                    `Diagnóstico gratuito — ${form.company}`
                                                )}&body=${encodeURIComponent(resumen.replace(/\*/g, ''))}`}
                                                className="boton boton-acento w-full"
                                            >
                                                Enviarlo por correo
                                            </a>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEnviado(false);
                                            setForm(VACIO);
                                            setEntregado(true);
                                        }}
                                        className="boton boton-fantasma"
                                    >
                                        Enviar otro
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={enviar} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Campo etiqueta="¿Cómo llegan tus clientes?" id="source-select">
                                            <select
                                                id="source-select"
                                                value={form.source}
                                                onChange={(e) =>
                                                    setForm((p) => ({ ...p, source: e.target.value }))
                                                }
                                                className={`${campo} appearance-none`}
                                            >
                                                <option className="bg-black">WhatsApp / Instagram</option>
                                                <option className="bg-black">Boca en boca</option>
                                                <option className="bg-black">Publicidad pagada</option>
                                                <option className="bg-black">Google / SEO local</option>
                                                <option className="bg-black">Portales inmobiliarios</option>
                                            </select>
                                        </Campo>

                                        <Campo etiqueta="¿Cuántas personas atienden hoy?" id="people-input">
                                            <input
                                                id="people-input"
                                                type="number"
                                                min="0"
                                                placeholder="Ej: 3"
                                                value={form.people}
                                                onChange={(e) =>
                                                    setForm((p) => ({ ...p, people: e.target.value }))
                                                }
                                                className={campo}
                                            />
                                        </Campo>
                                    </div>

                                    <Campo
                                        etiqueta="Si fuera automático, ¿qué harías con ese tiempo?"
                                        id="aspiration-input"
                                    >
                                        <input
                                            id="aspiration-input"
                                            type="text"
                                            placeholder="Ej: crecer, dormir, ver a mis hijos..."
                                            value={form.aspiration}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, aspiration: e.target.value }))
                                            }
                                            className={campo}
                                        />
                                    </Campo>

                                    <div className="space-y-4 border-t border-white/10 pt-5">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Campo etiqueta="Nombre de la empresa" id="company-input">
                                                <input
                                                    id="company-input"
                                                    required
                                                    type="text"
                                                    placeholder="Tu negocio"
                                                    value={form.company}
                                                    onChange={(e) =>
                                                        setForm((p) => ({ ...p, company: e.target.value }))
                                                    }
                                                    className={campo}
                                                />
                                            </Campo>

                                            <Campo etiqueta="Tu nombre" id="name-input">
                                                <input
                                                    id="name-input"
                                                    required
                                                    type="text"
                                                    autoComplete="name"
                                                    placeholder="Nombre"
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        setForm((p) => ({ ...p, name: e.target.value }))
                                                    }
                                                    className={campo}
                                                />
                                            </Campo>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Campo etiqueta="WhatsApp" id="whatsapp-input">
                                                <input
                                                    id="whatsapp-input"
                                                    required
                                                    type="tel"
                                                    autoComplete="tel"
                                                    placeholder="+52 449 000 0000"
                                                    value={form.whatsapp}
                                                    onChange={(e) =>
                                                        setForm((p) => ({ ...p, whatsapp: e.target.value }))
                                                    }
                                                    className={campo}
                                                />
                                            </Campo>

                                            <Campo etiqueta="Correo electrónico" id="email-input">
                                                <input
                                                    id="email-input"
                                                    required
                                                    type="email"
                                                    autoComplete="email"
                                                    placeholder="tu@correo.com"
                                                    value={form.email}
                                                    onChange={(e) =>
                                                        setForm((p) => ({ ...p, email: e.target.value }))
                                                    }
                                                    className={campo}
                                                />
                                            </Campo>
                                        </div>
                                    </div>

                                    {/* Oculto para personas, irresistible para bots. */}
                                    <div className="absolute left-[-9999px]" aria-hidden="true">
                                        <label htmlFor="company-website">No rellenar</label>
                                        <input
                                            id="company-website"
                                            name="company-website"
                                            type="text"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={trampa}
                                            onChange={(e) => setTrampa(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className="boton boton-acento mt-2 w-full"
                                    >
                                        {enviando ? 'Enviando...' : boton}
                                        {!enviando && <ArrowRight size={16} aria-hidden="true" />}
                                    </button>

                                    <p className="text-center text-sm leading-snug text-white/55">
                                        {pie}
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
