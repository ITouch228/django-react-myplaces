import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Place } from "../../types";

export type PlacesSort = "name" | "rating" | "visits";

export function filterAndSortPlaces(places: Place[], query: string, sort: PlacesSort): Place[] {
  const search = query.trim().toLocaleLowerCase();
  const filtered = places.filter(
    (place) =>
      place.name.toLocaleLowerCase().includes(search) ||
      (place.address ?? "").toLocaleLowerCase().includes(search),
  );
  return [...filtered].sort((a, b) => {
    if (sort === "rating") {
      return (b.avg_rating ?? -1) - (a.avg_rating ?? -1) || a.name.localeCompare(b.name, "ru");
    }
    if (sort === "visits") {
      return b.total_checks - a.total_checks || a.name.localeCompare(b.name, "ru");
    }
    return a.name.localeCompare(b.name, "ru");
  });
}

interface PlacesPanelProps {
  places: Place[];
  open: boolean;
  selectedId: number | null;
  onClose: () => void;
  onSelect: (place: Place) => void;
}

export function PlacesPanel({ places, open, selectedId, onClose, onSelect }: PlacesPanelProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<PlacesSort>("name");
  const results = useMemo(() => filterAndSortPlaces(places, query, sort), [places, query, sort]);

  return (
    <aside
      id="my-places-panel"
      className={`places-panel ${open ? "places-panel--open" : ""}`}
      aria-label="Мои места"
      aria-hidden={!open}
    >
      <div className="places-panel__header">
        <div>
          <h2>Мои места</h2>
          <p>Сохранено: {places.length}</p>
        </div>
        <button className="places-panel__close" type="button" onClick={onClose} aria-label="Закрыть список мест">
          ✕
        </button>
      </div>
      <div className="places-panel__filters">
        <label htmlFor="places-filter">Найти заведение</label>
        <input
          id="places-filter"
          type="search"
          placeholder="Название или адрес"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={!open}
        />
        <label htmlFor="places-sort">Сортировать</label>
        <select
          id="places-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as PlacesSort)}
          disabled={!open}
        >
          <option value="name">По названию</option>
          <option value="rating">По рейтингу</option>
          <option value="visits">По количеству чеков</option>
        </select>
      </div>
      <div className="places-panel__results" aria-live="polite">
        {places.length === 0 ? (
          <p className="places-panel__empty">Пока нет сохранённых мест. Нажми на карте, чтобы добавить первое.</p>
        ) : results.length === 0 ? (
          <p className="places-panel__empty">По запросу ничего не найдено.</p>
        ) : (
          <ul className="places-panel__list">
            {results.map((place) => (
              <li key={place.id} className={selectedId === place.id ? "places-panel__selected" : ""}>
                <button
                  type="button"
                  className="places-panel__item"
                  onClick={() => onSelect(place)}
                  disabled={!open}
                  aria-label={`Показать на карте: ${place.name}`}
                >
                  <span className="places-panel__item-title">{place.name}</span>
                  {place.address && <span className="places-panel__address">{place.address}</span>}
                  <span className="places-panel__meta">
                    <span>★ {place.avg_rating == null ? "Нет оценок" : place.avg_rating.toFixed(1)}</span>
                    <span>Чеков: {place.total_checks}</span>
                  </span>
                </button>
                <Link className="places-panel__details" to={`/place/${place.id}`} tabIndex={open ? 0 : -1}>
                  Подробнее
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
