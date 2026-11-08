// The GM career: board objectives, reputation, job offers and sackings.
import { makeRng } from './rng.js';
import { DIVISIONS, DIVISION_BY_ID, TOP_CLUBS } from '../data/world/structure.js';
import { AI_SETTLED_BY_LEVEL, AI_FIT_BONUS } from './aiTeam.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const START_REPUTATION = 10;

// ---------------------------------------------------------------------------
// Board objective

// target = the league position the board expects at worst.
export function boardObjective(world, divisionId, userClubId, userStrength) {
  const div = DIVISION_BY_ID[divisionId];
  const ids = world.divisions[divisionId].filter((id) => id !== userClubId);
  // Rivals play with a settled-squad edge (bigger in higher divisions); you have cohesion (about +5%).
  const edge = (1 + (AI_SETTLED_BY_LEVEL[div.level] ?? 0.1) + AI_FIT_BONUS) / 1.05;
  const rival = (id) => world.clubs[id].strength * edge;
  const stronger = ids.filter((id) => rival(id) > userStrength + 0.5).length;
  const level = ids.filter((id) => Math.abs(rival(id) - userStrength) <= 0.5).length;
  const rank = 1 + stronger + Math.ceil(level / 2); // where the squad "should" finish
  const hasLower = DIVISIONS.some((d) => d.code === div.code && d.tier === div.tier + 1);
  if (rank <= 2) return { target: 1, text: 'Win the league' };
  if (rank <= 4) return { target: 3, text: 'Finish in the top 3' };
  if (rank <= 6) return { target: 6, text: 'Finish in the top 6' };
  return hasLower ? { target: 7, text: 'Avoid relegation' } : { target: 7, text: 'Don\'t finish last' };
}

export function judgeObjective(objective, position) {
  if (position > objective.target) return 'missed';
  if (position === 1 && objective.target > 1) return 'exceeded';
  if (objective.target - position >= 2) return 'exceeded';
  return 'met';
}

// ---------------------------------------------------------------------------
// Reputation

export const REPUTATION = {
  met: 9, exceeded: 13, missed: -8, promotion: 9, cup: 4, league: 9, continental: 10, cwc: 12, sacked: -15,
};

export function reputationChanges({ verdict, promoted, leagueTitle, trophies }) {
  const items = [{ label: `Board objective ${verdict}`, value: REPUTATION[verdict] }];
  if (promoted) items.push({ label: 'Promotion', value: REPUTATION.promotion });
  if (leagueTitle) items.push({ label: 'League title', value: REPUTATION.league });
  const CONTINENTAL = ['European Cup', 'Americas Cup', 'Africa–APAC Cup'];
  for (const t of trophies) {
    if (t === 'Club World Cup') items.push({ label: t, value: REPUTATION.cwc });
    else if (CONTINENTAL.includes(t)) items.push({ label: t, value: REPUTATION.continental });
    else items.push({ label: t, value: REPUTATION.cup });
  }
  return items;
}

// Gains count for less in smaller leagues and get harder as reputation rises; losses count in full.
const LEVEL_WEIGHT = { 1: 1, 2: 0.9, 3: 0.8 };
export function weighReputation(items, level, rep) {
  return items.map((i) => (i.value > 0 ? { ...i, value: Math.max(1, Math.round(i.value * LEVEL_WEIGHT[level] * (1 - rep / 150))) } : i));
}
export const applyReputation = (rep, items) => clamp(rep + items.reduce((s, i) => s + i.value, 0), 0, 100);

// ---------------------------------------------------------------------------
// Confidence: the owners (results against the objective) and the fans (wins, goals,
// trophies). Job security mixes both; below SACK_LINE at the end of a season you are out.

// Sacked only when things go really wrong: security under SACK_LINE, or two missed
// objectives in a row while security is also below WARNING_LINE. A casual game: failure is the exception.
export const SACK_LINE = 15;
export const WARNING_LINE = 35;
export const START_CONFIDENCE = { board: 60, fans: 55 };
export const security = (c) => Math.round((c?.board ?? 60) * 0.65 + (c?.fans ?? 55) * 0.35);

// One match. pos/target: current league position and the board's target (lower is better).
export function matchConfidence(conf, { outcome, gf, ga, competition, pos, target, eliminated, trophy, level, styleDist = null }) {
  const next = { ...START_CONFIDENCE, ...(conf || {}) };
  const big = competition !== 'league';
  const w = { W: 1, D: 0, L: -1 }[outcome];
  next.board += w > 0 ? 2 : w < 0 ? -3 : 0;
  if (competition === 'league' && pos && target) next.board += pos <= target ? 0.5 : -1.5;
  next.fans += w > 0 ? (big ? 4 : 3) : w < 0 ? (big ? -4 : -3) : 0;
  if (gf >= 3) next.fans += 1;
  if (ga >= 4) next.fans -= 2;
  // Owners care how you play: the club's identity (see data/philosophies.js).
  if (styleDist !== null) next.board += styleDist <= 2 ? 0.5 : styleDist > 3.5 ? -0.6 : 0;
  if (eliminated) { next.board -= level === 1 ? 3 : 1; next.fans -= 3; }
  if (trophy) { next.board += 12; next.fans += 15; }
  next.board = clamp(next.board, 0, 100);
  next.fans = clamp(next.fans, 0, 100);
  return next;
}

// End of season: the verdict on the objective weighs most.
export function seasonConfidence(conf, verdict, promoted) {
  const next = { ...START_CONFIDENCE, ...(conf || {}) };
  next.board += { exceeded: 18, met: 10, missed: -16 }[verdict];
  next.fans += { exceeded: 12, met: 4, missed: -10 }[verdict];
  if (promoted) { next.board += 10; next.fans += 12; }
  next.board = clamp(next.board, 0, 100);
  next.fans = clamp(next.fans, 0, 100);
  return next;
}

// A new season at the same club: some patience comes back.
export const carryConfidence = (conf) => ({
  board: Math.round(50 + ((conf?.board ?? 60) - 50) * 0.6),
  fans: Math.round(50 + ((conf?.fans ?? 55) - 50) * 0.7),
});

// ---------------------------------------------------------------------------
// Job offers

// The reputation a club asks of its GM: by level, and by strength within the level.
export function requiredReputation(world, clubId) {
  const club = world.clubs[clubId];
  const level = DIVISION_BY_ID[club.divisionId].level;
  if (TOP_CLUBS.includes(clubId)) return 85 + Math.round((club.strength - 70) / 2);
  const [lo, hi] = { 1: [60, 85], 2: [30, 60], 3: [0, 30] }[level];
  const peers = Object.values(world.clubs).filter((c) => DIVISION_BY_ID[c.divisionId].level === level && !TOP_CLUBS.includes(c.id));
  const below = peers.filter((c) => c.strength < club.strength).length;
  return Math.round(lo + (hi - lo) * (below / Math.max(1, peers.length - 1)));
}

// Up to 3 offers. A sacked GM gets exactly 3: from clubs below the old one, and
// always from a level lower when sacked by a top-flight club.
// passive: offers that arrive on their own at season end (rare); otherwise you went looking.
export function jobOffers(world, { reputation, currentClubId, sacked = false, good = true, seed, passive = false }) {
  const rng = makeRng(seed);
  const current = requiredReputation(world, currentClubId);
  const all = Object.keys(world.clubs).filter((id) => id !== currentClubId).map((id) => ({ id, req: requiredReputation(world, id) }));
  let pool;
  let count;
  if (sacked) {
    const oldLevel = DIVISION_BY_ID[world.clubs[currentClubId].divisionId].level;
    const levelOf = (id) => DIVISION_BY_ID[world.clubs[id].divisionId].level;
    pool = oldLevel === 1
      ? all.filter((c) => levelOf(c.id) === 2)
      : all.filter((c) => c.req < current && c.req <= reputation && levelOf(c.id) >= oldLevel);
    if (pool.length < 3) pool = all.filter((c) => levelOf(c.id) > oldLevel || (oldLevel === 3 && c.req < current));
    count = 3;
  } else {
    const stretch = rng.next() < 0.15 ? 8 : 0;
    // Clubs a step up from where you are now (offers to go sideways or down are rarely worth showing).
    pool = all.filter((c) => c.req <= reputation + stretch && c.req >= Math.min(current, reputation - 25));
    count = passive ? (good && rng.next() < 0.35 ? 1 : 0) : good ? rng.int(2, 3) : rng.int(1, 2);
  }
  if (!pool.length) pool = all.filter((c) => c.req <= Math.max(reputation, 30));
  // Prefer the biggest clubs that would have you.
  const picked = [];
  while (picked.length < count && pool.length) {
    const c = rng.weighted(pool, (x) => 1 + x.req);
    picked.push(c);
    pool = pool.filter((x) => x.id !== c.id);
  }
  return picked.sort((a, b) => b.req - a.req).map((c) => ({
    clubId: c.id,
    required: c.req,
    name: world.clubs[c.id].name,
    division: DIVISION_BY_ID[world.clubs[c.id].divisionId].name,
    level: DIVISION_BY_ID[world.clubs[c.id].divisionId].level,
  }));
}

// Facilities and treasury a club offers a new GM: by level, then by size within the level
// (a strong level-1 side like Sevilla is far richer than a promoted one; the giants are another world).
export function clubStart(world, clubId) {
  const club = world.clubs[clubId];
  const level = DIVISION_BY_ID[club.divisionId].level;
  const base = CLUB_START[level];
  if (TOP_CLUBS.includes(clubId)) return { coins: 9000, facilities: { stadium: 5, merch: 5, training: 4, academy: 4 }, coachRarity: 'epic' };
  const peers = Object.values(world.clubs).filter((c) => DIVISION_BY_ID[c.divisionId].level === level);
  const share = peers.filter((c) => c.strength < club.strength).length / Math.max(1, peers.length - 1); // 0 smallest … 1 biggest
  const up = share > 0.66 ? 1 : 0;
  const down = share < 0.33 ? 1 : 0;
  const fac = Object.fromEntries(Object.entries(base.facilities).map(([k, v]) => [k, Math.max(0, Math.min(5, v + up - down))]));
  return { coins: Math.round(base.coins * (0.7 + 0.6 * share)), facilities: fac, coachRarity: base.coachRarity };
}

export const CLUB_START = {
  1: { coins: 4000, facilities: { stadium: 4, merch: 4, training: 3, academy: 3 }, coachRarity: 'rare' },
  2: { coins: 1500, facilities: { stadium: 2, merch: 2, training: 2, academy: 1 }, coachRarity: 'uncommon' },
  3: { coins: 500, facilities: { stadium: 1, merch: 0, training: 1, academy: 0 }, coachRarity: 'common' },
};
