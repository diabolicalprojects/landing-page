import React from 'react';

const BoldHook = () => {
    return (
        <section className="py-16 md:py-36 bg-black relative">
            <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
                <div className="inline-block px-4 py-1.5 border border-red-500/20 rounded-full mb-6 md:mb-8">
                    <span className="text-[8px] text-red-500 uppercase tracking-[0.5em] font-black animate-pulse">Alerta Financiera</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-6xl font-title tracking-tighter uppercase mb-6 md:mb-8 leading-[0.9]">
                    Cada minuto que pasas leyendo esto,{' '}
                    <span className="text-white/20">estás perdiendo dinero.</span>
                </h2>
                <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
                    <p className="text-sm md:text-lg text-white/60 leading-relaxed">
                        Mientras tu equipo dedica horas a contestar las <strong className="text-white">mismas 10 preguntas</strong> por WhatsApp, tus competidores más ágiles te están <strong className="text-white">robando mercado.</strong> No estás ahorrando al no automatizar; estás pagando un <span className="text-white underline underline-offset-4 decoration-white/20">"impuesto por ineficiencia"</span> que te sale más caro que cualquier nómina.
                    </p>
                    <p className="text-lg md:text-2xl font-title text-white italic tracking-tight pt-5 md:pt-6 border-t border-white/5">
                        "No tienes un problema de ventas, tienes un <strong>problema de sistema.</strong>"
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BoldHook;
