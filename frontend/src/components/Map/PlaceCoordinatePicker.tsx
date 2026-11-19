import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PlaceCoordinatePickerProps {
  coordinates: [number, number];
  onChange: (latitude: number, longitude: number) => void;
}

function CoordinatePickerEvents({ onChange }: { onChange: PlaceCoordinatePickerProps["onChange"] }) {
  const map = useMap();
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  });
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

const selectedMarker = L.divIcon({
  className: "edit-place__marker",
  html: '<span aria-hidden="true">📍</span>',
  iconSize: [28, 34],
  iconAnchor: [14, 32],
});

export function PlaceCoordinatePicker({ coordinates, onChange }: PlaceCoordinatePickerProps) {
  return (
    <div className="edit-place__map-picker">
      <p>Нажмите на карту, чтобы перенести маркер в нужную точку.</p>
      <MapContainer
        center={coordinates}
        zoom={14}
        className="edit-place__map"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <CoordinatePickerEvents onChange={onChange} />
        <Marker position={coordinates} icon={selectedMarker} />
      </MapContainer>
    </div>
  );
}
