import { sql } from 'drizzle-orm';

import { filas, type Base } from './base';
import m0001 from './migraciones/0001_acceso';

/*
 * Migraciones en orden, cada una en su transacción. Se ejecutan con el dueño
 * del esquema (CMS_BASE_DATOS_MIGRAR en producción), nunca con cms_app.
 */
export const MIGRACIONES: { nombre: string; sql: string }[] = [{ nombre: '0001_acceso', sql: m0001 }];

export async function migrar(base: Base): Promise<string[]> {
    await base.script(
        `create table if not exists _migraciones (nombre text primary key, aplicada_en timestamptz not null default now())`
    );
    const hechas = new Set(
        filas<{ nombre: string }>(await base.db.execute(sql`select nombre from _migraciones`)).map((f) => f.nombre)
    );

    const aplicadas: string[] = [];
    for (const m of MIGRACIONES) {
        if (hechas.has(m.nombre)) continue;
        await base.script(`begin;\n${m.sql}\ninsert into _migraciones (nombre) values ('${m.nombre}');\ncommit;`);
        aplicadas.push(m.nombre);
    }
    return aplicadas;
}
