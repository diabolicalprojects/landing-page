# Relevo para el siguiente agente (27/09/2026, 23:25)

Estado exacto del proyecto al cerrar la sesión, instrucciones del dueño y el plan para seguir. Léase entero antes de tocar nada.

## 1. Instrucciones permanentes del dueño

- **Terminar todas las fases del CMS sin pedir confirmación entre fases.** Hacerlo todo uno mismo (infraestructura incluida), salvo lo que las reglas de seguridad prohíben (ver abajo).
- **Cada actualización se sube a producción** (merge y push a `main`) sin preguntar. El push dispara CI → Publicar imagen → Desplegar.
- Hablarle **de usted**, en español de México. En el panel del CMS los textos son **impersonales** («Guardar cambios», «Sin páginas todavía»).
- **Nunca inventar** métricas, testimonios, casos ni datos: pedírselos. Portafolio, testimonios y equipo **no se publican** hasta tener datos reales.
- El **logo y el nombre** no se modifican; el **embudo del chatbot → n8n → WhatsApp** no se toca.
- **No escribir credenciales** (contraseñas, tokens, claves) en ningún sistema, repositorio ni variable, aunque el dueño lo pida. Cuando haga falta un secreto (Postgres de producción, SMTP, R2, Gemini, Search Console), se deja todo listo y se le pide que lo introduzca él. La contraseña del administrador del CMS la fija él con `npm run cms:crear-admin`.
- No crear secretos de GitHub. Descargar archivos requiere su permiso explícito (ya dio permiso para los logos de IA).

## 2. Qué está hecho

| Pieza | Estado |
|---|---|
| Especificación (Fase 0) | Aprobada. Artifact: https://claude.ai/artifact/8o9qvP5zPPyhRtypbznSe9 |
| Fase 1 | Terminada y en `main` (commit `bfc8fe0`). Detalle: [fase-1.md](fase-1.md) |
| Sitio público | En producción, sin cambios de comportamiento, 65 pruebas |
| Despliegue del sitio | **Cambió esta noche**: Dokploy ya no compila; despliega la imagen `ghcr.io/diabolicalprojects/landing-page:latest` (pública). Ver §4 |
| CMS en producción | **No desplegado** (es la Fase 6). El `/admin` viejo del sitio sigue siendo el que edita el contenido |

Verificación de la Fase 1: `npm run cms:tipos`, `cms:lint`, `cms:test` (7 + 43), `cms:build`, `cms:e2e` (8). El flujo `.github/workflows/cms.yml` repite todo contra Postgres 18 real y publica `ghcr.io/diabolicalprojects/landing-page-cms`.

## 3. Decisiones de la especificación que guían lo que falta

- Sitio actual **se queda** (React/Vite/Express SSR, 37 rutas prerenderizadas); el CMS es una app aparte en **`/admin`** del mismo dominio (Traefik enruta `/admin` y `/media` al CMS en la Fase 6).
- Publicar = **webhook firmado (HMAC)** del CMS al Express, que **regenera solo las rutas afectadas** y guarda el HTML en disco. Si el CMS cae, el sitio sirve la última versión.
- El sitio lee el contenido publicado por la **API interna del CMS** (red de Docker, token de servicio).
- **Todo el contenido migra** a Postgres: 22 bloques de `src/data/contenido.json`, `servicios.json` (11), `sectores.json` (7), `claves.json` (4), `articulos.json` (8), `faq.json` (14), `fotos.json`, `contacto.json` y las solicitudes (`server/leads.js`, en `DATA_DIR`).
- Páginas: **híbrido** (plantillas de las páginas actuales con secciones tipadas + páginas nuevas con bloques). Bloques v1: los del sitio + texto, imagen y embed. Escenas Remotion: se elige la escena y se editan sus textos.
- Flujo: borrador y publicado, con autoguardado, versiones con diff, papelera y bloqueo de edición.
- Roles: administrador, editor, solo lectura. **Sin 2FA** (riesgo aceptado).
- Medios en **Cloudflare R2 privado, servidos por el CMS** en `/media/…` (DNS en Hostinger, sin CDN). Falta la cuenta de R2.
- Correo por **SMTP del BillionMail** propio. Formularios: solo el de contacto, editable; envíos a bandeja (CRM ligero con etapas), n8n, correo. Antispam: honeypot + límite por IP.
- Analítica **propia sin cookies** (< 2 KB, Web Vitals), 13 meses en detalle, reporte semanal por n8n; **quitar GTM** (no hay campañas).
- IA: **API gratuita de Gemini** solo con borradores, nunca datos personales. Extra: Search Console en el panel.
- Tokens de diseño **totalmente editables** (con aviso de contraste y botón «Restaurar Diabolical»).
- Backups: volcado diario **cifrado con age** a un repositorio privado de GitHub, 30 días.

## 4. Infraestructura (Dokploy)

- App del sitio: proyecto «Diabolical Landing Page», `applicationId=byLEfbWZIJGAkubO72Zdj`, `appName=diabolical-landing-page-landing-page-xeddsh`, volumen `diabolical-landing-data` en `/app/data`, dominio `diabolicalservices.tech` puerto 3000.
- **Fuente actual**: Docker, `ghcr.io/diabolicalprojects/landing-page:latest`, sin credenciales (la imagen es pública). El webhook de `deploy.yml` sigue disparando el redeploy tras «Publicar imagen».
- **Para revertir** a compilar desde git (si el webhook con fuente Docker diera problemas): en Dokploy, fuente «Git», URL `https://github.com/diabolicalprojects/landing-page.git`, rama `main`, ruta `/`, clave SSH `S-83nmR5bNR58PQwu9grn`, build `dockerfile`. Con el MCP: `application-update` con `sourceType: "git"` y esos campos.
- Seguimiento de despliegues: API pública `https://api.github.com/repos/diabolicalprojects/landing-page/actions/runs?head_sha=<sha>` y `https://diabolicalservices.tech/build-id.txt`.
- Vistos en el servidor, **sin tocar** (avisados al dueño): Cloud Commander abierto en el puerto 8000, BillionMail con 5678-5679 abiertos, Dokploy sin 2FA, ~150 contenedores muertos, ~9 instancias de Postgres. El dueño dice que el VPS tiene 4 GB o menos.

## 5. Plan para lo que falta

### Fase 2 · Configuración global, tokens, navegación y medios
1. Migración `0002`: `ajustes` (una fila, versionada), `menus` (árbol jsonb), `medios` y `carpetas` (con `sha256`, variantes, foco, alt obligatorio, borrado lógico). RLS como en `0001`.
2. API: `GET/PUT /ajustes`, `GET/PUT /menus/:clave`, `POST /medios` (multipart; magic bytes; sharp → AVIF/WebP en varios anchos, sin EXIF, blurhash), `GET /media/*` (sirve variantes con caché larga).
3. Almacenamiento con una interfaz (`Almacen`) y dos implementaciones: disco (desarrollo y pruebas) y S3/R2 (producción, cuando exista la cuenta).
4. Panel: Ajustes (sitio, logos, contacto, redes, scripts solo administrador, mantenimiento, banner), Tokens (editor con vista previa y aviso AA), Navegación (arrastrar para ordenar), Medios (rejilla, carpetas, detalle con foco y alt).
5. Semilla: importar `contacto.json`, el menú de `contenido.json` (`nav`, `footer`) y `fotos.json`.

### Fase 3 · Páginas, bloques, vista previa y contenido (la más grande)
- **El reto real**: el sitio importa JSON de forma estática en componentes cliente (`servicios.json`, `sectores.json`, `articulos.json`, `claves.json`, `faq.json`, `fotos.json`…), así que hoy cambiarlos exige rebuild. Hay que llevarlos al mismo mecanismo que `contenido.json` (datos inyectados en el SSR y en la hidratación, ver `src/contenido` y `server/contenido.js`) antes de que el CMS los pueda editar.
- Después: esquemas Zod de cada bloque en `compartido/esquemas`, lector de contenido del CMS en el Express, endpoint del webhook con HMAC, regeneración por ruta, sitemap y llms.txt.
- Vista previa: el Express renderiza el borrador (token firmado) en un iframe del panel; clic en un elemento salta a su campo.

### Fases 4, 5 y 6
Formulario y bandeja (CRM ligero), SEO y redirecciones, analítica propia, Search Console y Gemini; después hardening, backups con age, despliegue del CMS (Postgres 18 pequeño, roles `cms_dueno` y `cms_app` que crea el dueño con sus contraseñas, variables de `cms/.env.example`, ruta `/admin` en Traefik) y retiro del panel viejo.

## 6. Cómo trabajar en este repositorio

- Workspaces: el sitio se instala con `npm ci --workspaces=false`; el CMS con `npm ci`. Comandos del CMS en [README.md](README.md).
- PGlite (Postgres 18.3 en WebAssembly) para desarrollo y pruebas: no hace falta Docker (el equipo no lo tiene). Un solo proceso por carpeta de datos.
- Verificación visual: Chrome sin interfaz por CDP (el panel del navegador de la app deja de pintar cuando está oculto). Los scripts auxiliares viven en el scratchpad de la sesión, no en el repo; `cms:e2e` usa el Chrome instalado.
- Estilo del código: comentarios en español explicando el porqué; TypeScript estricto sin `any`; en el sitio, JSX con el mismo tono.
- Tarea sugerida y pendiente: actualizar dependencias vulnerables del sitio (remotion crítica, qs, browserslist).
