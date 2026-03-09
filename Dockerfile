# Single-stage build for debugging and robustness
FROM node:20-slim
WORKDIR /app

# Copy all metadata files
COPY package*.json ./

# Install EVERY dependency (including devDeps for the build)
RUN npm install

# Copy source code
COPY . .

# Run the frontend build
RUN npm run build

# Make sure data directory exists and has permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port and set environment
EXPOSE 3000
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]