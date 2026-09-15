import React from 'react';

/*
 * Las cuatro maneras de resolver esto.
 *
 * Sustituye a la comparativa «antes y después», que describía un resultado que
 * no se puede probar. Esto describe el terreno real: cuando alguien nos evalúa,
 * nos compara con estas cuatro cosas, y tres de ellas no son agencias.
 *
 * Se presentan con honestidad, incluida la de no hacer nada, que es el
 * competidor más fuerte de cualquier servicio. Nombrar bien las alternativas
 * convence más que descalificarlas: quien lee reconoce la suya descrita sin
 * caricatura y concluye solo.
 *
 * Nada aquí afirma un resultado. Cada línea describe lo que cada opción cuesta
 * o deja de cubrir, que es verificable, en lugar de lo que rinde, que no lo es.
 */
const OPCIONES = [
    {
        id: 'nada',
        nombre: 'Dejarlo como está',
        cuando: 'Tiene sentido si el volumen de consultas es bajo y el equipo llega sin esfuerzo.',
        coste: 'Lo que cuesta es invisible: las consultas que llegan fuera de horario y no se responden hasta el día siguiente. Nadie las contabiliza porque nunca llegaron a ser clientes.',
    },
    {
        id: 'persona',
        nombre: 'Contratar a alguien',
        cuando: 'Tiene sentido cuando el trabajo exige criterio y trato, no solo repetición.',
        coste: 'Cubre un horario, no las veinticuatro horas, y el trabajo repetitivo sigue existiendo: solo cambia de manos. A cambio, una persona resuelve lo que ningún sistema sabe resolver.',
    },
    {
        id: 'freelance',
        nombre: 'Un desarrollador independiente',
        cuando: 'Tiene sentido para una pieza concreta y bien definida.',
        coste: 'Suele entregarse la herramienta sin el proceso que la sostiene, y sin un guion escrito el sistema improvisa. La pregunta que conviene hacer es quién responde cuando algo deja de funcionar dentro de seis meses.',
    },
    {
        id: 'agencia',
        nombre: 'Una agencia',
        cuando: 'Tiene sentido cuando hace falta cubrir varios frentes a la vez y que alguien responda por el conjunto.',
        coste: 'Conviene preguntar tres cosas antes de firmar: hasta dónde llega cada servicio, si cobran un porcentaje de su inversión publicitaria, y de quién son los archivos y los accesos al terminar. Las nuestras están publicadas en este sitio.',
    },
];

const Comparativa = () => (
    <section id="alternativas" className="zona-clara seccion">
        <div className="contenedor">
            <header className="max-w-3xl">
                <p className="insignia">Las alternativas</p>
                <h2 className="titular-l mt-5">
                    Hay cuatro maneras de resolver esto.{' '}
                    <span className="titular-apagado">Nosotros somos una.</span>
                </h2>
                <p className="cuerpo-l mt-6">
                    Cuando alguien nos evalúa, nos compara con estas opciones. Tres de ellas no son
                    agencias, y en algunos casos son la decisión correcta. Estas son, descritas sin
                    caricatura.
                </p>
            </header>

            <div className="mt-12 md:mt-16">
                {OPCIONES.map((opcion, i) => (
                    <article
                        key={opcion.id}
                        className="grid gap-4 py-8 md:grid-cols-12 md:gap-8"
                        style={i > 0 ? { borderTop: '1px solid var(--linea)' } : undefined}
                    >
                        <h3 className="titular-m md:col-span-4">{opcion.nombre}</h3>
                        <p className="cuerpo m-0 max-w-none md:col-span-4">{opcion.cuando}</p>
                        <p
                            className="m-0 max-w-none text-[0.9375rem] leading-relaxed md:col-span-4"
                            style={{ color: 'var(--texto-1)' }}
                        >
                            {opcion.coste}
                        </p>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

export default Comparativa;
