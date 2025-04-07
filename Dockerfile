# Use a minimal Node.js base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your WebSocket server code
COPY server.js ./

# Expose the WebSocket port
EXPOSE 8080

# Start the WebSocket server
CMD ["node", "server.js"]