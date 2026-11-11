// The fans (v2.3): how many the club has locally (they buy the tickets) and around the world
// (TV, shirts abroad), and how happy they are.
//
// state.fans = { clubId, local, global, start: { local, global, year }, games: [...], history: [...],
//   soldOutRun, best: { soldOutRun }, milestones: { ... } }
//
// Happiness is NOT stored here: it is the fans' confidence meter, state.gm.confidence.fans
// (0–100), the same number that already counts 35% of job security. One meter, so results,
// ticket prices, derbies, trophies and fan cards move it once and nothing is counted twice.
//
// fansOf(state) → { local, global, happiness, trend: { local, global } (% this season), ... }
// is the read API for the rest of the game (gate demand, TV and shirt deals).

import { clubSize } from '../engine/career.js';
import { pushInbox } from './chronicle.js';

// Starting fan bases by league level, smallest → biggest club of the level (geometric);
// global fans are a multiple of the local ones. The giants: 2 million locally, 100+ million worldwide.
const LOCAL_RANGE = { 3: [8000, 30000], 2: [50000, 200000], 1: [250000, 900000] };
const GLOBAL_RATIO = { 3: 2.5, 2: 5, 1: 15 };
const GIANT = { local: 2000000, ratio: 60 };
const round = (v) => (v >= 100000 ? Math.round(v / 1000) * 1000 : Math.round(v / 100) * 100);

export function initialFans(world, clubId, year = 1) {
  const z = clubSize(world, clubId);
  let local; let global;
  if (z.giant) {
    const k = Math.max(1, Math.min(1.4, 1 + ((z.strength || 85) - 85) / 30));
    local = GIANT.local * k;
    global = local * GIANT.ratio;
  } else {
    const [lo, hi] = LOCAL_RANGE[z.level] || LOCAL_RANGE[3];
    local = lo * (hi / lo) ** z.share;
    global = local * (GLOBAL_RATIO[z.level] || 2.5);
  }
  local = round(local); global = round(global);
  return { clubId, local, global, start: { local, global, year }, games: [], history: [], soldOutRun: 0, best: { soldOutRun: 0 }, milestones: {} };
}

// The club's fans (a fresh base when the state has none or they belong to another club).
function rawFans(state) {
  if (state.fans && state.fans.clubId === state.club?.id) return state.fans;
  return initialFans(state.world, state.club?.id, state.season?.year ?? 1);
}
export function ensureFansInto(next) {
  if (!next.fans || next.fans.clubId !== next.club?.id) next.fans = rawFans(next);
  return next.fans;
}

const pct = (now, was) => (was > 0 ? Math.round(((now - was) / was) * 1000) / 10 : 0);
export function fansOf(state) {
  const f = rawFans(state);
  return {
    local: f.local,
    global: f.global,
    happiness: Math.round((state.gm?.confidence?.fans ?? 55) * 10) / 10,
    trend: { local: pct(f.local, f.start?.local), global: pct(f.global, f.start?.global) },
    games: f.games || [],
    history: f.history || [],
    soldOutRun: f.soldOutRun || 0,
  };
}

// Happiness lives in gm.confidence.fans: moves it by v (mutates), clamped 0–100.
export function addHappinessInto(next, v) {
  if (!next.gm || !v) return;
  const c = next.gm.confidence || { board: 60, fans: 55 };
  next.gm.confidence = { ...c, fans: Math.round(Math.max(0, Math.min(100, (c.fans ?? 55) + v)) * 100) / 100 };
}

// ---------------------------------------------------------------------------
// Growth. Rates are fractions of the base.

export const FAN_GROWTH = {
  win: { local: 0.003, global: 0.002 }, // a league win
  loss: { local: -0.0015, global: -0.001 },
  bigWin: { local: 0.003, global: 0.006 }, // continental / Club World Cup win
  derbyWin: { local: 0.01, global: 0.003 },
  derbyLoss: { local: -0.004, global: 0 },
  trophy: {
    cup: { local: 0.04, global: 0.05 }, continental: { local: 0.06, global: 0.12 }, cwc: { local: 0.06, global: 0.2 },
    supercup: { local: 0.015, global: 0.015 }, continental2: { local: 0.04, global: 0.07 }, contsuper: { local: 0.02, global: 0.04 },
  },
  promotion: { local: 0.06, global: 0.1 },
  title: { local: 0.04, global: 0.06 },
  relegation: { local: -0.06, global: -0.08 },
  missed: { local: -0.02, global: -0.01 },
  popularity: 1 / 1000, // global × (1 + popularity / 1000) each season: stars on the pitch sell the club abroad
};

const MILESTONES = [
  { key: 'g1m', test: (f) => f.global >= 1e6, title: '🌍 One million fans worldwide', body: 'The club passes a million followers around the world. TV channels are starting to notice.' },
  { key: 'g10m', test: (f) => f.global >= 1e7, title: '🌍 Ten million fans worldwide', body: 'A global name now: the club has 10 million fans around the world.' },
  { key: 'g100m', test: (f) => f.global >= 1e8, title: '🌍 100 million fans worldwide', body: 'One of the most followed clubs on the planet.' },
  { key: 'l100k', test: (f) => f.local >= 1e5, title: '🏙 100,000 local fans', body: 'The city is painted in the club colours: 100,000 local fans.' },
  { key: 'l1m', test: (f) => f.local >= 1e6, title: '🏙 A million local fans', body: 'A million fans at home. Every seat could be sold ten times over.' },
];
function milestonesInto(next, f) {
  f.milestones = f.milestones || {};
  for (const m of MILESTONES) {
    if (!f.milestones[m.key] && m.test(f)) {
      f.milestones[m.key] = next.season?.year ?? 1;
      // Clubs that start above a milestone don't get the message.
      if (!m.test(f.start || {})) pushInbox(next, 'fans', m.title, m.body);
    }
  }
}

function grow(f, g, k = 1) {
  f.local = Math.max(500, Math.round(f.local * (1 + g.local * k)));
  f.global = Math.max(f.local, Math.round(f.global * (1 + g.global * k)));
}

// After a match (mutates): outcome 'W' | 'D' | 'L'; competition; derby; trophy (the trophy's competition, or null).
export function fanMatchInto(next, { outcome, competition = 'league', derby = false, trophy = null }) {
  const f = ensureFansInto(next);
  const big = ['continental', 'continental2', 'contsuper', 'cwc'].includes(competition);
  if (outcome === 'W') grow(f, big ? FAN_GROWTH.bigWin : FAN_GROWTH.win);
  if (outcome === 'L') grow(f, FAN_GROWTH.loss);
  if (derby && outcome === 'W') grow(f, FAN_GROWTH.derbyWin);
  if (derby && outcome === 'L') grow(f, FAN_GROWTH.derbyLoss);
  if (trophy) grow(f, FAN_GROWTH.trophy[competition] || FAN_GROWTH.trophy.cup);
  milestonesInto(next, f);
}

// A home game's crowd (mutates): the attendance log and the sell-out streak.
const GAMES_MAX = 30;
export function recordCrowdInto(next, { opponent, attendance, capacity, soldOut, gate, competition, md }) {
  const f = ensureFansInto(next);
  f.games = [{ year: next.season?.year ?? 1, md, opponent, attendance, capacity, soldOut, gate, competition }, ...(f.games || [])].slice(0, GAMES_MAX);
  f.soldOutRun = soldOut ? (f.soldOutRun || 0) + 1 : 0;
  f.best = f.best || { soldOutRun: 0 };
  if (f.soldOutRun > (f.best.soldOutRun || 0)) {
    f.best.soldOutRun = f.soldOutRun;
    if ([5, 10, 20].includes(f.soldOutRun)) pushInbox(next, 'fans', `🎟 ${f.soldOutRun} sell-outs in a row`, `Every seat sold for ${f.soldOutRun} home games running (${capacity.toLocaleString('en')} seats). Demand is above capacity: more seats would sell, or prices could go up while the team keeps winning.`);
  }
}

// Season end (mutates): promotion, title, relegation, a missed objective and the squad's
// popularity move the base; the season goes into the fans' history and a new one starts.
export function fanSeasonInto(next, { year, promoted = false, relegated = false, title = false, verdict = null, popularity = 0 }) {
  const f = ensureFansInto(next);
  if (promoted) grow(f, FAN_GROWTH.promotion);
  if (title) grow(f, FAN_GROWTH.title);
  if (relegated) grow(f, FAN_GROWTH.relegation);
  if (verdict === 'missed') grow(f, FAN_GROWTH.missed);
  f.global = Math.round(f.global * (1 + Math.min(0.15, popularity * FAN_GROWTH.popularity)));
  milestonesInto(next, f);
  const games = (f.games || []).filter((g) => g.year === year);
  const avg = games.length ? Math.round(games.reduce((a, g) => a + g.attendance, 0) / games.length) : 0;
  const entry = {
    year, local: f.local, global: f.global, avgAttendance: avg, capacity: games[0]?.capacity || 0,
    soldOut: games.filter((g) => g.soldOut).length, homeGames: games.length,
    localChange: pct(f.local, f.start?.local), globalChange: pct(f.global, f.start?.global),
  };
  f.history = [...(f.history || []).filter((e) => e.year !== year), entry].slice(-40);
  f.start = { local: f.local, global: f.global, year: year + 1 };
}

// Fan cards (mutates): +share of local / global fans now.
export function boostFansInto(next, { local = 0, global = 0 }) {
  const f = ensureFansInto(next);
  grow(f, { local, global });
  milestonesInto(next, f);
}

// A sentence for the happiness meter.
const HAPPY = [
  [85, 'Ecstatic: they would follow this team anywhere'], [70, 'Very happy: singing from the first minute'], [55, 'Happy enough: behind the team'],
  [40, 'Restless: they want more for their money'], [25, 'Unhappy: the stands are emptying early'], [0, 'Furious: protests outside the ground'],
];
export const happinessLine = (h) => HAPPY.find(([min]) => h >= min)[1];
export const formatFans = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e4 ? `${Math.round(n / 1000)}k` : n.toLocaleString('en'));
