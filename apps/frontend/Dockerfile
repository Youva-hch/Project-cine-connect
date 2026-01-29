# Dockerfile pour le frontend
FROM node:18-alpine AS base

# Installer pnpm
RUN npm install -g pnpm@8.15.0

# Étape de dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY apps/frontend/package.json ./apps/frontend/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Étape de build
FROM base AS builder
WORKDIR /app

# Copier les dépendances
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

# Copier le code source
COPY packages/database ./packages/database
COPY apps/frontend ./apps/frontend
COPY tsconfig.json ./

# Build
WORKDIR /app/apps/frontend
RUN pnpm build

# Étape de production avec nginx
FROM nginx:alpine AS runner

# Copier les fichiers buildés
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copier la configuration nginx
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

