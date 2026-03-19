import { Link } from "@tanstack/react-router";
import type { OmdbMovie } from "../shared/types/omdb.types";

interface HeroProps {
  movie: OmdbMovie;
}

const FALLBACK_BACKDROP =
  "https://via.placeholder.com/1280x720/18181b/ffffff?text=No+Image";

export default function Hero({ movie }: HeroProps) {
  const backgroundImage =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : FALLBACK_BACKDROP;

  return (
    <section
      className="relative min-h-[70vh] overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-end px-6 pb-16 pt-28">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-amber-400">
            Film mis en avant
          </p>

          <h1 className="max-w-[12ch] text-5xl font-black tracking-tight text-white md:text-7xl">
            {movie.Title}
          </h1>

          <p className="mt-3 text-lg text-zinc-300">{movie.Year}</p>

          <p className="mt-5 text-base text-zinc-300 md:text-lg">
            Découvrez ce film sur CineConnect.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/film/$id"
              params={{ id: movie.imdbID }}
              className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-600"
            >
              Voir le film
            </Link>

            <Link
              to="/browse"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Explorer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
