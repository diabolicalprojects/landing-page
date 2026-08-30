# --- Etapa 1: build -------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Se copian solo los manifiestos primero para que la capa de dependencias se
# cachee y no se reinstale en cada cambio de código.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: runtime -----------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Solo lo que el servidor necesita en runtime: nada de código fuente ni de
# devDependencies en la imagen final.
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY server ./server

# El servidor lee los sectores y las preguntas frecuentes de src/data para
# construir el <head>, el sitemap y los llms.txt. Sin esta copia la imagen
# construye igual pero el contenedor muere al arrancar con MODULE_NOT_FOUND.
COPY src/data ./src/data

# Volumen para la configuración del panel /admin. Sin montarlo, los cambios
# guardados se pierden al recrear el contenedor.
RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME ["/app/data"]

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
