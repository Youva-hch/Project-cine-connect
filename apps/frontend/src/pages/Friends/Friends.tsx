import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, Clock, Check, X, Search, UserX, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

const API = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token") ?? "";
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Erreur");
  return json.data;
}

interface FriendUser {
  friendshipId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
  otherUserEmail: string;
}

interface RequestUser {
  friendshipId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  senderEmail: string;
}

interface SentUser {
  friendshipId: number;
  targetId: number;
  targetName: string;
  targetAvatar: string | null;
}

interface SearchUser {
  id: number;
  name: string;
  avatarUrl: string | null;
  email: string;
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
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, hsl(265,78%,55%), hsl(280,70%,45%))",
      }}
    >
      {initials}
    </div>
  );
}

type Tab = "friends" | "requests" | "add";

export default function Friends() {
  const [tab, setTab] = useState<Tab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: () => apiFetch("/api/friends"),
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => apiFetch("/api/friends/requests"),
  });

  const { data: sent = [] } = useQuery({
    queryKey: ["friend-sent"],
    queryFn: () => apiFetch("/api/friends/sent"),
  });

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: () => apiFetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.trim().length >= 2,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const sendRequest = useMutation({
    mutationFn: (targetId: number) =>
      apiFetch(`/api/friends/request/${targetId}`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friend-sent"] });
      qc.invalidateQueries({ queryKey: ["user-search"] });
    },
  });

  const accept = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/friends/requests/${id}/accept`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friend-requests"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
  });

  const reject = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/friends/requests/${id}/reject`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friend-requests"] }),
  });

  const remove = useMutation({
    mutationFn: (friendId: number) =>
      apiFetch(`/api/friends/${friendId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends"] }),
  });

  // IDs déjà en relation (pour désactiver le bouton dans search)
  const sentIds = new Set(sent.map((s) => s.targetId));
  const friendIds = new Set(friends.map((f) => f.otherUserId));

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "friends", label: "Mes amis", count: friends.length },
    { id: "requests", label: "Demandes", count: requests.length },
    { id: "add", label: "Ajouter" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl text-gradient-cinema">Amis</h1>
        <p style={{ color: "rgba(255,255,255,0.45)" }} className="text-sm">
          Gérez vos amis et demandes en attente
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-3 text-sm font-medium transition-all relative"
            style={{
              color: tab === t.id ? "white" : "rgba(255,255,255,0.45)",
              background:
                tab === t.id
                  ? "linear-gradient(135deg, hsl(265,78%,48%), hsl(280,70%,38%))"
                  : "transparent",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className="ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5"
                style={{
                  background: tab === t.id ? "rgba(255,255,255,0.2)" : "rgba(139,92,246,0.3)",
                  color: "white",
                  minWidth: 18,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab : Mes amis ────────────────────────────────────────────────── */}
      {tab === "friends" && (
        <div className="space-y-2">
          {friendsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))
          ) : friends.length === 0 ? (
            <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Vous n'avez pas encore d'amis</p>
              <button
                onClick={() => setTab("add")}
                className="mt-2 text-sm underline"
                style={{ color: "hsl(265,78%,72%)" }}
              >
                Ajouter des amis
              </button>
            </div>
          ) : (
            friends.map((f) => (
              <div
                key={f.friendshipId}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Avatar name={f.otherUserName} src={f.otherUserAvatar} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "white" }}>{f.otherUserName}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{f.otherUserEmail}</p>
                </div>
                <button
                  onClick={() => navigate(`/discussion?with=${f.otherUserId}`)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "hsl(265,78%,72%)", background: "rgba(139,92,246,0.1)" }}
                  title="Envoyer un message"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove.mutate(f.otherUserId)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  title="Supprimer"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab : Demandes ────────────────────────────────────────────────── */}
      {tab === "requests" && (
        <div className="space-y-2">
          {requestsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))
          ) : requests.length === 0 ? (
            <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande en attente</p>
            </div>
          ) : (
            requests.map((r) => (
              <div
                key={r.friendshipId}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Avatar name={r.senderName} src={r.senderAvatar} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "white" }}>{r.senderName}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{r.senderEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept.mutate(r.friendshipId)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(74,222,128,0.15)", color: "rgb(74,222,128)" }}
                    title="Accepter"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => reject.mutate(r.friendshipId)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: "rgba(239,68,68,0.15)", color: "rgb(252,165,165)" }}
                    title="Refuser"
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
      {tab === "add" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "rgba(255,255,255,0.35)" }}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="pl-11 h-11"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
              }}
            />
          </div>

          {searchQuery.trim().length < 2 ? (
            <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>
              <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
            </div>
          ) : searching ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((u) => {
                const alreadyFriend = friendIds.has(u.id);
                const alreadySent = sentIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <Avatar name={u.name} src={u.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "white" }}>{u.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{u.email}</p>
                    </div>
                    {alreadyFriend ? (
                      <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(74,222,128,0.1)", color: "rgb(74,222,128)" }}>
                        Amis
                      </span>
                    ) : alreadySent ? (
                      <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}>
                        Demande envoyée
                      </span>
                    ) : (
                      <button
                        onClick={() => sendRequest.mutate(u.id)}
                        disabled={sendRequest.isPending}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background: "linear-gradient(135deg, hsl(265,78%,55%), hsl(280,70%,45%))",
                          color: "white",
                          opacity: sendRequest.isPending ? 0.6 : 1,
                        }}
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
