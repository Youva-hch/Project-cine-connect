import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Film } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ ...user, id: String(user.id) }));
      } catch (_) {}
    }
    // Reload complet pour que AuthProvider relise le localStorage
    window.location.replace("/");
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Film
        className="h-10 w-10 animate-pulse"
        style={{ color: "hsl(265,78%,62%)" }}
      />
      <p style={{ color: "rgba(255,255,255,0.5)" }}>Connexion en cours...</p>
    </div>
  );
}
