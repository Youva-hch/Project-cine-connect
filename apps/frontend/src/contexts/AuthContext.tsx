import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/api/auth.api'
import type { User } from '@/api/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      try {
        // Vérifier d'abord dans localStorage
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (storedUser && token) {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            // Vérifier que le token est toujours valide
            await authApi.getCurrentUser()
          } catch {
            // Si le token n'est plus valide, nettoyer
            authApi.logout()
          }
        } else {
          // Essayer de récupérer depuis l'API
          const currentUser = await authApi.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
          }
        }
      } catch (error) {
        // Erreur silencieuse si l'utilisateur n'est pas connecté ou si l'API n'est pas disponible
        // Ne pas bloquer le rendu de l'application
        authApi.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password })
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

