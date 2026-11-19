import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CreatePlaceData, PlaceCategory, PlaceVisitStatus } from "../../types";
import { PLACE_CATEGORIES, VISIT_STATUSES } from "./place-catalog-options";
import "./create-place-dialog.css";
import { validatePlaceName } from "./place-name-validation";

type Coordinates = { lat: number; lng: number };

interface CreatePlaceDialogProps {
  coordinates: Coordinates | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: CreatePlaceData) => Promise<void>;
}


export function CreatePlaceDialog({
  coordinates,
  pending,
  error,
  onClose,
  onSave,
}: CreatePlaceDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("other");
  const [visitStatus, setVisitStatus] = useState<PlaceVisitStatus>("visited");
  const [isFavorite, setIsFavorite] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName("");
    setAddress("");
    setCategory("other");
    setVisitStatus("visited");
    setIsFavorite(false);
    setValidationError(null);
    if (coordinates) inputRef.current?.focus();
  }, [coordinates]);

  useEffect(() => {
    if (!coordinates) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [coordinates, pending, onClose]);

  if (!coordinates) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const message = validatePlaceName(name);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError(null);
    await onSave({
      name: name.trim(),
      address: address.trim(),
      category,
      visit_status: visitStatus,
      is_favorite: isFavorite,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    });
  };

  return (
    <div className="place-dialog__backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !pending) onClose();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-place-title"
        className="place-dialog"
      >
        <div className="place-dialog__header">
          <div>
            <span className="place-dialog__eyebrow">Новая точка на карте</span>
            <h2 id="create-place-title">Добавить место</h2>
          </div>
          <button type="button" className="place-dialog__close" onClick={onClose} disabled={pending} aria-label="Закрыть форму">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="place-dialog__body">
            <label htmlFor="new-place-name">Название *</label>
            <input
              id="new-place-name"
              ref={inputRef}
              value={name}
              maxLength={201}
              onChange={(event) => {
                setName(event.target.value);
                setValidationError(null);
              }}
              placeholder="Например, Любимая кофейня"
              autoComplete="off"
              disabled={pending}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "place-dialog-error" : undefined}
            />
            <label htmlFor="new-place-address">Адрес (необязательно)</label>
            <input
              id="new-place-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Улица, дом или ориентир"
              disabled={pending}
            />
            <label htmlFor="new-place-category">Категория</label>
            <select
              id="new-place-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as PlaceCategory)}
              disabled={pending}
            >
              {PLACE_CATEGORIES.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
            </select>
            <label htmlFor="new-place-status">Статус</label>
            <select
              id="new-place-status"
              value={visitStatus}
              onChange={(event) => setVisitStatus(event.target.value as PlaceVisitStatus)}
              disabled={pending}
            >
              {VISIT_STATUSES.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
            </select>
            <label className="place-dialog__checkbox">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(event) => setIsFavorite(event.target.checked)}
                disabled={pending}
              />
              Добавить в избранное
            </label>
            <div className="place-dialog__coordinates">
              <span>Выбранная точка</span>
              <span>{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</span>
            </div>
            {(validationError || error) && (
              <p id="place-dialog-error" className="place-dialog__error" role="alert">
                {validationError || error}
              </p>
            )}
          </div>
          <div className="place-dialog__actions">
            <button type="button" className="place-dialog__cancel" onClick={onClose} disabled={pending}>Отмена</button>
            <button type="submit" className="place-dialog__submit" disabled={pending}>
              {pending ? "Сохраняем..." : "Сохранить место"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
