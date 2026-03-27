import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useFilms, useCategories } from '@/hooks/useFilms'

export const Route = createFileRoute('/films')({
  component: Films,
})

function Films() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { data: filmsResponse, isLoading: filmsLoading, isError: filmsError, error: filmsErrorObj } = useFilms({
    search: search || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    limit: 200,
  })
  const films = filmsResponse?.data ?? []
  const filmsErrorMessage = filmsErrorObj instanceof Error ? filmsErrorObj.message : null
  const { data: categories = [] } = useCategories()

  const filteredFilms = films.filter((film) => {
    if (!search) return true
    return film.title.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Catalogue de Films</h1>
            {!filmsLoading && (
              <p className="text-gray-600">
                {filteredFilms.length} film{filteredFilms.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un film..."
                className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                if (e.target.value !== 'all') {
                  navigate({ to: '/films/$categorie', params: { categorie: e.target.value } })
                }
              }}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille de films */}
        {filmsError && filmsErrorMessage ? (
          <div className="text-center py-12 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive font-medium">{filmsErrorMessage}</p>
            <p className="text-sm text-muted-foreground mt-2">À la racine du projet, lancez : pnpm db:migrate (avec la base démarrée)</p>
          </div>
        ) : filmsLoading ? (
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
              <div className="aspect-[2/3] bg-gradient-to-br from-emerald-100 to-emerald-100 overflow-hidden relative">
                {film.posterUrl && film.posterUrl !== 'N/A' ? (
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si l'image ne charge pas, afficher le placeholder
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

        {!filmsError && !filmsLoading && filteredFilms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun film trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
