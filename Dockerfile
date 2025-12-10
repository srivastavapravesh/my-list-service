# --- STAGE 1: BUILD STAGE ---
# Use a production-ready Node image as the base for building/compiling
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies for the final image
# We install dev dependencies here so we can run the TypeScript compiler
RUN npm install

# Copy all source code
COPY . .

# Run the TypeScript compiler to output clean JavaScript files into /app/dist
# This ensures the final container only runs compiled JS, not TypeScript directly
RUN npm run build 

# The 'build' script should be defined in your package.json, e.g.:
# "build": "tsc" 

# --- STAGE 2: PRODUCTION/RUNTIME STAGE ---
# Use a lean, production-only image for the final deployment
FROM node:20-alpine AS production

WORKDIR /app

# Copy only necessary artifacts from the builder stage
# 1. The compiled JavaScript code
COPY --from=builder /app/dist ./dist 
# 2. The production node_modules and package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Ensure the app runs on the port specified by the environment, default 3000
EXPOSE 3000

# The command to run the application
# We run the compiled JavaScript directly, which is faster than using ts-node
CMD ["node", "dist/app.js"]