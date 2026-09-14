import React from 'react';

/*
 * Diseño: colores, tamaños y esquinas.
 *
 * Estos valores salen como variables CSS en el HTML servido (ver
 * src/contenido/Tema.jsx), así que cambiarlos aquí cambia el sitio entero sin
 * recompilar ni desplegar.
 *
 * Las escalas son multiplicadores y no tamaños sueltos a propósito: mover un
 * único número agranda toda la jerarquía manteniendo las proporciones. Dejar
 * elegir el tamaño de cada titular por separado es lo que rompe un sistema
 * tipográfico a la tercera edición.
 */

/*
 * El sistema es monocromo y el acento es la inversión de cada zona, no un
 * color: blanco sobre negro, negro sobre papel. Por eso aquí no hay selector de
 * acento — dejar elegir uno sería dejar romper el sistema desde el panel.
 *
 * Lo que sí se puede ajustar es la profundidad de los negros y el tono del
 * papel, que es donde un ajuste fino sí mejora el resultado.
 */
const COLORES = [
    { clave: 'fondo', nombre: 'Fondo principal', ayuda: 'El negro base de la página.' },
    { clave: 'superficie1', nombre: 'Fondo alterno', ayuda: 'El negro de las secciones intercaladas.' },
    { clave: 'superficie2', nombre: 'Fondo elevado', ayuda: 'Para bloques que deben destacar sobre el fondo.' },
    { clave: 'papel', nombre: 'Papel', ayuda: 'El fondo claro de las secciones que rompen el ritmo.' },
    { clave: 'papel2', nombre: 'Papel sombreado', ayuda: 'Un tono más del papel, para botones y chips.' },
    { clave: 'tinta', nombre: 'Texto sobre papel', ayuda: 'El color del texto en las secciones claras.' },
];

const ESCALAS = [
    {
        clave: 'escalaTitulo',
        nombre: 'Tamaño de los títulos',
        ayuda: 'Multiplica todos los titulares a la vez.',
    },
    {
        clave: 'escalaTexto',
        nombre: 'Tamaño del texto',
        ayuda: 'Multiplica el cuerpo de texto. Por debajo de 0,9 empieza a costar leer en móvil.',
    },
];

const RADIOS = [
    { valor: '0.25rem', nombre: 'Casi recto' },
    { valor: '0.75rem', nombre: 'Poco redondeado' },
    { valor: '1.5rem', nombre: 'Redondeado' },
    { valor: '2rem', nombre: 'Muy redondeado' },
];

const EditorTema = ({ tema = {}, onCambio }) => (
    <div className="mx-auto max-w-2xl space-y-8">
        <header>
            <h2 className="text-xl font-extrabold tracking-tight text-white">Diseño</h2>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/50">
                Cambia el color, el tamaño de las letras y la forma de las esquinas en todo el
                sitio. Se aplica al guardar, sin desplegar nada.
            </p>
        </header>

        <section className="space-y-3">
            <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white/50">
                Colores
            </h3>
            <ul className="space-y-2">
                {COLORES.map(({ clave, nombre, ayuda }) => (
                    <li
                        key={clave}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                    >
                        <input
                            id={`color-${clave}`}
                            type="color"
                            value={tema[clave] ?? '#000000'}
                            onChange={(e) => onCambio(['tema', clave], e.target.value)}
                            className="h-11 w-11 flex-none cursor-pointer rounded-lg border border-white/15 bg-transparent"
                        />
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor={`color-${clave}`}
                                className="block text-[0.8125rem] font-semibold text-white/85"
                            >
                                {nombre}
                            </label>
                            <p className="mt-0.5 text-[0.75rem] leading-snug text-white/45">{ayuda}</p>
                        </div>
                        <input
                            type="text"
                            aria-label={`Código de ${nombre}`}
                            value={tema[clave] ?? ''}
                            onChange={(e) => onCambio(['tema', clave], e.target.value)}
                            className="w-24 flex-none rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-2 text-center font-mono text-[0.75rem] uppercase text-white outline-none focus:border-white/35"
                        />
                    </li>
                ))}
            </ul>
            <p className="text-[0.75rem] leading-relaxed text-white/45">
                Si escribes un color que no sea un código hexadecimal válido, el sitio usa el de
                fábrica en lugar de romperse.
            </p>
        </section>

        <section className="space-y-3">
            <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white/50">
                Tamaños
            </h3>
            {ESCALAS.map(({ clave, nombre, ayuda }) => {
                const valor = Number(tema[clave] ?? 1);
                return (
                    <div key={clave} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-baseline justify-between gap-4">
                            <label
                                htmlFor={`escala-${clave}`}
                                className="text-[0.8125rem] font-semibold text-white/85"
                            >
                                {nombre}
                            </label>
                            <output
                                htmlFor={`escala-${clave}`}
                                className="font-mono text-[0.75rem] text-white/60"
                            >
                                {valor.toFixed(2)}×
                            </output>
                        </div>
                        <input
                            id={`escala-${clave}`}
                            type="range"
                            min="0.8"
                            max="1.3"
                            step="0.05"
                            value={valor}
                            onChange={(e) => onCambio(['tema', clave], Number(e.target.value))}
                            className="mt-3 w-full"
                        />
                        <p className="mt-2 text-[0.75rem] leading-snug text-white/45">{ayuda}</p>
                    </div>
                );
            })}
        </section>

        <section className="space-y-3">
            <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white/50">
                Esquinas
            </h3>
            <div className="flex flex-wrap gap-2">
                {RADIOS.map((radio) => (
                    <button
                        key={radio.valor}
                        type="button"
                        onClick={() => onCambio(['tema', 'radio'], radio.valor)}
                        aria-pressed={tema.radio === radio.valor}
                        className={`border px-4 py-2.5 text-[0.75rem] font-bold transition-colors ${
                            tema.radio === radio.valor
                                ? 'border-transparent bg-white text-black'
                                : 'border-white/12 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                        style={{ borderRadius: radio.valor }}
                    >
                        {radio.nombre}
                    </button>
                ))}
            </div>
        </section>
    </div>
);

export default EditorTema;
