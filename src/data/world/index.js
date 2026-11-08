// Merges the region files into one world: clubs per division and the full card pool.
import { PLAYER_POOL, COACH_POOL } from '../pool.js';
import * as europeA from './europe-a.js';
import * as europeB from './europe-b.js';
import * as europeC from './europe-c-southam.js';
import * as rest from './rest.js';
import * as squadsA from './squads-a.js';
import * as squadsB from './squads-b.js';
import * as squadsC from './squads-c.js';
import * as squadsD from './squads-d.js';

const REGIONS = [europeA, europeB, europeC, rest];
const SQUAD_FILES = [squadsA, squadsB, squadsC, squadsD];

// Each club's history pool: named cards (any era) it draws its squad and academy players from.
export const CLUB_POOLS = Object.assign({}, ...SQUAD_FILES.map((f) => f.SQUADS || {}));
const SQUAD_CLUB = {};
for (const [clubId, ids] of Object.entries(CLUB_POOLS)) for (const id of ids) SQUAD_CLUB[id] = clubId;

export const CLUBS_BY_DIVISION = Object.assign({}, ...REGIONS.map((r) => r.CLUBS || {}));

// Every collectible player card. poolClub = the club whose history it belongs to (or null).
export const PLAYER_CARDS = [
  ...PLAYER_POOL,
  ...REGIONS.flatMap((r) => r.PLAYERS || []),
  ...SQUAD_FILES.flatMap((f) => f.PLAYERS || []),
].map((p) => ({
  ...p,
  // Stats top out at 95 so all-time greats stay within the card scale.
  att: Math.min(95, p.att),
  def: Math.min(95, p.def),
  phy: Math.min(95, p.phy),
  clubId: undefined,
  poolClub: SQUAD_CLUB[p.id] || null,
}));

export const COACH_CARDS = COACH_POOL;

export const CARD_BY_ID = Object.fromEntries([...PLAYER_CARDS, ...COACH_CARDS].map((c) => [c.id, c]));
