# @cineconnect/database

Package de gestion de la base de données avec Drizzle ORM et PostgreSQL.

## 📦 Installation

Les dépendances sont installées automatiquement via le workspace pnpm :

```bash
pnpm install
```

## 🚀 Utilisation

### Connexion à la base de données

```typescript
import { db } from '@cineconnect/database';

// Utiliser db pour vos requêtes
const users = await db.select().from(users);
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cineconnect_dev

# Ou utilisez DATABASE_URL directement
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cineconnect_dev
```

## 🔄 Migrations

### Générer une migration

Après avoir modifié le schéma dans `src/schema.ts` :

```bash
pnpm db:generate
```

### Appliquer les migrations

```bash
pnpm db:migrate
```

## 🌱 Seed (Données initiales)

Pour remplir la base de données avec des données initiales :

```bash
pnpm db:seed
```

Modifiez `src/seed.ts` pour ajouter vos données de seed.

## 🎨 Drizzle Studio

Interface graphique pour visualiser et gérer la base de données :

```bash
pnpm db:studio
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
└── package.json
```

## 📝 Définir un schéma

Modifiez `src/schema.ts` pour ajouter vos tables :

```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```


