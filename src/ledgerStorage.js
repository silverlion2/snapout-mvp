export const LEDGER_STORAGE_KEY = 'snapout.phantom-ledger.v1';
export const LEDGER_VERSION = 1;
export const MAX_PERSISTED_ENTRIES = 40;

const VALID_RESULTS = new Set(['saved', 'lost', 'froze']);

export function createEmptyPersistentLedger() {
  return {
    version: LEDGER_VERSION,
    entries: [],
  };
}

function isSafeIntegerBetween(value, min, max) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

export function sanitizePersistentEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return null;
  }

  const id = sanitizeText(entry.id, 160);
  const ticker = sanitizeText(entry.ticker, 32);
  const label = sanitizeText(entry.label, 120);
  const createdAt = sanitizeText(entry.createdAt, 40);
  const timestamp = createdAt ? Date.parse(createdAt) : Number.NaN;

  if (
    !id ||
    !ticker ||
    !label ||
    !createdAt ||
    !Number.isFinite(timestamp) ||
    !VALID_RESULTS.has(entry.result) ||
    !isSafeIntegerBetween(entry.round, 1, 100) ||
    !isSafeIntegerBetween(entry.amount, 0, 1_000_000)
  ) {
    return null;
  }

  return {
    id,
    createdAt: new Date(timestamp).toISOString(),
    round: entry.round,
    ticker,
    result: entry.result,
    amount: entry.amount,
    label,
  };
}

export function parsePersistentLedger(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return {
      ledger: createEmptyPersistentLedger(),
      status: 'empty',
      droppedCount: 0,
    };
  }

  let parsed;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return {
      ledger: createEmptyPersistentLedger(),
      status: 'partial',
      droppedCount: 1,
    };
  }

  if (parsed?.version !== LEDGER_VERSION || !Array.isArray(parsed.entries)) {
    return {
      ledger: createEmptyPersistentLedger(),
      status: 'partial',
      droppedCount: 1,
    };
  }

  const entries = [];
  let droppedCount = 0;

  for (const candidate of parsed.entries) {
    const entry = sanitizePersistentEntry(candidate);

    if (entry) {
      entries.push(entry);
    } else {
      droppedCount += 1;
    }
  }

  const boundedEntries = entries.slice(0, MAX_PERSISTED_ENTRIES);
  droppedCount += Math.max(0, entries.length - boundedEntries.length);

  return {
    ledger: {
      version: LEDGER_VERSION,
      entries: boundedEntries,
    },
    status: droppedCount > 0 ? 'partial' : boundedEntries.length > 0 ? 'ready' : 'empty',
    droppedCount,
  };
}

export function loadPersistentLedger(storage) {
  try {
    if (!storage || typeof storage.getItem !== 'function') {
      throw new TypeError('Browser storage is unavailable');
    }

    return parsePersistentLedger(storage.getItem(LEDGER_STORAGE_KEY));
  } catch {
    return {
      ledger: createEmptyPersistentLedger(),
      status: 'unavailable',
      droppedCount: 0,
    };
  }
}

export function savePersistentLedger(storage, ledger) {
  try {
    if (!storage || typeof storage.setItem !== 'function') {
      throw new TypeError('Browser storage is unavailable');
    }

    storage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function clearPersistentLedger(storage) {
  try {
    if (!storage || typeof storage.removeItem !== 'function') {
      throw new TypeError('Browser storage is unavailable');
    }

    storage.removeItem(LEDGER_STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function appendPersistentEntry(ledger, runEntry, createdAt = new Date().toISOString()) {
  const sourceId = sanitizeText(runEntry?.id, 120) ?? 'decision';
  const candidate = sanitizePersistentEntry({
    ...runEntry,
    id: `${createdAt}:${sourceId}`,
    createdAt,
  });

  if (!candidate) {
    return ledger;
  }

  return {
    version: LEDGER_VERSION,
    entries: [candidate, ...ledger.entries].slice(0, MAX_PERSISTED_ENTRIES),
  };
}

export function mergePersistentLedgers(baseLedger, incomingLedger) {
  const seen = new Set();
  const entries = [];

  for (const entry of [...incomingLedger.entries, ...baseLedger.entries]) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      entries.push(entry);
    }
  }

  entries.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  return {
    version: LEDGER_VERSION,
    entries: entries.slice(0, MAX_PERSISTED_ENTRIES),
  };
}

export function summarizePersistentLedger(ledger) {
  return ledger.entries.reduce(
    (summary, entry) => ({
      decisions: summary.decisions + 1,
      savedDecisions: summary.savedDecisions + (entry.result === 'saved' ? 1 : 0),
      savedAmount: summary.savedAmount + (entry.result === 'saved' ? entry.amount : 0),
    }),
    { decisions: 0, savedDecisions: 0, savedAmount: 0 },
  );
}
