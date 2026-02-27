import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchByGenre } from "@/lib/omdb";
import { FilmCard } from "@/components/FilmCard";
import { apiRequest } from "@/api/config";

export default function FilmsByCategory() {
  const { categorie } = useParams<{ categorie: string }>();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiRequest<{ data?: { id: number; name: string; slug: string }[] }>("/categories");
      return res.data ?? [];
    },
  });

  const category = categories?.find((c) => c.slug === categorie);

  const { data, isLoading } = useQuery({
    queryKey: ["films-by-category", categorie, category?.name],
    queryFn: () => searchByGenre(category?.name ?? categorie ?? ""),
    enabled: !!categorie,
  });

  const films = data?.Search ?? [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-5xl text-gradient-cinema">
          {category?.name ?? categorie}
        </h1>
        <p className="text-muted-foreground">Films de la catégorie {category?.name ?? categorie}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card-cinema overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {films.map((film) => (
            <FilmCard key={film.imdbID} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}
