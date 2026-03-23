import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "@/components/FilmCard";
import { motion } from "framer-motion";
import type { OmdbMovie } from "@/lib/omdb";

interface FilmRowProps {
  title: string;
  films: OmdbMovie[];
  size?: "normal" | "large";
}

export function FilmRow({
  title,
  films,
  size = "normal",
}: FilmRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (films.length === 0) return null;

  return (
    <motion.section
      className="relative group/row py-4"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="font-display text-xl md:text-2xl text-foreground mb-3 px-4 md:px-12">
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 md:w-12 bg-gradient-to-r from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-8 w-8 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {films.map((film, i) => (
            <motion.div
              key={film.imdbID}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: Math.min(i * 0.06, 0.5),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <FilmCard film={film} size={size} />
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 md:w-12 bg-gradient-to-l from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-8 w-8 text-foreground" />
        </button>
      </div>
    </motion.section>
  );
}
