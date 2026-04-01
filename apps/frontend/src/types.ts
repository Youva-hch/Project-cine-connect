// ─── Entités de base ─────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  name: string
  passwordHash?: string
  avatarUrl: string | null
  bio: string | null
  isOnline: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Film {
  id: number
  title: string
  description: string | null
  director: string | null
  releaseYear: number | null
  durationMinutes: number | null
  posterUrl: string | null
  ratingAverage: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: number
  name: string
  description: string | null
  slug: string
  createdAt: Date
}

export interface Review {
  id: number
  userId: number
  filmId: number
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Friend {
  id: number
  userId: number
  friendId: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken?: string
  user: User
}

// ─── Films API ───────────────────────────────────────────────────────────────

export interface FilmsQueryParams {
  search?: string
  category?: string
  year?: number
  yearMin?: number
  yearMax?: number
  ratingMin?: number
  ratingMax?: number
  page?: number
  limit?: number
}

export interface FilmsListResponse {
  data: Film[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── OMDb ────────────────────────────────────────────────────────────────────

export interface OMDbMovie {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: Array<{ Source: string; Value: string }>
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: string
}

export interface OMDbSearchItem {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

export interface OMDbSearchResult {
  Search: OMDbSearchItem[]
  totalResults: string
  Response: string
}

export interface SearchParams {
  s: string
  page?: number
  type?: 'movie' | 'series' | 'episode'
  year?: number
}

// ─── Thème ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark'
