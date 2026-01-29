import { createFileRoute, Link } from '@tanstack/react-router'
import { useFilms, useCategories } from '@/hooks/useFilms'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const Route = createFileRoute('/films')({
  component: FilmsPage,
})

function FilmsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const { data: films, isLoading, error } = useFilms({ search, category: selectedCategory })
  const { data: categories } = useCategories()
  const queryClient = useQueryClient()
  
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/omdb/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 200 }),
      })
      if (!response.ok) throw new Error('Erreur lors de la synchronisation')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['films'] })
      alert('Synchronisation démarrée ! Les films seront ajoutés en arrière-plan.')
    },
    onError: (error) => {
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalogue de films</h1>
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncMutation.isPending ? 'Synchronisation...' : '🔄 Synchroniser depuis OMDb'}
            </button>
          </div>
          
          {/* Barre de recherche */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un film..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filtres par catégorie */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Tous
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste des films */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Chargement des films...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Erreur lors du chargement des films : {error.message}
            </p>
          </div>
        )}

        {!isLoading && !error && films && films.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">Aucun film trouvé</p>
            {search && (
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Essayez de modifier votre recherche ou vos filtres
              </p>
            )}
          </div>
        )}

        {!isLoading && !error && films && films.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <Link
                key={film.id}
                to="/film/$id"
                params={{ id: film.id.toString() }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {film.posterUrl ? (
                    <img
                      src={film.posterUrl}
                      alt={film.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<span class="text-gray-400 dark:text-gray-500 text-sm">Affiche</span>'
                        }
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">Affiche</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {film.title}
                  </h3>
                  {film.releaseYear && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{film.releaseYear}</p>
                  )}
                  {(() => {
                    const rating = typeof film.ratingAverage === 'string' 
                      ? parseFloat(film.ratingAverage) 
                      : film.ratingAverage
                    return rating != null && !isNaN(rating) && rating > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    )
                  })()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
