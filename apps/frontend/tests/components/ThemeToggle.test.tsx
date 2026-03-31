import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import ThemeToggle from "../../src/components/ThemeToggle";
import { renderWithProviders } from "../renderWithProviders";

describe("ThemeToggle", () => {
  test("change le libelle du theme au clic", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem("cineconnect-theme", "dark");

    renderWithProviders(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /activer le mode clair/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Dark");

    await user.click(button);

    expect(screen.getByRole("button", { name: /activer le mode sombre/i })).toHaveTextContent("White");
  });
});
