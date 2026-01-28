import { useQuery } from '@tanstack/react-query'
import {
  searchFilms,
  getFilmByImdbId,
  type SearchParams,
} from '../api/omdb'

const OMDB_QUERY_KEY = 'omdb' as const

/**
 * Hook pour la recherche de films (liste).
 * - Données mises en cache par TanStack Query
 * - États de chargement : isLoading, isFetching
 * - Erreurs : isError, error
 */
export function useFilms(params: SearchParams) {
  const { s: searchTerm, page, type, year } = params
  const enabled = Boolean(searchTerm?.trim())

  const query = useQuery({
    queryKey: [OMDB_QUERY_KEY, 'search', searchTerm, page, type, year],
    queryFn: () => searchFilms({ s: searchTerm!, page, type, year }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 min
  })

  return {
    ...query,
    films: query.data?.Search ?? [],
    totalResults: query.data?.totalResults
      ? parseInt(query.data.totalResults, 10)
      : 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  }
}

/**
 * Hook pour les détails d'un film par ID IMDb.
 * - Données mises en cache par TanStack Query
 * - États de chargement et erreurs gérés
 */
export function useFilmDetails(imdbId: string | undefined | null) {
  const enabled = Boolean(imdbId?.trim())

  const query = useQuery({
    queryKey: [OMDB_QUERY_KEY, 'movie', imdbId],
    queryFn: () => getFilmByImdbId(imdbId!),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 min pour les détails
  })

  return {
    ...query,
    film: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  }
}
