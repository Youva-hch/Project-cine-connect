import { useState, useEffect, useRef } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Film as FilmIcon, Loader2 } from "lucide-react";
import { searchMovies } from "@/lib/omdb";
import { FilmCard } from "@/components/FilmCard";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/api/config";
import type { OmdbMovie } from "@/lib/omdb";

const POPULAR_SEARCHES = [
  "batman", "marvel", "star wars", "harry potter", "lord of the rings",
  "spider-man", "iron man", "avengers", "james bond", "fast furious",
  "mission impossible", "transformers", "pirates caribbean", "jurassic park", "matrix",
  "inception", "interstellar", "dark knight", "pulp fiction", "godfather",
  "titanic", "avatar", "forrest gump", "shawshank", "fight club",
  "goodfellas", "schindler", "gladiator", "braveheart", "alien",
  "terminator", "die hard", "indiana jones", "back future", "ghostbusters",
  "blade runner", "mad max", "john wick", "kingsman", "wolf wall street",
  "whiplash", "la la land", "parasite", "joker", "dune",
  "oppenheimer", "top gun", "frozen", "lion king", "toy story",
  "finding nemo", "shrek", "kung fu panda", "moana", "conjuring",
  "halloween", "it pennywise", "get out", "gone girl", "prestige",
  "dunkirk", "saving private ryan", "apocalypse now", "full metal jacket", "1917",
  "rocky", "karate kid", "casino royale", "ocean eleven", "heat 1995",
];

export default function Films() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);

  // When no search query, load many popular films from multiple searches
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["popular-films"],
    queryFn: async () => {
      const results = await Promise.all(
        POPULAR_SEARCHES.map((q) => searchMovies(q, 1))
      );
      // Merge all results, deduplicate by imdbID
      const seen = new Set<string>();
      const allFilms: OmdbMovie[] = [];
      for (const res of results) {
        for (const film of res.Search ?? []) {
          if (!seen.has(film.imdbID)) {
            seen.add(film.imdbID);
            allFilms.push(film);
          }
        }
      }
      return allFilms;
    },
    enabled: !query,
  });

  // When user searches, use infinite query for pagination
  const {
    data: searchData,
    isLoading: searchLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["search-films", query],
    queryFn: ({ pageParam = 1 }) => searchMovies(query, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.totalResults) return undefined;
      const totalPages = Math.ceil(Number(lastPage.totalResults) / 10);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: !!query,
  });

  // Flatten search results and deduplicate
  const searchFilms = (() => {
    if (!searchData) return [];
    const seen = new Set<string>();
    const films: OmdbMovie[] = [];
    for (const page of searchData.pages) {
      for (const film of page.Search ?? []) {
        if (!seen.has(film.imdbID)) {
          seen.add(film.imdbID);
          films.push(film);
        }
      }
    }
    return films;
  })();

  const films = query ? searchFilms : (popularData ?? []);
  const isLoading = query ? searchLoading : popularLoading;

  // Infinite scroll observer
  useEffect(() => {
    if (!query || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [query, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiRequest<{ success?: boolean; data?: { id: number; name: string; slug: string }[] }>("/categories");
      return res.data ?? [];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-display text-5xl text-gradient-cinema">Films</h1>
        <p className="text-muted-foreground">
          {query
            ? `Résultats pour "${query}" — ${searchData?.pages?.[0]?.totalResults ?? 0} films trouvés`
            : `${films.length} films populaires à découvrir`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un film..."
          className="pl-12 h-12 text-base"
        />
      </form>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat: { id: number; name: string; slug: string }) => (
            <Link
              key={cat.id}
              to={`/films/${cat.slug}`}
              className="px-4 py-2 rounded-full border border-border bg-card text-card-foreground text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="card-cinema overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : films.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {films.map((film) => (
              <FilmCard key={film.imdbID} film={film} />
            ))}
          </div>

          {/* Infinite scroll loader */}
          {query && hasNextPage && (
            <div ref={loaderRef} className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {query && isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <p className="text-sm text-muted-foreground">Chargement de plus de films...</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <FilmIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>Aucun film trouvé. Essayez une autre recherche.</p>
        </div>
      )}
    </div>
  );
}
