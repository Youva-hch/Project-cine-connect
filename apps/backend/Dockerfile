# Dockerfile pour le backend
FROM node:18-alpine AS base

# Installer pnpm
RUN npm install -g pnpm@8.15.0

# Étape de dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY apps/backend/package.json ./apps/backend/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Étape de build
FROM base AS builder
WORKDIR /app

# Copier les dépendances
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copier le code source
COPY packages/database ./packages/database
COPY apps/backend ./apps/backend
COPY tsconfig.json ./

# Build du package database (nécessaire pour que le backend importe du JS en prod)
WORKDIR /app/packages/database
RUN pnpm build

# Build du backend
WORKDIR /app/apps/backend
RUN pnpm build

# Étape de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copier les fichiers nécessaires (root + packages pour workspace, backend node_modules pour dotenv/express/etc.)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

# En prod Node exécute du JS : le package database doit pointer vers dist/ (en dev on garde src/ pour tsx)
RUN sed -i.bak \
    -e 's|"main": "./src/index.ts"|"main": "./dist/index.js"|' \
    -e 's|"types": "./src/index.ts"|"types": "./dist/index.d.ts"|' \
    packages/database/package.json && rm -f packages/database/package.json.bak

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/index.js"]

