import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { login as apiLogin } from '@/api/auth'

const API_BASE =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'auth_failed') {
      const msg = params.get('message')
      let text = msg
        ? `Connexion Google échouée : ${msg}`
        : 'La connexion avec Google a échoué. Réessayez ou connectez-vous avec email.'
      if (msg && (msg.includes('users') || msg.includes('relation') || msg.includes('Failed query'))) {
        text += ' Exécutez les migrations : pnpm db:migrate (à la racine du projet, avec la base démarrée).'
      }
      setError(text)
    }
  }, [])

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Renseignez email et mot de passe.')
      return
    }
    setLoading(true)
    try {
      const result = await apiLogin({ email: email.trim(), password })
      if ('error' in result) {
        setError(result.error)
        return
      }
      login(result.token, result.user)
      navigate({ to: '/' })
    } catch {
      setError('Erreur lors de la connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Connexion
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Connectez-vous avec votre email ou Google.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-100 text-gray-500">ou</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Se connecter avec Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Vous n'avez pas de compte ?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}
