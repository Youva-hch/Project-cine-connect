import 'dotenv/config';

const OMDB_API_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.OMDB_API_KEY;

if (!API_KEY) {
  console.warn('OMDB_API_KEY is not set in environment variables');
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

/**
 * Service pour interagir avec l'API OMDb
 */
export class OMDbService {
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

    try {
      const response = await fetch(`${OMDB_API_URL}?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`OMDb API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Vérifier si OMDb a retourné une erreur
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Unknown OMDb API error');
      }

      return data as T;
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





