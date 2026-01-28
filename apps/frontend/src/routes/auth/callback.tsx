import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/api/auth'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userStr = params.get('user')

    if (token && userStr) {
      try {
        const decoded = JSON.parse(decodeURIComponent(userStr)) as Record<string, unknown>
        const user: User = {
          id: decoded.id as number,
          email: decoded.email as string,
          name: decoded.name as string,
          avatarUrl: (decoded.avatarUrl as string) ?? null,
          bio: (decoded.bio as string) ?? null,
        }
        login(token, user)
        navigate({ to: '/', replace: true })
        return
      } catch {
        // invalid user payload
      }
    }
    navigate({ to: '/login', replace: true })
  }, [login, navigate])

  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="animate-spin h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
      <p className="ml-3 text-gray-600">Connexion en cours...</p>
    </div>
  )
}
