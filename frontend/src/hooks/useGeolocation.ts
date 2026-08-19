import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  return { position, error };
};
