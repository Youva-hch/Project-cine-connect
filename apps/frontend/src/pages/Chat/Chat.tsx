import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string | null;
}

interface Friend {
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar: string | null;
}

// ─── Socket singleton ─────────────────────────────────────────────────────
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

// ─── Composant Avatar ─────────────────────────────────────────────────────
function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg, hsl(265,78%,55%), hsl(280,70%,45%))" }}
    >
      {initials}
    </div>
  );
}

// ─── Page Chat ───────────────────────────────────────────────────────────
export default function Chat() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token") ?? "";

  const friendIdNum = parseInt(friendId ?? "", 10);

  // Récupérer les infos de l'ami
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return (json.data ?? []) as Friend[];
    },
  });

  const friend = friends.find((f) => f.otherUserId === friendIdNum);

  // Charger l'historique
  useEffect(() => {
    if (!friendIdNum || !token) return;

    fetch(`${API}/api/messages/${friendIdNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMessages(json.data ?? []);
      })
      .catch(console.error);
  }, [friendIdNum, token]);

  // Connexion Socket.io
  useEffect(() => {
    if (!token || !friendIdNum) return;

    const s = getSocket(token);

    s.on("receiveMessage", (msg: Message) => {
      // Ajouter seulement si le message concerne cette conversation
      const isRelevant =
        (msg.senderId === friendIdNum && Number(user?.id) === msg.receiverId) ||
        (Number(user?.id) === msg.senderId && msg.receiverId === friendIdNum);

      if (isRelevant) {
        setMessages((prev) => {
          // Éviter les doublons
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      s.off("receiveMessage");
    };
  }, [token, friendIdNum, user?.id]);

  // Scroll auto vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !friendIdNum) return;

    const s = getSocket(token);
    s.emit("sendMessage", { receiverId: friendIdNum, content });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  if (!user) return null;

  return (
    <div
      className="flex flex-col h-screen pt-16"
      style={{ background: "rgba(7,7,16,1)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(14,14,28,0.98)" }}
      >
        <button
          onClick={() => navigate("/amis")}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {friend && (
          <>
            <Avatar name={friend.otherUserName} src={friend.otherUserAvatar} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "white" }}>
                {friend.otherUserName}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Conversation privée
              </p>
            </div>
          </>
        )}
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
                className="max-w-xs px-4 py-2 rounded-2xl text-sm"
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
                  style={{ color: isMine ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)", textAlign: isMine ? "right" : "left" }}
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
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(14,14,28,0.98)" }}
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
    </div>
  );
}
