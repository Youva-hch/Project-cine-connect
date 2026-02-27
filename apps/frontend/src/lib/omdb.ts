const API_BASE = import.meta.env.VITE_API_URL || '';

export interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbMovieDetail {
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
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string;
}

export interface OmdbSearchResult {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

async function callOmdb(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/omdb/search?${query}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'OMDb error');
  return json.data;
}

async function callOmdbMovie(imdbId: string) {
  const url = `${API_BASE}/omdb/movie/${encodeURIComponent(imdbId)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'OMDb error');
  return json.data;
}

export async function searchMovies(query: string, page = 1): Promise<OmdbSearchResult> {
  return callOmdb({ s: query, page: String(page), type: 'movie' });
}

export async function getMovieById(imdbId: string): Promise<OmdbMovieDetail> {
  return callOmdbMovie(imdbId);
}

export async function searchByGenre(genre: string, page = 1): Promise<OmdbSearchResult> {
  return callOmdb({ s: genre, page: String(page), type: 'movie' });
}
