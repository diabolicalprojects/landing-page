import {
    ClockCounterClockwiseIcon,
    DevicesIcon,
    DotsThreeOutlineIcon,
    HouseIcon,
    SignOutIcon,
    UserCircleIcon,
    UsersIcon,
    type Icon,
} from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { ETIQUETA_ROL, type Permiso } from '@diabolical/esquemas';

import { api } from '../api';
import { CLAVE_SESION, useSesion } from '../sesion';

/*
 * El armazón: la isla negra a la izquierda y el contenido a la derecha. En el
 * teléfono la isla se va y aparece la barra inferior flotante, con cuatro
 * pestañas; lo que no cabe va en «Más».
 *
 * Solo se enseña lo que el rol puede usar: el panel oculta, la API decide.
 */

interface Destino {
    ruta: string;
    texto: string;
    Icono: Icon;
    permiso?: Permiso;
    exacta?: boolean;
}

const PANEL: Destino[] = [{ ruta: '/', texto: 'Inicio', Icono: HouseIcon, exacta: true }];

const EQUIPO: Destino[] = [
    { ruta: '/usuarios', texto: 'Usuarios', Icono: UsersIcon, permiso: 'usuarios:gestionar' },
    { ruta: '/auditoria', texto: 'Auditoría', Icono: ClockCounterClockwiseIcon, permiso: 'auditoria:ver' },
];

const PROPIO: Destino[] = [
    { ruta: '/sesiones', texto: 'Sesiones', Icono: DevicesIcon },
    { ruta: '/cuenta', texto: 'Cuenta', Icono: UserCircleIcon },
];

function EnlaceNav({ d }: { d: Destino }) {
    return (
        <NavLink
            to={d.ruta}
            end={d.exacta}
            className={({ isActive }) => `enlace-nav ${isActive ? 'enlace-nav--activo' : ''}`}
        >
            {({ isActive }) => (
                <>
                    <d.Icono size={18} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                    {d.texto}
                </>
            )}
        </NavLink>
    );
}

export function useSalir() {
    const cliente = useQueryClient();
    const navegar = useNavigate();
    return useMutation({
        mutationFn: () => api<void>('/sesion', { metodo: 'DELETE' }),
        onSettled: () => {
            cliente.setQueryData(CLAVE_SESION, null);
            cliente.removeQueries({ predicate: (q) => q.queryKey[0] !== CLAVE_SESION[0] });
            navegar('/acceso', { replace: true });
        },
    });
}

export function Marco() {
    const { sesion, puede } = useSesion();
    const salir = useSalir();
    const equipo = EQUIPO.filter((d) => !d.permiso || puede(d.permiso));

    // En el teléfono: Inicio, Usuarios (si puede) o Sesiones, Cuenta y Más.
    const pestanas: Destino[] = [
        PANEL[0]!,
        equipo[0] ?? PROPIO[0]!,
        PROPIO[1]!,
        { ruta: '/mas', texto: 'Más', Icono: DotsThreeOutlineIcon },
    ];

    return (
        <div className="marco">
            <nav className="lateral oscuro" aria-label="Principal">
                <NavLink to="/" className="lateral__marca" aria-label="Inicio del panel">
                    <img className="lateral__logo" src="/admin/icono.svg" alt="" width={34} height={34} />
                    <span className="lateral__nombre">
                        <b>DIABOLICAL</b>
                        <span>Panel del sitio</span>
                    </span>
                </NavLink>

                <div className="lateral__grupo">
                    {PANEL.map((d) => (
                        <EnlaceNav key={d.ruta} d={d} />
                    ))}
                </div>

                {equipo.length > 0 && (
                    <div className="lateral__grupo">
                        <p className="lateral__rotulo">Equipo</p>
                        {equipo.map((d) => (
                            <EnlaceNav key={d.ruta} d={d} />
                        ))}
                    </div>
                )}

                <div className="lateral__grupo lateral__grupo--pie">
                    {sesion && (
                        <p className="lateral__persona">
                            {sesion.usuario.nombre} · {ETIQUETA_ROL[sesion.usuario.rol]}
                        </p>
                    )}
                    {PROPIO.map((d) => (
                        <EnlaceNav key={d.ruta} d={d} />
                    ))}
                    <button type="button" className="enlace-nav" onClick={() => salir.mutate()} disabled={salir.isPending}>
                        <SignOutIcon size={18} aria-hidden="true" />
                        Salir
                    </button>
                </div>
            </nav>

            <main className="principal" id="contenido">
                <Outlet />
            </main>

            <nav className="barra-inferior oscuro" aria-label="Principal en el teléfono">
                {pestanas.map((d) => (
                    <NavLink
                        key={d.ruta}
                        to={d.ruta}
                        end={d.exacta}
                        className={({ isActive }) => `pestana ${isActive ? 'pestana--activa' : ''}`}
                    >
                        {({ isActive }) => (
                            <>
                                <span className="pestana__icono">
                                    <d.Icono size={19} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                                </span>
                                <span>{d.texto}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

/** La pestaña «Más» del teléfono: lo que no cabe en la barra. */
export function Mas() {
    const { puede } = useSesion();
    const salir = useSalir();
    const todos = [...EQUIPO.filter((d) => !d.permiso || puede(d.permiso)), ...PROPIO];
    return (
        <>
            <header className="cabecera">
                <div className="cabecera__texto">
                    <h1 className="titulo-pagina">Más</h1>
                </div>
            </header>
            <section className="tarjeta menu">
                {todos.map((d) => (
                    <NavLink key={d.ruta} to={d.ruta} className="menu__fila">
                        <d.Icono size={20} aria-hidden="true" />
                        {d.texto}
                    </NavLink>
                ))}
                <button type="button" className="menu__fila" onClick={() => salir.mutate()}>
                    <SignOutIcon size={20} aria-hidden="true" />
                    Salir
                </button>
            </section>
        </>
    );
}
