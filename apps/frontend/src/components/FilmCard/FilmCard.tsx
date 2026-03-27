import { Link, useNavigate } from "react-router-dom";
import { Star, MessageCircle, Film } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { OmdbMovie } from "@/lib/omdb";
import { getMovieById } from "@/lib/omdb";
import { getBestPosterUrl } from "@/lib/poster";
import styles from "./FilmCard.module.css";

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
  size?: "normal" | "large" | "category";
  eagerDetails?: boolean;
}

export function FilmCard({ film, size = "normal", eagerDetails = false }: FilmCardProps) {
  const [imgError, setImgError] = useState(false);
  const [shouldLoadDetails, setShouldLoadDetails] = useState(eagerDetails);
  const navigate = useNavigate();
  const posterUrl = getBestPosterUrl(film.Poster, { omdbSize: 1200 });
  const hasPoster = !imgError && !!posterUrl;
  const sizeClass =
    size === "large"
      ? "w-[205px] md:w-[235px]"
      : size === "category"
      ? "w-[150px] sm:w-[165px] md:w-[185px] lg:w-[200px]"
      : "w-[135px] md:w-[165px]";

  const { data: details } = useQuery({
    queryKey: ["film-card-detail", film.imdbID],
    queryFn: () => getMovieById(film.imdbID),
    enabled: eagerDetails || shouldLoadDetails,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const categories = details?.Genre && details.Genre !== "N/A"
    ? details.Genre.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 2)
    : [];
  const averageRating = details?.imdbRating && details.imdbRating !== "N/A"
    ? `${details.imdbRating}/10`
    : "N/A";

  return (
    <Link
      to={`/film/${film.imdbID}`}
      className={`group relative block flex-shrink-0 focus-visible:outline-none ${sizeClass}`}
      onMouseEnter={() => setShouldLoadDetails(true)}
      onFocus={() => setShouldLoadDetails(true)}
    >
      <div
        className={`relative overflow-hidden rounded-md transition-all duration-300 ease-out cursor-pointer
          aspect-[2/3] focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${styles.cardContainer}`}
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
            const initials = getInitials(film.Title);
            return (
              <div className={`w-full h-full flex flex-col items-center justify-between p-3 select-none ${styles.fallbackPoster}`}>
                {/* Haut : icône + type */}
                <div className="w-full flex items-center justify-between">
                  <Film className={`h-3.5 w-3.5 opacity-40 ${styles.fallbackAccent}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-widest opacity-50 ${styles.fallbackAccent}`}>
                    {film.Year}
                  </span>
                </div>

                {/* Centre : initiales géantes */}
                <div className="flex flex-col items-center gap-1">
                  <span className={`font-display leading-none select-none ${styles.fallbackInitials}`}>
                    {initials}
                  </span>
                </div>

                {/* Bas : titre */}
                <div className="w-full">
                  <div className={`w-8 h-0.5 mb-2 rounded-full ${styles.fallbackAccentBar}`} />
                  <p className={`text-white font-semibold leading-tight text-[11px] line-clamp-3 ${styles.fallbackTitle}`}>
                    {film.Title}
                  </p>
                </div>
              </div>
            );
          })()
        )}

        {/* Top badge — categories */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className={`text-[11px] font-semibold tracking-wide px-2 py-1 rounded-sm ${styles.topBadge}`}>
            {categories.length > 0 ? categories.join(" • ") : (film.Type === "series" ? "Série" : "Film")}
          </span>
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${styles.hoverOverlay}`} />

        {/* Hover content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-semibold text-sm text-white truncate leading-snug">
            {film.Title}
          </h3>
          <p className="text-xs text-white/70 mt-0.5">{film.Year}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2.5">
            {/* Note moyenne */}
            <div
              aria-label={`Note moyenne IMDb: ${averageRating}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold text-white ${styles.ratingChip}`}
            >
              <Star className="h-3 w-3 fill-current" />
              {averageRating}
            </div>
            {/* Avis */}
            <button
              title="Voir les avis"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold transition-all duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${styles.reviewsCta}`}
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
  );
}
