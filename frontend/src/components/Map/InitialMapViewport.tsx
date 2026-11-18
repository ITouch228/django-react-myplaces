import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import type { Place } from "../../types";

import { getSavedPlaceCoordinates } from "./saved-place-coordinates";

interface InitialMapViewportProps {
  places: Place[];
  position: [number, number] | null;
  manualTargetActive: boolean;
}

/**
 * Immediately display the saved places. If GPS becomes available later, prefer
 * it once, but never steal the viewport after the user has interacted.
 * Manual "My location" and place selection are handled by MapMover.
 */
export function InitialMapViewport({
  places,
  position,
  manualTargetActive,
}: InitialMapViewportProps) {
  const map = useMap();
  const initialized = useRef(false);
  const gpsApplied = useRef(false);
  const userInteracted = useRef(false);
  const programmaticMove = useRef(false);

  useMapEvents({
    dragstart: () => {
      userInteracted.current = true;
    },
    click: () => {
      userInteracted.current = true;
    },
    zoomstart: () => {
      if (!programmaticMove.current) userInteracted.current = true;
    },
  });

  useEffect(() => {
    if (manualTargetActive || userInteracted.current) return;

    const coordinates = getSavedPlaceCoordinates(places);
    const validGps =
      position !== null &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1]) &&
      Math.abs(position[0]) <= 90 &&
      Math.abs(position[1]) <= 180;

    const applyViewport = (change: () => void) => {
      programmaticMove.current = true;
      try {
        change();
      } finally {
        programmaticMove.current = false;
      }
    };

    if (validGps && !gpsApplied.current) {
      gpsApplied.current = true;
      initialized.current = true;
      applyViewport(() => map.setView(position, 15, { animate: false }));
      return;
    }

    if (initialized.current) return;
    initialized.current = true;
    if (coordinates.length === 1) {
      applyViewport(() => map.setView(coordinates[0], 15, { animate: false }));
    } else if (coordinates.length > 1) {
      applyViewport(() =>
        map.fitBounds(L.latLngBounds(coordinates), {
          padding: [42, 42],
          maxZoom: 15,
          animate: false,
        }),
      );
    }
    // No known positions: keep neutral initial map view.
  }, [map, places, position, manualTargetActive]);

  return null;
}
