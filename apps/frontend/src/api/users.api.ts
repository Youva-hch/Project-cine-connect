import apiRequest from './config'
import type { User } from './types'

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiRequest<{ success: boolean; data: User[] }>('/users')
    return response.data || []
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiRequest<{ success: boolean; data: User }>(`/users/${id}`)
    if (!response.success || !response.data) {
      throw new Error('Utilisateur non trouvé')
    }
    return response.data
  },

  updateProfile: async (_id: number, data: Partial<User>): Promise<User> => {
    const response = await apiRequest<{ success: boolean; data: User; message?: string }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la mise à jour du profil')
    }
    
    return response.data
  },
}





