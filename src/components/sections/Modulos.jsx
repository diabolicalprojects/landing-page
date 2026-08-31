import React from 'react';
import { MessageSquare, CalendarCheck, BellRing, RotateCcw, ArrowRight } from 'lucide-react';

/*
 * Lo que se instala, contado como producto y no como promesa. Cada módulo
 * lleva su límite integrado — qué deriva a una persona — porque decir dónde
 * se detiene el sistema es el diferencial de la casa, no un descargo.
 *
 * Sustituye a las antiguas SolutionCards ("El Vendedor Incansable", "El
 * Administrador Perfecto"): personajes de humo, fuera; piezas concretas de
 * infraestructura, dentro.
 */
const MODULOS = [
    {
        icono: MessageSquare,
        nombre: 'Primera respuesta',
        que: 'Contesta en segundos, a cualquier hora, con la información estable de tu negocio: precios, horarios, ubicación, preparación previa.',
        limite: 'Una queja o una duda de criterio se pasa a tu equipo al momento.',
    },
    {
        icono: CalendarCheck,
        nombre: 'Agenda conectada',
        que: 'Propone solo huecos que existen de verdad en tu calendario y deja la cita escrita donde ya la llevas: Google Calendar, tu software o tu CRM.',
        limite: 'Tú decides qué servicios se agendan solos y cuáles requieren llamada.',
    },
    {
        icono: BellRing,
        nombre: 'Confirmación y recordatorio',
        que: 'Confirma la asistencia y recuerda antes de cada cita, para que los huecos se liberen a tiempo y se puedan reasignar.',
        limite: 'Los tiempos y el tono los apruebas tú antes de que salga el primer mensaje.',
    },
    {
        icono: RotateCcw,
        nombre: 'Seguimiento',
        que: 'Las cotizaciones sin cerrar y los clientes que no regresan entran a un flujo escalonado de recordatorios por WhatsApp.',
        limite: 'Con tope de mensajes: insistir sin límite es spam y quema tu número.',
    },
];

const Modulos = () => (
    <section id="modulos" className="seccion bg-black relative">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    Cuatro módulos. Los que necesites.
                </h2>
                <p className="text-white/55 text-base leading-relaxed font-light">
                    No es un paquete cerrado: la auditoría dice cuáles te hacen falta y cuáles
                    no valen la pena en tu caso. Cada uno sabe dónde detenerse.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
                {MODULOS.map((m) => (
                    <article key={m.nombre} className="bg-black p-7 md:p-10 hover:bg-white/[0.03] transition-colors">
                        <m.icono size={22} className="text-white/50 mb-5" aria-hidden="true" />
                        <h3 className="text-xl md:text-2xl font-title uppercase tracking-tight text-white leading-tight mb-3">
                            {m.nombre}
                        </h3>
                        <p className="text-sm md:text-[15px] text-white/60 leading-relaxed font-light mb-5">{m.que}</p>
                        <p className="text-sm text-white/55 leading-relaxed border-l-2 border-white/15 pl-4">
                            <span className="text-white/70 font-semibold">Dónde se detiene: </span>
                            {m.limite}
                        </p>
                    </article>
                ))}
            </div>

            <a
                href="#contact"
                className="inline-flex items-center gap-2 mt-6 py-3 text-sm text-white/60 hover:text-white transition-colors accion"
            >
                Saber cuáles necesita mi negocio <ArrowRight size={15} aria-hidden="true" />
            </a>
        </div>
    </section>
);

export default Modulos;
