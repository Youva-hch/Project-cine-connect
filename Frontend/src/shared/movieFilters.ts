import type { OmdbMovie } from "./types/omdb.types";

const bannedWords = [
  "porn",
  "xxx",
  "adult",
  "erotic",
  "sex",
  "sangeet",
  "nepali",
  "punjabi",
  "hindi",
  "urdu",
  "pakistani",
  "bangla",
  "bengali",
  "marathi",
  "tamil",
  "telugu",
  "short",
  "trailer",
  "teaser",
  "behind the scenes",
  "making of",
  "fan film",
  "parody",
  "spoof",
  "special",
  "ever made",
  "collection",
  "compilation",
];

export function cleanMovies(movies: OmdbMovie[]) {
  const unique = new Map<string, OmdbMovie>();

  for (const movie of movies) {
    const title = movie.Title.toLowerCase().trim();
    const year = Number(movie.Year?.slice(0, 4));

    const hasValidPoster =
      !!movie.Poster &&
      movie.Poster !== "N/A" &&
      movie.Poster.startsWith("http");

    const hasBadKeyword = bannedWords.some((word) => title.includes(word));

    const looksTooGeneric =
      title.includes("movie ever made") ||
      title.includes("romantic movie") ||
      title.includes("science fiction movie") ||
      title.includes("action movie") ||
      title.includes("comedy movie") ||
      title.includes("drama film") ||
      title.includes("valentine special");

    const titleTooLong = movie.Title.length > 40;

    const isValid =
      movie.Type === "movie" &&
      hasValidPoster &&
      !Number.isNaN(year) &&
      year >= 1990 &&
      !hasBadKeyword &&
      !looksTooGeneric &&
      !titleTooLong;

    if (isValid && !unique.has(movie.imdbID)) {
      unique.set(movie.imdbID, movie);
    }
  }

  return Array.from(unique.values()).sort((a, b) => {
    const yearA = Number(a.Year?.slice(0, 4)) || 0;
    const yearB = Number(b.Year?.slice(0, 4)) || 0;
    return yearB - yearA;
  });
}
