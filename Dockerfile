# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files  
COPY package.json pnpm-lock.yaml ./

# Configure pnpm: auto-install-peers and allow native build scripts
RUN printf "auto-install-peers=true\n" > .npmrc && \
    pnpm approve-builds @swc/core esbuild

# Install deps
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Build args for Vite env vars
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID

# Build the SPA
RUN pnpm build

# ---- Production stage ----
FROM nginx:alpine

# Remove default nginx config and add ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]