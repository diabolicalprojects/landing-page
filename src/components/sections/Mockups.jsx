import React from 'react';

/*
 * Escenas dibujadas a mano para los tres pilares.
 *
 * Podrían ser tres iconos dentro de tres tarjetas iguales, que es lo que hace
 * media categoría. Pero un icono no enseña nada: estas escenas muestran la cosa
 * funcionando —la ventana con el asistente dentro, la agenda con el hueco
 * ocupándose, el flujo pasando de nodo a nodo— y eso es lo que se recuerda al
 * salir de la página.
 *
 * Todo es markup y CSS con los tokens de la zona: pesan cero, se adaptan al
 * ancho, cambian con el tema y se leen igual en claro que en oscuro. Una imagen
 * exportada no haría ninguna de las cuatro cosas.
 */

const Ventana = ({ children, titulo }) => (
    <div className="marco">
        <div className="marco-barra">
            <span className="marco-punto" />
            <span className="marco-punto" />
            <span className="marco-punto" />
            <span className="etiqueta-mono ml-2 truncate text-white/55">{titulo}</span>
        </div>
        {children}
    </div>
);

/** Un sitio con el asistente resolviendo dentro, sin sacar al visitante fuera. */
export const EscenaSitio = () => (
    <Ventana titulo="tunegocio.mx">
        <div className="relative p-4">
            <div className="h-2 w-20 rounded-full bg-white/20" />
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.08]" />
            <div className="mt-2 h-1.5 w-4/5 rounded-full bg-white/[0.08]" />

            <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-12 rounded-lg border border-white/[0.07] bg-white/[0.03]" />
                ))}
            </div>

            <div className="mt-4 flex justify-end">
                <div
                    className="max-w-[82%] rounded-xl rounded-br-sm px-3 py-2 text-[0.6875rem] leading-snug"
                    style={{ background: 'var(--acento)', color: 'var(--acento-tinta)' }}
                >
                    ¿Tienen envío a Jesús María?
                </div>
            </div>
            <div className="mt-2 flex justify-start">
                <div className="max-w-[86%] rounded-xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.6875rem] leading-snug text-white/85">
                    Sí. Pedidos antes de las 2 p.m. salen el mismo día.
                </div>
            </div>
        </div>
    </Ventana>
);

/** Una semana de agenda con el hueco que acaba de ocuparse. */
export const EscenaAgenda = () => {
    const dias = ['L', 'M', 'M', 'J', 'V', 'S'];
    // Cada columna es un día y cada valor la ocupación de esa franja:
    // 0 libre, 1 ocupado de antes, 2 el que acaba de agendarse solo.
    const franjas = [
        [1, 0, 1, 0, 1, 0],
        [1, 1, 0, 2, 1, 0],
        [0, 1, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0],
    ];

    return (
        <Ventana titulo="Agenda · esta semana">
            <div className="p-4">
                <div className="grid grid-cols-6 gap-1.5">
                    {dias.map((dia, i) => (
                        <span
                            key={`${dia}-${i}`}
                            className="etiqueta-mono pb-1 text-center text-white/55"
                        >
                            {dia}
                        </span>
                    ))}
                    {franjas.flatMap((fila, f) =>
                        fila.map((estado, d) => (
                            <span
                                key={`${f}-${d}`}
                                className="h-6 rounded-md border"
                                style={
                                    estado === 2
                                        ? {
                                              background: 'var(--acento)',
                                              borderColor: 'var(--acento)',
                                          }
                                        : estado === 1
                                          ? {
                                                background: 'rgba(255,255,255,0.10)',
                                                borderColor: 'rgba(255,255,255,0.10)',
                                            }
                                          : {
                                                background: 'transparent',
                                                borderColor: 'rgba(255,255,255,0.07)',
                                            }
                                }
                            />
                        ))
                    )}
                </div>
                <p className="etiqueta-mono mt-4 flex items-center gap-2 text-white/55">
                    <span
                        className="block h-2 w-2 rounded-sm"
                        style={{ background: 'var(--acento)' }}
                        aria-hidden="true"
                    />
                    Jueves 10:30 · agendado solo
                </p>
            </div>
        </Ventana>
    );
};

/** El flujo: entra por un canal, pasa por el sistema, sale a tus herramientas. */
export const EscenaFlujo = () => {
    const salidas = ['CRM', 'Agenda', 'Equipo'];

    return (
        <Ventana titulo="Flujo · seguimiento de cotización">
            <div className="p-4">
                <svg
                    viewBox="0 0 260 120"
                    className="w-full"
                    role="img"
                    aria-label="Diagrama: un mensaje entra, el sistema lo procesa y lo reparte al CRM, la agenda y el equipo."
                >
                    <g fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1">
                        <path d="M52 60 H104" />
                        <path d="M156 60 C176 60 176 22 200 22" />
                        <path d="M156 60 H200" />
                        <path d="M156 60 C176 60 176 98 200 98" />
                    </g>

                    <g>
                        <rect
                            x="6"
                            y="46"
                            width="46"
                            height="28"
                            rx="8"
                            fill="rgba(255,255,255,0.05)"
                            stroke="rgba(255,255,255,0.14)"
                        />
                        <text
                            x="29"
                            y="63"
                            textAnchor="middle"
                            fontSize="8"
                            fill="rgba(255,255,255,0.75)"
                            fontFamily="inherit"
                        >
                            Mensaje
                        </text>
                    </g>

                    <g>
                        <rect
                            x="104"
                            y="42"
                            width="52"
                            height="36"
                            rx="10"
                            fill="var(--acento)"
                        />
                        <text
                            x="130"
                            y="63"
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="700"
                            fill="var(--acento-tinta)"
                            fontFamily="inherit"
                        >
                            Sistema
                        </text>
                    </g>

                    {salidas.map((nombre, i) => (
                        <g key={nombre}>
                            <rect
                                x="200"
                                y={8 + i * 38}
                                width="54"
                                height="28"
                                rx="8"
                                fill="rgba(255,255,255,0.05)"
                                stroke="rgba(255,255,255,0.14)"
                            />
                            <text
                                x="227"
                                y={25 + i * 38}
                                textAnchor="middle"
                                fontSize="8"
                                fill="rgba(255,255,255,0.75)"
                                fontFamily="inherit"
                            >
                                {nombre}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </Ventana>
    );
};

export const ESCENAS = {
    monitor: EscenaSitio,
    calendar: EscenaAgenda,
    workflow: EscenaFlujo,
};
