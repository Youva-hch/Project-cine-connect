import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({ rating, onRate, size = "md" }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          disabled={!onRate}
          className={`${onRate ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= rating ? "fill-accent text-accent" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
