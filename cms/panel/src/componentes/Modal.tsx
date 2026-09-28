import { XIcon } from '@phosphor-icons/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

/*
 * Modal sobre el <dialog> nativo: showModal() atrapa el foco, deja el resto de
 * la página inerte y cierra con Escape. Al cerrar, el foco vuelve a donde
 * estaba. En el teléfono se dibuja como hoja desde abajo (app.css).
 */
export function Modal({
    abierto,
    alCerrar,
    titulo,
    texto,
    children,
}: {
    abierto: boolean;
    alCerrar: () => void;
    titulo: string;
    texto?: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const idTitulo = useId();

    useEffect(() => {
        const dialogo = ref.current;
        if (!dialogo) return;
        if (abierto && !dialogo.open) {
            dialogo.showModal();
            // El foco va al primer campo editable, no al botón de cerrar.
            dialogo.querySelector<HTMLElement>('input:not([readonly]):not([disabled]), select, textarea')?.focus();
        }
        if (!abierto && dialogo.open) dialogo.close();
    }, [abierto]);

    return (
        <dialog
            ref={ref}
            className="modal"
            aria-labelledby={idTitulo}
            onClose={alCerrar}
            onCancel={(e) => {
                e.preventDefault();
                alCerrar();
            }}
            onClick={(e) => {
                // Clic en el fondo (el propio <dialog>, fuera de su contenido).
                if (e.target === ref.current) alCerrar();
            }}
        >
            {abierto && (
                <>
                    <div className="modal__cabecera">
                        <div>
                            <h2 id={idTitulo} className="titulo-seccion">
                                {titulo}
                            </h2>
                            {texto && <p>{texto}</p>}
                        </div>
                        <button type="button" className="boton boton--icono modal__cerrar" onClick={alCerrar} aria-label="Cerrar">
                            <XIcon size={18} weight="bold" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="modal__cuerpo">{children}</div>
                </>
            )}
        </dialog>
    );
}
