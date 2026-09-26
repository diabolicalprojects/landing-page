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
const {
    SECTORES,
    RUTAS_PUBLICAS,
    ARTICULOS,
    SERVICIOS,
    REDIRECCIONES,
    RUTA_PAGINAS_WEB,
    RUTA_CHATBOTS,
    RUTA_AGENDAMIENTO,
    LANDINGS,
    rutaSector,
    rutaServicio,
} = require('../server/schema');
const CONTENIDO = require('../src/data/contenido.json');

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
        const ruta = rutaSector(sector.slug);
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
            html.includes(rutaSector(sector.slug)),
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

    // El índice lleva el nombre y el resumen de los trece.
    for (const servicio of SERVICIOS) {
        assert.ok(visible.includes(servicio.nombre), `falta el servicio "${servicio.nombre}"`);
        assert.ok(visible.includes(servicio.resumen), `falta el resumen de "${servicio.nombre}"`);
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


test('cada servicio tiene su página, con su alcance publicado', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    /*
     * Lo que nos distingue es publicar hasta dónde llega cada servicio ANTES de
     * contratar. Al pasar a multipágina ese texto se movió del índice a la
     * página de cada servicio; lo que no puede es dejar de estar.
     */
    for (const servicio of SERVICIOS) {
        const ruta = rutaServicio(servicio.slug);
        const res = await fetch(`${BASE}${ruta}`);
        assert.equal(res.status, 200, `${ruta} no devolvió 200`);

        const html = await res.text();
        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');

        assert.ok(visible.includes(servicio.limite), `${ruta} no publica su alcance`);
        // Un servicio con landing propia se presenta con el texto de su página,
        // no con el resumen de catálogo; el resumen sigue en /servicios.
        if (!servicio.ruta) {
            assert.ok(visible.includes(servicio.resumen), `${ruta} no trae su resumen`);
        }
        assert.match(html, new RegExp(`rel="canonical" href="[^"]*${ruta}"`));
        assert.match(html, /"@type":\s*"BreadcrumbList"/);
    }
});

test('las direcciones antiguas de sector redirigen en lugar de morir', async () => {
    /*
     * Al pasar los sectores de /automatizacion-para-X a /sectores/X, las URLs
     * viejas seguían indexadas y enlazadas desde fuera. Un 404 tiraría a la
     * basura toda la autoridad que esas páginas hubieran ganado.
     */
    for (const [vieja, nueva] of Object.entries(REDIRECCIONES)) {
        const res = await fetch(`${BASE}${vieja}`, { redirect: 'manual' });
        assert.equal(res.status, 301, `${vieja} no devolvió 301`);
        assert.equal(res.headers.get('location'), nueva, `${vieja} apunta a otro sitio`);
    }
});

test('las páginas nuevas del sitio se sirven con su contenido', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // La frase clave del negocio tiene que viajar en el h1 de la portada y en
    // el de cada sector: es lo que un motor generativo lee para saber a quién
    // recomendar, y ningún otro encabezado pesa lo que pesa el h1. Desde que la
    // casa se presenta también como agencia de páginas web, el h1 de la portada
    // lleva las dos cosas, y la frase de siempre tiene que seguir dentro entera.
    const portada = await (await fetch(`${BASE}/`)).text();
    assert.match(
        portada,
        /<h1[^>]*>[\s\S]{0,300}inteligencia artificial[\s\S]{0,120}para negocios en Aguascalientes/i,
        'la portada no lleva la frase clave en el h1'
    );
    assert.match(portada, /<h1[^>]*>[\s\S]{0,40}Páginas web/, 'la portada no nombra las páginas web en el h1');

    for (const sector of SECTORES) {
        const html = await (await fetch(`${BASE}${rutaSector(sector.slug)}`)).text();
        assert.ok(
            html.includes(sector.titular),
            `${sector.slug} no lleva su titular en la página`
        );
        assert.match(sector.titular, /^Inteligencia artificial para /);
    }

    for (const ruta of ['/nosotros', '/sectores', '/contacto']) {
        const res = await fetch(`${BASE}${ruta}`);
        assert.equal(res.status, 200, `${ruta} no devolvió 200`);
        const html = await res.text();
        assert.match(html, /<h1/, `${ruta} no trae h1 prerenderizado`);
        assert.match(html, new RegExp(`rel="canonical" href="[^"]*${ruta}"`));
    }
});

test('el registro de marca se mantiene formal', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    /*
     * La voz está fijada: «diablo elegante y formal», trato de usted y sin una
     * sola palabra coloquial. No es una preferencia de estilo — es una decisión
     * del cliente, tomada después de que «Somos diablillos, no estafadores»
     * sugiriera justo lo contrario de lo que pretendía.
     *
     * Esta prueba existe porque el contenido se edita desde /admin, y nada
     * impide que alguien reintroduzca el registro viejo sin darse cuenta.
     */
    const PROHIBIDAS = [
        'desmadre',
        'diablillo',
        'endiablad',
        'el diablo está en los detalles',
        'no estafadores',
    ];

    const rutas = [
        '/',
        '/nosotros',
        '/servicios',
        '/sectores',
        '/contacto',
        '/blog',
        RUTA_PAGINAS_WEB,
        RUTA_CHATBOTS,
        RUTA_AGENDAMIENTO,
    ];

    for (const ruta of rutas) {
        const html = await (await fetch(`${BASE}${ruta}`)).text();
        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').toLowerCase();

        for (const palabra of PROHIBIDAS) {
            assert.ok(
                !visible.includes(palabra),
                `${ruta} usa «${palabra}», que quedó fuera del registro de marca`
            );
        }
    }
});

test('las preguntas frecuentes responden las objeciones reales de venta', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    /*
     * Las cuatro objeciones que el cliente escucha de verdad en la conversación
     * de venta. Si alguna desaparece del FAQ, la página deja de responder lo
     * que la gente pregunta y vuelve a responder lo que es cómodo contestar.
     *
     * Se comprueba sobre el texto VISIBLE: Google exige que lo marcado en el
     * FAQPage sea exactamente lo que ve el visitante.
     */
    const OBJECIONES = [
        /notar que están hablando con un sistema/i,
        /ya probé un chatbot/i,
        /muy particular/i,
        /cuánto tiempo tengo que dedicarle/i,
    ];

    const html = await (await fetch(`${BASE}/`)).text();
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');

    for (const objecion of OBJECIONES) {
        assert.match(visible, objecion, `el FAQ no responde a ${objecion}`);
    }

    // Y el marcado tiene que llevar las mismas preguntas que se ven.
    assert.match(html, /"@type":\s*"FAQPage"/);
});


test('la landing de páginas web persigue sus tres búsquedas', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    /*
     * Tres frases clave repartidas en tres señales distintas, en lugar de la
     * misma repetida: la URL lleva «páginas web Aguascalientes», el título
     * «diseño de páginas web en Aguascalientes» y el h1 «diseño y desarrollo
     * de páginas web en Aguascalientes».
     */
    assert.equal(RUTA_PAGINAS_WEB, '/paginas-web-aguascalientes');

    const res = await fetch(`${BASE}${RUTA_PAGINAS_WEB}`);
    assert.equal(res.status, 200);
    const html = await res.text();

    assert.match(html, /<title>Páginas web y sitios web en Aguascalientes/);
    assert.match(html, /<h1[^>]*>Diseño y desarrollo de páginas web en Aguascalientes<\/h1>/);
    assert.match(html, new RegExp(`rel="canonical" href="[^"]*${RUTA_PAGINAS_WEB}"`));

    const bloques = [...html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
        JSON.parse(m[1])
    );
    const servicio = bloques.find((b) => b['@type'] === 'Service');
    assert.ok(servicio, 'la landing no publica su Service');
    assert.equal(
        servicio.hasOfferCatalog.itemListElement.length,
        CONTENIDO.paginasWeb.tipos.items.length,
        'el catálogo del Service no coincide con los tipos de sitio visibles'
    );
    assert.ok(bloques.some((b) => b['@type'] === 'BreadcrumbList'));

    // Lo marcado como FAQPage tiene que estar a la vista, precio incluido.
    const faq = bloques.find((b) => b['@type'] === 'FAQPage');
    assert.ok(faq, 'la landing no publica FAQPage');
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
    assert.ok(faq.mainEntity.length >= CONTENIDO.paginasWeb.faq.items.length);
    for (const entrada of faq.mainEntity) {
        assert.ok(visible.includes(entrada.name), `"${entrada.name}" está marcada pero no se ve`);
    }
    assert.ok(visible.includes('¿Cuánto cuesta una página web en Aguascalientes?'));

    // Sin proyectos publicados no hay portafolio: ni sección vacía ni enlaces rotos.
    assert.equal(CONTENIDO.paginasWeb.portafolio.proyectos.length, 0);
    assert.ok(!html.includes('id="portafolio"'), 'el portafolio vacío no debería pintarse');

    // Enlazada desde la portada y el catálogo; en el sitemap y en los llms.
    const portada = await (await fetch(`${BASE}/`)).text();
    assert.ok(portada.includes(`href="${RUTA_PAGINAS_WEB}"`), 'la portada no enlaza a la landing');
    const catalogo = await (await fetch(`${BASE}/servicios`)).text();
    assert.ok(catalogo.includes(`href="${RUTA_PAGINAS_WEB}"`), '/servicios no enlaza a la landing');
    assert.ok(!catalogo.includes('href="/servicios/sitio-web"'), 'queda un enlace a la dirección vieja');

    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
    assert.ok(sitemap.includes(RUTA_PAGINAS_WEB));
    assert.ok(!sitemap.includes('/servicios/sitio-web'), 'una dirección que redirige no va en el sitemap');

    const llms = await (await fetch(`${BASE}/llms.txt`)).text();
    assert.ok(llms.includes('### Diseño y desarrollo de páginas web en Aguascalientes'));
    assert.ok(llms.includes(RUTA_PAGINAS_WEB));
});

test('los textos de servicio y de la landing hablan de usted', () => {
    // El trato es de usted en todo el sitio. El catálogo y la landing se
    // escribieron en momentos distintos y el tuteo se cuela sin que nadie lo vea.
    const TUTEO = /\b(tu|tus|ti|contigo|tuyo|tuya|tienes|quieres|puedes|necesitas|haces|usas)\b/i;

    const textos = [];
    const recoger = (valor) => {
        if (typeof valor === 'string') textos.push(valor);
        else if (Array.isArray(valor)) valor.forEach(recoger);
        else if (valor && typeof valor === 'object') Object.values(valor).forEach(recoger);
    };
    recoger(SERVICIOS);
    recoger(CONTENIDO.paginasWeb);
    recoger(CONTENIDO.chatbots);
    recoger(CONTENIDO.agendamiento);
    recoger(ARTICULOS);

    for (const texto of textos) {
        assert.ok(!TUTEO.test(texto), `tuteo en: «${texto}»`);
    }
});


test('la casa entera se presenta como agencia de páginas web', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    /*
     * Las páginas web no pueden vivir solo en su landing. La portada, la
     * ficha de la empresa, quiénes somos, el pie y los llms.txt tienen que
     * decir lo mismo: agencia de páginas web e inteligencia artificial.
     */
    const portada = await (await fetch(`${BASE}/`)).text();
    const visible = portada.replace(/<script[\s\S]*?<\/script>/g, '');

    // El <title> servido depende de lo que otras pruebas guarden en el panel;
    // el valor de fábrica es el que manda en un despliegue limpio.
    assert.match(require('../server/seo-defaults').defaults.title, /^Empresa de IA y páginas web/);
    assert.ok(visible.includes('Empresa de inteligencia artificial y páginas web'), 'falta la insignia del hero');

    // La sección de la portada enseña los cuatro tipos y lleva a la landing.
    assert.ok(portada.includes('id="paginas-web"'), 'la portada no tiene la sección de páginas web');
    for (const tipo of CONTENIDO.paginasWeb.tipos.items) {
        assert.ok(visible.includes(tipo.nombre), `la portada no enseña «${tipo.nombre}»`);
    }

    const ficha = [...portada.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)]
        .map((m) => JSON.parse(m[1]))
        .find((b) => b['@type'] === 'ProfessionalService');
    assert.match(ficha.description, /^Empresa de inteligencia artificial y páginas web/);
    assert.equal(ficha.knowsAbout[0], 'Diseño de páginas web');

    const nosotros = await (await fetch(`${BASE}/nosotros`)).text();
    assert.match(nosotros, /<h1[^>]*>[\s\S]{0,40}Una agencia de páginas web/);

    const llms = await (await fetch(`${BASE}/llms.txt`)).text();
    assert.match(llms, /> Empresa de inteligencia artificial y páginas web/);

    // Cada sector enlaza a la página web de su giro.
    for (const sector of SECTORES) {
        const html = await (await fetch(`${BASE}${rutaSector(sector.slug)}`)).text();
        assert.ok(
            html.includes(`href="${RUTA_PAGINAS_WEB}"`),
            `${sector.slug} no enlaza a la página de páginas web`
        );
    }
});

test('cada tipo de sitio lleva su escena animada, dibujada ya en el HTML', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // El póster de cada escena se dibuja en el servidor: un rastreador o
    // alguien con la red mala ve la ilustración sin esperar a Remotion.
    const html = await (await fetch(`${BASE}${RUTA_PAGINAS_WEB}`)).text();
    const escenas = [...html.matchAll(/role="img" aria-label="(Ilustración animada: [^"]+)"/g)].map((m) => m[1]);

    assert.equal(
        escenas.length,
        CONTENIDO.paginasWeb.tipos.items.length,
        'no hay una escena por cada tipo de sitio'
    );
    assert.equal(new Set(escenas).size, escenas.length, 'dos tipos comparten la misma escena');

    const posters = html.match(/<svg[^>]*viewBox="0 0 640 400"/g) ?? [];
    assert.ok(posters.length >= 5, 'faltan pósters dibujados en el servidor (hero y los cuatro tipos)');
});


test('el enfoque: tres servicios principales para cuatro giros', async (t) => {
    /*
     * Sitios web, chatbots y agendamiento automatizado para inmobiliarias,
     * gimnasios, spas y salones de uñas. El resto se sigue ofreciendo como
     * complemento, sin encabezar nada.
     */
    const principales = SERVICIOS.filter((s) => s.principal).map((s) => s.slug);
    assert.deepEqual(principales, ['sitio-web', 'chatbots', 'agendamiento-automatizado']);
    assert.equal(SERVICIOS.length, 13);
    assert.deepEqual(
        SECTORES.filter((s) => s.principal).map((s) => s.slug),
        ['inmobiliarias', 'gimnasios', 'spas', 'salones-de-unas']
    );
    // Cada principal tiene landing con dirección propia, bloque y metadatos.
    for (const s of LANDINGS) {
        assert.ok(s.principal && s.ruta && s.bloque && s.seo?.title, `${s.slug} sin landing completa`);
        assert.ok(CONTENIDO[s.bloque], `falta el bloque ${s.bloque}`);
    }

    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // La portada enseña los tres principales y los cuatro giros, con enlace.
    const portada = await (await fetch(`${BASE}/`)).text();
    for (const ruta of [RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO]) {
        assert.ok(portada.includes(`href="${ruta}"`), `la portada no enlaza a ${ruta}`);
    }
    for (const slug of ['inmobiliarias', 'gimnasios', 'spas', 'salones-de-unas']) {
        assert.ok(portada.includes(`href="/sectores/${slug}"`), `la portada no enlaza al giro ${slug}`);
    }

    // Cada giro nombra los tres servicios con su nombre: «Chatbot para spas».
    const spas = await (await fetch(`${BASE}/sectores/spas`)).text();
    assert.ok(spas.includes('Chatbot para <!-- -->spas') || spas.includes('Chatbot para spas'));
    assert.ok(spas.includes(`href="${RUTA_AGENDAMIENTO}"`));
});

test('las landings de chatbots y agendamiento persiguen sus búsquedas', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const casos = [
        { ruta: RUTA_CHATBOTS, h1: 'Chatbots con inteligencia artificial en Aguascalientes', title: /<title>Chatbots con IA en Aguascalientes/ },
        {
            ruta: RUTA_AGENDAMIENTO,
            h1: 'Agendamiento automatizado para negocios en Aguascalientes',
            title: /<title>Agendamiento automatizado en Aguascalientes/,
        },
    ];

    for (const caso of casos) {
        const res = await fetch(`${BASE}${caso.ruta}`);
        assert.equal(res.status, 200, `${caso.ruta} no devolvió 200`);
        const html = await res.text();
        assert.match(html, caso.title);
        assert.match(html, new RegExp(`<h1[^>]*>${caso.h1}</h1>`));
        assert.match(html, new RegExp(`rel="canonical" href="[^"]*${caso.ruta}"`));

        const bloques = [...html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
        assert.ok(bloques.some((b) => b['@type'] === 'Service'), `${caso.ruta} sin Service`);
        const faq = bloques.find((b) => b['@type'] === 'FAQPage');
        assert.ok(faq, `${caso.ruta} sin FAQPage`);
        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
        for (const entrada of faq.mainEntity) {
            assert.ok(visible.includes(entrada.name), `"${entrada.name}" marcada pero no visible en ${caso.ruta}`);
        }
        // Cada tipo lleva su escena, dibujada ya en el HTML.
        assert.ok((html.match(/<svg[^>]*viewBox="0 0 640 400"/g) ?? []).length >= 5, `${caso.ruta} sin escenas`);
    }

    // Las direcciones de los servicios que se fundieron llevan al chatbot.
    for (const vieja of ['/servicios/ia-whatsapp', '/servicios/agentes-y-chatbots']) {
        const res = await fetch(`${BASE}${vieja}`, { redirect: 'manual' });
        assert.equal(res.status, 301);
        assert.equal(res.headers.get('location'), RUTA_CHATBOTS);
    }
});

test('el menú: Inicio, Nosotros, Servicios con desplegable y Contacto', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const enlaces = CONTENIDO.nav.enlaces;
    assert.deepEqual(enlaces.map((e) => e.texto), ['Inicio', 'Nosotros', 'Servicios', 'Contacto']);
    assert.ok(enlaces.find((e) => e.texto === 'Contacto').destacado);

    // El desplegable está en el HTML aunque esté cerrado: sus enlaces a las
    // landings tienen que existir para los rastreadores en todas las páginas.
    const html = await (await fetch(`${BASE}/nosotros`)).text();
    const nav = html.slice(html.indexOf('aria-label="Principal"'), html.indexOf('</nav>', html.indexOf('aria-label="Principal"')));
    for (const ruta of [RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO]) {
        assert.ok(nav.includes(`href="${ruta}"`), `el menú no lleva a ${ruta}`);
    }
    // Los giros no van en el desplegable: se llegan desde la portada y el pie.
    assert.ok(!nav.includes('href="/sectores/'), 'el menú no debe llevar giros');
    assert.match(nav, /aria-expanded="false"/);
});

test('el proceso se dibuja animado con los pasos del contenido', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const portada = await (await fetch(`${BASE}/`)).text();
    assert.match(portada, /aria-label="Diagrama animado del proceso: /);
    assert.match(portada, /viewBox="0 0 960 250"/);
    // Los títulos de los pasos viajan dentro del diagrama, no solo en las tarjetas.
    for (const paso of CONTENIDO.proceso.pasos) {
        const primera = paso.titulo.split(' ')[0];
        assert.ok(portada.includes(`>${primera}`), `el diagrama no lleva «${paso.titulo}»`);
    }
    for (const ruta of [RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO]) {
        const html = await (await fetch(`${BASE}${ruta}`)).text();
        assert.match(html, /aria-label="Diagrama animado del proceso: /, `${ruta} sin diagrama del proceso`);
    }
});

test('cada guía del blog lleva a la landing del servicio que busca quien la lee', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    for (const articulo of ARTICULOS) {
        const servicio = SERVICIOS.find((s) => s.slug === articulo.servicio);
        assert.ok(servicio, `${articulo.slug} no dice a qué servicio lleva`);
        assert.ok(articulo.respuesta, `${articulo.slug} sin respuesta corta`);
        const palabras = articulo.respuesta.split(/\s+/).length;
        assert.ok(palabras >= 40 && palabras <= 70, `la respuesta corta de ${articulo.slug} tiene ${palabras} palabras`);

        const html = await (await fetch(`${BASE}/blog/${articulo.slug}`)).text();
        assert.ok(html.includes(`href="${rutaServicio(servicio.slug)}"`), `${articulo.slug} no enlaza a su servicio`);
        // Los enlaces en Markdown se convierten en enlaces de verdad.
        assert.ok(!/\]\(\//.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), `${articulo.slug} deja Markdown sin convertir`);
        // Sin enlaces a otros dominios: el blog no enlaza fuera.
        const cuerpo = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
        // WhatsApp sí: es nuestro propio número, no un enlace a otra empresa.
        const externos = (cuerpo.match(/href="https?:\/\/[^"]+"/g) ?? []).filter(
            (h) => !h.includes('api.whatsapp.com/send?phone=')
        );
        assert.deepEqual(externos, [], `${articulo.slug} enlaza fuera del sitio`);
    }

    // Las preguntas que se busca responder tienen su guía.
    const titulares = ARTICULOS.map((a) => a.titular).join(' | ');
    assert.match(titulares, /mejor empresa de inteligencia artificial en Aguascalientes/);
    assert.match(titulares, /página web en Aguascalientes/);
    assert.match(titulares, /Chatbots en Aguascalientes/);
    assert.match(titulares, /IA para negocios en Aguascalientes/);
});

test('las fotos de banco se sirven del propio sitio, con texto alternativo y crédito', async (t) => {
    const FOTOS = require('../src/data/fotos.json');

    // Cada foto existe en los dos anchos que pide el srcset.
    for (const foto of Object.values(FOTOS)) {
        for (const ancho of [800, 1600]) {
            const archivo = path.join(__dirname, '..', 'public', 'imagenes', `${foto.archivo}-${ancho}.webp`);
            assert.ok(fs.existsSync(archivo), `falta ${foto.archivo}-${ancho}.webp`);
        }
        assert.ok(foto.alt && foto.autor && foto.pagina, `${foto.archivo} sin alt, autor o página`);
    }

    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // Los giros principales, las tres landings y cada guía llevan su foto.
    const paginas = [
        ...SECTORES.filter((s) => s.principal).map((s) => ({ ruta: rutaSector(s.slug), clave: s.slug })),
        ...LANDINGS.map((s) => ({ ruta: s.ruta, clave: s.foto })),
        ...ARTICULOS.map((a) => ({ ruta: `/blog/${a.slug}`, clave: a.foto })),
    ];
    for (const { ruta, clave } of paginas) {
        const foto = FOTOS[clave];
        assert.ok(foto, `${ruta} pide una foto que no existe: ${clave}`);
        const html = await (await fetch(`${BASE}${ruta}`)).text();
        assert.ok(html.includes(`/imagenes/${foto.archivo}-1600.webp`), `${ruta} no muestra su foto`);
        assert.ok(html.includes(`alt="${foto.alt}"`), `${ruta} sin texto alternativo en la foto`);
        assert.ok(html.includes(foto.autor), `${ruta} sin crédito de la foto`);
    }

    // La imagen de la guía viaja en el BlogPosting con autor y licencia.
    const guia = ARTICULOS[0];
    const html = await (await fetch(`${BASE}/blog/${guia.slug}`)).text();
    const post = [...html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)]
        .map((m) => JSON.parse(m[1]))
        .find((b) => b['@type'] === 'BlogPosting');
    assert.equal(post.image['@type'], 'ImageObject');
    assert.match(post.image.license, /unsplash\.com/);
    assert.ok(post.image.creditText);

    const res = await fetch(`${BASE}/imagenes/${FOTOS[guia.foto].archivo}-800.webp`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /image\/webp/);
});


test('cada sección termina en un botón que cotiza el servicio concreto', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    // Las landings: todos sus botones cotizan su servicio, con una sola etiqueta.
    const casos = [
        { ruta: RUTA_PAGINAS_WEB, servicio: 'sitio-web', etiqueta: 'Cotizar mi página web' },
        { ruta: RUTA_CHATBOTS, servicio: 'chatbots', etiqueta: 'Cotizar mi chatbot' },
        { ruta: RUTA_AGENDAMIENTO, servicio: 'agendamiento-automatizado', etiqueta: 'Cotizar mi agenda' },
    ];
    for (const caso of casos) {
        const html = await (await fetch(`${BASE}${caso.ruta}`)).text();
        const botones = html.match(new RegExp(`href="/contacto\\?servicio=${caso.servicio}[^"]*"`, 'g')) ?? [];
        assert.ok(botones.length >= 6, `${caso.ruta} tiene ${botones.length} botones de cotizar`);
        assert.ok(html.includes(caso.etiqueta), `${caso.ruta} no dice «${caso.etiqueta}»`);
        assert.ok(!html.includes('Solicitar auditoría gratuita'), `${caso.ruta} mezcla etiquetas de contacto`);
        // La alternativa por WhatsApp lleva el mensaje ya redactado.
        assert.match(html, /api\.whatsapp\.com\/send\?phone=\d+&amp;text=Hola\.%20Me%20interesa/);
    }

    // Cada giro cotiza «para mi spa», «para mi gimnasio»…
    const spa = await (await fetch(`${BASE}/sectores/spas`)).text();
    assert.ok(spa.includes('href="/contacto?giro=spas"'), 'el giro no cotiza con su nombre');
    assert.ok(spa.includes('Cotizar para mi spa'));

    // Portada: hay botón de cotizar en las secciones, no solo en el hero y el cierre.
    const portada = await (await fetch(`${BASE}/`)).text();
    const enPortada = portada.match(/class="boton boton-acento boton-grande"/g) ?? [];
    assert.ok(enPortada.length >= 8, `la portada tiene ${enPortada.length} botones de acción`);
});

test('los giros se nombran siempre «Inteligencia artificial para…»', async (t) => {
    const CONT = require('../src/data/contenido.json');
    const pie = CONT.footer.columnas.find((c) => c.id === 'col-giros');
    for (const enlace of pie.enlaces) {
        assert.match(enlace.texto, /^Inteligencia artificial para /, `pie: «${enlace.texto}»`);
    }
    for (const sector of SECTORES) {
        assert.match(sector.titular, /^Inteligencia artificial para /);
    }
    assert.equal(SECTORES.find((s) => s.slug === 'gimnasios').titular, 'Inteligencia artificial para gimnasios');

    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }
    const html = await (await fetch(`${BASE}/sectores/gimnasios`)).text();
    const migas = [...html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)]
        .map((m) => JSON.parse(m[1]))
        .find((b) => b['@type'] === 'BreadcrumbList');
    assert.equal(migas.itemListElement.at(-1).name, 'Inteligencia artificial para gimnasios');
});

test('sin relleno de IA: ni etiquetas en cada sección ni rayas en el texto', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const rutas = ['/', '/nosotros', '/servicios', '/sectores', '/contacto', '/blog',
        RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO, '/sectores/spas',
        '/servicios/google-ads', `/blog/${ARTICULOS[0].slug}`];

    for (const ruta of rutas) {
        const html = await (await fetch(`${BASE}${ruta}`)).text();
        // El cuerpo visible: sin scripts ni el chatbot (su embudo no se toca).
        const visible = html
            .replace(/<script[\s\S]*?<\/script>/g, '')
            .replace(/<head[\s\S]*?<\/head>/, '');

        const etiquetas = (visible.match(/class="insignia/g) ?? []).length;
        assert.ok(etiquetas <= 1, `${ruta} tiene ${etiquetas} etiquetas sobre titulares`);

        const texto = visible.replace(/<[^>]+>/g, ' ');
        assert.ok(!/[—–]/.test(texto), `${ruta} tiene rayas en el texto visible`);
        assert.ok(!/Auditoría sin costo · Respuesta el mismo día/.test(texto), `${ruta} conserva la tira del hero`);
    }
});

test('cada página abre con el hero móvil: escena encuadrada, título y botón', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const conEscena = [
        '/', '/nosotros', '/servicios', '/sectores', '/contacto', '/blog',
        RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO,
        ...SECTORES.map((s) => rutaSector(s.slug)),
    ];

    for (const ruta of conEscena) {
        const html = await (await fetch(`${BASE}${ruta}`)).text();
        const inicio = html.indexOf('class="hero-pagina ');
        assert.ok(inicio > -1, `${ruta} no usa el hero de página`);
        const hero = html.slice(inicio, html.indexOf('</section>', inicio));

        assert.equal((hero.match(/<h1[\s>]/g) ?? []).length, 1, `${ruta}: el h1 va dentro del hero`);
        // En el HTML el texto va antes que la escena, que es el orden de lectura;
        // el teléfono la pinta arriba solo con CSS.
        assert.ok(hero.indexOf('<h1') < hero.indexOf('hero-pagina__escenario'), `${ruta}: la escena va después del texto`);
        assert.match(hero, /--encuadre-proporcion:/, `${ruta}: la escena no lleva encuadre`);
        assert.match(hero, /role="img" aria-label="[^"]{20,}"/, `${ruta}: la escena no se describe`);
    }

    // Los giros y las landings traen la frase corta del teléfono, y la
    // entradilla larga sigue en el HTML.
    for (const sector of SECTORES) {
        const palabras = sector.bajada.split(/\s+/).length;
        assert.ok(palabras <= 20, `${sector.slug}: la bajada tiene ${palabras} palabras`);
    }
    const spa = await (await fetch(`${BASE}/sectores/spas`)).text();
    const sectorSpa = SECTORES.find((s) => s.slug === 'spas');
    assert.ok(spa.includes(`hero-pagina__bajada`) && spa.includes(sectorSpa.bajada));
    assert.ok(spa.includes(sectorSpa.entradilla), 'la entradilla larga no puede desaparecer del HTML');

    for (const bloque of ['hero', 'nosotros']) {
        assert.ok((CONTENIDO[bloque].bajada ?? '').split(/\s+/).length <= 20, `${bloque}: bajada demasiado larga`);
    }
});

test('los artículos abren con su fotografía y la privacidad se lee como el resto', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    const articulo = ARTICULOS.find((a) => a.foto);
    const html = await (await fetch(`${BASE}/blog/${articulo.slug}`)).text();
    assert.match(html, /hero-pagina__foto/);
    assert.match(html, /fetchpriority="high"/i, 'la foto del banner es el LCP en el teléfono');

    const privacidad = await (await fetch(`${BASE}/politica-privacidad`)).text();
    assert.match(privacidad, /aria-label="Principal"/, 'la privacidad lleva el menú del sitio');
    assert.match(privacidad, /aria-label="Migas de pan"/);
    const legal = privacidad.slice(privacidad.indexOf('<main'), privacidad.indexOf('</main>'));
    assert.ok(!/text-xs/.test(legal), 'nada de letra de 12 px en el texto legal');
});

test('el hero del teléfono lleva el sello de la marca y el fondo animado, sin anunciarlos', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }

    for (const ruta of ['/', RUTA_CHATBOTS, '/sectores/spas', '/contacto', `/blog/${ARTICULOS[0].slug}`, '/politica-privacidad']) {
        const html = await (await fetch(`${BASE}${ruta}`)).text();
        assert.match(html, /class="fondo-hero lg:hidden" aria-hidden="true"/, `${ruta}: falta el fondo animado`);
        assert.match(html, /class="hero-pagina__sello[^"]*" aria-hidden="true"/, `${ruta}: falta el sello`);
        // El sello va antes que el título: es lo primero que se ve arriba.
        assert.ok(html.indexOf('hero-pagina__sello') < html.indexOf('<h1'), `${ruta}: el sello va sobre el título`);
    }
});

test('el paquete del navegador no arrastra GSAP', async (t) => {
    const dir = path.join(__dirname, '..', 'dist', 'assets');
    if (!fs.existsSync(dir)) {
        return t.skip('requiere npm run build');
    }
    // Se registraba en cada visita sin que ninguna página lo usara: decenas de
    // KB de JavaScript compitiendo con la primera pintura.
    for (const archivo of fs.readdirSync(dir).filter((a) => a.endsWith('.js'))) {
        const codigo = fs.readFileSync(path.join(dir, archivo), 'utf8');
        assert.ok(!/ScrollTrigger|GreenSock/.test(codigo), `${archivo} incluye GSAP`);
    }
});

test('la portada presenta los tres servicios principales una sola vez', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }
    const html = await (await fetch(`${BASE}/`)).text();

    // Se presentan en «Qué hacemos» (Pilares)...
    const pilares = html.slice(html.indexOf('id="pilares"'), html.indexOf('</section>', html.indexOf('id="pilares"')));
    for (const ruta of [RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO]) {
        assert.ok(pilares.includes(`href="${ruta}"`), `Qué hacemos no enlaza a ${ruta}`);
    }

    // ...y la sección de servicios se queda con los complementarios.
    const servicios = html.slice(html.indexOf('id="servicios"'), html.indexOf('</section>', html.indexOf('id="servicios"')));
    for (const ruta of [RUTA_PAGINAS_WEB, RUTA_CHATBOTS, RUTA_AGENDAMIENTO]) {
        assert.ok(!servicios.includes(`href="${ruta}"`), `la sección de servicios repite ${ruta}`);
    }
    for (const s of SERVICIOS.filter((x) => !x.principal)) {
        assert.ok(servicios.includes(`href="${rutaServicio(s.slug)}"`), `falta el complementario ${s.slug}`);
    }
});

test('en el teléfono el menú no lleva el botón de Contacto en la barra', async (t) => {
    if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'index.html'))) {
        return t.skip('requiere npm run build');
    }
    const html = await (await fetch(`${BASE}/`)).text();
    const nav = html.slice(html.indexOf('aria-label="Principal"'), html.indexOf('</nav>', html.indexOf('aria-label="Principal"')));
    // `.boton` declara su display fuera de la capa de Tailwind: sin `!` el
    // `hidden` no oculta nada y la barra del teléfono se llenaba.
    assert.match(nav, /class="boton !hidden[^"]*sm:!inline-flex/);
});
