import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "./FilmCard";
import type { OmdbMovie } from "@/lib/omdb";

interface FilmRowProps {
  title: string;
  films: OmdbMovie[];
  size?: "normal" | "large";
}

export function FilmRow({ title, films, size = "normal" }: FilmRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (films.length === 0) return null;

  return (
    <section className="relative group/row py-4">
      {/* Section title */}
      <h2
        className="font-display text-xl md:text-2xl mb-3 px-4 md:px-14"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {title}
      </h2>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-14 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{
            background:
              "linear-gradient(to right, rgba(7,7,16,0.95) 0%, transparent 100%)",
          }}
        >
          <ChevronLeft
            className="h-8 w-8 drop-shadow-lg"
            style={{ color: "hsl(265,78%,72%)" }}
          />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-14 pb-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {films.map((film) => (
            <FilmCard key={film.imdbID} film={film} size={size} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-14 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{
            background:
              "linear-gradient(to left, rgba(7,7,16,0.95) 0%, transparent 100%)",
          }}
        >
          <ChevronRight
            className="h-8 w-8 drop-shadow-lg"
            style={{ color: "hsl(265,78%,72%)" }}
          />
        </button>
      </div>
    </section>
  );
}
