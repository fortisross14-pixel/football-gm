import { CONTINENT_NAME, CONTINENT2_NAME, CONT_SUPER_NAME, cupName, superCupName, keyName } from '../engine/competitions.js';

export const CONTINENTAL_NAME = CONTINENT_NAME;
export const CONTINENTAL2_NAME = CONTINENT2_NAME;
export const CUP_NAME_FOR = cupName;
export const SUPER_CUP_NAME_FOR = superCupName;

// A stats-book competition key as a name: 'L:esp-1' → LaLiga, 'C:ESP' → Spain Cup, 'S:ENG' → Community Shield,
// 'K:europe' → European Cup, 'K2:europe' → European Trophy, 'KS:europe' → Europe Super Cup, 'W'.
export const compName = keyName;
// Sort order for competitions: leagues, super cups, cups, continental, Club World Cup.
export const compOrder = (comp) => ({ L: 0, S: 1, C: 2, KS: 3, K: 4, K2: 5, W: 6 }[comp.split(':')[0]] ?? 7);
export const TROPHY_ICON = { league: '🏆', cup: '🥇', supercup: '🛡️', continental: '🌍', continental2: '🌎', contsuper: '🏵️', cwc: '🌐' };
export const trophyNames = {
  cup: cupName, supercup: superCupName, continental: (k) => CONTINENT_NAME[k] || k,
  continental2: (k) => CONTINENT2_NAME[k] || k, contsuper: (k) => CONT_SUPER_NAME[k] || k,
};
