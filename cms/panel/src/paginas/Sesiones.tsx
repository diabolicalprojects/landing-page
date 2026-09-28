import { DevicesIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { SesionPublica } from '@diabolical/esquemas';

import { api } from '../api';
import { Boton, Cabecera, Chip, FilasCargando, Tarjeta, Vacio } from '../componentes/base';
import { useToasts } from '../componentes/Toasts';
import { fechaCompleta, relativa } from '../formato';
import { useSesion } from '../sesion';

/*
 * Sesiones abiertas y su cierre a distancia. Cerrar una no se puede deshacer
 * (quien la tenía tendrá que volver a entrar), así que se confirma en la misma
 * fila, como en el Planificador, sin ventana aparte.
 */

const COLUMNAS = 'minmax(0, 2fr) minmax(0, 1.2fr) 190px';

function Fila({ s, todas }: { s: SesionPublica; todas: boolean }) {
    const cliente = useQueryClient();
    const { avisar } = useToasts();
    const [confirmando, setConfirmando] = useState(false);

    const cerrar = useMutation({
        mutationFn: () => api<void>(`/sesiones/${s.id}`, { metodo: 'DELETE' }),
        onSuccess: () => {
            void cliente.invalidateQueries({ queryKey: ['sesiones'] });
            void cliente.invalidateQueries({ queryKey: ['inicio'] });
            avisar('Sesión cerrada');
        },
    });

    return (
        <div className="lista__fila" style={{ ['--columnas' as string]: COLUMNAS, ['--columnas-movil' as string]: 'minmax(0, 1fr) auto' }}>
            <span className="lista__doble">
                <span className="lista__nombre">
                    {todas && s.usuario ? `${s.usuario.nombre} · ` : ''}
                    {s.dispositivo}
                </span>
                <span className="lista__detalle">
                    {s.ip ?? 'IP desconocida'} · abierta {relativa(s.creadaEn)}
                </span>
            </span>
            <span className="lista__detalle solo-ancho" title={fechaCompleta(s.ultimoUso)}>
                Último uso {relativa(s.ultimoUso)}
            </span>
            <span className="lista__derecha">
                {s.actual ? (
                    <Chip tipo="negro">Esta sesión</Chip>
                ) : confirmando ? (
                    <>
                        <Boton pequeno variante="principal" ocupado={cerrar.isPending} onClick={() => cerrar.mutate()}>
                            Cerrar de verdad
                        </Boton>
                        <Boton pequeno onClick={() => setConfirmando(false)}>
                            Dejarla
                        </Boton>
                    </>
                ) : (
                    <Boton pequeno variante="contorno" onClick={() => setConfirmando(true)}>
                        Cerrar
                    </Boton>
                )}
            </span>
        </div>
    );
}

export function Sesiones() {
    const { puede } = useSesion();
    const [todas, setTodas] = useState(false);
    const verTodas = todas && puede('usuarios:gestionar');
    const lista = useQuery({
        queryKey: ['sesiones', verTodas],
        queryFn: () => api<SesionPublica[]>(`/sesiones${verTodas ? '?todas=1' : ''}`),
    });

    return (
        <>
            <Cabecera
                titulo="Sesiones"
                texto="Dónde está abierto el panel. Cerrar una obliga a volver a entrar en ese dispositivo."
                acciones={
                    puede('usuarios:gestionar') && (
                        <div className="segmentos" role="group" aria-label="Qué sesiones ver">
                            <button type="button" className={`segmento ${!todas ? 'segmento--activo' : ''}`} aria-pressed={!todas} onClick={() => setTodas(false)}>
                                Mías
                            </button>
                            <button type="button" className={`segmento ${todas ? 'segmento--activo' : ''}`} aria-pressed={todas} onClick={() => setTodas(true)}>
                                De todo el equipo
                            </button>
                        </div>
                    )
                }
            />
            <Tarjeta className="lista">
                {lista.isPending ? (
                    <FilasCargando filas={3} columnas={COLUMNAS} />
                ) : lista.error ? (
                    <Vacio icono={<DevicesIcon size={26} />} titulo="No se pudieron cargar las sesiones" texto={lista.error.message} />
                ) : lista.data.length === 0 ? (
                    <Vacio icono={<DevicesIcon size={26} />} titulo="Sin sesiones abiertas" />
                ) : (
                    lista.data.map((s) => <Fila key={s.id} s={s} todas={verTodas} />)
                )}
            </Tarjeta>
        </>
    );
}
