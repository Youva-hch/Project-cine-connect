import type { Request } from 'express';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

/** Payload encodé dans les JWT access/refresh. */
export interface JwtPayload {
  userId: number;
  email: string;
}

/** Représentation publique d'un utilisateur (sans mot de passe). */
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio?: string | null;
}

// ─── Films ───────────────────────────────────────────────────────────────────

export interface FilmQueryParams {
  search?: string;
  category?: string;
  year?: number;
  yearMin?: number;
  yearMax?: number;
  ratingMin?: number;
  ratingMax?: number;
  page?: number;
  limit?: number;
}

// ─── OMDb ────────────────────────────────────────────────────────────────────

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

export interface OMDbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OMDbSearchResult {
  Search: OMDbSearchItem[];
  totalResults: string;
  Response: string;
}

export interface OMDbError {
  Response: string;
  Error: string;
}
