import React from 'react';

import { useBloque } from '../../contenido';

/*
 * Tira de integraciones.
 *
 * Donde la categoría pone logos de clientes, aquí van las herramientas sobre
 * las que se monta el sistema. No es lo mismo y por eso no se disfraza de lo
 * mismo: son nombres en texto, no logotipos ajenos, y el titular dice
 * exactamente qué se está afirmando — que no hay que cambiar de herramientas.
 *
 * La lista se duplica en el markup y la animación desplaza justo la mitad: ahí
 * es donde el bucle vuelve al punto de partida sin dar el salto. La copia va
 * con aria-hidden para que un lector de pantalla no lea dos veces lo mismo.
 */

// Fuera del componente: definida dentro, React la trataría como un componente
// nuevo en cada render y remontaría la lista entera, reiniciando la animación.
const Fila = ({ piezas, oculta }) => (
    <ul className="flex items-center" aria-hidden={oculta || undefined}>
        {piezas.map((pieza, i) => (
            <li
                key={`${pieza}-${i}`}
                className="flex flex-none items-center gap-8 px-8 text-[0.9375rem] font-semibold tracking-tight text-white/55"
            >
                {pieza}
                <span className="block h-1 w-1 rounded-full bg-white/20" aria-hidden="true" />
            </li>
        ))}
    </ul>
);

const Stack = () => {
    const { visible, titulo, piezas = [] } = useBloque('stack');

    if (visible === false || piezas.length === 0) return null;

    return (
        <section className="zona-oscura zona-oscura-1 seccion-compacta border-y border-white/[0.07]">
            <div className="contenedor">
                <p className="cuerpo mx-auto max-w-2xl text-center">{titulo}</p>
            </div>
            <div className="marquesina-marco mt-7">
                <div className="marquesina">
                    <Fila piezas={piezas} />
                    <Fila piezas={piezas} oculta />
                </div>
            </div>
        </section>
    );
};

export default Stack;
