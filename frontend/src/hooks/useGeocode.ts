import { useState } from 'react';

export const useGeocode = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = async (query: string): Promise<{ lat: number; lng: number; displayName: string } | null> => {
        if (!query.trim()) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=1`
            );
            const data = await response.json();

            if (!data || data.length === 0) {
                setError('Адрес не найден');
                return null;
            }

            const { lat, lon, display_name } = data[0];

            // Явно преобразуем строки от Nominatim в числа
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lon);

            if (isNaN(latNum) || isNaN(lngNum)) {
                setError('Не удалось определить координаты');
                return null;
            }

            return {
                lat: latNum,
                lng: lngNum,
                displayName: display_name,
            };
        } catch {
            setError('Ошибка поиска адреса');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { search, loading, error };
};