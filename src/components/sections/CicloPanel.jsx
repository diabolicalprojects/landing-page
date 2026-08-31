import React from 'react';
import { SERVICIOS_POR_CATEGORIA } from '../../data/servicios';

/*
 * El ciclo completo en el primer viewport.
 *
 * Sustituye a la demo de WhatsApp, que ocupaba este sitio y encerraba a la
 * agencia en un solo servicio: quien entraba leía "los del chatbot" aunque el
 * catálogo cubriera cinco etapas. La demo no se pierde — baja a la sección de
 * atención, que es donde ilustra algo concreto en vez de definir la casa.
 *
 * Se alimenta de servicios.json, así que un servicio nuevo aparece aquí sin
 * tocar este archivo, y nunca puede contradecir a la página de servicios.
 */
const CicloPanel = () => (
    <div className="w-full max-w-md border border-white/12 rounded-2xl overflow-hidden bg-white/[0.02]">
        <p className="etiqueta text-white/60 px-5 py-4 border-b border-white/12">
            Las cinco etapas de un cliente
        </p>

        <ol className="divide-y divide-white/10">
            {SERVICIOS_POR_CATEGORIA.map((grupo, i) => (
                <li key={grupo.categoria} className="px-5 py-4 flex gap-4">
                    <span
                        className="etiqueta-mono text-white/40 cifras pt-0.5 flex-shrink-0"
                        aria-hidden="true"
                    >
                        {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-sm font-title uppercase tracking-tight text-white leading-tight mb-1">
                            {grupo.categoria}
                        </h2>
                        <p className="text-xs text-white/55 leading-relaxed font-light">
                            {grupo.servicios.map((s) => s.nombre).join(' · ')}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    </div>
);

export default CicloPanel;
