import React, { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';

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
 *
 * Cuatro entradas: Inicio, Nosotros, Servicios y Contacto. Servicios despliega
 * un panel con grupos (principales, por giro, complementarios) que viene del
 * contenido editable (`grupos` en el enlace). Contacto va marcado como
 * `destacado` y se pinta como botón: es la acción, no un sitio más.
 *
 * El panel está siempre en el HTML servido, oculto con `hidden` mientras no se
 * abre: los enlaces a las landings tienen que existir para los rastreadores en
 * todas las páginas, no solo cuando alguien pasa el ratón.
 *
 * En el teléfono la barra es compacta (logo y menú; Contacto va dentro del
 * menú y cada página tiene su botón de cotizar) y se esconde al bajar: vuelve
 * en cuanto la persona sube un poco, recibe el foco o abre el menú. Tapaba
 * casi una décima parte de la pantalla todo el tiempo.
 */

/** Panel desplegable de un enlace con grupos. */
const Desplegable = ({ enlace, sobreClaro }) => {
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef(null);
    const cierre = useRef(null);
    const idPanel = useId();

    // Se cierra al hacer clic fuera, con Escape y al salir el foco del grupo.
    useEffect(() => {
        if (!abierto) return undefined;
        const fuera = (evento) => {
            if (!contenedor.current?.contains(evento.target)) setAbierto(false);
        };
        const tecla = (evento) => {
            if (evento.key === 'Escape') setAbierto(false);
        };
        document.addEventListener('pointerdown', fuera);
        document.addEventListener('keydown', tecla);
        return () => {
            document.removeEventListener('pointerdown', fuera);
            document.removeEventListener('keydown', tecla);
        };
    }, [abierto]);

    // Abrir al pasar el ratón es cómodo en escritorio, pero cerrarlo en el
    // mismo instante en que el puntero cruza el hueco entre el botón y el panel
    // lo hace inservible: se espera un momento antes de cerrar.
    const entrar = () => {
        window.clearTimeout(cierre.current);
        setAbierto(true);
    };
    const salir = () => {
        cierre.current = window.setTimeout(() => setAbierto(false), 160);
    };

    return (
        <li
            ref={contenedor}
            className="relative"
            onMouseEnter={entrar}
            onMouseLeave={salir}
            onBlur={(evento) => {
                if (!contenedor.current?.contains(evento.relatedTarget)) setAbierto(false);
            }}
        >
            <button
                type="button"
                aria-expanded={abierto}
                aria-controls={idPanel}
                onClick={() => setAbierto(!abierto)}
                className={cn(
                    'inline-flex min-h-[1.75rem] items-center gap-1 py-1 transition-colors duration-150',
                    sobreClaro ? 'hover:text-black' : 'hover:text-white',
                    abierto && (sobreClaro ? 'text-black' : 'text-white')
                )}
            >
                {enlace.texto}
                <ChevronDown
                    size={15}
                    aria-hidden="true"
                    className={cn('transition-transform duration-200', abierto && 'rotate-180')}
                />
            </button>

            <div
                id={idPanel}
                hidden={!abierto}
                className="absolute left-1/2 top-full z-50 w-[min(52rem,calc(100vw-3rem))] -translate-x-1/2 pt-4"
            >
                <div className="zona-oscura grid gap-8 rounded-3xl border border-white/10 p-7 shadow-2xl md:grid-cols-[1.35fr_1fr_1fr]">
                    {(enlace.grupos ?? []).map((grupo) => (
                        <div key={grupo.id ?? grupo.titulo}>
                            <p className="etiqueta" style={{ color: 'var(--texto-3)' }}>
                                {grupo.titulo}
                            </p>
                            <ul className="mt-4 space-y-1">
                                {(grupo.enlaces ?? []).map((hijo) => (
                                    <li key={hijo.destino ?? hijo.texto}>
                                        <Enlace
                                            destino={hijo.destino}
                                            onClick={() => setAbierto(false)}
                                            className="-mx-3 flex min-h-[2.25rem] flex-col justify-center rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/[0.06]"
                                        >
                                            <span className="text-[0.9375rem] font-bold tracking-tight text-white">
                                                {hijo.texto}
                                            </span>
                                            {hijo.detalle && (
                                                <span className="mt-0.5 text-[0.9375rem] leading-snug text-white/60">
                                                    {hijo.detalle}
                                                </span>
                                            )}
                                        </Enlace>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </li>
    );
};

// Dónde está la barra: la línea que se compara con las secciones claras.
const ALTURA_BARRA = 72;
const ALTURA_BARRA_MOVIL = 34;

// Por debajo de este ancho la barra se esconde al bajar.
const ANCHO_ESCRITORIO = 1024;

const Navbar = () => {
    const [desplazado, setDesplazado] = useState(false);
    const [sobreClaro, setSobreClaro] = useState(false);
    const [escondida, setEscondida] = useState(false);
    const ultimoY = useRef(0);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [grupoMovil, setGrupoMovil] = useState(null);
    const zonasRef = useRef([]);
    const { pathname } = useLocation();

    const { enlaces = [] } = useBloque('nav');
    const normales = enlaces.filter((e) => !e.destacado);
    const destacado = enlaces.find((e) => e.destacado);

    // Cambiar de página cierra el menú: si no, se queda abierto encima de la
    // página nueva. Se ajusta durante el render, no en un efecto, para no
    // pintar un fotograma con el menú abierto sobre la página nueva.
    const [rutaMostrada, setRutaMostrada] = useState(pathname);
    if (rutaMostrada !== pathname) {
        setRutaMostrada(pathname);
        setMenuAbierto(false);
        setGrupoMovil(null);
    }

    useEffect(() => {
        zonasRef.current = Array.from(document.querySelectorAll('.zona-clara'));

        let pendiente = false;
        const medir = () => {
            pendiente = false;
            const y = window.scrollY;
            const movil = window.innerWidth < ANCHO_ESCRITORIO;
            const linea = movil ? ALTURA_BARRA_MOVIL : ALTURA_BARRA;
            setDesplazado(y > 24);
            setSobreClaro(
                zonasRef.current.some((zona) => {
                    const { top, bottom } = zona.getBoundingClientRect();
                    return top <= linea && bottom >= linea;
                })
            );

            // Se esconde al bajar y vuelve al subir. El umbral evita que tiemble
            // con el rebote del scroll en iOS; arriba del todo siempre se ve.
            const delta = y - ultimoY.current;
            if (!movil || y < 120) {
                setEscondida(false);
                ultimoY.current = y;
            } else if (Math.abs(delta) > 8) {
                setEscondida(delta > 0);
                ultimoY.current = y;
            }
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
    }, [pathname]);

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

    return (
        <nav
            aria-label="Principal"
            onFocus={() => setEscondida(false)}
            className={cn(
                'fixed left-1/2 top-2 z-50 flex w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 min-[1680px]:max-w-[84rem] min-[2200px]:max-w-[88rem] items-center justify-between gap-4 rounded-full py-1.5 pl-4 pr-1.5 transition-[background-color,border-color,box-shadow,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:top-5 md:w-[94%] md:gap-10 md:px-6 md:py-3',
                sobreClaro
                    ? 'border border-black/10 bg-white/85 backdrop-blur-xl'
                    : 'border border-white/10 bg-black/70 backdrop-blur-xl',
                desplazado && 'shadow-[0_10px_40px_-16px_rgba(0,0,0,0.7)]',
                escondida && !menuAbierto && '-translate-y-[calc(100%+2rem)]'
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
                    'hidden items-center gap-8 text-[0.9375rem] font-semibold tracking-tight lg:flex',
                    sobreClaro ? 'text-black/65' : 'text-white/65'
                )}
            >
                {normales.map((enlace) =>
                    (enlace.grupos ?? []).length > 0 ? (
                        <Desplegable
                            key={enlace.id ?? enlace.texto}
                            enlace={enlace}
                            sobreClaro={sobreClaro}
                        />
                    ) : (
                        <li key={enlace.id ?? enlace.texto}>
                            <Enlace
                                destino={enlace.destino}
                                aria-current={pathname === enlace.destino ? 'page' : undefined}
                                className={cn(
                                    'inline-flex min-h-[1.75rem] items-center py-1 transition-colors duration-150',
                                    sobreClaro ? 'hover:text-black' : 'hover:text-white',
                                    pathname === enlace.destino && (sobreClaro ? 'text-black' : 'text-white')
                                )}
                            >
                                {enlace.texto}
                            </Enlace>
                        </li>
                    )
                )}
            </ul>

            <div className="flex flex-shrink-0 items-center gap-2">
                {destacado && (
                    <Enlace
                        destino={destacado.destino}
                        className={cn(
                            // `!hidden`: la clase .boton declara su display fuera de la
                            // capa de Tailwind y ganaba a un `hidden` normal, así que
                            // el botón salía también en el teléfono.
                            'boton !hidden min-h-[2.75rem] px-6 text-[0.9375rem] sm:!inline-flex',
                            sobreClaro ? 'bg-black text-white hover:bg-black/85' : 'bg-white text-black hover:bg-white/85'
                        )}
                    >
                        {destacado.texto}
                    </Enlace>
                )}

                <button
                    type="button"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuAbierto}
                    className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors md:h-11 md:w-11 lg:hidden',
                        sobreClaro
                            ? 'bg-black/5 text-black active:bg-black/10'
                            : 'bg-white/10 text-white active:bg-white/20'
                    )}
                >
                    {menuAbierto ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {menuAbierto && (
                <div className="absolute left-0 top-[calc(100%+10px)] flex max-h-[calc(100dvh-6rem)] w-full flex-col overflow-y-auto rounded-3xl border border-white/10 bg-black px-5 py-3 shadow-2xl lg:hidden">
                    {normales.map((enlace) =>
                        (enlace.grupos ?? []).length > 0 ? (
                            <div key={enlace.id ?? enlace.texto} className="border-b border-white/10">
                                <button
                                    type="button"
                                    aria-expanded={grupoMovil === enlace.id}
                                    onClick={() => setGrupoMovil(grupoMovil === enlace.id ? null : enlace.id)}
                                    className="flex w-full items-center justify-between py-4 text-left text-[0.9375rem] font-bold tracking-tight text-white"
                                >
                                    {enlace.texto}
                                    <ChevronDown
                                        size={16}
                                        aria-hidden="true"
                                        className={cn('transition-transform duration-200', grupoMovil === enlace.id && 'rotate-180')}
                                    />
                                </button>
                                <div hidden={grupoMovil !== enlace.id} className="pb-4">
                                    {(enlace.grupos ?? []).map((grupo) => (
                                        <div key={grupo.id ?? grupo.titulo} className="mt-2 first:mt-0">
                                            <p className="etiqueta py-2 text-white/55">{grupo.titulo}</p>
                                            {(grupo.enlaces ?? []).map((hijo) => (
                                                <Enlace
                                                    key={hijo.destino ?? hijo.texto}
                                                    destino={hijo.destino}
                                                    onClick={() => setMenuAbierto(false)}
                                                    className="flex min-h-[2.75rem] items-center text-[0.9375rem] text-white/80 active:text-white"
                                                >
                                                    {hijo.texto}
                                                </Enlace>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Enlace
                                key={enlace.id ?? enlace.texto}
                                destino={enlace.destino}
                                onClick={() => setMenuAbierto(false)}
                                className="border-b border-white/10 py-4 text-[0.9375rem] font-bold tracking-tight text-white transition-colors active:text-white/60"
                            >
                                {enlace.texto}
                            </Enlace>
                        )
                    )}
                    {destacado && (
                        <Enlace
                            destino={destacado.destino}
                            onClick={() => setMenuAbierto(false)}
                            className="boton mb-1 mt-4 w-full bg-white text-black"
                        >
                            {destacado.texto}
                        </Enlace>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
