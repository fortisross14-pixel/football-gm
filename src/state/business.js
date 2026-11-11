// The club's business side (v2.2): building works, ticket prices, the summer sponsor
// contract and the season-by-season finance history. Pure helpers on the save state,
// used by state/club.js (income, matches, season end) and the Club tab.
//
// Functions named start…/set…/sign… take a state and return a new one ({ state, message,
// success } for the ones the UI shows a toast for). Functions that end in "Into" or are
// marked "mutates" change a state that the caller has already cloned.

import { LEVEL_MULTIPLIER } from '../data/demo.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import { seasonYear } from '../engine/years.js';
import {
  AREAS, MAX_LEVEL, fullFacilities, buildMatchdays, TICKET_PRICES, STEADY_INCOME, SPONSOR_DEALS, SPONSOR_DEAL_IDS, SPONSOR_BRANDS,
  STADIUM_PARTS, SCREEN_MOOD,
} from '../data/facilities.js';
import { partLevel, setPartInto, weakestPart, starsOf, stadiumOf, ensureStadiumInto } from './stadium.js';
import { addHappinessInto } from './fans.js';
import { makeRng } from '../engine/rng.js';
import { pushInbox } from './chronicle.js';

const mult = (state) => LEVEL_MULTIPLIER[DIVISION_BY_ID[state.club?.divisionId]?.level] || 1;
const lvl = (state, key) => Math.max(0, Math.min(MAX_LEVEL, state.facilities?.[key] || 0));
// Business income per match since v1.9 (18 league games a season).
const PACE = 0.8;

// ---------------------------------------------------------------------------
// Building works

// The project under way in an area, or null. A project: { id, area, part, from, to, total, left, summer }.
// The stadium (v2.3) builds by part: one project per part (part null: any stadium project).
export const constructionOf = (state, area, part = null) => (state.construction || []).find((p) => p.area === area && (!part || p.part === part)) || null;
export const constructionList = (state) => state.construction || [];
// "Stadium · Floodlights" or "Gym".
export const projectLabel = (p) => (p.part ? `${AREAS.stadium.label} · ${STADIUM_PARTS[p.part].label}` : AREAS[p.area].label);
export const projectIcon = (p) => (p.part ? STADIUM_PARTS[p.part].icon : AREAS[p.area].icon);

// Queues a project on an already-cloned state (mutates). Returns { message, success }.
// For the stadium, part picks the part (none: the weakest part not already being built).
export function queueConstruction(next, area, levels = 1, part = null) {
  if (!AREAS[area]) return { message: 'Unknown club area.', success: false };
  if (area === 'stadium') {
    part = part || weakestPart(next, (id) => !!constructionOf(next, 'stadium', id));
    if (!part || !STADIUM_PARTS[part]) return { message: 'Every part of the stadium is at max level or being built.', success: false };
  } else part = null;
  const label = projectLabel({ area, part });
  if (constructionOf(next, area, part)) return { message: `${label}: building works are already under way.`, success: false };
  const from = part ? partLevel(next, part) : lvl(next, area);
  if (from >= MAX_LEVEL) return { message: `${label} is already at max level.`, success: false };
  const to = Math.min(MAX_LEVEL, from + Math.max(1, levels));
  const summer = next.phase !== 'season';
  const total = buildMatchdays(to);
  next.nextUid = (next.nextUid || 1) + 1;
  const project = { id: `b${next.nextUid}`, area, ...(part ? { part } : {}), from, to, total, left: total, summer, year: next.season?.year ?? 1 };
  next.construction = [...(next.construction || []), project];
  const when = summer ? 'ready for the first matchday' : `ready in ${total} league matchdays`;
  return { message: `🏗 Building works started: ${label} L${from} → L${to}, ${when}.`, success: true, project };
}

// Starts building works in an area: levels is 1 for most Club cards, 2 for a Legend.
// Returns { state, message, success }. One project per area (per stadium part) at a time.
export function startConstruction(state, area, levels = 1, part = null) {
  const next = structuredClone(state);
  const r = queueConstruction(next, area, levels, part);
  return r.success ? { state: next, message: r.message, success: true, project: r.project } : { state, message: r.message, success: false };
}

function finishProject(next, p) {
  ensureStadiumInto(next);
  const starsBefore = starsOf(next);
  next.facilities = { ...fullFacilities(next.facilities) };
  if (p.part) setPartInto(next, p.part, p.to);
  else next.facilities[p.area] = Math.max(next.facilities[p.area], p.to);
  const label = projectLabel(p);
  pushInbox(next, 'club', `🏗 Construction finished: ${label} L${p.to}`, `${projectIcon(p)} ${label} is now level ${p.to}. The new effect applies from the next match.`);
  const stars = starsOf(next);
  if (stars > starsBefore) {
    const milestone = Math.floor(stars) > Math.floor(starsBefore) && Math.floor(stars) >= 4;
    pushInbox(next, 'club', milestone ? `${'★'.repeat(Math.floor(stars))} A ${Math.floor(stars)}-star stadium` : `🏟 Stadium rating: ${stars} stars`,
      milestone ? (Math.floor(stars) === 5 ? 'Every part of the ground is the best it can be. A five-star stadium: fans pay more for every seat.' : 'The ground is now one of the best in the country. A better stadium means more coins per fan.')
        : `The stadium goes from ${starsBefore} to ${stars} stars: a little more per fan at every home game.`);
  }
}

// One league matchday of work on every project (mutates). With { all: true } every project
// finishes: the builders work through the summer, so nothing is still open on matchday 1.
export function advanceConstructionInto(next, { all = false } = {}) {
  if (!next.construction?.length) return [];
  const done = [];
  const open = [];
  for (const p of next.construction) {
    const left = all ? 0 : p.left - 1;
    if (left <= 0) done.push(p);
    else open.push({ ...p, left });
  }
  next.construction = open;
  for (const p of done) finishProject(next, p);
  return done;
}

// Share of a project done, 0–1 (summer projects show as half way until the season starts).
export const constructionProgress = (p) => (p.summer ? 0.5 : Math.max(0, Math.min(1, (p.total - p.left) / p.total)));

// ---------------------------------------------------------------------------
// Ticket prices

export const ticketOf = (state) => TICKET_PRICES[state.ticketPrice] || TICKET_PRICES.normal;
export function setTicketPrice(state, id) {
  if (!TICKET_PRICES[id] || (state.ticketPrice || 'normal') === id) return state;
  return { ...state, ticketPrice: id };
}

// After a home match: the fans react to the prices (mutates). High prices cost happiness
// after a home draw or defeat; a win keeps them happy. The screens add a little every game.
export function ticketMoodInto(next, isHome, outcome = 'D') {
  if (!isHome || !next.gm?.confidence) return;
  const t = ticketOf(next);
  const v = (t.fans?.[outcome] ?? 0) + SCREEN_MOOD * (stadiumOf(next).parts.screens || 0);
  addHappinessInto(next, v);
}

// ---------------------------------------------------------------------------
// Sponsor contracts

// What a deal pays at today's Sponsorship level and division: { perMatch, perWin, perTrophy }.
export function sponsorTerms(state, type = 'steady') {
  const d = SPONSOR_DEALS[type] || SPONSOR_DEALS.steady;
  const base = Math.round(STEADY_INCOME[lvl(state, 'sponsor')] * mult(state)) * PACE;
  return { perMatch: Math.round(base * d.perMatch), perWin: Math.round(base * d.perWin), perTrophy: Math.round(base * d.perTrophy) };
}

// The contract this season: { type, brand, year, ...terms }. Saves without one have a steady deal.
export function activeSponsor(state) {
  const s = state.sponsor || { type: 'steady', brand: SPONSOR_BRANDS.steady[0], year: state.season?.year ?? 1 };
  return { ...s, ...sponsorTerms(state, s.type) };
}

// The three summer offers (one of each kind), or [] when nothing is on the table.
export const sponsorOffers = (state) => state.sponsorOffers?.offers || [];

// New offers for next season (mutates). Called when the season closes.
export function offerSponsorsInto(next, seed = 1) {
  const rng = makeRng(seed);
  next.sponsorOffers = { year: (next.season?.year ?? 0) + 1, offers: SPONSOR_DEAL_IDS.map((type) => ({ type, brand: rng.pick(SPONSOR_BRANDS[type]) })) };
}

// Signs one of the summer offers. Returns { state, message, success }.
export function signSponsor(state, type) {
  const offer = sponsorOffers(state).find((o) => o.type === type);
  if (!offer) return { state, message: 'No sponsor offer of that kind right now.', success: false };
  if (state.phase !== 'offseason') return { state, message: 'Sponsor contracts are signed in the summer.', success: false };
  const next = structuredClone(state);
  next.sponsor = { type, brand: offer.brand, year: next.sponsorOffers.year };
  next.sponsorOffers = { ...next.sponsorOffers, signed: type };
  const t = sponsorTerms(next, type);
  const pay = [t.perMatch && `◎ ${t.perMatch} a match`, t.perWin && `◎ ${t.perWin} a win`, t.perTrophy && `◎ ${t.perTrophy} a trophy or promotion`].filter(Boolean).join(', ');
  pushInbox(next, 'club', `🤝 Sponsor signed: ${offer.brand}`, `A ${SPONSOR_DEALS[type].label.toLowerCase()} contract for the ${seasonYear(next.sponsor.year)} season: ${pay}.`);
  return { state: next, message: `${offer.brand} signed: ${SPONSOR_DEALS[type].label} contract.`, success: true };
}

// The season starts (mutates): no contract chosen → the steady offer is signed for you.
export function settleSponsorInto(next) {
  const offers = sponsorOffers(next);
  if (!offers.length) return;
  if (!next.sponsorOffers.signed) {
    const steady = offers.find((o) => o.type === 'steady') || offers[0];
    next.sponsor = { type: steady.type, brand: steady.brand, year: next.sponsorOffers.year };
    const t = sponsorTerms(next, steady.type);
    pushInbox(next, 'club', `🤝 Sponsor signed: ${steady.brand}`, `No contract was chosen, so the club took the steady deal: ◎ ${t.perMatch} a match.`);
  }
  next.sponsorOffers = null;
}

// Glory bonus for promotion or the league title, paid when the season closes (mutates).
export function sponsorSeasonBonusInto(next, state, { position, promoted }) {
  const s = activeSponsor(state);
  if (!s.perTrophy || !(position === 1 || promoted)) return 0;
  next.coins += s.perTrophy;
  next.finance = next.finance || { income: {}, spent: {} };
  next.finance.income.Sponsor = (next.finance.income.Sponsor || 0) + s.perTrophy;
  pushInbox(next, 'club', `🏆 Sponsor bonus: ◎ ${s.perTrophy}`, `${s.brand} pay the Glory bonus for ${position === 1 ? 'the league title' : 'promotion'}.`);
  return s.perTrophy;
}

// ---------------------------------------------------------------------------
// Finance history: one compact entry per season (written when the season closes and
// brought up to date with the summer's money when the next one starts).

const HISTORY_MAX = 40;
export function recordFinanceInto(next, year) {
  const fin = next.finance || { income: {}, spent: {} };
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const entry = {
    year, club: next.club?.short || next.club?.name, division: next.club?.division,
    income: { ...fin.income }, spent: { ...fin.spent }, in: sum(fin.income), out: sum(fin.spent), balance: next.coins,
  };
  const list = (next.financeHistory || []).filter((e) => e.year !== year);
  next.financeHistory = [...list, entry].sort((a, b) => a.year - b.year).slice(-HISTORY_MAX);
}

// ---------------------------------------------------------------------------
// Older saves (mutates a shallow copy): fills in the v2.2 fields.
export function migrateBusinessInto(next) {
  if (!Array.isArray(next.construction)) next.construction = [];
  if (!TICKET_PRICES[next.ticketPrice]) next.ticketPrice = 'normal';
  if (!next.sponsor) next.sponsor = { type: 'steady', brand: SPONSOR_BRANDS.steady[0], year: next.season?.year ?? 1 };
  if (next.phase === 'offseason' && !next.sponsorOffers) offerSponsorsInto(next, (next.season?.year || 1) * 97);
  if (!Array.isArray(next.financeHistory)) next.financeHistory = [];
  if (!Array.isArray(next.clubEffects)) next.clubEffects = [];
  return next;
}
