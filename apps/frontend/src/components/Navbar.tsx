import { Link, useLocation } from "react-router-dom";
import { Film, Home, MessageCircle, User, LogIn, LogOut, Menu, X, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/films", label: "Films", icon: Film },
  { to: "/amis", label: "Amis", icon: Users },
  { to: "/discussion", label: "Discussion", icon: MessageCircle },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400`}
      style={{
        background: scrolled
          ? "rgba(7, 7, 16, 0.96)"
          : "linear-gradient(to bottom, rgba(7,7,16,0.85) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(139,92,246,0.12)" : "none",
        boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="relative"
            style={{
              filter: "drop-shadow(0 0 8px rgba(139,92,246,0.5))",
            }}
          >
            <Film className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12"
              style={{ color: "hsl(265, 78%, 68%)" }}
            />
          </div>
          <span
            className="font-display text-2xl tracking-wider"
            style={{
              background: "linear-gradient(135deg, hsl(265,78%,72%) 0%, hsl(38,92%,65%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CinéConnect
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-sm group"
                style={{
                  color: isActive ? "white" : "rgba(255,255,255,0.55)",
                }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {item.label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(265,78%,62%), hsl(38,92%,55%))",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/films"
            className="p-2 rounded-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.55)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "white")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.55)")
            }
          >
            <Search className="h-5 w-5" />
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <Link to="/profil">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: "linear-gradient(135deg, hsl(265,78%,58%), hsl(265,60%,44%))",
                    boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                  }}
                >
                  <User className="h-4 w-4 text-white" />
                </button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <button
                className="px-5 py-2 rounded-sm text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(265,78%,58%) 0%, hsl(265,60%,44%) 100%)",
                  boxShadow: "0 2px 16px rgba(139,92,246,0.35)",
                }}
              >
                Connexion
              </button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          style={{ color: "rgba(255,255,255,0.8)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden pb-4 px-4 space-y-1 animate-fade-in"
          style={{
            background: "rgba(7,7,16,0.97)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(139,92,246,0.15)",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: isActive ? "white" : "rgba(255,255,255,0.55)",
                  background: isActive
                    ? "rgba(139,92,246,0.12)"
                    : "transparent",
                  borderLeft: isActive
                    ? "2px solid hsl(265,78%,62%)"
                    : "2px solid transparent",
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/profil"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <User className="h-5 w-5" />
            Profil
          </Link>
          {user ? (
            <button
              onClick={() => {
                signOut();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, hsl(265,78%,58%), hsl(265,60%,44%))",
              }}
            >
              <LogIn className="h-5 w-5" />
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
