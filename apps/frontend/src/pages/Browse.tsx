import { useTheme } from "../contexts/ThemeContext";

const tabs = [
  { label: "Mes amis", active: true },
  { label: "Demandes", active: false },
  { label: "Ajouter", active: false },
];

export function Browse() {
  const { isLight } = useTheme();

  return (
    <div className={`min-h-screen px-6 pb-24 pt-28 md:px-12 xl:px-16 ${isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-[#050507] text-white"}`}>
      <section className="mx-auto max-w-[960px]">
        <div className="text-center">
          <h1 className="font-['Bebas_Neue'] text-[4.7rem] uppercase leading-none tracking-[0.04em] text-[#a6d45c] md:text-[5.6rem]">
            AMIS
          </h1>
          <p className={`mt-5 text-[1.15rem] ${isLight ? "text-slate-500" : "text-white/62"}`}>
            Gérez vos amis et demandes en attente
          </p>
        </div>

        <div className={`mt-10 overflow-hidden rounded-[1.2rem] ${isLight ? "border border-slate-200 bg-white" : "border border-white/10 bg-[#101010]"}`}>
          <div className="grid grid-cols-3">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={`px-6 py-5 text-center text-[1.05rem] font-semibold transition ${
                  tab.active
                    ? "bg-[#2ea864] text-white"
                    : isLight
                    ? "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    : "text-white/55 hover:bg-white/[0.03] hover:text-white/82"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-[112px] rounded-[1.35rem] ${isLight ? "bg-white shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]" : "bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Browse;
