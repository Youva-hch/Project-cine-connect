import { Link } from "@tanstack/react-router";
import { useState } from "react";

type MovieCardProps = {
  title: string;
  year: string;
  poster: string;
  imdbID: string;
};

export default function MovieCard({
  title,
  year,
  poster,
  imdbID,
}: MovieCardProps) {
  const [imgError, setImgError] = useState(false);

  if (!poster || poster === "N/A" || imgError) {
    return null;
  }

  return (
    <Link to="/film/$id" params={{ id: imdbID }} className="group block h-full">
      <div className="h-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
        <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-800">
          <img
            src={poster}
            alt={title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex min-h-[108px] flex-col justify-between p-4">
          <h3 className="line-clamp-2 text-[1.05rem] font-bold leading-8 text-white sm:text-[1.15rem]">
            {title}
          </h3>
          <p className="mt-3 text-sm text-zinc-400">{year}</p>
        </div>
      </div>
    </Link>
  );
}
