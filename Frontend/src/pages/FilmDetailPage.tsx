import { useParams, Link } from "@tanstack/react-router";
import { useMovieDetail } from "../hooks/useMovies";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const FALLBACK_POSTER =
  "https://via.placeholder.com/500x750/18181b/ffffff?text=No+Image";

export default function FilmDetailPage() {
  const { id } = useParams({ from: "/film/$id" });
  const { data: movie, isLoading, isError } = useMovieDetail(id);
  const [rating, setRating] = useState(0);
  const { isLight } = useTheme();

  if (isLoading) {
    return (
      <p className={`p-6 pt-28 ${isLight ? "text-slate-700" : "text-white"}`}>
        Chargement...
      </p>
    );
  }

  if (isError) {
    return (
      <p className={`p-6 pt-28 ${isLight ? "text-slate-700" : "text-white"}`}>
        Erreur lors du chargement du film.
      </p>
    );
  }

  if (!movie) {
    return (
      <p className={`p-6 pt-28 ${isLight ? "text-slate-700" : "text-white"}`}>
        Film introuvable.
      </p>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-black text-white"}`}>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <div
          className={`grid gap-10 rounded-[2rem] p-8 md:grid-cols-[320px_1fr] md:p-10 ${
            isLight
              ? "border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              : "border border-white/5 bg-[#050507]"
          }`}
        >
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
              className="mb-6 inline-block text-sm font-medium text-amber-500"
            >
              Retour aux films
            </Link>

            <h1
              className={`text-4xl font-black tracking-tight md:text-6xl ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {movie.Title}
            </h1>

            <div
              className={`mt-4 flex flex-wrap gap-4 text-sm md:text-base ${
                isLight ? "text-slate-600" : "text-zinc-300"
              }`}
            >
              <span>⭐ {movie.imdbRating}</span>
              <span>{movie.Year}</span>
              <span>{movie.Director}</span>
            </div>

            <p
              className={`mt-6 max-w-2xl text-base leading-7 md:text-lg ${
                isLight ? "text-slate-600" : "text-zinc-300"
              }`}
            >
              {movie.Plot}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {movie.Genre?.split(",").map((genre) => (
                <Link
                  key={genre.trim()}
                  to="/films/$categorie"
                  params={{ categorie: genre.trim().toLowerCase() }}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isLight
                      ? "border border-slate-200 bg-slate-50 text-slate-800 hover:border-amber-400"
                      : "border border-white/10 bg-white/5 text-white hover:border-amber-400"
                  }`}
                >
                  {genre.trim()}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-amber-500">
                Votre note
              </p>

              <div className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={star <= rating ? "text-amber-400" : isLight ? "text-slate-300" : "text-zinc-600"}
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
