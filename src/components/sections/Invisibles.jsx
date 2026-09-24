import React from 'react';

import { useBloque } from '../../contenido';
import CtaServicio from '../common/CtaServicio';

/*
 * «Invisible para la inteligencia artificial».
 *
 * Es el único dato propio y defendible que existe: una medición hecha por la
 * casa el 31 de agosto de 2026. No hay casos de cliente ni cifras de resultado
 * que publicar, así que esta sección carga con todo el peso de la prueba.
 *
 * Por eso se trata como evidencia y no como adorno. Cada cifra va con su unidad
 * y con la frase que dice de dónde salió y cuándo se tomó; un número sin
 * procedencia es exactamente lo que este sitio no publica. Y no se nombra a
 * nadie: la medición es real, pero señalar con el dedo la convertiría en otra
 * cosa.
 *
 * Son dos, no cuatro ni seis: una comparación necesita dos términos, y añadir
 * cifras de relleno convertiría una prueba en una fila de estadísticas.
 */
const Invisibles = () => {
    const { visible, titulo, tituloApagado, entradilla, datos = [], cierre } =
        useBloque('invisibles');

    if (visible === false || datos.length === 0) return null;

    return (
        <section id="invisibles" className="zona-oscura zona-oscura-2 seccion">
            <div className="contenedor">
                <header className="max-w-3xl">
                    <h2 className="titular-l">
                        {titulo} <span className="titular-apagado">{tituloApagado}</span>
                    </h2>
                    <p className="cuerpo-l mt-6">{entradilla}</p>
                </header>

                <dl className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
                    {datos.map((dato) => (
                        <div key={dato.id} className="tarjeta p-7 md:p-9">
                            <dt className="flex items-baseline gap-2.5">
                                <span className="cifras font-title text-5xl leading-none text-white md:text-6xl">
                                    {dato.cifra}
                                </span>
                                <span className="etiqueta text-white/55">{dato.unidad}</span>
                            </dt>
                            {/* La procedencia va pegada a la cifra, no en una nota
                                al pie: es lo que la convierte en prueba. */}
                            <dd className="cuerpo m-0 mt-5">{dato.texto}</dd>
                        </div>
                    ))}
                </dl>

                {cierre && <p className="cuerpo-destacado mt-10 max-w-3xl">{cierre}</p>}

                <CtaServicio servicio="sitio-web" ubicacion="invisibles" className="mt-10" />
            </div>
        </section>
    );
};

export default Invisibles;
