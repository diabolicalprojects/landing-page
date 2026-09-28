import { WarningIcon } from '@phosphor-icons/react';
import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

/*
 * Las piezas básicas del panel, las mismas del Planificador: botón, campo,
 * tarjeta, distintivo, aviso, estado vacío y esqueleto de carga.
 */

type VarianteBoton = 'suave' | 'principal' | 'contorno';

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
    variante?: VarianteBoton;
    pequeno?: boolean;
    icono?: boolean;
    ocupado?: boolean;
}

export function Boton({
    variante = 'suave',
    pequeno = false,
    icono = false,
    ocupado = false,
    className = '',
    children,
    disabled,
    type = 'button',
    ...resto
}: PropsBoton) {
    const clases = [
        'boton',
        variante !== 'suave' ? `boton--${variante}` : '',
        pequeno ? 'boton--pequeno' : '',
        icono ? 'boton--icono' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (
        <button type={type} className={clases} disabled={disabled || ocupado} aria-busy={ocupado || undefined} {...resto}>
            {ocupado && <span className="girando" aria-hidden="true" />}
            {children}
        </button>
    );
}

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
    etiqueta: string;
    pista?: ReactNode;
    error?: string;
}

/** Etiqueta arriba, pista o error abajo. El placeholder nunca hace de etiqueta. */
export function Campo({ etiqueta, pista, error, id, className = '', ...resto }: PropsCampo) {
    const generado = useId();
    const idCampo = id ?? generado;
    const idAyuda = `${idCampo}-ayuda`;
    return (
        <div className="bloque-campo">
            <label className="etiqueta-campo" htmlFor={idCampo}>
                {etiqueta}
            </label>
            <input
                id={idCampo}
                className={`campo ${className}`}
                aria-invalid={error ? true : undefined}
                aria-describedby={error || pista ? idAyuda : undefined}
                {...resto}
            />
            {error ? (
                <span className="error-campo" id={idAyuda}>
                    <WarningIcon size={13} weight="bold" aria-hidden="true" />
                    {error}
                </span>
            ) : (
                pista && (
                    <span className="pista" id={idAyuda}>
                        {pista}
                    </span>
                )
            )}
        </div>
    );
}

export function Tarjeta({ children, className = '', negra = false }: { children: ReactNode; className?: string; negra?: boolean }) {
    return <section className={`tarjeta ${negra ? 'tarjeta--negra oscuro' : ''} ${className}`}>{children}</section>;
}

export function Chip({ children, tipo }: { children: ReactNode; tipo?: 'negro' | 'contorno' }) {
    return <span className={`chip ${tipo ? `chip--${tipo}` : ''}`}>{children}</span>;
}

export function Aviso({
    children,
    icono,
    fuerte = false,
    hundido = false,
    acciones,
    rol = 'status',
}: {
    children: ReactNode;
    icono: ReactNode;
    fuerte?: boolean;
    hundido?: boolean;
    acciones?: ReactNode;
    rol?: 'status' | 'alert';
}) {
    return (
        <div className={`aviso ${fuerte ? 'aviso--fuerte oscuro' : ''} ${hundido ? 'aviso--hundido' : ''}`} role={rol}>
            <span className="aviso__icono" aria-hidden="true">
                {icono}
            </span>
            <div>{children}</div>
            {acciones && <div className="aviso__acciones">{acciones}</div>}
        </div>
    );
}

export function Vacio({ icono, titulo, texto, acciones }: { icono: ReactNode; titulo: string; texto?: string; acciones?: ReactNode }) {
    return (
        <div className="vacio">
            <span className="vacio__icono" aria-hidden="true">
                {icono}
            </span>
            <h2 className="titulo-seccion">{titulo}</h2>
            {texto && <p className="vacio__texto">{texto}</p>}
            {acciones}
        </div>
    );
}

/** Filas de carga con la forma de la lista que viene: no salta al llegar. */
export function FilasCargando({ filas = 4, columnas }: { filas?: number; columnas?: string }) {
    return (
        <div aria-busy="true" aria-label="Cargando">
            {Array.from({ length: filas }, (_, i) => (
                <div key={i} className="lista__fila" style={columnas ? { ['--columnas' as string]: columnas } : undefined}>
                    <span className="lista__doble">
                        <span className="esqueleto" style={{ width: `${60 - i * 7}%` }} />
                        <span className="esqueleto" style={{ width: `${40 - i * 4}%`, height: 10, marginTop: 6 }} />
                    </span>
                    <span className="esqueleto solo-ancho" style={{ width: '50%' }} />
                    <span className="esqueleto" style={{ width: '70%', justifySelf: 'end' }} />
                </div>
            ))}
        </div>
    );
}

export function Cabecera({ titulo, texto, acciones }: { titulo: string; texto?: ReactNode; acciones?: ReactNode }) {
    return (
        <header className="cabecera">
            <div className="cabecera__texto">
                <h1 className="titulo-pagina">{titulo}</h1>
                {texto && <p>{texto}</p>}
            </div>
            {acciones && <div className="cabecera__acciones">{acciones}</div>}
        </header>
    );
}
