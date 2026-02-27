import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext'
import { useFilms } from '@/hooks/useFilms'
import { useState, useEffect } from 'react'
import { getFilmByTitle } from '@/api/omdb'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// Hook pour récupérer l'affiche depuis OMDb si elle manque
function usePosterUrl(film: { title: string; releaseYear: number | null; posterUrl: string | null }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(film.posterUrl)

  useEffect(() => {
    // Si l'affiche existe et est valide, l'utiliser
    if (film.posterUrl && film.posterUrl !== 'N/A' && film.posterUrl !== '') {
      setPosterUrl(film.posterUrl)
      return
    }

    // Sinon, chercher dans OMDb
    const fetchPoster = async () => {
      try {
        const omdbData = await getFilmByTitle(film.title, film.releaseYear || undefined)
        if (omdbData.Poster && omdbData.Poster !== 'N/A' && omdbData.Poster !== '') {
          setPosterUrl(omdbData.Poster)
        }
      } catch (error) {
        // Ignorer les erreurs silencieusement
        console.debug(`Impossible de récupérer l'affiche pour ${film.title}`)
      }
    }

    fetchPoster()
  }, [film.title, film.releaseYear, film.posterUrl])

  return posterUrl
}

// Composant pour afficher une carte de film avec récupération automatique de l'affiche
function FilmCard({ film }: { film: { id: number; title: string; releaseYear: number | null; ratingAverage: number | string; posterUrl: string | null } }) {
  const posterUrl = usePosterUrl(film)

  return (
    <Link
      to="/film/$id"
      params={{ id: film.id.toString() }}
      className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-border block"
    >
      <div className="aspect-[2/3] bg-muted overflow-hidden relative">
        {posterUrl && posterUrl !== 'N/A' ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm ${posterUrl && posterUrl !== 'N/A' ? 'hidden' : ''}`}>
          <svg className="w-12 h-12 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p className="text-xs text-center px-2 font-medium">{film.title}</p>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-foreground mb-1 truncate">{film.title}</h4>
        <p className="text-sm text-muted-foreground mb-2">{film.releaseYear || 'N/A'}</p>
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-sm font-medium text-foreground">
            {Number(film.ratingAverage ?? 0).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function HomePage() {
  const { user, isLoading } = useAuth()
  const { data: filmsResponse, isLoading: filmsLoading, isError: filmsError, error: filmsErrorObj } = useFilms({ limit: 50 })
  const allFilms = filmsResponse?.data ?? []
  const filmsErrorMessage = filmsErrorObj instanceof Error ? filmsErrorObj.message : null

  // Trier les films par note moyenne (décroissant) et prendre les 4 premiers
  const popularFilms = [...allFilms]
    .sort((a, b) => {
      const ratingA = Number(a.ratingAverage) || 0
      const ratingB = Number(b.ratingAverage) || 0
      return ratingB - ratingA
    })
    .slice(0, 4)

  return (
    <div className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-foreground mb-4">
            Bienvenue sur <span className="text-primary">CinéConnect</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez, notez et partagez vos films préférés avec une communauté de passionnés de cinéma
          </p>
          <div className="flex justify-center gap-4">
            {!isLoading && !user && (
              <Link
                to="/register"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Créer un compte
              </Link>
            )}
            <Link
              to="/films"
              className="px-6 py-3 bg-card text-foreground border-2 border-primary rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Explorer les films
            </Link>
            <Link
              to="/search"
              search={{ q: '', page: 1 }}
              className="px-6 py-3 bg-card text-foreground border-2 border-primary rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Rechercher
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Catalogue Complet</h3>
            <p className="text-muted-foreground">
              Explorez une vaste collection de films avec des détails complets
            </p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Notez et Commentez</h3>
            <p className="text-muted-foreground">
              Partagez vos avis et découvrez ce que pensent les autres
            </p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Réseau Social</h3>
            <p className="text-muted-foreground">
              Connectez-vous avec d'autres cinéphiles et discutez en temps réel
            </p>
          </div>
        </div>

        {/* Popular Films Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Films Populaires</h2>
          {filmsError && filmsErrorMessage ? (
            <div className="text-center py-12 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive font-medium">{filmsErrorMessage}</p>
              <p className="text-sm text-muted-foreground mt-2">À la racine du projet, lancez : pnpm db:migrate (avec la base démarrée)</p>
            </div>
          ) : filmsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des films...</p>
            </div>
          ) : popularFilms.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {popularFilms.map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>
              <div className="text-center mt-6">
                <Link
                  to="/films"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Voir tous les films →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun film disponible pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
