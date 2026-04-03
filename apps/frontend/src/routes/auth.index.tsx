import { createFileRoute } from '@tanstack/react-router'
import Auth from '@/pages/Auth'

export const Route = createFileRoute('/auth/')({
  component: Auth,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as string) || undefined,
    token: (search.token as string) || undefined,
    email: (search.email as string) || undefined,
    error: (search.error as string) || undefined,
    message: (search.message as string) || undefined,
  }),
})
