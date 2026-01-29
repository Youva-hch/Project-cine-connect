import apiRequest from './config'
import type { Film, Category, Review } from './types'

export interface FilmsQueryParams {
  search?: string
  category?: string
  page?: number
  limit?: number
}

export const filmsApi = {
  getAll: async (params?: FilmsQueryParams): Promise<Film[]> => {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const response = await apiRequest<{ success: boolean; data: Film[] }>(
      `/films${queryString ? `?${queryString}` : ''}`
    )
    return response.data || []
  },

  getById: async (id: number): Promise<Film> => {
    const response = await apiRequest<{ success: boolean; data: Film }>(`/films/${id}`)
    if (!response.data) {
      throw new Error('Film non trouvé')
    }
    return response.data
  },

  getByCategory: async (category: string): Promise<Film[]> => {
    const response = await apiRequest<{ success: boolean; data: Film[] }>(
      `/films/category/${category}`
    )
    return response.data || []
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiRequest<{ success: boolean; data: Category[] }>('/categories')
    return response.data || []
  },

  getReviews: async (filmId: number): Promise<Review[]> => {
    const response = await apiRequest<{ success: boolean; data: Review[] }>(
      `/films/${filmId}/reviews`
    )
    return response.data || []
  },
}

