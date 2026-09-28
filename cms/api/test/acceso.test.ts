import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { crearEntorno, del, ORIGEN, type Entorno } from './entorno';

let e: Entorno;

beforeAll(async () => {
    e = await crearEntorno();
});
afterAll(() => e.cerrar());

const entrarCon = (correo: string, contrasena: string, extra: Record<string, string> = {}) =>
    e.app.inject({
        method: 'POST',
        url: '/admin/api/sesion',
        headers: { 'x-cms': '1', origin: ORIGEN, 'user-agent': 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0', ...extra },
        payload: { correo, contrasena },
    });

describe('iniciar sesión', () => {
    it('con credenciales correctas abre sesión con una cookie segura', async () => {
        const u = await e.crearUsuario('editor');
        const r = await entrarCon(u.correo, u.contrasena);
        expect(r.statusCode).toBe(200);
        expect(r.json().usuario.correo).toBe(u.correo);
        expect(r.json().usuario).not.toHaveProperty('hash');
        expect(r.json().permisos).toContain('contenido:editar');

        const cookie = r.cookies.find((c) => c.name === 'cms_sesion')!;
        expect(cookie.httpOnly).toBe(true);
        expect(cookie.sameSite).toBe('Strict');
        expect(cookie.path).toBe('/admin');
        expect(cookie.value.length).toBeGreaterThanOrEqual(43);
    });

    it('el correo se normaliza: mayúsculas y espacios no importan', async () => {
        const u = await e.crearUsuario('lector');
        const r = await entrarCon(`  ${u.correo.toUpperCase()} `, u.contrasena);
        expect(r.statusCode).toBe(200);
    });

    it('da el mismo mensaje para un correo que no existe y para una contraseña mala', async () => {
        const u = await e.crearUsuario('editor');
        const mala = await entrarCon(u.correo, 'no-es-esta-contrasena');
        const inexistente = await entrarCon('nadie@prueba.mx', 'no-es-esta-contrasena');
        expect(mala.statusCode).toBe(401);
        expect(inexistente.statusCode).toBe(401);
        expect(mala.json().error).toBe(inexistente.json().error);
    });

    it('una cuenta desactivada no entra, con el mismo mensaje', async () => {
        const u = await e.crearUsuario('editor', { activo: false });
        const r = await entrarCon(u.correo, u.contrasena);
        expect(r.statusCode).toBe(401);
        expect(r.json().error).toBe('Correo o contraseña incorrectos.');
    });

    it('bloquea la cuenta tras 5 fallos seguidos, aunque después llegue la contraseña buena', async () => {
        const u = await e.crearUsuario('editor');
        for (let i = 0; i < 5; i++) {
            const r = await entrarCon(u.correo, `mala-${i}-contrasena`);
            expect(r.statusCode).toBe(401);
        }
        const buena = await entrarCon(u.correo, u.contrasena);
        expect(buena.statusCode).toBe(429);
        expect(buena.json().error).toMatch(/esperar/);
    });

    it('avisa por correo al entrar desde un dispositivo nuevo, y no la segunda vez', async () => {
        const u = await e.crearUsuario('editor');
        const antes = e.correos.length;
        await e.entrar(u.correo, u.contrasena, 'Mozilla/5.0 (Macintosh; Mac OS X 14) Firefox/131.0');
        await new Promise((ok) => setTimeout(ok, 20));
        expect(e.correos.length).toBe(antes + 1);
        expect(e.correos.at(-1)!.para).toBe(u.correo);
        expect(e.correos.at(-1)!.texto).toMatch(/Firefox en macOS/);

        await e.entrar(u.correo, u.contrasena, 'Mozilla/5.0 (Macintosh; Mac OS X 14) Firefox/131.0');
        await new Promise((ok) => setTimeout(ok, 20));
        expect(e.correos.length).toBe(antes + 1);
    });
});

describe('protección CSRF', () => {
    it('rechaza una petición que cambia algo sin la cabecera X-CMS', async () => {
        const u = await e.crearUsuario('editor');
        const r = await e.app.inject({
            method: 'POST',
            url: '/admin/api/sesion',
            headers: { origin: ORIGEN },
            payload: { correo: u.correo, contrasena: u.contrasena },
        });
        expect(r.statusCode).toBe(403);
    });

    it('rechaza una petición desde otro origen', async () => {
        const u = await e.crearUsuario('editor');
        const r = await entrarCon(u.correo, u.contrasena, { origin: 'https://sitio-malicioso.example' });
        expect(r.statusCode).toBe(403);
    });
});

describe('la sesión', () => {
    it('sin cookie no hay acceso a la API', async () => {
        const r = await e.app.inject({ method: 'GET', url: '/admin/api/sesion' });
        expect(r.statusCode).toBe(401);
    });

    it('una cookie inventada no sirve', async () => {
        const r = await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie: 'cms_sesion=inventada' } });
        expect(r.statusCode).toBe(401);
    });

    it('cerrar sesión la invalida en el servidor, no solo en el navegador', async () => {
        const u = await e.crearUsuario('editor');
        const cookie = await e.entrar(u.correo, u.contrasena);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie } })).statusCode).toBe(200);
        const salir = await e.app.inject({ method: 'DELETE', url: '/admin/api/sesion', headers: del(cookie) });
        expect(salir.statusCode).toBe(204);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie } })).statusCode).toBe(401);
    });

    it('cambiar la contraseña cierra las demás sesiones pero no la actual', async () => {
        const u = await e.crearUsuario('editor');
        const otra = await e.entrar(u.correo, u.contrasena);
        const actual = await e.entrar(u.correo, u.contrasena);
        const r = await e.app.inject({
            method: 'POST',
            url: '/admin/api/cuenta/contrasena',
            headers: del(actual),
            payload: { actual: u.contrasena, nueva: 'una-contrasena-nueva-y-larga' },
        });
        expect(r.statusCode).toBe(200);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie: actual } })).statusCode).toBe(200);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie: otra } })).statusCode).toBe(401);
    });

    it('no acepta una contraseña nueva de las listas filtradas', async () => {
        const u = await e.crearUsuario('editor');
        const cookie = await e.entrar(u.correo, u.contrasena);
        const r = await e.app.inject({
            method: 'POST',
            url: '/admin/api/cuenta/contrasena',
            headers: del(cookie),
            payload: { actual: u.contrasena, nueva: 'password123' },
        });
        expect(r.statusCode).toBe(400);
        expect(r.json().campos.nueva).toMatch(/filtradas/);
    });

    it('cada quien ve y cierra sus sesiones, no las de otros', async () => {
        const a = await e.crearUsuario('editor');
        const b = await e.crearUsuario('editor');
        const cookieA = await e.entrar(a.correo, a.contrasena);
        const cookieB = await e.entrar(b.correo, b.contrasena);

        const deB = (await e.app.inject({ method: 'GET', url: '/admin/api/sesiones', headers: { cookie: cookieB } })).json();
        expect(deB.length).toBe(1);

        const intento = await e.app.inject({ method: 'DELETE', url: `/admin/api/sesiones/${deB[0].id}`, headers: del(cookieA) });
        expect(intento.statusCode).toBe(404);
        expect((await e.app.inject({ method: 'GET', url: '/admin/api/sesion', headers: { cookie: cookieB } })).statusCode).toBe(200);
    });

    it('las respuestas llevan cabeceras de seguridad y no se guardan en caché', async () => {
        const r = await e.app.inject({ method: 'GET', url: '/admin/api/salud' });
        expect(r.statusCode).toBe(200);
        expect(r.headers['content-security-policy']).toMatch(/default-src 'self'/);
        expect(r.headers['content-security-policy']).toMatch(/frame-ancestors 'none'/);
        expect(r.headers['x-frame-options']).toBe('DENY');
        expect(r.headers['cache-control']).toBe('no-store');
    });
});

describe('límite por IP', () => {
    it('corta el login tras 10 intentos en 15 minutos desde la misma IP', async () => {
        const otro = await crearEntorno({ limiteAcceso: 10 });
        try {
            let ultimo = 0;
            for (let i = 0; i < 11; i++) {
                const r = await otro.app.inject({
                    method: 'POST',
                    url: '/admin/api/sesion',
                    headers: { 'x-cms': '1', origin: ORIGEN },
                    payload: { correo: `nadie${i}@prueba.mx`, contrasena: 'x-cualquiera' },
                });
                ultimo = r.statusCode;
            }
            expect(ultimo).toBe(429);
        } finally {
            await otro.cerrar();
        }
    });
});
