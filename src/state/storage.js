// Save slots and settings in browser storage. Every call is wrapped so the game
// still runs (without saving) when storage is blocked or full.
import { SAVE_VERSION, migrateClubState } from './club.js';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { managerEntry, makeCareerId } from './managers.js';

export const SLOT_COUNT = 3;
const slotKey = (n) => `football-cards-v${SAVE_VERSION}-slot-${n}`;
const META_KEY = `football-cards-v${SAVE_VERSION}-slots`;
const LEGACY_KEY = 'football-cards-save-v3';
const SETTINGS_KEY = 'football-cards-settings';
// Every career ever played, separate from the slots (survives deletes and overwrites).
const MANAGERS_KEY = 'football-cards-managers';

// Saves are compressed (a career's history book gets big); older plain-JSON saves still load.
const PACKED = 'lz1:';
const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    if (raw.startsWith(PACKED)) return JSON.parse(decompressFromUTF16(raw.slice(PACKED.length)));
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
const write = (key, value, pack = false) => {
  try {
    const json = JSON.stringify(value);
    localStorage.setItem(key, pack ? PACKED + compressToUTF16(json) : json);
    return true;
  } catch {
    return false;
  }
};
const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

function summary(state) {
  return {
    gmName: state.gmName || 'GM',
    club: state.club.name,
    clubId: state.club.id,
    short: state.club.short,
    colors: state.club.colors,
    division: state.club.division,
    season: state.season?.year ?? 1,
    reputation: state.gm?.reputation ?? 0,
    trophies: (state.trophies || []).filter((t) => t.position === 1).length,
    updated: Date.now(),
  };
}

// The one-save format from earlier versions becomes slot 1.
function migrate() {
  const meta = read(META_KEY);
  if (meta) return meta;
  const legacy = read(LEGACY_KEY);
  const next = {};
  if (legacy?.version === SAVE_VERSION && legacy.club) {
    write(slotKey(1), legacy);
    next[1] = summary(legacy);
  }
  write(META_KEY, next);
  return next;
}

export function listSlots() {
  const meta = migrate();
  return Array.from({ length: SLOT_COUNT }, (_, i) => ({ n: i + 1, ...(meta[i + 1] ? { summary: meta[i + 1] } : {}) }));
}

export function loadSlot(n) {
  const state = read(slotKey(n));
  return state?.version === SAVE_VERSION ? migrateClubState(state) : null;
}

export function saveSlot(n, state) {
  // Each career gets an id the first time it is saved, so the managers book can follow it.
  if (state && !state.careerId) {
    try { state.careerId = makeCareerId(n, state.gmName, Date.now()); } catch { /* frozen state: book uses a slot-based id */ }
  }
  const ok = write(slotKey(n), state, true);
  if (ok) {
    const meta = migrate();
    meta[n] = summary(state);
    write(META_KEY, meta);
  }
  recordManager(n, state);
  return ok;
}

export function deleteSlot(n) {
  // A save from before the managers book existed is recorded before it goes.
  if (!readBook().slots[n]) { const st = loadSlot(n); if (st) recordManager(n, st); }
  remove(slotKey(n));
  const meta = migrate();
  delete meta[n];
  write(META_KEY, meta);
  retireSlot(n);
}

// ---------------------------------------------------------------------------
// Managers book: { entries: { [careerId]: entry }, slots: { [n]: careerId } }

const readBook = () => {
  const book = read(MANAGERS_KEY);
  return book && typeof book === 'object' ? { entries: book.entries || {}, slots: book.slots || {} } : { entries: {}, slots: {} };
};

function retire(book, id, now) {
  const e = book.entries[id];
  if (e && e.status === 'active') { e.status = 'retired'; e.retiredAt = now; }
}

function recordManager(n, state) {
  try {
    if (!state?.club) return;
    const book = readBook();
    const now = Date.now();
    const id = state.careerId || book.slots[n] || makeCareerId(n, state.gmName, now);
    // A different career saved into this slot means the old one was overwritten.
    if (book.slots[n] && book.slots[n] !== id) retire(book, book.slots[n], now);
    // The same career restored into another slot moves with it.
    for (const [k, v] of Object.entries(book.slots)) if (v === id && Number(k) !== n) delete book.slots[k];
    book.entries[id] = managerEntry(state, { id, slot: n, prev: book.entries[id] || null, now });
    book.slots[n] = id;
    write(MANAGERS_KEY, book);
  } catch {
    // the book is a nice-to-have: never block a save
  }
}

function retireSlot(n) {
  const book = readBook();
  if (!book.slots[n]) return;
  retire(book, book.slots[n], Date.now());
  delete book.slots[n];
  write(MANAGERS_KEY, book);
}

// All careers, newest first. Saves made before the book existed are added the first time it's opened.
export function listManagers() {
  const meta = migrate();
  let book = readBook();
  for (let n = 1; n <= SLOT_COUNT; n += 1) {
    if (!meta[n] || book.slots[n]) continue;
    const state = loadSlot(n);
    if (state) { saveSlot(n, state); book = readBook(); }
  }
  return Object.values(book.entries).sort((a, b) => b.updated - a.updated);
}

// Export as text the player can copy or save as a file; import checks it's a valid save.
export function exportSlot(n) {
  const state = read(slotKey(n));
  return state ? JSON.stringify(state) : null;
}

export function importSave(text) {
  try {
    const state = JSON.parse(text);
    if (state?.version !== SAVE_VERSION || !state.club || !state.world || !state.season) {
      return { ok: false, error: 'This doesn\'t look like a save from this version of the game.' };
    }
    return { ok: true, state: migrateClubState(state) };
  } catch {
    return { ok: false, error: 'That text isn\'t a valid save.' };
  }
}

export const DEFAULT_SETTINGS = { speed: 'normal', autoplay: false, reduceMotion: false, tips: true, realBadges: true };

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...(read(SETTINGS_KEY) || {}) };
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
}
