FROM node:20
WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm install

# Copia de código y construcción
COPY . .
RUN npm run build

# Asegurar permisos de la base de datos local
RUN mkdir -p data && chmod 777 data

EXPOSE 3000
ENV NODE_ENV=production

# Comando de inicio directo
CMD ["node", "server.js"]