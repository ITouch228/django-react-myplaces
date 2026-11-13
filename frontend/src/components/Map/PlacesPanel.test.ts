import { describe, expect, it } from "vitest";
import { filterAndSortPlaces } from "./PlacesPanel";
import type { Place } from "../../types";

const place = (id: number, name: string, address: string, rating: number | null, checks: number) =>
  ({ id, name, address, avg_rating: rating, total_checks: checks }) as Place;

const places = [
  place(1, "Кофейня", "Москва, Тверская", 4.8, 2),
  place(2, "Пиццерия", "Казань, Баумана", null, 4),
  place(3, "Бистро", "Москва, Арбат", 3.7, 1),
];

describe("personal places search and sorting", () => {
  it("matches names and addresses regardless of case", () => {
    expect(filterAndSortPlaces(places, "коФ", "name").map((item) => item.id)).toEqual([1]);
    expect(filterAndSortPlaces(places, "МОСКВА", "name").map((item) => item.id)).toEqual([3, 1]);
  });

  it("returns all places for empty search without modifying original order", () => {
    expect(filterAndSortPlaces(places, "  ", "name").map((item) => item.id)).toEqual([3, 1, 2]);
    expect(places.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("sorts rated places first and unrated places last", () => {
    expect(filterAndSortPlaces(places, "", "rating").map((item) => item.id)).toEqual([1, 3, 2]);
  });

  it("sorts by number of visits", () => {
    expect(filterAndSortPlaces(places, "", "visits").map((item) => item.id)).toEqual([2, 1, 3]);
  });

  it("returns no results for an unmatched query", () => {
    expect(filterAndSortPlaces(places, "Несуществующее", "name")).toEqual([]);
  });
});
