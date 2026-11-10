// Compact card writer for the history pools added in v1.9 (squads-e.js, squads-f.js).
// A card is written as its name, position, overall and nation; the stats are shaped by
// position (with a small per-name variation) so they match that overall exactly, and the
// rarity follows the overall like every other card (scripts/check-squads.mjs checks it).
import { overall, rarityForOverall } from '../engine/cards.js';

const hash = (s) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
const LETTERS = { ø: 'o', ß: 'ss', ı: 'i', ł: 'l', ð: 'd', đ: 'd', æ: 'ae', þ: 'th', œ: 'oe' };
export const slug = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[øßıłðđæþœ]/g, (ch) => LETTERS[ch]).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Career length (matches left) by rarity: the middle of the range other pool cards use.
const CAREER = { uncommon: 160, rare: 145, epic: 130, legend: 115 };

export function statsFor(name, pos, ovr) {
  const r = hash(name);
  const j = (k, span) => ((r >>> k) % (2 * span + 1)) - span;
  const card = { pos, att: 0, def: 0, phy: 0 };
  let key;
  if (pos === 'GK') { card.att = 18 + j(1, 4); card.phy = ovr - 5 + j(4, 4); key = 'def'; }
  else if (pos === 'DEF') { card.att = ovr - 18 + j(1, 7); card.phy = ovr + j(4, 4); key = 'def'; }
  else if (pos === 'MID') { card.att = ovr + 3 + j(1, 5); card.phy = ovr - 2 + j(4, 5); key = 'def'; }
  else { card.def = 38 + j(1, 6); card.phy = ovr - 6 + j(4, 6); key = 'att'; }
  card[key] = ovr;
  // Walk the main stat (then physique) until the overall is exact; stats stay within 15–95.
  for (let i = 0; i < 200 && overall(card) !== ovr; i += 1) {
    const up = overall(card) < ovr;
    const k = up && card[key] >= 95 ? 'phy' : key;
    card[k] = Math.max(15, Math.min(95, card[k] + (up ? 1 : -1)));
  }
  return { att: card.att, def: card.def, phy: card.phy };
}

// classic = retired (shown at his peak for the club); pass now = true for an active player.
export function card(name, pos, ovr, nation, trait = null, { now = false, id = null } = {}) {
  const rarity = rarityForOverall(ovr);
  const r = hash(name);
  return {
    id: id || `p-${slug(name)}`,
    name,
    pos,
    rarity,
    ...statsFor(name, pos, ovr),
    trait,
    matchesLeft: (CAREER[rarity] || 150) + ((r >>> 7) % 21) - 10,
    nation,
    ...(now ? {} : { classic: true }),
  };
}

// Builds { SQUADS, PLAYERS } from { clubId: [card, …] }.
export function pools(byClub) {
  const SQUADS = {};
  const PLAYERS = [];
  for (const [clubId, cards] of Object.entries(byClub)) {
    SQUADS[clubId] = cards.map((c) => (typeof c === 'string' ? c : c.id));
    for (const c of cards) if (typeof c !== 'string') PLAYERS.push(c);
  }
  return { SQUADS, PLAYERS };
}
