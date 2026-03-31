import MovieCard from "./MovieCard";
import type { OmdbMovie } from "../shared/types/omdb.types";
import { cleanMovies } from "../shared/movieFilters";
import { useTheme } from "../contexts/ThemeContext";

interface ContentRowProps {
  title: string;
  movies: OmdbMovie[];
}

export default function ContentRow({ title, movies }: ContentRowProps) {
  const { isLight } = useTheme();
  const visibleMovies = cleanMovies(movies);

  if (!visibleMovies.length) return null;

  return (
    <section className="mx-auto max-w-[1720px] overflow-hidden px-4 sm:px-6 xl:px-0">
      <h2
        className={`mb-7 font-['Bebas_Neue'] text-[2.6rem] uppercase tracking-[0.03em] md:text-[3.2rem] ${
          isLight ? "text-slate-900" : "text-white"
        }`}
      >
        {title}
      </h2>

      <div className="grid grid-cols-2 items-start gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
    </section>
  );
}
