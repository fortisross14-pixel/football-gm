// The club's business side (v2.2): building works, ticket prices and the season-by-season
// finance history (the kit, sponsor and TV deals live in state/deals.js). Pure helpers on the save state,
// used by state/club.js (income, matches, season end) and the Club tab.
//
// Functions named start…/set…/sign… take a state and return a new one ({ state, message,
// success } for the ones the UI shows a toast for). Functions that end in "Into" or are
// marked "mutates" change a state that the caller has already cloned.

import {
  AREAS, MAX_LEVEL, fullFacilities, buildMatchdays, TICKET_PRICES,
} from '../data/facilities.js';
import { pushInbox } from './chronicle.js';

const lvl = (state, key) => Math.max(0, Math.min(MAX_LEVEL, state.facilities?.[key] || 0));

// ---------------------------------------------------------------------------
// Building works

// The project under way in an area, or null. A project: { id, area, from, to, total, left, summer }.
export const constructionOf = (state, area) => (state.construction || []).find((p) => p.area === area) || null;
export const constructionList = (state) => state.construction || [];

// Queues a project on an already-cloned state (mutates). Returns { message, success }.
export function queueConstruction(next, area, levels = 1) {
  if (!AREAS[area]) return { message: 'Unknown club area.', success: false };
  if (constructionOf(next, area)) return { message: `${AREAS[area].label}: building works are already under way.`, success: false };
  const from = lvl(next, area);
  if (from >= MAX_LEVEL) return { message: `${AREAS[area].label} is already at max level.`, success: false };
  const to = Math.min(MAX_LEVEL, from + Math.max(1, levels));
  const summer = next.phase !== 'season';
  const total = buildMatchdays(to);
  next.nextUid = (next.nextUid || 1) + 1;
  const project = { id: `b${next.nextUid}`, area, from, to, total, left: total, summer, year: next.season?.year ?? 1 };
  next.construction = [...(next.construction || []), project];
  const when = summer ? 'ready for the first matchday' : `ready in ${total} league matchdays`;
  return { message: `🏗 Building works started: ${AREAS[area].label} L${from} → L${to}, ${when}.`, success: true, project };
}

// Starts building works in an area: levels is 1 for most Club cards, 2 for a Legend.
// Returns { state, message, success }. One project per area at a time.
export function startConstruction(state, area, levels = 1) {
  const next = structuredClone(state);
  const r = queueConstruction(next, area, levels);
  return r.success ? { state: next, message: r.message, success: true, project: r.project } : { state, message: r.message, success: false };
}

function finishProject(next, p) {
  next.facilities = { ...fullFacilities(next.facilities) };
  next.facilities[p.area] = Math.max(next.facilities[p.area], p.to);
  pushInbox(next, 'club', `🏗 Construction finished: ${AREAS[p.area].label} L${p.to}`, `${AREAS[p.area].icon} ${AREAS[p.area].label} is now level ${p.to}. The new effect applies from the next match.`);
}

// One league matchday of work on every project (mutates). With { all: true } every project
// finishes: the builders work through the summer, so nothing is still open on matchday 1.
export function advanceConstructionInto(next, { all = false } = {}) {
  if (!next.construction?.length) return [];
  const done = [];
  const open = [];
  for (const p of next.construction) {
    const left = all ? 0 : p.left - 1;
    if (left <= 0) done.push(p);
    else open.push({ ...p, left });
  }
  next.construction = open;
  for (const p of done) finishProject(next, p);
  return done;
}

// Share of a project done, 0–1 (summer projects show as half way until the season starts).
export const constructionProgress = (p) => (p.summer ? 0.5 : Math.max(0, Math.min(1, (p.total - p.left) / p.total)));

// ---------------------------------------------------------------------------
// Ticket prices

export const ticketOf = (state) => TICKET_PRICES[state.ticketPrice] || TICKET_PRICES.normal;
export function setTicketPrice(state, id) {
  if (!TICKET_PRICES[id] || (state.ticketPrice || 'normal') === id) return state;
  return { ...state, ticketPrice: id };
}

// After a home match: the fans react to the prices (mutates).
export function ticketMoodInto(next, isHome) {
  const t = ticketOf(next);
  if (!isHome || !t.fans || !next.gm?.confidence) return;
  const fans = Math.max(0, Math.min(100, (next.gm.confidence.fans ?? 55) + t.fans));
  next.gm.confidence = { ...next.gm.confidence, fans: Math.round(fans * 100) / 100 };
}

// Kit, sponsor and TV deals: see state/deals.js.

// ---------------------------------------------------------------------------
// Finance history: one compact entry per season (written when the season closes and
// brought up to date with the summer's money when the next one starts).

const HISTORY_MAX = 40;
export function recordFinanceInto(next, year) {
  const fin = next.finance || { income: {}, spent: {} };
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const entry = {
    year, club: next.club?.short || next.club?.name, division: next.club?.division,
    income: { ...fin.income }, spent: { ...fin.spent }, in: sum(fin.income), out: sum(fin.spent), balance: next.coins,
  };
  const list = (next.financeHistory || []).filter((e) => e.year !== year);
  next.financeHistory = [...list, entry].sort((a, b) => a.year - b.year).slice(-HISTORY_MAX);
}

// ---------------------------------------------------------------------------
// Older saves (mutates a shallow copy): fills in the v2.2 fields.
export function migrateBusinessInto(next) {
  if (!Array.isArray(next.construction)) next.construction = [];
  if (!TICKET_PRICES[next.ticketPrice]) next.ticketPrice = 'normal';
  if (!Array.isArray(next.financeHistory)) next.financeHistory = [];
  if (!Array.isArray(next.clubEffects)) next.clubEffects = [];
  return next;
}
