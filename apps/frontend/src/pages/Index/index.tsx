import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageCircle, TrendingUp } from 'lucide-react';
import { searchMovies, getMovieById } from '../../lib/omdb';
import { FilmRow } from '../../components/FilmRow/';
import { Button } from '@/components/ui/button';
import styles from './Index.module.css';

const SECTIONS = [
  { title: 'Tendances actuelles', query: '2024' },
  { title: 'Action', query: 'action' },
  { title: 'Science-Fiction', query: 'space' },
  { title: 'Classiques incontournables', query: 'godfather' },
  { title: 'Aventure', query: 'adventure' },
  { title: 'Super-héros', query: 'avengers' },
  { title: 'Thriller & Suspense', query: 'thriller' },
  { title: 'Comédie', query: 'comedy' },
  { title: 'Drame', query: 'drama' },
];

// Films mis en avant — un est choisi aléatoirement à chaque chargement
const HERO_FILMS = [
  'tt15239678', // Dune: Part Two (2024)
  'tt15398776', // Oppenheimer (2023)
  'tt1877830', // The Batman (2022)
  'tt1745960', // Top Gun: Maverick (2022)
  'tt6710474', // Everything Everywhere All at Once (2022)
  'tt4154796', // Avengers: Endgame (2019)
  'tt7286456', // Joker (2019)
  'tt6751668', // Parasite (2019)
  'tt8579674', // 1917 (2019)
  'tt1392190', // Mad Max: Fury Road (2015)
  'tt1856101', // Blade Runner 2049 (2017)
  'tt0816692', // Interstellar (2014)
  'tt1375666', // Inception (2010)
  'tt0468569', // The Dark Knight (2008)
  'tt0111161', // The Shawshank Redemption (1994)
];

function getHighResPosterUrl(posterUrl?: string) {
  if (!posterUrl || posterUrl === 'N/A') return '';

  // OMDb retourne souvent une miniature IMDb (ex: _V1_SX300.jpg).
  // On force une variante plus large pour la hero afin d'eviter le flou en plein ecran.
  if (/_V1_.*\.(jpg|jpeg|png)$/i.test(posterUrl)) {
    return posterUrl.replace(/_V1_.*\.(jpg|jpeg|png)$/i, '_V1_QL75_UX1400_.jpg');
  }

  return posterUrl.replace(/SX\d+/i, 'SX1400').replace(/SY\d+/i, 'SY1400');
}

export default function Index() {
  // Choix aléatoire au montage du composant (change à chaque rechargement)
  const [heroId] = useState(() => HERO_FILMS[Math.floor(Math.random() * HERO_FILMS.length)]);

  const { data: heroFilm } = useQuery({
    queryKey: ['hero-film', heroId],
    queryFn: () => getMovieById(heroId),
    staleTime: Infinity,
  });

  const sectionQueries = SECTIONS.map(section =>
    useQuery({
      queryKey: ['home-films', section.query],
      queryFn: () => searchMovies(section.query, 1),
    })
  );

  const heroPoster = getHighResPosterUrl(heroFilm?.Poster);

  return (
    <div className="min-h-screen -mt-16 bg-cinema-gradient">
      {/* ── Hero Billboard ── */}
      <section className="relative h-[88vh] min-h-[540px] flex items-end">
        {/* Background poster */}
        {heroPoster && (
          <>
            <img
              src={heroPoster}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${styles.heroPoster}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            {/* Grain overlay for cinematic feel */}
            <div
              className={`absolute inset-0 opacity-15 ${styles.grainOverlay}`}
            />
          </>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        {/* Violet ambient glow bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-64 opacity-20 ${styles.bottomGlow}`}
        />

        {/* Hero content */}
        <div className="relative z-10 px-4 md:px-14 pb-20 md:pb-28 max-w-2xl space-y-5 animate-fade-in">
          {/* Badge */}
          <span className={`pill-violet inline-flex items-center gap-1.5 ${styles.heroBadge}`}>
            <TrendingUp className="h-3 w-3" />
            Film mis en avant
          </span>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none text-white drop-shadow-2xl">
            {heroFilm?.Title ?? 'CinéConnect'}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-white">
            {heroFilm?.Year && <span className="font-medium text-white">{heroFilm.Year}</span>}
            {heroFilm?.Runtime && heroFilm.Runtime !== 'N/A' && <span>{heroFilm.Runtime}</span>}
            {heroFilm?.imdbRating && heroFilm.imdbRating !== 'N/A' && (
              <span className="flex items-center gap-1 text-accent font-semibold">
                <Star className="h-4 w-4 fill-current" />
                {heroFilm.imdbRating}/10 IMDb
              </span>
            )}
          </div>

          <p
            className={`text-sm md:text-base text-white/65 max-w-md leading-relaxed ${styles.heroSynopsis}`}
          >
            {heroFilm?.Plot && heroFilm.Plot !== 'N/A'
              ? heroFilm.Plot
              : 'Notez, critiquiez et discutez de vos films préférés avec une communauté de vrais passionnés du cinéma.'}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 pt-1">
            <Link to={`/film/${heroId}`}>
              <Button
                size="lg"
                className={`gap-2 font-semibold rounded-sm px-7 text-white ${styles.primaryCta}`}
              >
                <Star className="h-5 w-5 fill-current" />
                Noter ce film
              </Button>
            </Link>
            <Link to="/discussion">
              <Button
                size="lg"
                variant="secondary"
                className={`gap-2 rounded-sm px-7 font-semibold text-white ${styles.secondaryCta}`}
              >
                <MessageCircle className="h-5 w-5" />
                Discuter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Film rows ── */}
      <div className="relative z-10 space-y-1 pb-16">
        {SECTIONS.map((section, idx) => {
          const films = sectionQueries[idx]?.data?.Search ?? [];
          return (
            <FilmRow
              key={section.query}
              title={section.title}
              films={films}
              size={idx === 0 ? 'large' : 'normal'}
            />
          );
        })}
      </div>
    </div>
  );
}
