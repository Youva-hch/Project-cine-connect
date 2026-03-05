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

## Système de notation et avis (28/02/2026)

---

### Base de données

#### Migration `0004_imdb_id`
- Ajout colonne `imdb_id TEXT UNIQUE` sur la table `films`
- Permet de lier les films OMDB (identifiés par leur imdbID) aux films stockés en BDD
- Mise à jour du schéma Drizzle (`packages/database/src/schema.ts`)

---

### Backend — Reviews CRUD

#### Nouveaux endpoints
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/films/omdb-sync` | Non | Upsert un film OMDB en BDD (crée si absent, retourne l'existant sinon) |
| `GET` | `/api/films/by-imdb/:imdbId/reviews` | Non | Liste des avis d'un film via son imdbID |
| `GET` | `/api/films/:id/reviews` | Non | Liste des avis avec infos utilisateur (nom, avatar) |
| `POST` | `/api/films/:id/reviews` | Oui | Créer un avis (note 1-5, commentaire optionnel) |
| `PATCH` | `/api/reviews/:id` | Oui | Modifier son propre avis |
| `DELETE` | `/api/reviews/:id` | Oui | Supprimer son propre avis |

#### Règles métier
- **1 avis max par utilisateur par film** : contrainte `UNIQUE(userId, filmId)` en base
- **Note moyenne automatique** : recalculée après chaque create/update/delete
- **Propriété** : vérification `userId === existing.userId` → 403 si non auteur
- **Tri** : avis triés par date décroissante

#### Nouveaux fichiers
- `apps/backend/src/controllers/review.controller.ts` — PATCH + DELETE review
- `apps/backend/src/routes/review.routes.ts` — routes `/api/reviews/:id`

---

### Frontend — Notation et avis

#### Composant ReviewModal (`apps/frontend/src/components/ReviewModal.tsx`)
- Modal avec 5 étoiles interactives (hover + sélection)
- Label contextuel selon la note : "Mauvais", "Moyen", "Bien", "Très bien", "Excellent"
- Zone de commentaire optionnelle
- Spinner de chargement pendant l'envoi
- Appelle `/api/films/omdb-sync` pour créer le film en BDD si besoin, puis poste l'avis

#### Page FilmDetail (`apps/frontend/src/pages/FilmDetail.tsx`)
- Section avis complète avec :
  - Badge note moyenne (sur 5) calculée en temps réel
  - **Ma note** encadrée en violet avec bouton modifier ✏️ et supprimer 🗑️
  - Formulaire d'édition inline (étoiles + textarea, sans rechargement)
  - Liste des avis des autres utilisateurs (avatar, nom, date, étoiles, commentaire)
  - Empty state si aucun avis
  - Lien "Se connecter →" si non connecté

#### FilmCard (`apps/frontend/src/components/FilmCard.tsx`)
- Bouton **"Noter"** → ouvre le ReviewModal directement depuis la card
- Bouton **"Avis"** → navigue vers `/film/:imdbId` (section avis)
- Composant retourne un Fragment `<>` pour inclure le modal sans wrapper DOM

#### FilmRow (`apps/frontend/src/components/FilmRow.tsx`)
- Déduplication des films par `imdbID` via `Map` avant le render
- Évite les warnings React "duplicate key" quand OMDB retourne le même film plusieurs fois

#### Hero film fixe (`apps/frontend/src/pages/Index.tsx`)
- Film d'accueil fixé sur **Dune: Deuxième Partie** (imdbID `tt15239678`)
- Fetch direct par ID via `getMovieById` au lieu du premier résultat aléatoire
- Affiche : année, durée, note IMDb, synopsis officiel

---

### Bug fixes

| Fichier | Bug | Fix |
|---------|-----|-----|
| `auth.api.ts` | Import default inexistant sur `config.ts` | `import apiRequest from` → `import { apiRequest } from` |
| `ReviewModal.tsx` | `useAuth` importé depuis le mauvais contexte → crash silencieux + films vides | Import depuis `@/hooks/useAuth` |
| `FilmDetail.tsx` | Même problème + comparaison `userId` number vs string | Import corrigé + `String(r.user.id) === user.id` |
| `ReviewModal.tsx` | Token lu au render (closure périmée) → 401 systematique | Token lu **dans** `mutationFn` à l'exécution |
| `FilmDetail.tsx` | Idem pour delete et patch review | Token lu dans chaque `mutationFn` |

---

---

## Système d'amis, notifications et messagerie temps réel (02/03/2026)

---

### Base de données

#### Migration `0005_notifications`
- Nouvelle table `notifications` : `id`, `userId` (FK cascade), `type` (text : `friend_request` | `friend_accepted` | `message`), `relatedUserId` (FK nullable), `message` (text), `isRead` (boolean default false), `createdAt`
- Ajout des relations dans `packages/database/src/schema.ts`
- La table `friends` (status : `pending` / `accepted` / `rejected`) existait déjà

---

### Backend

#### Nouveau service `friend.service.ts`
| Méthode | Description |
|---------|-------------|
| `sendFriendRequest(senderId, targetId)` | Vérifie qu'il n'y a pas déjà une relation, insert + crée une notification `friend_request` |
| `acceptRequest(friendshipId, userId)` | Passe le status à `accepted` + crée une notification `friend_accepted` pour l'expéditeur |
| `rejectRequest(friendshipId, userId)` | Passe le status à `rejected` |
| `listFriends(userId)` | Requête bidirectionnelle (OR sur userId/friendId), status `accepted` |
| `listReceivedRequests(userId)` | Demandes reçues en attente |
| `listSentRequests(userId)` | Demandes envoyées en attente |
| `removeFriend(userId, friendId)` | Suppression bidirectionnelle |
| `getFriendshipStatus(userA, userB)` | Retourne le statut ou null — utilisé par Socket.io pour sécuriser les messages |

#### Nouveau service `notification.service.ts`
- `createNotification` / `listNotifications` (LEFT JOIN users, ORDER BY date DESC, LIMIT 50) / `getUnreadCount` / `markAsRead` / `markAllAsRead`

#### Nouveau service `message.service.ts`
- `saveMessage(senderId, receiverId, content)` — insert + JOIN users pour retourner les infos expéditeur
- `getConversation(userA, userB)` — OR clause bidirectionnel, ORDER BY `createdAt` ASC, LIMIT 100
- `markConversationAsRead(receiverId, senderId)`

#### Nouveaux endpoints amis
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/friends/request/:targetId` | Envoyer une demande d'ami |
| `GET` | `/api/friends/requests` | Demandes reçues |
| `GET` | `/api/friends/sent` | Demandes envoyées |
| `PATCH` | `/api/friends/requests/:id/accept` | Accepter |
| `PATCH` | `/api/friends/requests/:id/reject` | Refuser |
| `GET` | `/api/friends` | Liste des amis |
| `DELETE` | `/api/friends/:friendId` | Supprimer un ami |
| `GET` | `/api/friends/status/:targetId` | Statut de la relation |
| `GET` | `/api/friends/search?q=` | Recherche d'utilisateurs |

#### Nouveaux endpoints notifications
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/notifications` | Liste des notifications |
| `GET` | `/api/notifications/count` | Nombre de non lues |
| `PATCH` | `/api/notifications/read-all` | Tout marquer comme lu |
| `PATCH` | `/api/notifications/:id/read` | Marquer une notif comme lue |

#### Nouvel endpoint messages
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/messages/:friendId` | Historique de la conversation (vérifie l'amitié) |

#### Socket.io — Messagerie temps réel
- `apps/backend/src/index.ts` entièrement réécrit avec `http.createServer` + `new Server(httpServer)`
- Middleware d'authentification : lit `socket.handshake.auth.token`, vérifie le JWT
- `onlineUsers` : Map `userId → socketId` pour cibler les messages
- Événement `sendMessage` : vérifie l'amitié via `FriendService.getFriendshipStatus`, persiste le message en BDD, émet `receiveMessage` à l'expéditeur ET au destinataire (si en ligne)
- Log : `⚡ Socket.io actif` au démarrage

---

### Frontend

#### Composant `NotificationBell.tsx`
- Icône cloche dans la Navbar avec badge rouge (nombre de non lues, masqué si 0)
- Dropdown panel avec liste des notifications (icône selon le type : `UserPlus` / `UserCheck` / `MessageSquare`)
- Polling toutes les 30 secondes via `refetchInterval`
- Mutations `markRead` et `markAllRead`
- Fermeture au clic extérieur via `useRef` + `document.addEventListener`
- Visible uniquement si un token est présent en localStorage

#### Page `Friends.tsx` (`/amis`)
3 onglets :
1. **Mes amis** — liste avec bouton message (→ `/discussion?with=ID`) et bouton supprimer
2. **Demandes** — accepter / refuser les demandes reçues
3. **Ajouter** — recherche par nom ou email (min 2 caractères), désactive le bouton si déjà ami ou demande en cours

#### Page `Discussion.tsx` (`/discussion`)
Interface de messagerie complète :
- **Sidebar gauche** (300px) : liste de toutes les conversations (amis), lien actif surligné en violet
- **Zone droite** : chat temps réel avec l'ami sélectionné
- URL avec paramètre `?with=ID` pour ouvrir directement une conversation depuis `/amis`
- Chargement de l'historique via `GET /api/messages/:friendId` à chaque changement de conversation
- Connexion Socket.io avec token JWT, singleton pour éviter les connexions multiples
- Déduplication des messages par `id` pour éviter les doublons
- Scroll automatique vers le bas à chaque nouveau message
- Responsive : sur mobile, bascule entre la liste et le chat avec bouton retour
- Bulles de chat : droite en gradient violet (mes messages), gauche en blanc translucide (autres)

#### Films.tsx — Système de genres et recherche
- 10 tags de genre cliquables : Action, Comédie, Horreur, Drame, Sci-Fi, Thriller, Animation, Aventure, Crime, Romance
- Chaque genre a ses propres requêtes OMDB prédéfinies
- `Promise.allSettled` pour tolérer les erreurs partielles OMDB sans bloquer toute la liste
- Filtre local en temps réel via `useMemo` sur la barre de recherche
- Sous-titre dynamique : "Chargement des films..." pendant le fetch, sinon count

#### Index.tsx — Hero film rotatif
- Liste `HERO_FILMS` de 15 imdbIDs (Dune Part Two, Oppenheimer, The Batman, Top Gun Maverick, etc.)
- `useState` avec initialiseur lazy : `Math.random()` exécuté une seule fois au mount
- Film différent à chaque rechargement de page

---

### Bug fixes du jour

| Fichier | Bug | Fix |
|---------|-----|-----|
| `omdb.controller.ts` | `"Movie not found!"` OMDB faisait planter toute la liste | Catch spécifique → retourner `{ Search: [], totalResults: '0' }` |
| `friend.routes.ts` | `export const friendRouter = Router()` → erreur TS2742 | Typage explicite `IRouter` : `export const friendRouter: IRouter = Router()` |
| `socket.io` (pnpm) | `ERR_MODULE_NOT_FOUND` malgré socket.io déclaré en dépendance | Conflit store pnpm v3/v10 → `pnpm install` forcé depuis le bon store |

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
