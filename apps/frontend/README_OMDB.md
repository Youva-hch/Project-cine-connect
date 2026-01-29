# Configuration OMDb API

## Obtenir une clé API OMDb

1. Visitez [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
2. Choisissez le plan gratuit (Free tier - 1000 requêtes/jour)
3. Entrez votre email et validez
4. Vérifiez votre boîte mail et confirmez votre inscription
5. Copiez votre clé API

## Configuration

1. Créez un fichier `.env` à la racine du dossier `apps/frontend/` :
   ```bash
   cd apps/frontend
   touch .env
   ```

2. Ajoutez votre clé API dans le fichier `.env` :
   ```
   VITE_OMDB_API_KEY=votre_cle_api_ici
   VITE_API_URL=http://localhost:3000
   ```

3. Redémarrez le serveur de développement :
   ```bash
   pnpm dev
   ```

**Note importante** : Les variables d'environnement doivent commencer par `VITE_` pour être accessibles dans le code frontend.

## Utilisation

### Recherche de films

```tsx
import { useOmdbSearch } from '@/hooks/useOmdb'

function FilmSearch() {
  const { data, isLoading, error } = useOmdbSearch('Inception', {
    type: 'movie',
    year: 2010,
  })

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <div>
      {data?.Search.map((movie) => (
        <div key={movie.imdbID}>{movie.Title}</div>
      ))}
    </div>
  )
}
```

### Détails d'un film

```tsx
import { useOmdbMovieByImdbId } from '@/hooks/useOmdb'

function FilmDetails({ imdbId }: { imdbId: string }) {
  const { data, isLoading, error } = useOmdbMovieByImdbId(imdbId)

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <div>
      <h1>{data?.Title}</h1>
      <p>{data?.Plot}</p>
    </div>
  )
}
```

## Limites

- **Plan gratuit** : 1000 requêtes/jour
- Les données sont mises en cache pendant 1 heure (recherche) ou 24 heures (détails)
- Les erreurs sont automatiquement gérées par TanStack Query

## Documentation OMDb

- [Documentation officielle](http://www.omdbapi.com/)
- [Exemples d'utilisation](http://www.omdbapi.com/#usage)

