import { ClockCounterClockwiseIcon, HammerIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { ETIQUETA_ROL } from '@diabolical/esquemas';

import { api } from '../api';
import { Aviso, Cabecera, Tarjeta, Vacio } from '../componentes/base';
import { fechaCompleta, nombreAccion, relativa } from '../formato';
import { useSesion } from '../sesion';

/*
 * Inicio. En la Fase 1 el panel todavía no edita el sitio: enseña la cuenta,
 * sus sesiones y su actividad, y dice con claridad qué llega después.
 */

interface ResumenInicio {
    sesionesActivas: number;
    accesoAnterior: { fecha: string; ip: string | null } | null;
    actividad: { id: number; fecha: string; accion: string; entidad: string; ip: string | null }[];
}

export function Inicio() {
    const { sesion } = useSesion();
    const resumen = useQuery({ queryKey: ['inicio'], queryFn: () => api<ResumenInicio>('/inicio') });
    const u = sesion!.usuario;

    return (
        <>
            <Cabecera titulo="Inicio" texto={`${u.nombre} · ${ETIQUETA_ROL[u.rol]}`} />

            <Aviso icono={<HammerIcon size={16} weight="bold" />}>
                Fase 1 del CMS: acceso, usuarios, sesiones y auditoría. La edición del sitio (ajustes, menús, medios,
                páginas y contenido) llega en las fases 2 y 3.
            </Aviso>

            <div className="indicadores">
                <div className="indicador indicador--negro oscuro">
                    <p className="indicador__cifra">{resumen.data ? resumen.data.sesionesActivas : '·'}</p>
                    <p className="indicador__rotulo">
                        {resumen.data?.sesionesActivas === 1 ? 'Sesión abierta' : 'Sesiones abiertas'}
                    </p>
                </div>
                <div className="indicador">
                    <p className="indicador__texto">
                        {resumen.data
                            ? resumen.data.accesoAnterior
                                ? relativa(resumen.data.accesoAnterior.fecha)
                                : 'Primera vez'
                            : '·'}
                    </p>
                    <p className="indicador__rotulo">Acceso anterior</p>
                </div>
            </div>

            <Tarjeta className="panel">
                <div className="panel__cabecera">
                    <h2 className="titulo-tarjeta">Actividad reciente</h2>
                    <Link to="/sesiones" className="boton boton--pequeno">
                        Ver sesiones
                    </Link>
                </div>
                {resumen.isPending ? (
                    <div className="actividad" aria-busy="true">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="actividad__fila">
                                <span className="esqueleto" style={{ width: `${50 - i * 8}%` }} />
                            </div>
                        ))}
                    </div>
                ) : resumen.data && resumen.data.actividad.length > 0 ? (
                    <ul className="actividad">
                        {resumen.data.actividad.map((a) => (
                            <li key={a.id} className="actividad__fila">
                                <span>{nombreAccion(a.accion)}</span>
                                <time className="actividad__cuando" dateTime={a.fecha} title={fechaCompleta(a.fecha)}>
                                    {relativa(a.fecha)}
                                </time>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Vacio icono={<ClockCounterClockwiseIcon size={26} />} titulo="Sin actividad todavía" />
                )}
            </Tarjeta>
        </>
    );
}
