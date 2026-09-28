# Fase 1 · Arquitectura, esquema, RLS, acceso y roles

## Lo construido

- **Monorepo con workspaces**: `compartido/esquemas`, `cms/api`, `cms/panel`. El sitio público no cambia de comportamiento: se instala con `npm ci --workspaces=false` en su Dockerfile y en su CI.
- **Postgres con migraciones y RLS**: usuarios, sesiones, dispositivos y auditoría. La aplicación trabaja con el rol `cms_app`, sujeto a las políticas; cada transacción declara quién la hace. Diagrama y políticas en [esquema.md](esquema.md).
- **Acceso**: correo y contraseña (Argon2id), bloqueo progresivo por cuenta (5 fallos: 15 min, y se dobla hasta 24 h), límite de 10 intentos por IP cada 15 minutos, el mismo mensaje y tiempo de respuesta para un correo que no existe, sesiones en base de datos (token de 256 bits, solo su SHA-256 guardado), cookie `HttpOnly`, `Secure`, `SameSite=Strict` y limitada a `/admin`, y aviso por correo al entrar desde un dispositivo nuevo.
- **Roles**: administrador, editor y solo lectura, con la matriz en `compartido/esquemas/src/roles.ts`. La API comprueba en cada ruta y Postgres vuelve a comprobar.
- **Sesiones**: lista de sesiones abiertas y cierre a distancia (las propias; un administrador, las de todos). Cambiar la contraseña cierra las demás.
- **Usuarios**: crear, cambiar rol y estado, desbloquear y restablecer contraseña. No se borran, se desactivan. Siempre queda un administrador activo.
- **Auditoría**: registro de solo inserción, con filtros por acción y fechas y paginación por cursor.
- **Panel**: armazón con el sistema visual del Planificador (isla negra, Manrope, monocromo, barra inferior en el teléfono), pantallas de acceso, inicio, usuarios, auditoría, sesiones y cuenta. Piezas nuevas en el mismo lenguaje: modal (sobre `<dialog>` nativo), toast con «Deshacer» y esqueletos de carga.
- **Cabeceras**: CSP estricta (`'self'`, sin nada de otros dominios), `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, COOP y CORP; HSTS en producción; `Cache-Control: no-store` en la API.
- **Builds en GitHub**: `cms.yml` verifica (tipos, lint, pruebas con PGlite y con Postgres 18, build y E2E) y publica la imagen en GHCR. El VPS no compila.
- **Recuperación**: `crear-admin --restablecer` desde el contenedor.

## Decisiones tomadas durante la fase

- **PGlite para desarrollo y pruebas.** En el equipo no hay Docker ni Postgres. PGlite es Postgres 18.3 en WebAssembly y aplica roles y RLS de verdad; el CI repite las pruebas contra un Postgres 18 real.
- **Migraciones en SQL escrito a mano**, no generadas por drizzle-kit: el RLS, los permisos y los disparadores no los describe Drizzle.
- **CSRF**: además de `SameSite=Strict`, toda petición que cambia algo exige la cabecera `X-CMS: 1` y, si trae `Origin`, que sea la del sitio.
- **Sin línea de log por petición en producción**: los logs no guardan IPs ni rutas de cada visita; la auditoría es el registro.

## Probarlo en local

```bash
npm install
npm run cms:crear-admin
npm run cms:dev:api
npm run cms:dev:panel      # http://localhost:5174/admin/
```

## Pruebas

| Suite | Resultado |
|---|---|
| Esquemas compartidos (Vitest) | 7 pruebas |
| API (Vitest, PGlite): contraseñas, bloqueo, dispositivos, RLS, acceso, CSRF, sesiones, usuarios | 43 pruebas |
| E2E (Playwright, escritorio y teléfono): redirección sin sesión, error de acceso, crear editor, auditoría, salir, navegación móvil | 8 pruebas |

## Checklist OWASP Top 10 (2021)

| Riesgo | Estado | Cómo |
|---|---|---|
| A01 Control de acceso roto | Cubierto | Permiso en cada ruta, RLS en Postgres, trigger de columnas protegidas, pruebas de cada rol. |
| A02 Fallos criptográficos | Cubierto | Argon2id (19 MiB, t=2), tokens de 256 bits guardados como SHA-256, cookies `Secure` y HSTS en producción. |
| A03 Inyección | Cubierto | Consultas parametrizadas (Drizzle), Zod en cada entrada; el único SQL crudo son migraciones estáticas. |
| A04 Diseño inseguro | Riesgo aceptado | Sin 2FA por decisión. Compensaciones: bloqueo progresivo, límite por IP, respuestas uniformes, sesiones revocables, aviso de dispositivo nuevo. |
| A05 Configuración insegura | Cubierto en el CMS | CSP estricta y cabeceras; errores sin detalles internos. Fuera del CMS quedan pendientes en el servidor: Cloud Commander en el puerto 8000, puertos 5678-5679 de BillionMail y Dokploy sin 2FA. |
| A06 Componentes vulnerables | Cubierto en el CMS | `npm audit` de producción del CMS: 0 vulnerabilidades. El sitio tiene avisos propios (remotion, qs, browserslist) fuera de esta fase. |
| A07 Fallos de identificación | Cubierto, salvo 2FA | Bloqueo, límite, sesiones nuevas en cada entrada, revocación al cambiar contraseña o desactivar. |
| A08 Integridad de software y datos | Parcial | Lockfile, imágenes construidas en CI y publicadas en GHCR, migraciones versionadas. Pendiente: firma de imágenes. |
| A09 Registro y monitoreo | Parcial | Auditoría de solo inserción; logs sin cookies. Pendiente (fase 6): alertas. |
| A10 SSRF | No aplica | En esta fase el servidor no pide URLs de terceros. |

## Pendientes y riesgos

- **Cambio de Dokploy a imágenes de GHCR** para el sitio: el flujo que publica la imagen ya existe; falta que Dokploy despliegue desde ella en vez de construir desde git. Es un cambio en la configuración de producción y necesita su confirmación.
- **Despliegue del CMS** (Postgres, roles, aplicación y ruta `/admin`): fase 6, como dice la especificación.
- **SMTP**: el aviso de dispositivo nuevo sale en cuanto se configuren las variables `SMTP_*` con el Postfix de BillionMail (revisar SPF, DKIM y DMARC).
- **Contraseña del administrador**: se fija con `crear-admin`; la elegida ya se escribió en un chat.
