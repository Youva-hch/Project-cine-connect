import apiRequest from './config'
import type { User } from './types'

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return apiRequest<User[]>('/users')
  },

  getById: async (id: number): Promise<User> => {
    return apiRequest<User>(`/users/${id}`)
  },

  updateProfile: async (id: number, data: Partial<User>): Promise<User> => {
    // TODO: Implémenter l'endpoint backend
    // return apiRequest<User>(`/users/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(data),
    // })
    
    // Simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          ...data,
          email: data.email || 'user@example.com',
          name: data.name || 'User',
          avatarUrl: data.avatarUrl || null,
          bio: data.bio || null,
          isOnline: data.isOnline ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User)
      }, 500)
    })
  },
}



