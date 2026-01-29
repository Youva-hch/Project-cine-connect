import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/films/$categorie')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/films/$categorie"!</div>
}
