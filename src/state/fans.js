// The club's fan base: { local, global, happiness }.
//
// Stand-in until the fans model lands (stadium stars + fans work): derived from the
// division level, the stadium, squad popularity, trophies and the fans' confidence, so the
// deals (kit sales, sponsor and TV offers) and the season summary have numbers to read.
// The merge swaps this file for the real one; callers only use fansOf(state).

import { DIVISION_BY_ID } from '../data/world/structure.js';
import { RARITIES } from '../engine/cards.js';

const LOCAL_BASE = { 1: 42000, 2: 18000, 3: 7000 };
const GLOBAL_PER_POP = { 1: 9000, 2: 3500, 3: 1200 };
const round = (v, to) => Math.max(0, Math.round(v / to) * to);

const popularity = (state) => (state.squad || []).reduce((sum, c) => sum
  + (RARITIES[c.rarity]?.popularity || 0) * (1 + 0.25 * (c.stars || 0)) + (c.fame || 0), 0);

export function fansOf(state) {
  const level = DIVISION_BY_ID[state.club?.divisionId]?.level || 3;
  const happiness = Math.round(state.gm?.confidence?.fans ?? 55);
  const titles = (state.trophies || []).filter((t) => t.position === 1).length;
  const mood = 0.8 + 0.4 * (happiness / 100);
  const local = LOCAL_BASE[level] * (1 + 0.1 * (state.facilities?.stadium || 0)) * (1 + 0.04 * Math.min(10, titles)) * mood;
  const global = GLOBAL_PER_POP[level] * popularity(state) * (1 + 0.06 * Math.min(10, titles)) * mood;
  return { local: round(local, 100), global: round(global, 500), happiness };
}
