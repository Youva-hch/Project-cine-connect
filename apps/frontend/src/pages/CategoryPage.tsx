import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getMoviesByCategory } from "../services/omdb.service";
import type { OmdbSearchResponse } from "../shared/types/omdb.types";
import { cleanMovies } from "../shared/movieFilters";
import MovieCard from "../components/MovieCard";
import { useTheme } from "../contexts/ThemeContext";

const categoryLabels: Record<string, string> = {
  action: "Action",
  romance: "Romance",
  comedy: "Comédie",
  drama: "Drame",
  horror: "Horreur",
  thriller: "Thriller",
  animation: "Animation",
  adventure: "Aventure",
  crime: "Crime",
  "sci-fi": "Science-fiction",
};

export default function CategoryPage() {
  const { categorie } = useParams({ from: "/films/$categorie" });
  const { isLight } = useTheme();

  const { data, isLoading, isError } = useQuery<OmdbSearchResponse>({
    queryKey: ["category", categorie],
    queryFn: () => getMoviesByCategory(categorie),
    enabled: !!categorie,
  });

  const movies = useMemo(() => cleanMovies(data?.Search ?? []), [data]);

  const categoryTitle =
    categorie ? categoryLabels[categorie.toLowerCase()] ?? categorie : "Catégorie";

  return (
    <div className={`min-h-screen px-6 pb-24 pt-28 md:px-12 xl:px-16 ${isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-[#050507] text-white"}`}>
      <section className="mx-auto max-w-[1720px]">
        <div
          className={`mb-10 rounded-[2.2rem] px-8 py-12 md:px-12 ${
            isLight
              ? "border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              : "border border-white/8 bg-[#0a0a0a]"
          }`}
        >
          <Link
            to="/films"
            className={`text-sm font-semibold ${isLight ? "text-[#2ea864]" : "text-[#7de5b8]"}`}
          >
            Retour aux films
          </Link>

          <h1 className="mt-6 font-['Bebas_Neue'] text-[4.8rem] uppercase leading-none tracking-[0.04em] text-[#a6d45c] md:text-[6rem]">
            {categoryTitle}
          </h1>

          <p className={`mt-5 max-w-2xl text-[1.1rem] ${isLight ? "text-slate-500" : "text-white/65"}`}>
            Explore les meilleurs films de cette catégorie.
          </p>
        </div>

        {isLoading && (
          <p className={`text-center ${isLight ? "text-slate-500" : "text-white/70"}`}>
            Chargement...
          </p>
        )}

        {isError && (
          <p className={`text-center ${isLight ? "text-slate-500" : "text-white/70"}`}>
            Erreur lors du chargement des films.
          </p>
        )}

        {!isLoading && !isError && movies.length > 0 && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                title={movie.Title}
                year={movie.Year}
                poster={movie.Poster}
                imdbID={movie.imdbID}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && movies.length === 0 && (
          <p className={`text-center ${isLight ? "text-slate-500" : "text-white/70"}`}>
            Aucun film trouvé pour cette catégorie.
          </p>
        )}
      </section>
    </div>
  );
}
