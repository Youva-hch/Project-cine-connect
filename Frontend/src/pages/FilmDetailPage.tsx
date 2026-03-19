import { useParams, Link } from "@tanstack/react-router";
import { useMovieDetail } from "../hooks/useMovies";
import { useState } from "react";

const FALLBACK_POSTER =
  "https://via.placeholder.com/500x750/18181b/ffffff?text=No+Image";

export default function FilmDetailPage() {
  const { id } = useParams({ from: "/film/$id" });
  const { data: movie, isLoading, isError } = useMovieDetail(id);
  const [rating, setRating] = useState(0);

  if (isLoading) return <p className="p-6 text-white">Chargement...</p>;
  if (isError) return <p className="p-6 text-white">Erreur lors du chargement du film.</p>;
  if (!movie) return <p className="p-6 text-white">Film introuvable.</p>;

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <div className="grid gap-10 md:grid-cols-[320px_1fr]">
          <div>
            <img
              src={movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER}
              alt={movie.Title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_POSTER;
              }}
              className="w-full max-w-xs rounded-2xl shadow-2xl"
            />
          </div>

          <div className="max-w-3xl">
            <Link
              to="/films"
              className="mb-6 inline-block text-sm font-medium text-amber-300"
            >
              Retour aux films
            </Link>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              {movie.Title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-300 md:text-base">
              <span>⭐ {movie.imdbRating}</span>
              <span>{movie.Year}</span>
              <span>{movie.Director}</span>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
              {movie.Plot}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {movie.Genre?.split(",").map((genre) => (
                <Link
                  key={genre.trim()}
                  to="/films/$categorie"
                  params={{ categorie: genre.trim().toLowerCase() }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-amber-400"
                >
                  {genre.trim()}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-amber-400">
                Votre note
              </p>

              <div className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={star <= rating ? "text-amber-400" : "text-zinc-600"}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
