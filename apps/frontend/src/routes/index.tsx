import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="px-4 py-8">
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Bienvenue sur CinéConnect
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Découvrez des films, explorez les fiches et gardez vos préférences.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Connexion / Inscription
        </Link>
      </section>

      <section className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-2">
        <Link
          to="/search"
          className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Recherche
          </h2>
          <p className="text-gray-600">
            Trouvez des films par titre avec l’API OMDb.
          </p>
        </Link>
        <Link
          to="/profile"
          className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mon profil
          </h2>
          <p className="text-gray-600">
            Personnalisez votre profil et vos préférences.
          </p>
        </Link>
      </section>
    </div>
  )
}
