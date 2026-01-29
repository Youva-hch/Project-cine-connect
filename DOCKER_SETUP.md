# 🐳 Guide Docker pour CinéConnect

## 📦 Configuration Docker

Le projet inclut une configuration Docker complète avec :
- **PostgreSQL** : Base de données
- **Backend** : API Node.js/Express
- **Frontend** : Application React avec Nginx

## 🚀 Démarrage rapide

### Mode développement (uniquement PostgreSQL)

```bash
# Démarrer uniquement PostgreSQL pour le développement local
pnpm docker:dev

# Ou manuellement
docker-compose -f docker-compose.dev.yml up -d
```

### Mode production (tous les services)

```bash
# Construire et démarrer tous les services
pnpm docker:build
pnpm docker:up

# Ou manuellement
docker-compose build
docker-compose up -d
```

## 📋 Commandes disponibles

```bash
# Démarrer les services
pnpm docker:up

# Arrêter les services
pnpm docker:down

# Construire les images
pnpm docker:build

# Voir les logs
pnpm docker:logs

# Mode développement (uniquement PostgreSQL)
pnpm docker:dev
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine avec :

```env
# Base de données (géré par docker-compose)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cineconnect_dev

# OMDb API
OMDB_API_KEY=votre_cle_api_omdb

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# JWT Secret
JWT_SECRET=votre_secret_jwt_changez_en_production
```

## 🗄️ Base de données

### Vérifier que Docker est démarré

```bash
# Vérifier que le conteneur PostgreSQL est en cours d'exécution
docker ps

# Si ce n'est pas le cas, démarrer Docker Compose
pnpm docker:up
```

## 2. Vérifier la connexion à la base de données

```bash
# Tester la connexion (depuis le package database)
cd packages/database
pnpm migrate
```

Si les migrations sont déjà appliquées, vous verrez un message de succès.

## 3. Vérifier les films dans la base

### Option 1 : Via Drizzle Studio (Interface graphique)

```bash
pnpm db:studio
```

Ouvrez http://localhost:4983 dans votre navigateur et vérifiez la table `films`.

### Option 2 : Via psql (ligne de commande)

```bash
# Se connecter à PostgreSQL
docker exec -it cineconnect-db psql -U postgres -d cineconnect_dev

# Compter les films
SELECT COUNT(*) FROM films;

# Voir quelques films
SELECT id, title, release_year, rating_average FROM films LIMIT 10;

# Quitter
\q
```

## 🛠️ Commandes utiles

### Base de données

```bash
# Démarrer uniquement PostgreSQL
pnpm docker:dev

# Arrêter PostgreSQL
docker-compose -f docker-compose.dev.yml down

# Voir les logs PostgreSQL
docker-compose logs -f postgres

# Redémarrer la base de données (⚠️ supprime les données)
docker-compose down -v
docker-compose up -d
```

### Tous les services

```bash
# Démarrer tous les services (backend + frontend + postgres)
pnpm docker:up

# Arrêter tous les services
pnpm docker:down

# Reconstruire les images
pnpm docker:build

# Voir les logs de tous les services
pnpm docker:logs

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Accès aux services

- **Frontend** : http://localhost (port 80)
- **Backend API** : http://localhost:3000
- **PostgreSQL** : localhost:5432

## 5. Si vous devez réappliquer les migrations

```bash
# Générer les migrations (si le schéma a changé)
pnpm db:generate

# Appliquer les migrations
pnpm db:migrate
```

## 6. Réinitialiser complètement (⚠️ supprime toutes les données)

```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer
docker-compose up -d

# Réappliquer les migrations
pnpm db:migrate

# Réinsérer les données de base
pnpm db:seed

# Réinsérer les 150 films depuis OMDb
cd apps/backend
pnpm seed:omdb
```

## 📊 État actuel

Après avoir exécuté `pnpm seed:omdb`, vous devriez avoir :
- ✅ 150 films dans la table `films`
- ✅ Des catégories créées automatiquement
- ✅ Des associations films-catégories dans `film_categories`

## 🔍 Vérification rapide

Pour vérifier rapidement que tout fonctionne :

```bash
# 1. Vérifier Docker
docker ps | grep cineconnect-db

# 2. Vérifier les films (via l'API backend)
curl http://localhost:3000/films | jq '.data | length'

# Ou depuis le navigateur
# http://localhost:3000/films
```


