# Dockerfile pour le backend (hardened)
FROM node:20-alpine AS base

# Activer pnpm via corepack (évite npm -g)
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Étape de dépendances (build)
FROM base AS deps
WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY apps/backend/package.json ./apps/backend/

# Installer les dépendances complètes pour compiler
RUN pnpm install --frozen-lockfile

# Étape de build
FROM base AS builder
WORKDIR /app

# Copier le code source
COPY packages/database ./packages/database
COPY apps/backend ./apps/backend
COPY tsconfig.json ./

# Restaurer les node_modules des workspaces après copie du code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Build du package database (nécessaire pour que le backend importe du JS en prod)
WORKDIR /app/packages/database
RUN pnpm build

# Build du backend
WORKDIR /app/apps/backend
RUN pnpm build

# En prod Node exécute du JS : le package database doit pointer vers dist/
WORKDIR /app
RUN sed -i.bak \
    -e 's|"main": "./src/index.ts"|"main": "./dist/index.js"|' \
    -e 's|"types": "./src/index.ts"|"types": "./dist/index.d.ts"|' \
    packages/database/package.json && rm -f packages/database/package.json.bak

# Étape des dépendances de production uniquement
FROM base AS prod-deps
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

RUN pnpm install --frozen-lockfile --prod --filter backend...

# Étape de production minimale (sans pnpm)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Utilisateur non-root
RUN addgroup -S app && adduser -S -G app app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=prod-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

RUN chown -R app:app /app
USER app

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/index.js"]

