import { createFileRoute } from '@tanstack/react-router'
import Discussion from '@/pages/Discussion'

export const Route = createFileRoute('/discussion')({
  component: Discussion,
  validateSearch: (search: Record<string, unknown>) => ({
    with: search.with ? String(search.with) : undefined,
  }),
})
