import 'dotenv/config';

const OMDB_API_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.OMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const CACHE_TTL_MS = Number.parseInt(process.env.OMDB_CACHE_TTL_MS ?? '3600000', 10); // 1h
const CACHE_MAX_ENTRIES = Number.parseInt(process.env.OMDB_CACHE_MAX_ENTRIES ?? '500', 10);

if (!API_KEY) {
  console.warn('OMDB_API_KEY is not set in environment variables');
}
if (!TMDB_API_KEY && !TMDB_BEARER_TOKEN) {
  console.warn('TMDB_API_KEY/TMDB_BEARER_TOKEN is not set in environment variables');
}

export interface OMDbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export interface OMDbSearchResult {
  Search: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults: string;
  Response: string;
}

export interface OMDbError {
  Response: string;
  Error: string;
}

export class OMDbApiError extends Error {
  public readonly statusCode: number;
  public readonly omdbMessage?: string;

  constructor(message: string, statusCode: number, omdbMessage?: string) {
    super(message);
    this.name = 'OMDbApiError';
    this.statusCode = statusCode;
    this.omdbMessage = omdbMessage;
  }
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Service pour interagir avec l'API OMDb
 */
export class OMDbService {
  private static cache = new Map<string, CacheEntry<unknown>>();
  private static isOmdbQuotaError(error: unknown): boolean {
    return (
      error instanceof OMDbApiError &&
      (error.statusCode === 401 ||
        error.omdbMessage?.toLowerCase().includes('request limit reached') === true)
    );
  }

  private static async tmdbRequest<T>(
    path: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const searchParams = new URLSearchParams({
      language: 'fr-FR',
      ...params,
    });

    if (TMDB_API_KEY) {
      searchParams.set('api_key', TMDB_API_KEY);
    } else if (TMDB_BEARER_TOKEN) {
      headers.Authorization = `Bearer ${TMDB_BEARER_TOKEN}`;
    } else {
      throw new Error('TMDB API key/token is not configured.');
    }

    const response = await fetch(`${TMDB_API_URL}${path}?${searchParams.toString()}`, {
      headers,
    });

    const data = (await response.json().catch(() => null)) as T | null;
    if (!response.ok || !data) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return data;
  }

  private static tmdbPosterUrl(path: string | null | undefined): string {
    return path ? `${TMDB_IMAGE_BASE_URL}${path}` : 'N/A';
  }

  private static mapTmdbMovieDetailToOmdb(
    detail: {
      id: number;
      title: string;
      release_date?: string;
      runtime?: number;
      genres?: Array<{ name: string }>;
      overview?: string;
      poster_path?: string | null;
      vote_average?: number;
      vote_count?: number;
      imdb_id?: string | null;
      production_countries?: Array<{ name: string }>;
      credits?: {
        cast?: Array<{ name: string }>;
        crew?: Array<{ name: string; job: string; department: string }>;
      };
    }
  ): OMDbMovie {
    const director =
      detail.credits?.crew?.find((person) => person.job === 'Director')?.name ?? 'N/A';
    const writers = detail.credits?.crew
      ?.filter((person) => person.job === 'Writer' || person.job === 'Screenplay')
      .slice(0, 3)
      .map((person) => person.name)
      .join(', ');
    const actors = detail.credits?.cast?.slice(0, 5).map((person) => person.name).join(', ');

    return {
      Title: detail.title ?? 'N/A',
      Year: detail.release_date?.slice(0, 4) ?? 'N/A',
      Rated: 'N/A',
      Released: detail.release_date ?? 'N/A',
      Runtime: detail.runtime ? `${detail.runtime} min` : 'N/A',
      Genre: detail.genres?.map((genre) => genre.name).join(', ') || 'N/A',
      Director: director,
      Writer: writers || 'N/A',
      Actors: actors || 'N/A',
      Plot: detail.overview || 'N/A',
      Language: 'N/A',
      Country: detail.production_countries?.map((country) => country.name).join(', ') || 'N/A',
      Awards: 'N/A',
      Poster: this.tmdbPosterUrl(detail.poster_path),
      Ratings: [],
      Metascore: 'N/A',
      imdbRating:
        typeof detail.vote_average === 'number' ? detail.vote_average.toFixed(1) : 'N/A',
      imdbVotes:
        typeof detail.vote_count === 'number' ? String(detail.vote_count) : 'N/A',
      imdbID: detail.imdb_id || `tmdb-${detail.id}`,
      Type: 'movie',
      DVD: 'N/A',
      BoxOffice: 'N/A',
      Production: 'N/A',
      Website: 'N/A',
      Response: 'True',
    };
  }

  private static async searchViaTmdb(
    searchTerm: string,
    options?: {
      page?: number;
      year?: number;
    }
  ): Promise<OMDbSearchResult> {
    const data = await this.tmdbRequest<{
      page: number;
      total_results: number;
      results: Array<{
        id: number;
        title: string;
        release_date?: string;
        poster_path?: string | null;
      }>;
    }>('/search/movie', {
      query: searchTerm,
      page: String(options?.page ?? 1),
      ...(options?.year ? { primary_release_year: String(options.year) } : {}),
    });

    return {
      Search: (data.results ?? []).map((movie) => ({
        Title: movie.title,
        Year: movie.release_date?.slice(0, 4) ?? 'N/A',
        imdbID: `tmdb-${movie.id}`,
        Type: 'movie',
        Poster: this.tmdbPosterUrl(movie.poster_path),
      })),
      totalResults: String(data.total_results ?? 0),
      Response: data.results?.length ? 'True' : 'False',
    };
  }

  private static async getByImdbIdViaTmdb(imdbId: string): Promise<OMDbMovie> {
    const normalizedId = imdbId.startsWith('tmdb-') ? imdbId.slice(5) : imdbId;

    if (/^\d+$/.test(normalizedId)) {
      const detail = await this.tmdbRequest<{
        id: number;
        title: string;
        release_date?: string;
        runtime?: number;
        genres?: Array<{ name: string }>;
        overview?: string;
        poster_path?: string | null;
        vote_average?: number;
        vote_count?: number;
        imdb_id?: string | null;
        production_countries?: Array<{ name: string }>;
        credits?: {
          cast?: Array<{ name: string }>;
          crew?: Array<{ name: string; job: string; department: string }>;
        };
      }>(`/movie/${normalizedId}`, { append_to_response: 'credits' });
      return this.mapTmdbMovieDetailToOmdb(detail);
    }

    const findResult = await this.tmdbRequest<{
      movie_results?: Array<{ id: number }>;
    }>(`/find/${encodeURIComponent(normalizedId)}`, {
      external_source: 'imdb_id',
    });

    const tmdbMovieId = findResult.movie_results?.[0]?.id;
    if (!tmdbMovieId) {
      throw new Error(`TMDB: no movie found for IMDb id ${imdbId}`);
    }

    const detail = await this.tmdbRequest<{
      id: number;
      title: string;
      release_date?: string;
      runtime?: number;
      genres?: Array<{ name: string }>;
      overview?: string;
      poster_path?: string | null;
      vote_average?: number;
      vote_count?: number;
      imdb_id?: string | null;
      production_countries?: Array<{ name: string }>;
      credits?: {
        cast?: Array<{ name: string }>;
        crew?: Array<{ name: string; job: string; department: string }>;
      };
    }>(`/movie/${tmdbMovieId}`, { append_to_response: 'credits' });

    return this.mapTmdbMovieDetailToOmdb(detail);
  }

  private static async getByTitleViaTmdb(title: string, year?: number): Promise<OMDbMovie> {
    const searchResult = await this.searchViaTmdb(title, { page: 1, year });
    const first = searchResult.Search?.[0];
    if (!first) {
      throw new Error('Movie not found!');
    }
    return this.getByImdbIdViaTmdb(first.imdbID);
  }

  private static getCacheKey(params: Record<string, string>): string {
    const sortedEntries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    return sortedEntries.map(([key, value]) => `${key}=${value}`).join('&');
  }

  private static getFromCache<T>(key: string): T | null {
    if (CACHE_TTL_MS <= 0) {
      return null;
    }

    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private static setCache<T>(key: string, data: T): void {
    if (CACHE_TTL_MS <= 0) {
      return;
    }

    // Politique FIFO simple pour limiter la mémoire
    if (this.cache.size >= CACHE_MAX_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheStats() {
    return {
      size: this.cache.size,
      ttlMs: CACHE_TTL_MS,
      maxEntries: CACHE_MAX_ENTRIES,
    };
  }

  static getCacheSnapshot(limit: number = 50) {
    const now = Date.now();
    const entries = Array.from(this.cache.entries())
      .slice(0, Math.max(0, limit))
      .map(([key, value]) => ({
        key,
        expiresInMs: Math.max(0, value.expiresAt - now),
      }));

    return {
      ...this.getCacheStats(),
      entries,
    };
  }

  /**
   * Effectue une requête à l'API OMDb
   */
  private static async omdbRequest<T>(params: Record<string, string>): Promise<T> {
    if (!API_KEY) {
      throw new Error('OMDb API key is not configured. Please set OMDB_API_KEY in your .env file.');
    }

    const searchParams = new URLSearchParams({
      apikey: API_KEY,
      ...params,
    });

    const cacheKey = this.getCacheKey(params);
    const cachedResult = this.getFromCache<T>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await fetch(`${OMDB_API_URL}?${searchParams.toString()}`);

      let data: ({ Response?: string; Error?: string } & T) | null = null;
      try {
        data = (await response.json()) as { Response?: string; Error?: string } & T;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const omdbErrorMessage = data?.Error;
        const statusMessage = response.status === 401
          ? 'OMDb request unauthorized. Verify your OMDB_API_KEY value, account activation, and daily quota.'
          : `OMDb API error: ${response.status} ${response.statusText}`;

        throw new OMDbApiError(statusMessage, response.status, omdbErrorMessage);
      }

      if (!data) {
        throw new OMDbApiError('OMDb API returned an unreadable response body', response.status);
      }

      // Vérifier si OMDb a retourné une erreur
      if (data.Response === 'False') {
        throw new OMDbApiError(data.Error || 'Unknown OMDb API error', response.status, data.Error);
      }

      const typedData = data as T;
      this.setCache(cacheKey, typedData);
      return typedData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch data from OMDb API');
    }
  }

  /**
   * Recherche des films par terme de recherche
   */
  static async search(
    searchTerm: string,
    options?: {
      page?: number;
      type?: 'movie' | 'series' | 'episode';
      year?: number;
    }
  ): Promise<OMDbSearchResult> {
    const params: Record<string, string> = {
      s: searchTerm,
    };

    if (options?.page) {
      params.page = options.page.toString();
    }

    if (options?.type) {
      params.type = options.type;
    }

    if (options?.year) {
      params.y = options.year.toString();
    }

    try {
      return await this.omdbRequest<OMDbSearchResult>(params);
    } catch (error) {
      if (!this.isOmdbQuotaError(error)) {
        throw error;
      }
      return this.searchViaTmdb(searchTerm, {
        page: options?.page,
        year: options?.year,
      });
    }
  }

  /**
   * Récupère les détails d'un film par son ID IMDb
   */
  static async getByImdbId(imdbId: string): Promise<OMDbMovie> {
    try {
      return await this.omdbRequest<OMDbMovie>({
        i: imdbId,
      });
    } catch (error) {
      if (!this.isOmdbQuotaError(error)) {
        throw error;
      }
      return this.getByImdbIdViaTmdb(imdbId);
    }
  }

  /**
   * Récupère les détails d'un film par son titre
   */
  static async getByTitle(title: string, year?: number): Promise<OMDbMovie> {
    const params: Record<string, string> = {
      t: title,
    };

    if (year) {
      params.y = year.toString();
    }

    try {
      return await this.omdbRequest<OMDbMovie>(params);
    } catch (error) {
      if (!this.isOmdbQuotaError(error)) {
        throw error;
      }
      return this.getByTitleViaTmdb(title, year);
    }
  }

  /**
   * Récupère plusieurs films populaires en recherchant par différents termes
   * Cette méthode récupère des films en utilisant plusieurs recherches
   */
  static async getPopularMovies(count: number = 150): Promise<OMDbMovie[]> {
    const movies: OMDbMovie[] = [];
    const seenImdbIds = new Set<string>();

    // Termes de recherche populaires pour obtenir une variété de films
    const searchTerms = [
      'action', 'comedy', 'drama', 'thriller', 'horror', 'sci-fi', 'romance',
      'adventure', 'fantasy', 'crime', 'mystery', 'war', 'western', 'animation',
      'superhero', 'marvel', 'batman', 'superman', 'spider', 'avengers',
      'inception', 'matrix', 'titanic', 'avatar', 'star wars', 'lord of the rings',
      'harry potter', 'pirates', 'transformers', 'fast', 'mission impossible',
      'james bond', 'terminator', 'alien', 'predator', 'jurassic', 'godzilla',
      'toy story', 'finding nemo', 'shrek', 'frozen', 'lion king', 'aladdin',
      'the godfather', 'pulp fiction', 'fight club', 'forrest gump', 'shawshank',
      'schindler', 'saving private ryan', 'gladiator', 'braveheart', 'troy',
      '300', 'apocalypse now', 'full metal jacket', 'platoon', 'black hawk down'
    ];

    console.log(`Début de la récupération de ${count} films depuis OMDb...`);

    for (const term of searchTerms) {
      if (movies.length >= count) break;

      try {
        // Rechercher le terme
        const searchResult = await this.search(term, { type: 'movie', page: 1 });

        if (searchResult.Search && searchResult.Search.length > 0) {
          // Récupérer les détails de chaque film trouvé
          for (const movie of searchResult.Search) {
            if (movies.length >= count) break;
            if (seenImdbIds.has(movie.imdbID)) continue; // Éviter les doublons

            try {
              // Ajouter un délai pour respecter les limites de l'API
              await new Promise(resolve => setTimeout(resolve, 200)); // 200ms entre chaque requête

              const movieDetails = await this.getByImdbId(movie.imdbID);
              movies.push(movieDetails);
              seenImdbIds.add(movie.imdbID);

              console.log(`[${movies.length}/${count}] Récupéré: ${movieDetails.Title} (${movieDetails.Year})`);

              // Si on a assez de films, arrêter
              if (movies.length >= count) break;
            } catch (error) {
              console.error(`Erreur lors de la récupération de ${movie.imdbID}:`, error);
              // Continuer avec le film suivant
            }
          }
        }

        // Si on a assez de films, arrêter
        if (movies.length >= count) break;
      } catch (error) {
        console.error(`Erreur lors de la recherche pour "${term}":`, error);
        // Continuer avec le terme suivant
      }
    }

    console.log(`Récupération terminée: ${movies.length} films récupérés`);
    return movies;
  }
}





