import React, { useEffect, useState } from 'react';
import { Calendar, Globe, Instagram, MessageCircle } from 'lucide-react';

import { useBloque } from '../../contenido';

/*
 * El panel de guardia nocturna.
 *
 * Es el momento con autoría de la página y la única animación orquestada: los
 * avisos entran uno a uno, de madrugada, mientras el reloj corre. No decora el
 * titular, lo demuestra — «tu negocio no duerme» deja de ser una frase en
 * cuanto se ve el sistema atendiendo a las dos de la mañana.
 *
 * Se renderiza con TODOS los avisos visibles desde el servidor. La animación
 * solo se activa después de montar, así que quien llega sin JavaScript, con la
 * red mala o con un rastreador ve la lista entera igualmente. Es lo contrario
 * de esconder contenido para luego revelarlo: aquí lo revelado ya estaba.
 */

const ICONOS = {
    WhatsApp: MessageCircle,
    'Sitio web': Globe,
    Instagram: Instagram,
    Agenda: Calendar,
};

const PanelGuardia = () => {
    const { escena } = useBloque('hero');
    const eventos = escena?.eventos ?? [];

    /*
     * Cuál de los avisos está marcado como "el que acaba de entrar".
     *
     * -1 es el estado del servidor y el de movimiento reducido: ninguno
     * marcado, los cuatro iguales. Importa que el estado por defecto sea ese y
     * no "todos atenuados menos uno": la primera versión bajaba los no activos
     * a opacidad 0.18 y el texto dejaba de leerse — se estaba escondiendo
     * contenido para poder revelarlo, que es justo lo que no se debe hacer.
     *
     * Ahora los cuatro se leen siempre y la animación solo mueve un realce.
     */
    const [activo, setActivo] = useState(-1);

    useEffect(() => {
        const reducido =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reducido || eventos.length === 0) return undefined;

        // El primer realce lo pone el propio intervalo, no una llamada directa
        // aquí: cambiar el estado de forma síncrona dentro del efecto provoca
        // un render en cascada justo en el primer pintado, que es el peor
        // momento posible para gastar trabajo en el hilo principal.
        let indice = -1;
        const id = setInterval(() => {
            indice = (indice + 1) % eventos.length;
            setActivo(indice);
        }, 1800);

        return () => clearInterval(id);
    }, [eventos.length]);

    if (!eventos.length) return null;

    return (
        <figure className="marco m-0 w-full">
            <figcaption className="marco-barra justify-between">
                <div className="flex items-center gap-2">
                    <span className="marco-punto" />
                    <span className="marco-punto" />
                    <span className="marco-punto" />
                </div>
                <span className="etiqueta-mono text-white/55">{escena?.titulo}</span>
                <span className="flex items-center gap-1.5">
                    <span
                        className="latido block h-1.5 w-1.5 rounded-full"
                        style={{ background: 'var(--acento)' }}
                    />
                    <span className="etiqueta-mono text-white/55">{escena?.etiqueta}</span>
                </span>
            </figcaption>

            <div className="px-5 pb-5 pt-6 md:px-7 md:pb-7">
                <p className="cifras font-title text-5xl leading-none text-white md:text-6xl">
                    {escena?.reloj}
                </p>
                <p className="etiqueta mt-2 text-white/55">Hora local · Aguascalientes</p>

                <ul className="mt-7 space-y-px">
                    {eventos.map((evento, indice) => {
                        const Icono = ICONOS[evento.canal] ?? MessageCircle;
                        const marcado = indice === activo;

                        return (
                            <li
                                key={`${evento.hora}-${evento.texto}`}
                                className="relative flex items-start gap-3 rounded-lg border-t border-white/[0.07] px-3 py-3 transition-[background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] first:border-t-0"
                                style={{
                                    background: marcado ? 'rgba(255,255,255,0.05)' : 'transparent',
                                }}
                            >
                                {/* La marca de "recién llegado". Es lo único que
                                    se mueve, y no tapa ni atenúa nada. */}
                                <span
                                    aria-hidden="true"
                                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full transition-opacity duration-500"
                                    style={{
                                        background: 'var(--acento)',
                                        opacity: marcado ? 1 : 0,
                                    }}
                                />
                                <span
                                    className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
                                    aria-hidden="true"
                                >
                                    <Icono size={13} className="text-white/70" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[0.9375rem] leading-snug text-white">
                                        {evento.texto}
                                    </span>
                                    <span className="etiqueta-mono mt-1 block text-white/50">
                                        {evento.hora} · {evento.canal}
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <p className="mt-6 border-t border-white/[0.07] pt-4 text-xs leading-relaxed text-white/55">
                    {escena?.nota}
                </p>
            </div>
        </figure>
    );
};

export default PanelGuardia;
