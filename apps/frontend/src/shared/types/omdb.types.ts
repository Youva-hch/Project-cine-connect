export interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Search: OmdbMovie[];
  totalResults: string;
  Response: string;
}

export interface OmdbMovieDetail extends OmdbMovie {
  Genre: string;
  Director: string;
  Plot: string;
  imdbRating: string;
}
