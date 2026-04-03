import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { Film } from "lucide-react";
import styles from "./AuthCallback.module.css";
import { setUserCookie } from "@/lib/userCookie";

export default function AuthCallback() {
  const search = useSearch({ strict: false }) as {
    token?: string;
    refreshToken?: string;
    user?: string;
  };

  useEffect(() => {
    const token = search.token;
    const refreshToken = search.refreshToken;
    const userStr = search.user;

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        setUserCookie({ ...user, id: Number(user.id) });
      } catch {
        // Ignore invalid callback payload
      }
    }
    // Reload complet pour que AuthProvider relise le localStorage
    window.location.replace("/");
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Film
        className={`h-10 w-10 animate-pulse ${styles.icon}`}
      />
      <p className={styles.text}>Connexion en cours...</p>
    </div>
  );
}
