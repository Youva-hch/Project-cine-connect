import { createFileRoute, Link } from '@tanstack/react-router'
import { useFilm, useFilmReviews } from '@/hooks/useFilms'

export const Route = createFileRoute('/film/$id')({
  component: FilmDetail,
})

function FilmDetail() {
  const { id } = Route.useParams()
  const filmId = parseInt(id, 10)

  const { data: film, isLoading } = useFilm(filmId)
  const { data: reviews = [] } = useFilmReviews(filmId)

  if (isLoading) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Chargement du film...</p>
        </div>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Film non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/films" className="text-emerald-600 hover:text-emerald-700">
            ← Retour aux films
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Affiche */}
              <div className="md:w-1/3">
              <div className="aspect-[2/3] bg-gradient-to-br from-emerald-100 to-emerald-100 relative">
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
                  <svg className="w-24 h-24 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <p className="text-sm text-center px-4 font-medium">{film.title}</p>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{film.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-2xl">★</span>
                  <span className="ml-2 text-xl font-semibold text-gray-900">
                    {Number(film.ratingAverage).toFixed(1)}
                  </span>
                  <span className="ml-2 text-gray-600">({film.ratingCount} avis)</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {film.director && (
                  <div>
                    <span className="font-semibold text-gray-700">Réalisateur :</span>
                    <span className="ml-2 text-gray-900">{film.director}</span>
                  </div>
                )}
                {film.releaseYear && (
                  <div>
                    <span className="font-semibold text-gray-700">Année :</span>
                    <span className="ml-2 text-gray-900">{film.releaseYear}</span>
                  </div>
                )}
                {film.durationMinutes && (
                  <div>
                    <span className="font-semibold text-gray-700">Durée :</span>
                    <span className="ml-2 text-gray-900">{film.durationMinutes} minutes</span>
                  </div>
                )}
              </div>

              {film.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Synopsis</h2>
                  <p className="text-gray-700 leading-relaxed">{film.description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                  Noter ce film
                </button>
                <button className="px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
                  Ajouter un avis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Avis */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis des utilisateurs</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">Aucun avis pour le moment</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold">U</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Utilisateur #{review.userId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-semibold text-gray-900">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
