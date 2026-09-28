import { KeyIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { CONTRASENA_MIN, ETIQUETA_ROL, type UsuarioPublico } from '@diabolical/esquemas';

import { api, ErrorApi } from '../api';
import { Aviso, Boton, Cabecera, Campo, Tarjeta } from '../componentes/base';
import { useToasts } from '../componentes/Toasts';
import { fechaCompleta } from '../formato';
import { CLAVE_SESION, useSesion } from '../sesion';

/*
 * La cuenta propia: el nombre y la contraseña. El correo y el rol los cambia
 * un administrador.
 */

function Datos() {
    const { sesion } = useSesion();
    const cliente = useQueryClient();
    const { avisar } = useToasts();
    const u = sesion!.usuario;
    const [nombre, setNombre] = useState(u.nombre);

    const guardar = useMutation({
        mutationFn: () => api<UsuarioPublico>('/cuenta', { metodo: 'PATCH', cuerpo: { nombre } }),
        onSuccess: (actualizado) => {
            cliente.setQueryData(CLAVE_SESION, sesion ? { ...sesion, usuario: actualizado } : sesion);
            avisar('Nombre guardado');
        },
    });
    const campos = guardar.error instanceof ErrorApi ? guardar.error.campos : {};

    return (
        <Tarjeta className="panel">
            <div className="panel__cabecera">
                <h2 className="titulo-tarjeta">Datos</h2>
            </div>
            <form
                className="formulario"
                onSubmit={(e) => {
                    e.preventDefault();
                    guardar.mutate();
                }}
                noValidate
            >
                <Campo etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={campos.nombre} autoComplete="name" />
                <dl className="datos">
                    <dt>Correo</dt>
                    <dd>{u.correo}</dd>
                    <dt>Rol</dt>
                    <dd>{ETIQUETA_ROL[u.rol]}</dd>
                    <dt>En el panel desde</dt>
                    <dd>{fechaCompleta(u.creadoEn)}</dd>
                </dl>
                <div className="formulario__acciones">
                    <Boton type="submit" variante="principal" disabled={nombre.trim() === u.nombre} ocupado={guardar.isPending}>
                        Guardar nombre
                    </Boton>
                </div>
            </form>
        </Tarjeta>
    );
}

function Contrasena() {
    const { avisar } = useToasts();
    const [actual, setActual] = useState('');
    const [nueva, setNueva] = useState('');
    const [repetida, setRepetida] = useState('');
    const [local, setLocal] = useState<string | null>(null);

    const cambiar = useMutation({
        mutationFn: () => api('/cuenta/contrasena', { metodo: 'POST', cuerpo: { actual, nueva } }),
        onSuccess: () => {
            setActual('');
            setNueva('');
            setRepetida('');
            avisar('Contraseña cambiada. Las demás sesiones se cerraron.');
        },
    });
    const campos = cambiar.error instanceof ErrorApi ? cambiar.error.campos : {};

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        if (nueva !== repetida) {
            setLocal('Las dos contraseñas nuevas no coinciden.');
            return;
        }
        setLocal(null);
        cambiar.mutate();
    };

    return (
        <Tarjeta className="panel">
            <div className="panel__cabecera">
                <h2 className="titulo-tarjeta">Contraseña</h2>
            </div>
            <form className="formulario" onSubmit={enviar} noValidate>
                <Campo etiqueta="Contraseña actual" type="password" value={actual} onChange={(e) => setActual(e.target.value)} error={campos.actual} autoComplete="current-password" />
                <Campo
                    etiqueta="Contraseña nueva"
                    type="password"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                    error={campos.nueva}
                    pista={`Al menos ${CONTRASENA_MIN} caracteres. Una frase larga funciona mejor que símbolos raros.`}
                    autoComplete="new-password"
                />
                <Campo etiqueta="Repetir la nueva" type="password" value={repetida} onChange={(e) => setRepetida(e.target.value)} error={local ?? undefined} autoComplete="new-password" />
                {cambiar.error && !Object.keys(campos).length && (
                    <Aviso hundido rol="alert" icono={<KeyIcon size={15} weight="bold" />}>
                        {cambiar.error.message}
                    </Aviso>
                )}
                <div className="formulario__acciones">
                    <Boton type="submit" variante="principal" disabled={!actual || !nueva || !repetida} ocupado={cambiar.isPending}>
                        Cambiar contraseña
                    </Boton>
                </div>
            </form>
        </Tarjeta>
    );
}

export function Cuenta() {
    return (
        <>
            <Cabecera titulo="Cuenta" texto="Cambiar la contraseña cierra las demás sesiones abiertas." />
            <div className="rejilla-2">
                <Datos />
                <Contrasena />
            </div>
        </>
    );
}
