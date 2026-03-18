export default function DiscussionPage() {
  const messages = [
    {
      id: 1,
      author: "Inès",
      content: "J’ai adoré le dernier Batman, l’ambiance était incroyable.",
      time: "20:14",
    },
    {
      id: 2,
      author: "Yassine",
      content: "Moi aussi, surtout la photographie et la musique.",
      time: "20:16",
    },
    {
      id: 3,
      author: "Narimen",
      content: "Vous avez une recommandation dans le même style ?",
      time: "20:18",
    },
  ];

  return (
    <div className="min-h-screen bg-black px-6 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">
            Communauté
          </p>
          <h1 className="text-5xl font-black tracking-tight">Discussion</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Échangez avec d’autres passionnés de cinéma, partagez vos avis et découvrez de nouvelles recommandations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Salons</h2>

            <div className="mt-5 space-y-3">
              {["Général", "Films d’action", "Drames", "Science-fiction", "Horreur"].map(
                (room) => (
                  <button
                    key={room}
                    className={`w-full rounded-xl px-4 py-3 text-left transition ${
                      room === "Général"
                        ? "bg-red-600 text-white"
                        : "bg-black/40 text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {room}
                  </button>
                )
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-2xl font-bold">Salon Général</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Discutez librement de films, séries et recommandations.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl bg-black/40 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {message.author}
                    </span>
                    <span className="text-xs text-zinc-500">{message.time}</span>
                  </div>

                  <p className="text-zinc-300">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Écrire un message..."
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
              />
              <button className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
                Envoyer
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
