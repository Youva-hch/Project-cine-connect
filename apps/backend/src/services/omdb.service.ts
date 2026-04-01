import 'dotenv/config';
import type { OMDbMovie, OMDbSearchItem, OMDbSearchResult, OMDbError } from '../types.js';

export type { OMDbMovie, OMDbSearchItem, OMDbSearchResult, OMDbError };

const OMDB_API_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.OMDB_API_KEY;
const CACHE_TTL_MS = Number.parseInt(process.env.OMDB_CACHE_TTL_MS ?? '3600000', 10); // 1h
const CACHE_MAX_ENTRIES = Number.parseInt(process.env.OMDB_CACHE_MAX_ENTRIES ?? '500', 10);

if (!API_KEY) {
  console.warn('OMDB_API_KEY is not set in environment variables');
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

    return this.omdbRequest<OMDbSearchResult>(params);
  }

  /**
   * Récupère les détails d'un film par son ID IMDb
   */
  static async getByImdbId(imdbId: string): Promise<OMDbMovie> {
    return this.omdbRequest<OMDbMovie>({
      i: imdbId,
    });
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

    return this.omdbRequest<OMDbMovie>(params);
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





