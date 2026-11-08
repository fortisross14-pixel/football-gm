// The GM career: board objectives, reputation, job offers and sackings.
import { makeRng } from './rng.js';
import { DIVISIONS, DIVISION_BY_ID, TOP_CLUBS } from '../data/world/structure.js';
import { AI_SETTLED_BY_LEVEL } from './aiTeam.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const START_REPUTATION = 10;

// ---------------------------------------------------------------------------
// Board objective

// target = the league position the board expects at worst.
export function boardObjective(world, divisionId, userClubId, userStrength) {
  const div = DIVISION_BY_ID[divisionId];
  const ids = world.divisions[divisionId].filter((id) => id !== userClubId);
  // Rivals play with a settled-squad edge (bigger in higher divisions); you have cohesion (about +5%).
  const edge = (1 + (AI_SETTLED_BY_LEVEL[div.level] ?? 0.1)) / 1.05;
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
  met: 8, exceeded: 12, missed: -10, promotion: 8, cup: 4, league: 8, continental: 12, cwc: 15, sacked: -15,
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
const LEVEL_WEIGHT = { 1: 1, 2: 0.8, 3: 0.6 };
export function weighReputation(items, level, rep) {
  return items.map((i) => (i.value > 0 ? { ...i, value: Math.max(1, Math.round(i.value * LEVEL_WEIGHT[level] * (1 - rep / 140))) } : i));
}
export const applyReputation = (rep, items) => clamp(rep + items.reduce((s, i) => s + i.value, 0), 0, 100);

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

// Up to 3 offers. Sacked GMs always get at least 2, from clubs below their old one.
export function jobOffers(world, { reputation, currentClubId, sacked = false, good = true, seed }) {
  const rng = makeRng(seed);
  const current = requiredReputation(world, currentClubId);
  const all = Object.keys(world.clubs).filter((id) => id !== currentClubId).map((id) => ({ id, req: requiredReputation(world, id) }));
  let pool;
  let count;
  if (sacked) {
    pool = all.filter((c) => c.req < current && c.req <= reputation);
    count = 2 + (rng.next() < 0.5 ? 1 : 0);
  } else {
    const stretch = rng.next() < 0.15 ? 8 : 0;
    // Clubs a step up from where you are now (offers to go sideways or down are rarely worth showing).
    pool = all.filter((c) => c.req <= reputation + stretch && c.req >= Math.min(current, reputation - 25));
    count = good ? rng.int(1, 3) : (rng.next() < 0.4 ? 1 : 0);
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

// Facilities and treasury a club offers a new GM, by level.
export const CLUB_START = {
  1: { coins: 4000, facilities: { stadium: 4, merch: 4, training: 3, academy: 3 }, coachRarity: 'rare' },
  2: { coins: 1500, facilities: { stadium: 2, merch: 2, training: 2, academy: 1 }, coachRarity: 'uncommon' },
  3: { coins: 500, facilities: { stadium: 1, merch: 0, training: 1, academy: 0 }, coachRarity: 'common' },
};
