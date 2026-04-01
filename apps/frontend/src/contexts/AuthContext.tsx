import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api/auth.api'
import type { User } from '@/types'
import { getUserCookie, setUserCookie } from '@/lib/userCookie'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithToken: (token: string, user: User, refreshToken?: string) => void
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
        // Vérifier d'abord dans le cookie
        const storedUser = getUserCookie()
        const token = localStorage.getItem('token')
        
        if (storedUser && token) {
          try {
            setUser(storedUser)
            // Vérifier que le token est toujours valide
            const currentUser = await authApi.getCurrentUser()
            if (currentUser) {
              setUser(currentUser)
              setUserCookie(currentUser)
            }
          } catch {
            // Si le token n'est plus valide, nettoyer
            authApi.logout()
          }
        } else if (token) {
          const currentUser = await authApi.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            setUserCookie(currentUser)
          }
        }
        // Ne pas appeler getCurrentUser() si pas de token pour éviter les erreurs inutiles
      } catch {
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
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
    setUserCookie(response.user)
    setUser(response.user)
  }

  const loginWithToken = (token: string, user: User, refreshToken?: string) => {
    localStorage.setItem('token', token)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
    setUserCookie(user)
    setUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password })
    localStorage.setItem('token', response.token)
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
    setUserCookie(response.user)
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
        loginWithToken,
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

