import { useQuery } from '@tanstack/react-query'

export function TestComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      // Simule une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        message: 'TanStack Query fonctionne !',
        timestamp: new Date().toISOString(),
      }
    },
  })

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">Chargement...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Une erreur est survenue</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-green-900">
        ✅ Configuration réussie !
      </h2>
      <div className="space-y-2">
        <p className="text-green-800">
          <strong>React + Vite :</strong> ✅ Fonctionnel
        </p>
        <p className="text-green-800">
          <strong>TanStack Query :</strong> ✅ {data?.message}
        </p>
        <p className="text-green-800">
          <strong>TanStack Router :</strong> ✅ Fonctionnel
        </p>
        <p className="text-green-800">
          <strong>TailwindCSS :</strong> ✅ Styles appliqués
        </p>
        <p className="text-green-800">
          <strong>TypeScript :</strong> ✅ Configuration stricte
        </p>
        <p className="text-sm text-green-600 mt-4">
          Timestamp: {data?.timestamp}
        </p>
      </div>
    </div>
  )
}

