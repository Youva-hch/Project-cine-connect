import { screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, test, vi } from "vitest";

import FilmsPage from "../../src/pages/FilmsPage";
import { renderWithProviders } from "../renderWithProviders";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

vi.mock("../../src/services/omdb.service", () => ({
  getMovieById: vi.fn(async (id: string) => ({
    imdbID: id,
    Title: id === "tt1375666" ? "Inception" : "Interstellar",
    Year: id === "tt1375666" ? "2010" : "2014",
    Poster: "https://example.com/poster.jpg",
    Genre: "Action, Sci-Fi",
  })),
  getMoviesByCategory: vi.fn(async () => ({
    Search: [],
  })),
  searchMovies: vi.fn(async () => ({
    Search: [],
  })),
}));

describe("FilmsPage", () => {
  test("affiche le titre de la page et la recherche", async () => {
    renderWithProviders(<FilmsPage />);

    expect(screen.getByRole("heading", { name: "FILMS" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /rechercher parmi les films/i })).toBeInTheDocument();
    expect(await screen.findByAltText("Inception")).toBeInTheDocument();
  });
});
