export const initialSchema = `
  CREATE TABLE places (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 200),
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    CHECK (
      (latitude IS NULL AND longitude IS NULL)
      OR (latitude IS NOT NULL AND longitude IS NOT NULL
          AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
  );

  CREATE TABLE checks (
    id TEXT PRIMARY KEY NOT NULL,
    place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    visited_at TEXT NOT NULL,
    comment TEXT NOT NULL
  );
  CREATE INDEX checks_by_place ON checks(place_id, visited_at DESC);

  CREATE TABLE check_items (
    id TEXT PRIMARY KEY NOT NULL,
    check_id TEXT NOT NULL REFERENCES checks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 200),
    price_kopecks INTEGER NOT NULL
      CHECK (typeof(price_kopecks) = 'integer' AND price_kopecks BETWEEN 0 AND 9999999999),
    rating INTEGER CHECK (rating IS NULL OR (typeof(rating) = 'integer' AND rating BETWEEN 1 AND 5))
  );
  CREATE INDEX check_items_by_check ON check_items(check_id, position);
`;
