import type { UpdatePlaceData } from "../../types";

export interface PlaceEditValues {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
}

export type PlaceEditField = keyof PlaceEditValues;
export type PlaceEditErrors = Partial<Record<PlaceEditField, string>>;

function parseCoordinate(value: string, limit: number, label: string): number | string {
  const trimmed = value.trim();
  if (!trimmed) return `Укажите ${label.toLowerCase()}.`;
  // Reject Number("") = 0 and numeric formats not supported by the form.
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) {
    return `Введите ${label.toLowerCase()} числом через точку.`;
  }
  const number = Number(trimmed);
  if (!Number.isFinite(number) || Math.abs(number) > limit) {
    return `${label} должна находиться в диапазоне от -${limit} до ${limit}.`;
  }
  return number;
}

export function validatePlaceEdit(values: PlaceEditValues): { data?: UpdatePlaceData; errors: PlaceEditErrors } {
  const errors: PlaceEditErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Введите название места.";
  else if (name.length > 200) errors.name = "Название не может быть длиннее 200 символов.";

  const latitude = parseCoordinate(values.latitude, 90, "Широта");
  const longitude = parseCoordinate(values.longitude, 180, "Долгота");
  if (typeof latitude === "string") errors.latitude = latitude;
  if (typeof longitude === "string") errors.longitude = longitude;
  if (Object.keys(errors).length || typeof latitude === "string" || typeof longitude === "string") {
    return { errors };
  }
  return {
    errors,
    data: { name, address: values.address.trim(), latitude, longitude },
  };
}

export function getPlaceEditApiErrors(error: unknown): { fields: PlaceEditErrors; general: string | null } {
  const fallback = "Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз.";
  if (!error || typeof error !== "object" || !("response" in error)) {
    return { fields: {}, general: fallback };
  }
  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return { fields: {}, general: fallback };
  }
  const data = response.data;
  if (!data || typeof data !== "object") return { fields: {}, general: fallback };
  const fields: PlaceEditErrors = {};
  let general: string | null = null;
  for (const [key, value] of Object.entries(data)) {
    const message = Array.isArray(value) ? value.map(String).join(" ") : typeof value === "string" ? value : "";
    if (!message) continue;
    if (key === "name" || key === "address" || key === "latitude" || key === "longitude") fields[key] = message;
    else if (key === "detail" || key === "non_field_errors") general = message;
  }
  return { fields, general: general ?? (Object.keys(fields).length ? null : fallback) };
}
