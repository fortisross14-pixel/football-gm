// Packs: rarity rolls, guarantees and drawing cards from the pool.
import { makeRng } from './rng.js';
import { TIERS } from '../data/offseason.js';

export const PACKS = {
  bronze: { name: 'Bronze Pack', price: 200, count: 3, kind: 'player', odds: [60, 30, 9, 1, 0], guarantee: null },
  silver: { name: 'Silver Pack', price: 600, count: 3, kind: 'player', odds: [35, 40, 20, 4, 1], guarantee: 1 },
  gold: { name: 'Gold Pack', price: 2000, count: 3, kind: 'player', odds: [5, 30, 47, 15, 3], guarantee: 2 },
  elite: { name: 'Elite Pack', price: 5000, count: 3, kind: 'player', odds: [0, 15, 40, 33, 12], guarantee: 3, legendChance: 0.25 },
  coach: { name: 'Coach Pack', price: 700, count: 2, kind: 'coach', odds: [30, 35, 25, 8, 2], guarantee: 2 },
};

export const PACK_IDS = Object.keys(PACKS);

// Scouting Network moves `shift` points from Common to higher rarities.
export function packOdds(packId, shift = 0) {
  const odds = [...PACKS[packId].odds];
  const moved = Math.min(shift, odds[0]);
  odds[0] -= moved;
  odds[1] += moved * 0.4;
  odds[2] += moved * 0.35;
  odds[3] += moved * 0.2;
  odds[4] += moved * 0.05;
  return odds;
}

function rollTier(rng, odds) {
  const total = odds.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < odds.length; i += 1) {
    roll -= odds[i];
    if (roll < 0) return i;
  }
  return 0;
}

// Picks a card of the given tier; falls back to the nearest lower tier if empty.
export function drawFromPool(rng, pool, tier, filter = () => true) {
  for (let t = tier; t >= 0; t -= 1) {
    const options = pool.filter((c) => c.rarity === TIERS[t] && filter(c));
    if (options.length) return structuredClone(rng.pick(options));
  }
  return null;
}

// Returns { cards, seed }. `pools` = { player: [...], coach: [...] }.
export function openPack(packId, seed, pools, shift = 0) {
  const pack = PACKS[packId];
  const rng = makeRng(seed);
  const pool = pack.kind === 'coach' ? pools.coach : pools.player;
  const odds = packOdds(packId, shift);
  const tiers = Array.from({ length: pack.count }, () => rollTier(rng, odds));
  if (pack.guarantee !== null && Math.max(...tiers) < pack.guarantee) {
    tiers[tiers.length - 1] = pack.legendChance && rng.next() < pack.legendChance ? 4 : pack.guarantee;
  }
  // Best card revealed last.
  tiers.sort((a, b) => a - b);
  const used = new Set();
  const cards = tiers.map((tier) => {
    const card = drawFromPool(rng, pool, tier, (c) => !used.has(c.id)) || drawFromPool(rng, pool, tier);
    used.add(card.id);
    return card;
  });
  return { cards, seed: rng.seed };
}

export const MAX_STARS = 3;

// Merging a duplicate: +1 star, +2 to every stat, +30 matches.
export function mergeDuplicate(card) {
  if ((card.stars || 0) >= MAX_STARS) return null;
  const next = { ...card, stars: (card.stars || 0) + 1 };
  if (next.role !== 'coach') {
    next.att += 2;
    next.def += 2;
    next.phy += 2;
  }
  if (next.matchesLeft != null) next.matchesLeft += 30;
  return next;
}
