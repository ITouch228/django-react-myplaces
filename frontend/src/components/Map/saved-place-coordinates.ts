import type { Place } from "../../types";

/**
 * Invalid coordinates must never become the center of the Leaflet map.
 * Pure helper is also used by the initial map viewport tests.
 */
export function getSavedPlaceCoordinates(places: Place[]): [number, number][] {
  return places
    .filter(
      (place) =>
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude) &&
        Math.abs(place.latitude) <= 90 &&
        Math.abs(place.longitude) <= 180,
    )
    .map((place): [number, number] => [place.latitude, place.longitude]);
}

