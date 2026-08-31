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
        hoy: 'Quien te busca en Google encuentra antes a tu competencia.',
        despues: 'Sales tú, con una página por servicio y la ficha del mapa completa.',
    },
    {
        hoy: 'Si alguien le pregunta a ChatGPT por tu giro, no apareces.',
        despues: 'Tu sitio se puede leer y citar: casi nadie del mercado local lo trabaja.',
    },
    {
        hoy: 'Tu web tarda en cargar y no dice a qué te dedicas exactamente.',
        despues: 'Carga rápido, se lee en el celular y lleva a agendar sin rodeos.',
    },
    {
        hoy: 'El mensaje de las 9 de la noche se contesta mañana.',
        despues: 'Se contesta en segundos, y si trae cita, sale agendada.',
    },
    {
        hoy: 'Nadie sabe qué canal trae clientes y cuál solo da trabajo.',
        despues: 'Un tablero con los números reales de cada canal, hasta la cita.',
    },
    {
        hoy: 'El dueño pegado al celular hasta el domingo.',
        despues: 'El sistema trabaja; el domingo vuelve a ser tuyo.',
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
