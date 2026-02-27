import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, MessageCircle, TrendingUp, ArrowRight } from "lucide-react";
import { searchMovies } from "@/lib/omdb";
import { FilmRow } from "@/components/FilmRow";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { title: "Tendances actuelles", query: "2024" },
  { title: "Action", query: "action" },
  { title: "Science-Fiction", query: "space" },
  { title: "Classiques incontournables", query: "godfather" },
  { title: "Aventure", query: "adventure" },
  { title: "Super-héros", query: "avengers" },
  { title: "Thriller & Suspense", query: "thriller" },
  { title: "Comédie", query: "comedy" },
  { title: "Drame", query: "drama" },
];

export default function Index() {
  const sectionQueries = SECTIONS.map((section) =>
    useQuery({
      queryKey: ["home-films", section.query],
      queryFn: () => searchMovies(section.query, 1),
    })
  );

  const allFilms = sectionQueries.flatMap((q) => q.data?.Search ?? []);
  const heroFilm = allFilms.find((f) => f.Poster && f.Poster !== "N/A");

  return (
    <div className="min-h-screen -mt-16 bg-cinema-gradient">
      {/* ── Hero Billboard ── */}
      <section className="relative h-[88vh] min-h-[540px] flex items-end">
        {/* Background poster */}
        {heroFilm?.Poster && (
          <>
            <img
              src={heroFilm.Poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-105"
              style={{ filter: "saturate(0.8) brightness(0.55)" }}
            />
            {/* Grain overlay for cinematic feel */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
              }}
            />
          </>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        {/* Violet ambient glow bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 20% 100%, hsl(265,78%,50%), transparent 70%)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 px-4 md:px-14 pb-20 md:pb-28 max-w-2xl space-y-5 animate-fade-in">
          {/* Badge */}
          <span className="pill-violet inline-flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            Film mis en avant
          </span>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none text-white drop-shadow-2xl">
            {heroFilm?.Title ?? "CinéConnect"}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-white/60">
            {heroFilm?.Year && (
              <span className="font-medium text-white/80">{heroFilm.Year}</span>
            )}
            <span className="flex items-center gap-1 text-accent font-semibold">
              <Star className="h-4 w-4 fill-current" />
              Soyez le premier à noter
            </span>
          </div>

          <p className="text-sm md:text-base text-white/65 max-w-md leading-relaxed">
            Notez, critiquiez et discutez de vos films préférés avec une communauté de vrais passionnés du cinéma.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 pt-1">
            <Link to={heroFilm ? `/film/${heroFilm.imdbID}` : "/films"}>
              <Button
                size="lg"
                className="gap-2 font-semibold rounded-sm px-7 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(265,78%,58%) 0%, hsl(265,60%,44%) 100%)",
                  boxShadow: "0 4px 24px rgba(139,92,246,0.4)",
                }}
              >
                <Star className="h-5 w-5 fill-current" />
                Noter ce film
              </Button>
            </Link>
            <Link to="/discussion">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 rounded-sm px-7 font-semibold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Discuter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="relative z-10 -mt-2 px-4 md:px-14 pb-6">
        <div
          className="inline-flex items-center gap-8 px-6 py-3 rounded-lg text-sm"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <span className="text-white/50">
            <span className="text-accent font-bold text-base">10 000+</span>{" "}
            films notés
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-white/50">
            <span className="text-accent font-bold text-base">5 000+</span>{" "}
            discussions actives
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-white/50">
            <span className="text-accent font-bold text-base">2 500+</span>{" "}
            membres
          </span>
        </div>
      </div>

      {/* ── Film rows ── */}
      <div className="relative z-10 space-y-1 pb-16">
        {SECTIONS.map((section, idx) => {
          const films = sectionQueries[idx]?.data?.Search ?? [];
          return (
            <FilmRow
              key={section.query}
              title={section.title}
              films={films}
              size={idx === 0 ? "large" : "normal"}
            />
          );
        })}
      </div>
    </div>
  );
}
