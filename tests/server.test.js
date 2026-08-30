/**
 * Pruebas de humo del servidor. Cubren lo que se rompió en producción:
 * la API de escritura abierta a internet y la inyección SEO que nunca
 * llegaba a la portada.
 *
 *   npm run build && npm test
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const USERNAME = 'tester';
const PASSWORD = 'contrasena-de-prueba';

let child;
let dataDir;

test.before(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'diabolical-test-'));

    child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
        env: {
            ...process.env,
            PORT: String(PORT),
            NODE_ENV: 'test',
            DATA_DIR: dataDir,
            ADMIN_USERNAME: USERNAME,
            ADMIN_PASSWORD_HASH: bcrypt.hashSync(PASSWORD, 4),
            SESSION_SECRET: 'secreto-solo-para-tests',
        },
        stdio: 'ignore',
    });

    for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
            const res = await fetch(`${BASE}/health`);
            if (res.ok) return;
        } catch {
            // El servidor todavía no escucha.
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('El servidor no arrancó a tiempo');
});

test.after(() => {
    child?.kill();
    if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
});

async function login() {
    const res = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });
    assert.equal(res.status, 200);

    const cookie = res.headers.getSetCookie().join('; ');
    assert.match(cookie, /HttpOnly/i, 'la cookie de sesión debe ser httpOnly');
    return cookie;
}

test('rechaza escribir la configuración sin sesión', async () => {
    const res = await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'no-deberia-guardarse' }),
    });

    assert.equal(res.status, 401);
});

test('rechaza credenciales inválidas', async () => {
    const res = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: 'incorrecta' }),
    });

    assert.equal(res.status, 401);
});

test('permite escribir la configuración con sesión válida', async () => {
    const cookie = await login();

    const res = await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ title: 'Título de prueba', claveDesconocida: 'ignorada' }),
    });

    assert.equal(res.status, 200);

    const stored = await (await fetch(`${BASE}/api/settings`)).json();
    assert.equal(stored.title, 'Título de prueba');
    assert.equal(stored.claveDesconocida, undefined, 'las claves no permitidas se descartan');
});

test('inyecta el SEO también en la portada', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const cookie = await login();
    await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ title: 'Portada inyectada' }),
    });

    const html = await (await fetch(`${BASE}/`)).text();
    assert.match(html, /<title>Portada inyectada<\/title>/);
});

test('escapa los valores guardados en lugar de inyectar markup', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const cookie = await login();
    await fetch(`${BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ title: '"><script>alert(1)</script>' }),
    });

    const html = await (await fetch(`${BASE}/`)).text();
    assert.ok(!html.includes('<script>alert(1)</script>'), 'el script no debe llegar crudo al HTML');
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('da metadatos propios a cada ruta y 404 a las desconocidas', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const privacy = await fetch(`${BASE}/politica-privacidad`);
    assert.equal(privacy.status, 200);
    assert.match(await privacy.text(), /<title>Política de Privacidad/);

    const missing = await fetch(`${BASE}/ruta-que-no-existe`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /noindex, nofollow/);
});

test('sirve robots.txt y sitemap.xml', async () => {
    const robots = await fetch(`${BASE}/robots.txt`);
    assert.equal(robots.status, 200);
    assert.match(await robots.text(), /User-agent: \*/);

    const sitemap = await fetch(`${BASE}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    assert.match(await sitemap.text(), /<urlset/);
});
