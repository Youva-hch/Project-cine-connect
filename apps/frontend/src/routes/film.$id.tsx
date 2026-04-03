import { createFileRoute } from '@tanstack/react-router'
import FilmDetail from '@/pages/FilmDetail'

export const Route = createFileRoute('/film/$id')({
  component: FilmDetail,
})
