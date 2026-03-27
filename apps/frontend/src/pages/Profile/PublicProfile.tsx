import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Calendar, ChevronRight, Film, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/api/config';
import styles from './Profile.module.css';

interface PublicUser {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

interface PublicStats {
  reviewsCount: number;
  friendsCount: number;
}

interface UserReviewItem {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  filmId: number;
  filmTitle: string;
  filmImdbId: string | null;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: connectedUser, loading } = useAuth();

  const userId = Number(id);
  const isValidId = Number.isInteger(userId) && userId > 0;

  const { data: userResponse, isLoading: isUserLoading } = useQuery<{ success: boolean; data: PublicUser }>({
    queryKey: ['public-user', userId],
    queryFn: () => apiRequest(`/users/${userId}`),
    enabled: isValidId,
  });

  const { data: statsResponse } = useQuery<{ success: boolean; data: PublicStats }>({
    queryKey: ['public-user-stats', userId],
    queryFn: () => apiRequest(`/users/${userId}/stats`),
    enabled: isValidId,
  });

  const { data: reviewsResponse } = useQuery<{ success: boolean; data: UserReviewItem[] }>({
    queryKey: ['public-user-reviews', userId],
    queryFn: () => apiRequest(`/users/${userId}/reviews`),
    enabled: isValidId,
  });

  if (loading) return null;
  if (!connectedUser) return <Navigate to="/auth" />;
  if (!isValidId) return <Navigate to="/profil" />;

  const profile = userResponse?.data;
  const stats = statsResponse?.data;
  const reviews = reviewsResponse?.data ?? [];

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <div className={`h-40 rounded-xl animate-pulse ${styles.sectionCard}`} />
        <div className="grid grid-cols-2 gap-3">
          <div className={`h-24 rounded-xl animate-pulse ${styles.sectionCard}`} />
          <div className={`h-24 rounded-xl animate-pulse ${styles.sectionCard}`} />
        </div>
      </div>
    );
  }

  if (!profile) return <Navigate to="/profil" />;

  const avatarInitials = getInitials(profile.name || profile.email || '?');

  return (
    <div className={`min-h-screen px-4 py-8 relative ${styles.page}`}>
      <div className={`fixed inset-0 pointer-events-none ${styles.pageGlow}`} />

      <div className="max-w-3xl mx-auto relative z-10 space-y-5">
        <div className={`rounded-xl p-6 relative overflow-hidden ${styles.card}`}>
          <div className={`absolute inset-0 pointer-events-none ${styles.overlayViolet}`} />

          <div className="relative flex items-start gap-5 flex-wrap">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className={`w-20 h-20 rounded-full object-cover flex-shrink-0 ${styles.avatarRing}`}
              />
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center font-display text-2xl text-white flex-shrink-0 ${styles.avatarFallback}`}>
                {avatarInitials}
              </div>
            )}

            <div className="space-y-1">
              <h1 className={`font-display text-3xl leading-none ${styles.name}`}>{profile.name || 'Utilisateur'}</h1>
              <div className={`flex items-center gap-1.5 text-sm ${styles.muted}`}>
                <Calendar className="h-3.5 w-3.5" />
                Membre depuis {formatDate(profile.createdAt)}
              </div>
              {profile.bio ? (
                <p className={`text-sm leading-relaxed mt-2 ${styles.muted}`}>{profile.bio}</p>
              ) : (
                <p className={`text-sm leading-relaxed mt-2 ${styles.muted}`}>Aucune bio renseignée</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-4 text-center space-y-2 ${styles.statCard}`}>
            <Star className="h-5 w-5 mx-auto" style={{ color: 'hsl(38,92%,55%)' }} />
            <p className={`font-display text-3xl ${styles.name}`}>{String(stats?.reviewsCount ?? 0)}</p>
            <p className={`text-xs ${styles.muted}`}>Notes</p>
          </div>
          <div className={`rounded-xl p-4 text-center space-y-2 ${styles.statCard}`}>
            <Film className="h-5 w-5 mx-auto" style={{ color: 'hsl(200,78%,62%)' }} />
            <p className={`font-display text-3xl ${styles.name}`}>{String(stats?.friendsCount ?? 0)}</p>
            <p className={`text-xs ${styles.muted}`}>Amis</p>
          </div>
        </div>

        <div className={`rounded-xl p-6 space-y-4 ${styles.sectionCard}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: 'hsl(137,70%,56%)' }} />
              <h2 className={`font-display text-2xl ${styles.name}`}>Avis récents</h2>
            </div>
            <Link to="/films" className={`flex items-center gap-1 text-xs font-medium hover:opacity-80 ${styles.linkAccent}`}>
              Explorer les films <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-2.5">
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  to={`/film/${review.filmImdbId ?? review.filmId}`}
                  className="block rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className={`text-sm font-semibold truncate ${styles.name}`}>{review.filmTitle}</p>
                      <p className={`text-xs ${styles.muted}`}>{formatReviewDate(review.createdAt)}</p>
                      <p className={`text-xs ${styles.muted}`}>
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(Math.max(0, 5 - review.rating))}
                      </p>
                      {review.comment && <p className={`text-xs truncate ${styles.muted}`}>{review.comment}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${styles.muted}`}>Aucun avis pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
