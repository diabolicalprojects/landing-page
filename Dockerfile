# Use Node.js for building the frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use Node.js for the final runtime image
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --production
# Copy built frontend assets
COPY --from=build-frontend /app/dist ./dist
# Copy backend server code
COPY server.js .
# Create data folder for settings persistence
RUN mkdir data

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
