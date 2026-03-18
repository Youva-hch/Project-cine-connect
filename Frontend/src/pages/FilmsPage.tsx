import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../services/tmdb.service";
import ContentRow from "../components/ContentRow";

export default function FilmsPage() {
  const [search, setSearch] = useState("batman");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["films-page", search],
    queryFn: () => searchMovies(search),
  });

  const movies = data?.results ?? [];

  return (
    <div className="min-h-screen bg-black px-6 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">
              Catalogue
            </p>
            <h1 className="text-5xl font-black tracking-tight">Films</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Explorez le catalogue CineConnect et trouvez votre prochain film à regarder.
            </p>
          </div>

          <div className="w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un film..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-white outline-none transition placeholder:text-zinc-400 focus:border-red-500"
            />
          </div>
        </div>

        {isLoading && <p>Chargement...</p>}
        {isError && <p>Erreur lors du chargement des films.</p>}

        {!isLoading && !isError && (
          <ContentRow
            title={search ? `Résultats pour "${search}"` : "Films"}
            movies={movies}
          />
        )}
      </div>
    </div>
  );
}


