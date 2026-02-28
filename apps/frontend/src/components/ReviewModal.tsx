import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { OmdbMovie, OmdbMovieDetail } from "@/lib/omdb";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function syncOmdbFilm(film: OmdbMovie | OmdbMovieDetail) {
  const res = await fetch(`${API_BASE}/api/films/omdb-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imdbId: film.imdbID,
      title: film.Title,
      posterUrl: film.Poster !== "N/A" ? film.Poster : undefined,
      releaseYear: film.Year ? parseInt(film.Year) : undefined,
      director: "Director" in film ? film.Director : undefined,
      description: "Plot" in film ? film.Plot : undefined,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data as { id: number };
}

async function postReview(filmId: number, rating: number, comment: string, token: string) {
  const res = await fetch(`${API_BASE}/api/films/${filmId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

interface ReviewModalProps {
  film: OmdbMovie | OmdbMovieDetail;
  onClose: () => void;
}

export function ReviewModal({ film, onClose }: ReviewModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Tu dois être connecté pour noter un film.");
      const synced = await syncOmdbFilm(film);
      return postReview(synced.id, rating, comment, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", film.imdbID] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = () => {
    setError("");
    if (rating === 0) {
      setError("Choisis une note avant de valider.");
      return;
    }
    mutation.mutate();
  };

  const starColor = (i: number) =>
    i <= (hovered || rating) ? "#f59e0b" : "rgba(255,255,255,0.15)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-xl p-6 space-y-5"
        style={{
          background: "rgba(15,10,30,0.97)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-1">
              Noter ce film
            </p>
            <h2 className="text-white font-semibold text-lg leading-tight">
              {film.Title}
            </h2>
            {film.Year && (
              <p className="text-white/40 text-sm mt-0.5">{film.Year}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stars */}
        <div className="space-y-2">
          <p className="text-xs text-white/50 font-medium">Ta note</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className="h-8 w-8 transition-colors duration-100"
                  style={{ color: starColor(i), fill: starColor(i) }}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-semibold text-amber-400">
                {["", "Mauvais", "Moyen", "Bien", "Très bien", "Excellent"][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <p className="text-xs text-white/50 font-medium">
            Commentaire <span className="text-white/30">(optionnel)</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Donne ton avis sur ce film..."
            rows={4}
            className="w-full resize-none rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
            }
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.1)" }}>
            {error}
          </p>
        )}

        {/* Non connecté */}
        {!user && (
          <p className="text-amber-400 text-sm text-center">
            Tu dois être connecté pour noter un film.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || !user}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, hsl(265,78%,58%) 0%, hsl(265,60%,44%) 100%)",
              boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
            }}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Star className="h-4 w-4 fill-current" />
                Valider
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
