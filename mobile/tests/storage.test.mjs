import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { initialSchema } from '../src/storage/schema.ts';

test('SQLite persists places and their check items across database reopen and cascades deletion', () => {
  const directory = mkdtempSync(join(tmpdir(), 'myplaces-'));
  const path = join(directory, 'myplaces.db');
  let database = new DatabaseSync(path);

  try {
    database.exec(initialSchema);
    database.exec(`
      INSERT INTO places VALUES ('p1', 'Кафе', '', NULL, NULL);
      INSERT INTO checks VALUES ('c1', 'p1', '2026-11-27', '');
      INSERT INTO check_items VALUES ('i1', 'c1', 0, 'Чай', 19001, NULL);
      INSERT INTO check_items VALUES ('i2', 'c1', 1, 'Торт', 21008, 5);
    `);
    database.close();
    database = new DatabaseSync(path);

    const summary = database.prepare('SELECT SUM(price_kopecks) AS total, AVG(rating) AS rating FROM check_items').get();
    assert.equal(summary.total, 40009);
    assert.equal(summary.rating, 5);

    database.exec("DELETE FROM places WHERE id = 'p1'");
    for (const table of ['places', 'checks', 'check_items']) {
      assert.equal(database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count, 0);
    }
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('SQLite rejects orphaned records, partial coordinates, and fractional kopecks', () => {
  const database = new DatabaseSync(':memory:');
  try {
    database.exec(initialSchema);
    assert.throws(() => database.exec("INSERT INTO checks VALUES ('c1', 'missing', '2026-11-27', '')"));
    assert.throws(() => database.exec("INSERT INTO places VALUES ('p1', 'Кафе', '', 55, NULL)"));
    database.exec(`
      INSERT INTO places VALUES ('p1', 'Кафе', '', NULL, NULL);
      INSERT INTO checks VALUES ('c1', 'p1', '2026-11-27', '');
    `);
    assert.throws(() => database.exec("INSERT INTO check_items VALUES ('i1', 'c1', 0, 'Чай', 0.5, 5)"));
    assert.throws(() => database.exec("INSERT INTO check_items VALUES ('i1', 'c1', 0, 'Чай', 1, 6)"));
  } finally {
    database.close();
  }
});
