const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function getPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des films populaires");
  }

  return res.json();
}

export async function searchMovies(query: string) {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Erreur lors de la recherche des films");
  }

  return res.json();
}

export async function getMovieById(id: number) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
  );

  if (!res.ok) {
    throw new Error("Erreur lors du chargement du film");
  }

  return res.json();
}

export async function getMoviesByGenre(genreId: number) {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
  );

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des films par genre");
  }

  return res.json();
}
