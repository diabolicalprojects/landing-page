# CMS de Diabolical

Panel propio para administrar diabolicalservices.tech sin tocar código. **Para retomar el trabajo, empezar por [RELEVO.md](RELEVO.md).** La especificación aprobada (Fase 0) está en el artifact «Especificación CMS Diabolical»; este documento explica cómo está hecho y cómo se opera.

| Fase | Estado |
|---|---|
| 0 · Descubrimiento y especificación | Aprobada |
| 1 · Arquitectura, esquema, RLS, acceso y roles | Entregada ([fase-1.md](fase-1.md)) |
| 2 · Configuración global, tokens, navegación y medios | Pendiente |
| 3 · Páginas, bloques, vista previa y tipos de contenido | Pendiente |
| 4 · Formulario, solicitudes, SEO y redirecciones | Pendiente |
| 5 · Analítica y dashboard | Pendiente |
| 6 · Hardening, pruebas, despliegue y documentación | Pendiente |

## Piezas

```
landing-page/
├── (raíz)                 el sitio público: React, Vite, Express SSR. No cambia.
├── compartido/esquemas    esquemas Zod compartidos (panel, API y, en la fase 3, el render del sitio)
├── cms/api                Node 22, Fastify, Drizzle, Postgres. Sirve el panel en /admin y la API en /admin/api
└── cms/panel              Vite, React 19, TypeScript estricto, con el sistema visual del Planificador
```

Son workspaces de npm. El sitio se instala con `npm ci --workspaces=false` (su Dockerfile y su CI) y no arrastra nada del CMS; el CMS tiene su flujo (`.github/workflows/cms.yml`) y su imagen (`cms/Dockerfile`).

## Desarrollo local

No hace falta Docker ni Postgres: en local la API usa **PGlite**, el Postgres 18 real compilado a WebAssembly, con roles y Row Level Security de verdad. Los datos quedan en `cms/api/.datos` (ignorado por git).

```bash
npm install
npm run cms:crear-admin      # primera cuenta de administrador (pide la contraseña sin eco)
npm run cms:dev:api          # API en http://localhost:3100
npm run cms:dev:panel        # panel en http://localhost:5174/admin/ (Vite, con proxy a la API)
```

PGlite no admite dos procesos sobre la misma carpeta: `cms:crear-admin` se ejecuta con la API parada.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run cms:tipos` | TypeScript estricto en los tres paquetes |
| `npm run cms:lint` | ESLint (sin `any`) en API y panel |
| `npm run cms:test` | Vitest: esquemas y API (PGlite en memoria) |
| `npm run cms:build` | Panel (Vite) y API (esbuild) |
| `npm run cms:e2e` | Playwright contra la API real, con el Chrome instalado (no descarga navegadores) |
| `npm run cms:crear-admin` | Crea un administrador, o con `-- --restablecer --correo x` restablece una contraseña |

Para correr las pruebas de la API contra un Postgres real: `CMS_BASE_DATOS_PRUEBAS=postgres://… npm run test -w @diabolical/cms-api` (así lo hace el CI con Postgres 18).

## Seguridad en dos capas

1. **La API** comprueba sesión y permiso en cada ruta (`requiere('usuarios:gestionar')`). La matriz de permisos vive en `compartido/esquemas/src/roles.ts` y la leen igual el panel y la API.
2. **Postgres** aplica Row Level Security. La aplicación nunca se conecta como dueña de las tablas: trabaja con el rol `cms_app` y en cada transacción declara quién es (`conContexto`, en `cms/api/src/db/base.ts`). Aunque una ruta tuviera un error de permisos, la base de datos no dejaría ver ni tocar lo que no toca. Detalle en [esquema.md](esquema.md).

## Producción (Dokploy)

Se prepara en la Fase 6; estos son los pasos, para que no haya sorpresas.

1. **Postgres 18 propio**, pequeño: `shared_buffers=128MB`, `max_connections=20`.
2. **Dos roles**, creados a mano (sus contraseñas son secretos y no viven en migraciones):
   ```sql
   create role cms_dueno login password '…';
   create database cms owner cms_dueno;
   create role cms_app login password '…';
   ```
   Las migraciones, al arrancar con `CMS_BASE_DATOS_MIGRAR`, crean tablas, permisos y políticas.
3. **La aplicación** desde la imagen `ghcr.io/diabolicalprojects/landing-page-cms:latest` (la publica `cms.yml`; el VPS no compila nada), con las variables de `cms/.env.example`.
4. **Traefik**: el mismo dominio, con la ruta `/admin` hacia el CMS. Ese cambio retira el `/admin` actual del sitio y es el último paso de la Fase 6.
5. **Primera cuenta**: `docker exec -it <contenedor> node cms/api/dist/crear-admin.js`.

## Recuperación

Si nadie puede entrar (cuenta bloqueada, contraseña olvidada):

```bash
docker exec -it <contenedor> node cms/api/dist/crear-admin.js --restablecer --correo cuenta@dominio
```

Restablece la contraseña, quita el bloqueo, reactiva la cuenta, cierra sus sesiones y lo registra en la auditoría como hecho «desde terminal».
