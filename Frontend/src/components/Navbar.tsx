import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

function SearchIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/films", label: "Films" },
  { to: "/amis", label: "Amis" },
  { to: "/discussion", label: "Discussion" },
] as const;

export default function Navbar() {
  const { isLight } = useTheme();

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-xl ${
        isLight ? "border-b border-slate-200 bg-white/95" : "border-b border-white/5 bg-[#07070c]/95"
      }`}
    >
      <div className="mx-auto grid h-[92px] max-w-[1880px] grid-cols-[auto_1fr_auto] items-center px-6 md:px-12 xl:px-16">
        <Link
          to="/"
          className="font-['Allura'] text-[2.05rem] font-normal leading-none tracking-[-0.02em] text-[#2fe29c] drop-shadow-[0_0_6px_rgba(47,226,156,0.08)] md:text-[3.1rem]"
        >
          CineConnect
        </Link>

        <div className="hidden items-center justify-center gap-12 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`relative pb-4 text-[1.08rem] font-semibold transition-colors ${
                isLight ? "text-slate-500 hover:text-slate-900" : "text-white/70 hover:text-white"
              }`}
              activeProps={{
                className:
                  `relative pb-4 text-[1.08rem] font-semibold ${isLight ? "text-slate-900" : "text-white"} after:absolute after:-bottom-[1px] after:left-1/2 after:h-[3px] after:w-7 after:-translate-x-1/2 after:rounded-full after:bg-[#31e6a1] after:shadow-[0_0_14px_rgba(49,230,161,0.45)] after:content-['']`,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center justify-self-end gap-5 md:flex">
          <ThemeToggle />

          <Link
            to="/films"
            className={`rounded-full p-2 transition ${
              isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-white/85 hover:bg-white/5 hover:text-white"
            }`}
            aria-label="Rechercher"
          >
            <SearchIcon className="h-8 w-8" />
          </Link>

          <Link
            to="/auth"
            className="rounded-md bg-[#2fb86c] px-9 py-3 text-lg font-semibold text-white shadow-[0_0_22px_rgba(43,179,107,0.22)] transition hover:brightness-110"
          >
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  );
}
