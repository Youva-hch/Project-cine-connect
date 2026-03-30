import { useState, useEffect, useRef } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Discussion.module.css";

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
      style={{
        width: size,
        height: size,
        fontSize: size < 32 ? 10 : 14,
      }}
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${styles.avatarFallback}`}
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
  const socketRef = useRef<Socket | null>(null);
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
    if (!token || !user) return;

    socketRef.current = io(API || window.location.origin, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, user?.id]);

  // Scroll auto
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !selectedId || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { receiverId: selectedId, content });
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
    <div className={`flex h-screen pt-16 ${styles.page}`}>
      {/* ── Sidebar gauche : liste des conversations ────────────────────── */}
      <div
        style={{ width: 300 }}
        className={`flex flex-col flex-shrink-0 ${selectedId ? "hidden md:flex" : "flex"} ${styles.sidebar}`}
      >
        {/* Header sidebar */}
        <div className={`px-4 py-4 flex-shrink-0 ${styles.sidebarHeader}`}>
          <h2 className={`font-semibold text-sm ${styles.chatTitle}`}>Discussions</h2>
          <p className={`text-xs mt-0.5 ${styles.muted35}`}>
            {friends.length} conversation{friends.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des amis */}
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className={`text-center py-12 px-4 ${styles.muted30}`}>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${styles.friendItem} ${
                    isActive ? styles.friendItemActive : ""
                  }`}
                  type="button"
                >
                  <Avatar name={f.otherUserName} src={f.otherUserAvatar} size={38} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${isActive ? styles.friendNameActive : styles.friendName}`}
                    >
                      {f.otherUserName}
                    </p>
                    <p className={`text-xs truncate ${styles.muted30}`}>
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
              className={`flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b ${styles.chatHeader}`}
            >
              {/* Bouton retour mobile */}
              <button
                onClick={() => setSearchParams({})}
                className={`md:hidden p-2 rounded-lg ${styles.muted50}`}
                type="button"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar name={activeFriend.otherUserName} src={activeFriend.otherUserAvatar} />
              <div>
                <p className={`text-sm font-semibold ${styles.chatTitle}`}>
                  {activeFriend.otherUserName}
                </p>
                <p className={`text-xs ${styles.muted35}`}>
                  Conversation privée
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className={`text-center py-16 ${styles.emptyState}`}>
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
                      style={{
                        borderBottomRightRadius: isMine ? 4 : undefined,
                        borderBottomLeftRadius: isMine ? undefined : 4,
                      }}
                      className={`max-w-sm px-4 py-2 rounded-2xl text-sm ${
                        isMine ? styles.bubbleMine : styles.bubbleOther
                      }`}
                    >
                      <p className={styles.messageText}>{msg.content}</p>
                      <p
                        style={{
                          textAlign: isMine ? "right" : "left",
                        }}
                        className={`text-xs mt-1 ${isMine ? styles.timeMine : styles.timeOther}`}
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
              className={`flex items-center gap-3 px-4 py-3 flex-shrink-0 border-t ${styles.chatFooter}`}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none ${styles.chatInput}`}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() ? styles.sendActive : styles.sendDisabled
                }`}
                type="button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div
            className={`flex-1 flex flex-col items-center justify-center ${styles.emptySelection}`}
          >
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
