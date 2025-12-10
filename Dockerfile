# --- STAGE 1: BUILD STAGE (Install ALL dependencies for compilation) ---
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# CRITICAL FIX: Install ALL dependencies here. 
# We need 'typescript' (a devDependency) to run the 'build' script.
RUN npm install

# 2. Copy source code (Now that node_modules is complete)
COPY . .

# 3. Run the TypeScript compiler to output clean JavaScript files into /app/dist
RUN npm run build 


# --- STAGE 2: PRODUCTION/RUNTIME STAGE (Only production dependencies) ---
FROM node:20-alpine AS production

# Set environment variables for production
ENV NODE_ENV production

WORKDIR /app

# 1. Copy *only* the production dependencies from the builder's node_modules cache
COPY --from=builder /app/package*.json ./
# Install production-only dependencies here for a smaller final image size
RUN npm install --omit=dev

# 2. Copy the compiled JavaScript code
COPY --from=builder /app/dist ./dist 

# Ensure the app runs on the port specified by the environment, default 3000
EXPOSE 3000

# The command to run the application (must point to the compiled .js file)
CMD ["node", "dist/src/app.js"]