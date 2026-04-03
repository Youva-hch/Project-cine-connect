import { createFileRoute } from '@tanstack/react-router'
import AuthCallback from '@/pages/AuthCallback'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || undefined,
    refreshToken: (search.refreshToken as string) || undefined,
    user: (search.user as string) || undefined,
  }),
})
