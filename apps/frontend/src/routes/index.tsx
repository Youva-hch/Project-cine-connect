import { createFileRoute } from '@tanstack/react-router'
import { TestComponent } from '@/components/TestComponent'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Bienvenue sur CinéConnect
        </h1>
        <TestComponent />
      </div>
    </div>
  )
}

