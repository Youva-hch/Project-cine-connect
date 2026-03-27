import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovieById } from "@/lib/omdb";
import { Clock, Globe, Award, User, Star, MessageCircle, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getBestPosterUrl } from "@/lib/poster";
import { ReviewModal } from "@/components/ReviewModal";
import styles from "./FilmDetail.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface Review {
  id: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string; avatarUrl: string | null };
}

async function fetchReviews(imdbId: string): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/api/films/by-imdb/${imdbId}/reviews`);
  const json = await res.json();
  return json.success ? json.data : [];
}

async function deleteReview(reviewId: number, token: string) {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

async function patchReview(reviewId: number, data: { rating?: number; comment?: string }, token: string) {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  const inactiveStarColor = "hsl(var(--muted-foreground) / 0.35)";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{
            width: size,
            height: size,
            color: i <= rating ? "#f59e0b" : inactiveStarColor,
            fill: i <= rating ? "#f59e0b" : inactiveStarColor,
          }}
        />
      ))}
    </div>
  );
}

function EditReviewForm({ review, imdbId, onDone }: { review: Review; imdbId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(review.rating);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(review.comment ?? "");

  const mutation = useMutation({
    mutationFn: () => {
      const token = localStorage.getItem("token") ?? "";
      return patchReview(review.id, { rating, comment: comment.trim() || undefined }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", imdbId] });
      onDone();
    },
  });

  const starColor = (i: number) => i <= (hovered || rating)
    ? "#f59e0b"
    : "hsl(var(--muted-foreground) / 0.35)";

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(i)}>
            <Star className="h-6 w-6 transition-colors" style={{ color: starColor(i), fill: starColor(i) }} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className={`w-full resize-none rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/35 outline-none ${styles.editTextarea}`}
        placeholder="Modifier ton commentaire..."
      />
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50 ${styles.editSave}`}
          type="button"
        >
          {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sauvegarder"}
        </button>
        <button onClick={onDone} className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground ${styles.editCancel}`} type="button">
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function FilmDetail() {
  const { id: imdbId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", imdbId],
    queryFn: () => getMovieById(imdbId!),
    enabled: !!imdbId,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["reviews", imdbId],
    queryFn: () => fetchReviews(imdbId!),
    enabled: !!imdbId,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => {
      const token = localStorage.getItem("token") ?? "";
      return deleteReview(reviewId, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", imdbId] }),
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const userReview = user ? reviews.find((r) => String(r.user.id) === user.id) : null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/2" />
            <div className="flex gap-8">
            <div className="w-[500px] md:w-[500px] aspect-[2/3] bg-muted rounded-xl" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const detailPosterUrl = getBestPosterUrl(movie.Poster, { omdbSize: 1400 });
  const hasPoster = !!detailPosterUrl;

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* ── Film info ── */}
        <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-[500px] shrink-0">
          {hasPoster ? (
            <img src={detailPosterUrl} alt={movie.Title} className="w-full rounded-xl shadow-2xl" />
          ) : (
            <div className={`w-full aspect-[2/3] rounded-xl flex items-center justify-center ${styles.noPoster}`}>
              <span className="text-muted-foreground text-sm">Pas d'affiche</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground">{movie.Title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{movie.Year} · {movie.Rated}</p>
          </div>

          {movie.Genre && (
            <div className="flex flex-wrap gap-2">
              {movie.Genre.split(", ").map((g) => (
                <span key={g} className={`px-3 py-1 rounded-full text-xs font-medium ${styles.genreTag}`}>
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="text-foreground/80 leading-relaxed">{movie.Plot}</p>

          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            {movie.Runtime && <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{movie.Runtime}</div>}
            {movie.Country && <div className="flex items-center gap-2"><Globe className="h-4 w-4" />{movie.Country}</div>}
            {movie.Director && <div className="flex items-center gap-2"><User className="h-4 w-4" />{movie.Director}</div>}
            {movie.imdbRating && movie.imdbRating !== "N/A" && (
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Award className="h-4 w-4" />IMDb {movie.imdbRating}/10
              </div>
            )}
          </div>

          {movie.Actors && (
            <div>
              <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Acteurs</h3>
              <p className="text-sm text-foreground/75">{movie.Actors}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Section avis ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-foreground font-display text-2xl flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              Avis
              {reviews.length > 0 && (
                <span className="text-muted-foreground text-lg font-normal">({reviews.length})</span>
              )}
            </h2>
            {avgRating && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${styles.avgBadge}`}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-amber-400 font-bold">{avgRating}</span>
                <span className="text-muted-foreground text-xs">/5</span>
              </div>
            )}
          </div>

          {user && !userReview && (
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 ${styles.rateButton}`}
            >
              <Star className="h-4 w-4 fill-current" />
              Noter ce film
            </button>
          )}
          {!user && (
            <a href="/auth" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              Connecte-toi pour noter →
            </a>
          )}
        </div>

        {/* Ma review */}
        {userReview && (
          <div className={`rounded-xl p-4 space-y-2 ${styles.myReview}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Ma note</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditingId(editingId === userReview.id ? null : userReview.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  {editingId === userReview.id ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(userReview.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-muted-foreground hover:text-red-400 disabled:opacity-50"
                  type="button"
                >
                  {deleteMutation.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            {editingId === userReview.id ? (
              <EditReviewForm review={userReview} imdbId={imdbId!} onDone={() => setEditingId(null)} />
            ) : (
              <>
                <StarDisplay rating={userReview.rating} />
                {userReview.comment && (
                  <p className="text-foreground/80 text-sm leading-relaxed">{userReview.comment}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {reviews.filter((r) => r.id !== userReview?.id).length === 0 && !userReview && (
          <div className={`py-14 text-center rounded-xl ${styles.emptyReviews}`}>
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Sois le premier à donner ton avis !</p>
            {!user && (
              <a href="/auth" className="inline-block mt-3 text-sm text-green-400 hover:text-green-300 transition-colors">
                Se connecter →
              </a>
            )}
          </div>
        )}

        {/* Liste des avis autres */}
        <div className="space-y-3">
          {reviews
            .filter((r) => r.id !== userReview?.id)
            .map((review) => {
              const initials = review.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={review.id} className={`rounded-xl p-4 space-y-2.5 ${styles.reviewCard}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {review.user.avatarUrl ? (
                        <img src={review.user.avatarUrl} alt={review.user.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${styles.reviewInitials}`}>
                          {initials}
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/profil/${review.user.id}`}
                          className="text-foreground text-sm font-medium hover:underline"
                        >
                          {review.user.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <StarDisplay rating={review.rating} size={14} />
                  </div>
                  {review.comment && (
                    <p className="text-foreground/80 text-sm leading-relaxed pl-10">{review.comment}</p>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Modal notation */}
      {showModal && movie && (
        <ReviewModal film={movie} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
