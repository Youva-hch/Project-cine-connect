import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Film, Star, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import styles from "./Auth.module.css";

const API_BASE = import.meta.env.VITE_API_URL || '';

type AuthMode = "login" | "register" | "forgot" | "reset";

interface AuthSearch {
  mode?: string;
  token?: string;
  email?: string;
  error?: string;
  message?: string;
}

function resolveMode(search: AuthSearch): AuthMode {
  const mode = search.mode;
  if (mode === "forgot") return "forgot";
  if (mode === "reset" && search.token && search.email) return "reset";
  return "login";
}

export default function Auth() {
  const search = useSearch({ strict: false }) as AuthSearch;
  const [mode, setMode] = useState<AuthMode>(() => resolveMode(search));
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState(search.email || "");
  const [resetToken, setResetToken] = useState(search.token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const errorMessage = search.message;
  const isAuthFailed = search.error === "auth_failed";

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  const titleMap: Record<AuthMode, string> = {
    login: "Connexion",
    register: "Inscription",
    forgot: "Mot de passe oublié",
    reset: "Nouveau mot de passe",
  };

  const subtitleMap: Record<AuthMode, string> = {
    login: "Content de te revoir",
    register: "Rejoins la communauté CinéConnect",
    forgot: "On t'envoie un lien de réinitialisation",
    reset: "Définis un nouveau mot de passe",
  };

  const submitLabelMap: Record<AuthMode, string> = {
    login: "Se connecter",
    register: "Créer mon compte",
    forgot: "Envoyer le lien",
    reset: "Réinitialiser le mot de passe",
  };

  useEffect(() => {
    setMode(resolveMode(search));
    setResetEmail(search.email || "");
    setResetToken(search.token || "");
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate({ to: "/" });
      } else if (isRegister) {
        await signUp(email, password, username);
        toast({ title: "Compte créé !", description: "Bienvenue sur CinéConnect." });
        setMode("login");
      } else if (isForgot) {
        if (!email.trim()) {
          throw new Error("Veuillez saisir votre email");
        }
        await requestPasswordReset(email.trim());
        toast({
          title: "Email envoyé",
          description: "Si un compte existe, tu recevras un lien de réinitialisation.",
        });
        setMode("login");
      } else {
        if (!resetEmail.trim() || !resetToken.trim()) {
          throw new Error("Lien de réinitialisation invalide. Demande un nouveau lien.");
        }
        if (password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        }
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        await resetPassword(resetEmail.trim(), resetToken.trim(), password);
        toast({ title: "Mot de passe mis à jour", description: "Tu peux maintenant te connecter." });
        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        setResetEmail("");
        setMode("login");
        navigate({ to: "/auth", replace: true });
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
        className={`absolute inset-0 pointer-events-none ${styles.ambientGlow}`}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Film className={`h-8 w-8 ${styles.brandIcon}`} />
            <span className={`font-display text-3xl tracking-wider ${styles.brandText}`}>
              CinéConnect
            </span>
          </div>
          <h1 className={`font-display text-4xl ${styles.title}`}>
            {titleMap[mode]}
          </h1>
          <p className={styles.subtitle}>
            {subtitleMap[mode]}
          </p>
        </div>

        {/* Erreur Google OAuth */}
        {isAuthFailed && errorMessage && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm ${styles.errorBanner}`}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        <div
          className={`rounded-xl p-6 space-y-4 ${styles.panel}`}
        >
          {!isForgot && !isReset && (
            <>
              {/* Bouton Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 ${styles.googleButton}`}
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
                <div className={`flex-1 h-px ${styles.dividerLine}`} />
                <span className={styles.dividerText}>ou</span>
                <div className={`flex-1 h-px ${styles.dividerLine}`} />
              </div>
            </>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="username" className={`text-xs font-medium ${styles.label}`}>
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cinephile42"
                  required={!isLogin}
                  className={`placeholder:text-white/20 ${styles.input}`}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className={`text-xs font-medium ${styles.label}`}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={isReset ? resetEmail : email}
                onChange={(e) => (isReset ? setResetEmail(e.target.value) : setEmail(e.target.value))}
                placeholder="toi@exemple.com"
                required
                className={`placeholder:text-white/20 ${styles.input}`}
              />
            </div>

            {!isForgot && (
              <div className="space-y-1.5">
                <label htmlFor="password" className={`text-xs font-medium ${styles.label}`}>
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
                    className={`placeholder:text-white/20 ${styles.input} ${styles.passwordInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${styles.eyeButton}`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {isReset && (
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className={`text-xs font-medium ${styles.label}`}>
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`placeholder:text-white/20 ${styles.input}`}
                />
              </div>
            )}

            {isReset && (
              <div className="space-y-1.5">
                <label htmlFor="resetToken" className={`text-xs font-medium ${styles.label}`}>
                  Token de réinitialisation
                </label>
                <Input
                  id="resetToken"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Colle le token si nécessaire"
                  required
                  className={`placeholder:text-white/20 ${styles.input}`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 mt-2 flex items-center justify-center gap-2 ${styles.submitButton} ${
                !loading ? styles.submitButtonShadow : ""
              }`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 fill-current" />
                  {submitLabelMap[mode]}
                </>
              )}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className={`w-full text-xs font-medium hover:opacity-80 ${styles.greenLink}`}
              >
                Mot de passe oublié ?
              </button>
            )}

            {(isForgot || isReset) && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  navigate({ to: "/auth", replace: true });
                }}
                className={`w-full text-xs font-medium hover:opacity-80 ${styles.greenLink}`}
              >
                Retour à la connexion
              </button>
            )}
          </form>
        </div>

        {/* Toggle */}
        {(isLogin || isRegister) && (
          <p className={`text-center mt-5 text-sm ${styles.toggleText}`}>
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => setMode(isLogin ? "register" : "login")}
              className={`font-semibold transition-colors hover:opacity-80 ${styles.greenLink}`}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
