import React, { useEffect, useRef, useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';

import { cn } from '../../utils/cn';

/*
 * La conversación de ejemplo, sin marco propio: quien la monta decide si va en
 * un teléfono, en una ventana o suelta.
 *
 * Va en HTML plano a propósito. Las palabras de la conversación viajan en el
 * HTML servido, así que también las leen los rastreadores que no ejecutan
 * JavaScript, que es exactamente la ventaja que este sitio tiene sobre la
 * competencia local.
 *
 * Se ve desde el teléfono de quien escribe: sus mensajes a la derecha, en
 * verde, y los de «Recepción del spa» a la izquierda.
 *
 * Animada: al llegar a ella, la conversación ocurre. El cliente escribe, el
 * doble check se pone azul, arriba aparece «escribiendo…» con los tres puntos
 * y entra la respuesta; así hasta la confirmación. Se queda un momento y
 * vuelve a empezar. Todos los mensajes ocupan su sitio desde el principio (se
 * muestran, no se insertan), así que la página no salta. Fuera de pantalla se
 * para, y con menos movimiento se ve la conversación completa y quieta.
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

/*
 * El guion: en qué milisegundo cambia qué. `visibles` es cuántos mensajes se
 * ven; `ticks` el estado de cada mensaje del cliente (1 enviado, 2 entregado,
 * 3 leído).
 */
const GUION = [
    [450, { visibles: 1, ticks: { 0: 1 } }],
    [900, { ticks: { 0: 2 } }],
    [1350, { ticks: { 0: 3 }, escribiendo: true }],
    [2900, { escribiendo: false, visibles: 2 }],
    [4300, { visibles: 3, ticks: { 2: 1 } }],
    [4650, { ticks: { 2: 3 }, escribiendo: true }],
    [6100, { escribiendo: false, visibles: 4 }],
    [11500, { saliendo: true }],
];
const CICLO = 12100;

const COMPLETA = { visibles: MENSAJES.length, ticks: { 0: 3, 2: 3 }, escribiendo: false, saliendo: false };
const VACIA = { visibles: 0, ticks: {}, escribiendo: false, saliendo: false };

const Ticks = ({ estado }) =>
    estado >= 2 ? (
        <CheckCheck
            size={13}
            aria-hidden="true"
            className={cn('transition-colors duration-300', estado >= 3 ? 'text-[#53bdeb]' : 'text-white/70')}
        />
    ) : (
        <Check size={13} aria-hidden="true" className="text-white/70" />
    );

const ChatDemo = () => {
    const raiz = useRef(null);
    // `animada` en falso es la conversación completa: la del servidor, la de
    // quien pide menos movimiento y la del primer render del cliente.
    const [animada, setAnimada] = useState(false);
    const [estado, setEstado] = useState(COMPLETA);

    useEffect(() => {
        const nodo = raiz.current;
        if (!nodo || typeof IntersectionObserver === 'undefined') return undefined;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

        let relojes = [];
        const parar = () => {
            relojes.forEach(window.clearTimeout);
            relojes = [];
        };
        const reproducir = () => {
            parar();
            setEstado(VACIA);
            let acumulado = VACIA;
            for (const [ms, cambio] of GUION) {
                relojes.push(
                    window.setTimeout(() => {
                        acumulado = { ...acumulado, ...cambio, ticks: { ...acumulado.ticks, ...(cambio.ticks ?? {}) } };
                        setEstado(acumulado);
                    }, ms)
                );
            }
            relojes.push(window.setTimeout(reproducir, CICLO));
        };

        const observador = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting) {
                    setAnimada(true);
                    reproducir();
                } else {
                    // Fuera de vista se para y se vacía: al volver, empieza.
                    parar();
                    setAnimada(true);
                    setEstado(VACIA);
                }
            },
            { threshold: 0.35 }
        );
        observador.observe(nodo);

        return () => {
            parar();
            observador.disconnect();
        };
    }, []);

    const { visibles, ticks, escribiendo, saliendo } = animada ? estado : COMPLETA;

    return (
        <div
            ref={raiz}
            className={cn('chat-demo flex h-full flex-col bg-[#0b141a]', saliendo && 'chat-demo--saliendo')}
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
                    <span className="block text-[11px] leading-tight text-[#25d366]">
                        {escribiendo ? 'escribiendo…' : 'en línea'}
                    </span>
                </span>
                <span className="etiqueta-mono ml-auto text-white/70">9:47 p.m.</span>
            </div>

            <div className="flex-1 space-y-2 px-3 py-4">
                {MENSAJES.map((m, i) => {
                    const delCliente = m.de === 'cliente';
                    const visible = i < visibles;
                    // Los tres puntos ocupan el sitio de la respuesta que viene.
                    const tecleando = escribiendo && i === visibles && !delCliente;
                    return (
                        <div
                            key={m.texto}
                            className={cn(
                                'chat-demo__fila relative flex',
                                delCliente ? 'justify-end' : 'justify-start',
                                visible ? 'chat-demo__fila--visible' : 'chat-demo__fila--oculta'
                            )}
                        >
                            <div
                                className={cn(
                                    'chat-demo__globo max-w-[86%] rounded-lg px-3 py-2 text-[13px] leading-snug text-white/95',
                                    delCliente
                                        ? 'chat-demo__globo--cliente rounded-tr-none bg-[#005c4b]'
                                        : 'chat-demo__globo--sistema rounded-tl-none bg-[#1f2c33]'
                                )}
                            >
                                <span className="block">{m.texto}</span>
                                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/80">
                                    {m.hora}
                                    {delCliente && <Ticks estado={ticks[i] ?? 1} />}
                                </span>
                            </div>

                            {tecleando && (
                                <span className="chat-demo__tecleo" aria-hidden="true">
                                    <i />
                                    <i />
                                    <i />
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatDemo;
