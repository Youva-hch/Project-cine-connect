# Backend - CinéConnect API

API Node.js avec Express, TypeScript et sécurité intégrée.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm dev

# Build de production
pnpm build

# Lancer en production
pnpm start

# Vérifier les types TypeScript
pnpm type-check
```

## 📁 Structure du projet

```
src/
├── controllers/  # Contrôleurs pour gérer la logique métier
├── routes/       # Définition des routes
├── middlewares/  # Middlewares personnalisés
├── services/     # Services et logique métier
└── index.ts      # Point d'entrée de l'application
```

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Typage statique (mode strict)
- **CORS** - Gestion des requêtes cross-origin
- **Helmet** - Sécurité HTTP
- **Express Validator** - Validation des données

## 🔒 Sécurité

- **Helmet** : Protection contre les vulnérabilités HTTP courantes
- **CORS** : Configuration des origines autorisées
- **TypeScript strict** : Typage fort pour éviter les erreurs

## 📝 Endpoints

### Health Check
- `GET /health` - Vérifie l'état de l'API (retourne 200 OK)

## ⚙️ Configuration

Le serveur démarre sur le port défini dans `PORT` (par défaut 3000).

Variables d'environnement (à créer dans `.env`) :
```
PORT=3000
NODE_ENV=development
OMDB_API_KEY=your_omdb_api_key
OMDB_CACHE_TTL_MS=3600000
OMDB_CACHE_MAX_ENTRIES=500
```

