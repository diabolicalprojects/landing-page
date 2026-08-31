import React from 'react';
import { Users, Activity, Cpu } from 'lucide-react';

const SolutionCards = () => {
    const solutions = [
        {
            tag: "VENTAS",
            title: "El Vendedor que no duerme",
            desc: <>¿Te ha pasado que un cliente escribe a las <strong>11 PM</strong> y nadie le contesta hasta el día siguiente? Para entonces, <strong>ya le compró a tu competencia.</strong> Nuestro sistema responde, da precios y cierra la cita en segundos, a cualquier hora.</>,
            icon: <Users size={20} />
        },
        {
            tag: "SEGUIMIENTO",
            title: "El Olvido Cero",
            desc: <>Muchos clientes dicen <strong>'luego te aviso'</strong> y se pierden para siempre porque a tu equipo se le olvidó marcarles. Nuestro sistema les da <strong>seguimiento automático</strong> hasta que digan que sí. Tú solo recibes la confirmación.</>,
            icon: <Activity size={20} />
        },
        {
            tag: "OPERACIONES",
            title: "El Administrador Perfecto",
            desc: <>Deja de ser el <strong>secretario de tu propio negocio.</strong> El sistema registra datos, agenda en tu calendario y te avisa qué tienes que hacer. <strong>Tú solo ejecutas, el sistema organiza.</strong></>,
            icon: <Cpu size={20} />
        }
    ];

    return (
        <section id="solutions" className="seccion bg-black relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="text-2xl md:text-4xl font-title uppercase tracking-tighter mb-3">Soluciones Autónomas</h2>
                    <p className="text-white/50 uppercase tracking-[0.3em] text-[9px] font-bold">Identificación de Fricción & Resolución Digital</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 text-left">
                    {solutions.map((s, i) => (
                        <div key={i} className="glass-card p-7 md:p-9 rounded-3xl border-white/5 hover:border-white/20 transition-all group flex flex-col gap-5">
                            <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                {s.icon}
                            </div>
                            <div>
                                {/* /20 daba 1.66:1: la categoría de cada tarjeta
                                    era ilegible. /60 sube a 7.4:1 sin cambiar
                                    tamaño ni maquetación. */}
                                <span className="text-[8px] font-black tracking-[0.5em] text-white/60 block mb-2 uppercase">{s.tag}</span>
                                <h3 className="text-lg md:text-xl font-title mb-3 leading-tight">{s.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionCards;
