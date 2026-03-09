FROM node:20-alpine
WORKDIR /app

# Copiamos solo lo necesario para instalar
COPY package*.json ./
RUN npm install

# Copiamos el resto
COPY . .

# Construimos el frontend
RUN npm run build

# Permisos para la carpeta de datos
RUN mkdir -p data && chmod 777 data

EXPOSE 3000
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "server.js"]