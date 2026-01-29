import apiRequest from './config'
import type { User } from './types'

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
  user: User
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // TODO: Implémenter l'endpoint backend
    // return apiRequest<AuthResponse>('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials),
    // })
    
    // Simulation pour l'instant
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-token-123',
          user: {
            id: 1,
            email: credentials.email,
            name: 'User',
            avatarUrl: null,
            bio: null,
            isOnline: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }, 1000)
    })
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // TODO: Implémenter l'endpoint backend
    // return apiRequest<AuthResponse>('/auth/register', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // })
    
    // Simulation pour l'instant
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-token-123',
          user: {
            id: 1,
            email: data.email,
            name: data.name,
            avatarUrl: null,
            bio: null,
            isOnline: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }, 1000)
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token')
    if (!token) return null

    try {
      const response = await apiRequest<{ success: boolean; data: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      // Si l'API n'est pas disponible ou le token invalide, utiliser localStorage
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
  },
}

