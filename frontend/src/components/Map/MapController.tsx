import { useEffect } from "react";
import type { LeafletMouseEvent } from "leaflet";
import { useMap } from "react-leaflet";

interface MapControlsProps {
  onPickLocation: (latitude: number, longitude: number) => void;
}

/**
 * Leaflet is responsible for map events only.
 * Toolbar buttons are rendered by React outside Leaflet's panes.
 */
export function MapController({ onPickLocation }: MapControlsProps) {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = (event: LeafletMouseEvent) => {
      onPickLocation(event.latlng.lat, event.latlng.lng);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onPickLocation]);

  return null;
}
