import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Users, UserPlus, Clock, Check, X, Search, UserX, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import styles from './Friends.module.css';

const API = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token') ?? '';
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Erreur');
  return json.data;
}

function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${styles.avatarFallback}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {initials}
    </div>
  );
}

type Tab = 'friends' | 'requests' | 'add';

export default function Friends() {
  const [tab, setTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const qc = useQueryClient();
  const navigate = useNavigate();

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => apiFetch('/api/friends'),
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => apiFetch('/api/friends/requests'),
  });

  const { data: sent = [] } = useQuery({
    queryKey: ['friend-sent'],
    queryFn: () => apiFetch('/api/friends/sent'),
  });

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: () => apiFetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.trim().length >= 2,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const sendRequest = useMutation({
    mutationFn: (targetId: number) =>
      apiFetch(`/api/friends/request/${targetId}`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-sent'] });
      qc.invalidateQueries({ queryKey: ['user-search'] });
    },
  });

  const accept = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/friends/requests/${id}/accept`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const reject = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/friends/requests/${id}/reject`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friend-requests'] }),
  });

  const remove = useMutation({
    mutationFn: (friendId: number) => apiFetch(`/api/friends/${friendId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });

  // IDs déjà en relation (pour désactiver le bouton dans search)
  const sentIds = new Set(sent.map(s => s.targetId));
  const friendIds = new Set(friends.map(f => f.otherUserId));

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'friends', label: 'Mes amis', count: friends.length },
    { id: 'requests', label: 'Demandes', count: requests.length },
    { id: 'add', label: 'Ajouter' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl text-gradient-cinema">Amis</h1>
        <p className={`text-sm ${styles.subtitle}`}>Gérez vos amis et demandes en attente</p>
      </div>

      {/* Tabs */}
      <div className={`flex rounded-xl overflow-hidden ${styles.tabsWrap}`}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${styles.tab} ${
              tab === t.id ? styles.tabActive : ''
            }`}
            type="button"
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5 ${styles.tabBadge} ${
                  tab === t.id ? styles.tabBadgeActive : ''
                }`}
                style={{ minWidth: 18 }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab : Mes amis ────────────────────────────────────────────────── */}
      {tab === 'friends' && (
        <div className="space-y-2">
          {friendsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-16 rounded-xl animate-pulse ${styles.skeleton}`} />
            ))
          ) : friends.length === 0 ? (
            <div className={`text-center py-12 ${styles.emptyText}`}>
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Vous n'avez pas encore d'amis</p>
              <button
                onClick={() => setTab('add')}
                className={`mt-2 text-sm underline ${styles.linkAccent}`}
                type="button"
              >
                Ajouter des amis
              </button>
            </div>
          ) : (
            friends.map(f => (
              <div
                key={f.friendshipId}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${styles.card}`}
              >
                <Avatar name={f.otherUserName} src={f.otherUserAvatar} />
                <div className="flex-1 min-w-0">
                  <Link to={`/profil/${f.otherUserId}`} className={`text-sm font-medium hover:underline ${styles.name}`}>
                    {f.otherUserName}
                  </Link>
                  <p className={`text-xs ${styles.email}`}>{f.otherUserEmail}</p>
                </div>
                <button
                  onClick={() => navigate({ to: '/discussion', search: { with: String(f.otherUserId) } })}
                  className={`p-2 rounded-lg transition-colors ${styles.messageBtn}`}
                  title="Envoyer un message"
                  type="button"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove.mutate(f.otherUserId)}
                  className={`p-2 rounded-lg transition-colors ${styles.removeBtn}`}
                  title="Supprimer"
                  type="button"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab : Demandes ────────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="space-y-2">
          {requestsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={`h-16 rounded-xl animate-pulse ${styles.skeleton}`} />
            ))
          ) : requests.length === 0 ? (
            <div className={`text-center py-12 ${styles.emptyText}`}>
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande en attente</p>
            </div>
          ) : (
            requests.map(r => (
              <div
                key={r.friendshipId}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${styles.card}`}
              >
                <Avatar name={r.senderName} src={r.senderAvatar} />
                <div className="flex-1 min-w-0">
                  <Link to={`/profil/${r.senderId}`} className={`text-sm font-medium hover:underline ${styles.name}`}>
                    {r.senderName}
                  </Link>
                  <p className={`text-xs ${styles.email}`}>{r.senderEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept.mutate(r.friendshipId)}
                    className={`p-2 rounded-lg transition-colors ${styles.acceptBtn}`}
                    title="Accepter"
                    type="button"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => reject.mutate(r.friendshipId)}
                    className={`p-2 rounded-lg transition-colors ${styles.rejectBtn}`}
                    title="Refuser"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab : Ajouter ─────────────────────────────────────────────────── */}
      {tab === 'add' && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${styles.searchIcon}`}
            />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className={`pl-11 h-11 ${styles.searchInput}`}
            />
          </div>

          {searchQuery.trim().length < 2 ? (
            <div className={`text-center py-8 ${styles.emptyText}`}>
              <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
            </div>
          ) : searching ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={`h-14 rounded-xl animate-pulse ${styles.skeleton}`} />
            ))
          ) : searchResults.length === 0 ? (
            <div className={`text-center py-8 ${styles.emptyText}`}>
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map(u => {
                const alreadyFriend = friendIds.has(u.id);
                const alreadySent = sentIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${styles.card}`}
                  >
                    <Avatar name={u.name} src={u.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <Link to={`/profil/${u.id}`} className={`text-sm font-medium hover:underline ${styles.name}`}>
                        {u.name}
                      </Link>
                      <p className={`text-xs ${styles.email}`}>{u.email}</p>
                    </div>
                    {alreadyFriend ? (
                      <span className={`text-xs px-3 py-1.5 rounded-lg ${styles.statusFriend}`}>
                        Amis
                      </span>
                    ) : alreadySent ? (
                      <span className={`text-xs px-3 py-1.5 rounded-lg ${styles.statusSent}`}>
                        Demande envoyée
                      </span>
                    ) : (
                      <button
                        onClick={() => sendRequest.mutate(u.id)}
                        disabled={sendRequest.isPending}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${styles.addBtn}`}
                        style={{ opacity: sendRequest.isPending ? 0.6 : 1 }}
                        type="button"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Ajouter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
