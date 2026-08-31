import React from 'react';

/*
 * El proceso completo con plazos y con lo que cuesta al cliente en tiempo.
 * Ningún competidor local publica ninguna de las dos cosas, y para un dueño
 * de negocio pequeño —que es quien tendría que sacar ese tiempo— esa es la
 * objeción real.
 *
 * Los plazos coinciden con las FAQ y con llms.txt. Si cambian aquí, cambian
 * también en server/schema.js.
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

const Mecanismo = () => (
    <section id="mecanismo" className="seccion superficie-1">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    De la llamada a funcionando: 2 a 4 semanas
                </h2>
                <p className="text-white/55 text-base leading-relaxed font-light">
                    Esto es lo que pasa, cuándo pasa, y cuánto tiempo tuyo se lleva cada paso.
                </p>
            </div>

            <ol className="relative border-l border-white/15 ml-3 md:ml-0 space-y-10 md:space-y-12">
                {PASOS.map((paso) => (
                    <li key={paso.n} className="relative pl-8 md:pl-12">
                        {/* Nodo sobre la línea de tiempo */}
                        <span
                            aria-hidden="true"
                            className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-white"
                        />
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                            <h3 className="text-lg md:text-2xl font-title uppercase tracking-tight text-white leading-tight">
                                {paso.titulo}
                            </h3>
                            <span className="etiqueta-mono text-white/50 cifras">{paso.plazo}</span>
                        </div>
                        <p className="text-sm md:text-[15px] text-white/60 leading-relaxed font-light max-w-2xl mb-2">
                            {paso.detalle}
                        </p>
                        <p className="text-sm text-white/55 leading-relaxed max-w-2xl">
                            <span className="text-white/70 font-semibold">Tu parte: </span>
                            {paso.tuParte}
                        </p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default Mecanismo;
