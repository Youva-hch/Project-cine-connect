import { useState } from "react";
import { useSearchMovies } from "../hooks/useMovies";
import ContentRow from "../components/ContentRow";
import { cleanMovies } from "../shared/movieFilters";

export default function FilmsPage() {
  const [search, setSearch] = useState("batman");
  const { data, isLoading, isError } = useSearchMovies(search);

  const movies = cleanMovies(data?.Search ?? []);

  return (
    <div className="min-h-screen bg-black px-6 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-amber-400">
              Catalogue
            </p>
            <h1 className="text-5xl font-black tracking-tight">Films</h1>
          </div>

          <div className="w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un film..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {isLoading && <p>Chargement...</p>}
        {isError && <p>Erreur lors du chargement des films.</p>}

        {!isLoading && !isError && (
          <ContentRow title={`Résultats pour "${search}"`} movies={movies} />
        )}
      </div>
    </div>
  );
}
