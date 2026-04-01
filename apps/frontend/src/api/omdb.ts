/**
 * Service pour consommer l'API OMDb (via le backend).
 * Les appels passent par le backend qui possède la clé API OMDb.
 */

import type { OMDbMovie, OMDbSearchItem, OMDbSearchResult, SearchParams } from '../types'

export type { OMDbMovie, OMDbSearchItem, OMDbSearchResult, SearchParams }

const API_BASE = (import.meta.env.VITE_API_URL as string) || ''

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

/**
 * Recherche de films via l'API OMDb (backend).
 */
export async function searchFilms(params: SearchParams): Promise<OMDbSearchResult> {
  const searchParams = new URLSearchParams()
  searchParams.set('s', params.s)
  if (params.page != null) searchParams.set('page', String(params.page))
  if (params.type) searchParams.set('type', params.type)
  if (params.year != null) searchParams.set('year', String(params.year))

  const url = `${API_BASE}/api/omdb/search?${searchParams.toString()}`
  return fetchApi<OMDbSearchResult>(url)
}

/**
 * Récupère les détails d'un film par ID IMDb.
 */
export async function getFilmByImdbId(imdbId: string): Promise<OMDbMovie> {
  const encoded = encodeURIComponent(imdbId)
  const url = `${API_BASE}/api/omdb/movie/${encoded}`
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
  const url = `${API_BASE}/api/omdb/movie/title/${encodedTitle}${searchParams}`
  return fetchApi<OMDbMovie>(url)
}
