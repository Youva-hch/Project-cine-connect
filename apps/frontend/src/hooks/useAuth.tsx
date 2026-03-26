import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { setAuthTokens, clearAuthTokens } from "@/api/config";

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  session: { user: AppUser } | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || '';

function toAppUser(u: { id: number; email: string; name?: string; avatarUrl?: string | null; bio?: string | null }): AppUser {
  return {
    id: String(u.id),
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        setUser(toAppUser(JSON.parse(userStr)));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ email, password, name: username }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Erreur inscription");
    const { token, refreshToken, user: u } = data.data;
    const appUser = toAppUser(u);
    setAuthTokens(token, refreshToken);
    localStorage.setItem("user", JSON.stringify(appUser));
    if (!refreshToken) {
      localStorage.removeItem('refreshToken');
    }
    setUser(appUser);
  };

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Erreur connexion");
    const { token, refreshToken, user: u } = data.data;
    const appUser = toAppUser(u);
    setAuthTokens(token, refreshToken);
    localStorage.setItem("user", JSON.stringify(appUser));
    if (!refreshToken) {
      localStorage.removeItem('refreshToken');
    }
    setUser(appUser);
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Impossible d\'envoyer l\'email de réinitialisation');
    }
  };

  const resetPassword = async (email: string, token: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Impossible de réinitialiser le mot de passe');
    }
  };

  const signOut = async () => {
    clearAuthTokens();
    localStorage.removeItem("user");
    setUser(null);
  };

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, requestPasswordReset, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
