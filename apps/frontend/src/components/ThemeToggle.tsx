import { useTheme } from "../contexts/ThemeContext";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M20.82 15.11A8.97 8.97 0 0 1 8.89 3.18a1 1 0 0 0-1.24-1.24A10.97 10.97 0 1 0 22.06 16.35a1 1 0 0 0-1.24-1.24Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-base font-semibold transition ${
        isLight
          ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
          : "border-white/12 bg-[#111118] text-white hover:bg-white/[0.05]"
      }`}
      aria-label={isLight ? "Activer le mode sombre" : "Activer le mode clair"}
    >
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
          isLight ? "bg-slate-100 text-amber-500" : "bg-[#2c2112] text-amber-300"
        }`}
      >
        {isLight ? <SunIcon /> : <MoonIcon />}
      </span>
      {isLight ? "White" : "Dark"}
    </button>
  );
}
