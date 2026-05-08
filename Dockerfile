# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install deps (ignore peer deps for lockfile consistency)
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

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
