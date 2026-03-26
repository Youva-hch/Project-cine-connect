import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Star, LogOut, Edit3, Check, X,
  Calendar, MessageCircle, Mail, ChevronRight, Film,
} from "lucide-react";
import { apiRequest } from "@/api/config";
import styles from "./Profile.module.css";

interface FullUser {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const { data: fullUser } = useQuery<{ success: boolean; data: FullUser }>({
    queryKey: ["me"],
    queryFn: () => apiRequest("/api/auth/me"),
    enabled: !!user,
  });

  useEffect(() => {
    if (user) { setName(user.name ?? ""); setBio(user.bio ?? ""); }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: () => apiRequest<{ success: boolean; data: FullUser }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name: name.trim() || undefined, bio: bio.trim() || null }),
    }),
    onSuccess: (res) => {
      const updated = { ...user!, name: res.data.name, bio: res.data.bio };
      localStorage.setItem("user", JSON.stringify(updated));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setIsEditing(false);
      toast({ title: "Profil mis à jour !" });
    },
    onError: (e: unknown) => {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  const avatarUrl = user.avatarUrl;
  const initials = getInitials(user.name ?? user.email ?? "?");
  const createdAt = fullUser?.data?.createdAt;

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
                <img src={avatarUrl} alt={user.name} className={`w-20 h-20 rounded-full object-cover flex-shrink-0 ${styles.avatarRing}`} />
              ) : (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-display text-2xl text-white flex-shrink-0 ${styles.avatarFallback}`}>
                  {initials}
                </div>
              )}

              <div className="space-y-1">
                <h1 className={`font-display text-3xl leading-none ${styles.name}`}>
                  {user.name || "Utilisateur"}
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
                <button onClick={() => setIsEditing(true)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110 ${styles.actionSoft}`} type="button">
                  <Edit3 className="h-4 w-4" /> Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 ${styles.actionPrimary}`} type="button">
                    <Check className="h-4 w-4" /> Sauvegarder
                  </button>
                  <button onClick={() => { setName(user.name ?? ""); setBio(user.bio ?? ""); setIsEditing(false); }} className={`p-2 rounded-lg hover:bg-white/10 ${styles.muted}`} type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bio / formulaire édition */}
          <div className="relative mt-5">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${styles.muted}`}>Nom d'affichage</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" className={`placeholder:text-foreground/35 ${styles.input}`} />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${styles.muted}`}>Bio</label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Parle-nous de toi, de tes films préférés..." rows={3} className={`resize-none placeholder:text-foreground/35 ${styles.input}`} />
                </div>
              </div>
            ) : user.bio ? (
              <p className={`text-sm leading-relaxed ${styles.muted}`}>{user.bio}</p>
            ) : (
              <button onClick={() => setIsEditing(true)} className={`text-sm hover:opacity-80 ${styles.actionSoft}`} type="button">
                + Ajouter une bio
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Star, label: "Films notés", value: "0", color: "hsl(38,92%,55%)" },
            { icon: MessageCircle, label: "Avis postés", value: "0", color: "hsl(265,78%,62%)" },
            { icon: Film, label: "Films vus", value: "0", color: "hsl(200,78%,62%)" },
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
              <Star className="h-5 w-5" style={{ color: "hsl(38,92%,55%)" }} />
              <h2 className={`font-display text-2xl ${styles.name}`}>Mes avis</h2>
            </div>
            <Link to="/films" className={`flex items-center gap-1 text-xs font-medium hover:opacity-80 ${styles.linkAccent}`}>
              Explorer les films <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="py-8 flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${styles.emptyIconWrap}`}>
              <Star className="h-7 w-7" style={{ color: "hsl(265,78%,62%)", opacity: 0.5 }} />
            </div>
            <p className={styles.muted} style={{ fontSize: "0.875rem" }}>Tu n'as pas encore noté de film</p>
            <Link to="/films" className={`px-4 py-2 rounded-lg text-sm font-semibold text-white hover:brightness-110 ${styles.actionPrimary}`}>
              Découvrir des films
            </Link>
          </div>
        </div>

        {/* ── Mes discussions ── */}
        <div className={`rounded-xl p-6 space-y-4 ${styles.sectionCard}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: "hsl(265,78%,62%)" }} />
              <h2 className={`font-display text-2xl ${styles.name}`}>Mes discussions</h2>
            </div>
            <Link to="/discussion" className={`flex items-center gap-1 text-xs font-medium hover:opacity-80 ${styles.linkAccent}`}>
              Voir tout <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="py-8 flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${styles.emptyIconWrap}`}>
              <MessageCircle className="h-7 w-7" style={{ color: "hsl(265,78%,62%)", opacity: 0.5 }} />
            </div>
            <p className={styles.muted} style={{ fontSize: "0.875rem" }}>Tu n'as pas encore participé à une discussion</p>
            <Link to="/discussion" className={`px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 ${styles.actionSoft}`}>
              Rejoindre une discussion
            </Link>
          </div>
        </div>

        {/* ── Déconnexion ── */}
        <div className={`rounded-xl p-4 ${styles.logoutCard}`}>
          <button onClick={() => signOut()} className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 ${styles.danger}`} type="button">
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
}
