import type { Place, PlaceCategory, PlaceVisitStatus } from "../../types";

export type PlacesSort = "name" | "rating" | "visits";

export interface PlaceFilters {
  category: PlaceCategory | "all";
  status: PlaceVisitStatus | "all";
  favoritesOnly: boolean;
}
export const DEFAULT_PLACE_FILTERS: PlaceFilters = { category: "all", status: "all", favoritesOnly: false };

export function filterAndSortPlaces(
  places: Place[], query: string, sort: PlacesSort,
  filters: PlaceFilters = DEFAULT_PLACE_FILTERS,
): Place[] {
  const search = query.trim().toLocaleLowerCase();
  const filtered = places.filter(
    (place) =>
      place.name.toLocaleLowerCase().includes(search) ||
      (place.address ?? "").toLocaleLowerCase().includes(search),
  );
  return filtered.filter((place) =>
    (filters.category === "all" || (place.category ?? "other") === filters.category) &&
    (filters.status === "all" || (place.visit_status ?? "visited") === filters.status) &&
    (!filters.favoritesOnly || place.is_favorite === true),
  ).sort((a, b) => {
    if (sort === "rating") {
      return (b.avg_rating ?? -1) - (a.avg_rating ?? -1) || a.name.localeCompare(b.name, "ru");
    }
    if (sort === "visits") {
      return b.total_checks - a.total_checks || a.name.localeCompare(b.name, "ru");
    }
    return a.name.localeCompare(b.name, "ru");
  });
}

