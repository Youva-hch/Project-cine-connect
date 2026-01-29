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
    const response = await apiRequest<{ success: boolean; data: AuthResponse; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la connexion')
    }
    
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<{ success: boolean; data: AuthResponse; message?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de l\'inscription')
    }
    
    return response.data
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

