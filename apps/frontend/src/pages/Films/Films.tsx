import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Film as FilmIcon, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { searchMovies } from "@/lib/omdb";
import { FilmCard } from "@/components/FilmCard";
import { Input } from "@/components/ui/input";
import type { OmdbMovie } from "@/lib/omdb";
import styles from "./Films.module.css";

// ─── Genre tags ─────────────────────────────────────────────────────────────
const GENRES: { label: string; queries: string[] }[] = [
  {
    label: "Action",
    queries: ["john wick", "mad max", "die hard", "mission impossible", "terminator", "top gun", "gladiator", "batman begins"],
  },
  {
    label: "Comedie",
    queries: ["superbad", "hangover", "bridesmaids", "step brothers", "anchorman", "tropic thunder", "game night", "knives out"],
  },
  {
    label: "Horreur",
    queries: ["conjuring", "halloween", "it pennywise", "get out", "hereditary", "midsommar", "sinister", "quiet place"],
  },
  {
    label: "Drame",
    queries: ["shawshank", "godfather", "forrest gump", "schindler", "whiplash", "parasite", "joker", "1917"],
  },
  {
    label: "Sci-Fi",
    queries: ["dune", "inception", "interstellar", "blade runner", "matrix", "arrival", "gravity", "ex machina"],
  },
  {
    label: "Thriller",
    queries: ["gone girl", "prestige", "fight club", "zodiac", "silence lambs", "seven 1995", "memento", "nightcrawler"],
  },
  {
    label: "Animation",
    queries: ["toy story", "lion king", "frozen", "finding nemo", "shrek", "kung fu panda", "moana", "spider-man animated"],
  },
  {
    label: "Aventure",
    queries: ["indiana jones", "jurassic park", "pirates caribbean", "lord of the rings", "avatar", "back future", "king kong", "jungle book"],
  },
  {
    label: "Crime",
    queries: ["pulp fiction", "goodfellas", "heat 1995", "ocean eleven", "scarface", "casino royale", "training day", "departed"],
  },
  {
    label: "Romance",
    queries: ["titanic", "la la land", "notebook", "pride prejudice", "before sunrise", "eternal sunshine", "about time", "her 2013"],
  },
];

// ─── Films populaires par défaut ─────────────────────────────────────────
const POPULAR_QUERIES = [
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

const FALLBACK_FILMS: OmdbMovie[] = [
  { Title: "Inception", Year: "2010", imdbID: "tt1375666", Type: "movie", Poster: "N/A" },
  { Title: "Interstellar", Year: "2014", imdbID: "tt0816692", Type: "movie", Poster: "N/A" },
  { Title: "The Dark Knight", Year: "2008", imdbID: "tt0468569", Type: "movie", Poster: "N/A" },
  { Title: "Dune", Year: "2021", imdbID: "tt1160419", Type: "movie", Poster: "N/A" },
  { Title: "Oppenheimer", Year: "2023", imdbID: "tt15398776", Type: "movie", Poster: "N/A" },
  { Title: "Parasite", Year: "2019", imdbID: "tt6751668", Type: "movie", Poster: "N/A" },
  { Title: "Whiplash", Year: "2014", imdbID: "tt2582802", Type: "movie", Poster: "N/A" },
  { Title: "Mad Max: Fury Road", Year: "2015", imdbID: "tt1392190", Type: "movie", Poster: "N/A" },
  { Title: "Top Gun: Maverick", Year: "2022", imdbID: "tt1745960", Type: "movie", Poster: "N/A" },
  { Title: "Joker", Year: "2019", imdbID: "tt7286456", Type: "movie", Poster: "N/A" },
  { Title: "The Prestige", Year: "2006", imdbID: "tt0482571", Type: "movie", Poster: "N/A" },
];

async function fetchFilmsForQueries(queries: string[]): Promise<OmdbMovie[]> {
  const allFilms: OmdbMovie[] = [];
  const seenIds = new Set<string>();

  const promises = queries.map((q) => searchMovies(q, 1).catch(() => null));
  const results = await Promise.all(promises);

  for (const result of results) {
    if (!result || !result.Search) continue;
    for (const film of result.Search) {
      const normalizedId = film.imdbID.trim().toLowerCase();
      if (!seenIds.has(normalizedId)) {
        seenIds.add(normalizedId);
        allFilms.push(film);
      }
    }
  }

  return allFilms;
}

export default function Films() {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search") ?? "";
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  useEffect(() => {
    setSearch(searchFromUrl);
    if (searchFromUrl) {
      setActiveGenre(null);
    }
  }, [searchFromUrl]);

  // Films populaires (défaut)
  const { data: popularFilms, isLoading: popularLoading } = useQuery({
    queryKey: ["popular-films"],
    queryFn: () => fetchFilmsForQueries(POPULAR_QUERIES),
    staleTime: Infinity,
    enabled: !activeGenre,
  });

  // Films par genre
  const activeGenreData = GENRES.find((g) => g.label === activeGenre);
  const { data: genreFilms, isLoading: genreLoading } = useQuery({
    queryKey: ["genre-films", activeGenre],
    queryFn: () => fetchFilmsForQueries(activeGenreData!.queries),
    staleTime: Infinity,
    enabled: !!activeGenre && !!activeGenreData,
  });

  const sourceFilms = activeGenre ? (genreFilms ?? []) : (popularFilms ?? []);
  const baseFilms = sourceFilms.length > 0 ? sourceFilms : FALLBACK_FILMS;
  const isLoading = activeGenre ? genreLoading : popularLoading;

  // Filtrage local par texte en temps réel
  const films = useMemo(() => {
    const uniqueBaseFilms: OmdbMovie[] = [];
    const seenIds = new Set<string>();

    for (const film of baseFilms) {
      const normalizedId = film.imdbID.trim().toLowerCase();
      if (!seenIds.has(normalizedId)) {
        seenIds.add(normalizedId);
        uniqueBaseFilms.push(film);
      }
    }

    const q = search.trim().toLowerCase();
    if (!q) return uniqueBaseFilms;
    return uniqueBaseFilms.filter((f) =>
      f.Title.toLowerCase().includes(q) || f.Year.includes(q)
    );
  }, [baseFilms, search]);

  const handleGenreClick = (label: string) => {
    setActiveGenre((prev) => (prev === label ? null : label));
    setSearch("");
  };

  const clearFilters = () => {
    setActiveGenre(null);
    setSearch("");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-5xl text-gradient-cinema">Films</h1>
        <p className={`text-sm ${styles.subtitle}`}>
          {isLoading
            ? "Chargement des films..."
            : activeGenre
            ? `Genre : ${activeGenre} — ${films.length} films`
            : search
            ? `"${search}" — ${films.length} films`
            : `${baseFilms.length} films a decouvrir`}
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="max-w-xl mx-auto relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${styles.searchIcon}`}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher parmi les films..."
          className={`pl-12 h-12 text-base ${styles.searchInput}`}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${styles.clearSearchButton}`}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tags genres */}
      <div className="flex flex-wrap justify-center gap-2">
        {GENRES.map((genre) => {
          const isActive = activeGenre === genre.label;
          return (
            <button
              key={genre.label}
              onClick={() => handleGenreClick(genre.label)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${styles.genreButton} ${
                isActive ? styles.genreButtonActive : ""
              }`}
              type="button"
            >
              {genre.label}
            </button>
          );
        })}

        {/* Bouton reset si filtre actif */}
        {(activeGenre || search) && (
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${styles.resetFilters}`}
            type="button"
          >
            <X className="h-3 w-3" /> Tout effacer
          </button>
        )}
      </div>

      {/* Résultats */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {films.map((film, index) => (
            <FilmCard key={`${film.imdbID}-${film.Year}-${index}`} film={film} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-20 ${styles.emptyState}`}>
          <FilmIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Aucun film trouve</p>
          {search && (
            <p className="text-sm mt-2">
              Essayez un autre titre ou{" "}
              <button
                onClick={clearFilters}
                className={`underline ${styles.clearFiltersLink}`}
                type="button"
              >
                effacez les filtres
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
