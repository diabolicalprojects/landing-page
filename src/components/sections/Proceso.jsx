import React from 'react';

/**
 * Proceso e implicación real del cliente.
 *
 * Ninguno de los competidores directos publica plazos ni dice cuánto tiempo le
 * va a costar al cliente. Para un negocio pequeño —donde el dueño es quien
 * tendría que sacar ese tiempo— esa es justo la objeción que frena la compra.
 *
 * Los plazos coinciden con lo que se promete en las FAQ y en llms.txt. Si
 * cambian aquí, hay que cambiarlos también en server/schema.js.
 */
const PASOS = [
    {
        n: '01',
        titulo: 'Auditoría de fricción',
        plazo: 'Día 1 · gratis',
        detalle:
            'Revisamos por dónde se te escapan clientes y cuánto tiempo se va en tareas repetitivas. Sales con un diagnóstico escrito, aunque no trabajes con nosotros.',
        tuParte: 'Una conversación de 30 a 45 minutos.',
    },
    {
        n: '02',
        titulo: 'Diseño del flujo',
        plazo: 'Semana 1',
        detalle:
            'Definimos qué contesta el sistema, qué deriva a una persona y con qué tono. Aquí se decide lo que nunca debe responder solo.',
        tuParte: 'Revisar el guion y corregir lo que no suene a ti.',
    },
    {
        n: '03',
        titulo: 'Integración',
        plazo: 'Semanas 2 y 3',
        detalle:
            'Lo conectamos a tu WhatsApp, tu agenda y tu CRM. No cambiamos tus herramientas: el sistema se monta encima de lo que ya usas.',
        tuParte: 'Darnos los accesos. Nada más.',
    },
    {
        n: '04',
        titulo: 'Pruebas con casos reales',
        plazo: 'Semana 3',
        detalle:
            'Antes de que hable con un cliente, el sistema pasa por tus casos difíciles: el que regatea, el que pregunta algo raro, el que se equivoca de servicio.',
        tuParte: 'Probarlo tú mismo y decirnos qué falla.',
    },
    {
        n: '05',
        titulo: 'Puesta en marcha y ajuste',
        plazo: 'Semana 4 en adelante',
        detalle:
            'Arranca en vivo y lo afinamos con las conversaciones reales de las primeras semanas. Un sistema que nadie ajusta se degrada.',
        tuParte: 'Avisarnos cuando algo no te cuadre.',
    },
];

const Proceso = () => (
    <section id="proceso" className="py-16 md:py-28 bg-[#050505] border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto px-5 md:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                <div className="inline-block px-3 py-1 bg-white/5 rounded-full mb-4">
                    <span className="text-[8px] uppercase tracking-[0.4em] text-white/60 font-black">Proceso</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-4 leading-[0.95]">
                    De la primera llamada a <span className="text-white/50 italic">funcionando</span>: 2 a 4 semanas
                </h2>
                <p className="text-white/50 text-sm leading-relaxed font-light">
                    Sin sorpresas y sin que tengas que dedicarle tus tardes. Esto es lo que pasa,
                    cuándo pasa y qué necesitamos de ti en cada paso.
                </p>
            </div>

            <ol className="space-y-3">
                {PASOS.map((paso) => (
                    <li
                        key={paso.n}
                        className="glass-card rounded-3xl border-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-8"
                    >
                        <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-2 md:w-32 flex-shrink-0">
                            <span className="text-2xl md:text-3xl font-title text-white/25 tracking-tighter leading-none">
                                {paso.n}
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-black">
                                {paso.plazo}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3">
                            <h3 className="text-base md:text-lg font-title uppercase tracking-tight text-white leading-snug">
                                {paso.titulo}
                            </h3>
                            <p className="text-white/55 text-sm leading-relaxed font-light">{paso.detalle}</p>
                            {/* A 11px hace falta 4.5:1. /40 daba 3.7 y la
                                etiqueta en /30 daba 2.5, por debajo las dos. */}
                            <p className="text-[11px] text-white/55 leading-relaxed">
                                <span className="uppercase tracking-[0.2em] font-black text-white/65">Tu parte: </span>
                                {paso.tuParte}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default Proceso;
