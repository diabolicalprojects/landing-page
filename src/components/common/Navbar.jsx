import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

import { cn } from '../../utils/cn';
import { useBloque } from '../../contenido';
import Enlace from './Enlace';
import logoHorizontalNegro from '../../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-NEGRO.svg';
import logoHorizontalBlanco from '../../assets/logo/LOGO-DIABOLICAL-HORIZONTAL-BLANCO.svg';

/*
 * Barra flotante.
 *
 * Se invierte al pasar por encima de una sección clara. La versión anterior lo
 * resolvía con dos ScrollTrigger atados a #problem y #comparison —dos secciones
 * que ya no existen—, así que llevaba tiempo sin invertir nada.
 *
 * Ahora pregunta a las propias secciones: busca los elementos .zona-clara y
 * comprueba si alguno cruza la franja donde está la barra. No hace falta
 * registrarlas en ningún sitio y funciona igual si mañana se añade otra.
 */

const ALTURA_BARRA = 72;

const Navbar = () => {
    const [desplazado, setDesplazado] = useState(false);
    const [sobreClaro, setSobreClaro] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const zonasRef = useRef([]);

    const { enlaces = [], cta } = useBloque('nav');

    useEffect(() => {
        zonasRef.current = Array.from(document.querySelectorAll('.zona-clara'));

        let pendiente = false;
        const medir = () => {
            pendiente = false;
            setDesplazado(window.scrollY > 24);
            setSobreClaro(
                zonasRef.current.some((zona) => {
                    const { top, bottom } = zona.getBoundingClientRect();
                    return top <= ALTURA_BARRA && bottom >= ALTURA_BARRA;
                })
            );
        };

        // El scroll dispara muchísimo más rápido de lo que la pantalla pinta;
        // sin el rAF se recalcularían rectángulos que nadie llega a ver.
        const alDesplazar = () => {
            if (pendiente) return;
            pendiente = true;
            requestAnimationFrame(medir);
        };

        medir();
        window.addEventListener('scroll', alDesplazar, { passive: true });
        window.addEventListener('resize', alDesplazar, { passive: true });

        return () => {
            window.removeEventListener('scroll', alDesplazar);
            window.removeEventListener('resize', alDesplazar);
        };
    }, []);

    // Cerrar con Escape: un menú a pantalla completa sin salida por teclado deja
    // atrapado a quien no usa ratón.
    useEffect(() => {
        if (!menuAbierto) return undefined;
        const alPulsar = (evento) => {
            if (evento.key === 'Escape') setMenuAbierto(false);
        };
        document.addEventListener('keydown', alPulsar);
        return () => document.removeEventListener('keydown', alPulsar);
    }, [menuAbierto]);

    const abrirChat = () => {
        setMenuAbierto(false);
        window.dispatchEvent(new Event('open-diabolical-chat'));
    };

    return (
        <nav
            aria-label="Principal"
            className={cn(
                'fixed left-1/2 top-3 z-50 flex w-[94%] max-w-6xl -translate-x-1/2 items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:top-5 md:gap-10 md:px-6 md:py-3',
                sobreClaro
                    ? 'border border-black/10 bg-white/85 backdrop-blur-xl'
                    : 'border border-white/10 bg-black/70 backdrop-blur-xl',
                desplazado && 'shadow-[0_10px_40px_-16px_rgba(0,0,0,0.7)]'
            )}
        >
            <Enlace destino="/" className="flex min-h-[2.25rem] min-w-0 items-center py-1" aria-label="Diabolical, inicio">
                <img
                    src={sobreClaro ? logoHorizontalNegro : logoHorizontalBlanco}
                    alt="Diabolical"
                    width="150"
                    height="30"
                    className="h-5 flex-shrink-0 md:h-7"
                />
            </Enlace>

            <ul
                className={cn(
                    'hidden items-center gap-8 text-[0.8125rem] font-semibold tracking-tight lg:flex',
                    sobreClaro ? 'text-black/65' : 'text-white/65'
                )}
            >
                {enlaces.map((enlace) => (
                    <li key={enlace.id ?? enlace.texto}>
                        <Enlace
                            destino={enlace.destino}
                            className={cn(
                                'inline-flex min-h-[1.75rem] items-center py-1 transition-colors duration-150',
                                sobreClaro ? 'hover:text-black' : 'hover:text-white'
                            )}
                        >
                            {enlace.texto}
                        </Enlace>
                    </li>
                ))}
            </ul>

            <div className="flex flex-shrink-0 items-center gap-2">
                <Enlace
                    destino={cta?.destino}
                    className="boton boton-acento hidden min-h-[2.75rem] px-5 text-[0.8125rem] sm:inline-flex"
                >
                    {cta?.texto}
                    <ArrowRight size={14} aria-hidden="true" />
                </Enlace>

                <button
                    type="button"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuAbierto}
                    className={cn(
                        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors lg:hidden',
                        sobreClaro
                            ? 'bg-black/5 text-black active:bg-black/10'
                            : 'bg-white/10 text-white active:bg-white/20'
                    )}
                >
                    {menuAbierto ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {menuAbierto && (
                <div className="absolute left-0 top-[calc(100%+10px)] flex w-full flex-col rounded-3xl border border-white/10 bg-black px-5 py-3 shadow-2xl lg:hidden">
                    {enlaces.map((enlace) => (
                        <Enlace
                            key={enlace.id ?? enlace.texto}
                            destino={enlace.destino}
                            onClick={() => setMenuAbierto(false)}
                            className="border-b border-white/10 py-4 text-[0.9375rem] font-bold tracking-tight text-white transition-colors active:text-white/60"
                        >
                            {enlace.texto}
                        </Enlace>
                    ))}
                    <button
                        type="button"
                        onClick={abrirChat}
                        className="boton boton-acento mt-4 mb-1 w-full"
                    >
                        {cta?.texto}
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
