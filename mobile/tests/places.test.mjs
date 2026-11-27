import assert from 'node:assert/strict';
import test from 'node:test';
import { isVisitDate, parseCoordinates, parsePrice, priceInput } from '../src/domain/places.ts';

test('stores prices as exact integer kopecks and supports both decimal separators', () => {
  assert.equal(parsePrice('0,10') + parsePrice('0.20'), 30);
  assert.equal(parsePrice('5,2'), 520);
  assert.equal(parsePrice('99999999,99'), 9999999999);
  assert.equal(priceInput(520), '5,20');
  for (const value of ['', '-1', '1,234', '1e3', '100000000']) {
    assert.throws(() => parsePrice(value));
  }
});

test('accepts real calendar dates, including leap day', () => {
  assert.equal(isVisitDate('2024-02-29'), true);
  for (const date of ['2026-02-29', '2026-11-31', '2026-2-13', '0000-01-01']) {
    assert.equal(isVisitDate(date), false);
  }
});

test('coordinates may be omitted or supplied as a pair within bounds', () => {
  assert.deepEqual(parseCoordinates('', ''), { latitude: null, longitude: null });
  assert.deepEqual(parseCoordinates('-90', '180'), { latitude: -90, longitude: 180 });
  assert.deepEqual(parseCoordinates('55,9', '37.2'), { latitude: 55.9, longitude: 37.2 });
  for (const pair of [['', '0'], ['90.01', '0'], ['0', '-180.01'], ['0', '0x12']]) {
    assert.throws(() => parseCoordinates(...pair));
  }
});
