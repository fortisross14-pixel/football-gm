// Club squads: a few named cards plus generic Common players (surname only).
import { makeRng } from './rng.js';
import { overall, slotFit, FORMATIONS } from './cards.js';

const SURNAMES = [
  'Moreno', 'Silva', 'Keller', 'Rossi', 'Novak', 'Duarte', 'Brandt', 'Lindqvist', 'Costa', 'Varga', 'Marín', 'Okafor',
  'Petit', 'Haas', 'Blanco', 'Ferri', 'Santos', 'Weber', 'Cruz', 'Navarro', 'Lopes', 'Mendes', 'Herrera', 'Kovač',
  'Jansen', 'Larsen', 'Moretti', 'Dubois', 'Schulz', 'Pereira', 'Alonso', 'Romero', 'Ivanov', 'Yilmaz', 'Nakamura',
  'Kim', 'Mensah', 'Diallo', 'Haddad', 'Soto', 'Vidal', 'Gallo', 'Fischer', 'Bakker', 'Nilsson', 'Rocha', 'Vega',
  'Castro', 'Ortiz', 'Ramos', 'Molina', 'Suárez', 'Bruno', 'Conti', 'Lambert', 'Roux', 'Hoffmann', 'Visser', 'Dahl',
  'Barros', 'Pinto', 'Acosta', 'Medina', 'Aguilar', 'Salah', 'Adeyemi', 'Tanaka', 'Park', 'Benali', 'Toure', 'Kaya',
];

const STAT_SHAPE = {
  GK: { att: -38, def: 3, phy: -5 },
  DEF: { att: -16, def: 4, phy: 1 },
  MID: { att: 1, def: -3, phy: 2 },
  FWD: { att: 5, def: -28, phy: 0 },
};

// Generic players are always Common (OVR 55–61); the division sets where in that range.
export const FILLER_RATING = { 1: 60, 2: 58, 3: 56 };
export const AI_SETTLED_BONUS = 0.1;
// Higher divisions are tougher: their AI squads play with more of an edge.
export const AI_SETTLED_BY_LEVEL = { 1: 0.18, 2: 0.14, 3: 0.1 };

export function genericName(rng, used = new Set()) {
  let name = rng.pick(SURNAMES);
  for (let i = 0; i < 30 && used.has(name); i += 1) name = rng.pick(SURNAMES);
  used.add(name);
  return name;
}

export function makeGenericCard(rng, { id, pos, rating, rarity = 'common', used }) {
  const shape = STAT_SHAPE[pos];
  let card;
  for (let tries = 0; tries < 12; tries += 1) {
    const spread = () => rng.int(-2, 2);
    card = {
      id,
      name: genericName(rng, used),
      pos,
      rarity,
      att: Math.max(15, rating + shape.att + spread()),
      def: Math.max(15, rating + shape.def + spread()),
      phy: Math.max(30, rating + shape.phy + spread()),
      trait: null,
      matchesLeft: rarity === 'academy' ? null : 150 + rng.int(0, 50),
      generic: true,
    };
    const ovr = overall(card);
    if (rarity !== 'common' || (ovr >= 55 && ovr <= 61)) break;
    used?.delete(card.name);
  }
  return card;
}

// Picks the starting 7 for a formation from the named cards, filling gaps with generics.
// Returns { lineup: [card x7], bench: [card x3] }.
export function pickSquad(named, formation, fillerRating, rng, idPrefix) {
  const slots = FORMATIONS[formation];
  const used = new Set(named.map((c) => c.name.split(' ').slice(-1)[0]));
  const left = [...named];
  const lineup = slots.map((slot, i) => {
    let bestIdx = -1;
    let best = fillerRating + 0.5;
    left.forEach((c, idx) => {
      const v = overall(c) * slotFit(c.pos, slot.pos);
      if (v > best) { best = v; bestIdx = idx; }
    });
    if (bestIdx >= 0) return left.splice(bestIdx, 1)[0];
    return makeGenericCard(rng, { id: `${idPrefix}-s${i}`, pos: slot.pos, rating: fillerRating, used });
  });
  const bench = left.slice(0, 3);
  const benchPos = ['GK', 'DEF', 'MID', 'FWD'];
  let k = 0;
  while (bench.length < 3) {
    const pos = benchPos.find((p) => !bench.some((b) => b.pos === p)) || benchPos[k % 4];
    bench.push(makeGenericCard(rng, { id: `${idPrefix}-b${k}`, pos, rating: fillerRating - 1, used }));
    k += 1;
  }
  return { lineup, bench };
}

// Average OVR of the starting 7, adjusted for position fit. Drives the fast sim.
export function squadStrength(lineup, formation) {
  const slots = FORMATIONS[formation];
  return Math.round((lineup.reduce((s, c, i) => s + overall(c) * slotFit(c.pos, slots[i].pos), 0) / lineup.length) * 10) / 10;
}

// club: { id, name, short, colors, formation, coach, keyPlayers: [card], level }
export function buildAiTeam(club, seed = 7) {
  const rng = makeRng(seed);
  const formation = club.formation || '2-3-1';
  const filler = FILLER_RATING[club.level] ?? (club.rating ? Math.min(61, Math.max(55, club.rating - 10)) : 57);
  const { lineup, bench } = pickSquad(club.keyPlayers || [], formation, filler, rng, club.id);
  return {
    id: club.id,
    name: club.name,
    short: club.short,
    colors: club.colors,
    formation,
    players: [...lineup, ...bench],
    lineup: lineup.map((c) => c.id),
    bench: bench.map((c) => c.id),
    coach: club.coach || null,
    assistant: null,
    loadout: [],
    isAI: true,
    tactics: aiTactics(club, seed),
    // AI squads play together all season: the same edge your cohesion gives you.
    mods: { all: club.settled ?? AI_SETTLED_BY_LEVEL[club.level] ?? AI_SETTLED_BONUS },
  };
}

// Each AI club has a style: big clubs press and pass, smaller ones sit deeper and go direct.
const STYLES = [
  { press: 'high', passing: 'short', line: 'high' },
  { press: 'mid', passing: 'short', line: 'normal' },
  { press: 'high', passing: 'mixed', line: 'normal' },
  { press: 'mid', passing: 'mixed', line: 'normal' },
  { press: 'low', passing: 'direct', line: 'deep' },
  { press: 'mid', passing: 'direct', line: 'normal' },
  { press: 'low', passing: 'mixed', line: 'deep' },
];
export function aiTactics(club) {
  let h = 0;
  for (const ch of String(club.id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const top = club.level === 1 ? [0, 1, 2, 3] : club.level === 2 ? [1, 2, 3, 5] : [3, 4, 5, 6];
  return { ...STYLES[top[h % top.length]] };
}
