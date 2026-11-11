// Real-life history: every competition's winners by year, up to the 2025–26 season (2026).
// The game's first season is 2027 (see engine/years.js), so in-game winners continue these lists.
//
// Files hold { key: { name, from, w, note? } } (format in europe-leagues.js). Winners are club ids
// of our world or plain names; a name that matches a world club's name (e.g. a club added later)
// is resolved to that club here, so only clubs of our world count for titles.
import { CLUBS_BY_DIVISION } from '../world/index.js';
import * as europeLeagues from './europe-leagues.js';
import * as europeCups from './europe-cups.js';
import * as europeOther from './europe-other.js';
import * as americas from './americas.js';
import * as asiaAfrica from './asia-africa.js';
import * as continental from './continental.js';
import * as oceania from './oceania.js';

export const HISTORY_FILES = { europeLeagues, europeCups, europeOther, americas, asiaAfrica, continental, oceania };
export const LAST_REAL_YEAR = 2026;

const RAW = Object.assign({}, ...Object.values(HISTORY_FILES).map((f) => f.HISTORY));

export const WORLD_CLUBS = Object.fromEntries(Object.values(CLUBS_BY_DIVISION).flat().map((c) => [c.id, c]));
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\b(fc|cf|ac|sc|club|cd)\b/g, '').replace(/[^a-z0-9]/g, '');
const BY_NAME = {};
for (const c of Object.values(WORLD_CLUBS)) BY_NAME[norm(c.name)] = c.id;

export const isClubId = (s) => typeof s === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
// One winner as { id, name }: id is a world club (or null), name is always set.
export function resolveWinner(w) {
  if (isClubId(w)) return { id: WORLD_CLUBS[w] ? w : null, name: WORLD_CLUBS[w]?.name || w };
  const id = BY_NAME[norm(w)] || null;
  return { id, name: id ? WORLD_CLUBS[id].name : w };
}

// key → { name, from, note, years: [{ year, winners: [{ id, name }] }] } (years not held are left out).
export const REAL_HISTORY = {};
for (const [key, h] of Object.entries(RAW)) {
  const years = [];
  h.w.forEach((w, i) => {
    if (w == null) return;
    years.push({ year: h.from + i, winners: (Array.isArray(w) ? w : [w]).map(resolveWinner) });
  });
  REAL_HISTORY[key] = { name: h.name, from: h.from, note: h.note || null, years };
}

// For every world club: key → years won (a year twice for two titles that year).
export const REAL_TITLES = {};
for (const [key, h] of Object.entries(REAL_HISTORY)) {
  for (const { year, winners } of h.years) {
    for (const { id } of winners) {
      if (!id) continue;
      const t = (REAL_TITLES[id] = REAL_TITLES[id] || {});
      (t[key] = t[key] || []).push(year);
    }
  }
}

export const RAW_HISTORY = RAW;
