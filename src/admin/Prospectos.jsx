import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Inbox, MessageSquare, RefreshCw, X } from 'lucide-react';

/*
 * Bandeja de prospectos.
 *
 * Lo que entra por el formulario y por el chatbot llega aquí además de a n8n.
 * La copia local existe porque antes, si el webhook fallaba, el prospecto se
 * perdía sin que nadie se enterara de que alguien había escrito.
 *
 * Todo lo que se pinta aquí lo escribió un desconocido desde un formulario
 * público, así que se trata como dato: va en nodos de texto, nunca como markup.
 * React ya escapa por defecto, y por eso aquí no hay ni un
 * dangerouslySetInnerHTML.
 */

const api = axios.create({ withCredentials: true });

const ESTADOS = [
    { id: 'nuevo', nombre: 'Nuevos', color: 'var(--acento)' },
    { id: 'atendido', nombre: 'Atendidos', color: '#3FB950' },
    { id: 'descartado', nombre: 'Descartados', color: 'rgba(255,255,255,0.35)' },
];

// Los campos que manda el formulario, con nombre legible y en orden de utilidad.
const CAMPOS = {
    company: 'Empresa',
    name: 'Contacto',
    whatsapp: 'WhatsApp',
    email: 'Correo',
    source: 'Cómo llegan sus clientes',
    people: 'Personas que atienden',
    aspiration: 'Qué haría con el tiempo',
};

const fecha = (iso) => {
    try {
        return new Date(iso).toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
};

const Prospectos = ({ onSesionCaducada }) => {
    const [leads, setLeads] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [filtro, setFiltro] = useState('todos');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    /*
     * La carga vive dentro del efecto y se vuelve a disparar subiendo el
     * contador. Así no hay ni un setState síncrono en el cuerpo del efecto, y
     * de paso `vigente` evita que una respuesta lenta pise a una más reciente o
     * intente pintar sobre un componente ya desmontado.
     */
    const [recargas, setRecargas] = useState(0);

    useEffect(() => {
        let vigente = true;

        api.get('/api/leads?limite=200')
            .then(({ data }) => {
                if (!vigente) return;
                setError(null);
                setLeads(data.leads ?? []);
                setResumen(data.resumen ?? null);
            })
            .catch((e) => {
                if (!vigente) return;
                if (e?.response?.status === 401) {
                    onSesionCaducada?.();
                    return;
                }
                setError('No se pudo cargar la bandeja. Reintenta en un momento.');
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [recargas, onSesionCaducada]);

    const cargar = useCallback(() => {
        setCargando(true);
        setRecargas((n) => n + 1);
    }, []);

    const marcar = async (id, estado) => {
        // Se pinta antes de que conteste el servidor: marcar un prospecto es
        // una acción que se repite muchas veces seguidas y esperar en cada una
        // hace que la bandeja se sienta rota.
        setLeads((previos) => previos.map((l) => (l.id === id ? { ...l, estado } : l)));
        try {
            await api.patch(`/api/leads/${id}`, { estado });
        } catch {
            setError('No se pudo guardar el cambio. Recarga para ver el estado real.');
        }
    };

    const visibles = filtro === 'todos' ? leads : leads.filter((l) => l.estado === filtro);

    return (
        <div className="mx-auto max-w-4xl">
            <header className="mb-6 flex flex-wrap items-center gap-3">
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-white">Prospectos</h2>
                    <p className="mt-1 text-[0.8125rem] text-white/50">
                        Lo que llega del formulario y del chatbot. Se guarda aquí aunque n8n falle.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={cargar}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-[0.75rem] font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                    <RefreshCw size={13} className={cargando ? 'animate-spin' : undefined} />
                    Actualizar
                </button>
            </header>

            <div className="mb-5 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setFiltro('todos')}
                    aria-pressed={filtro === 'todos'}
                    className={`rounded-full px-3.5 py-2 text-[0.75rem] font-bold transition-colors ${
                        filtro === 'todos'
                            ? 'bg-white text-black'
                            : 'border border-white/12 text-white/60 hover:text-white'
                    }`}
                >
                    Todos {resumen ? `(${resumen.total})` : ''}
                </button>
                {ESTADOS.map((estado) => (
                    <button
                        key={estado.id}
                        type="button"
                        onClick={() => setFiltro(estado.id)}
                        aria-pressed={filtro === estado.id}
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.75rem] font-bold transition-colors ${
                            filtro === estado.id
                                ? 'bg-white text-black'
                                : 'border border-white/12 text-white/60 hover:text-white'
                        }`}
                    >
                        <span
                            className="block h-1.5 w-1.5 rounded-full"
                            style={{ background: estado.color }}
                            aria-hidden="true"
                        />
                        {estado.nombre}
                        {resumen ? ` (${resumen.porEstado[estado.id] ?? 0})` : ''}
                    </button>
                ))}
            </div>

            {error && (
                <p role="alert" className="mb-4 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3 text-[0.8125rem] text-white/80">
                    {error}
                </p>
            )}

            {cargando && leads.length === 0 && (
                <p className="py-16 text-center text-[0.875rem] text-white/40">Cargando...</p>
            )}

            {!cargando && visibles.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                    <Inbox size={28} className="mx-auto mb-4 text-white/25" aria-hidden="true" />
                    <p className="text-[0.9375rem] font-bold text-white/80">
                        {filtro === 'todos' ? 'Todavía no hay prospectos' : 'Nada en este estado'}
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-white/45">
                        {filtro === 'todos'
                            ? 'En cuanto alguien complete el formulario o el chatbot de la página, aparecerá aquí con su teléfono y su correo.'
                            : 'Prueba con otro filtro.'}
                    </p>
                </div>
            )}

            <ul className="space-y-3">
                {visibles.map((lead) => {
                    const datos = lead.datos ?? {};
                    const telefono = String(datos.whatsapp ?? '').replace(/\D/g, '');

                    return (
                        <li
                            key={lead.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5"
                        >
                            <div className="flex flex-wrap items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[0.9375rem] font-extrabold tracking-tight text-white">
                                        {datos.company || datos.name || 'Sin nombre'}
                                    </p>
                                    <p className="mt-0.5 text-[0.75rem] text-white/45">
                                        {fecha(lead.ts)} · {lead.tipo}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {telefono && (
                                        <a
                                            href={`https://api.whatsapp.com/send?phone=${telefono}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-[0.75rem] font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
                                        >
                                            <MessageSquare size={13} />
                                            Escribir
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => marcar(lead.id, 'atendido')}
                                        aria-label="Marcar como atendido"
                                        className={`rounded-lg border p-2 transition-colors ${
                                            lead.estado === 'atendido'
                                                ? 'border-transparent bg-[#3FB950] text-black'
                                                : 'border-white/12 text-white/45 hover:text-white'
                                        }`}
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => marcar(lead.id, 'descartado')}
                                        aria-label="Descartar"
                                        className={`rounded-lg border p-2 transition-colors ${
                                            lead.estado === 'descartado'
                                                ? 'border-transparent bg-white/20 text-white'
                                                : 'border-white/12 text-white/45 hover:text-white'
                                        }`}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <dl className="mt-4 grid gap-x-6 gap-y-2.5 border-t border-white/[0.08] pt-4 sm:grid-cols-2">
                                {Object.entries(CAMPOS).map(([clave, nombre]) =>
                                    datos[clave] ? (
                                        <div key={clave} className="min-w-0">
                                            <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white/40">
                                                {nombre}
                                            </dt>
                                            <dd className="mt-0.5 break-words text-[0.8125rem] leading-snug text-white/85">
                                                {datos[clave]}
                                            </dd>
                                        </div>
                                    ) : null
                                )}
                            </dl>

                            {/* Lo que mande el chatbot y no esté en la tabla de
                                campos conocidos se enseña igual: perder una
                                respuesta por no tenerla mapeada sería peor. */}
                            {Object.entries(datos).filter(
                                ([clave]) => !CAMPOS[clave] && clave !== 'type' && clave !== 'tipo'
                            ).length > 0 && (
                                <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-white/[0.08] pt-3 sm:grid-cols-2">
                                    {Object.entries(datos)
                                        .filter(
                                            ([clave]) =>
                                                !CAMPOS[clave] && clave !== 'type' && clave !== 'tipo'
                                        )
                                        .map(([clave, valor]) => (
                                            <div key={clave} className="min-w-0">
                                                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white/40">
                                                    {clave}
                                                </dt>
                                                <dd className="mt-0.5 break-words text-[0.8125rem] leading-snug text-white/75">
                                                    {valor}
                                                </dd>
                                            </div>
                                        ))}
                                </dl>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Prospectos;
