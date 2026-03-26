import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, UserPlus, UserCheck, MessageSquare, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/api/config";
import styles from "./NotificationBell.module.css";

interface NotifItem {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUserId: number | null;
  relatedUserName: string | null;
  relatedUserAvatar: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

function notifIcon(type: string) {
  if (type === "friend_request") return <UserPlus className={`h-4 w-4 ${styles.iconFriendRequest}`} />;
  if (type === "friend_accepted") return <UserCheck className={`h-4 w-4 ${styles.iconFriendAccepted}`} />;
  return <MessageSquare className={`h-4 w-4 ${styles.iconMessage}`} />;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const token = localStorage.getItem("token");

  const { data: countData } = useQuery({
    queryKey: ["notif-count"],
    queryFn: async () => {
      const res = await apiRequest<{ success: boolean; data: { count: number } }>("/api/notifications/count");
      return res.data?.count ?? 0;
    },
    refetchInterval: 30000,
    enabled: !!token,
  });

  const { data: notifs } = useQuery({
    queryKey: ["notifs"],
    queryFn: async () => {
      const res = await apiRequest<{ success: boolean; data: NotifItem[] }>("/api/notifications");
      return res.data ?? [];
    },
    enabled: open && !!token,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      const t = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifs"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const t = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}` },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifs"] });
      qc.invalidateQueries({ queryKey: ["notif-count"] });
    },
  });

  // Fermer le panel en cliquant à l'extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!token) return null;

  const count = countData ?? 0;

  return (
    <div ref={ref} className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-sm transition-colors ${styles.bellButton} ${
          open ? styles.bellButtonOpen : ""
        }`}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white ${styles.badge}`}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div
          className={`absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50 overflow-hidden ${styles.panel}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 ${styles.header}`}>
            <span className={`text-sm font-semibold ${styles.headerTitle}`}>
              Notifications
            </span>
            {(notifs?.some((n) => !n.isRead)) && (
              <button
                onClick={() => markAll.mutate()}
                className={`flex items-center gap-1 text-xs transition-colors ${styles.actionLink}`}
                type="button"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {!notifs || notifs.length === 0 ? (
              <div className={`py-8 text-center ${styles.emptyState}`}>
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all ${styles.item} ${
                    n.isRead ? styles.itemRead : styles.itemUnread
                  }`}
                  onClick={() => {
                    markRead.mutate(n.id);
                    navigate("/amis");
                    setOpen(false);
                  }}
                >
                  {/* Icône type */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.itemIcon}`}>
                    {notifIcon(n.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.isRead ? styles.messageRead : styles.messageUnread}`}>
                      {n.message}
                    </p>
                    <p className={`text-xs mt-0.5 ${styles.time}`}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Point non lu */}
                  {!n.isRead && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${styles.unreadDot}`} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={`px-4 py-2 ${styles.footer}`}>
            <button
              onClick={() => { navigate("/amis"); setOpen(false); }}
              className={`text-xs w-full text-center transition-colors ${styles.actionLink}`}
              type="button"
            >
              Voir tous les amis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
