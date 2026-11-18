import type { Place } from "../../types";

export type PlacesSort = "name" | "rating" | "visits";

export function filterAndSortPlaces(places: Place[], query: string, sort: PlacesSort): Place[] {
  const search = query.trim().toLocaleLowerCase();
  const filtered = places.filter(
    (place) =>
      place.name.toLocaleLowerCase().includes(search) ||
      (place.address ?? "").toLocaleLowerCase().includes(search),
  );
  return [...filtered].sort((a, b) => {
    if (sort === "rating") {
      return (b.avg_rating ?? -1) - (a.avg_rating ?? -1) || a.name.localeCompare(b.name, "ru");
    }
    if (sort === "visits") {
      return b.total_checks - a.total_checks || a.name.localeCompare(b.name, "ru");
    }
    return a.name.localeCompare(b.name, "ru");
  });
}

