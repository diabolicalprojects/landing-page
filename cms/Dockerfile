# ===========================================================================
# Imagen del CMS de Diabolical: el panel (estáticos) y la API en un contenedor.
#
# Se construye en GitHub Actions y Dokploy solo la descarga: el VPS no compila
# nada. Contexto de construcción: la raíz del repositorio.
#
#   docker build -f cms/Dockerfile -t cms .
# ===========================================================================

# --- Etapa 1: build -------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY compartido/esquemas/package.json compartido/esquemas/
COPY cms/api/package.json cms/api/
COPY cms/panel/package.json cms/panel/
RUN npm ci -w @diabolical/esquemas -w @diabolical/cms-api -w @diabolical/cms-panel --include-workspace-root=false

COPY compartido ./compartido
COPY cms ./cms
RUN npm run build -w @diabolical/cms-panel && npm run build -w @diabolical/cms-api

# --- Etapa 2: dependencias de producción de la API ------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY compartido/esquemas/package.json compartido/esquemas/
COPY cms/api/package.json cms/api/
COPY cms/panel/package.json cms/panel/
RUN npm ci -w @diabolical/cms-api --omit=dev --include-workspace-root=false \
    && mkdir -p cms/api/node_modules \
    && npm cache clean --force

# --- Etapa 3: ejecución ---------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    CMS_PUERTO=3100 \
    CMS_CONFIAR_PROXY=1
WORKDIR /app

# Misma estructura que en el repositorio, para que la resolución de módulos y
# la ruta del panel (cms/panel/dist) funcionen sin configuración.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/cms/api/node_modules ./cms/api/node_modules
COPY --from=builder /app/cms/api/dist ./cms/api/dist
COPY --from=builder /app/cms/panel/dist ./cms/panel/dist

USER node
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3100/admin/api/salud > /dev/null || exit 1

CMD ["node", "cms/api/dist/servidor.js"]
