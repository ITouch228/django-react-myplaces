// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AccountMenu } from "./AccountMenu";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  user: { id: 1, username: "Алексей", email: "alex@example.com" } as { id: number; username: string; email?: string } | null,
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, logout: mocks.logout }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.user = { id: 1, username: "Алексей", email: "alex@example.com" };
});

function renderMenu(client = new QueryClient()) {
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<><AccountMenu /><div>Карта</div></>} />
          <Route path="/login" element={<div>Страница входа</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}

describe("AccountMenu", () => {
  it("shows a username chip and toggles the account menu", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Аккаунт: Алексей" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menuitem", { name: /Выйти из аккаунта/ })).toBeTruthy();
    expect(screen.getByText("Настройки")).toBeTruthy();
    fireEvent.click(trigger);
    expect(screen.queryByRole("menuitem", { name: /Выйти из аккаунта/ })).toBeNull();
  });

  it("closes on Escape and restores focus to the trigger", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Аккаунт: Алексей" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when clicked outside", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Аккаунт: Алексей" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("logs out, clears cached private data and returns to login", () => {
    const client = new QueryClient();
    client.setQueryData(["places"], [{ id: 1, name: "Личное место" }]);
    renderMenu(client);
    fireEvent.click(screen.getByRole("button", { name: "Аккаунт: Алексей" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Выйти из аккаунта/ }));
    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(client.getQueryData(["places"])).toBeUndefined();
    expect(screen.getByText("Страница входа")).toBeTruthy();
  });

  it("does not display a badge without an authenticated user", () => {
    mocks.user = null;
    renderMenu();
    expect(screen.queryByRole("button", { name: /Аккаунт:/ })).toBeNull();
  });
});
