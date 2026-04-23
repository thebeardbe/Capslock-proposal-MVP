# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite/Serve uses
EXPOSE 5173

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev", "--", "--host"]
