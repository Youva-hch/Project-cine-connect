import { Link } from "@tanstack/react-router";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="mb-6">Page introuvable</p>

      <Link
        to="/"
        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}