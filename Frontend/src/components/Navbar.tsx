import { useState } from "react";
import { Link } from "@tanstack/react-router";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-black/90 px-6 py-4 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="font-['Pacifico'] text-4xl leading-none text-green-600 no-underline drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]"
          >
            CineConnect
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-lg text-green-700 transition hover:text-green-500"
              activeProps={{ className: "text-lg text-green-500" }}
            >
              Accueil
            </Link>

            <Link
              to="/films"
              className="text-lg text-green-700 transition hover:text-green-500"
              activeProps={{ className: "text-lg text-green-500" }}
            >
              Films
            </Link>

            <Link
              to="/browse"
              className="text-lg text-green-700 transition hover:text-green-500"
              activeProps={{ className: "text-lg text-green-500" }}
            >
              Explorer
            </Link>

            <Link
              to="/profil"
              className="text-lg text-green-700 transition hover:text-green-500"
              activeProps={{ className: "text-lg text-green-500" }}
            >
              Profil
            </Link>

            <Link
              to="/discussion"
              className="text-lg text-green-700 transition hover:text-green-500"
              activeProps={{ className: "text-lg text-green-500" }}
            >
              Discussion
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher un film..."
            className="w-80 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-3 pr-12 text-white outline-none transition placeholder:text-zinc-400 focus:border-zinc-600"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400">
            🔍
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

