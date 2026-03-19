import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useSearchMovies } from "../hooks/useMovies";
import Hero from "../components/Hero";
import ContentRow from "../components/ContentRow";
import { cleanMovies } from "../shared/movieFilters";

const genres = [
  { label: "Action", key: "action" },
  { label: "Romance", key: "romance" },
  { label: "Comedy", key: "comedy" },
  { label: "Drama", key: "drama" },
  { label: "Horror", key: "horror" },
];

const featuredQueries = [
  "batman",
  "interstellar",
  "inception",
  "gladiator",
  "joker",
  "dune",
  "the dark knight",
  "avengers",
];

export default function HomePage() {
  const randomQuery = useMemo(() => {
    const index = Math.floor(Math.random() * featuredQueries.length);
    return featuredQueries[index];
  }, []);

  const { data, isLoading } = useSearchMovies(randomQuery);
  const movies = cleanMovies(data?.Search ?? []);
  const featuredMovie =
    movies.find((movie) => movie.Title.length <= 25) ?? movies[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {featuredMovie ? (
        <Hero movie={featuredMovie} />
      ) : (
        <section className="mx-auto max-w-7xl px-6 pb-10 pt-28">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              Bienvenue sur CineConnect
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-zinc-400 md:text-xl">
              Découvrez des milliers de films, explorez les genres et partagez vos avis.
            </p>
            <Link
              to="/browse"
              className="mt-8 inline-flex rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-600"
            >
              Explorer les films
            </Link>
          </div>
        </section>
      )}

      <div className="space-y-16 pb-20 pt-14">
        {isLoading ? (
          <p className="px-6 text-white">Chargement...</p>
        ) : (
          <ContentRow title="Films à découvrir" movies={movies} />
        )}

        <section className="mx-auto max-w-7xl px-6">
          <h2 className="mb-6 text-3xl font-bold text-white">Explorer par genre</h2>

          <div className="flex flex-wrap gap-4">
            {genres.map((genre) => (
              <Link
                key={genre.key}
                to="/films/$categorie"
                params={{ categorie: genre.key }}
                className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 text-base font-medium text-white transition hover:border-amber-400 hover:bg-amber-500 hover:text-black"
              >
                {genre.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
