import type { PlaceCategory, PlaceVisitStatus } from "../../types";

export const PLACE_CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "cafe", label: "Кафе" },
  { value: "restaurant", label: "Ресторан" },
  { value: "bar", label: "Бар" },
  { value: "bakery", label: "Пекарня" },
  { value: "other", label: "Другое" },
];

export const VISIT_STATUSES: { value: PlaceVisitStatus; label: string }[] = [
  { value: "want", label: "Хочу посетить" },
  { value: "visited", label: "Посещено" },
];

export const categoryLabel = (category: PlaceCategory | undefined) =>
  PLACE_CATEGORIES.find((option) => option.value === category)?.label ?? "Другое";
export const visitStatusLabel = (status: PlaceVisitStatus | undefined) =>
  VISIT_STATUSES.find((option) => option.value === status)?.label ?? "Посещено";
