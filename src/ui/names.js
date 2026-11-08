import { CONTINENT_NAME } from '../engine/competitions.js';
import { DIVISIONS } from '../data/world/structure.js';

export const CONTINENTAL_NAME = CONTINENT_NAME;
export const CUP_NAME_FOR = (code) => `${DIVISIONS.find((d) => d.code === code)?.country || code} Cup`;
