import { useEffect } from "react";
import type { LeafletMouseEvent } from "leaflet";
import { useMap } from "react-leaflet";
import { useGeolocation } from "../../hooks/useGeolocation";

interface MapControlsProps {
  onPickLocation: (latitude: number, longitude: number) => void;
}

export function MapController({ onPickLocation }: MapControlsProps) {
  const map = useMap();
  const { position } = useGeolocation();

  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);

  useEffect(() => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "📍 Моё местоположение";
    btn.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            padding: 10px 18px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;

    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!navigator.geolocation) {
        alert("Геолокация не поддерживается");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (location) => {
          map.setView([location.coords.latitude, location.coords.longitude], 15);
        },
        () => alert("Не удалось определить местоположение"),
      );
    });

    const container = document.getElementById("map-controls");
    container?.appendChild(btn);

    return () => {
      btn.remove();
    };
  }, [map]);

  useEffect(() => {
    const handleMapClick = (event: LeafletMouseEvent) => {
      onPickLocation(event.latlng.lat, event.latlng.lng);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onPickLocation]);

  return <div id="map-controls" />;
}
