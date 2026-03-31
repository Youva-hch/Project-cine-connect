import { useTheme } from "../contexts/ThemeContext";

export default function AuthPage() {
  const { isLight } = useTheme();

  return (
    <div className={`min-h-screen px-6 pb-24 pt-28 ${isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-[#050507] text-white"}`}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="text-center">
          <div className="font-['Allura'] text-[3.1rem] leading-none tracking-[-0.02em] text-[#2fe29c] drop-shadow-[0_0_6px_rgba(47,226,156,0.08)]">
            CineConnect
          </div>
          <h1 className="mt-6 font-['Bebas_Neue'] text-5xl uppercase">Connexion</h1>
          <p className={`mt-4 ${isLight ? "text-slate-500" : "text-white/55"}`}>Content de te revoir</p>
        </div>

        <div
          className={`mt-8 w-full rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ${
            isLight ? "border border-slate-200 bg-white" : "border border-white/8 bg-[#13131a]"
          }`}
        >
          <button
            type="button"
            className={`flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-semibold ${
              isLight ? "border border-slate-200 bg-slate-50 text-slate-900" : "border border-white/10 bg-[#0f0f14] text-white"
            }`}
          >
            <span className="text-lg">G</span>
            Continuer avec Google
          </button>

          <div className={`my-6 flex items-center gap-4 ${isLight ? "text-slate-400" : "text-white/35"}`}>
            <div className={`h-px flex-1 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
            <span>ou</span>
            <div className={`h-px flex-1 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
          </div>

          <div className="space-y-4">
            <div>
              <label className={`mb-2 block text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>Email</label>
              <input
                type="email"
                placeholder="toi@exemple.com"
                className={`w-full rounded-xl px-4 py-4 outline-none ${
                  isLight
                    ? "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    : "border border-white/10 bg-[#0d0d12] text-white placeholder:text-white/20"
                }`}
              />
            </div>

            <div>
              <label className={`mb-2 block text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>Mot de passe</label>
              <input
                type="password"
                placeholder="........"
                className={`w-full rounded-xl px-4 py-4 outline-none ${
                  isLight
                    ? "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    : "border border-white/10 bg-[#0d0d12] text-white placeholder:text-white/20"
                }`}
              />
            </div>

            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-[#35c86d] px-5 py-4 font-semibold text-white shadow-[0_4px_24px_rgba(34,197,94,0.3)] transition hover:brightness-110"
            >
              Se connecter
            </button>

            <button
              type="button"
              className="w-full text-sm font-medium text-[#67df9e] transition hover:opacity-80"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        <p className={`mt-6 text-center text-sm ${isLight ? "text-slate-500" : "text-white/52"}`}>
          Pas encore de compte ?{" "}
          <button type="button" className="font-semibold text-[#67df9e] transition hover:opacity-80">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}
