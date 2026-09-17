# --- Etapa 1: build -------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Se copian solo los manifiestos primero para que la capa de dependencias se
# cachee y no se reinstale en cada cambio de código.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Se limita el monton de V8 a proposito. Sin limite, node lo deja crecer hasta
# donde le dejen y el pico del build llega a ~542 MB; con el limite baja a
# ~480 MB sin que el build tarde mas. Medido con tres valores (512, 384 y 256):
# los tres completan y dan el mismo pico, asi que se elige el mas holgado.
#
# Importa porque este build se ejecuta en el servidor de produccion, y el
# 14/09/2026 tres despliegues seguidos murieron sin mensaje por falta de
# memoria; uno se llevo por delante el sitio, el panel de despliegue y una app
# de un cliente.
RUN NODE_OPTIONS=--max-old-space-size=512 npm run build

# --- Etapa 2: dependencias de producción -----------------------------------
# Se derivan del builder podando las de desarrollo, en vez de instalarlas por
# segunda vez.
#
# Antes esta etapa hacía su propio `npm ci --omit=dev`, y como no dependía del
# builder, BuildKit ejecutaba las DOS instalaciones EN PARALELO. El 13/09/2026
# eso tumbó un build: la instalación ligera tardó 172 s (diez veces lo normal,
# señal de máquina sin memoria tirando de disco) y el build murió al arrancar la
# pesada. El servidor iba al 87 % de RAM en reposo.
#
# Encadenarlas deja una sola instalación en toda la imagen: la mitad de trabajo
# y un pico de memoria que no se solapa consigo mismo.
FROM builder AS prod-deps
RUN npm prune --omit=dev && npm cache clean --force

# --- Etapa 3: runtime -----------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules

# Solo lo que el servidor necesita en runtime: nada de código fuente ni de
# devDependencies en la imagen final.
COPY --from=builder /app/dist ./dist

# Bundle de servidor. Es lo que permite que el servidor renderice cada página
# con el contenido que el equipo edita desde /admin, en vez de servir el HTML
# congelado del build. Sin esta copia el sitio arranca igual, pero cualquier
# edición dejaría de salir en el HTML que leen Google y los motores de IA.
COPY --from=builder /app/.ssr ./.ssr

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

# Márgenes anchos a propósito.
#
# Con --timeout=3s y --start-period=10s, la comprobación tumbó el sitio: cada
# sonda arranca un Node entero, y en un host cargado eso no cabe en tres
# segundos. Tres sondas lentas seguidas marcan la tarea como enferma, el
# orquestador la reemplaza, la nueva tarda lo mismo, y el servicio no vuelve a
# levantar aunque la imagen esté perfecta — que lo estaba: CI arranca el
# contenedor y comprueba /health y seis rutas antes de aprobar.
#
# Una comprobación de salud debe detectar un proceso muerto, no competir con la
# carga de la máquina.
HEALTHCHECK --interval=60s --timeout=15s --start-period=90s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
