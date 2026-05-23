# ==============================================================================
# OPTION A: CI/CD OPTIMIZED (Default)
# Serves pre-built assets from the host's 'dist/' directory (ideal for Jenkins).
# ==============================================================================
FROM nginx:alpine

# Copy the custom Nginx configuration to support SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-built static assets from the host
COPY dist/ /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]


# ==============================================================================
# OPTION B: MULTI-STAGE BUILD (For local standalone building from source)
# To use this instead, uncomment the lines below and comment out Option A above.
# ==============================================================================
# # Stage 1: Build from source
# FROM node:24-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
# 
# # Stage 2: Serve using Nginx
# FROM nginx:alpine
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
