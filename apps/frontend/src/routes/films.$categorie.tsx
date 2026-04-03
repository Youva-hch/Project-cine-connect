import { createFileRoute } from '@tanstack/react-router'
import FilmsByCategory from '@/pages/FilmsByCategory'

export const Route = createFileRoute('/films/$categorie')({
  component: FilmsByCategory,
})
