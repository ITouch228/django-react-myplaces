import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapController } from '../components/Map/MapController';
import { SearchBox } from '../components/Map/SearchBox';
import { usePlaces, useCreatePlace } from '../hooks/usePlaces';
import { useGeolocation } from '../hooks/useGeolocation';
import { useGeocode } from '../hooks/useGeocode';
import type { CreatePlaceData, Place } from '../types';
import 'leaflet/dist/leaflet.css';

const getRatingColor = (rating: number | null): string => {
  if (rating === null) return '#6c757d';
  if (rating >= 4.5) return '#28a745';
  if (rating >= 3.5) return '#ffc107';
  if (rating >= 2.5) return '#fd7e14';
  return '#dc3545';
};

const getMarkerIcon = (rating: number | null) => {
  const color = getRatingColor(rating);
  return L.divIcon({
    className: 'custom-marker',
    html: renderToStaticMarkup(
      <div style={{
        background: color,
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        border: '2px solid white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }}>
        {rating !== null ? rating : '?'}
      </div>
    ),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getEmoji = (rating: number | null) => {
  if (rating === null) return '🆕';
  if (rating >= 4.5) return '🌟';
  if (rating >= 3.5) return '👍';
  if (rating >= 2.5) return '😐';
  return '👎';
};

const MapMover = ({
  target,
  places
}: {
  target: { lat: number; lng: number; placeId?: number } | null;
  places: Place[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    // Проверяем валидность координат
    if (isNaN(target.lat) || isNaN(target.lng)) {
      return;
    }

    map.closePopup();

    map.setView([target.lat, target.lng], 15);

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const pos = layer.getLatLng();
        // Сравниваем с погрешностью 0.0001 (примерно 10 метров)
        if (Math.abs(pos.lat - target.lat) < 0.0001 &&
          Math.abs(pos.lng - target.lng) < 0.0001) {
          setTimeout(() => {
            layer.openPopup();
          }, 300);
        }
      }
    });
  }, [target, map, places]);

  return null;
};

// ===== Основной компонент =====
export const MapPage = () => {
  const { position } = useGeolocation();
  const { data: places, isLoading } = usePlaces();
  const createPlace = useCreatePlace();
  const { search: geocode, loading: geocodeLoading } = useGeocode();

  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number; placeId?: number } | null>(null);

  const defaultCenter: [number, number] = position || [60, 90];
  const defaultZoom = position ? 14 : 4;

  const handleLocalSearch = (query: string) => {
    if (!query.trim()) {
      setMapTarget(null);
      return;
    }

    const q = query.toLowerCase().trim();

    const found = places?.find((place: Place) => {
      const nameMatch = place.name.toLowerCase().includes(q);
      const addressMatch = place.address && place.address.toLowerCase().includes(q);
      return nameMatch || addressMatch;
    });

    if (found) {
      setMapTarget({
        lat: found.latitude,
        lng: found.longitude,
        placeId: found.id
      });
    } else {
      alert('Место не найдено');
      setMapTarget(null);
    }
  };

  const handleMapSearch = async (query: string) => {
    const result = await geocode(query);

    if (result) {
      setMapTarget({
        lat: result.lat,
        lng: result.lng
      });
    }
  };

  const onAddPlace = ({ name, latitude, longitude }: CreatePlaceData) => {
    return createPlace.mutateAsync({ name, latitude, longitude });
  };

  const displayPlaces = places || [];

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Поиск */}
      <div className="search-container">
        <SearchBox
          onSearch={handleLocalSearch}
          onGeocode={handleMapSearch}
        />
        {geocodeLoading && <div className="search-loading">Поиск адреса...</div>}
      </div>

      {/* Карта */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController onAddPlace={onAddPlace} />

        <MapMover target={mapTarget} places={displayPlaces} />

        {displayPlaces.map((place: Place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={getMarkerIcon(place.avg_rating)}
            ref={(ref) => {
              if (ref) {
                (ref as any)._placeId = place.id;
              }
            }}
          >
            <Popup>
              <strong>{getEmoji(place.avg_rating)} {place.name}</strong><br />
              ⭐ {place.avg_rating || '—'} | ₽ {place.avg_price || '—'}<br />
              <Link to={`/place/${place.id}`}>Подробнее</Link>
              <br />
              <Link to={`/place/${place.id}`} state={{ openModal: true }}>+ запись</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};