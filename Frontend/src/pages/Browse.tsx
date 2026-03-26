import { useState } from "react";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchMovies } from "../hooks/useMovies";
import type { OmdbMovie } from "../shared/types/omdb.types";
import { cleanMovies } from "../shared/movieFilters";

export function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const effectiveQuery = searchQuery.trim() || "movie";

  const { data, isLoading, error } = useSearchMovies(effectiveQuery);
  const movies = data?.Search ?? [];
  const visibleMovies = cleanMovies(movies as OmdbMovie[]);

  return (
    <div className="min-h-screen bg-black px-4 pb-20 pt-24 md:px-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl text-white md:text-4xl">Explorer les films</h1>

        <div className="max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un film..."
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-white focus:outline-none"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="py-20 text-center">
          <p className="text-xl text-amber-300">
            {(error as Error).message || "Erreur lors du chargement des films"}
          </p>
        </div>
      )}

      {visibleMovies.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visibleMovies.map((movie: OmdbMovie) => (
            <MovieCard
              key={movie.imdbID}
              title={movie.Title}
              year={movie.Year}
              poster={movie.Poster}
              imdbID={movie.imdbID}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="py-20 text-center">
            <p className="text-xl text-white/60">
              Aucun resultat pour "{effectiveQuery}"
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default Browse;
