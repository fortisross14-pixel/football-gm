// The GM career: board objectives, reputation, job offers and sackings.
import { makeRng } from './rng.js';
import { DIVISIONS, DIVISION_BY_ID, TOP_CLUBS } from '../data/world/structure.js';
import { AI_SETTLED_BY_LEVEL, AI_FIT_BONUS } from './aiTeam.js';
import { PROMOTION_SPOTS } from './season.js';
import { trophyKind } from './competitions.js';

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
  // 10-club divisions with 2 relegation places: the safe line is 8th.
  const safe = ids.length + 1 - PROMOTION_SPOTS;
  if (rank <= 2) return { target: 1, text: 'Win the league' };
  if (rank <= 4) return { target: 3, text: 'Finish in the top 3' };
  if (rank <= 6) return { target: 6, text: 'Finish in the top 6' };
  return hasLower ? { target: safe, text: 'Avoid relegation' } : { target: safe, text: `Finish in the top ${safe}` };
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
  // v2.3: smaller gains for the second continental trophy and the super cups.
  continental2: 5, contsuper: 2, supercup: 1,
};

export function reputationChanges({ verdict, promoted, leagueTitle, trophies }) {
  const items = [{ label: `Board objective ${verdict}`, value: REPUTATION[verdict] }];
  if (promoted) items.push({ label: 'Promotion', value: REPUTATION.promotion });
  if (leagueTitle) items.push({ label: 'League title', value: REPUTATION.league });
  for (const t of trophies) items.push({ label: t, value: REPUTATION[trophyKind(t)] ?? REPUTATION.cup });
  return items;
}

// Gains count for less in smaller leagues and get harder as reputation rises; losses count in full.
const LEVEL_WEIGHT = { 1: 1, 2: 0.75, 3: 0.6 };
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
export function matchConfidence(conf, { outcome, gf, ga, competition, pos, target, eliminated, trophy, level, styleDist = null, derby = false }) {
  const before = { ...START_CONFIDENCE, ...(conf || {}) };
  const next = { ...before };
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
  // Derbies: the fans feel it twice as much; the owners a little more.
  if (derby) {
    next.fans += next.fans - before.fans;
    next.board += (next.board - before.board) * 0.25;
  }
  // v1.9: 18 league games a season (14 before), so each match moves confidence a little less.
  next.board = clamp(before.board + (next.board - before.board) * MATCH_WEIGHT, 0, 100);
  next.fans = clamp(before.fans + (next.fans - before.fans) * MATCH_WEIGHT, 0, 100);
  return next;
}
const MATCH_WEIGHT = 0.8;

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
  const [lo, hi] = { 1: [66, 88], 2: [32, 62], 3: [0, 30] }[level];
  const peers = Object.values(world.clubs).filter((c) => DIVISION_BY_ID[c.divisionId].level === level && !TOP_CLUBS.includes(c.id));
  const below = peers.filter((c) => c.strength < club.strength).length;
  return Math.round(lo + (hi - lo) * (below / Math.max(1, peers.length - 1)));
}

// Up to 3 offers. A sacked GM gets exactly 3: from clubs below the old one, and
// always from a level lower when sacked by a top-flight club.
// passive: offers that arrive on their own at season end (rare); otherwise you went looking.
// extra: more offers (Media Darling GM card, High Visibility season card); reach: clubs that
// would ask for this much more reputation are in reach too (High Visibility).
export function jobOffers(world, { reputation, currentClubId, sacked = false, good = true, seed, passive = false, extra = 0, reach = 0 }) {
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
    // No skipping a tier: from a tier-3 club the best you can get is a tier-2 club.
    const myLevel = DIVISION_BY_ID[world.clubs[currentClubId].divisionId].level;
    pool = all.filter((c) => c.req <= reputation + stretch + reach && c.req >= Math.min(current, reputation - 25)
      && DIVISION_BY_ID[world.clubs[c.id].divisionId].level >= myLevel - 1);
    count = passive ? (good && rng.next() < 0.35 ? 1 : 0) : good ? rng.int(2, 3) : rng.int(1, 2);
  }
  count += extra;
  if (!pool.length) pool = all.filter((c) => c.req <= Math.max(reputation, 30) && DIVISION_BY_ID[world.clubs[c.id].divisionId].level >= DIVISION_BY_ID[world.clubs[currentClubId].divisionId].level - 1);
  // Prefer the biggest clubs that would have you.
  const picked = [];
  while (picked.length < count && pool.length) {
    // Looking for a job: the biggest clubs that would have you call first.
    const c = rng.weighted(pool, (x) => (passive ? 1 + x.req : (1 + x.req) ** 3));
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

// Facilities (the ten club areas, data/facilities.js) and treasury a club offers a new GM: by level, then by size within the level
// (a strong level-1 side like Sevilla is far richer than a promoted one; the giants are another world).
export function clubStart(world, clubId) {
  const club = world.clubs[clubId];
  const level = DIVISION_BY_ID[club.divisionId].level;
  const base = CLUB_START[level];
  if (TOP_CLUBS.includes(clubId)) return { coins: 9000, facilities: { stadium: 5, hospitality: 4, store: 4, merch: 5, sponsor: 4, training: 4, gym: 3, spa: 3, academy: 4, analytics: 2 }, coachRarity: 'epic' };
  const peers = Object.values(world.clubs).filter((c) => DIVISION_BY_ID[c.divisionId].level === level);
  const share = peers.filter((c) => c.strength < club.strength).length / Math.max(1, peers.length - 1); // 0 smallest … 1 biggest
  const up = share > 0.66 ? 1 : 0;
  const down = share < 0.33 ? 1 : 0;
  const fac = Object.fromEntries(Object.entries(base.facilities).map(([k, v]) => [k, Math.max(0, Math.min(5, v + up - down))]));
  return { coins: Math.round(base.coins * (0.7 + 0.6 * share)), facilities: fac, coachRarity: base.coachRarity };
}

// How big a club is: its league level and where it sits by strength among the clubs of that
// level (share 0 smallest … 1 biggest); the giants are their own class. Used for the stadium
// size and the starting fan base (state/stadium.js, state/fans.js).
export function clubSize(world, clubId) {
  const club = world?.clubs?.[clubId];
  if (!club) return { level: 3, share: 0, giant: false };
  const level = DIVISION_BY_ID[club.divisionId]?.level || 3;
  if (TOP_CLUBS.includes(clubId)) return { level, share: 1, giant: true, strength: club.strength };
  const peers = Object.values(world.clubs).filter((c) => DIVISION_BY_ID[c.divisionId]?.level === level && !TOP_CLUBS.includes(c.id));
  const share = peers.filter((c) => c.strength < club.strength).length / Math.max(1, peers.length - 1);
  return { level, share: Math.max(0, Math.min(1, share)), giant: false, strength: club.strength };
}

export const CLUB_START = {
  1: { coins: 4000, facilities: { stadium: 4, hospitality: 2, store: 2, merch: 4, sponsor: 2, training: 3, gym: 2, spa: 1, academy: 3, analytics: 1 }, coachRarity: 'rare' },
  2: { coins: 1500, facilities: { stadium: 2, hospitality: 1, store: 0, merch: 2, sponsor: 1, training: 2, gym: 1, spa: 0, academy: 1, analytics: 0 }, coachRarity: 'uncommon' },
  3: { coins: 500, facilities: { stadium: 1, hospitality: 0, store: 0, merch: 0, sponsor: 0, training: 1, gym: 0, spa: 0, academy: 0, analytics: 0 }, coachRarity: 'common' },
};
