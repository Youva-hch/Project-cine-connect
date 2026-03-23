import { createFileRoute, Link } from '@tanstack/react-router'
import { useFilmDetails } from '@/hooks/useOmdb'

export const Route = createFileRoute('/film/$imdbId')({
  component: FilmDetailPage,
})

function FilmDetailPage() {
  const { imdbId } = Route.useParams()
  const { film, isLoading, isError, error } = useFilmDetails(imdbId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-12 w-12 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error instanceof Error ? error.message : 'Erreur lors du chargement'}
        </div>
        <Link to="/search" search={{ q: '', page: 1 }} className="mt-4 inline-block text-indigo-600 hover:underline">
          Retour à la recherche
        </Link>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500">Film introuvable.</p>
        <Link to="/search" search={{ q: '', page: 1 }} className="mt-4 inline-block text-indigo-600 hover:underline">
          Retour à la recherche
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/search"
          search={{ q: '', page: 1 }}
          className="inline-flex items-center text-indigo-600 hover:underline mb-6"
        >
          ← Retour à la recherche
        </Link>

        <article className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-full md:w-[500px]">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-200">
              {film.Poster && film.Poster !== 'N/A' ? (
                <img
                  src={film.Poster}
                  alt={film.Title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Pas d’affiche
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {film.Title}
            </h1>
            <p className="text-gray-500 mb-4">
              {film.Year} · {film.Runtime} · {film.Genre}
            </p>

            {film.Plot && film.Plot !== 'N/A' && (
              <p className="text-gray-700 mb-4 leading-relaxed">{film.Plot}</p>
            )}

            <dl className="grid gap-2 text-sm">
              {film.Director && film.Director !== 'N/A' && (
                <>
                  <dt className="font-medium text-gray-500">Réalisateur</dt>
                  <dd className="text-gray-900">{film.Director}</dd>
                </>
              )}
              {film.Actors && film.Actors !== 'N/A' && (
                <>
                  <dt className="font-medium text-gray-500">Acteurs</dt>
                  <dd className="text-gray-900">{film.Actors}</dd>
                </>
              )}
              {film.imdbRating && film.imdbRating !== 'N/A' && (
                <>
                  <dt className="font-medium text-gray-500">Note IMDb</dt>
                  <dd className="text-gray-900">{film.imdbRating}/10</dd>
                </>
              )}
              {film.BoxOffice && film.BoxOffice !== 'N/A' && (
                <>
                  <dt className="font-medium text-gray-500">Box-office</dt>
                  <dd className="text-gray-900">{film.BoxOffice}</dd>
                </>
              )}
            </dl>
          </div>
        </article>
      </div>
    </div>
  )
}
