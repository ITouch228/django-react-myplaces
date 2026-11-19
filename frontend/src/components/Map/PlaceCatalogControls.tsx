import { useState } from "react";
import type { Place, PlaceCategory, PlaceVisitStatus, UpdatePlaceData } from "../../types";
import { PLACE_CATEGORIES, VISIT_STATUSES } from "./place-catalog-options";
import "./place-catalog-controls.css";

interface PlaceCatalogControlsProps {
  place: Place;
  pending: boolean;
  onSave: (data: UpdatePlaceData) => Promise<unknown>;
}

export function PlaceCatalogControls({ place, pending, onSave }: PlaceCatalogControlsProps) {
  const [error, setError] = useState<string | null>(null);

  const update = async (data: UpdatePlaceData) => {
    setError(null);
    try {
      await onSave(data);
    } catch {
      setError("Не удалось обновить место. Проверь соединение и повтори попытку.");
    }
  };

  return (
    <section className="place-catalog-controls" aria-label="Категория и коллекция">
      <div className="place-catalog-controls__field">
        <label htmlFor="place-category">Тип заведения</label>
        <select
          id="place-category"
          value={place.category ?? "other"}
          onChange={(event) => void update({ category: event.target.value as PlaceCategory })}
          disabled={pending}
        >
          {PLACE_CATEGORIES.map((category) =>
            <option key={category.value} value={category.value}>{category.label}</option>
          )}
        </select>
      </div>
      <div className="place-catalog-controls__field">
        <label htmlFor="place-visit-status">Планы</label>
        <select
          id="place-visit-status"
          value={place.visit_status ?? "visited"}
          onChange={(event) => void update({ visit_status: event.target.value as PlaceVisitStatus })}
          disabled={pending}
        >
          {VISIT_STATUSES.map((status) =>
            <option key={status.value} value={status.value}>{status.label}</option>
          )}
        </select>
      </div>
      <button
        type="button"
        className={`place-catalog-controls__favorite ${place.is_favorite ? "place-catalog-controls__favorite--active" : ""}`}
        aria-pressed={Boolean(place.is_favorite)}
        disabled={pending}
        onClick={() => void update({ is_favorite: !place.is_favorite })}
      >
        {place.is_favorite ? "★ В избранном" : "☆ В избранное"}
      </button>
      {pending && <span className="place-catalog-controls__pending" role="status">Сохраняем...</span>}
      {error && <p className="place-catalog-controls__error" role="alert">{error}</p>}
    </section>
  );
}
