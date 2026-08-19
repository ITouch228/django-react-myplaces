import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useGeolocation } from "../../hooks/useGeolocation";
import type { CreatePlaceData, Place } from "../../types";

interface MapControlsProps {
  onAddPlace: (data: CreatePlaceData) => Promise<Place>;
}

export function MapController({ onAddPlace }: MapControlsProps) {
  const map = useMap();
  const { position } = useGeolocation();

  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);

  useEffect(() => {
    const btn = document.createElement("button");
    btn.innerHTML = "📍 Моё местоположение";
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

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!navigator.geolocation) {
        alert("Геолокация не поддерживается");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        },
        () => alert("Не удалось определить местоположение"),
      );
    });

    const container = document.getElementById("map-controls");
    if (container) {
      container.appendChild(btn);
    }

    return () => {
      btn.remove();
    };
  }, [map]);

  useEffect(() => {
    const handleMapClick = async (e: any) => {
      const { lat, lng } = e.latlng;
      const name = prompt("Введите название места:");
      if (!name) return;
      try {
        await onAddPlace({
          name,
          latitude: lat,
          longitude: lng,
        });
      } catch (err: any) {
        alert("Ошибка: " + (err.message || "Неизвестная ошибка"));
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onAddPlace]);

  // TODO: сделать через React Portal
  return <div id="map-controls" />;
}
