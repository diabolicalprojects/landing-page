import { sql, type ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

import type { Rol } from '@diabolical/esquemas';

import { esquema, type Esquema } from './esquema';

/*
 * La conexión a Postgres y el contexto de seguridad de cada transacción.
 *
 * Producción usa node-postgres contra el Postgres 18 del CMS. Desarrollo y
 * pruebas usan PGlite: el mismo Postgres compilado a WebAssembly, en proceso,
 * con roles y Row Level Security de verdad. Así las pruebas validan las mismas
 * políticas que se aplican en producción.
 */

export type Db = PgDatabase<PgQueryResultHKT, Esquema>;
export type Tx = PgTransaction<PgQueryResultHKT, Esquema, ExtractTablesWithRelations<Esquema>>;

export interface Base {
    db: Db;
    /** Ejecuta un guion SQL de varias sentencias, con el usuario de la conexión. */
    script(texto: string): Promise<void>;
    cerrar(): Promise<void>;
}

export async function abrirBase(url: string): Promise<Base> {
    if (url.startsWith('pglite:')) {
        const { PGlite } = await import('@electric-sql/pglite');
        const { drizzle } = await import('drizzle-orm/pglite');
        const destino = url.slice('pglite:'.length);
        const cliente = destino === 'memoria' ? new PGlite() : new PGlite(destino);
        await cliente.waitReady;
        const db = drizzle(cliente, { schema: esquema }) as unknown as Db;
        return {
            db,
            script: async (texto) => {
                await cliente.exec(texto);
            },
            cerrar: () => cliente.close(),
        };
    }

    const { default: pg } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const pool = new pg.Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000 });
    const db = drizzle(pool, { schema: esquema }) as unknown as Db;
    return {
        db,
        script: async (texto) => {
            const cliente = await pool.connect();
            try {
                await cliente.query(texto);
            } catch (error) {
                await cliente.query('rollback').catch(() => undefined);
                throw error;
            } finally {
                cliente.release();
            }
        },
        cerrar: () => pool.end(),
    };
}

/**
 * Quién hace la operación. `sistema` es lo que ocurre antes de saber quién es
 * (el inicio de sesión, validar una cookie) y solo lo usa el código de acceso.
 */
export interface Contexto {
    rol: Rol | 'sistema';
    usuarioId?: string | null;
}

export const SISTEMA: Contexto = { rol: 'sistema' };

/**
 * Abre una transacción con el rol `cms_app` (sujeto a RLS) y declara quién la
 * hace. Todo acceso a datos de la aplicación pasa por aquí.
 */
export function conContexto<T>(db: Db, ctx: Contexto, fn: (tx: Tx) => Promise<T>): Promise<T> {
    return db.transaction(async (tx) => {
        await tx.execute(sql`set local role cms_app`);
        await tx.execute(
            sql`select set_config('app.rol', ${ctx.rol}, true), set_config('app.usuario_id', ${ctx.usuarioId ?? ''}, true)`
        );
        return fn(tx as unknown as Tx);
    });
}

/** Filas de un `execute` crudo, que node-postgres y PGlite devuelven igual. */
export function filas<T>(resultado: unknown): T[] {
    return ((resultado as { rows?: T[] }).rows ?? []) as T[];
}
