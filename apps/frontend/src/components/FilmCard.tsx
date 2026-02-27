import { Link } from "react-router-dom";
import { Star, MessageCircle } from "lucide-react";
import type { OmdbMovie } from "@/lib/omdb";

interface FilmCardProps {
  film: OmdbMovie;
  size?: "normal" | "large";
}

export function FilmCard({ film, size = "normal" }: FilmCardProps) {
  const hasPoster = film.Poster && film.Poster !== "N/A";
  const isLarge = size === "large";

  return (
    <Link
      to={`/film/${film.imdbID}`}
      className={`group relative block flex-shrink-0 ${
        isLarge ? "w-[250px] md:w-[300px]" : "w-[155px] md:w-[190px]"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-md transition-all duration-300 ease-out cursor-pointer
          ${isLarge ? "aspect-[2/3]" : "aspect-[2/3]"}`}
        style={{
          transform: "scale(1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.07)";
          (e.currentTarget as HTMLElement).style.zIndex = "30";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 1px rgba(139,92,246,0.4), 0 12px 40px rgba(139,92,246,0.5), 0 4px 12px rgba(0,0,0,0.8)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.zIndex = "auto";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Poster */}
        {hasPoster ? (
          <img
            src={film.Poster}
            alt={film.Title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
            <Star className="h-10 w-10 text-muted-foreground" />
            <span className="text-xs text-muted-foreground text-center px-2 leading-tight">
              {film.Title}
            </span>
          </div>
        )}

        {/* Top badge — type */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
            style={{
              background: "rgba(139,92,246,0.85)",
              backdropFilter: "blur(4px)",
              color: "white",
            }}
          >
            {film.Type === "series" ? "Série" : "Film"}
          </span>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(7,7,16,0.97) 0%, rgba(7,7,16,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Hover content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-semibold text-xs text-white truncate leading-snug">
            {film.Title}
          </h3>
          <p className="text-[11px] text-white/50 mt-0.5">{film.Year}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2.5">
            {/* Noter */}
            <button
              title="Noter"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold text-white transition-all duration-150 hover:brightness-110"
              style={{
                background:
                  "linear-gradient(135deg, hsl(265,78%,58%) 0%, hsl(265,60%,44%) 100%)",
              }}
              onClick={(e) => e.preventDefault()}
            >
              <Star className="h-3 w-3 fill-current" />
              Noter
            </button>
            {/* Discuter */}
            <button
              title="Discuter"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-all duration-150 hover:bg-white/20"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => e.preventDefault()}
            >
              <MessageCircle className="h-3 w-3" />
              Avis
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
