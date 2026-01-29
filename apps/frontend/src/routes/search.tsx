import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useFilms } from '@/hooks/useOmdb'

export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? '',
    page: Number(search.page) || 1,
  }),
})

function SearchPage() {
  const { q: searchQ = '', page: searchPage = 1 } = Route.useSearch()
  const [searchTerm, setSearchTerm] = useState(searchQ)
  const navigate = useNavigate()
  useEffect(() => {
    setSearchTerm(searchQ)
  }, [searchQ])

  const { films, totalResults, isLoading, isError, error, isFetching } =
    useFilms({ s: searchQ, page: searchPage })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = searchTerm.trim()
    if (!term) return
    navigate({ to: '/search', search: { q: term, page: 1 } })
  }

  const totalPages = totalResults ? Math.ceil(totalResults / 10) : 0

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Rechercher un film
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Titre du film..."
              className="flex-1 px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              type="submit"
              disabled={!searchTerm.trim() || isFetching}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </form>

        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error instanceof Error ? error.message : 'Erreur lors de la recherche'}
          </div>
        )}

        {isLoading && searchQ && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}

        {!searchQ && (
          <p className="text-gray-500 text-center py-12">
            Saisissez un titre et lancez la recherche.
          </p>
        )}

        {searchQ && !isLoading && films.length === 0 && !isError && (
          <p className="text-gray-500 text-center py-12">
            Aucun film trouvé pour « {searchQ} ».
          </p>
        )}

        {films.length > 0 && (
          <>
            <p className="text-gray-600 mb-4">
              {totalResults} résultat{totalResults > 1 ? 's' : ''} pour « {searchQ} »
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {films.map((film) => (
                <li key={film.imdbID}>
                  <Link
                    to="/film/$imdbId"
                    params={{ imdbId: film.imdbID }}
                    className="block p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 hover:shadow-md transition"
                  >
                    <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-3">
                      {film.Poster && film.Poster !== 'N/A' ? (
                        <img
                          src={film.Poster}
                          alt={film.Title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Pas d’affiche
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {film.Title}
                    </h3>
                    <p className="text-sm text-gray-500">{film.Year}</p>
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: '/search',
                      search: { q: searchQ, page: Math.max(1, searchPage - 1) },
                    })
                  }
                  disabled={searchPage <= 1 || isFetching}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {searchPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: '/search',
                      search: { q: searchQ, page: searchPage + 1 },
                    })
                  }
                  disabled={searchPage >= totalPages || isFetching}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
