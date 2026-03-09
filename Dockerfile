# 1. Construcción del frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Imagen de ejecución final
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# CORRECCIÓN: Copiamos 'dist' (lo que genera Vite) hacia 'dist' (lo que busca server.js)
COPY --from=build-frontend /app/dist ./dist

COPY server.js .
# La carpeta data se manejará con el volumen de Dokploy
RUN mkdir -p data 

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "server.js"]