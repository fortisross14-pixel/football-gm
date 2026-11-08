// Club squads over time: starting draws from each club's history pool, the yearly academy
// intake, AI signings from the free market, wear and retirement. Every card belongs to at
// most one club (or the user) at a time.
import { makeRng } from './rng.js';
import { overall } from './cards.js';
import { DIVISION_BY_ID, TOP_CLUBS } from '../data/world/structure.js';
import { TIERS } from '../data/offseason.js';

export const MAX_NAMED = 10;
// Retired players rest this many seasons, then can come back (through academies or signings).
export const REST_SEASONS = 3;

// Named-card cap per club: its starting range's top end, plus one for an academy graduate.
export const namedCap = (clubId, div) => startingDraw(clubId, div)[1] + 1;
const SEASON_MATCHES = 14;

// Academy by facility level (0–5): how many cards and the best rarity it can produce.
export const ACADEMY_COUNT = [1, 1, 2, 2, 3, 3];
export const ACADEMY_MAX_TIER = [1, 2, 2, 3, 3, 4]; // 1 uncommon … 4 legend

// How many named cards a club starts with, drawn at random from its history pool.
export function startingDraw(clubId, div) {
  if (TOP_CLUBS.includes(clubId)) return [6, 7];
  if (div.tier === 1) return [3, 4];
  return [0, 2];
}

// AI clubs' academy level, by stature.
export function aiAcademyLevel(clubId, div) {
  if (TOP_CLUBS.includes(clubId)) return 4;
  if (div.tier === 1) return div.level === 1 ? 3 : 2;
  return 1;
}

const tierOf = (card) => TIERS.indexOf(card.rarity);

// Rolls a rarity tier up to `maxTier`, favouring lower tiers (each step up halves the odds).
function rollTier(rng, maxTier, minTier = 1) {
  const tiers = [];
  for (let t = minTier; t <= maxTier; t += 1) tiers.push(t);
  return rng.weighted(tiers, (t) => 2 ** (maxTier - t));
}

// Every card currently held by a club or the user.
export function ownedSet(world, userIds = []) {
  const set = new Set(userIds);
  for (const c of Object.values(world.clubs)) for (const id of c.keyPlayers) set.add(id);
  return set;
}

// Picks a card from the club's own history pool, or (fallback) from anyone free,
// preferring the club's country. Returns a card or null.
export function academyPick({ rng, clubId, nation, pools, poolById, taken, retired, tier, allCards, allowOutside = true, pos = null }) {
  const free = (id) => !taken.has(id) && !retired.has(id) && poolById[id];
  const fits = (c) => !pos || c.pos === pos;
  const own = (pools[clubId] || []).filter(free).map((id) => poolById[id]).filter(fits);
  for (let t = tier; t >= 1; t -= 1) {
    const options = own.filter((c) => tierOf(c) === t);
    if (options.length) return rng.pick(options);
  }
  if (!allowOutside) return null;
  // From elsewhere: prefer cards that aren't another club's legend, then the same country.
  for (let t = tier; t >= 1; t -= 1) {
    const outside = allCards.filter((c) => free(c.id) && tierOf(c) === t && fits(c));
    const unattached = outside.filter((c) => !c.poolClub);
    const base = unattached.length ? unattached : outside;
    const local = base.filter((c) => c.nation === nation);
    const list = local.length ? local : base;
    if (list.length) return rng.pick(list);
  }
  return null;
}

// Draws every club's starting named cards from its pool.
export function drawStartingSquads(world, pools, poolById, userIds, seed) {
  const rng = makeRng(seed);
  const taken = new Set(userIds);
  for (const club of Object.values(world.clubs)) {
    const div = DIVISION_BY_ID[club.divisionId];
    const [lo, hi] = startingDraw(club.id, div);
    const n = rng.int(lo, hi);
    // Smaller leagues start with lesser legends: level 3 up to Rare, level 2 up to Epic.
    const maxTier = div.level === 3 ? 2 : div.level === 2 ? 3 : 4;
    const pool = (pools[club.id] || []).filter((id) => poolById[id] && !taken.has(id) && tierOf(poolById[id]) <= maxTier);
    const shuffled = [...pool].sort(() => rng.next() - 0.5);
    club.keyPlayers = shuffled.slice(0, n);
    for (const id of club.keyPlayers) {
      taken.add(id);
      // Players are at different points of their careers, so retirements are spread out.
      world.cardLeft[id] = Math.round((poolById[id].matchesLeft ?? 150) * (0.25 + 0.75 * rng.next()));
    }
  }
}

// The off-season for every AI club: wear and retirement, academy, signings, squad trim.
// Returns { world, news } where news lists notable moves.
export function aiOffseason(world, { pools, poolById, allCards, userIds, seed, countryOf }) {
  const next = structuredClone(world);
  const rng = makeRng(seed);
  const news = [];
  // Rested players become available again.
  next.resting = next.resting || {};
  for (const [id, left] of Object.entries(next.resting)) {
    if (left <= 1) delete next.resting[id];
    else next.resting[id] = left - 1;
  }
  const retired = new Set(Object.keys(next.resting));

  // 1. Wear: AI cards lose a season of matches, and retire at 0.
  for (const club of Object.values(next.clubs)) {
    club.keyPlayers = club.keyPlayers.filter((id) => {
      next.cardLeft[id] = (next.cardLeft[id] ?? poolById[id]?.matchesLeft ?? 150) - SEASON_MATCHES;
      if (next.cardLeft[id] > 0) return true;
      retired.add(id);
      next.resting[id] = REST_SEASONS;
      next.retiredCount = (next.retiredCount || 0) + 1;
      delete next.cardLeft[id];
      return false;
    });
  }

  const taken = ownedSet(next, userIds);
  const add = (club, card, how) => {
    club.keyPlayers.push(card.id);
    taken.add(card.id);
    next.cardLeft[card.id] = card.matchesLeft ?? 150;
    if (tierOf(card) >= 3) news.push({ type: how, clubId: club.id, club: club.name, cardId: card.id, name: card.name, rarity: card.rarity });
  };

  // 2. Academy: 1–3 cards, preferably club legends, while there's room in the squad.
  for (const club of Object.values(next.clubs)) {
    const div = DIVISION_BY_ID[club.divisionId];
    const level = aiAcademyLevel(club.id, div);
    for (let i = 0; i < ACADEMY_COUNT[level]; i += 1) {
      if (club.keyPlayers.length >= namedCap(club.id, div)) break;
      if (rng.next() < 0.35) continue; // not every intake produces a named player
      const tier = rollTier(rng, ACADEMY_MAX_TIER[level]);
      const card = academyPick({ rng, clubId: club.id, nation: countryOf(club.divisionId), pools, poolById, taken, retired, tier, allCards, allowOutside: false });
      if (card) add(club, card, 'academy');
    }
  }

  // 3. Signings from the free market (cards nobody holds).
  const market = allCards.filter((c) => !taken.has(c.id) && !retired.has(c.id) && tierOf(c) >= 1);
  const clubs = Object.values(next.clubs).sort(() => rng.next() - 0.5);
  for (const club of clubs) {
    const div = DIVISION_BY_ID[club.divisionId];
    const top = TOP_CLUBS.includes(club.id);
    // Clubs below their usual number of named players sign to get back to it; others sometimes add one.
    const [lo] = startingDraw(club.id, div);
    const deficit = Math.max(0, lo - club.keyPlayers.length);
    const extra = top ? rng.int(0, 1) : (rng.next() < 0.1 ? 1 : 0);
    const signings = Math.min(3, deficit + extra);
    const cap = top ? 4 : div.tier === 1 ? 3 : 2;
    const room = startingDraw(club.id, div)[1];
    for (let i = 0; i < signings && club.keyPlayers.length < room; i += 1) {
      const options = market.filter((c) => !taken.has(c.id) && tierOf(c) <= cap && tierOf(c) >= 1);
      if (!options.length) break;
      // Stars are rare signings: each rarity step up is a third as likely.
      const card = rng.weighted(options, (c) => 3 ** (cap - tierOf(c)));
      add(club, card, 'signing');
    }
  }

  // 4. Keep squads under their cap: the weakest named cards are released to the free market.
  for (const club of Object.values(next.clubs)) {
    const cap = Math.min(MAX_NAMED, namedCap(club.id, DIVISION_BY_ID[club.divisionId]));
    if (club.keyPlayers.length <= cap) continue;
    club.keyPlayers.sort((a, b) => overall(poolById[b]) - overall(poolById[a]));
    for (const id of club.keyPlayers.splice(cap)) delete next.cardLeft[id];
  }

  news.sort((a, b) => tierOf(poolById[b.cardId]) - tierOf(poolById[a.cardId]));
  return { world: next, news };
}

// The user's academy intake for the off-season: cards waiting for Keep/Discard.
export function userAcademyIntake(world, { level, bonusCards = 0, bonusTier = 0, clubId, nation, pools, poolById, allCards, userIds, seed, pos = null, exactTier = null }) {
  const rng = makeRng(seed);
  const taken = ownedSet(world, userIds);
  const retired = new Set(Object.keys(world.resting || {}));
  const cards = [];
  const count = level === null ? bonusCards : ACADEMY_COUNT[level] + bonusCards;
  const maxTier = Math.min(4, (level === null ? 1 : ACADEMY_MAX_TIER[level]) + bonusTier);
  for (let i = 0; i < count; i += 1) {
    const tier = exactTier ?? rollTier(rng, maxTier, bonusTier ? Math.min(maxTier, 2) : 1);
    const card = academyPick({ rng, clubId, nation, pools, poolById, taken, retired, tier, allCards, pos });
    if (card) {
      cards.push(structuredClone(card));
      taken.add(card.id);
    } else cards.push({ fallbackTier: tier }); // no real card free: the caller makes a youth player
  }
  return cards;
}
