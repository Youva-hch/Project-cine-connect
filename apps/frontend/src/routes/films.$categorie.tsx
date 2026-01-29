import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useFilmsByCategory } from '@/hooks/useFilms'

export const Route = createFileRoute('/films/$categorie')({
  component: FilmsByCategory,
})

function FilmsByCategory() {
  const { categorie } = Route.useParams()
  const [search, setSearch] = useState('')

  // Mapping des slugs vers les noms de catégories
  const categoryNames: Record<string, string> = {
    action: 'Action',
    comedie: 'Comédie',
    drame: 'Drame',
    'science-fiction': 'Science-Fiction',
    thriller: 'Thriller',
    horreur: 'Horreur',
  }

  const categoryName = categoryNames[categorie] || categorie

  const { data: films = [], isLoading } = useFilmsByCategory(categorie)

  const filteredFilms = films.filter((film) => {
    if (!search) return true
    return film.title.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Films - {categoryName}
          </h1>
          <p className="text-gray-600 mb-6">
            Découvrez notre sélection de films {categoryName.toLowerCase()}
          </p>
          
          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher un film..."
              className="w-full max-w-md px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grille de films */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des films...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map((film) => (
              <Link
                key={film.id}
                to="/film/$id"
                params={{ id: film.id.toString() }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer block"
              >
              <div className="aspect-[2/3] bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden relative">
                {film.posterUrl && film.posterUrl !== 'N/A' ? (
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex flex-col items-center justify-center text-gray-600 ${film.posterUrl && film.posterUrl !== 'N/A' ? 'hidden' : ''}`}>
                  <svg className="w-16 h-16 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <p className="text-xs text-center px-2 font-medium">{film.title}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{film.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {film.director || 'Réalisateur inconnu'} • {film.releaseYear || 'N/A'}
                </p>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-sm font-medium text-gray-700">
                    {Number(film.ratingAverage).toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}

        {filteredFilms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun film trouvé dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}
