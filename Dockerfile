# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1 — build the static bundle
# ------------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Manifests first, so the dependency layer is cached until they actually change.
COPY package.json package-lock.json ./
COPY apps/studio/package.json apps/studio/
COPY packages/tokens/package.json packages/tokens/
COPY packages/core/package.json packages/core/
COPY packages/mock/package.json packages/mock/
COPY packages/store/package.json packages/store/
COPY packages/ui/package.json packages/ui/

# `npm ci` respects the lockfile and links the workspaces.
RUN npm ci --no-audit --no-fund

COPY tsconfig.base.json tsconfig.json ./
COPY packages/ packages/
COPY apps/ apps/

# Fail the image build on a type error rather than shipping a broken bundle.
RUN npm run typecheck && npm run build

# ------------------------------------------------------------------------------
# Stage 2 — serve
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Cloud Run sends SIGTERM and injects PORT; nginx must run in the foreground
# and listen on that port.
ENV PORT=8080

COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
COPY deploy/security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY --from=build /app/apps/studio/dist /usr/share/nginx/html

# The base image is non-root ready; nginx drops privileges for workers itself.
EXPOSE 8080

# nginx:alpine's entrypoint renders /etc/nginx/templates/*.template through
# envsubst, which is how ${PORT} reaches the config.
CMD ["nginx", "-g", "daemon off;"]
