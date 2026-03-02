import { useState, useEffect, useRef } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token") ?? "";
}

interface Friend {
  friendshipId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
  otherUserEmail: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string | null;
}

// Socket singleton
let socket: Socket | null = null;

function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(API || "http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
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
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size < 32 ? 10 : 14,
        background: "linear-gradient(135deg, hsl(265,78%,55%), hsl(280,70%,45%))",
      }}
    >
      {initials}
    </div>
  );
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function Discussion() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = getToken();

  const selectedId = searchParams.get("with") ? parseInt(searchParams.get("with")!, 10) : null;

  // Liste des amis
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return (json.data ?? []) as Friend[];
    },
    enabled: !!token,
  });

  const activeFriend = friends.find((f) => f.otherUserId === selectedId) ?? null;

  // Charger l'historique quand on change de conversation
  useEffect(() => {
    if (!selectedId || !token) return;
    setMessages([]);
    fetch(`${API}/api/messages/${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMessages(json.data ?? []);
      })
      .catch(console.error);
  }, [selectedId, token]);

  // Connexion socket
  useEffect(() => {
    if (!token || !selectedId || !user) return;
    const s = getSocket(token);
    s.on("receiveMessage", (msg: Message) => {
      const isRelevant =
        (msg.senderId === selectedId && Number(user.id) === msg.receiverId) ||
        (Number(user.id) === msg.senderId && msg.receiverId === selectedId);
      if (isRelevant) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });
    return () => { s.off("receiveMessage"); };
  }, [token, selectedId, user?.id]);

  // Scroll auto
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !selectedId) return;
    getSocket(token).emit("sendMessage", { receiverId: selectedId, content });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div
      className="flex h-screen pt-16"
      style={{ background: "rgba(7,7,16,1)" }}
    >
      {/* ── Sidebar gauche : liste des conversations ────────────────────── */}
      <div
        className={`flex flex-col flex-shrink-0 ${selectedId ? "hidden md:flex" : "flex"}`}
        style={{
          width: 300,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(14,14,28,0.98)",
        }}
      >
        {/* Header sidebar */}
        <div
          className="px-4 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="font-semibold text-white text-sm">Discussions</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {friends.length} conversation{friends.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des amis */}
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="text-center py-12 px-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Ajoutez des amis pour discuter</p>
            </div>
          ) : (
            friends.map((f) => {
              const isActive = f.otherUserId === selectedId;
              return (
                <button
                  key={f.friendshipId}
                  onClick={() => setSearchParams({ with: String(f.otherUserId) })}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                  style={{
                    background: isActive ? "rgba(139,92,246,0.12)" : "transparent",
                    borderLeft: isActive
                      ? "2px solid hsl(265,78%,62%)"
                      : "2px solid transparent",
                  }}
                >
                  <Avatar name={f.otherUserName} src={f.otherUserAvatar} size={38} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: isActive ? "white" : "rgba(255,255,255,0.8)" }}
                    >
                      {f.otherUserName}
                    </p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {f.otherUserEmail}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Zone chat droite ─────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${selectedId ? "flex" : "hidden md:flex"}`}>
        {selectedId && activeFriend ? (
          <>
            {/* Header chat */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(14,14,28,0.98)",
              }}
            >
              {/* Bouton retour mobile */}
              <button
                onClick={() => setSearchParams({})}
                className="md:hidden p-2 rounded-lg"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar name={activeFriend.otherUserName} src={activeFriend.otherUserAvatar} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "white" }}>
                  {activeFriend.otherUserName}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Conversation privée
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-16" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <p className="text-sm">Aucun message pour l'instant</p>
                  <p className="text-xs mt-1">Commencez la conversation !</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = String(msg.senderId) === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isMine && (
                      <Avatar name={msg.senderName ?? "?"} src={msg.senderAvatar} size={28} />
                    )}
                    <div
                      className="max-w-sm px-4 py-2 rounded-2xl text-sm"
                      style={{
                        background: isMine
                          ? "linear-gradient(135deg, hsl(265,78%,52%), hsl(280,70%,42%))"
                          : "rgba(255,255,255,0.07)",
                        color: "white",
                        borderBottomRightRadius: isMine ? 4 : undefined,
                        borderBottomLeftRadius: isMine ? undefined : 4,
                      }}
                    >
                      <p style={{ wordBreak: "break-word" }}>{msg.content}</p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: isMine ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)",
                          textAlign: isMine ? "right" : "left",
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(14,14,28,0.98)",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, hsl(265,78%,55%), hsl(280,70%,45%))"
                    : "rgba(255,255,255,0.06)",
                  color: input.trim() ? "white" : "rgba(255,255,255,0.25)",
                }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div
            className="flex-1 flex flex-col items-center justify-center"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
