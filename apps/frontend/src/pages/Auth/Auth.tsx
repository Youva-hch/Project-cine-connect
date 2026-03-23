import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Film, Star, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const errorMessage = searchParams.get("message");
  const isAuthFailed = searchParams.get("error") === "auth_failed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate("/");
      } else {
        await signUp(email, password, username);
        toast({ title: "Compte créé !", description: "Bienvenue sur CinéConnect." });
        setIsLogin(true);
      }
    } catch (err: unknown) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Film className="h-8 w-8" style={{ color: "hsl(265,78%,62%)" }} />
            <span
              className="font-display text-3xl tracking-wider"
              style={{
                background: "linear-gradient(135deg, hsl(265,78%,72%) 0%, hsl(38,92%,65%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CinéConnect
            </span>
          </div>
          <h1 className="font-display text-4xl" style={{ color: "rgba(255,255,255,0.95)" }}>
            {isLogin ? "Connexion" : "Inscription"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
            {isLogin ? "Content de te revoir" : "Rejoins la communauté CinéConnect"}
          </p>
        </div>

        {/* Erreur Google OAuth */}
        {isAuthFailed && errorMessage && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "rgba(239,68,68,0.9)",
            }}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Bouton Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cinephile42"
                  required={!isLogin}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  className="placeholder:text-white/20"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
                required
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                className="placeholder:text-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", paddingRight: "2.5rem" }}
                  className="placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, hsl(265,78%,58%) 0%, hsl(265,60%,44%) 100%)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.35)",
              }}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 fill-current" />
                  {isLogin ? "Se connecter" : "Créer mon compte"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center mt-5 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: "hsl(265,78%,72%)" }}
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
