import { Link } from "@tanstack/react-router";

export default function Navbar() {
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
      </div>
    </nav>
  );
}
