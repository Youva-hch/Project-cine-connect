import { screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, test, vi } from "vitest";

import MovieCard from "../../src/components/MovieCard";
import { renderWithProviders } from "../renderWithProviders";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

describe("MovieCard", () => {
  test("affiche le titre et l'annee d'un film", () => {
    renderWithProviders(
      <MovieCard
        title="Interstellar"
        year="2014"
        poster="https://example.com/interstellar.jpg"
        imdbID="tt0816692"
      />
    );

    expect(screen.getByAltText("Interstellar")).toBeInTheDocument();
    expect(screen.getByText("Interstellar")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
  });
});
