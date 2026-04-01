import { apiRequest } from './config'
import type { Film, Category, Review, FilmsQueryParams, FilmsListResponse } from '../types'

export type { FilmsQueryParams, FilmsListResponse }

export const filmsApi = {
  getAll: async (params?: FilmsQueryParams): Promise<FilmsListResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.year != null) queryParams.append('year', params.year.toString())
    if (params?.yearMin != null) queryParams.append('yearMin', params.yearMin.toString())
    if (params?.yearMax != null) queryParams.append('yearMax', params.yearMax.toString())
    if (params?.ratingMin != null) queryParams.append('ratingMin', params.ratingMin.toString())
    if (params?.ratingMax != null) queryParams.append('ratingMax', params.ratingMax.toString())
    if (params?.page != null) queryParams.append('page', params.page.toString())
    if (params?.limit != null) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const response = await apiRequest<{ success: boolean; data: Film[]; pagination: FilmsListResponse['pagination'] }>(
      `/api/films${queryString ? `?${queryString}` : ''}`
    )
    return {
      data: response.data || [],
      pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  },

  getById: async (id: number): Promise<Film & { categories?: { categoryId: number; name: string; slug: string }[] }> => {
    const response = await apiRequest<{ success: boolean; data: Film }>(`/api/films/${id}`)
    if (!response.data) {
      throw new Error('Film non trouvé')
    }
    return response.data
  },

  getByCategory: async (category: string): Promise<Film[]> => {
    const response = await apiRequest<{ success: boolean; data: Film[] }>(
      `/api/films/category/${category}`
    )
    return response.data || []
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiRequest<{ success: boolean; data: Category[] }>('/categories')
    return response.data || []
  },

  getReviews: async (filmId: number): Promise<Review[]> => {
    const response = await apiRequest<{ success: boolean; data: Review[] }>(
      `/api/films/${filmId}/reviews`
    )
    return response.data || []
  },
}

