import { CONTINENT_NAME } from '../engine/competitions.js';
import { DIVISIONS } from '../data/world/structure.js';

export const CONTINENTAL_NAME = CONTINENT_NAME;
export const CUP_NAME_FOR = (code) => `${DIVISIONS.find((d) => d.code === code)?.country || code} Cup`;

// A stats-book competition key as a name: 'L:esp-1' → LaLiga, 'C:ESP' → Spain Cup, 'K:europe', 'W'.
export const compName = (comp) => {
  if (comp === 'W') return 'Club World Cup';
  const kind = comp.slice(0, 1);
  const ref = comp.slice(2);
  if (kind === 'L') return DIVISIONS.find((d) => d.id === ref)?.name || ref;
  if (kind === 'C') return CUP_NAME_FOR(ref);
  if (kind === 'K') return CONTINENT_NAME[ref] || ref;
  return comp;
};
// Sort order for competitions: leagues, cups, continental, Club World Cup.
export const compOrder = (comp) => ({ L: 0, C: 1, K: 2, W: 3 }[comp[0]] ?? 4);
export const TROPHY_ICON = { league: '🏆', cup: '🥇', continental: '🌍', cwc: '🌐' };
export const trophyNames = { cup: CUP_NAME_FOR, continental: (k) => CONTINENT_NAME[k] || k };
