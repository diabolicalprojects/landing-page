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
const { SECTORES, RUTAS_PUBLICAS, ARTICULOS, SERVICIOS } = require('../server/schema');

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
    const texto = await robots.text();
    assert.match(texto, /User-agent: \*/);
    // El GEO depende de que los rastreadores de IA tengan permiso explícito.
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
        assert.match(texto, new RegExp(`User-agent: ${bot}`), `falta ${bot} en robots.txt`);
    }
    assert.match(texto, /Disallow: \/admin/);

    const sitemap = await fetch(`${BASE}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    const xml = await sitemap.text();
    assert.match(xml, /<urlset/);
    for (const ruta of RUTAS_PUBLICAS) {
        assert.ok(xml.includes(`${ruta}<`) || xml.includes(`.tech${ruta}`), `falta ${ruta} en el sitemap`);
    }
});

test('sirve llms.txt y llms-full.txt para los motores generativos', async () => {
    for (const ruta of ['/llms.txt', '/llms-full.txt']) {
        const res = await fetch(`${BASE}${ruta}`);
        assert.equal(res.status, 200);
        assert.match(res.headers.get('content-type'), /text\/plain/);
        const texto = await res.text();
        assert.ok(texto.length > 1000, `${ruta} devolvió solo ${texto.length} caracteres`);
        assert.match(texto, /Diabolical Services/);
    }
});

test('cada página de sector se sirve con su contenido y su schema', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    for (const sector of SECTORES) {
        const ruta = `/automatizacion-para-${sector.slug}`;
        const res = await fetch(`${BASE}${ruta}`);
        assert.equal(res.status, 200, `${ruta} no devolvió 200`);

        const html = await res.text();
        // Prerenderizado: el contenido tiene que estar sin ejecutar JavaScript.
        assert.ok(html.includes(sector.titular), `${ruta} no trae su titular prerenderizado`);
        assert.match(html, new RegExp(`<title>${sector.titulo.replace(/[|]/g, '\\|')}`));
        assert.match(html, new RegExp(`rel="canonical" href="[^"]*${ruta}"`));
        assert.match(html, /"@type":\s*"Service"/);
        assert.match(html, /"@type":\s*"BreadcrumbList"/);
    }
});

test('las preguntas del FAQPage están visibles en la página', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // Google exige que lo marcado como FAQPage sea exactamente lo que ve el
    // visitante. Marcar preguntas que no aparecen en la página es infracción,
    // y es un fallo que no da ningún síntoma hasta que llega la penalización.
    const html = await (await fetch(`${BASE}/`)).text();
    const bloques = [...html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
        JSON.parse(m[1])
    );
    const faq = bloques.find((b) => b['@type'] === 'FAQPage');
    assert.ok(faq, 'la portada no publica FAQPage');

    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
    for (const entrada of faq.mainEntity) {
        assert.ok(
            visible.includes(entrada.name),
            `la pregunta "${entrada.name}" está en el schema pero no en el HTML visible`
        );
    }
});

test('la portada enlaza a todas las páginas de sector', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // Sin enlaces internos desde la portada, los buscadores tratarían las
    // páginas de sector como huérfanas.
    const html = await (await fetch(`${BASE}/`)).text();
    for (const sector of SECTORES) {
        assert.ok(
            html.includes(`/automatizacion-para-${sector.slug}`),
            `la portada no enlaza a ${sector.slug}`
        );
    }
});

test('los assets se sirven precomprimidos y brotli gana a gzip', async (t) => {
    const dirAssets = path.join(__dirname, '..', 'dist', 'assets');
    if (!fs.existsSync(dirAssets)) return t.skip('requiere npm run build');

    const bundle = fs.readdirSync(dirAssets).find((f) => /^index-.*\.js$/.test(f));
    assert.ok(bundle, 'no se encontró el bundle principal en dist/assets');

    const pedir = (encoding) =>
        fetch(`${BASE}/assets/${bundle}`, { headers: { 'Accept-Encoding': encoding } });

    // El navegador real anuncia las tres; debe recibir brotli.
    const real = await pedir('gzip, deflate, br');
    assert.equal(real.headers.get('content-encoding'), 'br');
    assert.match(real.headers.get('content-type') || '', /javascript/);
    assert.match(real.headers.get('vary') || '', /accept-encoding/i);

    // Brotli al máximo tiene que salir más pequeño que gzip. Cuando no lo es,
    // significa que se está comprimiendo en caliente a calidad baja, que es
    // justo el fallo que este precomprimido corrige.
    const tamBr = fs.statSync(path.join(dirAssets, `${bundle}.br`)).size;
    const tamGz = fs.statSync(path.join(dirAssets, `${bundle}.gz`)).size;
    assert.ok(tamBr < tamGz, `brotli (${tamBr}) debería ser menor que gzip (${tamGz})`);

    // Un cliente que solo entiende gzip no puede recibir brotli.
    const soloGzip = await pedir('gzip');
    assert.equal(soloGzip.headers.get('content-encoding'), 'gzip');

    // Las variantes no se sirven por su nombre: solo por negociación.
    assert.equal((await fetch(`${BASE}/assets/${bundle}.br`)).status, 404);
});

test('el catálogo de servicios se sirve entero y con su límite', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const res = await fetch(`${BASE}/servicios`);
    assert.equal(res.status, 200);
    const html = await res.text();
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');

    // Cada servicio con su nombre, su resumen y —lo que nos distingue— el
    // límite publicado antes de contratar, no después.
    for (const servicio of SERVICIOS) {
        assert.ok(visible.includes(servicio.nombre), `falta el servicio "${servicio.nombre}"`);
        assert.ok(visible.includes(servicio.limite), `falta el límite de "${servicio.nombre}"`);
    }

    assert.match(html, /"@type":\s*"CollectionPage"/);
    assert.match(html, /"@type":\s*"BreadcrumbList"/);

    // La portada y el pie llevan al catálogo: sin enlaces quedaría huérfano.
    const portada = await (await fetch(`${BASE}/`)).text();
    assert.ok(portada.includes('/servicios'), 'la portada no enlaza a /servicios');

    // El catálogo entra en el sitemap y en el texto para modelos.
    assert.ok((await (await fetch(`${BASE}/sitemap.xml`)).text()).includes('/servicios'));
    const llms = await (await fetch(`${BASE}/llms.txt`)).text();
    for (const servicio of SERVICIOS) {
        assert.ok(llms.includes(servicio.nombre), `${servicio.nombre} no está en llms.txt`);
        assert.ok(llms.includes(servicio.limite), `el límite de ${servicio.nombre} no está en llms.txt`);
    }
});

test('el sitio no se contradice sobre lo que ofrece', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // Al ampliar el catálogo, las declaraciones de "no hacemos publicidad ni
    // marketing" dejaron de ser ciertas. Un sitio que se contradice es lo que
    // hace que un motor generativo deje de citarlo, así que esto se fija.
    const fuentes = await Promise.all(
        ['/', '/servicios', '/llms.txt', '/llms-full.txt'].map(async (r) => ({
            ruta: r,
            texto: await (await fetch(`${BASE}${r}`)).text(),
        }))
    );

    const contradicciones = [
        'No somos una agencia de marketing',
        'No hacemos marketing ni publicidad',
        'campañas de publicidad, gestión de redes sociales, diseño',
    ];

    for (const { ruta, texto } of fuentes) {
        for (const frase of contradicciones) {
            assert.ok(
                !texto.includes(frase),
                `${ruta} sigue negando servicios que ahora sí se ofrecen: "${frase}"`
            );
        }
    }
});

test('las coordenadas de la ficha local se publican como número o no se publican', () => {
    // Estas variables se teclean a mano una sola vez en el panel del
    // orquestador. Con notación española ("21,8853") el JSON-LD validaría pero
    // apuntaría a otro sitio, y un mapa equivocado hace más daño que la
    // ausencia de mapa. Se prueba en procesos aparte porque config.js lee el
    // entorno al cargarse.
    const leerGeo = (latitude, longitude) => {
        const salida = require('node:child_process').execFileSync(
            process.execPath,
            [
                '-e',
                "const g = require('./server/schema').datosEstructurados('/')[0].geo;" +
                    'process.stdout.write(JSON.stringify(g === undefined ? null : g));',
            ],
            {
                cwd: path.join(__dirname, '..'),
                env: {
                    ...process.env,
                    BUSINESS_LATITUDE: latitude,
                    BUSINESS_LONGITUDE: longitude,
                },
                encoding: 'utf8',
            }
        );
        return JSON.parse(salida);
    };

    const valido = leerGeo('21.8853', '-102.2916');
    assert.ok(valido, 'unas coordenadas correctas deberían publicarse');
    assert.equal(typeof valido.latitude, 'number', 'la latitud debe ir como número');
    assert.equal(typeof valido.longitude, 'number', 'la longitud debe ir como número');

    assert.equal(leerGeo('21,8853', '-102,2916'), null, 'la coma decimal debe omitir el bloque');
    assert.equal(leerGeo('abc', '-102.2916'), null, 'un valor no numérico debe omitir el bloque');
    assert.equal(leerGeo('91', '-102.2916'), null, 'una latitud fuera de rango debe omitir el bloque');
    assert.equal(leerGeo('', ''), null, 'sin configurar no se publica geo');
});

test('cada artículo del blog se sirve prerenderizado y con su BlogPosting', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    for (const articulo of ARTICULOS) {
        const ruta = `/blog/${articulo.slug}`;
        const res = await fetch(`${BASE}${ruta}`);
        assert.equal(res.status, 200, `${ruta} no devolvió 200`);

        const html = await res.text();
        // El público del blog son justamente los rastreadores que no ejecutan
        // JavaScript: si el cuerpo no viaja en el HTML, el artículo no sirve.
        assert.ok(html.includes(articulo.titular), `${ruta} no trae su titular prerenderizado`);
        assert.ok(
            html.includes(articulo.secciones[0].parrafos[0].slice(0, 60)),
            `${ruta} no trae el cuerpo prerenderizado`
        );
        assert.match(html, new RegExp(`rel="canonical" href="[^"]*${ruta}"`));
        assert.match(html, /"@type":\s*"BlogPosting"/);
        assert.match(html, /"@type":\s*"BreadcrumbList"/);
    }
});

test('las preguntas del FAQPage de cada artículo están visibles en la página', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // Mismo motivo que en la portada: marcar como FAQPage preguntas que no
    // aparecen en el HTML visible es infracción y no da síntomas hasta la
    // penalización.
    for (const articulo of ARTICULOS) {
        const html = await (await fetch(`${BASE}/blog/${articulo.slug}`)).text();
        const bloques = [...html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
            JSON.parse(m[1])
        );
        const faq = bloques.find((b) => b['@type'] === 'FAQPage');
        assert.ok(faq, `${articulo.slug} no publica FAQPage`);

        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
        for (const entrada of faq.mainEntity) {
            assert.ok(
                visible.includes(entrada.name),
                `la pregunta "${entrada.name}" está en el schema de ${articulo.slug} pero no en el HTML visible`
            );
        }
    }
});

test('el blog está enlazado y sus artículos entran en el sitemap y los llms', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // El índice tiene que ser alcanzable desde cualquier página, no solo desde
    // el sitemap, o los artículos quedan huérfanos.
    const portada = await (await fetch(`${BASE}/`)).text();
    assert.ok(portada.includes('/blog'), 'la portada no enlaza al blog');

    const indice = await (await fetch(`${BASE}/blog`)).text();
    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const llms = await (await fetch(`${BASE}/llms.txt`)).text();
    const llmsFull = await (await fetch(`${BASE}/llms-full.txt`)).text();

    for (const articulo of ARTICULOS) {
        assert.ok(indice.includes(`/blog/${articulo.slug}`), `el índice no enlaza a ${articulo.slug}`);
        assert.ok(sitemap.includes(`/blog/${articulo.slug}`), `${articulo.slug} no está en el sitemap`);
        assert.ok(llms.includes(articulo.titular), `${articulo.slug} no está en llms.txt`);
        // En la versión larga va el texto íntegro: es lo que un modelo cita.
        assert.ok(
            llmsFull.includes(articulo.secciones[0].parrafos[0]),
            `el cuerpo de ${articulo.slug} no está en llms-full.txt`
        );
    }
});
