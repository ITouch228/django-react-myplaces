import { randomUUID } from 'expo-crypto';
import type { Check, CheckInput, PlaceInput, PlaceSummary } from '../domain/places';
import { withDatabase } from './database';

export function listPlaces(): Promise<PlaceSummary[]> {
  return withDatabase((database) => database.getAllAsync<PlaceSummary>(`
    SELECT p.id, p.name, p.address, p.latitude, p.longitude,
           COUNT(DISTINCT c.id) AS checkCount, AVG(i.rating) AS averageRating
    FROM places p
    LEFT JOIN checks c ON c.place_id = p.id
    LEFT JOIN check_items i ON i.check_id = c.id
    GROUP BY p.id
    ORDER BY p.rowid DESC
  `));
}

export function savePlace(place: PlaceInput, id?: string): Promise<string> {
  const values = [place.name, place.address, place.latitude, place.longitude];
  return withDatabase(async (database) => {
    if (id !== undefined) {
      const result = await database.runAsync(
        'UPDATE places SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?',
        [...values, id],
      );
      if (result.changes !== 1) throw new Error('Место не найдено.');
      return id;
    }

    const newId = randomUUID();
    await database.runAsync(
      'INSERT INTO places (name, address, latitude, longitude, id) VALUES (?, ?, ?, ?, ?)',
      [...values, newId],
    );
    return newId;
  });
}

export function deletePlace(id: string): Promise<void> {
  return withDatabase(async (database) => {
    await database.runAsync('DELETE FROM places WHERE id = ?', id);
  });
}

type CheckRow = {
  checkId: string;
  visitedAt: string;
  comment: string;
  itemId: string | null;
  itemName: string | null;
  priceKopecks: number | null;
  rating: number | null;
};

export async function listChecks(placeId: string): Promise<Check[]> {
  const rows = await withDatabase((database) => database.getAllAsync<CheckRow>(`
    SELECT c.id AS checkId, c.visited_at AS visitedAt, c.comment,
           i.id AS itemId, i.name AS itemName, i.price_kopecks AS priceKopecks, i.rating
    FROM checks c LEFT JOIN check_items i ON i.check_id = c.id
    WHERE c.place_id = ?
    ORDER BY c.visited_at DESC, c.rowid DESC, i.position
  `, placeId));
  const checks = new Map<string, Check>();
  for (const row of rows) {
    let check = checks.get(row.checkId);
    if (!check) {
      check = { id: row.checkId, visitedAt: row.visitedAt, comment: row.comment, items: [] };
      checks.set(row.checkId, check);
    }

    if (row.itemId !== null && row.itemName !== null && row.priceKopecks !== null) {
      check.items.push({
        id: row.itemId, name: row.itemName, priceKopecks: row.priceKopecks, rating: row.rating,
      });
    }
  }
  return Array.from(checks.values());
}

export function saveCheck(placeId: string, check: CheckInput, id?: string): Promise<void> {
  const checkId = id ?? randomUUID();
  return withDatabase((database) => database.withTransactionAsync(async () => {
    if (id !== undefined) {
      const result = await database.runAsync(
        'UPDATE checks SET visited_at = ?, comment = ? WHERE id = ? AND place_id = ?',
        check.visitedAt, check.comment, id, placeId,
      );
      if (result.changes !== 1) throw new Error('Чек не найден.');
      await database.runAsync('DELETE FROM check_items WHERE check_id = ?', id);
    } else {
      await database.runAsync(
        'INSERT INTO checks (id, place_id, visited_at, comment) VALUES (?, ?, ?, ?)',
        checkId, placeId, check.visitedAt, check.comment,
      );
    }

    for (const [position, item] of check.items.entries()) {
      await database.runAsync(
        'INSERT INTO check_items (id, check_id, position, name, price_kopecks, rating) VALUES (?, ?, ?, ?, ?, ?)',
        item.id, checkId, position, item.name, item.priceKopecks, item.rating,
      );
    }
  }));
}

export function deleteCheck(placeId: string, id: string): Promise<void> {
  return withDatabase(async (database) => {
    await database.runAsync('DELETE FROM checks WHERE id = ? AND place_id = ?', id, placeId);
  });
}
