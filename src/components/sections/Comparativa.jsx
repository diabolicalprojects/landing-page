import React from 'react';

/*
 * La semana del dueño, antes y después. Sustituye a la antigua
 * ComparisonSection blanca: mismo argumento persuasivo, pero en pares
 * concretos y dentro del mundo oscuro coherente — ya no hay losas invertidas.
 * Cada par describe el mecanismo, no un resultado con cifra: lo segundo no
 * lo podemos probar y no se publica.
 */
const PARES = [
    {
        hoy: 'El mensaje de las 9 de la noche se contesta mañana.',
        despues: 'Se contesta en segundos, y si trae cita, sale agendada.',
    },
    {
        hoy: 'Recepción atrapada entre el mostrador, el teléfono y el chat.',
        despues: 'El sistema absorbe lo repetitivo; tu equipo atiende personas.',
    },
    {
        hoy: 'Huecos muertos porque nadie alcanzó a confirmar.',
        despues: 'Confirmación y recordatorio automáticos; el hueco se libera a tiempo.',
    },
    {
        hoy: 'Cotizaciones enviadas que nadie retoma.',
        despues: 'Seguimiento escalonado con tope de mensajes, sin depender de la memoria.',
    },
    {
        hoy: 'El dueño pegado al celular hasta el domingo.',
        despues: 'El celular trabaja; el domingo vuelve a ser tuyo.',
    },
];

const Comparativa = () => (
    <section id="comparativa" className="seccion bg-black">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="max-w-2xl mb-12 md:mb-16">
                <h2 className="text-3xl md:text-5xl font-title uppercase tracking-tighter leading-[0.95] mb-4">
                    Tu semana, antes y después
                </h2>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden">
                {/* Cabecera */}
                <div className="grid grid-cols-2 gap-px bg-white/10">
                    <p className="bg-black px-5 md:px-8 py-4 etiqueta text-white/55">Hoy</p>
                    <p className="bg-black px-5 md:px-8 py-4 etiqueta text-white">Con el sistema</p>
                </div>
                {PARES.map((par) => (
                    <div key={par.hoy} className="grid grid-cols-2 gap-px bg-white/10 border-t border-white/10">
                        <p className="bg-black px-5 md:px-8 py-5 text-sm md:text-[15px] text-white/55 leading-relaxed font-light">
                            {par.hoy}
                        </p>
                        <p className="bg-black px-5 md:px-8 py-5 text-sm md:text-[15px] text-white/80 leading-relaxed">
                            {par.despues}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Comparativa;
