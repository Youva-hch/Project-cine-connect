import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

import { useMovieDetail, useSearchMovies } from "../../src/hooks/useMovies";

vi.mock("../../src/services/omdb.service", () => ({
  searchMovies: vi.fn(async () => ({
    Search: [{ imdbID: "tt1375666", Title: "Inception", Year: "2010", Poster: "https://example.com/inception.jpg" }],
    Response: "True",
    totalResults: "1",
  })),
  getMovieById: vi.fn(async () => ({
    imdbID: "tt0816692",
    Title: "Interstellar",
    Year: "2014",
    Poster: "https://example.com/interstellar.jpg",
    Genre: "Adventure, Drama, Sci-Fi",
    Response: "True",
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useMovies hooks", () => {
  test("charge les resultats de recherche", async () => {
    const { result } = renderHook(() => useSearchMovies("inception"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.Search?.[0]?.Title).toBe("Inception");
  });

  test("charge le detail d'un film", async () => {
    const { result } = renderHook(() => useMovieDetail("tt0816692"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.Title).toBe("Interstellar");
  });
});
