import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Place, UpdatePlaceData } from "../../types";
import {
  getPlaceEditApiErrors,
  validatePlaceEdit,
  type PlaceEditErrors,
  type PlaceEditField,
  type PlaceEditValues,
} from "./place-edit-validation";
import "./create-place-dialog.css";
import "./edit-place-dialog.css";

interface EditPlaceDialogProps {
  place: Place | null;
  pending: boolean;
  onClose: () => void;
  onSave: (data: UpdatePlaceData) => Promise<void>;
}

function valuesFromPlace(place: Place): PlaceEditValues {
  return {
    name: place.name,
    address: place.address ?? "",
    latitude: String(place.latitude),
    longitude: String(place.longitude),
  };
}

export function EditPlaceDialog({ place, pending, onClose, onSave }: EditPlaceDialogProps) {
  const [values, setValues] = useState<PlaceEditValues>(() =>
    place ? valuesFromPlace(place) : { name: "", address: "", latitude: "", longitude: "" },
  );
  const [errors, setErrors] = useState<PlaceEditErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!place) return;
    setValues(valuesFromPlace(place));
    setErrors({});
    setGeneralError(null);
    firstInputRef.current?.focus();
  }, [place]);

  useEffect(() => {
    if (!place) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [place, pending, onClose]);

  if (!place) return null;

  const update = (field: PlaceEditField, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setGeneralError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const result = validatePlaceEdit(values);
    setErrors(result.errors);
    if (!result.data) return;
    setGeneralError(null);
    try {
      await onSave(result.data);
    } catch (error: unknown) {
      const parsed = getPlaceEditApiErrors(error);
      setErrors(parsed.fields);
      setGeneralError(parsed.general);
    }
  };

  const field = (name: PlaceEditField, label: string, placeholder: string, inputMode?: "decimal") => (
    <div className="edit-place__field">
      <label htmlFor={`edit-place-${name}`}>{label}</label>
      <input
        id={`edit-place-${name}`}
        ref={name === "name" ? firstInputRef : undefined}
        value={values[name]}
        placeholder={placeholder}
        onChange={(event) => update(name, event.target.value)}
        inputMode={inputMode}
        disabled={pending}
        maxLength={name === "name" ? 201 : undefined}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `edit-place-error-${name}` : undefined}
      />
      {errors[name] && <p className="place-dialog__error" role="alert" id={`edit-place-error-${name}`}>{errors[name]}</p>}
    </div>
  );

  return (
    <div className="place-dialog__backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !pending) onClose();
    }}>
      <section className="place-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-place-title">
        <div className="place-dialog__header">
          <div>
            <span className="place-dialog__eyebrow">Карточка заведения</span>
            <h2 id="edit-place-title">Редактировать место</h2>
          </div>
          <button type="button" className="place-dialog__close" onClick={onClose} disabled={pending} aria-label="Закрыть форму">✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="place-dialog__body">
            {field("name", "Название *", "Название места")}
            {field("address", "Адрес (необязательно)", "Улица, дом или ориентир")}
            <p className="edit-place__coordinates-label">Координаты маркера</p>
            <div className="edit-place__coordinates">
              {field("latitude", "Широта", "55.7558", "decimal")}
              {field("longitude", "Долгота", "37.6173", "decimal")}
            </div>
            <p className="edit-place__hint">Изменение координат перенесёт маркер на карте. История чеков сохранится.</p>
            {generalError && <p role="alert" className="place-dialog__error">{generalError}</p>}
          </div>
          <div className="place-dialog__actions">
            <button type="button" className="place-dialog__cancel" onClick={onClose} disabled={pending}>Отмена</button>
            <button type="submit" className="place-dialog__submit" disabled={pending}>
              {pending ? "Сохраняем..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
