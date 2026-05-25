# ---- Build stage ----
FROM node:22 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN rm -f pnpm-lock.yaml 2>/dev/null; pnpm install --no-lockfile && \
    pnpm approve-builds esbuild @swc/core && \
    pnpm rebuild esbuild @swc/core

ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID

RUN NODE_ENV=production pnpm build 2>&1

# ---- Production stage ----
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
