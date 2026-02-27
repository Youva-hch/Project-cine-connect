# CinéConnect — Journal des modifications

## Refonte complète du frontend (design dark violet + fonctionnalités)

---

### Design & UI

#### Thème sombre permanent (noir + violet)
- Suppression du mode clair — le site est désormais entièrement en dark mode
- Nouvelle palette CSS dans `apps/frontend/src/index.css` :
  - `--background: 240 18% 4%` → noir quasi-pur
  - `--primary: 265 78% 62%` → violet vibrant (#8b5cf6)
  - `--accent: 38 92% 55%` → or/ambre pour les étoiles (#f59e0b)
- Scrollbar personnalisée violette
- Animations : `fade-in`, `shimmer` pour les skeletons

#### Page d'accueil (`apps/frontend/src/pages/Index.tsx`)
- Hero section avec film mis en avant, badge "★ Film mis en avant"
- Boutons "Noter ce film" (violet) et "Rejoindre la discussion" (verre flou)
- Barre de stats : 10 000+ films, 5 000+ discussions, 2 500+ membres
- Rangées de films sans emojis dans les titres de section

#### FilmCard (`apps/frontend/src/components/FilmCard.tsx`)
- Icônes adaptées au site de notation : **Étoile** (noter) + **MessageCircle** (avis)
- Glow violet au hover : `box-shadow: 0 0 20px rgba(139,92,246,0.4)`
- **Placeholder visuel** pour les films sans affiche :
  - Dégradé unique généré à partir du titre (8 dégradés prédéfinis)
  - Initiales du titre affichées au centre
  - Fallback `onError` si l'URL de l'affiche est cassée

#### FilmRow (`apps/frontend/src/components/FilmRow.tsx`)
- Flèches de scroll en violet explicite `hsl(265,78%,72%)` (plus invisibles sur fond sombre)
- Titres de section en blanc `rgba(255,255,255,0.9)` explicite
- Fond des flèches en `rgba(7,7,16,0.95)` au lieu de la classe Tailwind qui rendait noir

#### Navbar (`apps/frontend/src/components/Navbar.tsx`)
- Logo "CinéConnect" en gradient violet → or via CSS `background-clip: text`
- Indicateur de lien actif : barre gradient violet/or en bas du lien
- Sur scroll : fond `rgba(7,7,16,0.96)` + `backdrop-blur(16px)`
- Avatar de l'utilisateur connecté : bouton rond avec initiales sur fond violet

---

### Authentification

#### Page de connexion (`apps/frontend/src/pages/Auth.tsx`)
- Redesign complet avec thème sombre, glow ambiant violet, card verre flou
- Vrai SVG Google (4 couleurs officielles) pour le bouton "Continuer avec Google"
- Toggle afficher/masquer le mot de passe (icône Eye/EyeOff)
- Affichage erreur OAuth en rouge si le paramètre `?error=auth_failed` est présent
- Spinner de chargement inline pendant la soumission

#### AuthCallback (`apps/frontend/src/pages/AuthCallback.tsx`)
- **Bug fix** : `navigate("/", { replace: true })` remplacé par `window.location.replace("/")`
  - Raison : React Router ne forçait pas le re-mount de `AuthProvider`, l'utilisateur semblait déconnecté
  - Le reload complet force la relecture du `localStorage`

#### Backend auth (`apps/backend/src/controllers/auth.controller.ts`)
- **Bug fix** : `redirectLoginError` redirigait vers `/login` (route inexistante dans le router)
- Corrigé en `/auth` qui est la vraie route de la page de connexion

---

### Page Profil (`apps/frontend/src/pages/Profile.tsx`)

Page entièrement refaite avec :
- **Avatar** : photo Google si disponible, sinon initiales sur fond dégradé violet
- **Édition inline** : bouton "Modifier" → formulaire nom + bio → PATCH `/users/me`
  - Mise à jour du `localStorage` après succès pour éviter un flash déconnecté
- **Date d'inscription** : récupérée via `GET /api/auth/me`
- **Statistiques** : grille 3 colonnes (films notés, avis postés, films vus)
- **Mes avis** : section avec empty state + lien vers `/films`
- **Mes discussions** : section avec empty state + lien vers `/discussion`
- **Bouton déconnexion** en rouge en bas de page

---

### Films

#### Catalogue étendu (`apps/frontend/src/pages/Films.tsx`)
- `POPULAR_SEARCHES` étendu de **15 à 65 requêtes OMDB**
- Ajout : Inception, Interstellar, The Godfather, Parasite, Joker, Dune, Oppenheimer, Rocky, The Dark Knight, Pulp Fiction, Forrest Gump, The Matrix, Schindler's List, et bien d'autres
- Déduplication par `imdbID` maintenue pour éviter les doublons

---

### Infrastructure

#### Docker & Migrations
- Base de données PostgreSQL via Docker Compose (`docker-compose.dev.yml`)
- Migrations Drizzle ORM : `pnpm db:migrate`
- Démarrage : `docker-compose -f docker-compose.dev.yml up -d && pnpm db:migrate`

---

### Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styles | Tailwind CSS + shadcn/ui + variables CSS HSL |
| State | React Query (TanStack Query) |
| Routing | React Router DOM |
| Backend | Express.js + TypeScript |
| Auth | JWT + Google OAuth2 (Passport.js) |
| BDD | PostgreSQL + Drizzle ORM |
| API Films | OMDB API |
| Monorepo | pnpm workspaces |
| Containers | Docker + Docker Compose |
