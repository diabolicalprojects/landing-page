import React from 'react';
import { ArrowRight } from 'lucide-react';

/*
 * La semana del dueño, antes y después. Segunda inversión a claro.
 *
 * Cada par describe el mecanismo, nunca un resultado con cifra: lo segundo no
 * se puede probar y por tanto no se publica (ver PRODUCT.md). «El mensaje de
 * las 9 de la noche se contesta mañana» es verificable por cualquiera que lo
 * haya vivido; «+40% de citas» no lo es.
 *
 * En claro y en dos columnas de verdad, no en tarjetas: una comparación quiere
 * que el ojo salte de izquierda a derecha en la misma línea, y eso solo lo da
 * una retícula alineada.
 */
const PARES = [
    {
        hoy: 'Quien te busca en Google encuentra antes a tu competencia.',
        despues: 'Sales tú, con una página por servicio y la ficha del mapa completa.',
    },
    {
        hoy: 'Si alguien le pregunta a ChatGPT por tu giro, no apareces.',
        despues: 'Tu sitio se puede leer y citar: casi nadie del mercado local lo trabaja.',
    },
    {
        hoy: 'Tu web tarda en cargar y no dice a qué te dedicas exactamente.',
        despues: 'Carga rápido, se lee en el celular y lleva a agendar sin rodeos.',
    },
    {
        hoy: 'El mensaje de las nueve de la noche se contesta mañana.',
        despues: 'Se contesta en segundos, y si trae cita, sale agendada.',
    },
    {
        hoy: 'Nadie sabe qué canal trae clientes y cuál solo da trabajo.',
        despues: 'Un tablero con los números reales de cada canal, hasta la cita.',
    },
    {
        hoy: 'El dueño pegado al celular hasta el domingo.',
        despues: 'El sistema trabaja; el domingo vuelve a ser tuyo.',
    },
];

const Comparativa = () => (
    <section id="comparativa" className="zona-clara seccion">
        <div className="contenedor">
            <header className="max-w-3xl">
                <p className="insignia">El cambio</p>
                <h2 className="titular-l mt-5">
                    Tu semana, <span className="titular-apagado">antes y después.</span>
                </h2>
            </header>

            <div className="tarjeta mt-12 overflow-hidden md:mt-16">
                <div
                    className="grid grid-cols-[1fr_auto_1fr] items-center"
                    style={{ borderBottom: '1px solid var(--linea)' }}
                >
                    <p className="etiqueta px-5 py-4 md:px-8" style={{ color: 'var(--texto-3)' }}>
                        Hoy
                    </p>
                    <span className="px-2" aria-hidden="true" />
                    <p className="etiqueta px-5 py-4 md:px-8" style={{ color: 'var(--acento-claro)' }}>
                        Con el sistema
                    </p>
                </div>

                <dl className="m-0">
                    {PARES.map((par, i) => (
                        <div
                            key={par.hoy}
                            className="grid grid-cols-[1fr_auto_1fr] items-center"
                            style={i > 0 ? { borderTop: '1px solid var(--linea)' } : undefined}
                        >
                            <dt
                                className="px-5 py-5 text-[0.875rem] leading-relaxed md:px-8 md:py-6 md:text-[0.9375rem]"
                                style={{ color: 'var(--texto-3)' }}
                            >
                                {par.hoy}
                            </dt>
                            <span
                                className="flex h-6 w-6 flex-none items-center justify-center rounded-full"
                                style={{ background: 'var(--papel-2)' }}
                                aria-hidden="true"
                            >
                                <ArrowRight size={12} style={{ color: 'var(--acento-claro)' }} />
                            </span>
                            <dd
                                className="m-0 px-5 py-5 text-[0.875rem] font-medium leading-relaxed md:px-8 md:py-6 md:text-[0.9375rem]"
                                style={{ color: 'var(--texto-1)' }}
                            >
                                {par.despues}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </section>
);

export default Comparativa;
