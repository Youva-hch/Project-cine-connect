# CinéConnect

Application web full-stack dédiée aux passionnés de cinéma. Découvrez des films, laissez des avis, ajoutez des amis et discutez en temps réel.

---

## Fonctionnalités

- **Authentification** — Inscription, connexion, Google OAuth, JWT
- **Films** — Liste avec filtres (catégorie, année, note), détail, avis et notation
- **Amis** — Demandes d'amis, acceptation, refus, suppression
- **Messagerie** — Chat en temps réel entre amis (Socket.io)
- **Notifications** — Alertes pour les demandes d'amis et messages reçus
- **Profil** — Modification du nom et de l'avatar
- **API documentée** — Interface Swagger accessible sur `/api-docs`

---

## Stack technique

### Backend
- **Node.js** + **TypeScript**
- **Express.js** — serveur HTTP
- **PostgreSQL** — base de données relationnelle
- **Drizzle ORM** — requêtes et migrations
- **JWT** — authentification
- **Socket.io** — messagerie temps réel
- **Swagger** (swagger-jsdoc + swagger-ui-express) — documentation API
- **Vitest** + **Supertest** — tests

### Frontend
- **React 18** + **TypeScript**
- **Vite** — bundler
- **React Router DOM** — navigation
- **TanStack Query** — gestion des requêtes et du cache
- **Tailwind CSS** + **Radix UI** — interface
- **React Hook Form** + **Zod** — formulaires et validation
- **Socket.io-client** — messagerie temps réel
- **Vitest** — tests unitaires

### Outils
- **pnpm workspaces** — monorepo
- **Docker** + **docker-compose** — base de données PostgreSQL
- **OMDb API** — données des films

---

## Architecture du projet

```
Project-cine-connect/
├── apps/
│   ├── backend/          # API Express
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── middlewares/
│   │       └── __tests__/
│   └── frontend/         # React + Vite
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── context/
│           └── __tests__/
├── packages/
│   └── database/         # Schéma Drizzle + migrations
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Installation et lancement

### Prérequis

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- Docker + Docker Compose

### 1. Cloner le projet

```bash
git clone https://github.com/Youva-hch/Project-cine-connect.git
cd Project-cine-connect
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à la racine (voir `.env.example`) :

```env
JWT_SECRET=votre_secret_jwt
OMDB_API_KEY=votre_clé_omdb
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_secret_google
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Lancer la base de données

```bash
docker-compose up -d
```

### 4. Installer les dépendances et migrer

```bash
pnpm install
pnpm db:migrate
```

### 5. Lancer le projet

```bash
# Backend (port 3000)
cd apps/backend
pnpm dev

# Frontend (port 5173) — dans un autre terminal
cd apps/frontend
pnpm dev
```

L'application est disponible sur `http://localhost:5173`

---

## Tests

```bash
# Tests backend (depuis apps/backend)
pnpm test

# Tests frontend (depuis apps/frontend)
pnpm test
```

Les tests couvrent :
- Génération et vérification des tokens JWT
- Routes de l'API (health check, routes protégées)
- Logique de filtrage des films (côté frontend)

---

## Documentation API

La documentation Swagger est disponible une fois le backend lancé :

```
http://localhost:3000/api-docs
```

---

## Auteurs

- **Youva HCH**

---

## Licence

Projet réalisé dans un cadre scolaire — libre d'utilisation pour l'apprentissage.
