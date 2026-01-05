# Frontend - CinéConnect

Application React avec Vite, TypeScript, TanStack Router, TanStack Query et TailwindCSS.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm dev

# Build de production
pnpm build

# Vérifier les types TypeScript
pnpm type-check

# Linter
pnpm lint
```

## 📁 Structure du projet

```
src/
├── components/     # Composants réutilisables
├── pages/         # Pages de l'application
├── hooks/         # Hooks React personnalisés
├── api/           # Appels API et services
├── utils/         # Fonctions utilitaires
└── routes/        # Routes TanStack Router
```

## 🛠️ Technologies

- **React 19** - Bibliothèque UI
- **Vite** - Build tool et dev server
- **TypeScript** - Typage statique (mode strict)
- **TanStack Router** - Routing type-safe
- **TanStack Query** - Gestion d'état serveur
- **TailwindCSS** - Framework CSS utility-first

## 📝 Configuration

### TypeScript

Configuration stricte activée dans `tsconfig.app.json` :
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- Et plus...

### Path Aliases

Utilisez `@/` pour importer depuis `src/` :

```typescript
import { TestComponent } from '@/components/TestComponent'
```

### TanStack Router

Les routes sont définies dans `src/routes/` et générées automatiquement dans `routeTree.gen.ts`.

### TanStack Query

Le client Query est configuré dans `main.tsx` avec des options par défaut.

## 🎨 TailwindCSS

TailwindCSS est configuré et prêt à l'emploi. Utilisez les classes utilitaires directement dans vos composants.

## ✅ Composant de test

Le composant `TestComponent` dans la page d'accueil vérifie que :
- ✅ React + Vite fonctionne
- ✅ TanStack Query fonctionne
- ✅ TanStack Router fonctionne
- ✅ TailwindCSS est appliqué
- ✅ TypeScript est configuré en mode strict
