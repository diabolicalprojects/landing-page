import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ACCIONES, type EntradaAuditoria } from '@diabolical/esquemas';

import { api } from '../api';
import { Boton, Cabecera, FilasCargando, Tarjeta, Vacio } from '../componentes/base';
import { fechaCompleta, nombreAccion, relativa } from '../formato';

/*
 * El registro de auditoría: quién cambió qué, cuándo y desde qué IP. Solo
 * crece; ni un administrador puede editarlo. Se lee por páginas de 50.
 */

const COLUMNAS = 'minmax(0, 1.6fr) minmax(0, 1.4fr) 120px 150px';

interface Pagina {
    entradas: EntradaAuditoria[];
    siguiente: number | null;
}

export function Auditoria() {
    const [accion, setAccion] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    const consulta = useInfiniteQuery({
        queryKey: ['auditoria', accion, desde, hasta],
        initialPageParam: null as number | null,
        queryFn: ({ pageParam }) => {
            const p = new URLSearchParams();
            if (accion) p.set('accion', accion);
            if (desde) p.set('desde', desde);
            if (hasta) p.set('hasta', hasta);
            if (pageParam) p.set('antesDe', String(pageParam));
            return api<Pagina>(`/auditoria?${p.toString()}`);
        },
        getNextPageParam: (ultima) => ultima.siguiente,
    });

    const entradas = consulta.data?.pages.flatMap((p) => p.entradas) ?? [];

    return (
        <>
            <Cabecera titulo="Auditoría" texto="Cada cambio en el panel, con su autor, su fecha y su IP." />

            <Tarjeta className="panel">
                <div className="formulario" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="bloque-campo" style={{ minWidth: 220, flex: 1 }}>
                        <label className="etiqueta-campo" htmlFor="filtro-accion">
                            Acción
                        </label>
                        <select id="filtro-accion" className="campo" value={accion} onChange={(e) => setAccion(e.target.value)}>
                            <option value="">Todas</option>
                            {Object.entries(ACCIONES).map(([clave, texto]) => (
                                <option key={clave} value={clave}>
                                    {texto}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="bloque-campo" style={{ minWidth: 150 }}>
                        <label className="etiqueta-campo" htmlFor="filtro-desde">
                            Desde
                        </label>
                        <input id="filtro-desde" type="date" className="campo" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} />
                    </div>
                    <div className="bloque-campo" style={{ minWidth: 150 }}>
                        <label className="etiqueta-campo" htmlFor="filtro-hasta">
                            Hasta
                        </label>
                        <input id="filtro-hasta" type="date" className="campo" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
                    </div>
                    {(accion || desde || hasta) && (
                        <Boton
                            onClick={() => {
                                setAccion('');
                                setDesde('');
                                setHasta('');
                            }}
                        >
                            Quitar filtros
                        </Boton>
                    )}
                </div>
            </Tarjeta>

            <Tarjeta className="lista">
                <div className="lista__fila lista__cabecera rotulo" style={{ ['--columnas' as string]: COLUMNAS }} aria-hidden="true">
                    <span>Acción</span>
                    <span className="solo-ancho">Quién</span>
                    <span className="solo-ancho">IP</span>
                    <span style={{ textAlign: 'right' }}>Cuándo</span>
                </div>
                {consulta.isPending ? (
                    <FilasCargando filas={6} columnas={COLUMNAS} />
                ) : consulta.error ? (
                    <Vacio icono={<ClockCounterClockwiseIcon size={26} />} titulo="No se pudo cargar el registro" texto={consulta.error.message} />
                ) : entradas.length === 0 ? (
                    <Vacio icono={<ClockCounterClockwiseIcon size={26} />} titulo="Nada con esos filtros" texto="Con otra acción u otras fechas puede haber resultados." />
                ) : (
                    <>
                        {entradas.map((e) => (
                            <div key={e.id} className="lista__fila" style={{ ['--columnas' as string]: COLUMNAS }}>
                                <span className="lista__doble">
                                    <span className="lista__nombre">{nombreAccion(e.accion)}</span>
                                    <span className="lista__detalle">
                                        {e.entidad}
                                        {e.entidadId ? ` · ${e.entidadId.slice(0, 8)}` : ''}
                                    </span>
                                </span>
                                <span className="lista__detalle solo-ancho">{e.usuario.correo ?? 'Sistema'}</span>
                                <span className="lista__detalle solo-ancho">{e.ip ?? ''}</span>
                                <time className="lista__derecha lista__detalle" dateTime={e.fecha} title={fechaCompleta(e.fecha)}>
                                    {relativa(e.fecha)}
                                </time>
                            </div>
                        ))}
                        {consulta.hasNextPage && (
                            <div className="lista__pie">
                                <Boton onClick={() => void consulta.fetchNextPage()} ocupado={consulta.isFetchingNextPage}>
                                    Cargar más
                                </Boton>
                            </div>
                        )}
                    </>
                )}
            </Tarjeta>
        </>
    );
}
