# CineConnect

Application web full-stack pour les passionnes de cinema: decouverte de films, avis, notation, systeme d'amis, notifications et messagerie temps reel.

## Fonctionnalites

- Authentification complete: inscription, connexion, JWT, OAuth Google (Passport)
- Catalogue films via OMDb: recherche, detail film, filtres par genre, affiches et metadonnees
- Systeme d'avis et notation:
	- Creation, edition, suppression d'avis
	- 1 avis max par utilisateur et par film
	- Recalcul automatique de la note moyenne et du nombre de notes
- Synchronisation OMDb vers la base locale (`imdb_id` unique)
- Reseau social:
	- Envoi/acceptation/refus de demandes d'amis
	- Suppression d'ami
	- Recherche d'utilisateurs
- Notifications en base de donnees:
	- Demandes d'amis
	- Demandes acceptees
	- Messages recus
	- Marquage unitaire ou global en lu
- Messagerie temps reel Socket.io entre amis:
	- Historique de conversation
	- Reception en direct
	- Controle d'autorisation (seulement entre amis)
- Profil utilisateur:
	- Edition nom/bio
	- Avatar (Google ou fallback initiales)
- Frontend redesign dark cinema (theme sombre permanent, hero, cards, animations)
- Documentation API Swagger (`/api-docs`)

## Stack technique

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Drizzle ORM
- JWT + Passport Google OAuth2
- Socket.io
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- Vitest + Supertest

### Frontend
- React 18 + TypeScript
- Vite
- React Router DOM
- TanStack Query
- Tailwind CSS + Radix UI
- React Hook Form + Zod
- Socket.io-client
- Vitest + Testing Library

### Infra et outils
- Monorepo pnpm workspaces
- Docker / Docker Compose (mode dev et mode full stack)
- OMDb API

## Architecture

```text
Project-cine-connect/
|- apps/
|  |- backend/        # API Express + Socket.io
|  \- frontend/       # Application React + Vite
|- packages/
|  \- database/       # Schema Drizzle, migrations, seed
|- docs/
|  \- database-schema.md
|- docker-compose.dev.yml
|- docker-compose.yml
\- README.md
```

## Variables d'environnement

Creer un fichier `.env` a la racine du projet.

### Exemple complet (local)

```env
# Database (local host)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cineconnect_dev
# Option alternative
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cineconnect_dev

# Backend
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change_me
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_refresh
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=change_me_too

# OMDb
OMDB_API_KEY=your_omdb_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Reset password via Resend SMTP
RESEND_SMTP_HOST=smtp.resend.com
RESEND_SMTP_PORT=465
RESEND_SMTP_USER=resend
RESEND_SMTP_PASS=your_resend_smtp_password
EMAIL_FROM=CineConnect <noreply@your-domain.com>
```

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

Important: ne pas mettre de slash final (`/`) dans `VITE_API_URL` pour eviter les URLs du type `//omdb/search`.

## Installation et lancement (mode local recommande)

### 1. Prerequis

- Node.js >= 18
- pnpm >= 8
- Docker Desktop

### 2. Installer les dependances

```bash
pnpm install
```

### 3. Demarrer PostgreSQL (dev)

```bash
pnpm docker:dev
```

Equivalent manuel:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Appliquer les migrations

```bash
pnpm db:migrate
```

### 5. Seed de base (optionnel)

```bash
pnpm db:seed
```

### 6. Seed OMDb (optionnel)

```bash
cd apps/backend
pnpm seed:omdb
```

### 7. Lancer backend + frontend

Depuis la racine:

```bash
pnpm dev
```

Ou en 2 terminaux:

```bash
# Terminal 1
cd apps/backend
pnpm dev

# Terminal 2
cd apps/frontend
pnpm dev
```

Acces:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api-docs`

## Docker

### Mode dev (DB seule)

```bash
pnpm docker:dev
```

### Mode full stack (production-like)

```bash
pnpm docker:build
pnpm docker:up
```

### Commandes utiles

```bash
pnpm docker:up
pnpm docker:down
pnpm docker:build
pnpm docker:logs
```

Services en mode full stack:
- Frontend: `http://localhost` (port 80)
- Backend: `http://localhost:3000`
- Postgres: `localhost:5432`

## Base de donnees (Drizzle)

Scripts disponibles (depuis la racine):

```bash
pnpm db:generate   # genere une migration depuis le schema
pnpm db:migrate    # applique les migrations
pnpm db:seed       # injecte des donnees de base
pnpm db:studio     # interface graphique Drizzle Studio
```

Reset complet (attention: supprime les donnees):

```bash
docker-compose down -v
docker-compose up -d
pnpm db:migrate
pnpm db:seed
```

## Endpoints API principaux

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/auth/google`

### Films / OMDb / Reviews
- `GET /api/films`
- `GET /api/films/:id`
- `GET /api/films/category/:slug`
- `POST /api/films/omdb-sync`
- `GET /api/films/:id/reviews`
- `GET /api/films/by-imdb/:imdbId/reviews`
- `POST /api/films/:id/reviews`
- `PATCH /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `GET /omdb/search`
- `GET /omdb/movie/:imdbId`
- `POST /omdb/sync`

### Utilisateurs / Amis / Notifications / Messages
- `GET /users`
- `GET /users/:id`
- `PATCH /users/me`
- `POST /api/friends/request/:targetId`
- `GET /api/friends/requests`
- `GET /api/friends/sent`
- `PATCH /api/friends/requests/:id/accept`
- `PATCH /api/friends/requests/:id/reject`
- `GET /api/friends`
- `DELETE /api/friends/:friendId`
- `GET /api/friends/status/:targetId`
- `GET /api/friends/search?q=`
- `GET /api/notifications`
- `GET /api/notifications/count`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `GET /api/messages/:friendId`

## Scripts utiles

### Racine

```bash
pnpm dev
pnpm build
pnpm lint
pnpm type-check
pnpm format
pnpm format:check
```

### Backend (`apps/backend`)

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm test:watch
pnpm type-check
pnpm lint
pnpm seed:omdb
pnpm clean:films
pnpm update:posters
```

### Frontend (`apps/frontend`)

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm test:watch
pnpm type-check
pnpm lint
```

## Tests

Depuis chaque app:

```bash
# Backend
cd apps/backend
pnpm test

# Frontend
cd apps/frontend
pnpm test
```

## Auteurs

- Youva HCH
- Laurent DUBOIS
- Narimen BOUMAOUT

## Licence

Projet realise dans un cadre scolaire, libre d'utilisation pour l'apprentissage.
