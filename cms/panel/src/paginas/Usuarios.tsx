import { LockSimpleIcon, PlusIcon, UsersIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import {
    CONTRASENA_MIN,
    ETIQUETA_ROL,
    ROLES,
    type ActualizarUsuario,
    type Rol,
    type UsuarioPublico,
} from '@diabolical/esquemas';

import { api, ErrorApi } from '../api';
import { Aviso, Boton, Cabecera, Campo, Chip, FilasCargando, Tarjeta, Vacio } from '../componentes/base';
import { Modal } from '../componentes/Modal';
import { useToasts } from '../componentes/Toasts';
import { momento, relativa } from '../formato';
import { useSesion } from '../sesion';

/*
 * Usuarios, solo para administradores: crear, cambiar rol, desactivar,
 * desbloquear y restablecer contraseña. No se borran: se desactivan, para que
 * la auditoría conserve quién hizo cada cosa.
 */

const COLUMNAS = 'minmax(0, 2.2fr) 140px 130px 150px';
const DESCRIPCION_ROL: Record<Rol, string> = {
    administrador: 'Todo, incluidos usuarios, ajustes y código.',
    editor: 'Contenido, medios y solicitudes.',
    lector: 'Solo ver.',
};

function EstadoUsuario({ u }: { u: UsuarioPublico }) {
    if (!u.activo) return <Chip tipo="contorno">Desactivado</Chip>;
    if (u.bloqueadoHasta) {
        return (
            <Chip tipo="negro">
                <LockSimpleIcon size={11} weight="bold" aria-hidden="true" />
                Bloqueado
            </Chip>
        );
    }
    return (
        <Chip>
            <span className="chip__punto" aria-hidden="true" />
            Activo
        </Chip>
    );
}

function SelectorRol({ valor, alCambiar }: { valor: Rol; alCambiar: (r: Rol) => void }) {
    return (
        <div className="bloque-campo">
            <span className="etiqueta-campo" id="etiqueta-rol">
                Rol
            </span>
            <div className="estados" role="radiogroup" aria-labelledby="etiqueta-rol">
                {ROLES.map((r) => (
                    <button
                        key={r}
                        type="button"
                        role="radio"
                        aria-checked={valor === r}
                        className={`estado ${valor === r ? 'estado--activo' : ''}`}
                        onClick={() => alCambiar(r)}
                    >
                        {ETIQUETA_ROL[r]}
                    </button>
                ))}
            </div>
            <span className="pista">{DESCRIPCION_ROL[valor]}</span>
        </div>
    );
}

function NuevoUsuario({ alTerminar }: { alTerminar: () => void }) {
    const cliente = useQueryClient();
    const { avisar } = useToasts();
    const [datos, setDatos] = useState({ nombre: '', correo: '', rol: 'editor' as Rol, contrasena: '' });

    const crear = useMutation({
        mutationFn: () => api<UsuarioPublico>('/usuarios', { metodo: 'POST', cuerpo: datos }),
        onSuccess: (u) => {
            void cliente.invalidateQueries({ queryKey: ['usuarios'] });
            avisar(`Usuario creado: ${u.nombre}`);
            alTerminar();
        },
    });
    const campos = crear.error instanceof ErrorApi ? crear.error.campos : {};

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        crear.mutate();
    };

    return (
        <form className="formulario" onSubmit={enviar} noValidate>
            <Campo
                etiqueta="Nombre"
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                error={campos.nombre}
                autoComplete="off"
                required
            />
            <Campo
                etiqueta="Correo"
                type="email"
                value={datos.correo}
                onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
                error={campos.correo}
                autoComplete="off"
                required
            />
            <SelectorRol valor={datos.rol} alCambiar={(rol) => setDatos({ ...datos, rol })} />
            <Campo
                etiqueta="Contraseña inicial"
                type="password"
                value={datos.contrasena}
                onChange={(e) => setDatos({ ...datos, contrasena: e.target.value })}
                error={campos.contrasena}
                pista={`Al menos ${CONTRASENA_MIN} caracteres. Se rechazan las de listas filtradas.`}
                autoComplete="new-password"
                required
            />
            {crear.error && !Object.keys(campos).length && (
                <Aviso hundido rol="alert" icono={<LockSimpleIcon size={15} weight="bold" />}>
                    {crear.error.message}
                </Aviso>
            )}
            <div className="formulario__acciones">
                <Boton type="submit" variante="principal" ocupado={crear.isPending}>
                    Crear usuario
                </Boton>
                <Boton onClick={alTerminar}>Cancelar</Boton>
            </div>
        </form>
    );
}

function EditarUsuario({ u, alTerminar }: { u: UsuarioPublico; alTerminar: () => void }) {
    const cliente = useQueryClient();
    const { avisar } = useToasts();
    const { sesion } = useSesion();
    const [nombre, setNombre] = useState(u.nombre);
    const [rol, setRol] = useState<Rol>(u.rol);
    const [activo, setActivo] = useState(u.activo);
    const [nueva, setNueva] = useState('');
    const esYo = sesion?.usuario.id === u.id;

    const refrescar = () => void cliente.invalidateQueries({ queryKey: ['usuarios'] });
    const actualizar = (cambios: ActualizarUsuario) =>
        api<UsuarioPublico>(`/usuarios/${u.id}`, { metodo: 'PATCH', cuerpo: cambios });

    const guardar = useMutation({
        mutationFn: () => {
            const cambios: ActualizarUsuario = {};
            if (nombre !== u.nombre) cambios.nombre = nombre;
            if (rol !== u.rol) cambios.rol = rol;
            if (activo !== u.activo) cambios.activo = activo;
            return actualizar(cambios);
        },
        onSuccess: () => {
            refrescar();
            const antes: ActualizarUsuario = {};
            if (rol !== u.rol) antes.rol = u.rol;
            if (activo !== u.activo) antes.activo = u.activo;
            // Cambiar rol o estado se puede deshacer; el nombre se corrige a mano.
            const deshacer = Object.keys(antes).length
                ? async () => {
                      await actualizar(antes);
                      refrescar();
                  }
                : undefined;
            avisar('Cambios guardados', deshacer);
            alTerminar();
        },
    });

    const restablecer = useMutation({
        mutationFn: () => api(`/usuarios/${u.id}/contrasena`, { metodo: 'POST', cuerpo: { contrasena: nueva } }),
        onSuccess: () => {
            setNueva('');
            avisar('Contraseña restablecida. Sus sesiones se cerraron.');
        },
    });

    const desbloquear = useMutation({
        mutationFn: () => api(`/usuarios/${u.id}/desbloquear`, { metodo: 'POST' }),
        onSuccess: () => {
            refrescar();
            avisar('Cuenta desbloqueada');
            alTerminar();
        },
    });

    const campos = guardar.error instanceof ErrorApi ? guardar.error.campos : {};
    const camposClave = restablecer.error instanceof ErrorApi ? restablecer.error.campos : {};
    const sinCambios = nombre === u.nombre && rol === u.rol && activo === u.activo;

    return (
        <div className="formulario">
            {u.bloqueadoHasta && (
                <Aviso
                    fuerte
                    icono={<LockSimpleIcon size={15} weight="bold" />}
                    acciones={
                        <Boton pequeno onClick={() => desbloquear.mutate()} ocupado={desbloquear.isPending}>
                            Desbloquear
                        </Boton>
                    }
                >
                    Bloqueada por intentos fallidos hasta {momento(u.bloqueadoHasta)}.
                </Aviso>
            )}

            <form
                className="formulario"
                onSubmit={(e) => {
                    e.preventDefault();
                    guardar.mutate();
                }}
                noValidate
            >
                <Campo etiqueta="Correo" value={u.correo} readOnly />
                <Campo etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} error={campos.nombre} />
                <SelectorRol valor={rol} alCambiar={setRol} />
                <label className="casilla">
                    <input type="checkbox" checked={activo} disabled={esYo} onChange={(e) => setActivo(e.target.checked)} />
                    <span className="casilla__caja" aria-hidden="true" />
                    Cuenta activa
                </label>
                {esYo && <span className="pista">Una cuenta no puede desactivarse a sí misma.</span>}
                {guardar.error && !Object.keys(campos).length && (
                    <Aviso hundido rol="alert" icono={<LockSimpleIcon size={15} weight="bold" />}>
                        {guardar.error.message}
                    </Aviso>
                )}
                <div className="formulario__acciones">
                    <Boton type="submit" variante="principal" disabled={sinCambios} ocupado={guardar.isPending}>
                        Guardar cambios
                    </Boton>
                    <Boton onClick={alTerminar}>Cancelar</Boton>
                </div>
            </form>

            <form
                className="formulario"
                style={{ paddingTop: 8, borderTop: '1px solid var(--linea)' }}
                onSubmit={(e) => {
                    e.preventDefault();
                    restablecer.mutate();
                }}
                noValidate
            >
                <Campo
                    etiqueta="Restablecer contraseña"
                    type="password"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                    error={camposClave.contrasena ?? (restablecer.error && !Object.keys(camposClave).length ? restablecer.error.message : undefined)}
                    pista="Cierra todas las sesiones de esta cuenta."
                    autoComplete="new-password"
                />
                <div className="formulario__acciones">
                    <Boton type="submit" variante="contorno" disabled={nueva.length === 0} ocupado={restablecer.isPending}>
                        Restablecer
                    </Boton>
                </div>
            </form>
        </div>
    );
}

export function Usuarios() {
    const lista = useQuery({ queryKey: ['usuarios'], queryFn: () => api<UsuarioPublico[]>('/usuarios') });
    const [nuevo, setNuevo] = useState(false);
    const [editando, setEditando] = useState<UsuarioPublico | null>(null);

    return (
        <>
            <Cabecera
                titulo="Usuarios"
                texto="Quién entra al panel y con qué rol."
                acciones={
                    <Boton variante="principal" onClick={() => setNuevo(true)}>
                        <PlusIcon size={16} weight="bold" aria-hidden="true" />
                        Nuevo usuario
                    </Boton>
                }
            />

            <Tarjeta className="lista">
                <div className="lista__fila lista__cabecera rotulo" style={{ ['--columnas' as string]: COLUMNAS }} aria-hidden="true">
                    <span>Persona</span>
                    <span className="solo-ancho">Rol</span>
                    <span className="solo-ancho">Estado</span>
                    <span style={{ textAlign: 'right' }}>Último acceso</span>
                </div>
                {lista.isPending ? (
                    <FilasCargando columnas={COLUMNAS} />
                ) : lista.error ? (
                    <Vacio icono={<UsersIcon size={26} />} titulo="No se pudo cargar la lista" texto={lista.error.message} />
                ) : (
                    lista.data.map((u) => (
                        <button
                            key={u.id}
                            type="button"
                            className="lista__fila"
                            style={{ ['--columnas' as string]: COLUMNAS }}
                            onClick={() => setEditando(u)}
                            aria-label={`Editar a ${u.nombre}`}
                        >
                            <span className="lista__doble">
                                <span className="lista__nombre">{u.nombre}</span>
                                <span className="lista__detalle">{u.correo}</span>
                            </span>
                            <span className="solo-ancho">
                                <Chip tipo={u.rol === 'administrador' ? 'negro' : undefined}>{ETIQUETA_ROL[u.rol]}</Chip>
                            </span>
                            <span className="solo-ancho">
                                <EstadoUsuario u={u} />
                            </span>
                            <span className="lista__derecha lista__detalle">
                                {u.ultimoAcceso ? relativa(u.ultimoAcceso) : 'Nunca'}
                            </span>
                        </button>
                    ))
                )}
            </Tarjeta>

            <Modal abierto={nuevo} alCerrar={() => setNuevo(false)} titulo="Nuevo usuario" texto="Recibirá un aviso por correo al entrar por primera vez.">
                <NuevoUsuario alTerminar={() => setNuevo(false)} />
            </Modal>

            <Modal abierto={editando !== null} alCerrar={() => setEditando(null)} titulo={editando?.nombre ?? 'Usuario'}>
                {editando && <EditarUsuario key={editando.id} u={editando} alTerminar={() => setEditando(null)} />}
            </Modal>
        </>
    );
}
