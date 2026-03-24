import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilmCard } from "@/components/FilmCard";
import { motion } from "framer-motion";
import type { OmdbMovie } from "@/lib/omdb";
import styles from "./FilmRow.module.css";

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
      <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3 px-4 md:px-12 tracking-wide text-white">
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          aria-label={`Faire défiler ${title} vers la gauche`}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-14 bg-gradient-to-r from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none"
        >
          <ChevronLeft className="h-9 w-9 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className={`flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pt-5 pb-10 -mt-5 -mb-2 ${styles.rowScroll}`}
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
          aria-label={`Faire défiler ${title} vers la droite`}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-14 bg-gradient-to-l from-background/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none"
        >
          <ChevronRight className="h-9 w-9 text-foreground" />
        </button>
      </div>
    </motion.section>
  );
}
