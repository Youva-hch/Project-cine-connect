import { useQuery } from '@tanstack/react-query'
import { filmsApi } from '@/api/films.api'
import type { FilmsQueryParams } from '@/types'

export function useFilms(params?: FilmsQueryParams) {
  return useQuery({
    queryKey: ['films', params],
    queryFn: () => filmsApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  })
}

export function useFilm(id: number) {
  return useQuery({
    queryKey: ['film', id],
    queryFn: () => filmsApi.getById(id),
    enabled: !!id,
    retry: 2,
  })
}

export function useFilmsByCategory(category: string) {
  return useQuery({
    queryKey: ['films', 'category', category],
    queryFn: () => filmsApi.getByCategory(category),
    enabled: !!category,
    retry: 2,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => filmsApi.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  })
}

export function useFilmReviews(filmId: number) {
  return useQuery({
    queryKey: ['reviews', filmId],
    queryFn: () => filmsApi.getReviews(filmId),
    enabled: !!filmId,
    retry: 2,
  })
}

