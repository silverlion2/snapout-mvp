import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEDGER_STORAGE_KEY,
  MAX_PERSISTED_ENTRIES,
  appendPersistentEntry,
  clearPersistentLedger,
  createEmptyPersistentLedger,
  loadPersistentLedger,
  mergePersistentLedgers,
  parsePersistentLedger,
  savePersistentLedger,
  summarizePersistentLedger,
} from './ledgerStorage.js';

function makeRunEntry(overrides = {}) {
  return {
    id: '1-DOGE-saved',
    round: 1,
    ticker: 'DOGE',
    result: 'saved',
    amount: 400,
    label: '避开：暴拉阳线',
    ...overrides,
  };
}

function makeStorage(initialValue = null) {
  const values = new Map();

  if (initialValue !== null) {
    values.set(LEDGER_STORAGE_KEY, initialValue);
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}

test('missing storage value loads a valid empty ledger', () => {
  const result = loadPersistentLedger(makeStorage());

  assert.equal(result.status, 'empty');
  assert.deepEqual(result.ledger, createEmptyPersistentLedger());
});

test('append persists a normalized entry and summary', () => {
  const ledger = appendPersistentEntry(
    createEmptyPersistentLedger(),
    makeRunEntry(),
    '2026-09-08T01:02:03.000Z',
  );
  const summary = summarizePersistentLedger(ledger);

  assert.equal(ledger.entries[0].createdAt, '2026-09-08T01:02:03.000Z');
  assert.deepEqual(summary, { decisions: 1, savedDecisions: 1, savedAmount: 400 });
});

test('history keeps only the newest bounded entries', () => {
  let ledger = createEmptyPersistentLedger();

  for (let index = 0; index < MAX_PERSISTED_ENTRIES + 5; index += 1) {
    ledger = appendPersistentEntry(
      ledger,
      makeRunEntry({ id: String(index), round: (index % 8) + 1 }),
      new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
    );
  }

  assert.equal(ledger.entries.length, MAX_PERSISTED_ENTRIES);
  assert.match(ledger.entries[0].id, /:44$/);
  assert.match(ledger.entries.at(-1).id, /:5$/);
});

test('malformed JSON and wrong versions recover as partial empty ledgers', () => {
  assert.equal(parsePersistentLedger('{broken').status, 'partial');
  assert.equal(parsePersistentLedger(JSON.stringify({ version: 99, entries: [] })).status, 'partial');
});

test('mixed records retain the valid subset and report dropped entries', () => {
  const validLedger = appendPersistentEntry(createEmptyPersistentLedger(), makeRunEntry(), '2026-09-08T01:02:03.000Z');
  const result = parsePersistentLedger(JSON.stringify({
    ...validLedger,
    entries: [...validLedger.entries, { result: 'unknown' }],
  }));

  assert.equal(result.status, 'partial');
  assert.equal(result.droppedCount, 1);
  assert.equal(result.ledger.entries.length, 1);
});

test('storage failures return unavailable results without throwing', () => {
  const brokenStorage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('blocked'); },
  };

  assert.equal(loadPersistentLedger(brokenStorage).status, 'unavailable');
  assert.deepEqual(savePersistentLedger(brokenStorage, createEmptyPersistentLedger()), { ok: false });
  assert.deepEqual(clearPersistentLedger(brokenStorage), { ok: false });
});

test('save and clear touch only the SnapOut storage key', () => {
  const storage = makeStorage();
  storage.values.set('other-app', 'keep');
  const ledger = appendPersistentEntry(createEmptyPersistentLedger(), makeRunEntry(), '2026-09-08T01:02:03.000Z');

  assert.deepEqual(savePersistentLedger(storage, ledger), { ok: true });
  assert.equal(loadPersistentLedger(storage).ledger.entries.length, 1);
  assert.deepEqual(clearPersistentLedger(storage), { ok: true });
  assert.equal(storage.values.get('other-app'), 'keep');
});

test('retry merge de-duplicates entries and prefers newest order', () => {
  const older = appendPersistentEntry(createEmptyPersistentLedger(), makeRunEntry({ id: 'older' }), '2026-09-08T01:00:00.000Z');
  const newer = appendPersistentEntry(older, makeRunEntry({ id: 'newer' }), '2026-09-08T02:00:00.000Z');
  const merged = mergePersistentLedgers(older, newer);

  assert.equal(merged.entries.length, 2);
  assert.match(merged.entries[0].id, /:newer$/);
});
