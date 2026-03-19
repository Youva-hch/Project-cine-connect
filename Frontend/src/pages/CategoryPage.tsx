import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getMoviesByCategory } from "../services/omdb.service";
import type { OmdbMovie, OmdbSearchResponse } from "../shared/types/omdb.types";
import { cleanMovies } from "../shared/movieFilters";

const FALLBACK_POSTER =
  "https://via.placeholder.com/500x750/18181b/ffffff?text=No+Image";
const FALLBACK_BACKDROP =
  "https://via.placeholder.com/1280x720/18181b/ffffff?text=No+Image";

const categoryLabels: Record<string, string> = {
  action: "Action",
  romance: "Romance",
  comedy: "Comedy",
  drama: "Drama",
  horror: "Horror",
};

export default function CategoryPage() {
  const { categorie } = useParams({ from: "/films/$categorie" });

  const { data, isLoading, isError } = useQuery<OmdbSearchResponse>({
    queryKey: ["category", categorie],
    queryFn: () => getMoviesByCategory(categorie),
    enabled: !!categorie,
  });

  const movies = useMemo(() => cleanMovies(data?.Search ?? []), [data]);
  const [selectedMovie, setSelectedMovie] = useState<OmdbMovie | null>(null);

  useEffect(() => {
    if (movies.length > 0) {
      setSelectedMovie(movies[0]);
    }
  }, [movies]);

  if (isLoading) {
    return <p className="p-6 text-white">Chargement...</p>;
  }

  if (isError) {
    return <p className="p-6 text-white">Erreur lors du chargement des films.</p>;
  }

  if (!movies.length) {
    return <p className="p-6 text-white">Aucun film trouvé pour cette catégorie.</p>;
  }

  const heroImage =
    selectedMovie?.Poster && selectedMovie.Poster !== "N/A"
      ? selectedMovie.Poster
      : FALLBACK_BACKDROP;

  const categoryTitle =
    categorie ? categoryLabels[categorie.toLowerCase()] ?? categorie : "Catégorie";

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-black tracking-tight">
          Catégorie : {categoryTitle}
        </h1>

        {selectedMovie && (
          <div className="group relative mb-10 h-[500px] w-full overflow-hidden rounded-2xl">
            <img
              src={heroImage}
              alt={selectedMovie.Title}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_BACKDROP;
              }}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

            <div className="absolute bottom-10 left-10 max-w-xl">
              <h2 className="mb-4 text-5xl font-bold">{selectedMovie.Title}</h2>
              <p className="mb-4 text-zinc-300">{selectedMovie.Year}</p>

              <div className="flex gap-4">
                <Link
                  to="/film/$id"
                  params={{ id: selectedMovie.imdbID }}
                  className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-600"
                >
                  Lecture
                </Link>

                <Link
                  to="/film/$id"
                  params={{ id: selectedMovie.imdbID }}
                  className="rounded-lg bg-gray-700/70 px-6 py-3 text-white transition hover:bg-gray-600"
                >
                  Plus d'infos
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
          {movies.map((movie) => (
            <Link key={movie.imdbID} to="/film/$id" params={{ id: movie.imdbID }}>
              <div className="w-[150px] overflow-hidden rounded-lg bg-zinc-900">
                <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                  <img
                    src={movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER}
                    alt={movie.Title}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                    onMouseEnter={() => setSelectedMovie(movie)}
                    className="h-full w-full cursor-pointer object-cover transition duration-300 hover:scale-110"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
