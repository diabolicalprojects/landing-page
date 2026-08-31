import React from 'react';

const Problem = () => {
    // Primera inversión: el cambio a fondo claro es el separador, sin línea ni
    // recurso añadido. El ritmo amplio la marca como un tiempo fuerte.
    return (
        <section
            id="problem"
            className="seccion-amplia seccion-invertida bg-white relative"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center text-left">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-px bg-black/30"></span>
                            <span className="text-[9px] uppercase tracking-[0.6em] text-black/60 font-bold">El Reencuadre</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-title leading-[0.9] tracking-tighter uppercase mb-8 text-black">
                            El modelo de <br />
                            <span className="text-black/45 italic">"contratar para crecer"</span><br />
                            <strong>está roto.</strong>
                        </h2>
                    </div>
                    <div className="space-y-6">
                        <p className="text-base md:text-lg text-black/60 leading-relaxed">
                            La mayoría de los dueños de negocio en <strong className="text-black">Aguascalientes</strong> creen que para vender más necesitan más empleados. Pero más empleados significa <strong className="text-black">más sueldos, más supervisión y más errores humanos.</strong>
                        </p>
                        <div className="p-6 md:p-8 bg-black rounded-2xl">
                            <h3 className="text-[9px] uppercase tracking-[0.4em] font-black mb-4 text-white/50">La Diferencia Diabolical</h3>
                            <p className="text-sm md:text-base text-white/70 leading-relaxed">
                                No somos una agencia de marketing ni una empresa de software. <strong className="text-white">Somos ingenieros de libertad.</strong> Instalamos <strong className="text-white">"empleados digitales"</strong> que no duermen, no piden aumentos y atienden a mil clientes al mismo tiempo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Problem;
