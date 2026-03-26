import { Link, useLocation } from "react-router-dom";
import { Film, Home, MessageCircle, User, LogIn, LogOut, Menu, X, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${styles.nav} ${
        scrolled ? styles.navScrolled : ""
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className={`relative ${styles.logoGlow}`}>
            <Film className={`h-6 w-6 transition-transform duration-300 group-hover:rotate-12 ${styles.logoIcon}`} />
          </div>
          <span className={`font-['Pacifico'] text-2xl tracking-wider ${styles.brandText}`}>
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
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-sm group ${styles.desktopLink} ${
                  isActive ? styles.desktopLinkActive : ""
                }`}
              >
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {item.label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${styles.activeIndicator}`}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle className={styles.themeToggleDesktop} />
          <Link
            to="/films"
            className={`p-2 rounded-sm transition-colors ${styles.searchLink}`}
          >
            <Search className="h-5 w-5" />
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <Link to="/profil">
                <button
                  type="button"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${styles.profileButton}`}
                >
                  <User className="h-4 w-4 text-white" />
                </button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className={`text-sm ${styles.logoutButton}`}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <button
                type="button"
                className={`px-5 py-2 rounded-sm text-sm font-semibold text-white transition-all hover:brightness-110 ${styles.authButton}`}
              >
                Connexion
              </button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 ${styles.mobileToggle}`}
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`md:hidden pb-4 px-4 space-y-1 animate-fade-in ${styles.mobileMenu}`}
        >
          <div className={styles.themeToggleMobileWrap}>
            <ThemeToggle className={styles.themeToggleMobile} />
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${styles.mobileItem} ${
                  isActive ? styles.mobileItemActive : ""
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/profil"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${styles.mobileSecondary}`}
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full ${styles.mobileDanger}`}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white ${styles.mobileAuth}`}
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
