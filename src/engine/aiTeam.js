// Builds a full 10-card squad for an AI club from its rating and named key players.
// Real data stays small (rating + 3 key players); the rest are generic names.

import { makeRng } from './rng.js';

const FIRST = ['Alex', 'Leo', 'Marco', 'Lucas', 'Noah', 'Mateo', 'Theo', 'Hugo', 'Adam', 'Nico', 'Sami', 'Jonas', 'Rafa', 'Tiago', 'Emil', 'Kai', 'Iván', 'Oscar', 'Yusuf', 'Diego', 'Andrés', 'Pablo', 'Luca', 'Milan'];
const LAST = ['Moreno', 'Silva', 'Keller', 'Rossi', 'Novak', 'Duarte', 'Brandt', 'Lindqvist', 'Costa', 'Varga', 'Marín', 'Okafor', 'Petit', 'Haas', 'Blanco', 'Ferri', 'Santos', 'Weber', 'Cruz', 'Navarro', 'Lopes', 'Mendes'];

const STAT_SHAPE = {
  GK: { att: -40, def: 2, phy: -6 },
  DEF: { att: -16, def: 4, phy: 1 },
  MID: { att: 0, def: -4, phy: 2 },
  FWD: { att: 5, def: -30, phy: 0 },
};

// `used` keeps surnames unique within one squad.
export function genericName(rng, used = new Set()) {
  let last = rng.pick(LAST);
  for (let i = 0; i < 20 && used.has(last); i += 1) last = rng.pick(LAST);
  used.add(last);
  return `${rng.pick(FIRST)} ${last}`;
}

export function makeGenericCard(rng, { id, pos, rating, rarity = 'common', used }) {
  const shape = STAT_SHAPE[pos];
  const spread = () => rng.int(-3, 3);
  return {
    id,
    name: genericName(rng, used),
    pos,
    rarity,
    att: Math.max(20, rating + shape.att + spread()),
    def: Math.max(20, rating + shape.def + spread()),
    phy: Math.max(30, rating + shape.phy + spread()),
    trait: null,
    matchesLeft: rarity === 'academy' ? null : 160,
    generic: true,
  };
}

// club: { id, name, short, colors, rating, formation, keyPlayers: [card] }
export function buildAiTeam(club, seed = 7) {
  const rng = makeRng(seed);
  const formation = club.formation || '2-3-1';
  const [d, m, f] = formation.split('-').map(Number);
  const needs = ['GK', ...Array(d).fill('DEF'), ...Array(m).fill('MID'), ...Array(f).fill('FWD')];
  const players = [];
  const lineup = [];
  const pool = [...(club.keyPlayers || [])];
  const used = new Set(pool.map((k) => k.name.split(' ').slice(-1)[0]));
  needs.forEach((pos, i) => {
    const keyIndex = pool.findIndex((k) => k.pos === pos);
    const card = keyIndex >= 0
      ? pool.splice(keyIndex, 1)[0]
      : makeGenericCard(rng, { id: `${club.id}-s${i}`, pos, rating: club.rating + rng.int(-3, 2), used });
    players.push(card);
    lineup.push(card.id);
  });
  const benchPos = ['GK', 'DEF', 'MID'];
  const bench = benchPos.map((pos, i) => {
    const card = makeGenericCard(rng, { id: `${club.id}-b${i}`, pos, rating: club.rating - 5, used });
    players.push(card);
    return card.id;
  });
  return {
    id: club.id,
    name: club.name,
    short: club.short,
    colors: club.colors,
    formation,
    players,
    lineup,
    bench,
    coach: club.coach || null,
    assistant: null,
    loadout: [],
    isAI: true,
  };
}
