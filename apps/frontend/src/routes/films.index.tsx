import { createFileRoute } from '@tanstack/react-router'
import Films from '@/pages/Films'

export const Route = createFileRoute('/films/')({
  component: Films,
  validateSearch: (search: Record<string, unknown>) => ({
    search: (search.search as string) || undefined,
  }),
})
