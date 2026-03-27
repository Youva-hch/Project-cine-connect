import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchByGenre } from "@/lib/omdb";
import { FilmCard } from "@/components/FilmCard";
import { apiRequest } from "@/api/config";
import { useEffect, useMemo, useState } from "react";
import type { OmdbMovie } from "@/lib/omdb";

const ITEMS_PER_PAGE = 20;
const MAX_FILMS = 100;

function getPaginationWindow(currentPage: number, totalPages: number): number[] {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const normalizedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - normalizedStart + 1 },
    (_, index) => normalizedStart + index
  );
}

export default function FilmsByCategory() {
  const { categorie } = useParams<{ categorie: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiRequest<{ data?: { id: number; name: string; slug: string }[] }>("/categories");
      return res.data ?? [];
    },
  });

  const category = categories?.find((c) => c.slug === categorie);

  const { data, isLoading } = useQuery<OmdbMovie[]>({
    queryKey: ["films-by-category", categorie, category?.name],
    queryFn: async () => {
      const query = (category?.name ?? categorie ?? "").trim();
      if (!query) return [];

      const firstPage = await searchByGenre(query, 1);
      const totalResults = Number.parseInt(firstPage.totalResults ?? "0", 10) || 0;
      const targetCount = Math.min(MAX_FILMS, totalResults);
      const totalOmdbPages = Math.min(10, Math.ceil(targetCount / 10));

      const remainingPages = totalOmdbPages > 1
        ? await Promise.all(
            Array.from({ length: totalOmdbPages - 1 }, (_, i) =>
              searchByGenre(query, i + 2).catch(() => ({ Search: [], Response: "False" as const }))
            )
          )
        : [];

      const allFilms = [
        ...(firstPage.Search ?? []),
        ...remainingPages.flatMap((page) => page.Search ?? []),
      ];

      const uniqueFilms: OmdbMovie[] = [];
      const seenImdbIds = new Set<string>();
      for (const film of allFilms) {
        const id = film.imdbID.trim().toLowerCase();
        if (seenImdbIds.has(id)) continue;
        seenImdbIds.add(id);
        uniqueFilms.push(film);
        if (uniqueFilms.length >= MAX_FILMS) break;
      }

      return uniqueFilms;
    },
    enabled: !!categorie,
    staleTime: 1000 * 60 * 10,
  });

  const films = data ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [categorie]);

  const totalPages = Math.max(1, Math.ceil(films.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedFilms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return films.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [films, currentPage]);

  const pageWindow = useMemo(
    () => getPaginationWindow(currentPage, totalPages),
    [currentPage, totalPages]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-5xl text-gradient-cinema">
          {category?.name ?? categorie}
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="card-cinema overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 justify-items-center">
            {paginatedFilms.map((film) => (
              <FilmCard key={film.imdbID} film={film} size="category" />
            ))}
          </div>

          {films.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground text-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Precedent
              </button>

              {pageWindow.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    page === currentPage
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground text-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
