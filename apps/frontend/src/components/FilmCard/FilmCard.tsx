import { Link, useNavigate } from "react-router-dom";
import { Star, MessageCircle, Film } from "lucide-react";
import { useState } from "react";
import type { OmdbMovie } from "@/lib/omdb";
import { getBestPosterUrl } from "@/lib/poster";
import { ReviewModal } from "@/components/ReviewModal";

// Génère un dégradé unique basé sur le titre du film
function getPosterGradient(title: string) {
  const gradients = [
    ["#1a0533", "#3b0764", "#7c3aed"],
    ["#0f172a", "#1e3a5f", "#2563eb"],
    ["#1a0a00", "#431407", "#c2410c"],
    ["#0a1628", "#0c4a6e", "#0284c7"],
    ["#0f0a1e", "#2d1b69", "#5b21b6"],
    ["#150d00", "#451a03", "#b45309"],
    ["#0a1a0a", "#14532d", "#16a34a"],
    ["#1a0a1a", "#581c87", "#9333ea"],
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash += title.charCodeAt(i);
  return gradients[hash % gradients.length];
}

function getInitials(title: string) {
  return title
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || title.slice(0, 2).toUpperCase();
}

interface FilmCardProps {
  film: OmdbMovie;
  size?: "normal" | "large";
}

export function FilmCard({ film, size = "normal" }: FilmCardProps) {
  const [imgError, setImgError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigate = useNavigate();
  const posterUrl = getBestPosterUrl(film.Poster, { omdbSize: 1200, tmdbWidth: 780 });
  const hasPoster = !imgError && !!posterUrl;
  const isLarge = size === "large";

  return (
    <>
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
            src={posterUrl}
            alt={film.Title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          (() => {
            const [c1, c2, c3] = getPosterGradient(film.Title);
            const initials = getInitials(film.Title);
            return (
              <div
                className="w-full h-full flex flex-col items-center justify-between p-3 select-none"
                style={{
                  background: `linear-gradient(160deg, ${c1} 0%, ${c2} 55%, ${c3}33 100%)`,
                }}
              >
                {/* Haut : icône + type */}
                <div className="w-full flex items-center justify-between">
                  <Film className="h-3.5 w-3.5 opacity-40" style={{ color: c3 }} />
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest opacity-50"
                    style={{ color: c3 }}
                  >
                    {film.Year}
                  </span>
                </div>

                {/* Centre : initiales géantes */}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="font-display leading-none select-none"
                    style={{
                      fontSize: "clamp(2.5rem, 6vw, 4rem)",
                      color: c3,
                      opacity: 0.25,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {initials}
                  </span>
                </div>

                {/* Bas : titre */}
                <div className="w-full">
                  <div
                    className="w-8 h-0.5 mb-2 rounded-full"
                    style={{ background: c3, opacity: 0.5 }}
                  />
                  <p
                    className="text-white font-semibold leading-tight text-[11px] line-clamp-3"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                  >
                    {film.Title}
                  </p>
                </div>
              </div>
            );
          })()
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
                background: "linear-gradient(135deg, hsl(265,78%,58%) 0%, hsl(265,60%,44%) 100%)",
              }}
              onClick={(e) => {
                e.preventDefault();
                setShowReviewModal(true);
              }}
            >
              <Star className="h-3 w-3 fill-current" />
              Noter
            </button>
            {/* Avis */}
            <button
              title="Voir les avis"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-all duration-150 hover:bg-white/20"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/film/${film.imdbID}`);
              }}
            >
              <MessageCircle className="h-3 w-3" />
              Avis
            </button>
          </div>
        </div>
      </div>
    </Link>

    {showReviewModal && (
      <ReviewModal film={film} onClose={() => setShowReviewModal(false)} />
    )}
  </>
  );
}
