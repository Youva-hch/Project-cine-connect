import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function Discussion() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
      <MessageCircle className="h-16 w-16 text-primary mb-4 opacity-80" />
      <h1 className="font-display text-4xl text-gradient-cinema mb-2">Discussion</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Les discussions entre membres seront bientôt disponibles. Revenez plus tard !
      </p>
    </div>
  );
}
