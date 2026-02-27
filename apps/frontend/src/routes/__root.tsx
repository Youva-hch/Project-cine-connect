import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '../components'
import { useState, useRef, useEffect } from 'react'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <nav className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-primary">
                  CinéConnect
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Accueil
                </Link>
                <Link
                  to="/search"
                  search={{ q: '', page: 1 }}
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Recherche
                </Link>
                <Link
                  to="/films"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Films
                </Link>
                {!isLoading &&
                  (user ? (
                    <>
                      <Link
                        to="/discussion"
                        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Discussion
                      </Link>
                      <div className="relative" ref={menuRef}>
                        <button
                          type="button"
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span>{user.name}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isMenuOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                            <div className="py-1">
                              <Link
                                to="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                Mon profil
                              </Link>
                              <div className="border-t border-border my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsMenuOpen(false)
                                  logout()
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-accent transition-colors text-left"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                  />
                                </svg>
                                Déconnexion
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Connexion
                    </Link>
                  ))}
                <ThemeToggle />
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
