import React, { useState } from 'react';
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';

import {
    AYUDAS,
    LIMITES_LISTA,
    OCULTAS,
    OPCIONES,
    elementoNuevo,
    etiquetaDe,
    resumirElemento,
    tipoDe,
} from './esquema';

/*
 * Los controles del editor.
 *
 * Se generan a partir de la forma del contenido, no de una lista escrita a
 * mano: añadir un campo nuevo al JSON hace que aparezca aquí solo. Lo contrario
 * —un formulario fijo— se desincroniza del contenido a la tercera edición y
 * deja campos que nadie puede tocar.
 */

const caja =
    'w-full rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2.5 text-[0.875rem] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/35';

const Etiqueta = ({ children, ayuda, htmlFor }) => (
    <div className="mb-1.5">
        <label
            htmlFor={htmlFor}
            className="block text-[0.8125rem] font-semibold tracking-tight text-white/80"
        >
            {children}
        </label>
        {ayuda && <p className="mt-0.5 text-[0.75rem] leading-snug text-white/45">{ayuda}</p>}
    </div>
);

/** Un valor suelto: texto, párrafo, número, interruptor o desplegable. */
const Valor = ({ clave, valor, ruta, onCambio }) => {
    const tipo = tipoDe(clave, valor);
    const id = ruta.join('-');
    const ayuda = AYUDAS[clave];

    if (tipo === 'interruptor') {
        return (
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="text-[0.8125rem] font-semibold text-white/80">
                    {etiquetaDe(clave)}
                </span>
                <input
                    type="checkbox"
                    checked={valor !== false}
                    onChange={(e) => onCambio(ruta, e.target.checked)}
                    className="h-5 w-5 cursor-pointer rounded"
                />
            </label>
        );
    }

    if (tipo === 'opciones') {
        return (
            <div>
                <Etiqueta htmlFor={id} ayuda={ayuda}>
                    {etiquetaDe(clave)}
                </Etiqueta>
                <select
                    id={id}
                    value={valor ?? ''}
                    onChange={(e) => onCambio(ruta, e.target.value)}
                    className={caja}
                >
                    {OPCIONES[clave].map((o) => (
                        <option key={o.valor} value={o.valor} className="bg-[#111]">
                            {o.texto}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    if (tipo === 'numero') {
        return (
            <div>
                <Etiqueta htmlFor={id} ayuda={ayuda}>
                    {etiquetaDe(clave)}
                </Etiqueta>
                <input
                    id={id}
                    type="number"
                    step="0.05"
                    value={valor ?? 0}
                    onChange={(e) => onCambio(ruta, Number(e.target.value))}
                    className={caja}
                />
            </div>
        );
    }

    return (
        <div>
            <Etiqueta htmlFor={id} ayuda={ayuda}>
                {etiquetaDe(clave)}
            </Etiqueta>
            {tipo === 'parrafo' ? (
                <textarea
                    id={id}
                    rows={4}
                    value={valor ?? ''}
                    onChange={(e) => onCambio(ruta, e.target.value)}
                    className={`${caja} resize-y leading-relaxed`}
                />
            ) : (
                <input
                    id={id}
                    type="text"
                    value={valor ?? ''}
                    onChange={(e) => onCambio(ruta, e.target.value)}
                    className={caja}
                />
            )}
        </div>
    );
};

/** Lista de textos sueltos: herramientas, puntos de una tarjeta, límites. */
const ListaTexto = ({ clave, valor, ruta, onCambio }) => {
    const tope = LIMITES_LISTA[clave] ?? 20;

    const cambiar = (i, texto) => {
        const copia = [...valor];
        copia[i] = texto;
        onCambio(ruta, copia);
    };

    const quitar = (i) => onCambio(ruta, valor.filter((_, j) => j !== i));
    const mover = (i, salto) => {
        const destino = i + salto;
        if (destino < 0 || destino >= valor.length) return;
        const copia = [...valor];
        [copia[i], copia[destino]] = [copia[destino], copia[i]];
        onCambio(ruta, copia);
    };

    return (
        <div>
            <Etiqueta ayuda={AYUDAS[clave]}>{etiquetaDe(clave)}</Etiqueta>
            <ul className="space-y-2">
                {valor.map((texto, i) => (
                    <li key={`${ruta.join('-')}-${i}`} className="flex items-start gap-2">
                        <div className="flex flex-col pt-1">
                            <button
                                type="button"
                                onClick={() => mover(i, -1)}
                                disabled={i === 0}
                                aria-label="Subir"
                                className="px-1 text-white/35 hover:text-white disabled:opacity-25"
                            >
                                <ChevronDown size={12} className="rotate-180" />
                            </button>
                            <button
                                type="button"
                                onClick={() => mover(i, 1)}
                                disabled={i === valor.length - 1}
                                aria-label="Bajar"
                                className="px-1 text-white/35 hover:text-white disabled:opacity-25"
                            >
                                <ChevronDown size={12} />
                            </button>
                        </div>
                        <textarea
                            rows={texto.length > 70 ? 2 : 1}
                            value={texto}
                            onChange={(e) => cambiar(i, e.target.value)}
                            className={`${caja} resize-y`}
                        />
                        <button
                            type="button"
                            onClick={() => quitar(i)}
                            aria-label={`Quitar el elemento ${i + 1}`}
                            className="mt-1 rounded-lg p-2 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <Trash2 size={14} />
                        </button>
                    </li>
                ))}
            </ul>

            {valor.length < tope && (
                <button
                    type="button"
                    onClick={() => onCambio(ruta, [...valor, ''])}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-[0.75rem] font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                    <Plus size={13} /> Añadir
                </button>
            )}
        </div>
    );
};

/** Lista de tarjetas: servicios, pasos, giros, enlaces del menú. */
const ListaObjetos = ({ clave, valor, ruta, onCambio }) => {
    const [abierto, setAbierto] = useState(null);
    const tope = LIMITES_LISTA[clave] ?? 12;

    const cambiarElemento = (i, rutaInterna, nuevo) => {
        const copia = [...valor];
        copia[i] = aplicar(copia[i], rutaInterna, nuevo);
        onCambio(ruta, copia);
    };

    const quitar = (i) => {
        onCambio(ruta, valor.filter((_, j) => j !== i));
        setAbierto(null);
    };

    const mover = (i, salto) => {
        const destino = i + salto;
        if (destino < 0 || destino >= valor.length) return;
        const copia = [...valor];
        [copia[i], copia[destino]] = [copia[destino], copia[i]];
        onCambio(ruta, copia);
        setAbierto(destino);
    };

    return (
        <div>
            <Etiqueta ayuda={AYUDAS[clave]}>{etiquetaDe(clave)}</Etiqueta>

            <ul className="space-y-2">
                {valor.map((elemento, i) => {
                    const estaAbierto = abierto === i;
                    return (
                        <li
                            key={elemento?.id ?? `${ruta.join('-')}-${i}`}
                            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
                        >
                            <div className="flex items-center gap-1 px-2 py-2">
                                <GripVertical size={14} className="flex-none text-white/20" aria-hidden="true" />
                                <button
                                    type="button"
                                    onClick={() => setAbierto(estaAbierto ? null : i)}
                                    aria-expanded={estaAbierto}
                                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
                                >
                                    <ChevronDown
                                        size={14}
                                        className={`flex-none text-white/40 transition-transform ${estaAbierto ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate text-[0.8125rem] font-semibold text-white/85">
                                        {resumirElemento(elemento)}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => mover(i, -1)}
                                    disabled={i === 0}
                                    aria-label="Subir"
                                    className="rounded p-1.5 text-white/35 hover:text-white disabled:opacity-25"
                                >
                                    <ChevronDown size={12} className="rotate-180" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => mover(i, 1)}
                                    disabled={i === valor.length - 1}
                                    aria-label="Bajar"
                                    className="rounded p-1.5 text-white/35 hover:text-white disabled:opacity-25"
                                >
                                    <ChevronDown size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => quitar(i)}
                                    aria-label={`Quitar ${resumirElemento(elemento)}`}
                                    className="rounded p-1.5 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            {estaAbierto && (
                                <div className="space-y-3 border-t border-white/10 px-3 py-4">
                                    <Grupo
                                        valor={elemento}
                                        ruta={[]}
                                        onCambio={(rutaInterna, nuevo) =>
                                            cambiarElemento(i, rutaInterna, nuevo)
                                        }
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {valor.length < tope && (
                <button
                    type="button"
                    onClick={() => {
                        onCambio(ruta, [...valor, elementoNuevo(valor[0])]);
                        setAbierto(valor.length);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-[0.75rem] font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                    <Plus size={13} /> Añadir
                </button>
            )}
        </div>
    );
};

/**
 * Devuelve una copia del objeto con un valor cambiado en una ruta.
 *
 * Copia en lugar de mutar porque React compara por referencia: mutando, ni la
 * vista previa ni el propio formulario se enterarían del cambio.
 */
export function aplicar(objeto, ruta, valor) {
    if (ruta.length === 0) return valor;

    const [cabeza, ...resto] = ruta;

    if (Array.isArray(objeto)) {
        const copia = [...objeto];
        copia[cabeza] = aplicar(copia[cabeza], resto, valor);
        return copia;
    }

    return { ...objeto, [cabeza]: aplicar(objeto?.[cabeza], resto, valor) };
}

/** Un objeto entero, campo por campo. */
export const Grupo = ({ valor, ruta, onCambio }) => (
    <>
        {Object.entries(valor ?? {})
            .filter(([clave]) => !OCULTAS.has(clave))
            .map(([clave, hijo]) => {
                const rutaHijo = [...ruta, clave];
                const tipo = tipoDe(clave, hijo);

                if (tipo === 'lista-texto') {
                    return (
                        <ListaTexto
                            key={clave}
                            clave={clave}
                            valor={hijo}
                            ruta={rutaHijo}
                            onCambio={onCambio}
                        />
                    );
                }

                if (tipo === 'lista-objetos') {
                    return (
                        <ListaObjetos
                            key={clave}
                            clave={clave}
                            valor={hijo}
                            ruta={rutaHijo}
                            onCambio={onCambio}
                        />
                    );
                }

                if (tipo === 'grupo') {
                    return (
                        <fieldset
                            key={clave}
                            className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                        >
                            <legend className="px-1 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white/50">
                                {etiquetaDe(clave)}
                            </legend>
                            <Grupo valor={hijo} ruta={rutaHijo} onCambio={onCambio} />
                        </fieldset>
                    );
                }

                return (
                    <Valor
                        key={clave}
                        clave={clave}
                        valor={hijo}
                        ruta={rutaHijo}
                        onCambio={onCambio}
                    />
                );
            })}
    </>
);
