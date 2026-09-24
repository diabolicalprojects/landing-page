# Diabolical Services — Landing Page

Landing de captación de [Diabolical Services](https://diabolicalservices.tech), agencia de
automatización con IA en Aguascalientes. SPA en React servida por un Express que inyecta los
metadatos SEO en el HTML antes de enviarlo, con un panel `/admin` para editarlos sin tocar código.

El embudo es: landing → chatbot de diagnóstico o formulario de fricción → webhook de n8n +
WhatsApp con el mensaje prellenado.

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4, GSAP + ScrollTrigger, lucide-react |
| Build | Vite 7 |
| Servidor | Express 4, Helmet, compression, express-rate-limit |
| Auth del panel | bcrypt + cookie de sesión firmada con HMAC (httpOnly) |

## Puesta en marcha

```bash
npm install
cp .env.example .env     # rellena los valores (ver más abajo)
npm run dev              # front en modo desarrollo (Vite, puerto 5173)
```

Para probar el servidor real con SEO inyectado y el panel:

```bash
npm run build
npm start                # http://localhost:3000
```

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite con HMR |
| `npm run build` | Compila a `dist/` |
| `npm start` | Levanta Express sirviendo `dist/` |
| `npm run lint` | ESLint sobre cliente y servidor |
| `npm test` | Pruebas de humo del servidor (requiere `npm run build` antes) |
| `npm run verify` | `lint` + `build` + `test`, lo mismo que corre CI |
| `npm run hash-password` | Genera el hash bcrypt para `ADMIN_PASSWORD_HASH` |

## Configuración

Todo se configura por variables de entorno. `.env.example` documenta cada una.

Las que **hay que** definir en producción:

```bash
# Genera el hash de la contraseña del panel
npm run hash-password

# Genera el secreto de firma de sesión
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
ADMIN_USERNAME=...
ADMIN_PASSWORD_HASH=...     # salida de npm run hash-password
SESSION_SECRET=...          # 32 bytes aleatorios
DATA_DIR=/app/data          # volumen persistente
```

Si falta cualquiera de las tres primeras, **el panel `/admin` queda deshabilitado** y la API de
escritura responde `503`. Es deliberado: es preferible un panel inaccesible a uno abierto.

Las variables `VITE_*` se compilan dentro del bundle público — **nunca pongas secretos ahí**.

## Despliegue

### Docker (es el despliegue actual y el que sirve el SEO dinámico)

Cada push a `main` publica la imagen en GitHub Container Registry
(`.github/workflows/publish-image.yml`, sin secretos que configurar).

**Producción corre en Dokploy** (proyecto *Diabolical Landing Page* → app *Landing page*),
construyendo este `Dockerfile` desde la rama `main`. El dominio `diabolicalservices.tech` apunta al
puerto 3000 del contenedor, y `/app/data` está montado sobre un volumen (`diabolical-landing-data`)
para que lo que se guarda desde `/admin` sobreviva a los despliegues.

La app tiene `autoDeploy` activo, pero su fuente es un git genérico **sin la GitHub App
conectada**, así que nada avisa a Dokploy por sí solo: un push a `main` no despliega hasta que algo
llama a su webhook.

**Despliegue automático.** `.github/workflows/deploy.yml` se encadena a la publicación de la
imagen, llama a ese webhook y verifica que la versión nueva quedó realmente servida (que la API de
escritura devuelve 401, que la CSP viaja en las cabeceras y que una ruta inexistente da 404). Si el
webhook responde pero producción no cambia, el workflow falla. Necesita un único secreto:

1. En Dokploy, abre la app y copia su **Webhook URL** (pestaña *Deployments*). Tiene la forma
   `https://admin.diabolicalservices.tech/api/deploy/<token>`.
2. Pégala en **Settings → Secrets and variables → Actions → New repository secret** con el nombre
   `DEPLOY_WEBHOOK_URL`.

Sin ese secreto el workflow no falla: avisa y no hace nada. Si el dominio cambiara, define también
la variable de repositorio `SITE_URL`.

> **Estado: configurado.** El secreto `DEPLOY_WEBHOOK_URL` ya existe en el repositorio, así que un
> push a `main` publica la imagen y despliega sin intervención. Hasta entonces cada despliegue se
> lanzaba a mano desde el panel de Dokploy o por su API.

**El webhook necesita cabecera y cuerpo, no basta con un POST.** Dokploy deduce el proveedor por la
cabecera `x-github-event` y la rama por el cuerpo `{"ref":"refs/heads/main"}`. Un POST pelado
responde `{"message":"Branch Not Match"}` con código **301**, y como 301 no es un error para
`curl -f`, el workflow daba verde sin haber desplegado nada. Por eso el paso comprueba el código a
mano en lugar de fiarse de `curl -f`. Para probarlo desde la terminal:

```bash
curl -i -X POST "$DEPLOY_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-github-event: push' \
  -d '{"ref":"refs/heads/main"}'
```

Debe responder `200` con `{"message":"Application deployed successfully"}`.

**Despliegue manual**, desde Dokploy (botón *Deploy*) o con la imagen publicada:

```bash
docker pull ghcr.io/diabolicalprojects/landing-page:latest
docker stop diabolical-landing && docker rm diabolical-landing
docker run -d --name diabolical-landing --restart unless-stopped -p 3000:3000 \
  --env-file .env \
  -v diabolical-data:/app/data \
  ghcr.io/diabolicalprojects/landing-page:latest
```

Cada versión queda también etiquetada como `sha-<commit>`, así que volver atrás es cambiar la
etiqueta del `docker run`.

Para construir en el propio servidor en lugar de tirar de la imagen publicada:

```bash
docker build -t diabolical-landing .
docker run -d -p 3000:3000 --env-file .env -v diabolical-data:/app/data diabolical-landing
```

El volumen en `/app/data` es necesario: sin él, lo que se guarda desde `/admin` se pierde al
recrear el contenedor.

Comprobaciones rápidas tras desplegar:

```bash
curl -sI https://diabolicalservices.tech/ | grep -i content-security-policy   # CSP activa

# Un solo contenedor de Tag Manager, y ningún gtag.js suelto: dos contenedores
# midiendo la misma propiedad cuentan cada visita dos veces.
curl -s https://diabolicalservices.tech/ | grep -o 'googletagmanager.com/gtm.js' | wc -l   # 1
curl -s https://diabolicalservices.tech/ | grep -c 'gtag/js'                               # 0

curl -s -o /dev/null -w '%{http_code}\n' https://diabolicalservices.tech/no-existe   # 404
curl -s -X POST https://diabolicalservices.tech/api/settings \
  -H 'Content-Type: application/json' -d '{"title":"x"}'                     # 401
```

### Firebase Hosting

```bash
npm run build && firebase deploy
```

Sirve `dist/` como estático. **Express no corre**, así que no hay inyección dinámica de SEO ni
panel `/admin`: los crawlers ven los metadatos estáticos de `index.html`. Es un despliegue válido,
pero entonces el SEO se edita en `index.html`, no en el panel.

## SEO y GEO

El posicionamiento se genera desde **una sola fuente**: `src/data/sectores.json` y
`src/data/faq.json`. De ahí salen las páginas, el `<head>`, el JSON-LD, el sitemap y los
`llms.txt`. Añadir un sector a ese JSON crea su página, su schema, su entrada en el sitemap y su
bloque en los `llms.txt` sin tocar nada más.

**Páginas por sector.** `/automatizacion-para-<slug>` — una por cada entrada de `sectores.json`,
con título, descripción, `Service`, `FAQPage` y `BreadcrumbList` propios. Es la ventaja frente a la
competencia local: nadie segmenta por sector, así que nadie le habla directamente a quien busca
«automatizar las citas de mi clínica en Aguascalientes».

**Blog** (`src/data/articulos.json`). Misma mecánica que los sectores: añadir una entrada al JSON
crea la página `/blog/<slug>`, su `BlogPosting`, su `FAQPage`, su entrada en el sitemap, su línea en
`llms.txt` y su texto íntegro en `llms-full.txt`, sin tocar nada más. Los artículos se prerenderizan
enteros porque su público son justamente los rastreadores que no ejecutan JavaScript.

Es la única pieza que no se puede generar con código: las páginas por sector salen de un JSON, pero
el contenido nuevo y periódico hay que escribirlo. También es lo único del sitio que responde a
preguntas generales («cómo aparecer en ChatGPT») en lugar de hablar de la empresa, así que es lo que
tiene ocasión de ser citado por alguien que todavía no nos busca. Aplica la misma regla que
`sectores.json`: se explican mecanismos y límites, nunca resultados atribuidos a clientes.

**Datos estructurados** (`server/schema.js`). Las entidades se enlazan por `@id`
(`#negocio`, `#website`) para que los buscadores no crean que hay varias empresas distintas.
**Diabolical Services es un negocio de área de servicio, no un local visitable.** No hay oficina
abierta al público, así que el JSON-LD publica `addressLocality`, `addressRegion` y `addressCountry`
—dónde opera la empresa— pero **no** calle, número ni coordenadas. Eso es lo correcto para esta
categoría: una dirección exacta implica que se puede ir, y publicar una que no existe hace más daño
que no publicar ninguna.

El alcance lo declara `areaServed`: Aguascalientes de forma presencial, el resto de México a
distancia. Es lo mismo que dicen los `llms.txt`, así que las dos fuentes no se contradicen.

Los campos `BUSINESS_*` de `.env.example` siguen ahí y el código los publica **solo si están
definidos**, sin necesidad de tocar nada. Si algún día abre una sede con atención al público, basta
con rellenarlos en el entorno. Las coordenadas se validan antes de publicarse: si no son números
dentro de rango —el caso típico es teclearlas con coma decimal— se omite el bloque `geo` entero en
lugar de publicar un mapa que apunta a otro sitio.

**GEO** (posicionamiento en respuestas de IA):

- `robots.txt` (`server/robots.js`) da permiso explícito a 17 rastreadores de motores generativos
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…). Sin ese permiso, el modelo no puede
  recomendarte por mucho contenido que publiques.
- `llms.txt` y `llms-full.txt` (`server/llms.js`) resumen el negocio en texto plano y directo, que
  es lo que un modelo puede extraer y citar. Incluyen de forma deliberada **lo que no hacemos**:
  evita recomendaciones equivocadas, que son las que queman la confianza.

> **Regla al escribir contenido:** en `sectores.json` se describen capacidades y problemas típicos
> del sector, nunca resultados atribuidos a clientes. Cualquier cifra debe venir de un proyecto
> real y ser defendible; una métrica inventada dentro del JSON-LD es motivo de penalización.

Un test comprueba que las preguntas marcadas como `FAQPage` están visibles en la página. Google
exige que coincidan, y es un fallo que no da ningún síntoma hasta que llega la penalización.

## Cómo funciona el SEO

Hay una única fuente de verdad por despliegue:

- **`index.html`** contiene los metadatos estáticos entre los marcadores
  `<!-- SEO_INJECT_START -->` y `<!-- SEO_INJECT_END -->`. Es lo que se sirve tal cual en Firebase
  Hosting.
- **`server/render.js`** reemplaza ese bloque con los valores de `data/settings.json` (editables
  desde `/admin`) cuando el que sirve es Express. Todos los valores se escapan antes de entrar en
  el HTML.
- **`server/seo-defaults.js`** son los valores por defecto y **deben coincidir** con los estáticos
  de `index.html`. `ROUTE_META` da título y descripción propios a cada ruta.

### Medición

Google Tag Manager (`GTM-P3P29XB5`) vive **estático en `index.html`, fuera de los marcadores**, para
que cargue en ambos despliegues. Por eso los campos `googleTagManager` y `customHeaderScripts` del
panel van vacíos por defecto: rellenarlos añadiría un **segundo** contenedor, no sustituiría al
primero.

**Google Analytics no aparece en el HTML.** GA4 está configurado dentro del contenedor de Tag
Manager, así que el `gtag.js` suelto que había aquí medía la misma propiedad por segunda vez: 167 KiB
de carga para contar cada visita dos veces. Si alguna vez hace falta volver a ponerlo, primero hay
que quitar GA4 de Tag Manager.

El contenedor **no se descarga durante el primer pintado**. Son más de 100 KiB compitiendo por red y
por hilo principal justo en la ventana que decide el LCP. Se pide a lo primero que ocurra de: el
evento `load`, la primera interacción real, o 3,5 s de respaldo. El `dataLayer` sí se crea en la
primera línea del `<head>`, así que lo que se empuje antes queda encolado y Tag Manager lo procesa
entero al arrancar: diferir no pierde eventos.

Los eventos de conversión se envían con `medir()` (`src/utils/medicion.js`), que empuja al
`dataLayer`. **No** se llama a `gtag()`: esa función solo existía por el `gtag.js` suelto, y al
quitarlo la guarda `typeof window.gtag === 'function'` habría dejado de cumplirse y las conversiones
se habrían perdido sin error ninguno.

> **Requiere configuración en Tag Manager.** Para que `generate_lead` llegue a GA4 hace falta una
> etiqueta de evento de GA4 con un activador de **evento personalizado** llamado `generate_lead`. Sin
> esa etiqueta el evento llega al `dataLayer` y se queda ahí.

## Render: build y caliente

`npm run build` hace tres pasos:

1. `vite build` — bundle de cliente en `dist/`.
2. `vite build --config vite.config.ssr.js` — build de servidor en `.ssr/`.
3. `node scripts/prerender.mjs` — renderiza las 28 rutas a HTML dentro de `dist/`.

En producción el servidor **no sirve ese HTML directamente**. Usa el bundle de `.ssr/` para
renderizar cada página en el momento, con el contenido que hay guardado ahora, y cachea el
resultado por `(ruta, versión del contenido)`. Es lo que hace que un cambio hecho en `/admin`
aparezca en el HTML servido sin recompilar ni desplegar — y ahí está la diferencia entre que Google
y los rastreadores de motores de IA lean el texto nuevo o sigan leyendo el del último despliegue.

El HTML del build es el respaldo, y solo se sirve **mientras nadie haya editado nada**: con el
contenido de fábrica es exacto. Si alguien editó y el bundle de servidor no está disponible, se
sirve el shell vacío y se monta en cliente; servir el estático daría texto viejo y además React lo
tiraría al hidratar por no coincidir.

Por eso el `Dockerfile` copia `.ssr/` a la imagen final. Sin esa copia el sitio arranca igual, pero
pierde la propiedad entera.

El contenido viaja además en `window.__CONTENIDO__` para que React hidrate con el mismo dato con el
que se generó el markup. Se serializa con `serializeJson`, que escapa `<` y los separadores de
línea U+2028/U+2029: sin eso, un `</script>` o un párrafo pegado desde Word parten la página.

El `ETag` lleva **la huella del build y la versión del contenido**. Con solo el contenido había un
agujero serio: un despliegue que tocara únicamente código dejaba el ETag idéntico, el navegador
recibía 304 y reutilizaba HTML que apunta a assets con hash que ya no existen — página en blanco
para quien había visitado antes.

`LandingPage` se importa de forma directa (no con `lazy`) porque es una ruta renderizada en
servidor, y el chatbot se monta tras hidratar: un `<Suspense>` sin resolver durante el render hacía
que React descartara todo el HTML del servidor (error #419).

## Estructura del sitio

28 rutas, todas renderizadas en servidor y todas en el sitemap:

```
/                          inicio
/nosotros                  quiénes somos
/servicios                 índice del catálogo
/servicios/<slug>          una por cada servicio (12 de los 13)
/paginas-web-aguascalientes  el servicio de diseño web, con landing propia
/sectores                  índice de sectores
/sectores/<slug>           una por cada uno de los 6 sectores
/contacto                  auditoría y formulario
/blog, /blog/<slug>        índice y artículos
/politica-privacidad
```

Las rutas salen de `server/schema.js` (`RUTAS_PUBLICAS`), que alimenta a la vez
el router del servidor, el sitemap, el prerender y los `llms.txt`. El router de
React las declara una por una en lugar de con un `:parametro`: así no puede
desincronizarse de esa lista, y una dirección inventada devuelve 404 de verdad
en lugar de 200 con una página vacía.

**Redirecciones.** Los sectores vivían en `/automatizacion-para-<slug>`. Esas
URLs están indexadas, así que devuelven **301** a su equivalente en `/sectores/`.
La lista (`REDIRECCIONES` en `server/schema.js`) se escribe a mano y no se deriva
de los slugs actuales, porque tiene que reflejar lo que Google ya tiene
indexado: `/automatizacion-para-spas` ya no existe como slug —el sector pasó a
llamarse `salones-de-belleza`— y aun así tiene que llevar a algún sitio útil.

`/servicios/sitio-web` también devuelve **301**, a `/paginas-web-aguascalientes`.

**Landing de páginas web.** Es la única página que persigue una búsqueda distinta
de la frase de la casa: «diseño de páginas web», «diseño y desarrollo de páginas
web en Aguascalientes» y «páginas web Aguascalientes». Las tres se reparten entre
la URL, el `<title>` y el h1 en lugar de repetirse. El servicio `sitio-web` lleva
`"ruta"` en `servicios.json`, y `rutaServicio()` (servidor y cliente) la usa en
todos los enlaces, el catálogo de ofertas y el sitemap: dos URL persiguiendo la
misma búsqueda se quitan la posición la una a la otra.

Todo su texto está en el bloque `paginasWeb` del contenido editable (panel →
«Página: páginas web», con la vista previa abierta en esa página). El FAQPage y el
catálogo del `Service` se construyen en cada petición a partir de ese mismo
bloque, así que editar una respuesta en el panel cambia también el marcado. El
portafolio está vacío y oculto a propósito: solo se llena con sitios de cliente
publicados y funcionando, con captura subida al propio sitio (la CSP no carga
imágenes de otros dominios).

## Escenas animadas

Veintidós ilustraciones (`src/motion/`): tres de marca, trece de servicio y seis
de sector. Son SVG con `viewBox`, no imágenes.

Una escena recibe `frame` y `fps` por props y dibuja. No llama a ningún hook de
Remotion, y ese es el motivo de que pueda dibujarse en el servidor sin que
Remotion exista:

```
servidor / prefers-reduced-motion   →  <Escena frame={poster} />   HTML puro
la escena entra en pantalla          →  Remotion la anima          trozo aparte
la escena sale de pantalla           →  se pausa
```

`src/motion/Reproductor.jsx` es el **único** fichero que importa `remotion` y
`@remotion/player`, así que Vite se los lleva a un chunk propio: 39 kB brotli que
solo se descargan cuando hace falta. El bundle crítico no paga nada.

Las utilidades de tiempo (`src/motion/tiempo.js`) son propias y no las de
Remotion a propósito: importar `interpolate` del paquete metería Remotion entero
en el bundle crítico.

## Contenido editable y panel

El panel `/admin` es un CMS. Edita el contenido con el sitio real al lado, en un `<iframe>` que
recibe el borrador por `postMessage` en cada tecla.

```
src/data/contenido.json     contenido de fábrica (en el repo, nunca se escribe)
        v  fusionado debajo de
data/contenido.json         lo editado (en el volumen)
```

La fusión es profunda y los arrays se reemplazan enteros: fusionarlos por índice haría imposible
borrar una tarjeta, porque la de fábrica reaparecería debajo. Si el fichero del volumen se corrompe
o se borra, el sitio vuelve al de fábrica en vez de quedarse en blanco.

`server/contenido.js` y `src/contenido/index.jsx` implementan **la misma fusión**. Si divergen, el
HTML servido y el que React reconstruye al hidratar dejan de coincidir y React tira el servidor
entero.

Las variables de tema (`acento`, `papel`, escalas, radio) salen como custom properties en un
`<style>` propio. Todo valor se valida por forma antes de escribirse: un color es exactamente
`#rgb`, `#rrggbb` o `#rrggbbaa`, y cualquier otra cosa cae al de fábrica. Sin eso, un `}` en un
campo de texto cierra la regla y lo siguiente es CSS arbitrario.

**Prospectos.** El formulario y el chatbot siguen enviando a n8n igual que siempre; se añadió una
copia local en `data/leads.jsonl` porque antes un fallo del webhook era un prospecto perdido sin
que nadie se enterara. Un JSON por línea, solo se añade al final, y el estado (nuevo / atendido /
descartado) vive aparte para no tener que reescribir el registro.

## Estructura

```
server.js                 Punto de entrada de Express
server/
  config.js               Variables de entorno
  security.js             Helmet/CSP, CORS, rate limiting
  auth.js                 Login bcrypt + sesión HMAC en cookie httpOnly
  settings.js             Lectura/escritura de data/settings.json
  seo-defaults.js         Metadatos por defecto y por ruta
  contenido.js            Contenido editable: fusión, validación y versión
  leads.js                Bandeja de prospectos (JSONL + estados)
  ssr.js                  Render en caliente con caché por versión
  render.js               Inyección del <head> con escapado
  html.js                 Utilidades de escapado
src/
  data/                   contenido.json, sectores.json, servicios.json, faq.json,
                          articulos.json (fuentes de verdad)
  contenido/              Proveedor de contenido y variables de tema
  motion/                 Escenas animadas, primitivas y puente con Remotion
  admin/                  Editor de campos, vista previa, prospectos, tema
  pages/                  InicioPage, NosotrosPage, ServiciosPage, ServicioPage,
                          SectoresPage, SectorPage, ContactoPage, BlogPage,
                          ArticuloPage, AdminPage, PrivacyPolicy, NotFound
  components/sections/    Secciones de la landing
  components/common/      Navbar, Footer, chatbot, cursor, ErrorBoundary
  utils/leads.js          Envío a n8n + copia local, y apertura de WhatsApp
  config.js               Configuración del cliente (VITE_*)
tests/server.test.js      Pruebas de humo del servidor
tests/cms.test.js         Contenido editable, prospectos y caché
video/                    Estudio de Remotion (proyecto aparte, ver video/README.md)
```

## Seguridad

- Las APIs de escritura (`POST /api/settings`, `POST /api/contenido`) exigen sesión válida. La
  lectura es pública porque devuelve lo mismo que ya sale en el HTML.
- `POST /api/leads` es la única escritura sin sesión: el formulario público. Va con su propio
  límite (20 envíos por IP cada 10 minutos), recorta a texto plano, tope de 40 campos y descarta
  caracteres de control. Leer la bandeja sí exige sesión: son datos personales de terceros.
- `frame-ancestors` es `'self'` y no `'none'` porque el panel muestra el sitio real en un
  `<iframe>` para la vista previa. Sigue bloqueando a cualquier otro dominio, que es de lo que
  protege esa directiva. La vista previa solo acepta mensajes del mismo origen.
- Las credenciales del panel **nunca** llegan al navegador: se validan en el servidor con bcrypt.
- La cookie de sesión es `httpOnly` + `sameSite=strict`, y `secure` en producción.
- Login limitado a 5 intentos por 15 minutos; el resto de la API a 60 peticiones por minuto.
- CSP activa. Si un despliegue rompe algo, arranca con `CSP_REPORT_ONLY=true` para ver qué bloquea
  antes de forzarla.
- Las reglas de Firestore son `deny` por defecto: la landing no usa Firestore.
- `customHeaderScripts` inyecta HTML sin sanear **por diseño** (es su función). Solo lo puede tocar
  quien tenga sesión de admin; trátalo como acceso equivalente a root sobre el sitio.

> **Pendiente al desplegar:** la contraseña anterior del panel estuvo hardcodeada en el bundle
> público y sigue en el historial de git. Genera una nueva con `npm run hash-password` y no
> reutilices la vieja.
