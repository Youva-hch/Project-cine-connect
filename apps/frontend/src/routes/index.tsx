import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-foreground mb-4">
            Bienvenue sur <span className="text-primary">CinéConnect</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez, notez et partagez vos films préférés avec une communauté de passionnés de cinéma
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Créer un compte
            </Link>
            <Link
              to="/films"
              className="px-6 py-3 bg-card text-foreground border-2 border-primary rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Explorer les films
            </Link>
            <Link
              to="/search"
              className="px-6 py-3 bg-card text-foreground border-2 border-primary rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Rechercher
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Catalogue Complet</h3>
            <p className="text-muted-foreground">
              Explorez une vaste collection de films avec des détails complets
            </p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Notez et Commentez</h3>
            <p className="text-muted-foreground">
              Partagez vos avis et découvrez ce que pensent les autres
            </p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-border">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Réseau Social</h3>
            <p className="text-muted-foreground">
              Connectez-vous avec d'autres cinéphiles et discutez en temps réel
            </p>
          </div>
        </div>

        {/* Popular Films Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Films Populaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Inception', year: 2010, rating: 4.5 },
              { title: 'The Dark Knight', year: 2008, rating: 4.8 },
              { title: 'Pulp Fiction', year: 1994, rating: 4.6 },
              { title: 'The Matrix', year: 1999, rating: 4.7 },
            ].map((film, index) => (
              <div
                key={index}
                className="bg-card rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow cursor-pointer border border-border"
              >
                <div className="aspect-[2/3] bg-muted rounded mb-3 flex items-center justify-center text-muted-foreground text-sm">
                  Affiche
                </div>
                <h4 className="font-semibold text-foreground mb-1">{film.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{film.year}</p>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-sm font-medium text-foreground">{film.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              to="/films"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Voir tous les films →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
