import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '../components'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { user, logout, isLoading } = useAuth()

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
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span>{user.name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Déconnexion
                      </button>
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
