import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AuthPage from "../../src/pages/AuthPage";
import { renderWithProviders } from "../renderWithProviders";

describe("AuthPage", () => {
  test("affiche les elements principaux du formulaire", () => {
    renderWithProviders(<AuthPage />);

    expect(screen.getByRole("heading", { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("toi@exemple.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });
});
