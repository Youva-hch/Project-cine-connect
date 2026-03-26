import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Film } from "lucide-react";
import styles from "./AuthCallback.module.css";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        localStorage.setItem("user", JSON.stringify({ ...user, id: String(user.id) }));
      } catch {
        // Ignore invalid callback payload
      }
    }
    // Reload complet pour que AuthProvider relise le localStorage
    window.location.replace("/");
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Film
        className={`h-10 w-10 animate-pulse ${styles.icon}`}
      />
      <p className={styles.text}>Connexion en cours...</p>
    </div>
  );
}
