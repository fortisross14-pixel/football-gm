// Merges the region files into one world: clubs per division and the full card pool.
import { PLAYER_POOL, COACH_POOL } from '../pool.js';
import * as europeA from './europe-a.js';
import * as europeB from './europe-b.js';
import * as europeC from './europe-c-southam.js';
import * as rest from './rest.js';

const REGIONS = [europeA, europeB, europeC, rest];

export const CLUBS_BY_DIVISION = Object.assign({}, ...REGIONS.map((r) => r.CLUBS || {}));

const TAGS = Object.assign({}, ...REGIONS.map((r) => r.CLUB_TAGS || {}));

// Every collectible player card. Each may carry the clubId of the club it plays for.
export const PLAYER_CARDS = [
  ...PLAYER_POOL.map((p) => ({ ...p, clubId: TAGS[p.id] || null })),
  ...REGIONS.flatMap((r) => r.PLAYERS || []),
];

export const COACH_CARDS = COACH_POOL;

export const CARD_BY_ID = Object.fromEntries([...PLAYER_CARDS, ...COACH_CARDS].map((c) => [c.id, c]));
