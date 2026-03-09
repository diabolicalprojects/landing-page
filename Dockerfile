# 1. Construcción del Frontend (Vite)
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Imagen de ejecución final (Express)
FROM node:20-alpine
WORKDIR /app

# Instalamos solo dependencias de producción
COPY package*.json ./
RUN npm install --production

# Copiamos la carpeta 'dist' construida en el paso anterior
COPY --from=build-frontend /app/dist ./dist

# Copiamos el servidor y aseguramos la carpeta de datos
COPY server.js .
RUN mkdir -p data

# Exponemos el puerto y lanzamos
EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "server.js"]