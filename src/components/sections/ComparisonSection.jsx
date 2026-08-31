import React from 'react';

const ComparisonSection = () => {
    const rows = [
        { bad: "Pagas nóminas, seguros y bonos cada mes.", good: "Una inversión fija que se paga sola." },
        { bad: "El crecimiento depende de tu cansancio.", good: "El sistema escala sin que tú trabajes más." },
        { bad: "Ventas perdidas por falta de respuesta.", good: "Cada mensaje es una oportunidad cerrada." },
        { bad: "Vives pegado al celular.", good: "Recuperas tus domingos." },
    ];
    // Segunda inversión, en espejo: el corte va al revés que en Problem, para
    // que las dos no se lean como la misma diapositiva repetida.
    return (
        <section
            id="comparison"
            className="seccion-invertida corte-entrada-espejo corte-salida-espejo py-16 md:py-32 bg-white relative overflow-hidden"
        >
            <div className="max-w-4xl mx-auto px-5 md:px-6 relative z-10">
                <div className="text-center mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-title uppercase tracking-tighter mb-2 text-black">La Lógica del Ahorro</h2>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-black/60 font-bold">Escalabilidad vs Estancamiento</p>
                </div>

                {/* Header row */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 px-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-black/20 flex-shrink-0"></span>
                        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-black/60 font-black">Si sigues igual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0"></span>
                        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-black font-black">Con Diabolical</span>
                    </div>
                </div>

                {/* Comparison rows */}
                <div className="space-y-1.5 md:space-y-2">
                    {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 gap-1.5 md:gap-4 rounded-xl md:rounded-2xl overflow-hidden">
                            <div className="bg-black/5 px-3 md:px-5 py-3.5 md:py-4 flex items-start gap-2 md:gap-3">
                                <span className="text-black/30 text-base leading-none flex-shrink-0 mt-0.5">✗</span>
                                <span className="text-[11px] md:text-sm text-black/70 leading-snug">{row.bad}</span>
                            </div>
                            <div className="bg-black px-3 md:px-5 py-3.5 md:py-4 flex items-start gap-2 md:gap-3">
                                <span className="text-white text-base leading-none flex-shrink-0 mt-0.5">✓</span>
                                <span className="text-[11px] md:text-sm text-white font-bold leading-snug">{row.good}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ComparisonSection;
