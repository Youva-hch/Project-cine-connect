import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovieById, getMoviesByCategory, searchMovies } from "../services/omdb.service";
import type { OmdbMovie } from "../shared/types/omdb.types";
import { useTheme } from "../contexts/ThemeContext";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 flex-shrink-0 text-white/50"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

const GENRES = [
  { label: "Action", key: "action" },
  { label: "Comédie", key: "comedy" },
  { label: "Horreur", key: "horror" },
  { label: "Drame", key: "drama" },
  { label: "Sci-Fi", key: "sci-fi" },
  { label: "Thriller", key: "thriller" },
  { label: "Animation", key: "animation" },
  { label: "Aventure", key: "adventure" },
  { label: "Crime", key: "crime" },
  { label: "Romance", key: "romance" },
] as const;

const DISCOVERY_IDS = [
  "tt1375666",
  "tt0816692",
  "tt0468569",
  "tt1160419",
  "tt15398776",
  "tt4154796",
  "tt7286456",
  "tt1856101",
  "tt1745960",
  "tt2582802",
  "tt6751668",
  "tt0114369",
];

function normalizeGenre(value: string) {
  const map: Record<string, string> = {
    "Comédie": "comedy",
    Horreur: "horror",
    Drame: "drama",
    Aventure: "adventure",
    "Sci-Fi": "sci-fi",
    Action: "action",
    Thriller: "thriller",
    Animation: "animation",
    Crime: "crime",
    Romance: "romance",
  };

  return map[value] ?? value.toLowerCase();
}

function PosterCard({ movie }: { movie: OmdbMovie }) {
  return (
    <Link
      to="/film/$id"
      params={{ id: movie.imdbID }}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ad0ae] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div className="overflow-hidden rounded-[1.25rem] bg-[#121212] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <img
          src={movie.Poster}
          alt={movie.Title}
          className="aspect-[2/3] w-full object-cover"
          loading="lazy"
        />
      </div>
    </Link>
  );
}

export default function FilmsPage() {
  const { isLight } = useTheme();
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const trimmedSearch = search.trim();
  const shouldUseRemoteResults = Boolean(trimmedSearch || activeGenre);

  const { data: discoveryMovies = [] } = useQuery({
    queryKey: ["frontend-films-discovery", DISCOVERY_IDS],
    queryFn: async () => Promise.all(DISCOVERY_IDS.map((id) => getMovieById(id))),
    staleTime: Infinity,
  });

  const { data: remoteMovies = [], isFetching: isFetchingRemote, isError } = useQuery({
    queryKey: ["frontend-films-page", trimmedSearch, activeGenre],
    enabled: shouldUseRemoteResults,
    queryFn: async () => {
      if (trimmedSearch) {
        const response = await searchMovies(trimmedSearch, 1, 2);
        return response.Search ?? [];
      }

      if (activeGenre) {
        const response = await getMoviesByCategory(activeGenre);
        return response.Search ?? [];
      }

      return [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: remoteMovieDetails = [], isFetching: isFetchingDetails } = useQuery({
    queryKey: ["frontend-films-details", remoteMovies.map((movie) => movie.imdbID)],
    enabled: shouldUseRemoteResults && remoteMovies.length > 0,
    queryFn: async () => Promise.all(remoteMovies.slice(0, 24).map((movie) => getMovieById(movie.imdbID))),
    staleTime: 1000 * 60 * 10,
  });

  const movies = useMemo(() => {
    if (!shouldUseRemoteResults) {
      return discoveryMovies.filter((movie) => movie.Poster && movie.Poster !== "N/A");
    }

    const detailedMovies = remoteMovieDetails.length ? remoteMovieDetails : remoteMovies;
    const normalizedGenre = activeGenre ? normalizeGenre(activeGenre) : null;

    return detailedMovies.filter((movie) => {
      const hasPoster = Boolean(movie.Poster && movie.Poster !== "N/A");
      if (!hasPoster) return false;
      if (!normalizedGenre) return true;
      return Boolean(
        "Genre" in movie &&
          movie.Genre &&
          movie.Genre !== "N/A" &&
          movie.Genre.toLowerCase().includes(normalizedGenre)
      );
    });
  }, [activeGenre, discoveryMovies, remoteMovieDetails, remoteMovies, shouldUseRemoteResults]);

  const isLoading = isFetchingRemote || isFetchingDetails;

  return (
    <div className={`min-h-screen px-6 pb-24 pt-28 md:px-12 xl:px-16 ${isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-[#050507] text-white"}`}>
      <section className="mx-auto max-w-[1720px]">
        <div className={`mx-auto mb-10 max-w-[1720px] rounded-[2.2rem] px-8 py-12 md:px-12 ${isLight ? "border border-slate-200 bg-white" : "border border-white/8 bg-[#0a0a0a]"}`}>
          <h1 className="text-center font-['Bebas_Neue'] text-[5rem] uppercase leading-none tracking-[0.04em] text-[#a6d45c] md:text-[6.4rem]">
            FILMS
          </h1>
          <p className={`mt-6 text-center text-[1.15rem] ${isLight ? "text-slate-500" : "text-white/70"}`}>
            {movies.length || discoveryMovies.length || DISCOVERY_IDS.length} films à découvrir
          </p>

          <div className={`mx-auto mt-8 flex w-full max-w-[960px] items-center gap-4 rounded-[1.15rem] px-6 py-5 ${isLight ? "border border-slate-200 bg-slate-50" : "border border-white/9 bg-[#161616]"}`}>
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher parmi les films..."
              className={`w-full border-none bg-transparent text-[1.05rem] outline-none ${isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-white/72"}`}
              aria-label="Rechercher parmi les films"
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {GENRES.map((genre) => {
              const isActive = activeGenre === genre.key;
              return (
                <button
                  key={genre.key}
                  type="button"
                  onClick={() => setActiveGenre(isActive ? null : genre.key)}
                  className={`rounded-full border px-5 py-3 text-[0.98rem] font-semibold transition ${
                    isActive
                      ? "border-[#7ad6aa6b] bg-[#6ad0ae1f] text-[#26906a]"
                      : isLight
                      ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
                      : "border-white/10 bg-[#151515] text-white/82 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {genre.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading && <p className="text-center text-white/70">Chargement...</p>}
        {isError && <p className="text-center text-white/70">Erreur lors du chargement des films.</p>}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-5">
              {movies.map((movie) => (
                <PosterCard key={movie.imdbID} movie={movie} />
              ))}
            </div>

            {movies.length === 0 && (
              <p className="mt-8 text-center text-white/65">
                Aucun film trouvé pour cette recherche. Essaie un autre mot-clé ou un autre genre.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
