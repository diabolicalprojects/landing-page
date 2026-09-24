import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

/*
 * La conversación de ejemplo, sin marco propio: quien la monta decide si va en
 * un teléfono, en una ventana o suelta.
 *
 * Va en HTML plano a propósito. Las palabras de la conversación viajan en el
 * HTML servido, así que también las leen los rastreadores que no ejecutan
 * JavaScript — que es exactamente la ventaja que este sitio tiene sobre la
 * competencia local.
 *
 * El verde es el de WhatsApp: color semántico del canal que se está retratando,
 * no un acento del sitio. Por eso no sale de los tokens del tema.
 */
const MENSAJES = [
    { de: 'cliente', hora: '9:47 p.m.', texto: 'Hola, ¿tienen lugar para un masaje en pareja este sábado?' },
    { de: 'sistema', hora: '9:47 p.m.', texto: 'Hola. Sí: el sábado quedan dos cabinas libres a las 11:00 y a las 5:00 pm. El masaje en pareja dura 60 minutos. ¿Cuál le acomoda?' },
    { de: 'cliente', hora: '9:48 p.m.', texto: 'A las 5' },
    { de: 'sistema', hora: '9:48 p.m.', texto: 'Listo: sábado 5:00 pm, masaje en pareja. Un día antes le llega el recordatorio. ¿A nombre de quién la reservo?' },
];

const ChatDemo = () => (
    <div
        className="flex h-full flex-col bg-[#0b141a]"
        aria-label="Ejemplo de una reserva automática por WhatsApp en un spa"
        role="img"
    >
        <div className="flex items-center gap-3 border-b border-black/40 bg-[#1f2c33] px-4 py-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                <img
                    src="/logo-cuadrado-blanco.svg"
                    alt=""
                    width="20"
                    height="20"
                    className="h-5 w-5 opacity-90"
                />
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight text-white">
                    Recepción del spa
                </span>
                <span className="block text-[11px] leading-tight text-[#25d366]">en línea</span>
            </span>
            <span className="etiqueta-mono ml-auto text-white/70">9:47 p.m.</span>
        </div>

        <div className="flex-1 space-y-2 px-3 py-4">
            {MENSAJES.map((m) => (
                <div
                    key={m.texto}
                    className={`flex ${m.de === 'sistema' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[86%] rounded-lg px-3 py-2 text-[13px] leading-snug text-white/95 ${
                            m.de === 'sistema'
                                ? 'rounded-tr-none bg-[#005c4b]'
                                : 'rounded-tl-none bg-[#1f2c33]'
                        }`}
                    >
                        <span className="block">{m.texto}</span>
                        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/80">
                            {m.hora}
                            {m.de === 'sistema' ? (
                                <CheckCheck size={13} className="text-[#53bdeb]" aria-hidden="true" />
                            ) : (
                                <Check size={13} aria-hidden="true" />
                            )}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ChatDemo;
