import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, type ReactNode } from 'react';

import type { Permiso, SesionActual } from '@diabolical/esquemas';

import { api, ErrorApi, SESION_CADUCADA } from './api';

/*
 * La sesión del panel: quién es y qué puede hacer. Se pide una vez al abrir y
 * se guarda en la caché de consultas; iniciar o cerrar sesión la reemplaza.
 */

interface ValorSesion {
    sesion: SesionActual | null;
    cargando: boolean;
    puede(permiso: Permiso): boolean;
}

const Contexto = createContext<ValorSesion | null>(null);

export const CLAVE_SESION = ['sesion'] as const;

export function ProveedorSesion({ children }: { children: ReactNode }) {
    const cliente = useQueryClient();
    const consulta = useQuery({
        queryKey: CLAVE_SESION,
        queryFn: async () => {
            try {
                return await api<SesionActual>('/sesion');
            } catch (error) {
                if (error instanceof ErrorApi && error.estado === 401) return null;
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    useEffect(() => {
        const caducada = () => {
            cliente.setQueryData(CLAVE_SESION, null);
            cliente.removeQueries({ predicate: (q) => q.queryKey[0] !== CLAVE_SESION[0] });
        };
        window.addEventListener(SESION_CADUCADA, caducada);
        return () => window.removeEventListener(SESION_CADUCADA, caducada);
    }, [cliente]);

    const sesion = consulta.data ?? null;
    const valor: ValorSesion = {
        sesion,
        cargando: consulta.isPending,
        puede: (permiso) => Boolean(sesion?.permisos.includes(permiso)),
    };
    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ValorSesion {
    const valor = useContext(Contexto);
    if (!valor) throw new Error('useSesion fuera de ProveedorSesion');
    return valor;
}
