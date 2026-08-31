import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

/*
 * La demostración del mecanismo: una conversación de WhatsApp resolviéndose
 * sola, fuera de horario. Es la pieza central del hero porque es lo único que
 * este producto puede probar sin inventar nada — no afirma resultados, enseña
 * el flujo. Está etiquetada como simulación a la vista, no en letra pequeña.
 *
 * Va en HTML plano a propósito: las palabras de la conversación viajan en el
 * prerender, así que también las leen los rastreadores que no ejecutan
 * JavaScript. El verde es el del propio WhatsApp: color semántico del canal,
 * no un acento decorativo del sitio.
 */
const MENSAJES = [
    { de: 'cliente', hora: '9:47 p.m.', texto: 'Hola, ¿tienen cita para limpieza dental esta semana?' },
    { de: 'sistema', hora: '9:47 p.m.', texto: 'Hola 👋 Sí. Nos queda miércoles a las 10:30 o jueves a las 4:00 pm. ¿Cuál te acomoda?' },
    { de: 'cliente', hora: '9:48 p.m.', texto: 'El jueves' },
    { de: 'sistema', hora: '9:48 p.m.', texto: 'Listo: jueves 4:00 pm, limpieza dental. Un día antes te llega el recordatorio. ¿A nombre de quién agendo la cita?' },
];

const ChatDemo = () => (
    <figure className="w-full max-w-md" aria-label="Ejemplo de un flujo de agendamiento automático por WhatsApp">
        <div className="rounded-2xl border border-white/10 bg-[#0b141a] overflow-hidden shadow-2xl">
            {/* Cabecera del chat */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1f2c33] border-b border-black/40">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <img src="/logo-cuadrado-blanco.svg" alt="" width="20" height="20" className="w-5 h-5 opacity-90" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-white font-semibold leading-tight truncate">Clínica — recepción</p>
                    <p className="text-[11px] text-[#25d366] leading-tight">en línea</p>
                </div>
                <span className="ml-auto etiqueta-mono text-white/70">9:47 p.m.</span>
            </div>

            {/* Mensajes */}
            <div className="px-3 py-4 space-y-2 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22%3E%3Crect width=%224%22 height=%224%22 fill=%22%230b141a%22/%3E%3C/svg%3E')]">
                {MENSAJES.map((m, i) => (
                    <div key={i} className={`flex ${m.de === 'sistema' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-snug text-white/95 ${
                                m.de === 'sistema' ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#1f2c33] rounded-tl-none'
                            }`}
                        >
                            <p>{m.texto}</p>
                            <span className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/80">
                                {m.hora}
                                {m.de === 'sistema'
                                    ? <CheckCheck size={13} className="text-[#53bdeb]" aria-hidden="true" />
                                    : <Check size={13} aria-hidden="true" />}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* La etiqueta de honestidad va fuera de la tarjeta y a tamaño legible:
            es simulación y se dice de frente, no en letra de contrato. */}
        <figcaption className="mt-3 text-xs text-white/60 leading-relaxed">
            Simulación de un flujo real de agendamiento. Las 9:47 p.m. no son casualidad:
            el mensaje fuera de horario es el que hoy se queda sin contestar.
        </figcaption>
    </figure>
);

export default ChatDemo;
