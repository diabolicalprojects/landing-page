import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { conContexto, filas, SISTEMA } from '../src/db/base';
import { auditoria, sesiones, usuarios } from '../src/db/esquema';
import { crearEntorno, type Entorno } from './entorno';

/*
 * Row Level Security, probado directamente contra la base de datos: aunque un
 * error en la API dejara pasar una petición, Postgres no debe dejar hacer esto.
 */

let e: Entorno;
let admin: { id: string };
let editor: { id: string };
let lector: { id: string };

beforeAll(async () => {
    e = await crearEntorno();
    admin = await e.crearUsuario('administrador');
    editor = await e.crearUsuario('editor');
    lector = await e.crearUsuario('lector');
});
afterAll(() => e.cerrar());

describe('RLS de usuarios', () => {
    it('un editor solo ve su propia fila', async () => {
        const vistos = await conContexto(e.base.db, { rol: 'editor', usuarioId: editor.id }, (tx) =>
            tx.select({ id: usuarios.id }).from(usuarios)
        );
        expect(vistos.map((v) => v.id)).toEqual([editor.id]);
    });

    it('un administrador ve a todos', async () => {
        const vistos = await conContexto(e.base.db, { rol: 'administrador', usuarioId: admin.id }, (tx) =>
            tx.select({ id: usuarios.id }).from(usuarios)
        );
        expect(vistos.length).toBeGreaterThanOrEqual(3);
    });

    it('un editor no puede subirse de rol aunque sea su propia fila', async () => {
        await expect(
            conContexto(e.base.db, { rol: 'editor', usuarioId: editor.id }, (tx) =>
                tx.update(usuarios).set({ rol: 'administrador' }).where(eq(usuarios.id, editor.id))
            )
        ).rejects.toThrow();
    });

    it('un editor puede cambiar su nombre', async () => {
        await conContexto(e.base.db, { rol: 'editor', usuarioId: editor.id }, (tx) =>
            tx.update(usuarios).set({ nombre: 'Nombre nuevo' }).where(eq(usuarios.id, editor.id))
        );
        const [u] = await conContexto(e.base.db, SISTEMA, (tx) =>
            tx.select({ nombre: usuarios.nombre }).from(usuarios).where(eq(usuarios.id, editor.id))
        );
        expect(u?.nombre).toBe('Nombre nuevo');
    });

    it('un solo lectura no puede crear usuarios', async () => {
        await expect(
            conContexto(e.base.db, { rol: 'lector', usuarioId: lector.id }, (tx) =>
                tx.insert(usuarios).values({ correo: 'intruso@prueba.mx', nombre: 'Intruso', rol: 'administrador', hash: 'x' })
            )
        ).rejects.toThrow();
    });

    it('nadie puede borrar usuarios, tampoco un administrador', async () => {
        await expect(
            conContexto(e.base.db, { rol: 'administrador', usuarioId: admin.id }, (tx) =>
                tx.delete(usuarios).where(eq(usuarios.id, lector.id))
            )
        ).rejects.toThrow();
    });
});

describe('RLS de la auditoría', () => {
    it('solo crece: ni un administrador puede editarla o borrarla', async () => {
        await conContexto(e.base.db, { rol: 'administrador', usuarioId: admin.id }, (tx) =>
            tx.insert(auditoria).values({ usuarioId: admin.id, accion: 'usuario.actualizar', entidad: 'prueba' })
        );
        await expect(
            conContexto(e.base.db, { rol: 'administrador', usuarioId: admin.id }, (tx) =>
                tx.update(auditoria).set({ accion: 'otra' })
            )
        ).rejects.toThrow();
        await expect(
            conContexto(e.base.db, { rol: 'administrador', usuarioId: admin.id }, (tx) => tx.delete(auditoria))
        ).rejects.toThrow();
    });

    it('un editor solo ve sus propios registros', async () => {
        await conContexto(e.base.db, { rol: 'editor', usuarioId: editor.id }, (tx) =>
            tx.insert(auditoria).values({ usuarioId: editor.id, accion: 'cuenta.actualizar', entidad: 'usuario' })
        );
        const vistos = await conContexto(e.base.db, { rol: 'editor', usuarioId: editor.id }, (tx) =>
            tx.select({ usuarioId: auditoria.usuarioId }).from(auditoria)
        );
        expect(vistos.length).toBeGreaterThan(0);
        expect(vistos.every((v) => v.usuarioId === editor.id)).toBe(true);
    });

    it('sin contexto no se puede escribir en la auditoría', async () => {
        await expect(
            e.base.db.transaction(async (tx) => {
                await tx.execute(sql`set local role cms_app`);
                await tx.insert(auditoria).values({ accion: 'sesion.iniciar', entidad: 'x' });
            })
        ).rejects.toThrow();
    });
});

describe('RLS de sesiones', () => {
    it('un usuario no ve las sesiones de otro', async () => {
        await conContexto(e.base.db, SISTEMA, (tx) =>
            tx.insert(sesiones).values({ id: 'x'.repeat(64), usuarioId: admin.id, expiraEn: new Date(Date.now() + 60_000) })
        );
        const vistas = await conContexto(e.base.db, { rol: 'editor', usuarioId: editor.id }, (tx) =>
            tx.select({ id: sesiones.id }).from(sesiones)
        );
        expect(vistas).toEqual([]);
    });

    it('la aplicación no es dueña de las tablas', async () => {
        const [r] = filas<{ duena: boolean }>(
            await e.base.db.execute(
                sql`select pg_has_role('cms_app', (select tableowner from pg_tables where tablename = 'usuarios'), 'member') as duena`
            )
        );
        expect(r?.duena).toBe(false);
    });
});
