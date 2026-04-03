import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  LogOut,
  Edit3,
  Check,
  X,
  Calendar,
  MessageCircle,
  Mail,
  ChevronRight,
  Film,
} from 'lucide-react';
import { apiRequest } from '@/api/config';
import styles from './Profile.module.css';
import { setUserCookie } from '@/lib/userCookie';

interface FullUser {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

interface ProfileStats {
  reviewsCount: number;
  friendsCount: number;
  recentConversations: Array<{
    friendId: number;
    friendName: string;
    friendAvatar: string | null;
    lastMessage: {
      id: number;
      content: string;
      createdAt: string;
      isMine: boolean;
    } | null;
  }>;
}

interface UserReviewItem {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  filmId: number;
  filmTitle: string;
  filmImdbId: string | null;
  filmPosterUrl: string | null;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function formatConversationDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const { data: fullUser } = useQuery<{ success: boolean; data: FullUser }>({
    queryKey: ['me'],
    queryFn: () => apiRequest('/api/auth/me'),
    enabled: !!user,
  });

  const { data: statsResponse } = useQuery<{ success: boolean; data: ProfileStats }>({
    queryKey: ['profile-stats'],
    queryFn: () => apiRequest('/users/me/stats'),
    enabled: !!user,
  });

  const { data: myReviewsResponse } = useQuery<{ success: boolean; data: UserReviewItem[] }>({
    queryKey: ['my-reviews'],
    queryFn: () => apiRequest('/users/me/reviews'),
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: () =>
      apiRequest<{ success: boolean; data: FullUser }>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() || undefined, bio: bio.trim() || null }),
      }),
    onSuccess: res => {
      const updated = { ...user!, name: res.data.name, bio: res.data.bio };
      setUserCookie(updated);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
      toast({ title: 'Profil mis à jour !' });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erreur',
        description: e instanceof Error ? e.message : 'Erreur',
        variant: 'destructive',
      });
    },
  });

  const changePassword = useMutation({
    mutationFn: () =>
      apiRequest<{ success: boolean; message: string }>('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    onSuccess: res => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast({ title: res.message || 'Mot de passe mis à jour' });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erreur',
        description: e instanceof Error ? e.message : 'Impossible de changer le mot de passe',
        variant: 'destructive',
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: () =>
      apiRequest<{ success: boolean; message: string }>('/users/me', {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await signOut();
      toast({ title: 'Compte supprimé' });
      navigate({ to: '/auth', replace: true });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erreur',
        description: e instanceof Error ? e.message : 'Impossible de supprimer le compte',
        variant: 'destructive',
      });
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  const avatarUrl = user.avatarUrl;
  const initials = getInitials(user.name ?? user.email ?? '?');
  const createdAt = fullUser?.data?.createdAt;
  const stats = statsResponse?.data;
  const myReviews = myReviewsResponse?.data ?? [];

  return (
    <div className={`min-h-screen px-4 py-8 relative ${styles.page}`}>
      <div className={`fixed inset-0 pointer-events-none ${styles.pageGlow}`} />

      <div className="max-w-3xl mx-auto relative z-10 space-y-5">
        {/* ── Header profil ── */}
        <div className={`rounded-xl p-6 relative overflow-hidden ${styles.card}`}>
          <div className={`absolute inset-0 pointer-events-none ${styles.overlayViolet}`} />

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className={`w-20 h-20 rounded-full object-cover flex-shrink-0 ${styles.avatarRing}`}
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center font-display text-2xl text-white flex-shrink-0 ${styles.avatarFallback}`}
                >
                  {initials}
                </div>
              )}

              <div className="space-y-1">
                <h1 className={`font-display text-3xl leading-none ${styles.name}`}>
                  {user.name || 'Utilisateur'}
                </h1>
                <div className={`flex items-center gap-1.5 text-sm ${styles.muted}`}>
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
                {createdAt && (
                  <div className={`flex items-center gap-1.5 text-xs ${styles.muted}`}>
                    <Calendar className="h-3 w-3" />
                    Membre depuis {formatDate(createdAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions modifier */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110 ${styles.actionSoft}`}
                  type="button"
                >
                  <Edit3 className="h-4 w-4" /> Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateProfile.mutate()}
                    disabled={updateProfile.isPending}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 ${styles.actionPrimary}`}
                    type="button"
                  >
                    <Check className="h-4 w-4" /> Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setName(user.name ?? '');
                      setBio(user.bio ?? '');
                      setIsEditing(false);
                    }}
                    className={`p-2 rounded-lg hover:bg-white/10 ${styles.muted}`}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bio / formulaire édition */}
          <div className="relative mt-5">
            {isEditing && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${styles.muted}`}>Nom d'affichage</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ton nom"
                    className={`placeholder:text-foreground/35 ${styles.input}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${styles.muted}`}>Bio</label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Parle-nous de toi, de tes films préférés..."
                    rows={3}
                    className={`resize-none placeholder:text-foreground/35 ${styles.input}`}
                  />
                </div>
              </div>
            )}
            {!isEditing && (user.bio ? (
              <p className={`text-sm leading-relaxed ${styles.muted}`}>{user.bio}</p>
            ) : (
              <p className={`text-sm leading-relaxed ${styles.muted}`}>Aucune bio renseignée</p>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Star,
              label: 'Notes',
              value: String(stats?.reviewsCount ?? 0),
              color: 'hsl(38,92%,55%)',
            },
            {
              icon: Film,
              label: 'Amis',
              value: String(stats?.friendsCount ?? 0),
              color: 'hsl(200,78%,62%)',
            },
            {
              icon: MessageCircle,
              label: 'Conversations',
              value: String(stats?.recentConversations.length ?? 0),
              color: 'hsl(137,70%,56%)',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`rounded-xl p-4 text-center space-y-2 ${styles.statCard}`}>
              <Icon className="h-5 w-5 mx-auto" style={{ color }} />
              <p className={`font-display text-3xl ${styles.name}`}>{value}</p>
              <p className={`text-xs ${styles.muted}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Mes avis ── */}
        <div className={`rounded-xl p-6 space-y-4 ${styles.sectionCard}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" style={{ color: 'hsl(38,92%,55%)' }} />
              <h2 className={`font-display text-2xl ${styles.name}`}>Mes avis</h2>
            </div>
            <Link
              to="/films"
              className={`flex items-center gap-1 text-xs font-medium hover:opacity-80 ${styles.linkAccent}`}
            >
              Explorer les films <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {myReviews.length > 0 ? (
            <div className="space-y-2.5">
              {myReviews.map(review => (
                <Link
                  key={review.id}
                  to={`/film/${review.filmImdbId ?? review.filmId}`}
                  className="block rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className={`text-sm font-semibold truncate ${styles.name}`}>
                        {review.filmTitle}
                      </p>
                      <p className={`text-xs ${styles.muted}`}>
                        {formatReviewDate(review.createdAt)}
                      </p>
                      <p className={`text-xs ${styles.muted}`}>
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(Math.max(0, 5 - review.rating))}
                      </p>
                      {review.comment && (
                        <p className={`text-xs truncate ${styles.muted}`}>{review.comment}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center gap-3">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${styles.emptyIconWrap}`}
              >
                <Star className="h-7 w-7" style={{ color: 'hsl(137,70%,56%)', opacity: 0.5 }} />
              </div>
              <p className={styles.muted} style={{ fontSize: '0.875rem' }}>
                Tu n'as pas encore noté de film
              </p>
              <Link
                to="/films"
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white hover:brightness-110 ${styles.actionPrimary}`}
              >
                Découvrir des films
              </Link>
            </div>
          )}
        </div>

        {/* ── Mes discussions ── */}
        <div className={`rounded-xl p-6 space-y-4 ${styles.sectionCard}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: 'hsl(137,70%,56%)' }} />
              <h2 className={`font-display text-2xl ${styles.name}`}>Conversations récentes</h2>
            </div>
            <Link
              to="/discussion"
              className={`flex items-center gap-1 text-xs font-medium hover:opacity-80 ${styles.linkAccent}`}
            >
              Voir tout <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {stats && stats.recentConversations.length > 0 ? (
            <div className="space-y-2">
              {stats.recentConversations.map(conversation => (
                <Link
                  key={conversation.lastMessage?.id ?? conversation.friendId}
                  to={`/discussion?with=${conversation.friendId}`}
                  className="block rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${styles.name}`}>
                        {conversation.friendName}
                      </p>
                      <p className={`text-xs truncate ${styles.muted}`}>
                        {conversation.lastMessage?.isMine ? 'Vous: ' : ''}
                        {conversation.lastMessage?.content ?? 'Aucun message'}
                      </p>
                    </div>
                    {conversation.lastMessage && (
                      <span className={`text-[11px] whitespace-nowrap ${styles.muted}`}>
                        {formatConversationDate(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center gap-3">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${styles.emptyIconWrap}`}
              >
                <MessageCircle
                  className="h-7 w-7"
                  style={{ color: 'hsl(137,70%,56%)', opacity: 0.5 }}
                />
              </div>
              <p className={styles.muted} style={{ fontSize: '0.875rem' }}>
                Tu n'as pas encore participé à une discussion
              </p>
              <Link
                to="/discussion"
                className={`px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 ${styles.actionSoft}`}
              >
                Rejoindre une discussion
              </Link>
            </div>
          )}
        </div>

        {/* ── Déconnexion ── */}
        <div className={`rounded-xl p-6 space-y-5 ${styles.sectionCard}`}>
          <div>
            <h2 className={`font-display text-2xl ${styles.dangerTitle}`}>Zone dangereuse</h2>
            <p className={`text-xs mt-1 ${styles.muted}`}>
              Actions sensibles liées à la sécurité du compte.
            </p>
          </div>

          <div className={styles.dangerBlock}>
            <h3 className={`text-sm font-semibold ${styles.name}`}>Changer le mot de passe</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <Input
                type="password"
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={styles.input}
              />
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={styles.input}
              />
              <Input
                type="password"
                placeholder="Confirmer"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                className={styles.input}
              />
            </div>
            <button
              type="button"
              disabled={
                changePassword.isPending ||
                !currentPassword ||
                !newPassword ||
                newPassword.length < 6 ||
                newPassword !== confirmNewPassword
              }
              onClick={() => changePassword.mutate()}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${styles.actionSoft}`}
            >
              {changePassword.isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
            {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
              <p className={`text-xs ${styles.danger}`}>Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          <div className={styles.dangerBlock}>
            <h3 className={`text-sm font-semibold ${styles.name}`}>Supprimer le compte</h3>
            <p className={`text-xs ${styles.muted}`}>
              Cette action est irréversible. Saisis <strong>SUPPRIMER</strong> pour confirmer.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={e => setDeleteConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
              className={styles.input}
            />
            <button
              type="button"
              disabled={deleteAccount.isPending || deleteConfirmation !== 'SUPPRIMER'}
              onClick={() => deleteAccount.mutate()}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${styles.dangerCta}`}
            >
              {deleteAccount.isPending ? 'Suppression...' : 'Supprimer mon compte'}
            </button>
          </div>
        </div>

        <div className={`rounded-xl p-4 ${styles.logoutCard}`}>
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 ${styles.danger}`}
            type="button"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
