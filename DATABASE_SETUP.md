# 🗄️ Configuration de la Base de Données

Guide de configuration PostgreSQL et Drizzle ORM pour CinéConnect.

## 📋 Prérequis

- Docker et Docker Compose (pour PostgreSQL)
- Node.js >= 18
- pnpm >= 8

## 🚀 Démarrage rapide

### 1. Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d
```

Cela démarre PostgreSQL sur le port `5432` avec :
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `cineconnect_dev`

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cineconnect_dev
```

Ou utilisez une URL de connexion complète :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cineconnect_dev
```

### 3. Installer les dépendances

```bash
pnpm install
```

### 4. Générer la première migration

Après avoir défini votre schéma dans `packages/database/src/schema.ts` :

```bash
pnpm db:generate
```

### 5. Appliquer les migrations

```bash
pnpm db:migrate
```

### 6. (Optionnel) Remplir avec des données initiales

```bash
pnpm db:seed
```

## 📝 Scripts disponibles

| Script | Description |
|--------|-------------|
| `pnpm db:generate` | Génère les fichiers de migration à partir du schéma |
| `pnpm db:migrate` | Applique les migrations à la base de données |
| `pnpm db:seed` | Remplit la base de données avec des données initiales |
| `pnpm db:studio` | Ouvre Drizzle Studio (interface graphique) |

## 🔧 Utilisation dans le code

```typescript
import { db, users } from '@cineconnect/database';

// Exemple de requête
const allUsers = await db.select().from(users);
```

## 📁 Structure

```
packages/database/
├── src/
│   ├── index.ts        # Export principal (db, schema)
│   ├── schema.ts       # Définition des tables
│   ├── migrate.ts      # Script de migration
│   ├── seed.ts         # Script de seed
│   └── migrations/     # Fichiers de migration générés
├── drizzle.config.ts   # Configuration Drizzle Kit
└── README.md
```

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Vérifiez que PostgreSQL est démarré : `docker ps`
2. Testez la connexion : `pnpm db:studio` (ouvre l'interface graphique)
3. Vérifiez les migrations : `pnpm db:migrate` (ne devrait rien faire si déjà appliquées)

## 🛑 Arrêter PostgreSQL

```bash
docker-compose down
```

Pour supprimer aussi les données :

```bash
docker-compose down -v
```


