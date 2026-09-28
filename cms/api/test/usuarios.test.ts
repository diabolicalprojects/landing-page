import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { crearEntorno, del, type Entorno } from './entorno';

let e: Entorno;
let admin: { id: string; correo: string; contrasena: string };
let cookieAdmin: string;

beforeAll(async () => {
    e = await crearEntorno();
    admin = await e.crearUsuario('administrador');
    cookieAdmin = await e.entrar(admin.correo, admin.contrasena);
});
afterAll(() => e.cerrar());

describe('gestión de usuarios', () => {
    it('un administrador crea un editor y queda en la auditoría', async () => {
        const r = await e.app.inject({
            method: 'POST',
            url: '/admin/api/usuarios',
            headers: del(cookieAdmin),
            payload: { correo: 'Nueva@Prueba.MX', nombre: 'Nueva persona', rol: 'editor', contrasena: 'una-frase-larga-de-prueba' },
        });
        expect(r.statusCode).toBe(201);
        expect(r.json().correo).toBe('nueva@prueba.mx');

        const log = await e.app.inject({ method: 'GET', url: '/admin/api/auditoria?accion=usuario.crear', headers: { cookie: cookieAdmin } });
        const entrada = log.json().entradas.find((x: { entidadId: string }) => x.entidadId === r.json().id);
        expect(entrada.usuario.correo).toBe(admin.correo);
        expect(JSON.stringify(entrada.cambios)).not.toMatch(/una-frase-larga/);
    });

    it('no se repite un correo', async () => {
        const r = await e.app.inject({
            method: 'POST',
            url: '/admin/api/usuarios',
            headers: del(cookieAdmin),
            payload: { correo: admin.correo, nombre: 'Otra', rol: 'lector', contrasena: 'otra-frase-larga-de-prueba' },
        });
        expect(r.statusCode).toBe(409);
    });

    it('un editor no puede gestionar usuarios ni ver la auditoría', async () => {
        const ed = await e.crearUsuario('editor');
        const cookie = await e.entrar(ed.correo, ed.contrasena);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/usuarios', headers: { cookie } })).statusCode).toBe(403);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/auditoria', headers: { cookie } })).statusCode).toBe(403);
        const crear = await e.app.inject({
            method: 'POST',
            url: '/admin/api/usuarios',
            headers: del(cookie),
            payload: { correo: 'x@prueba.mx', nombre: 'X', rol: 'administrador', contrasena: 'frase-larga-de-prueba-x' },
        });
        expect(crear.statusCode).toBe(403);
    });

    it('siempre queda un administrador activo', async () => {
        const solo = await crearEntorno();
        try {
            const a = await solo.crearUsuario('administrador');
            const cookie = await solo.entrar(a.correo, a.contrasena);
            const r = await solo.app.inject({
                method: 'PATCH',
                url: `/admin/api/usuarios/${a.id}`,
                headers: del(cookie),
                payload: { rol: 'editor' },
            });
            expect(r.statusCode).toBe(409);
            expect(r.json().error).toMatch(/al menos un administrador/);
        } finally {
            await solo.cerrar();
        }
    });

    it('desactivar a alguien le cierra todas las sesiones', async () => {
        const ed = await e.crearUsuario('editor');
        const cookie = await e.entrar(ed.correo, ed.contrasena);
        const r = await e.app.inject({
            method: 'PATCH',
            url: `/admin/api/usuarios/${ed.id}`,
            headers: del(cookieAdmin),
            payload: { activo: false },
        });
        expect(r.statusCode).toBe(200);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie } })).statusCode).toBe(401);
    });

    it('restablecer una contraseña exige la política y cierra las sesiones del usuario', async () => {
        const ed = await e.crearUsuario('editor');
        const cookie = await e.entrar(ed.correo, ed.contrasena);
        const mala = await e.app.inject({
            method: 'POST',
            url: `/admin/api/usuarios/${ed.id}/contrasena`,
            headers: del(cookieAdmin),
            payload: { contrasena: '12345678' },
        });
        expect(mala.statusCode).toBe(400);

        const buena = await e.app.inject({
            method: 'POST',
            url: `/admin/api/usuarios/${ed.id}/contrasena`,
            headers: del(cookieAdmin),
            payload: { contrasena: 'restablecida-y-larga-2026' },
        });
        expect(buena.statusCode).toBe(200);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie } })).statusCode).toBe(401);
        await e.entrar(ed.correo, 'restablecida-y-larga-2026');
    });

    it('la lista de usuarios nunca incluye hashes', async () => {
        const r = await e.app.inject({ method: 'GET', url: '/admin/api/usuarios', headers: { cookie: cookieAdmin } });
        expect(r.statusCode).toBe(200);
        expect(r.body).not.toMatch(/argon2/);
    });
});
