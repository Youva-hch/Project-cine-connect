import { useQuery } from "@tanstack/react-query";
import { searchMovies, getMovieById } from "../services/omdb.service";
import type {
  OmdbMovieDetail,
  OmdbSearchResponse,
} from "../shared/types/omdb.types";

export const useSearchMovies = (query: string) =>
  useQuery<OmdbSearchResponse>({
    queryKey: ["movies", query],
    queryFn: () => searchMovies(query, 1, 3),
    enabled: !!query,
  });

export const useMovieDetail = (id: string) =>
  useQuery<OmdbMovieDetail>({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id),
    enabled: !!id,
  });
