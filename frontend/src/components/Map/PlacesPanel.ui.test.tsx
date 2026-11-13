// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PlacesPanel } from "./PlacesPanel";
import type { Place } from "../../types";

afterEach(cleanup);

const makePlace = (id: number, name: string, address: string, rating: number | null, total_checks: number) =>
  ({ id, name, address, avg_rating: rating, total_checks }) as Place;

const places = [
  makePlace(1, "Кофейня", "Москва, Тверская", 4.8, 2),
  makePlace(2, "Пиццерия", "Казань, Баумана", null, 4),
  makePlace(3, "Бистро", "Москва, Арбат", 3.7, 1),
];

const renderPanel = (overrides: Partial<Parameters<typeof PlacesPanel>[0]> = {}) => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  render(
    <MemoryRouter>
      <PlacesPanel
        places={places}
        open
        selectedId={null}
        onSelect={onSelect}
        onClose={onClose}
        {...overrides}
      />
    </MemoryRouter>,
  );
  return { onSelect, onClose };
};

describe("PlacesPanel interactions", () => {
  it("filters by name and address as the user types and allows clearing the query", () => {
    renderPanel();
    const search = screen.getByRole("searchbox", { name: "Поиск по моим местам" });
    fireEvent.change(search, { target: { value: "тверская" } });
    expect(screen.getByRole("button", { name: "Показать на карте: Кофейня" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Показать на карте: Бистро" })).toBeNull();
    expect(screen.getByText("1 из 3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Сбросить поиск" }));
    expect((search as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("button", { name: /Показать на карте:/ })).toHaveLength(3);
  });

  it("sorts the rendered list by visits, then by rating", () => {
    renderPanel();
    const names = () =>
      screen.getAllByRole("button", { name: /Показать на карте:/ }).map((button) => button.getAttribute("aria-label"));
    const sort = screen.getByRole("combobox", { name: "Порядок сортировки" });
    fireEvent.change(sort, { target: { value: "visits" } });
    expect(names()).toEqual([
      "Показать на карте: Пиццерия",
      "Показать на карте: Кофейня",
      "Показать на карте: Бистро",
    ]);
    fireEvent.change(sort, { target: { value: "rating" } });
    expect(names()).toEqual([
      "Показать на карте: Кофейня",
      "Показать на карте: Бистро",
      "Показать на карте: Пиццерия",
    ]);
  });

  it("selects exactly the clicked place and keeps the details link", () => {
    const { onSelect, onClose } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Показать на карте: Бистро" }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(places[2]);
    expect(screen.getAllByRole("link", { name: "Открыть историю чеков" })[2].getAttribute("href")).toBe("/place/2");
    fireEvent.click(screen.getByRole("button", { name: "Закрыть список мест" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("has a helpful empty state and no selectable places", () => {
    renderPanel({ places: [] });
    expect(screen.getByText("Здесь появятся твои места")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Показать на карте:/ })).toBeNull();
  });

  it("shows a no-results state and can reset the filter", () => {
    renderPanel();
    fireEvent.change(screen.getByRole("searchbox", { name: "Поиск по моим местам" }), {
      target: { value: "нет такого" },
    });
    expect(screen.getByText("Ничего не найдено")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Сбросить поиск" }));
    expect(screen.getAllByRole("button", { name: /Показать на карте:/ })).toHaveLength(3);
  });

  it("disables navigation and filters when closed", () => {
    renderPanel({ open: false });
    expect((screen.getByRole("searchbox", { hidden: true }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("combobox", { hidden: true }) as HTMLSelectElement).disabled).toBe(true);
  });
});
