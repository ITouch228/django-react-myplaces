import { useCallback, useState } from "react";

type Coordinates = [number, number];

const getGeolocationError = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Доступ к геолокации запрещён. Разреши доступ в настройках браузера.";
    case error.POSITION_UNAVAILABLE:
      return "Не удалось определить координаты. Проверь геолокацию устройства.";
    case error.TIMEOUT:
      return "Определение местоположения заняло слишком много времени. Повтори попытку.";
    default:
      return "Не удалось получить местоположение.";
  }
};

/** Only ask for location after an explicit user action. */
export const useGeolocation = () => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestPosition = useCallback(async (): Promise<Coordinates | null> => {
    setError(null);
    if (!window.isSecureContext) {
      setError("Геолокация в браузере требует HTTPS. При открытии по локальному IP через HTTP она недоступна.");
      return null;
    }
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается этим браузером.");
      return null;
    }

    setIsLocating(true);
    try {
      const location = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 15000,
        });
      });
      const next: Coordinates = [location.coords.latitude, location.coords.longitude];
      setPosition(next);
      return next;
    } catch (caught) {
      const geolocationError = caught as GeolocationPositionError;
      setError(getGeolocationError(geolocationError));
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return { position, error, isLocating, requestPosition };
};
