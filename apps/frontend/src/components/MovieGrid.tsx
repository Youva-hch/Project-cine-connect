import MovieCard from "./MovieCard";
import type { OmdbMovie } from "../shared/types/omdb.types";
import { cleanMovies } from "../shared/movieFilters";

interface MovieGridProps {
  movies?: OmdbMovie[];
}

export default function MovieGrid({ movies = [] }: MovieGridProps) {
  const visibleMovies = cleanMovies(movies);

  if (visibleMovies.length === 0) {
    return <p className="text-white">Aucun film trouvé</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {visibleMovies.map((movie) => (
        <MovieCard
          key={movie.imdbID}
          title={movie.Title}
          year={movie.Year}
          poster={movie.Poster}
          imdbID={movie.imdbID}
        />
      ))}
    </div>
  );
}
