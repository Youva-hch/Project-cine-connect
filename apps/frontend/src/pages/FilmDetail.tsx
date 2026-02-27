import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieById } from "@/lib/omdb";
import { StarRating } from "@/components/StarRating";
import { Clock, Globe, Award, User } from "lucide-react";

export default function FilmDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/2" />
          <div className="flex gap-8">
            <div className="w-72 aspect-[2/3] bg-muted rounded-xl" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const hasPoster = movie.Poster && movie.Poster !== "N/A";

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 shrink-0">
          {hasPoster ? (
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="w-full rounded-xl shadow-2xl"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-muted rounded-xl flex items-center justify-center">
              <span className="text-muted-foreground">Pas d'affiche</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="font-display text-5xl text-foreground">{movie.Title}</h1>
            <p className="text-muted-foreground mt-1">{movie.Year} · {movie.Rated}</p>
          </div>

          {movie.Genre && (
            <div className="flex flex-wrap gap-2">
              {movie.Genre.split(", ").map((g) => (
                <span key={g} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="text-foreground/80 leading-relaxed">{movie.Plot}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {movie.Runtime}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              {movie.Country}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              {movie.Director}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              IMDb {movie.imdbRating}/10
            </div>
          </div>

          {movie.Actors && (
            <div>
              <h3 className="font-display text-xl text-foreground mb-2">Acteurs</h3>
              <p className="text-sm text-muted-foreground">{movie.Actors}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card-cinema p-6">
        <h2 className="font-display text-2xl text-card-foreground mb-2">Avis</h2>
        <p className="text-sm text-muted-foreground">
          Les avis et notes sont disponibles pour les films du catalogue CinéConnect.
        </p>
      </div>
    </div>
  );
}
