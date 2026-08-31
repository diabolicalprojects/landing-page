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
curl -s https://diabolicalservices.tech/ | grep -c "GTM-P3P29XB5"            # analítica: 1
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

Google Tag Manager (`GTM-P3P29XB5`) y Google Analytics (`G-7C6BCDND8S`) viven **estáticos en
`index.html`, fuera de los marcadores**, para que carguen en ambos despliegues. Por eso los campos
`googleTagManager` y `customHeaderScripts` del panel van vacíos por defecto: rellenarlos duplicaría
las etiquetas.

## Prerender

`npm run build` hace tres pasos:

1. `vite build` — bundle de cliente en `dist/`.
2. `vite build --config vite.config.ssr.js` — build de servidor en `.ssr/` (temporal).
3. `node scripts/prerender.mjs` — renderiza la portada a HTML y la escribe en `dist/index.html`.

Resultado: quien pida `/` recibe la landing entera en el HTML, sin necesidad de ejecutar
JavaScript. Los crawlers que no ejecutan JS (buscadores secundarios, previsualizadores de enlaces,
rastreadores de LLMs) antes veían un `<div id="root">` vacío.

El shell vacío queda en `dist/app-shell.html` y es lo que se sirve en el resto de rutas: darles la
portada prerenderizada obligaría a React a descartarla al hidratar.

Dos detalles que hay que respetar al tocar animaciones de entrada:

- Un script inline en `<head>` añade la clase `js` al `<html>` antes del primer pintado. La regla
  `.js .hero-content > *` de `index.css` deja esos elementos en `opacity: 0` para que el contenido
  prerenderizado no se vea un instante antes de que GSAP lo anime. Sin JS la clase no se aplica y
  el contenido queda visible.
- Por eso las animaciones usan `gsap.fromTo(...)`, no `gsap.from(...)`, y no limpian la opacidad
  con `clearProps`: hacerlo devolvería el elemento a la regla CSS que lo esconde.

`LandingPage` se importa de forma directa (no con `lazy`) porque es la ruta prerenderizada, y el
chatbot se monta tras hidratar: un `<Suspense>` sin resolver durante el prerender hacía que React
descartara todo el HTML del servidor (error #419).

## Estructura

```
server.js                 Punto de entrada de Express
server/
  config.js               Variables de entorno
  security.js             Helmet/CSP, CORS, rate limiting
  auth.js                 Login bcrypt + sesión HMAC en cookie httpOnly
  settings.js             Lectura/escritura de data/settings.json
  seo-defaults.js         Metadatos por defecto y por ruta
  render.js               Inyección del <head> con escapado
  html.js                 Utilidades de escapado
src/
  data/                   sectores.json, faq.json, articulos.json (fuentes de verdad)
  pages/                  LandingPage, SectorPage, BlogPage, ArticuloPage,
                          AdminPage, PrivacyPolicy, NotFound
  components/sections/    Secciones de la landing
  components/common/      Navbar, Footer, chatbot, cursor, ErrorBoundary
  utils/leads.js          Envío a n8n y apertura de WhatsApp
  config.js               Configuración del cliente (VITE_*)
tests/server.test.js      Pruebas de humo del servidor
```

## Seguridad

- La API de escritura (`POST /api/settings`) exige sesión válida. La lectura es pública porque
  devuelve los mismos metadatos que ya salen en el HTML.
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
