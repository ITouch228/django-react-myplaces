export type PlaceInput = {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export type PlaceSummary = PlaceInput & {
  id: string;
  checkCount: number;
  averageRating: number | null;
};

export type CheckItem = {
  id: string;
  name: string;
  priceKopecks: number;
  rating: number | null;
};

export type CheckInput = {
  visitedAt: string;
  comment: string;
  items: CheckItem[];
};

export type Check = CheckInput & { id: string };

export function parseCoordinates(latitudeText: string, longitudeText: string) {
  const latitudeValue = latitudeText.trim();
  const longitudeValue = longitudeText.trim();
  if (!latitudeValue && !longitudeValue) {
    return { latitude: null, longitude: null };
  }

  const decimal = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
  const latitude = Number(latitudeValue.replace(',', '.'));
  const longitude = Number(longitudeValue.replace(',', '.'));
  if (!decimal.test(latitudeValue) || !decimal.test(longitudeValue) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('Укажи широту от −90 до 90 и долготу от −180 до 180.');
  }

  return { latitude, longitude };
}

export function parsePrice(value: string): number {
  const match = /^(\d{1,8})(?:[.,](\d{1,2}))?$/.exec(value.trim());
  if (!match) {
    throw new Error('Укажи цену от 0 до 99 999 999,99 ₽, до двух знаков после запятой.');
  }
  const [, rubles, kopecks = ''] = match;
  return Number(rubles) * 100 + Number(kopecks.padEnd(2, '0'));
}

export function priceInput(kopecks: number): string {
  return `${Math.trunc(kopecks / 100)},${String(kopecks % 100).padStart(2, '0')}`;
}

const rubleFormatter = new Intl.NumberFormat('ru-RU');

export function formatPrice(kopecks: number): string {
  const [rubles, cents] = priceInput(kopecks).split(',');
  return `${rubleFormatter.format(Number(rubles))},${cents} ₽`;
}

export function today(): string {
  const date = new Date();
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0')).join('-');
}

export function isVisitDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
