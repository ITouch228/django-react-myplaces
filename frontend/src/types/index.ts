export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface CheckItem {
  id: number;
  item_name: string;
  price: number;
  rating: number | null;
}

export interface Check {
  id: number;
  place: number;
  user: number;
  visited_at: string;
  created_at: string;
  comment: string;
  total: number;
  avg_rating: number | null;
  items: CheckItem[];
}

export type PlaceCategory = "cafe" | "restaurant" | "bar" | "bakery" | "other";
export type PlaceVisitStatus = "want" | "visited";

export interface Place {
  id: number;
  name: string;
  address?: string;
  category: PlaceCategory;
  visit_status: PlaceVisitStatus;
  is_favorite: boolean;
  latitude: number;
  longitude: number;
  avg_rating: number | null;
  avg_price: number | null;
  total_checks: number;
  checks: Check[];
  user: number;
  created_at: string;
}

export type CreateCheckItemData = Omit<CheckItem, "id">;
export type CreateCheckData = Omit<
  Check,
  "id" | "created_at" | "user" | "total" | "avg_rating" | "items"
> & {
  items: Omit<CheckItem, "id">[];
};
export type CreatePlaceData = Pick<Place, "name" | "latitude" | "longitude"> & { address?: string; category?: PlaceCategory; visit_status?: PlaceVisitStatus; is_favorite?: boolean };
export type UpdatePlaceData = Partial<CreatePlaceData>;

export type QueueItem = {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
};
