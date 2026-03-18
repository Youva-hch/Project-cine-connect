export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-black px-6 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">
            Mon espace
          </p>
          <h1 className="text-5xl font-black tracking-tight">Profil</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Retrouvez ici vos informations, vos préférences et votre activité sur CineConnect.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-3xl font-bold text-white">
                N
              </div>

              <h2 className="mt-4 text-2xl font-bold">Narimen</h2>
              <p className="mt-1 text-sm text-zinc-400">Membre CineConnect</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
              <h3 className="text-2xl font-bold">Informations</h3>
              <div className="mt-4 space-y-3 text-zinc-300">
                <p>
                  <span className="font-semibold text-white">Nom :</span> Narimen
                </p>
                <p>
                  <span className="font-semibold text-white">Email :</span> narimen@email.com
                </p>
                <p>
                  <span className="font-semibold text-white">Statut :</span> Actif
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
              <h3 className="text-2xl font-bold">Préférences cinéma</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {["Action", "Drame", "Science-fiction", "Thriller"].map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
              <h3 className="text-2xl font-bold">Activité</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-black/40 p-4 text-center">
                  <p className="text-3xl font-black text-red-500">12</p>
                  <p className="mt-2 text-sm text-zinc-400">Films vus</p>
                </div>

                <div className="rounded-xl bg-black/40 p-4 text-center">
                  <p className="text-3xl font-black text-red-500">5</p>
                  <p className="mt-2 text-sm text-zinc-400">Avis publiés</p>
                </div>

                <div className="rounded-xl bg-black/40 p-4 text-center">
                  <p className="text-3xl font-black text-red-500">4</p>
                  <p className="mt-2 text-sm text-zinc-400">Genres favoris</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
