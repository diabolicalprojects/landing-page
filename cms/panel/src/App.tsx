import { CompassIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import type { Permiso } from '@diabolical/esquemas';

import { Cabecera, Tarjeta, Vacio } from './componentes/base';
import { Marco, Mas } from './componentes/Marco';
import { Acceso } from './paginas/Acceso';
import { Auditoria } from './paginas/Auditoria';
import { Cuenta } from './paginas/Cuenta';
import { Inicio } from './paginas/Inicio';
import { Sesiones } from './paginas/Sesiones';
import { Usuarios } from './paginas/Usuarios';
import { useSesion } from './sesion';

/** Sin sesión, a la puerta; recordando a dónde iba para volver después. */
function ConSesion() {
    const { sesion, cargando } = useSesion();
    const ubicacion = useLocation();
    if (cargando) return <div className="acceso" aria-busy="true" />;
    if (!sesion) return <Navigate to="/acceso" replace state={{ desde: ubicacion.pathname }} />;
    return <Marco />;
}

/** Una pantalla que el rol no puede usar no se enseña: vuelve al inicio. */
function Permitido({ permiso, children }: { permiso: Permiso; children: ReactNode }) {
    const { puede } = useSesion();
    return puede(permiso) ? <>{children}</> : <Navigate to="/" replace />;
}

function NoEncontrada() {
    return (
        <>
            <Cabecera titulo="No existe" />
            <Tarjeta>
                <Vacio
                    icono={<CompassIcon size={26} />}
                    titulo="Esta pantalla no existe"
                    texto="Puede que la dirección esté mal escrita o que la sección llegue en una fase posterior."
                    acciones={
                        <Link to="/" className="boton boton--principal">
                            Volver al inicio
                        </Link>
                    }
                />
            </Tarjeta>
        </>
    );
}

export function App() {
    return (
        <Routes>
            <Route path="/acceso" element={<Acceso />} />
            <Route element={<ConSesion />}>
                <Route index element={<Inicio />} />
                <Route
                    path="usuarios"
                    element={
                        <Permitido permiso="usuarios:gestionar">
                            <Usuarios />
                        </Permitido>
                    }
                />
                <Route
                    path="auditoria"
                    element={
                        <Permitido permiso="auditoria:ver">
                            <Auditoria />
                        </Permitido>
                    }
                />
                <Route path="sesiones" element={<Sesiones />} />
                <Route path="cuenta" element={<Cuenta />} />
                <Route path="mas" element={<Mas />} />
                <Route path="*" element={<NoEncontrada />} />
            </Route>
        </Routes>
    );
}
