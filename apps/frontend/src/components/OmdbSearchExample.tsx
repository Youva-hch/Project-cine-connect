/**
 * Composant d'exemple pour utiliser les hooks OMDb
 * Ce composant montre comment rechercher des films et afficher leurs détails
 */
import { useState } from 'react'
import { useOmdbSearch, useOmdbMovieByImdbId } from '@/hooks/useOmdb'

export function OmdbSearchExample() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImdbId, setSelectedImdbId] = useState<string | null>(null)

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useOmdbSearch(searchTerm, {
    type: 'movie',
    enabled: searchTerm.length >= 3, // Rechercher seulement si au moins 3 caractères
  })

  const {
    data: movieDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useOmdbMovieByImdbId(selectedImdbId, !!selectedImdbId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.length >= 3) {
      // La recherche se déclenche automatiquement via le hook
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Recherche OMDb</h2>

      {/* Formulaire de recherche */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un film..."
          className="flex-1 px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          minLength={3}
        />
        <button
          type="submit"
          disabled={searchTerm.length < 3}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Rechercher
        </button>
      </form>

      {/* État de chargement */}
      {isSearching && (
        <div className="text-center py-8">
          <p className="text-gray-500">Recherche en cours...</p>
        </div>
      )}

      {/* Gestion des erreurs */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Erreur de recherche</p>
          <p className="text-red-600 text-sm mt-1">{searchError.message}</p>
        </div>
      )}

      {/* Résultats de recherche */}
      {searchResults && searchResults.Search && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {searchResults.totalResults} résultat(s) trouvé(s)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.Search.map((movie) => (
              <div
                key={movie.imdbID}
                onClick={() => setSelectedImdbId(movie.imdbID)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {movie.Poster && movie.Poster !== 'N/A' ? (
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Pas d'affiche</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{movie.Title}</h3>
                  <p className="text-sm text-gray-600">{movie.Year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Détails du film sélectionné */}
      {selectedImdbId && (
        <div className="mt-8 border-t pt-8">
          {isLoadingDetails && (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement des détails...</p>
            </div>
          )}

          {detailsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">Erreur de chargement</p>
              <p className="text-red-600 text-sm mt-1">{detailsError.message}</p>
            </div>
          )}

          {movieDetails && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {movieDetails.Poster && movieDetails.Poster !== 'N/A' && (
                  <img
                    src={movieDetails.Poster}
                    alt={movieDetails.Title}
                    className="w-full md:w-64 h-auto object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">{movieDetails.Title}</h3>
                  <div className="space-y-2 mb-4">
                    <p>
                      <span className="font-semibold">Année:</span> {movieDetails.Year}
                    </p>
                    <p>
                      <span className="font-semibold">Réalisateur:</span>{' '}
                      {movieDetails.Director}
                    </p>
                    <p>
                      <span className="font-semibold">Genre:</span> {movieDetails.Genre}
                    </p>
                    <p>
                      <span className="font-semibold">Durée:</span> {movieDetails.Runtime}
                    </p>
                    {movieDetails.imdbRating && movieDetails.imdbRating !== 'N/A' && (
                      <p>
                        <span className="font-semibold">Note IMDb:</span>{' '}
                        {movieDetails.imdbRating}/10
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Synopsis</h4>
                    <p className="text-gray-700">{movieDetails.Plot}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


