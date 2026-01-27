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
import { db, users } from '@cineconnect/database';

// Utiliser db pour vos requêtes
const allUsers = await db.select().from(users);
```

### Types TypeScript

Tous les types TypeScript sont automatiquement générés à partir des schémas :

```typescript
import type { 
  User, 
  NewUser,
  Film,
  NewFilm,
  Category,
  NewCategory,
  Review,
  NewReview,
  Message,
  NewMessage,
  Friend,
  NewFriend,
  FilmCategory,
  NewFilmCategory
} from '@cineconnect/database';

// Exemple d'utilisation
const newUser: NewUser = {
  email: 'user@example.com',
  name: 'John Doe',
  passwordHash: 'hashed_password',
};

const user: User = await db.insert(users).values(newUser).returning();
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
│   ├── index.ts        # Export principal (db, schema, types)
│   ├── schema.ts       # Définition des tables et types TypeScript
│   ├── migrate.ts      # Script de migration
│   ├── seed.ts         # Script de seed
│   └── migrations/     # Fichiers de migration générés
├── drizzle.config.ts   # Configuration Drizzle Kit
└── package.json
```

## 🔗 Relations

Les relations entre tables sont définies dans `src/schema.ts` et peuvent être utilisées avec les requêtes Drizzle :

```typescript
import { db, users, reviews } from '@cineconnect/database';

// Requête avec relations
const userWithReviews = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    reviews: true,
  },
});
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


