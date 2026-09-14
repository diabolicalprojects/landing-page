/**
 * Pruebas del contenido editable y la bandeja de prospectos.
 *
 * Van en su propio fichero y su propio puerto para no pelearse con
 * server.test.js, que levanta otro servidor.
 *
 * Lo que aquí se defiende es la propiedad que hace útil al panel: que lo
 * editado salga en el HTML SERVIDO, no solo después de hidratar. Ahí está la
 * diferencia entre que Google y los motores de IA lean el texto nuevo o sigan
 * leyendo el del último despliegue.
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

const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}`;
const USERNAME = 'tester';
const PASSWORD = 'contrasena-de-prueba';

const HAY_BUILD = fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'));

let child;
let dataDir;
let cookie;

test.before(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'diabolical-cms-'));

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

    for (let intento = 0; intento < 60; intento += 1) {
        try {
            const res = await fetch(`${BASE}/health`);
            if (res.ok) break;
        } catch {
            // Todavía no escucha.
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (intento === 59) throw new Error('El servidor no arrancó a tiempo');
    }

    // Una sola sesión para todo el fichero: el límite de intentos de acceso es
    // de cinco cada quince minutos, así que identificarse en cada prueba
    // agotaría el cupo y las últimas fallarían por 429 en vez de por el fallo
    // que buscan.
    const res = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    });
    assert.equal(res.status, 200);
    cookie = res.headers.getSetCookie().join('; ');
});

test.after(() => {
    child?.kill();
    if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
});

const guardar = (contenido) =>
    fetch(`${BASE}/api/contenido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify(contenido),
    });

const restablecer = () =>
    fetch(`${BASE}/api/contenido/restablecer`, { method: 'POST', headers: { Cookie: cookie } });

const portada = async () => (await fetch(`${BASE}/`)).text();

// --- Contenido editable ----------------------------------------------------

test('escribir contenido sin sesión se rechaza', async () => {
    const res = await fetch(`${BASE}/api/contenido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: { fraseB: 'no-deberia-guardarse' } }),
    });

    assert.equal(res.status, 401);

    if (!HAY_BUILD) return;
    const html = await portada();
    assert.ok(
        !html.includes('no-deberia-guardarse'),
        'un rechazo no puede dejar rastro en la página'
    );
});

test('lo editado desde el panel sale en el HTML servido', async (t) => {
    if (!HAY_BUILD) return t.skip('requiere npm run build');

    const marca = `titular-editado-${Date.now()}`;
    assert.equal((await guardar({ hero: { fraseB: marca } })).status, 200);

    // Sin ejecutar JavaScript: es como lo leen los rastreadores.
    const html = await portada();
    assert.ok(html.includes(marca), 'el texto editado no llegó al HTML servido');
    assert.match(
        html,
        /<h1[^>]*>[\s\S]{0,300}titular-editado/,
        'el texto editado debe estar dentro del h1'
    );
    // Se fusiona, no se reemplaza: editar un campo no borra los vecinos.
    assert.ok(
        html.includes('Inteligencia artificial'),
        'editar un campo borró los demás del mismo bloque'
    );

    await restablecer();
});

test('el contenido se puede devolver al de fábrica', async (t) => {
    if (!HAY_BUILD) return t.skip('requiere npm run build');

    await guardar({ hero: { fraseB: 'algo-que-se-va-a-deshacer' } });
    assert.equal((await restablecer()).status, 200);

    const html = await portada();
    assert.ok(!html.includes('algo-que-se-va-a-deshacer'), 'restablecer no limpió la página');
    assert.ok(
        html.includes('para negocios en Aguascalientes'),
        'restablecer no devolvió el texto de fábrica'
    );
});

test('el contenido guardado se escapa en lugar de ejecutarse', async (t) => {
    if (!HAY_BUILD) return t.skip('requiere npm run build');

    // El contenido viaja dentro de un <script> como dato. Un </script> sin
    // escapar cerraría el bloque y el resto pasaría a ser markup ejecutable.
    await guardar({ hero: { fraseB: '</script><img src=x onerror=alert(1)>' } });

    const html = await portada();
    assert.ok(
        !html.includes('<img src=x onerror=alert(1)>'),
        'el markup guardado se emitió sin escapar'
    );
    assert.ok(
        html.includes('\\u003c/script>'),
        'el < debe salir escapado dentro del <script> del contenido'
    );

    await restablecer();
});

test('el contenido desmesurado se rechaza con un mensaje que se entiende', async () => {
    // El contenido viaja entero en CADA respuesta HTML, así que un pegado
    // enorme multiplicaría el peso del sitio completo.
    //
    // Lo corta express.json antes de llegar al handler, así que sale 413 y no
    // 400. Lo que importa es que NO sea un 500: el panel tiene que poder decir
    // «acorta el texto» en vez de «error interno del servidor».
    const res = await guardar({ hero: { apoyo: 'x'.repeat(600 * 1024) } });

    assert.equal(res.status, 413);
    const { error } = await res.json();
    assert.match(error, /demasiado grande/i);
});

test('un JSON roto se rechaza sin tumbar nada', async () => {
    const res = await fetch(`${BASE}/api/contenido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: '{"hero": {',
    });

    assert.equal(res.status, 400);
    assert.equal((await fetch(`${BASE}/health`)).status, 200, 'el servidor debe seguir en pie');
});

test('el tema editable llega al HTML como variables CSS', async (t) => {
    if (!HAY_BUILD) return t.skip('requiere npm run build');

    // El segundo valor es basura a propósito: tiene que caer al de fábrica en
    // lugar de escribirse dentro de la hoja de estilos.
    await guardar({ tema: { acento: '#00FF99', superficie1: 'rojo}; body{display:none' } });

    const html = await portada();

    // Se comprueba DENTRO del <style>, no en todo el HTML: el valor inválido
    // sí aparece en window.__CONTENIDO__, y ahí es inofensivo — es una cadena
    // JSON escapada, no CSS. Buscarlo en la página entera daría un falso
    // positivo permanente.
    const hoja = html.match(/<style data-tema="diabolical">([\s\S]*?)<\/style>/)?.[1];
    assert.ok(hoja, 'no se emitió la hoja de estilos del tema');

    assert.ok(hoja.includes('--acento:#00FF99'), 'el acento editado no llegó al CSS');
    assert.ok(
        hoja.includes('--superficie-1:#0B0B0B'),
        'un color inválido debe caer al de fábrica, no escribirse'
    );
    assert.ok(!hoja.includes('display:none'), 'un valor inválido se coló en la hoja de estilos');

    await restablecer();
});

test('ocultar una sección la quita del HTML servido', async (t) => {
    if (!HAY_BUILD) return t.skip('requiere npm run build');

    const antes = await portada();
    assert.ok(antes.includes('id="limites"'), 'la sección de límites debería estar por defecto');

    await guardar({ limites: { visible: false } });

    const despues = await portada();
    assert.ok(!despues.includes('id="limites"'), 'ocultar la sección no la quitó del HTML');

    await restablecer();
});

// --- Prospectos ------------------------------------------------------------

test('un prospecto entra sin sesión y solo se lee con ella', async () => {
    const marca = `Empresa-${Date.now()}`;

    const alta = await fetch(`${BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact_form', company: marca, whatsapp: '4491234567' }),
    });
    assert.equal(alta.status, 201, 'el formulario público debe poder registrar');

    // Sin sesión no se lee: son datos personales de terceros.
    assert.equal((await fetch(`${BASE}/api/leads`)).status, 401);

    const { leads } = await (
        await fetch(`${BASE}/api/leads?limite=50`, { headers: { Cookie: cookie } })
    ).json();

    const encontrado = leads.find((l) => l.datos.company === marca);
    assert.ok(encontrado, 'el prospecto registrado no aparece en la bandeja');
    assert.equal(encontrado.estado, 'nuevo');

    const marcado = await fetch(`${BASE}/api/leads/${encontrado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ estado: 'atendido' }),
    });
    assert.equal(marcado.status, 200);

    const despues = await (
        await fetch(`${BASE}/api/leads?limite=50`, { headers: { Cookie: cookie } })
    ).json();
    assert.equal(despues.leads.find((l) => l.id === encontrado.id).estado, 'atendido');
});

test('un prospecto con saltos de línea no parte el registro', async () => {
    // El almacén es un JSON por línea: un salto dentro de un campo partiría el
    // registro en dos y la bandeja dejaría de poder leerse entera.
    await fetch(`${BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'Con\nsalto\r\ny retorno', name: 'ConSaltos' }),
    });

    const { leads } = await (
        await fetch(`${BASE}/api/leads?limite=50`, { headers: { Cookie: cookie } })
    ).json();
    const encontrado = leads.find((l) => l.datos.name === 'ConSaltos');

    assert.ok(encontrado, 'el prospecto con saltos de línea se perdió');
    assert.ok(!encontrado.datos.company.includes('\n'), 'el salto de línea no se limpió');
    assert.ok(encontrado.datos.company.includes('salto'), 'se limpió de más y se perdió el texto');
});

test('un estado inventado se rechaza', async () => {
    const res = await fetch(`${BASE}/api/leads/inventado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ estado: 'vendido' }),
    });

    assert.equal(res.status, 400);
});

// --- Caché ----------------------------------------------------------------

test('el ETag distingue build y contenido, no solo contenido', async (t) => {
    if (!HAY_BUILD) return t.skip('requiere npm run build');

    /*
     * Regresión de un fallo que dejaba el sitio en blanco.
     *
     * Cuando el ETag dependía solo de la versión del contenido, un despliegue
     * que tocara únicamente código lo dejaba idéntico: el navegador
     * revalidaba, recibía 304 y reutilizaba el HTML guardado, que apunta a los
     * assets con hash del build anterior. Esos ficheros ya no existen, así que
     * quien había visitado antes se encontraba una página en blanco.
     */
    const idBuild = fs
        .readFileSync(path.join(__dirname, '..', 'dist', 'build-id.txt'), 'utf8')
        .trim()
        .slice(0, 12);

    const etagInicial = (await fetch(`${BASE}/`)).headers.get('etag');
    assert.ok(etagInicial, 'la portada debe mandar ETag');
    assert.ok(
        etagInicial.includes(idBuild),
        `el ETag (${etagInicial}) debe llevar la huella del build (${idBuild})`
    );

    // Y sigue cambiando cuando cambia el contenido, que es su otro trabajo.
    await guardar({ hero: { fraseB: `etag-${Date.now()}` } });
    const etagTrasEditar = (await fetch(`${BASE}/`)).headers.get('etag');
    assert.notEqual(etagTrasEditar, etagInicial, 'editar contenido debe cambiar el ETag');

    await restablecer();
});

// --- Vista previa del panel ------------------------------------------------

test('el sitio se puede enmarcar desde su propio origen, pero no desde otro', async () => {
    // La vista previa del panel muestra el sitio real dentro de un <iframe>.
    // frame-ancestors 'self' lo permite y sigue bloqueando a cualquier otro
    // dominio, que es de lo que protege esta directiva.
    const csp = (await fetch(`${BASE}/`)).headers.get('content-security-policy') || '';

    assert.match(csp, /frame-ancestors 'self'/, 'el panel no podría mostrar la vista previa');
    assert.ok(!/frame-ancestors \*/.test(csp), 'frame-ancestors no puede quedar abierto');
});
