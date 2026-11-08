// Save slots and settings in browser storage. Every call is wrapped so the game
// still runs (without saving) when storage is blocked or full.
import { SAVE_VERSION } from './club.js';

export const SLOT_COUNT = 3;
const slotKey = (n) => `football-cards-v${SAVE_VERSION}-slot-${n}`;
const META_KEY = `football-cards-v${SAVE_VERSION}-slots`;
const LEGACY_KEY = 'football-cards-save-v3';
const SETTINGS_KEY = 'football-cards-settings';

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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
  return state?.version === SAVE_VERSION ? state : null;
}

export function saveSlot(n, state) {
  const ok = write(slotKey(n), state);
  if (ok) {
    const meta = migrate();
    meta[n] = summary(state);
    write(META_KEY, meta);
  }
  return ok;
}

export function deleteSlot(n) {
  remove(slotKey(n));
  const meta = migrate();
  delete meta[n];
  write(META_KEY, meta);
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
    return { ok: true, state };
  } catch {
    return { ok: false, error: 'That text isn\'t a valid save.' };
  }
}

export const DEFAULT_SETTINGS = { speed: 'normal', autoplay: false, reduceMotion: false, tips: true };

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...(read(SETTINGS_KEY) || {}) };
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
}
