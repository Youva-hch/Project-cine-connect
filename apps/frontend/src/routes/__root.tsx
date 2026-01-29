import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useEffect, useState } from 'react'
import { testBackendConnection } from '@/utils/testConnection'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean
    success: boolean
    message: string
  }>({ checked: false, success: false, message: '' })

  // Tester la connexion au backend au chargement
  useEffect(() => {
    testBackendConnection().then((result) => {
      setConnectionStatus({
        checked: true,
        success: result.success,
        message: result.message,
      })
      if (!result.success) {
        console.error('❌ Problème de connexion au backend:', result)
      } else {
        console.log('✅ Connexion au backend OK:', result.details)
      }
    })
  }, [])

  // Afficher un loader pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {connectionStatus.checked && !connectionStatus.success && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-red-800 dark:text-red-200">
              ⚠️ {connectionStatus.message}
            </p>
            <button
              onClick={() => {
                testBackendConnection().then((result) => {
                  setConnectionStatus({
                    checked: true,
                    success: result.success,
                    message: result.message,
                  })
                })
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                  CinéConnect
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Accueil
                </Link>
                <Link
                  to="/films"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Films
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/discussion"
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Discussion
                    </Link>
                    <Link
                      to="/profile"
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Profil
                    </Link>
                  </>
                )}
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
                    <button
                      onClick={logout}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-md text-sm font-medium border border-indigo-600 dark:border-indigo-400"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
