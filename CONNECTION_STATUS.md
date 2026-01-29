# État de la connexion Frontend ↔ Backend

## ✅ Configuration actuelle

### Backend
- **Port**: 3000 (par défaut)
- **URL**: `http://localhost:3000`
- **CORS**: Configuré pour accepter `http://localhost:5173`
- **Health Check**: `GET /health`

### Frontend
- **Port**: 5173 (Vite)
- **URL API**: `http://localhost:3000` (par défaut)
- **Variable d'environnement**: `VITE_API_URL` (optionnelle)

## 📡 Endpoints vérifiés

### Authentification
- ✅ `POST /api/auth/login` - Connexion
- ✅ `POST /api/auth/register` - Inscription
- ✅ `GET /api/auth/me` - Utilisateur actuel
- ✅ `GET /api/auth/google` - Authentification Google

### Films
- ✅ `GET /films` - Liste des films
- ✅ `GET /films/:id` - Détails d'un film
- ✅ `GET /films/category/:slug` - Films par catégorie

### Utilisateurs
- ✅ `GET /users` - Liste des utilisateurs
- ✅ `GET /users/:id` - Détails d'un utilisateur
- ✅ `PATCH /users/me` - Mettre à jour le profil

### OMDb
- ✅ `GET /omdb/search` - Recherche OMDb
- ✅ `GET /omdb/movie/:imdbId` - Film par ID IMDb
- ✅ `POST /omdb/sync` - Synchroniser les films

### Catégories
- ✅ `GET /categories` - Liste des catégories

## 🔍 Test de connexion

Un test automatique de connexion a été ajouté dans `__root.tsx` qui :
1. Vérifie l'endpoint `/health` au chargement
2. Affiche une alerte si la connexion échoue
3. Permet de réessayer manuellement

## ⚙️ Configuration requise

### Variables d'environnement Backend (optionnelles)
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Variables d'environnement Frontend (optionnelles)
```env
VITE_API_URL=http://localhost:3000
```

Si `VITE_API_URL` n'est pas définie, le frontend utilise `http://localhost:3000` par défaut.

## 🧪 Comment tester manuellement

1. **Vérifier que le backend tourne** :
   ```bash
   curl http://localhost:3000/health
   ```
   Devrait retourner : `{"status":"OK","message":"API is healthy",...}`

2. **Vérifier depuis le frontend** :
   - Ouvrir la console du navigateur (F12)
   - Vous devriez voir : `✅ Connexion au backend OK`
   - Si erreur, une bannière rouge apparaîtra en haut de la page

3. **Tester un appel API** :
   - Aller sur `/films`
   - Les films devraient se charger depuis la base de données
   - Si vide, cliquer sur "Synchroniser depuis OMDb"

## 🐛 Problèmes courants

### Backend non accessible
- Vérifier que le backend tourne : `pnpm dev` dans le workspace
- Vérifier le port : doit être 3000 par défaut
- Vérifier les logs du backend pour les erreurs

### Erreur CORS
- Vérifier que `FRONTEND_URL` dans le backend correspond à l'URL du frontend
- Par défaut : `http://localhost:5173`

### Erreur 404
- Vérifier que les routes sont bien montées dans `apps/backend/src/index.ts`
- Vérifier que les endpoints utilisés correspondent aux routes définies

## 📝 Notes

- Tous les appels API utilisent le format `{ success: boolean, data: ... }`
- Les erreurs retournent `{ success: false, message: ... }`
- Le token d'authentification est envoyé dans le header `Authorization: Bearer <token>`

