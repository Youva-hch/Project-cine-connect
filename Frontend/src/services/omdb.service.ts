import type { OmdbMovie, OmdbSearchResponse } from "../shared/types/omdb.types";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = "https://www.omdbapi.com/";

const categorySeeds: Record<string, string[]> = {
  action: [
    "The Dark Knight",
    "Mad Max Fury Road",
    "Top Gun Maverick",
    "John Wick",
    "The Batman",
  ],
  adventure: [
    "The Lord of the Rings",
    "Harry Potter",
    "Jurassic Park",
    "Pirates of the Caribbean",
    "Avatar",
  ],
  crime: [
    "Joker",
    "The Godfather",
    "Heat",
    "Se7en",
    "The Departed",
  ],
  romance: [
    "27 Dresses",
    "How to Lose a Guy in 10 Days",
    "The Notebook",
    "Pride and Prejudice",
    "La La Land",
  ],
  comedy: [
    "The Hangover",
    "Superbad",
    "Mean Girls",
    "Bridesmaids",
    "Legally Blonde",
  ],
  drama: [
    "The Shawshank Redemption",
    "Forrest Gump",
    "Fight Club",
    "The Green Mile",
    "Whiplash",
  ],
  horror: [
    "The Conjuring",
    "Insidious",
    "Scream",
    "Hereditary",
    "The Ring",
  ],
  thriller: [
    "Gone Girl",
    "Prisoners",
    "Nightcrawler",
    "Shutter Island",
    "The Silence of the Lambs",
  ],
  animation: [
    "Spider-Man Into the Spider-Verse",
    "Toy Story",
    "Coco",
    "Your Name",
    "How to Train Your Dragon",
  ],
  "sci-fi": [
    "Interstellar",
    "Inception",
    "Dune",
    "Blade Runner 2049",
    "The Matrix",
  ],
};

export async function searchMovies(query: string, page = 1, pagesToLoad = 1) {
  const requests = Array.from({ length: pagesToLoad }, (_, index) => {
    const currentPage = page + index;

    return fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${currentPage}`
    ).then((res) => res.json());
  });

  const responses = await Promise.all(requests);
  const validResponses = responses.filter(
    (response: OmdbSearchResponse) => response.Response !== "False"
  );

  if (!validResponses.length) {
    return { Search: [], totalResults: "0", Response: "False" };
  }

  const uniqueMovies = new Map<string, OmdbMovie>();

  for (const response of validResponses) {
    for (const movie of response.Search ?? []) {
      if (!uniqueMovies.has(movie.imdbID)) {
        uniqueMovies.set(movie.imdbID, movie);
      }
    }
  }

  return {
    Search: Array.from(uniqueMovies.values()),
    totalResults: validResponses[0].totalResults ?? String(uniqueMovies.size),
    Response: "True",
  };
}

export async function getMovieById(imdbID: string) {
  const res = await fetch(
    `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
  );

  const data = await res.json();

  if (data.Response === "False") {
    throw new Error("Film introuvable");
  }

  return data;
}

export async function getMoviesByCategory(category: string) {
  const seeds = categorySeeds[category.toLowerCase()];

  if (!seeds) {
    return searchMovies(category);
  }

  const results = await Promise.all(seeds.map((seed) => searchMovies(seed)));

  const merged = results.flatMap((result) => result.Search ?? []);

  return {
    Search: merged,
    totalResults: String(merged.length),
    Response: merged.length ? "True" : "False",
  };
}
