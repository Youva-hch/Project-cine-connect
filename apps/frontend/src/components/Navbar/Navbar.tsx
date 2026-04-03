import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Film, MessageCircle, User, LogIn, LogOut, Menu, X, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/api/config";
import styles from "./Navbar.module.css";

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
};

const navItems = [
  { to: "/amis", label: "Amis", icon: Users },
  { to: "/discussion", label: "Discussion", icon: MessageCircle },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filmSearch, setFilmSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ["navbar-categories"],
    queryFn: async () => {
      const res = await apiRequest<{ success?: boolean; data?: CategoryItem[] }>("/categories");
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredCategories = useMemo(() => {
    const q = filmSearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(q)
    );
  }, [categories, filmSearch]);

  const goToFilmsSearch = () => {
    const q = filmSearch.trim();
    navigate({ to: "/films", search: q ? { search: q } : {} });
    setIsSearchOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
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
        <div className="hidden md:flex items-center gap-3">
          <div ref={searchWrapRef} className="relative">
            <div className={styles.searchInputWrap}>
              <Search className={`h-4 w-4 ${styles.searchInputIcon}`} />
              <input
                type="text"
                value={filmSearch}
                onChange={(e) => {
                  setFilmSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToFilmsSearch();
                  }
                  if (e.key === "Escape") {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Rechercher un film..."
                className={styles.searchInput}
                aria-label="Rechercher un film"
              />
            </div>

            <div
              className={`${styles.categoryDropdown} ${isSearchOpen ? styles.categoryDropdownOpen : ""}`}
            >
              <p className={styles.categoryTitle}>Categories</p>
              <div className={styles.categoryList}>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/films/${category.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className={styles.categoryChip}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <p className={styles.categoryEmpty}>Aucune categorie</p>
                )}
              </div>
            </div>
          </div>

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
                <span className={`relative z-10 ${styles.desktopLinkLabel}`}>
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
