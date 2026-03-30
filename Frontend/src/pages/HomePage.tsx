import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import ContentRow from "../components/ContentRow";
import { getMovieById } from "../services/omdb.service";
import type { OmdbMovie } from "../shared/types/omdb.types";
import { useTheme } from "../contexts/ThemeContext";

function BadgeArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M7 14 17 4" />
      <path d="M9 4h8v8" />
      <path d="M7 10H4v10h10v-3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2.75 14.86 8.54l6.39.93-4.62 4.5 1.09 6.37L12 17.33l-5.72 3.01 1.09-6.37-4.62-4.5 6.39-.93L12 2.75Z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.53-.29-3.63-.8L3 21l1.87-5.23A8.46 8.46 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

const HERO_FILM_ID = "tt7286456";

const SECTIONS = [
  {
    title: "FILMS À DÉCOUVRIR",
    ids: ["tt1375666", "tt0816692", "tt0468569", "tt1160419", "tt15398776", "tt6751668", "tt2582802", "tt0114369", "tt0482571", "tt7286456"],
  },
  {
    title: "ACTION",
    ids: ["tt4154796", "tt1392190", "tt1745960", "tt1877830", "tt1630029", "tt2911666", "tt0499549", "tt6146586", "tt0848228", "tt2911668"],
  },
  {
    title: "SCIENCE-FICTION",
    ids: ["tt0816692", "tt1375666", "tt1160419", "tt1856101", "tt0133093", "tt0083658", "tt0499549", "tt1630029", "tt0480249", "tt0078748"],
  },
  {
    title: "CLASSIQUES",
    ids: ["tt0068646", "tt0071562", "tt0108052", "tt0110912", "tt0120737", "tt0111161", "tt0109830", "tt0137523", "tt0167260", "tt0167261"],
  },
  {
    title: "AVENTURE",
    ids: ["tt0120737", "tt0167261", "tt0903624", "tt0080684", "tt0167260", "tt0120815", "tt0369610", "tt0107290", "tt1201607", "tt2527336"],
  },
  {
    title: "THRILLER",
    ids: ["tt0137523", "tt0114369", "tt7286456", "tt0102926", "tt0209144", "tt0407887", "tt1130884", "tt2267998", "tt1392214", "tt2872718"],
  },
];

export default function HomePage() {
  const { isLight } = useTheme();
  const { data: heroFilm } = useQuery({
    queryKey: ["frontend-home-hero", HERO_FILM_ID],
    queryFn: () => getMovieById(HERO_FILM_ID),
    staleTime: Infinity,
  });

  const sectionQueries = useQueries({
    queries: SECTIONS.map((section) => ({
      queryKey: ["frontend-home-row", section.title],
      queryFn: async () => Promise.all(section.ids.map((id) => getMovieById(id))),
      staleTime: Infinity,
    })),
  });

  const heroGenres =
    heroFilm?.Genre && heroFilm.Genre !== "N/A"
      ? heroFilm.Genre.split(",").map((genre: string) => genre.trim()).slice(0, 3)
      : ["Crime", "Drama", "Thriller"];

  return (
    <div className={`min-h-screen ${isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-[#050507] text-white"}`}>
      <section className="px-4 pb-8 pt-28 md:px-8 md:pb-10 lg:px-10 xl:px-14">
        <div
          className={`mx-auto max-w-[1900px] rounded-[2rem] px-8 py-10 md:px-14 md:py-14 ${
            isLight
              ? "border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
              : "border border-white/10 bg-[#050507] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          }`}
        >
          <div className="grid items-center gap-12 xl:grid-cols-[minmax(0,1.16fr)_430px]">
            <div className="max-w-5xl">
              <div
                className={`inline-flex items-center gap-3 rounded-full px-5 py-4 text-[1.05rem] font-semibold ${
                  isLight ? "border border-slate-200 bg-slate-50 text-slate-700" : "border border-white/10 bg-white/[0.02] text-white/85"
                }`}
              >
                <BadgeArrowIcon />
                Film mis en avant
              </div>

              <h1
                className={`mt-10 font-['Bebas_Neue'] text-[5.2rem] uppercase leading-[0.84] tracking-tight md:text-[6.5rem] xl:text-[7.5rem] ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                {heroFilm?.Title ?? "JOKER"}
              </h1>

              <div className={`mt-10 flex flex-wrap items-center gap-8 text-[1.15rem] font-semibold ${isLight ? "text-slate-600" : "text-white/85"}`}>
                <span>{heroFilm?.Year ?? "2019"}</span>
                <span>{heroFilm?.Runtime ?? "122 min"}</span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                {heroGenres.map((genre) => (
                  <span
                    key={genre}
                    className={`rounded-full px-5 py-3 text-[1.05rem] font-semibold ${
                      isLight ? "border border-slate-200 bg-slate-50 text-slate-700" : "border border-white/10 bg-white/[0.02] text-white/80"
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div
                className={`mt-10 max-w-4xl px-7 py-8 text-[1.1rem] leading-10 ${
                  isLight ? "border border-slate-200 bg-slate-50 text-slate-600" : "border border-white/10 bg-white/[0.02] text-white/65"
                }`}
              >
                {heroFilm?.Plot && heroFilm.Plot !== "N/A"
                  ? heroFilm.Plot
                  : "A lonely man ignored by society spirals into violence and reinvents himself as Gotham's infamous Joker."}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/film/$id"
                  params={{ id: heroFilm?.imdbID ?? HERO_FILM_ID }}
                  className="inline-flex items-center gap-2 rounded-sm bg-[#35c86d] px-8 py-4 text-lg font-semibold text-white shadow-[0_4px_24px_rgba(34,197,94,0.3)] transition hover:brightness-110"
                >
                  <StarIcon />
                  Noter ce film
                </Link>
                <Link
                  to="/discussion"
                  className={`inline-flex items-center gap-2 rounded-sm px-8 py-4 text-lg font-semibold transition ${
                    isLight ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50" : "border border-white/12 bg-white/[0.02] text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <MessageIcon />
                  Discuter
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[430px] xl:mx-0 xl:ml-auto">
              <div
                className={`rounded-[2.2rem] p-5 ${
                  isLight ? "border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.1)]" : "border border-white/10 bg-[#0a0a0a] shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                }`}
              >
                <div className={`overflow-hidden rounded-[1.8rem] ${isLight ? "bg-slate-100" : "bg-[#111]"}`}>
                  {heroFilm?.Poster && heroFilm.Poster !== "N/A" ? (
                    <img
                      src={heroFilm.Poster}
                      alt={heroFilm.Title}
                      className="aspect-[2/3] w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center bg-[#151515] px-10 text-center font-['Bebas_Neue'] text-7xl uppercase tracking-wide text-white/80">
                      JOKER
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6 pb-20">
        {SECTIONS.map((section, index) => {
          const movies = (sectionQueries[index]?.data ?? []) as OmdbMovie[];
          return <ContentRow key={section.title} title={section.title} movies={movies} />;
        })}
      </div>
    </div>
  );
}
