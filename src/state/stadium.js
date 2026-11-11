// The stadium (v2.3): six parts with levels (data/facilities.js STADIUM_PARTS), a star rating,
// a real capacity, and the home gate from ticket demand. Pure helpers on the save state.
//
// state.stadium = { size, parts: { seats, lockers, pitch, access, lighting, screens } }
//   size: the club's stadium size (seats at capacity level 2), fixed per club.
// Functions ending in "Into" change a state the caller has already cloned.

import { LEVEL_MULTIPLIER } from '../data/demo.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import {
  PART_IDS, MAX_LEVEL, SEAT_MULT, PART_HOME, ACCESS_DEMAND, LIGHT_PRICE, GATE_BASE, TICKET_PRICES,
  stadiumStars, starPrice, seatsFor, partsFromLevel, partsLevel,
} from '../data/facilities.js';
import { clubSize } from '../engine/career.js';
import { fansOf } from './fans.js';

// Stadium size by league level, from the smallest to the biggest club of the level
// (× 0.75 … 1.25); the giants play in 82,000-seat bowls once the seats are at level 5.
const SIZE_BASE = { 3: 10000, 2: 18000, 1: 34000 };
const GIANT_SIZE = 62000;
const round500 = (v) => Math.round(v / 500) * 500;

export function stadiumSize(world, clubId) {
  const z = clubSize(world, clubId);
  if (z.giant) return GIANT_SIZE;
  return round500((SIZE_BASE[z.level] || SIZE_BASE[3]) * (0.75 + 0.5 * z.share));
}

// A club's stadium when a GM arrives, from its single Stadium level (clubStart).
export const newStadium = (world, clubId, level) => ({ size: stadiumSize(world, clubId), parts: partsFromLevel(level) });

// The stadium of a state (built from the Stadium level if the state has none yet).
export function stadiumOf(state) {
  if (state.stadium?.parts) return state.stadium;
  return { size: state.world && state.club ? stadiumSize(state.world, state.club.id) : 7500, parts: partsFromLevel(state.facilities?.stadium || 0) };
}
export const partLevel = (state, part) => Math.max(0, Math.min(MAX_LEVEL, stadiumOf(state).parts[part] || 0));
export function ensureStadiumInto(next) {
  if (!next.stadium?.parts) next.stadium = structuredClone(stadiumOf(next));
  return next.stadium;
}
// Raises one part (mutates) and keeps the Stadium area's level as the parts' average.
export function setPartInto(next, part, level) {
  const s = ensureStadiumInto(next);
  s.parts = { ...s.parts, [part]: Math.max(s.parts[part] || 0, Math.min(MAX_LEVEL, level)) };
  next.facilities = { ...(next.facilities || {}), stadium: partsLevel(s.parts) };
}
// The part a "random part" card (Stadium Evolution) or an old call builds: the weakest one.
export function weakestPart(state, skip = () => false) {
  const parts = stadiumOf(state).parts;
  const open = PART_IDS.filter((id) => (parts[id] || 0) < MAX_LEVEL && !skip(id));
  return open.sort((a, b) => (parts[a] || 0) - (parts[b] || 0))[0] || null;
}

export const capacityOf = (state) => { const s = stadiumOf(state); return seatsFor(s.size, s.parts.seats || 0); };
export const starsOf = (state) => stadiumStars(stadiumOf(state).parts, state.facilities?.hospitality || 0);
// Locker rooms and pitch: a little better at home.
export const homeStatBonus = (state) => { const p = stadiumOf(state).parts; return PART_HOME * ((p.lockers || 0) + (p.pitch || 0)); };

// Ticket demand: a share of the local fans, more when they're happy, fewer at high prices.
// 8,000 local fans want about 5,900 tickets at normal mood; 100,000 want 23,600; 2 million, 124,000.
export const DEMAND_K = 42;
export const DEMAND_EXP = 0.55;
export const moodFactor = (happiness) => Math.max(0.5, Math.min(1.4, 0.6 + (0.4 * happiness) / 55));

// One home game. ctx: { derby, competition }. Returns
// { capacity, demand, attendance, soldOut, perFan (coins per fan), gate (coins, before the season pace), stars }.
export function matchdayOf(state, ctx = {}) {
  const s = stadiumOf(state);
  const fans = fansOf(state);
  const ticket = TICKET_PRICES[state.ticketPrice] || TICKET_PRICES.normal;
  const capacity = seatsFor(s.size, s.parts.seats || 0);
  const big = ['continental', 'continental2', 'contsuper', 'cwc'].includes(ctx.competition);
  const demand = Math.round(DEMAND_K * fans.local ** DEMAND_EXP * moodFactor(fans.happiness) * ticket.demand
    * (1 + ACCESS_DEMAND * (s.parts.access || 0)) * (ctx.derby ? 1.25 : 1) * (big ? 1.15 : 1));
  const attendance = Math.min(capacity, demand);
  const stars = stadiumStars(s.parts, state.facilities?.hospitality || 0);
  const m = LEVEL_MULTIPLIER[DIVISION_BY_ID[state.club?.divisionId]?.level] || 1;
  const perFan = (GATE_BASE * m * starPrice(stars) * (1 + LIGHT_PRICE * (s.parts.lighting || 0)) * ticket.gate) / s.size;
  return { capacity, demand, attendance, soldOut: demand >= capacity, perFan, gate: attendance * perFan, stars, fill: attendance / capacity };
}

export { SEAT_MULT };
