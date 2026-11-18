import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders login page when not authenticated", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "С возвращением" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Зарегистрироваться" })).toBeInTheDocument();
  });
});
