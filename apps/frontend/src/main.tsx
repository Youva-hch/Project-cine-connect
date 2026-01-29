import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AuthProvider } from '@/context/AuthContext'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

// Créer le client Query avec gestion d'erreurs améliorée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Ne pas réessayer si c'est une erreur 401/403 (non autorisé)
        if (error instanceof Error && error.message.includes('401')) {
          return false
        }
        // Réessayer jusqu'à 2 fois pour les autres erreurs
        return failureCount < 2
      },
      staleTime: 1000 * 60 * 5, // 5 minutes par défaut
      gcTime: 1000 * 60 * 30, // 30 minutes (anciennement cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})

// Créer le router
const router = createRouter({ routeTree })

// Déclarer le type du router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
