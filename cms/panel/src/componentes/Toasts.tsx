import { CheckCircleIcon } from '@phosphor-icons/react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

/*
 * Confirmaciones breves abajo a la derecha (en el teléfono, sobre la barra
 * inferior). Si la acción tiene vuelta atrás, el toast ofrece «Deshacer»
 * durante unos segundos. Se anuncian a los lectores de pantalla (aria-live).
 */

interface Toast {
    id: number;
    texto: string;
    deshacer?: () => void | Promise<void>;
}

interface ValorToasts {
    avisar(texto: string, deshacer?: Toast['deshacer']): void;
}

const Contexto = createContext<ValorToasts | null>(null);
const DURACION_MS = 5000;

export function ProveedorToasts({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const siguiente = useRef(1);

    const quitar = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

    const avisar = useCallback<ValorToasts['avisar']>(
        (texto, deshacer) => {
            const id = siguiente.current++;
            setToasts((t) => [...t.slice(-2), { id, texto, deshacer }]);
            window.setTimeout(() => quitar(id), deshacer ? DURACION_MS * 1.6 : DURACION_MS);
        },
        [quitar]
    );

    const valor = useMemo(() => ({ avisar }), [avisar]);

    return (
        <Contexto.Provider value={valor}>
            {children}
            <div className="toasts" aria-live="polite" aria-atomic="false">
                {toasts.map((t) => (
                    <div key={t.id} className="toast oscuro" role="status">
                        <CheckCircleIcon size={18} weight="fill" aria-hidden="true" />
                        <span>{t.texto}</span>
                        {t.deshacer && (
                            <button
                                type="button"
                                className="boton boton--pequeno"
                                onClick={async () => {
                                    quitar(t.id);
                                    await t.deshacer?.();
                                }}
                            >
                                Deshacer
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </Contexto.Provider>
    );
}

export function useToasts(): ValorToasts {
    const valor = useContext(Contexto);
    if (!valor) throw new Error('useToasts fuera de ProveedorToasts');
    return valor;
}
