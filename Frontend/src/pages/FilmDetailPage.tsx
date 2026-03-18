import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMovieById } from "../services/tmdb.service";

export default function FilmDetailPage() {
  const { id } = useParams({ from: "/film/$id" });
  const movieId = Number(id);

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieById(movieId),
    enabled: !Number.isNaN(movieId),
  });

  const [rating, setRating] = useState(0);

  if (Number.isNaN(movieId)) {
    return <p className="p-6 text-white">Film invalide</p>;
  }

  if (isLoading) {
    return <p className="p-6 text-white">Chargement...</p>;
  }

  if (isError) {
    return <p className="p-6 text-white">Erreur lors du chargement du film.</p>;
  }

  if (!movie) {
    return <p className="p-6 text-white">Film introuvable.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section
        className="relative min-h-[75vh] bg-cover bg-center"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : "none",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-end px-6 pb-16 pt-28">
          <div className="grid w-full gap-10 md:grid-cols-[320px_1fr] md:items-end">
            <div>
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }
                alt={movie.title}
                className="w-full max-w-xs rounded-2xl shadow-2xl"
              />
            </div>

            <div className="max-w-3xl">
              <Link
                to="/films"
                className="mb-6 inline-block text-sm font-medium text-red-400 transition hover:text-red-300"
              >
                Retour aux films
              </Link>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                {movie.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-300 md:text-base">
                <span>⭐ {movie.vote_average?.toFixed(1) ?? "N/A"}</span>
                <span>{movie.release_date || "Date inconnue"}</span>
                <span>{movie.runtime ? `${movie.runtime} min` : "Durée inconnue"}</span>
              </div>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
                {movie.overview || "Aucun résumé disponible."}
              </p>

              {movie.genres?.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {movie.genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8">
                <p className="mb-3 text-sm uppercase tracking-[0.25em] text-red-500">
                  Votre note
                </p>

                <div className="flex gap-2 text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition ${
                        star <= rating ? "text-yellow-400" : "text-zinc-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="mb-6 text-3xl font-bold">Casting</h2>

        {movie.credits?.cast?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {movie.credits.cast.slice(0, 10).map((actor: any) => (
              <div
                key={actor.id}
                className="rounded-2xl border border-white/5 bg-zinc-900 p-4"
              >
                <p className="font-semibold text-white">{actor.name}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  {actor.character || "Rôle inconnu"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">Aucun casting disponible.</p>
        )}
      </section>
    </div>
  );
}
