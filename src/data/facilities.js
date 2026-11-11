// Club management areas: ten facilities (levels 0–5) that belong to the club, each raised
// by its own Club card from the Transfer Market. Business areas earn coins every match;
// Sports areas make the team better. Numbers here are the single source for the engine
// (state/club.js) and the Club management screen.

import { SPONSOR_BASE, SEASON_GAMES } from './deals.js';

export const MAX_LEVEL = 5;

// Per-match income tables are multiplied by the division multiplier (data/demo.js).
export const STADIUM_INCOME = [30, 45, 54, 64, 74, 85]; // per home game (pre-v2.3 gate; kept for reference)
export const HOSPITALITY_INCOME = [0, 10, 18, 27, 36, 46]; // per home game
export const STORE_INCOME = [0, 4, 7, 10, 14, 18]; // every match
export const MERCH_MULT = [0.5, 0.9, 1.3, 1.7, 2.1, 2.5]; // × squad popularity × 0.3, every match
export const SPONSOR_NAMES = ['No sponsor', 'Local business', 'Regional brand', 'National brand', 'Major brand', 'Global partner'];
export const MERCH_LINES = ['Replica kits', 'Kits and scarves', 'Lifestyle range', 'Lifestyle and kids', 'Online store', 'Global brand'];

export const COHESION_GAIN = [4, 5, 7, 8, 10, 12]; // per match
export const COHESION_MAX_BONUS = [0.04, 0.05, 0.06, 0.07, 0.08, 0.09]; // at 100 cohesion
export const GYM_DRAIN = [0, 4, 8, 12, 16, 20]; // % slower stamina drain
export const SPA_SHAPE = [0, 3, 6, 9, 12, 15]; // + team shape
export const ANALYTICS_ODDS = [0, 1, 2, 3, 4, 6]; // pack odds points moved from Common upwards

// Card plays per season: 8, +1 at Analytics level 3 and +1 at level 5.
export const CARD_PLAYS_BASE = 8;
export const cardPlayLimit = (facilities) => CARD_PLAYS_BASE + ((facilities?.analytics || 0) >= 3 ? 1 : 0) + ((facilities?.analytics || 0) >= 5 ? 1 : 0);

export const AREAS = {
  stadium: { group: 'business', label: 'Stadium', icon: '🏟', card: 'stadiumEvolution' },
  hospitality: { group: 'business', label: 'Hospitality', icon: '🍽', card: 'hospitality' },
  store: { group: 'business', label: 'Club store', icon: '🏪', card: 'clubStore' },
  merch: { group: 'business', label: 'Merchandise', icon: '👕', card: 'merchExpansion' },
  sponsor: { group: 'business', label: 'Sponsorship', icon: '🤝', card: 'findSponsor' },
  training: { group: 'sports', label: 'Training fields', icon: '🏋', card: 'trainingGround' },
  gym: { group: 'sports', label: 'Gym', icon: '💪', card: 'gymUpgrade' },
  spa: { group: 'sports', label: 'Spa & recovery', icon: '🧖', card: 'spaRecovery' },
  academy: { group: 'sports', label: 'Youth academy', icon: '🏫', card: 'youthAcademy' },
  analytics: { group: 'sports', label: 'Analytics', icon: '📊', card: 'analyticsDept' },
};
export const AREA_IDS = Object.keys(AREAS);
export const AREA_GROUPS = [
  { id: 'business', label: 'Business', ids: AREA_IDS.filter((k) => AREAS[k].group === 'business') },
  { id: 'sports', label: 'Sports', ids: AREA_IDS.filter((k) => AREAS[k].group === 'sports') },
];
export const FACILITY_LABEL = Object.fromEntries(AREA_IDS.map((k) => [k, AREAS[k].label]));

// Fills in every area: old saves had only stadium, merch, training and academy. The new
// areas start a little below the club's existing ones, so a big club stays a big club.
export function fullFacilities(fac = {}) {
  const near = (k) => Math.max(0, (fac[k] || 0) - 2);
  const derived = { hospitality: near('stadium'), store: near('merch'), sponsor: near('merch'), gym: near('training'), spa: near('training'), analytics: near('academy') };
  return Object.fromEntries(AREA_IDS.map((k) => [k, Math.max(0, Math.min(MAX_LEVEL, fac[k] ?? derived[k] ?? 0))]));
}

// Short text of what an area does at a level. m is the division multiplier; academy needs
// the intake tables, passed in by the caller to keep this file free of engine imports.
export function areaEffect(id, level, { m = 1, academy = null } = {}) {
  const c = (v) => Math.round(Math.round(v * m) * 0.8); // as paid: × division, × 0.8 per match since v1.9
  switch (id) {
    case 'stadium': return 'Six parts and a star rating: see the stadium card';
    case 'hospitality': return level ? `Restaurant and boxes ◎ ${c(HOSPITALITY_INCOME[level])} a home game` : 'No restaurant yet';
    case 'store': return level ? `Store sales ◎ ${c(STORE_INCOME[level])} a match` : 'No club store yet';
    case 'merch': return `${MERCH_LINES[level]}: popularity × ${MERCH_MULT[level]} × 0.15 a match, and it sells more shirts`;
    case 'sponsor': return `${level ? SPONSOR_NAMES[level] : 'Local shop'} deals: sponsor offers about ◎ ${Math.round(SPONSOR_BASE[level] * m * 0.8 * SEASON_GAMES)} a season`;
    case 'training': return `Cohesion +${COHESION_GAIN[level]} a match, worth up to +${Math.round(COHESION_MAX_BONUS[level] * 100)}% stats`;
    case 'gym': return level ? `Stamina drains ${GYM_DRAIN[level]}% slower` : 'No gym yet';
    case 'spa': return level ? `+${SPA_SHAPE[level]} team shape` : 'No spa yet';
    case 'academy': return academy ? `${academy.count} academy player${academy.count > 1 ? 's' : ''} a year, up to ${academy.best}` : `Academy level ${level}`;
    case 'analytics': {
      const plays = cardPlayLimit({ analytics: level }) - CARD_PLAYS_BASE;
      return level ? `Pack odds +${ANALYTICS_ODDS[level]} points${plays ? `, +${plays} card play${plays > 1 ? 's' : ''} a season` : ''}` : 'No analysts yet';
    }
    default: return '';
  }
}

// ---------------------------------------------------------------------------
// Building works (v2.2): a level is no longer instant. A project takes 2 + target level
// league matchdays; summer builds finish by the first matchday. One project per area.
export const BUILD_BASE = 2;
export const buildMatchdays = (toLevel) => BUILD_BASE + toLevel;

// Ticket prices (v2.3): the price per fan and how many want a ticket. High earns more per fan
// but fewer come (unless demand is above capacity: then it still sells out) and the fans
// grumble after every home game you don't win. Low fills the stands for less money per fan.
// fans: happiness after a home win / draw / defeat.
export const TICKET_PRICES = {
  low: { label: 'Low', gate: 0.8, demand: 1.2, hospitality: 1, fans: { W: 0.6, D: 0.6, L: 0.6 }, home: 0.01, text: '−20% per fan, +20% demand · happiness +0.6 a home game · +1% team stats at home' },
  normal: { label: 'Normal', gate: 1, demand: 1, hospitality: 1, fans: { W: 0, D: 0, L: 0 }, home: 0, text: 'Standard prices' },
  high: { label: 'High', gate: 1.25, demand: 0.8, hospitality: 1.25, fans: { W: 0, D: -0.8, L: -1.5 }, home: 0, text: '+25% per fan and hospitality, −20% demand · happiness −0.8 after a home draw, −1.5 after a defeat (a win keeps them happy)' },
};
export const TICKET_IDS = Object.keys(TICKET_PRICES);

// Sponsor offers (v2.3) are sized from SPONSOR_BASE in data/deals.js (the Sponsorship area level).

// ---------------------------------------------------------------------------
// The stadium (v2.3): six parts with levels 0–5 (state.stadium.parts) and a star rating.
// The Stadium area's level (facilities.stadium) mirrors the parts' average.
// Capacity = the club's stadium size (fixed per club, state.stadium.size) × SEAT_MULT[seats].
export const STADIUM_PARTS = {
  seats: { label: 'Capacity', icon: '💺', card: 'newStand', weight: 2 },
  lockers: { label: 'Locker rooms', icon: '🚿', card: 'lockerRooms', weight: 1 },
  pitch: { label: 'Pitch', icon: '🌱', card: 'pitchRenewal', weight: 1 },
  access: { label: 'Access & parking', icon: '🚗', card: 'accessParking', weight: 1 },
  lighting: { label: 'Floodlights', icon: '💡', card: 'floodlights', weight: 1 },
  screens: { label: 'Scoreboard & screens', icon: '📺', card: 'bigScreen', weight: 1 },
};
export const PART_IDS = Object.keys(STADIUM_PARTS);
export const SEAT_MULT = [0.6, 0.82, 1, 1.12, 1.22, 1.32];
export const PART_HOME = 0.002; // lockers and pitch: +0.2% team stats at home per level (each)
export const ACCESS_DEMAND = 0.04; // +4% ticket demand per level
export const LIGHT_PRICE = 0.02; // +2% per fan per level (evening kick-offs)
export const SCREEN_MOOD = 0.05; // + happiness after every home game per level
export const HOSPITALITY_WEIGHT = 1; // the boxes count towards the stars too
// Gate per home game = attendance × price per fan, with price per fan =
// GATE_BASE × division multiplier × stars price × floodlights × ticket price / stadium size.
// So a full stadium at size × SEAT_MULT earns about what the old per-level gate did.
export const GATE_BASE = 58;
export const starPrice = (stars) => 0.85 + 0.06 * stars;

// Stars 1–5 in half steps from the weighted average level (seats count double, hospitality once).
// Five stars needs every part (and hospitality) at level 5.
export function stadiumStars(parts = {}, hospitality = 0) {
  let w = 0; let sum = 0;
  for (const id of PART_IDS) { w += STADIUM_PARTS[id].weight; sum += STADIUM_PARTS[id].weight * (parts[id] || 0); }
  w += HOSPITALITY_WEIGHT; sum += HOSPITALITY_WEIGHT * (hospitality || 0);
  return Math.max(1, Math.min(5, Math.floor((1 + 0.8 * (sum / w)) * 2 + 1e-9) / 2));
}
export const partsLevel = (parts = {}) => Math.round(PART_IDS.reduce((a, id) => a + (parts[id] || 0), 0) / PART_IDS.length);

// What a part does at a level (short text for the stadium card).
export function partEffect(id, level, { size = 6000 } = {}) {
  switch (id) {
    case 'seats': return `${seatsFor(size, level).toLocaleString('en')} seats`;
    case 'lockers': return level ? `+${(PART_HOME * 100 * level).toFixed(1)}% team stats at home` : 'Old changing rooms';
    case 'pitch': return level ? `+${(PART_HOME * 100 * level).toFixed(1)}% team stats at home` : 'A bumpy pitch';
    case 'access': return level ? `+${Math.round(ACCESS_DEMAND * 100 * level)}% ticket demand` : 'One road in, no parking';
    case 'lighting': return level ? `+${Math.round(LIGHT_PRICE * 100 * level)}% per fan (evening games)` : 'Daylight kick-offs only';
    case 'screens': return level ? `Happiness +${(SCREEN_MOOD * level).toFixed(2)} a home game` : 'A hand-turned scoreboard';
    default: return '';
  }
}
export const seatsFor = (size, seatsLevel) => Math.round((size * SEAT_MULT[Math.max(0, Math.min(MAX_LEVEL, seatsLevel))]) / 50) * 50;

// A starting stadium from the old single level: a little uneven, so there is something to fix.
export function partsFromLevel(level = 0) {
  const l = Math.max(0, Math.min(MAX_LEVEL, level));
  const d = Math.max(0, l - 1);
  return { seats: l, lockers: l, pitch: l, access: d, lighting: l, screens: d };
}
