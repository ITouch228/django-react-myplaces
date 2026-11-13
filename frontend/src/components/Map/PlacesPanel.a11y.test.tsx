// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlacesPanel } from "./PlacesPanel";
import type { Place } from "../../types";

afterEach(cleanup);

const savedPlace = {
  id: 1,
  name: "Кофейня",
  address: "Тверская улица",
  avg_rating: null,
  total_checks: 0,
} as Place;

describe("PlacesPanel search controls", () => {
  it("distinguishes input clear from resetting empty results", () => {
    render(
      <MemoryRouter>
        <PlacesPanel
          places={[savedPlace]}
          open
          selectedId={null}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      </MemoryRouter>,
    );

    const input = screen.getByRole("searchbox", { name: "Поиск по моим местам" });
    fireEvent.change(input, { target: { value: "Несуществующее" } });

    expect(screen.getByRole("button", { name: "Очистить поле поиска" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Сбросить поиск" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Сбросить поиск" }));
    expect((input as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("button", { name: "Показать на карте: Кофейня" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Очистить поле поиска" })).toBeNull();
  });
});
