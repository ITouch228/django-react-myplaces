import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Place, PlaceCategory, PlaceVisitStatus } from "../../types";
import { PLACE_CATEGORIES, VISIT_STATUSES, categoryLabel, visitStatusLabel } from "./place-catalog-options";

import { filterAndSortPlaces, type PlacesSort, type PlaceFilters } from "./places-filter-sort";

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
  const [filters, setFilters] = useState<PlaceFilters>({ category: "all", status: "all", favoritesOnly: false });
  const results = useMemo(() => filterAndSortPlaces(places, query, sort, filters), [places, query, sort, filters]);

  return (
    <aside
      id="my-places-panel"
      className={`places-panel ${open ? "places-panel--open" : ""}`}
      aria-label="Мои места"
      aria-hidden={!open}
    >
      <div className="places-panel__header">
        <div>
          <span className="places-panel__eyebrow">Личная коллекция</span>
          <h2>Мои места</h2>
          <p>{places.length} сохранено · {places.filter((place) => place.total_checks > 0).length} с посещениями</p>
        </div>
        <button className="places-panel__close" type="button" onClick={onClose} aria-label="Закрыть список мест">
          ✕
        </button>
      </div>
      <div className="places-panel__filters">
        <label htmlFor="places-filter" className="places-panel__filter-label">Поиск по моим местам</label>
        <div className="places-panel__search-row">
          <span aria-hidden="true">⌕</span>
          <input
            id="places-filter"
            type="search"
            placeholder="Название или адрес"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={!open}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Сбросить поиск">✕</button>
          )}
        </div>
        <div className="places-panel__catalog-filters">
          <label htmlFor="places-category">Категория</label>
          <select
            id="places-category"
            value={filters.category}
            onChange={(event) => setFilters((previous) => ({ ...previous, category: event.target.value as PlaceCategory | "all" }))}
            disabled={!open}
          >
            <option value="all">Все категории</option>
            {PLACE_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
          </select>
          <label htmlFor="places-status">Статус</label>
          <select
            id="places-status"
            value={filters.status}
            onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value as PlaceVisitStatus | "all" }))}
            disabled={!open}
          >
            <option value="all">Все места</option>
            {VISIT_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
          <label className="places-panel__favorite-filter">
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(event) => setFilters((previous) => ({ ...previous, favoritesOnly: event.target.checked }))}
              disabled={!open}
            />
            Только избранные
          </label>
        </div>
        <div className="places-panel__sort-row">
          <span className="places-panel__results-count">{results.length} из {places.length}</span>
          <label htmlFor="places-sort" className="sr-only">Порядок сортировки</label>
          <select
            id="places-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as PlacesSort)}
            disabled={!open}
          >
            <option value="name">По названию</option>
            <option value="rating">По рейтингу</option>
            <option value="visits">По посещениям</option>
          </select>
        </div>
      </div>
      <div className="places-panel__results" aria-live="polite">
        {places.length === 0 ? (
          <div className="places-panel__empty">
            <span aria-hidden="true">📍</span>
            <strong>Здесь появятся твои места</strong>
            <p>Закрой панель и нажми на карту, чтобы сохранить первое место.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="places-panel__empty">
            <span aria-hidden="true">⌕</span>
            <strong>Ничего не найдено</strong>
            <p>Попробуй изменить поиск или фильтры.</p>
          </div>
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
                  <span className="places-panel__pin" aria-hidden="true">📍</span>
                  <span className="places-panel__item-body">
                    <span className="places-panel__item-title">{place.name}</span>
                    {place.address && <span className="places-panel__address">{place.address}</span>}
                    <span className="places-panel__meta">
                      <span>{categoryLabel(place.category)}</span>
                      <span>·</span>
                      <span>{visitStatusLabel(place.visit_status)}</span>
                      {place.is_favorite && <span aria-label="В избранном">★</span>}
                      <span>·</span>
                      <span>★ {place.avg_rating == null ? "Без оценок" : place.avg_rating.toFixed(1)}</span>
                      <span>·</span>
                      <span>{place.total_checks} чеков</span>
                    </span>
                  </span>
                  <span className="places-panel__item-arrow" aria-hidden="true">›</span>
                </button>
                <Link className="places-panel__details" to={`/place/${place.id}`} tabIndex={open ? 0 : -1}>
                  Открыть историю чеков
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="places-panel__footer">Нажми на место, чтобы показать его на карте</div>
    </aside>
  );
}
