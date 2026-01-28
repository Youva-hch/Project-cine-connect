/**
 * Service pour consommer l'API OMDb (via le backend).
 * Les appels passent par le backend qui possède la clé API OMDb.
 */

const API_BASE =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'

// Types alignés sur les réponses du backend (provenant d'OMDb)
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

interface ApiSuccess<T> {
  success: true
  data: T
}

interface ApiError {
  success: false
  message: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiError

function isApiError<T>(res: ApiResponse<T>): res is ApiError {
  return res.success === false
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const json: ApiResponse<T> = await response.json()

  if (!response.ok) {
    const message = isApiError(json) ? json.message : response.statusText
    throw new Error(message)
  }

  if (isApiError(json)) {
    throw new Error(json.message)
  }

  return json.data
}

export interface SearchParams {
  s: string
  page?: number
  type?: 'movie' | 'series' | 'episode'
  year?: number
}

/**
 * Recherche de films via l'API OMDb (backend).
 */
export async function searchFilms(params: SearchParams): Promise<OMDbSearchResult> {
  const searchParams = new URLSearchParams()
  searchParams.set('s', params.s)
  if (params.page != null) searchParams.set('page', String(params.page))
  if (params.type) searchParams.set('type', params.type)
  if (params.year != null) searchParams.set('year', String(params.year))

  const url = `${API_BASE}/omdb/search?${searchParams.toString()}`
  return fetchApi<OMDbSearchResult>(url)
}

/**
 * Récupère les détails d'un film par ID IMDb.
 */
export async function getFilmByImdbId(imdbId: string): Promise<OMDbMovie> {
  const encoded = encodeURIComponent(imdbId)
  const url = `${API_BASE}/omdb/movie/${encoded}`
  return fetchApi<OMDbMovie>(url)
}

/**
 * Récupère les détails d'un film par titre.
 */
export async function getFilmByTitle(
  title: string,
  year?: number
): Promise<OMDbMovie> {
  const encodedTitle = encodeURIComponent(title)
  const searchParams = year != null ? `?year=${year}` : ''
  const url = `${API_BASE}/omdb/movie/title/${encodedTitle}${searchParams}`
  return fetchApi<OMDbMovie>(url)
}
