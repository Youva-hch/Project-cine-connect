import { createFileRoute } from '@tanstack/react-router'
import PublicProfile from '@/pages/Profile/PublicProfile'

export const Route = createFileRoute('/profil/$id')({
  component: PublicProfile,
})
