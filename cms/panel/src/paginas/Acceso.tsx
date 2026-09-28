import { WarningIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import type { SesionActual } from '@diabolical/esquemas';

import { api, ErrorApi } from '../api';
import { CLAVE_SESION, useSesion } from '../sesion';

/*
 * La puerta del panel: correo y contraseña. El error se anuncia (role=alert) y
 * es el mismo para un correo que no existe y una contraseña mala.
 */
export function Acceso() {
    const { sesion } = useSesion();
    const cliente = useQueryClient();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');

    const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/';

    const entrar = useMutation({
        mutationFn: () => api<SesionActual>('/sesion', { metodo: 'POST', cuerpo: { correo, contrasena } }),
        onSuccess: (datos) => {
            cliente.setQueryData(CLAVE_SESION, datos);
            navegar(destino, { replace: true });
        },
        onError: () => setContrasena(''),
    });

    if (sesion) return <Navigate to={destino} replace />;

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        entrar.mutate();
    };

    const error = entrar.error instanceof ErrorApi ? entrar.error.message : entrar.error ? 'Algo falló.' : null;
    const caducada = (ubicacion.state as { caducada?: boolean } | null)?.caducada;

    return (
        <main className="acceso oscuro">
            <form className="acceso__caja" onSubmit={enviar} noValidate>
                <img className="acceso__logo" src="/admin/logo-blanco.svg" alt="Diabolical" width={200} height={111} />
                <p className="acceso__apoyo">Panel del sitio</p>

                {error ? (
                    <p className="acceso__error" role="alert">
                        <WarningIcon size={16} weight="bold" aria-hidden="true" />
                        {error}
                    </p>
                ) : (
                    caducada && (
                        <p className="acceso__error" role="status">
                            La sesión terminó. Hay que volver a entrar.
                        </p>
                    )
                )}

                <div className="acceso__bloque">
                    <label className="acceso__etiqueta" htmlFor="correo">
                        Correo
                    </label>
                    <input
                        id="correo"
                        className="acceso__campo"
                        type="email"
                        autoComplete="username"
                        inputMode="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                    />
                </div>

                <div className="acceso__bloque">
                    <label className="acceso__etiqueta" htmlFor="contrasena">
                        Contraseña
                    </label>
                    <input
                        id="contrasena"
                        className="acceso__campo"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="boton acceso__boton"
                    disabled={entrar.isPending || !correo || !contrasena}
                    aria-busy={entrar.isPending || undefined}
                >
                    {entrar.isPending && <span className="girando" aria-hidden="true" />}
                    {entrar.isPending ? 'Entrando…' : 'Entrar'}
                </button>
            </form>
        </main>
    );
}
