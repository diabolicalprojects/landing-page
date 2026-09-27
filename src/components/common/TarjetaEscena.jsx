import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

import Enlace from './Enlace';
import PantallaEscena from './PantallaEscena';
import MotoresIA from './MotoresIA';
import { cn } from '../../utils/cn';

/**
 * Tarjeta de un servicio (o de un giro) con su escena animada arriba.
 *
 * La escena cuenta el mecanismo; el texto, qué resuelve y qué incluye. La
 * tarjeta entera es el enlace: en un teléfono no hay que atinar a una línea de
 * texto. La escena solo se anima cuando la tarjeta está en pantalla.
 *
 * `ancha` la pone en horizontal desde 1024 px: la escena a la izquierda y el
 * texto a la derecha, para los servicios principales.
 */
const TarjetaEscena = ({
    escena,
    titulo,
    texto,
    incluye = [],
    destino,
    enlace = 'Ver el servicio',
    nivel = 'h3',
    ancha = false,
    className,
}) => {
    const Titulo = nivel;

    return (
        <Enlace
            destino={destino}
            className={cn(
                'tarjeta-escena tarjeta tarjeta-enlace group flex h-full flex-col overflow-hidden',
                // Ancha: una fila por tarjeta, la escena a la izquierda desde 1024 px.
                ancha && 'tarjeta-escena--ancha lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
                className
            )}
        >
            {escena && <PantallaEscena escena={escena} decorativa />}

            <div className={cn('flex flex-1 flex-col p-6 md:p-7', ancha && 'lg:p-9')}>
                <Titulo className="titular-m">{titulo}</Titulo>
                {texto && <p className="cuerpo mt-3">{texto}</p>}
                {/* Si el texto nombra a ChatGPT, Claude…, sus logos debajo. */}
                <MotoresIA texto={texto ?? ''} className="mt-4" />

                {incluye.length > 0 && (
                    <ul className="mt-5 space-y-2.5">
                        {incluye.map((punto) => (
                            <li key={punto} className="flex items-start gap-3">
                                <span
                                    className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full"
                                    style={{ background: 'var(--inverso-fondo)' }}
                                    aria-hidden="true"
                                >
                                    <Check size={11} style={{ color: 'var(--inverso-texto)' }} />
                                </span>
                                <span className="cuerpo max-w-none">{punto}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <span className="flex-1" />

                <span
                    className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-bold"
                    style={{ color: 'var(--texto-1)' }}
                >
                    {enlace}
                    <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    />
                </span>
            </div>
        </Enlace>
    );
};

export default TarjetaEscena;
