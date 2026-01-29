import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/api/types'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

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
          isOnline: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        loginWithToken(token, user)
        navigate({ to: '/', replace: true })
        return
      } catch {
        // invalid user payload
      }
    }
    navigate({ to: '/login', replace: true })
  }, [loginWithToken, navigate])

  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="animate-spin h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
      <p className="ml-3 text-gray-600">Connexion en cours...</p>
    </div>
  )
}
