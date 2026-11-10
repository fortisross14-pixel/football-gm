// The user's club: squad, coins, inventory, season and off-season.
// Every function takes the state and returns a new one (plus extra info where useful).

import { USER_CLUB, USER_COACHES, START_INVENTORY, LEVEL_MULTIPLIER } from '../data/demo.js';
import { PLAYER_CARDS, COACH_CARDS, CARD_BY_ID, CLUBS_BY_DIVISION, CLUB_POOLS } from '../data/world/index.js';
import { aiOffseason, userAcademyIntake, ACADEMY_COUNT, ACADEMY_MAX_TIER, namedCap } from '../engine/transfers.js';
import { clubStart, START_REPUTATION, START_CONFIDENCE, SACK_LINE, WARNING_LINE, security, matchConfidence, seasonConfidence, carryConfidence, boardObjective, judgeObjective, reputationChanges, weighReputation, applyReputation, jobOffers, CLUB_START, requiredReputation } from '../engine/career.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { BOOST_IDS, BOOSTS, BOOST_PACKS, openBoostPack, drawBoost } from '../data/boosts.js';
import { OFFSEASON_CARDS, OFFSEASON_IDS, MARKET_WEIGHTS, TIERS, tierIndex, cardValue, cardPrice, SIGNING_TIERS, RENAMED_CARDS } from '../data/offseason.js';
import {
  STADIUM_INCOME, HOSPITALITY_INCOME, STORE_INCOME, MERCH_MULT, SPONSOR_INCOME, SPONSOR_NAMES, COHESION_GAIN, COHESION_MAX_BONUS,
  GYM_DRAIN, SPA_SHAPE, ANALYTICS_ODDS, FACILITY_LABEL, fullFacilities, cardPlayLimit,
} from '../data/facilities.js';
import { makeGenericCard, FILLER_RATING, squadStrength } from '../engine/aiTeam.js';
import { makeRng } from '../engine/rng.js';
import { archiveSeason, foldRecords, compactEntry } from '../engine/history.js';
import { ensureGms, updateGms } from '../engine/gms.js';
import { pushInbox, moodNews, newContract } from './chronicle.js';
import { decideAwards } from '../engine/awards.js';
import { foldSeason, recordMove, holders, diffMoves } from '../engine/careers.js';
import { newStats, emptyBook, recordGame as recordStats, recordTitle, coachKey } from '../engine/statsbook.js';
import { styleDistance, clubIdentity } from '../data/philosophies.js';
import { isDerby, derbyName } from '../data/rivals.js';
import { normalizeTactics } from '../engine/tactics.js';
import { RARITIES, TRAITS, POSITIONS, overall, rarityForOverall, autoArrange } from '../engine/cards.js';
import { PACKS, openPack, mergeDuplicate, drawFromPool, MAX_STARS } from '../engine/packs.js';
import { applyCurses, buildWorld, createSeason, playMatchday, goalsFromMatch, standings, removeKeyPlayer, endOfSeason, divisionName, refreshStrengths, userFixture, quickResult } from '../engine/season.js';
import {
  CALENDAR, createCompetitions, prepareSlot, recordGame, quickKnockout, involves, compKey, qualifiers, tablesByStrength, tablesFromSeason, CONTINENT_NAME, CONTINENTS,
} from '../engine/competitions.js';

export const SAVE_VERSION = 3;

export const POOLS = { player: PLAYER_CARDS, coach: COACH_CARDS };
export const POOL_BY_ID = CARD_BY_ID;
const PLAYER_POOL = PLAYER_CARDS;
export const PRIZES = [600, 350, 250, 180, 120, 90, 60, 30];
export const START_DIVISION = 'esp-3';

export { FACILITY_LABEL };
// An area's level, 0 when an older save doesn't have it yet.
const lvl = (state, key) => Math.max(0, Math.min(5, state.facilities?.[key] || 0));

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mult = (state) => LEVEL_MULTIPLIER[DIVISION_BY_ID[state.club.divisionId]?.level] || 1;
const uid = (state) => {
  state.nextUid = (state.nextUid || 1) + 1;
  return `u${state.nextUid}`;
};

// ---------------------------------------------------------------------------
// New game

// Starting squad: the club's named cards plus generic Common players.
// A rookie's squad is thin: tuned with scripts/career-sim.mjs so season 1 is a fight to stay off the bottom.
const START_LEGENDS = 1;
const START_FILLER_DELTA = -1;

function startingSquad(clubId, divisionId, formation, seed) {
  const rng = makeRng(seed);
  const level = DIVISION_BY_ID[divisionId].level;
  // One club legend from the history pool (Uncommon, Rare if needed); the rest are journeymen.
  const pool = (CLUB_POOLS[clubId] || []).filter((id) => POOL_BY_ID[id]);
  const byRarity = (r) => pool.filter((id) => POOL_BY_ID[id].rarity === r).sort(() => rng.next() - 0.5);
  const named = [...byRarity('uncommon'), ...byRarity('rare')].slice(0, START_LEGENDS).map((id) => structuredClone(POOL_BY_ID[id]));
  const used = new Set(named.map((c) => c.name.split(' ').slice(-1)[0]));
  const want = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD'];
  for (const c of named) {
    const i = want.indexOf(c.pos);
    if (i >= 0) want.splice(i, 1); else want.pop();
  }
  const generics = want.map((pos, i) => makeGenericCard(rng, { id: `gen-${clubId}-${i}`, pos, rating: FILLER_RATING[level] + START_FILLER_DELTA, used }));
  const squad = [...named, ...generics];
  const lineup = autoArrange(bestSeven(squad, formation), formation);
  const bench = squad.filter((c) => !lineup.includes(c.id)).map((c) => c.id);
  return { squad, lineup, bench };
}

// The 7 strongest cards that cover a goalkeeper and the formation's outfield shape.
function bestSeven(squad, formation) {
  const [d, m, f] = formation.split('-').map(Number);
  const need = { GK: 1, DEF: d, MID: m, FWD: f };
  const sorted = [...squad].sort((a, b) => overall(b) - overall(a));
  const picked = [];
  for (const c of sorted) if (need[c.pos] > 0 && picked.length < 7) { picked.push(c); need[c.pos] -= 1; }
  for (const c of sorted) if (picked.length < 7 && !picked.includes(c)) picked.push(c);
  return picked;
}

// The three small clubs (level 3, different countries) that offer a rookie GM a first job.
export function starterOffers(seed) {
  const rng = makeRng(seed);
  const divs = DIVISIONS.filter((d) => d.level === 3).sort(() => rng.next() - 0.5);
  const offers = [];
  for (const div of divs) {
    if (offers.length >= 3) break;
    if (offers.some((o) => DIVISION_BY_ID[o.divisionId].code === div.code)) continue;
    // A rookie gets one of the two weakest clubs in a bottom-tier league.
    const weakest = [...(CLUBS_BY_DIVISION[div.id] || [])].sort((a, b) => a.rating - b.rating).slice(0, 2);
    const club = rng.pick(weakest);
    if (club) offers.push({ clubId: club.id, divisionId: div.id, name: club.name, short: club.short, colors: club.colors, division: div.name, legends: (CLUB_POOLS[club.id] || []).length });
  }
  return offers;
}

const findClub = (clubId) => {
  for (const [divId, clubs] of Object.entries(CLUBS_BY_DIVISION)) {
    const c = clubs.find((x) => x.id === clubId);
    if (c) return { club: c, divisionId: divId };
  }
  return null;
};

export function newClubState(seed = 12345, { clubId = USER_CLUB.id, gmName = 'You' } = {}) {
  const found = findClub(clubId) || findClub(USER_CLUB.id);
  const base = { id: found.club.id, name: found.club.name, short: found.club.short, colors: found.club.colors };
  // A random Uncommon, Rare or Epic head coach (never Common, never a Legend).
  const coaches = structuredClone(USER_COACHES);
  const pool = COACH_CARDS.filter((c) => ['uncommon', 'rare', 'epic'].includes(c.rarity));
  if (pool.length) coaches.coach = { ...structuredClone(makeRng(seed + 77).pick(pool)), role: 'coach' };
  const { squad, lineup, bench } = startingSquad(base.id, found.divisionId, coaches.coach.formation, seed);
  const state = {
    version: SAVE_VERSION,
    gmName,
    club: clubInfo(base, found.divisionId),
    coins: 300,
    squad,
    lineup,
    bench,
    coaches,
    inventory: { boosts: { ...START_INVENTORY }, packs: ['bronze'], offseason: [] },
    facilities: fullFacilities({ stadium: 1, merch: 0, training: 1, academy: 0 }),
    cohesion: 50,
    lastLineup: [...lineup],
    activeEvent: null,
    perks: { shape: 0 },
    cardPlays: 0, // management cards played this season (see cardPlayLimit)
    loads: {}, // time on the field per player (see teamShape)
    record: { w: 0, d: 0, l: 0, gf: 0, ga: 0 },
    history: [],
    playerStats: {},
    seasonStats: {},
    stats: newStats(1), // live stats book, every game in the world (engine/statsbook.js)
    archive: [], // one entry per finished season, every league and cup (engine/history.js)
    records: null, // all-time player records folded from the archive
    careerLog: [], // your seasons: club, league, finish, record, trophies, leaders
    hallOfFame: [],
    album: squad.filter((c) => POOL_BY_ID[c.id]).map((c) => c.id),
    trophies: [],
    phase: 'season', // season → seasonEnd → offseason → season
    market: null, // the Transfer Market, open all year: { offers, round, fresh, kind }
    pendingOpen: null,
    nextUid: 1,
    world: null,
    season: null,
    lastSeason: null,
  };
  state.world = buildWorld(CLUBS_BY_DIVISION, CLUB_POOLS, POOL_BY_ID, ownedIds(state), seed + 3);
  state.world.clubs[state.club.id].keyPlayers = [];
  ensureGms(state.world, seed + 5, 1, state.club.id);
  state.gm = { reputation: START_REPUTATION, confidence: { ...START_CONFIDENCE }, objective: null, missedInRow: 0, sacked: false, offers: [], review: null, career: [{ clubId: state.club.id, name: state.club.name, from: 1, to: null }], contract: newContract(1, state.club.level) };
  pushInbox(state, 'career', `Welcome to ${state.club.name}`, `The owners hand you the keys: a ${state.gm.contract.until - state.gm.contract.from + 1}-season contract. Your coach is ${state.coaches.coach.name}. Good luck.`);
  state.qualification = qualifiers(tablesByStrength(state.world));
  state.season = newSeason(state, 1, seed);
  state.market = makeMarket(state, makeRng(seed + 77), 'season');
  setObjective(state);
  return state;
}

// ---------------------------------------------------------------------------
// The season calendar: league matchdays plus cup, continental and Club World Cup rounds.

export function newSeason(state, year, seed) {
  const season = createSeason({ year, world: state.world, seed });
  season.slot = 0;
  season.comps = createCompetitions(state.world, state.qualification, seed + 5);
  return advanceToUser({ ...state, season }, seed + 9).season;
}

// How strong the user's starting 7 is, on the same scale as AI club strength.
export function userStrength(state) {
  const formation = state.coaches.coach?.formation || '2-2-2';
  return squadStrength(state.lineup.map((id) => state.squad.find((c) => c.id === id)), formation);
}

function setObjective(state) {
  if (!state.gm) return;
  state.gm.objective = boardObjective(state.world, state.club.divisionId, state.club.id, userStrength(state));
}

// Plays every round the user isn't part of, stopping at the user's next game (or the end).
function advanceToUser(state, seed) {
  const next = { ...state, season: structuredClone(state.season) };
  const rng = makeRng(seed);
  const { season } = next;
  while (season.slot < CALENDAR.length) {
    const slot = CALENDAR[season.slot];
    if (slot === 'L') break;
    const entries = prepareSlot(season.comps, slot, next.world, rng.int(1, 2 ** 30));
    if (entries.some((e) => involves(e, next.club.id))) break;
    for (const e of entries) {
      const r = quickKnockout(rng, next.world, e, quickResult, POOL_BY_ID);
      recordGame(season.comps, e, r.score, r.pens);
      recordStats(next.stats, { world: next.world, poolById: POOL_BY_ID, comp: compKey(e), homeId: e.game.home, awayId: e.game.away, score: r.score, goals: r.goals, userClubId: next.club.id });
    }
    season.slot += 1;
  }
  return next;
}

// The user's next game: { slot, competition, label, homeId, awayId, isHome, neutral, knockout }
export function nextUserGame(state) {
  const { season } = state;
  if (!season || state.phase !== 'season' || season.slot >= CALENDAR.length) return null;
  const slot = CALENDAR[season.slot];
  if (slot === 'L') {
    const fx = userFixture(season, state.club.divisionId, state.club.id);
    if (!fx) return null;
    return { slot, competition: 'league', label: `League · Matchday ${season.matchday + 1}`, homeId: fx.home, awayId: fx.away, isHome: fx.isHome, neutral: false, knockout: false, opponentId: fx.opponentId };
  }
  const comps = structuredClone(season.comps);
  const entry = prepareSlot(comps, slot, state.world, 1).find((e) => involves(e, state.club.id));
  if (!entry) return null;
  const isHome = entry.game.home === state.club.id;
  return {
    slot, competition: entry.competition, label: entry.label, homeId: entry.game.home, awayId: entry.game.away,
    isHome: isHome && !entry.neutral, neutral: entry.neutral, knockout: entry.knockout, opponentId: isHome ? entry.game.away : entry.game.home,
  };
}

function clubInfo(club, divisionId) {
  const div = DIVISION_BY_ID[divisionId];
  return { ...club, divisionId, level: div.level, division: div.name };
}

export const ownedIds = (state) => [...state.squad.map((c) => c.id), state.coaches.coach?.id, state.coaches.assistant?.id].filter(Boolean);

// ---------------------------------------------------------------------------
// Match setup and effects

export function effectiveCohesion(state) {
  const changed = state.lineup.filter((id) => !state.lastLineup.includes(id)).length;
  return clamp(state.cohesion - changed * 10, cohesionFloor(state), 100);
}

function cohesionFloor(state) {
  return state.activeEvent?.type === 'tacticalContinuity' ? cardValue('tacticalContinuity', state.activeEvent.rarity) : 0;
}

// Team shape from time on the field. Each player's load is his share of the available
// minutes over roughly the last 8 matches (moving average). Leaning on the same players
// (loads near 100%) lowers shape; spreading minutes keeps it high. No injuries, no
// per-player tiredness: one team number. Sports Science adds to it for a season.
const LOAD_KEEP = 0.75; // each match keeps 75% of the old load: ≈ 8-match memory
const LOAD_FREE = 0.65; // up to 65% of the minutes costs nothing
const LOAD_COST = 20; // shape lost per 100% of overload
export const SHAPE_LABELS = [[85, 'Fresh'], [65, 'OK'], [45, 'Tired'], [0, 'Exhausted']];
export const loadOf = (state, id) => state.loads?.[id] ?? 0.5;
export function teamShape(state) {
  let over = 0;
  for (const c of state.squad) over += Math.max(0, loadOf(state, c.id) - LOAD_FREE) * (c.pos === 'GK' ? 0.3 : 1);
  return Math.round(clamp(100 - over * LOAD_COST + (state.perks?.shape || 0) + SPA_SHAPE[lvl(state, 'spa')], 30, 100));
}
export const shapeLabel = (v) => SHAPE_LABELS.find(([min]) => v >= min)[1];
// Shape in the match: starting stamina, and a small penalty when Tired or Exhausted.
export const shapeStamina = (v) => Math.round(75 + 0.25 * v);
export const shapePenalty = (v) => (v < 65 ? -(65 - v) * 0.002 : 0);

export function cohesionBonus(state) {
  return (effectiveCohesion(state) / 100) * COHESION_MAX_BONUS[lvl(state, 'training')];
}

export function seasonMods(state) {
  const mods = { all: cohesionBonus(state) + shapePenalty(teamShape(state)), home: 0, comeback: 0, drain: GYM_DRAIN[lvl(state, 'gym')] / 100, finishing: 0, underdog: 0, cup: 0, continental: 0 };
  const ev = state.activeEvent;
  if (!ev) return mods;
  const v = cardValue(ev.type, ev.rarity);
  switch (ev.type) {
    case 'fortressSeason': mods.home = v / 100; break;
    case 'indomitableSpirit': mods.comeback = v / 100; break;
    case 'underdogMentality': mods.underdog = v / 100; break;
    case 'shootingDrills': mods.finishing = v / 100; break;
    case 'fitnessProgram': mods.drain += v / 100; break;
    case 'cupRun': mods.cup = v / 100; break;
    case 'continentalNights': mods.continental = v / 100; break;
    case 'preseasonCamp':
      if (state.season && state.season.matchday < v) mods.all += OFFSEASON_CARDS.preseasonCamp.bonus[tierIndex(ev.rarity)] / 100;
      break;
    default: break;
  }
  return mods;
}

export function buildUserTeam(state, loadout, isHome) {
  const { club } = state;
  return {
    id: club.id,
    name: club.name,
    short: club.short,
    colors: club.colors,
    formation: state.coaches.coach?.formation || '2-2-2',
    players: state.squad,
    lineup: state.lineup,
    bench: state.bench,
    coach: state.coaches.coach,
    assistant: state.coaches.assistant,
    loadout,
    isAI: false,
    isHome,
    mods: seasonMods(state),
    tactics: state.tactics,
    startStamina: shapeStamina(teamShape(state)),
    eventName: state.activeEvent ? OFFSEASON_CARDS[state.activeEvent.type].name : null,
  };
}

// Popularity: rarity and stars, plus fame earned with goals, awards and trophies.
export function cardPopularity(card) {
  return Math.round(((RARITIES[card.rarity]?.popularity || 0) * (1 + 0.25 * (card.stars || 0)) + (card.fame || 0)) * 10) / 10;
}

export function squadPopularity(state) {
  return state.squad.reduce((sum, c) => sum + cardPopularity(c), 0);
}

const FAME_CAP = 10;
const addFame = (card, v) => { card.fame = Math.min(FAME_CAP, Math.round(((card.fame || 0) + v) * 100) / 100); };

// Money in and out this season, for the Club screen.
function track(state, kind, category, coins) {
  if (!coins) return;
  state.finance = state.finance || { income: {}, spent: {} };
  const book = state.finance[kind];
  book[category] = (book[category] || 0) + coins;
}

const INCOME_CATEGORY = (label) => (
  label.startsWith('Home gate') ? 'Gate' : label.startsWith('Merchandise') ? 'Merchandise' : label.startsWith('Sponsor') || label === 'Shirt sponsor' ? 'Sponsor'
    : label.startsWith('Hospitality') ? 'Hospitality' : label.startsWith('Club store') ? 'Store'
    : ['Trophy prize', 'Finalist prize', 'Qualified for the group stage'].includes(label) ? 'Prizes' : 'Results'
);

// Prize money per result in each competition (league and cup scale with the division).
const RESULT_COINS = {
  league: { win: 60, draw: 25, loss: 10, scaled: true },
  cup: { win: 80, draw: 25, loss: 10, scaled: true },
  continental: { win: 100, draw: 40, loss: 20, scaled: false },
  cwc: { win: 150, draw: 60, loss: 30, scaled: false },
};

// Income from the business areas (data/facilities.js), per match at today's levels.
// homeOnly items are paid at home games only. Labels match the season finance categories.
export function businessIncome(state) {
  const m = mult(state);
  const f = (k) => lvl(state, k);
  let merch = squadPopularity(state) * MERCH_MULT[f('merch')] * 0.3;
  if (state.activeEvent?.type === 'marketingTour') merch *= cardValue('marketingTour', state.activeEvent.rarity) / 100;
  const items = [
    { area: 'stadium', label: `Home gate (stadium L${f('stadium')})`, coins: Math.round(STADIUM_INCOME[f('stadium')] * m), homeOnly: true },
    { area: 'hospitality', label: `Hospitality (L${f('hospitality')})`, coins: Math.round(HOSPITALITY_INCOME[f('hospitality')] * m), homeOnly: true },
    { area: 'store', label: `Club store (L${f('store')})`, coins: Math.round(STORE_INCOME[f('store')] * m) },
    { area: 'merch', label: `Merchandise (L${f('merch')})`, coins: Math.round(merch) },
    { area: 'sponsor', label: `Sponsor · ${SPONSOR_NAMES[f('sponsor')]}`, coins: Math.round(SPONSOR_INCOME[f('sponsor')] * m) },
  ];
  if (state.perks?.shirtSponsor) items.push({ area: null, label: 'Shirt sponsor', coins: state.perks.shirtSponsor }); // older saves
  return items;
}

export function matchRewards(state, match, userSide, game = { competition: 'league' }) {
  const m = mult(state);
  const own = match.score[userSide];
  const conceded = match.score[1 - userSide];
  const winner = match.result.winner;
  const pay = RESULT_COINS[game.competition] || RESULT_COINS.league;
  const k = pay.scaled ? m : 1;
  const items = [];
  const lostOnPens = match.result.shootout && winner !== userSide;
  if (winner === userSide) items.push({ label: match.result.shootout ? 'Win on penalties' : 'Win', coins: pay.win * k });
  else if (winner === null) items.push({ label: 'Draw', coins: pay.draw * k });
  else items.push({ label: lostOnPens ? 'Lost on penalties' : 'Defeat', coins: pay.loss * k });
  if (conceded === 0) items.push({ label: 'Clean sheet', coins: 20 * m });
  if (own >= 3) items.push({ label: '3+ goals', coins: 20 * m });
  for (const it of businessIncome(state)) if (it.coins > 0 && (!it.homeOnly || match.teams[userSide].isHome)) items.push({ label: it.label, coins: it.coins });
  const final = game.label?.endsWith('Final');
  if (game.competition === 'cup' && state.activeEvent?.type === 'cupRun') items[0].coins = Math.round(items[0].coins * 1.5);
  if (winner === userSide && final) {
    const prize = { cup: { coins: 400 * m, pack: 'silver' }, continental: { coins: 1500, pack: 'elite' }, cwc: { coins: 2500, pack: 'elite' } }[game.competition];
    if (prize) items.push({ label: 'Trophy prize', coins: Math.round(prize.coins * (game.competition === 'cup' && state.activeEvent?.type === 'cupRun' ? 1.5 : 1)) });
  } else if (final && game.competition === 'continental') items.push({ label: 'Finalist prize', coins: 500 });
  if (game.label?.endsWith('Qualifying') && winner === userSide) items.push({ label: 'Qualified for the group stage', coins: 150 });
  // Derby day: double revenue from the game itself (trophy prizes aside).
  const oppId = match.teams[1 - userSide].id;
  if (isDerby(state.club.id, oppId)) {
    const base = items.filter((i) => !/prize|Qualified/i.test(i.label)).reduce((s, i) => s + i.coins, 0);
    items.push({ label: `Derby day · ${derbyName(state.club.id, oppId)}`, coins: base });
  }
  return { items, total: items.reduce((s, i) => s + i.coins, 0) };
}

// Applies a finished league match: coins, record, stats, wear, retirements, cohesion, table.
export function applyMatch(state, match, userSide, opponent, rewards, seed, game = null) {
  const next = structuredClone(state);
  const team = match.teams[userSide];
  const own = match.score[userSide];
  const conceded = match.score[1 - userSide];
  const winner = match.result.winner;

  next.coins += rewards.total;
  for (const item of rewards.items) track(next, 'income', INCOME_CATEGORY(item.label), item.coins);
  if (winner === userSide) next.record.w += 1;
  else if (winner === null) next.record.d += 1;
  else next.record.l += 1;
  next.record.gf += own;
  next.record.ga += conceded;

  // Played at least one boost? One free random boost card replaces it (only one, however many you played).
  let boostReward = null;
  if (team.boostsUsed.length > 0) {
    boostReward = drawBoost(makeRng(seed + 101));
  }
  for (const boostId of team.boostsUsed) {
    next.inventory.boosts[boostId] = Math.max(0, (next.inventory.boosts[boostId] || 0) - 1);
  }

  // Cohesion
  const gain = COHESION_GAIN[lvl(next, 'training')];
  next.cohesion = clamp(effectiveCohesion(state) + gain, cohesionFloor(state), 100);
  next.lastLineup = [...state.lineup];
  // Time on the field: share of this match's minutes for every squad player.
  next.loads = { ...(next.loads || {}) };
  for (const c of next.squad) {
    const p = team.players[c.id];
    const share = p && p.enteredAt !== null ? Math.min(1, ((p.leftAt ?? 90) - p.enteredAt) / 90) : 0;
    next.loads[c.id] = Math.round((loadOf(next, c.id) * LOAD_KEEP + share * (1 - LOAD_KEEP)) * 1000) / 1000;
  }

  const appeared = match.result.appeared[userSide];
  const motmId = match.result.motm?.side === userSide ? match.result.motm.playerId : null;
  const retired = [];
  for (const id of appeared) {
    const p = team.players[id];
    const cleanSheet = p.card.pos === 'GK' && conceded === 0 && (p.minutes ?? 90) >= 45;
    next.seasonStats = next.seasonStats || {};
    for (const book of [next.playerStats, next.seasonStats]) {
      const s = book[id] || { apps: 0, goals: 0, assists: 0, motm: 0, ratingSum: 0, cs: 0 };
      s.name = p.card.name;
      s.pos = p.card.pos;
      s.rarity = p.card.rarity;
      s.apps += 1;
      s.goals += p.goals;
      s.assists += p.assists;
      s.ratingSum += p.rating || 6;
      s.cs = (s.cs || 0) + (cleanSheet ? 1 : 0);
      if (id === motmId) s.motm += 1;
      book[id] = s;
    }
    const card = next.squad.find((c) => c.id === id);
    if (card) addFame(card, p.goals * 0.15 + p.assists * 0.05 + (id === motmId ? 0.4 : 0));
    if (card && card.matchesLeft != null) {
      card.matchesLeft -= 1;
      if (card.matchesLeft <= 0) retired.push(card);
    }
  }

  const rng = makeRng(seed);
  for (const card of retired) {
    next.hallOfFame.push({ card, stats: next.playerStats[card.id], season: next.season?.year });
    logMove(next, card.id, next.club.id, null, 'x');
    if (next.world) next.world.resting = { ...(next.world.resting || {}), [card.id]: 3 };
    const replacement = academyPlayer(next, rng, card.pos);
    replaceInSquad(next, card.id, replacement);
  }

  const retiredCoaches = [];
  for (const role of ['coach', 'assistant']) {
    const coach = next.coaches[role];
    if (coach?.matchesLeft != null) {
      coach.matchesLeft -= 1;
      if (coach.matchesLeft <= 0) {
        retiredCoaches.push(coach);
        next.hallOfFame.push({ card: coach, stats: null, season: next.season?.year });
        next.coaches[role] = genericCoach(next, role);
      }
    }
  }
  if (retiredCoaches.some((c) => c.role === 'coach' || c === state.coaches.coach)) {
    next.lineup = autoArrange(next.lineup.map((id) => next.squad.find((c) => c.id === id)), next.coaches.coach.formation);
  }

  next.history.unshift({
    opponentId: opponent.id,
    opponent: opponent.name,
    comp: !game || game.competition === 'league' ? { type: 'league', id: next.club.divisionId }
      : game.competition === 'cup' ? { type: 'cup', id: DIVISION_BY_ID[next.club.divisionId].code }
        : game.competition === 'continental' ? { type: 'cont', id: DIVISION_BY_ID[next.club.divisionId].continent } : { type: 'cwc', id: 'cwc' },
    derby: isDerby(next.club.id, opponent.id),
    opponentShort: opponent.short,
    score: [own, conceded],
    shootout: null,
    outcome: winner === userSide ? 'W' : winner === null ? 'D' : 'L',
    competition: !game || game.competition === 'league' ? `MD ${(next.season?.matchday ?? 0) + 1}` : game.label.split(' · ')[0],
    venue: team.isHome ? 'H' : 'A',
  });
  next.history = next.history.slice(0, 30);

  // Record the result, play everyone else's games in this round, then move to the user's next game.
  if (next.season) {
    const [homeId, awayId] = userSide === 0 ? [team.id, match.teams[1].id] : [match.teams[0].id, team.id];
    const slot = CALENDAR[next.season.slot];
    next.stats = next.stats || newStats(next.season.year);
    // Your game in the live stats book, with the real ratings and clean sheets.
    const lines = match.result.appeared[userSide].map((id) => {
      const p = team.players[id];
      return { id, name: p.card.name, pos: p.card.pos, goals: p.goals, rating: p.rating || 6, cs: p.card.pos === 'GK' && conceded === 0 && (p.minutes ?? 90) >= 45, motm: id === motmId };
    });
    const statsArgs = { world: next.world, poolById: POOL_BY_ID, homeId, awayId, score: match.score, goals: goalsFromMatch(match), detail: { side: userSide, lines }, userClubId: next.club.id, userName: next.coaches.coach?.name || next.gmName || 'You' };
    if (slot === 'L') {
      recordStats(next.stats, { ...statsArgs, comp: `L:${next.club.divisionId}` });
      const userGame = { divisionId: next.club.divisionId, homeId, awayId, score: match.score, goals: goalsFromMatch(match) };
      next.season = playMatchday(next.season, next.world, userGame, POOL_BY_ID, seed + 7, next.stats, next.club.id);
    } else {
      const rng = makeRng(seed + 7);
      const entries = prepareSlot(next.season.comps, slot, next.world, 1);
      for (const e of entries) {
        if (involves(e, next.club.id)) {
          const pens = match.shootout ? [...match.shootout.score] : null;
          recordGame(next.season.comps, e, match.score, pens);
          recordStats(next.stats, { ...statsArgs, comp: compKey(e) });
          awardTrophy(next, e);
        } else {
          const r = quickKnockout(rng, next.world, e, quickResult, POOL_BY_ID);
          recordGame(next.season.comps, e, r.score, r.pens);
          recordStats(next.stats, { world: next.world, poolById: POOL_BY_ID, comp: compKey(e), homeId: e.game.home, awayId: e.game.away, score: r.score, goals: r.goals, userClubId: next.club.id });
        }
      }
    }
    next.season.slot += 1;
    const advanced = advanceToUser(next, seed + 13);
    next.season = advanced.season;
    if (next.season.slot >= CALENDAR.length) next.phase = 'seasonEnd';
  }
  if (boostReward) next.inventory.boosts[boostReward] = (next.inventory.boosts[boostReward] || 0) + 1;
  refreshMarket(next, seed + 17);
  if (next.gm && next.season) {
    const competition = game?.competition || 'league';
    const pos = standings(next.season, next.club.divisionId).findIndex((r) => r.id === next.club.id) + 1;
    const trophyNow = (next.season.userTrophies || []).length > (state.season?.userTrophies || []).length;
    const moodBefore = { ...(next.gm.confidence || {}) };
    next.gm.confidence = matchConfidence(next.gm.confidence, {
      outcome: winner === userSide ? 'W' : winner === null ? 'D' : 'L', gf: own, ga: conceded, competition, pos,
      derby: isDerby(next.club.id, opponent.id),
      styleDist: styleDistance(normalizeTactics(state.tactics), clubIdentity(next.world.clubs[next.club.id])),
      target: next.gm.objective?.target, eliminated: !!game?.knockout && winner !== userSide && !trophyNow, trophy: trophyNow, level: next.club.level,
    });
    moodNews(moodBefore, next.gm.confidence, next);
    if (isDerby(next.club.id, opponent.id)) {
      const w = winner === userSide; const d = winner === null;
      pushInbox(next, 'match', w ? `Derby won: ${own}–${conceded} against ${opponent.name}` : d ? `Derby draw with ${opponent.name}` : `Derby lost to ${opponent.name}`,
        w ? 'The city is yours this week. The fans will remember this one.' : d ? 'Honours even. Nobody is happy, nobody is sad.' : 'A painful afternoon. The fans expect a reaction next time.');
    }
  }
  for (const c of [...retired, ...retiredCoaches]) pushInbox(next, 'squad', `${c.name} retires`, `${c.name} has played his last match and joins your Hall of Fame.`);
  return { state: next, retired: [...retired, ...retiredCoaches], boostReward };
}

// Silverware: cup, continental and Club World Cup wins go in the cabinet with a reward pack.
function awardTrophy(next, entry) {
  const comps = next.season.comps;
  const won = (id) => id === next.club.id;
  let trophy = null;
  if (entry.comp === 'cup' && won(comps.cups[entry.key].winner)) trophy = { competition: `${comps.cups[entry.key].country} Cup`, packs: ['silver'] };
  if (entry.comp === 'cont' && won(comps.continental[entry.key].winner)) trophy = { competition: CONTINENT_NAME[entry.key], packs: ['elite'] };
  if (entry.comp === 'cwc' && won(comps.cwc.winner)) trophy = { competition: 'Club World Cup', packs: ['elite', 'elite'] };
  if (!trophy) return;
  next.trophies.push({ season: next.season.year, competition: trophy.competition, position: 1, champion: next.club.name });
  next.inventory.packs.push(...trophy.packs);
  for (const c of next.squad) addFame(c, 1.5);
  next.season.userTrophies = [...(next.season.userTrophies || []), trophy.competition];
  pushInbox(next, 'title', `🏆 You won the ${trophy.competition}!`, `A night to remember for ${next.club.name}. Reward: ${trophy.packs.length} ${trophy.packs.join(' and ')} pack${trophy.packs.length > 1 ? 's' : ''} and a fame boost for the whole squad.`);
}

function academyPlayer(state, rng, pos) {
  const card = makeGenericCard(rng, { id: `academy-${uid(state)}`, pos, rating: 48 + 2 * lvl(state, 'academy'), rarity: 'academy' });
  card.matchesLeft = null;
  return card;
}

function genericCoach(state, role) {
  return { id: `coach-${uid(state)}`, name: 'Interim coach', role, rarity: 'academy', formation: '2-2-2', passive: null, matchesLeft: null };
}

function replaceInSquad(state, oldId, card) {
  state.squad = state.squad.map((c) => (c.id === oldId ? card : c));
  state.lineup = state.lineup.map((id) => (id === oldId ? card.id : id));
  state.bench = state.bench.map((id) => (id === oldId ? card.id : id));
}

// ---------------------------------------------------------------------------
// Shop

export function buyPack(state, packId, seed) {
  const pack = PACKS[packId];
  if (state.coins < pack.price || state.pendingOpen) return state;
  const next = structuredClone(state);
  next.coins -= pack.price;
  track(next, 'spent', 'Packs', pack.price);
  return startOpening(next, packId, seed);
}

export function openOwnedPack(state, index, seed) {
  if (state.pendingOpen) return state;
  const next = structuredClone(state);
  const [packId] = next.inventory.packs.splice(index, 1);
  return startOpening(next, packId, seed);
}

function startOpening(next, packId, seed) {
  const { cards } = openPack(packId, seed, POOLS, packShift(next));
  next.pendingOpen = { source: PACKS[packId].name, packId, cards, index: 0 };
  return next;
}

// Pack odds points moved from Common to higher rarities: Scouting Network plus Analytics.
export function packShift(state) {
  const ev = state.activeEvent?.type === 'scoutingNetwork' ? cardValue('scoutingNetwork', state.activeEvent.rarity) : 0;
  return ev + ANALYTICS_ODDS[lvl(state, 'analytics')];
}

// Boosts come in sealed packs: you don't choose which ones.
export function buyBoostPack(state, packId, seed) {
  const pack = BOOST_PACKS[packId];
  if (!pack || state.coins < pack.price) return { state, got: [] };
  const next = structuredClone(state);
  next.coins -= pack.price;
  track(next, 'spent', 'Boosts', pack.price);
  const got = openBoostPack(makeRng(seed), packId);
  for (const id of got) next.inventory.boosts[id] = (next.inventory.boosts[id] || 0) + 1;
  return { state: next, got };
}

// ---------------------------------------------------------------------------
// Keep / merge / discard for any new card (packs, signings, academy)

export const isCoach = (card) => card.role === 'coach' || card.role === 'assistant';

export function pendingCard(state) {
  const p = state.pendingOpen;
  return p ? p.cards[p.index] : null;
}

export function duplicateOf(state, card) {
  if (isCoach(card)) return ['coach', 'assistant'].map((r) => state.coaches[r]).find((c) => c?.id === card.id) || null;
  return state.squad.find((c) => c.id === card.id) || null;
}

const quickSell = (card) => RARITIES[card.rarity]?.quickSell || 0;

function advancePending(next) {
  next.pendingOpen.index += 1;
  if (next.pendingOpen.index >= next.pendingOpen.cards.length) next.pendingOpen = null;
}

// For a player: replaceId = the squad card to release. For a coach: role = 'coach' | 'assistant'.
export function keepPending(state, { replaceId, role }) {
  const card = pendingCard(state);
  if (!card || duplicateOf(state, card)) return state;
  const next = structuredClone(state);
  const fresh = { ...structuredClone(card), stars: card.stars || 0 };
  if (isCoach(card)) {
    const r = role || 'coach';
    const old = next.coaches[r];
    next.coins += old ? quickSell(old) : 0;
    track(next, 'income', 'Card sales', old ? quickSell(old) : 0);
    next.coaches[r] = { ...fresh, role: r };
    if (r === 'coach') next.lineup = autoArrange(next.lineup.map((id) => next.squad.find((c) => c.id === id)), fresh.formation);
  } else {
    const old = next.squad.find((c) => c.id === replaceId);
    if (!old) return state;
    next.coins += quickSell(old);
    track(next, 'income', 'Card sales', quickSell(old));
    replaceInSquad(next, replaceId, fresh);
    logMove(next, card.id, holderOf(state, card.id)?.id || null, next.club.id, sourceMove(state.pendingOpen.source));
    logMove(next, old.id, next.club.id, null, 'r');
    pushInbox(next, 'squad', `${card.name} signs`, `${card.name} (${card.pos}, ${RARITIES[card.rarity]?.label || ''}) joins from ${state.pendingOpen.source}. ${old.name} leaves the club.`);
  }
  if (POOL_BY_ID[card.id] && !next.album.includes(card.id)) next.album.push(card.id);
  removeFromRivals(next, card.id);
  advancePending(next);
  return next;
}

export function mergePending(state) {
  const card = pendingCard(state);
  const dup = card && duplicateOf(state, card);
  if (!dup) return state;
  const merged = mergeDuplicate(dup);
  if (!merged) return state;
  const next = structuredClone(state);
  if (isCoach(card)) {
    const role = next.coaches.coach?.id === dup.id ? 'coach' : 'assistant';
    next.coaches[role] = { ...merged, role };
  } else {
    next.squad = next.squad.map((c) => (c.id === dup.id ? merged : c));
  }
  advancePending(next);
  return next;
}

export function discardPending(state) {
  const card = pendingCard(state);
  if (!card) return state;
  const next = structuredClone(state);
  next.coins += quickSell(card);
  track(next, 'income', 'Card sales', quickSell(card));
  if (POOL_BY_ID[card.id] && !next.album.includes(card.id)) next.album.push(card.id);
  advancePending(next);
  return next;
}

function removeFromRivals(next, cardId) {
  if (next.world) next.world = removeKeyPlayer(next.world, cardId, POOL_BY_ID);
}

// Quick-sells the Common cards waiting to be decided (packs show the best card last).
export function discardCommons(state) {
  let next = state;
  for (let guard = 0; guard < 10; guard += 1) {
    const card = pendingCard(next);
    if (!card || !['common', 'academy'].includes(card.rarity) || canMerge(next, card)) break;
    next = discardPending(next);
  }
  return next;
}

export const canMerge = (state, card) => {
  const dup = duplicateOf(state, card);
  return !!dup && (dup.stars || 0) < MAX_STARS;
};

// ---------------------------------------------------------------------------
// Season end and off-season

export function seasonSummary(state) {
  const divId = state.club.divisionId;
  const div = DIVISION_BY_ID[divId];
  const table = standings(state.season, divId);
  const position = table.findIndex((r) => r.id === state.club.id) + 1;
  const prize = (PRIZES[position - 1] || 0) * mult(state);
  const upper = DIVISIONS.find((d) => d.code === div.code && d.tier === div.tier - 1);
  const lower = DIVISIONS.find((d) => d.code === div.code && d.tier === div.tier + 1);
  const promoted = position === 1 && !!upper;
  const relegated = position === table.length && !!lower;
  const packs = position === 1 ? ['gold'] : position <= 3 ? ['silver'] : [];
  if (promoted) packs.push('silver');
  return { table, position, prize, packs, promoted, relegated, upper, lower, division: div };
}

// The keeper named in the history book for a club's Golden Glove.
function keeperOf(state, clubId) {
  if (clubId === state.club.id) {
    const gk = state.lineup.map((id) => state.squad.find((c) => c.id === id)).find((c) => c?.pos === 'GK');
    return gk && !gk.generic ? { id: gk.id, name: gk.name } : (gk ? { id: null, name: gk.name } : null);
  }
  const club = state.world.clubs[clubId];
  const gk = (club?.keyPlayers || []).map((id) => POOL_BY_ID[id]).find((c) => c?.pos === 'GK');
  return gk ? { id: gk.id, name: gk.name } : null;
}

// Your club's season leaders by category.
export const jobSecurity = (state) => security(state.gm?.confidence);
export { SACK_LINE };

export function seasonLeaders(stats) {
  const list = Object.entries(stats).map(([id, s]) => ({ id, ...s }));
  const top = (key) => {
    const best = [...list].sort((a, b) => (b[key] || 0) - (a[key] || 0) || b.apps - a.apps)[0];
    return best && best[key] > 0 ? { id: best.id, name: best.name, value: best[key] } : null;
  };
  const rated = list.filter((s) => s.apps >= 5).sort((a, b) => b.ratingSum / b.apps - a.ratingSum / a.apps)[0];
  return {
    goals: top('goals'), assists: top('assists'), motm: top('motm'), cs: top('cs'),
    rating: rated ? { id: rated.id, name: rated.name, value: Math.round((rated.ratingSum / rated.apps) * 100) / 100 } : null,
  };
}

export function closeSeason(state, seed) {
  if (state.phase !== 'seasonEnd') return state;
  const next = structuredClone(state);
  const { position, prize, packs, table } = seasonSummary(state);
  track(next, 'income', 'Prizes', prize);
  if (position === 1) for (const c of next.squad) addFame(c, 1);
  // Next season's continental places come from this season's final tables.
  const final = tablesFromSeason(state.season);
  next.qualification = qualifiers(final.tables, final.points);
  next.coins += prize;
  next.inventory.packs.push(...packs);
  const champion = next.world.clubs[table[0].id];
  next.trophies.push({ season: next.season.year, competition: state.club.division, position, champion: champion.name });
  // The history book: every league and cup this season, plus your own season.
  const entry = archiveSeason(state.season, { gkOf: (clubId) => keeperOf(state, clubId), known: (id) => !!CARD_BY_ID[id] });
  next.records = foldRecords(next.records, entry, (id) => !!CARD_BY_ID[id]);
  next.archive = [...(next.archive || []), compactEntry(entry)];
  ensureGms(next.world, seed + 5, state.season.year, state.club.id);
  // Coaches' titles in the stats book, then a fresh season page.
  next.stats = next.stats || newStats(state.season.year);
  const titleTo = (clubId) => clubId && recordTitle(next.stats, coachKey(next.world, clubId, state.club.id), clubId === state.club.id ? (state.coaches.coach?.name || state.gmName || 'You') : (next.world.gms?.[clubId]?.name || 'Manager'), clubId);
  for (const lg of Object.values(entry.leagues)) titleTo(lg.table[0][0]);
  for (const c of [...Object.values(entry.cups), ...Object.values(entry.continental), entry.cwc]) titleTo(c?.winner);
  // The four yearly awards, from this season's stats and trophies.
  const leftOf = (id) => {
    const own = state.squad.find((c) => c.id === id);
    if (own) return own.matchesLeft ?? null;
    return next.world.cardLeft?.[id] ?? POOL_BY_ID[id]?.matchesLeft ?? 0;
  };
  const awards = decideAwards(next.stats.season, entry, { year: state.season.year, matchesLeftOf: leftOf });
  next.awards = [...(next.awards || []), awards];
  for (const [k, label] of [['best', 'Best Player'], ['scorer', 'Top Scorer'], ['gk', 'Best Goalkeeper'], ['young', 'Best Young Player']]) {
    const a = awards[k];
    if (a && next.squad.some((c) => c.id === a.id)) pushInbox(next, 'award', `${a.name} is the ${label} of season ${state.season.year}`, 'One of yours takes a yearly award.');
  }
  for (const a of [awards.best, awards.gk, awards.young, awards.scorer]) {
    const card = a && next.squad.find((c) => c.id === a.id);
    if (card) addFame(card, 2);
  }
  // Careers: every player's and manager's season, before the season page resets.
  const known = (id) => !!CARD_BY_ID[id];
  if (!next.careers && next.stats.lastSeason && next.archive.length > 1) {
    const y = state.season.year - 1; // older saves: last season is still in the book
    foldSeason(next, next.stats.lastSeason, { year: y, awards: (next.awards || []).find((a) => a.year === y), entry: next.archive.find((e) => e.year === y), known });
  }
  foldSeason(next, next.stats.season, { year: state.season.year, awards, entry, known });
  next.stats.lastSeason = next.stats.season;
  next.stats.season = emptyBook();
  next.stats.year = state.season.year + 1;
  updateGms(next.world, { archiveEntry: entry, seed: seed + 6, userClubId: state.club.id, year: state.season.year });
  next.careerLog = [...(next.careerLog || []), {
    year: state.season.year, clubId: state.club.id, divId: state.club.divisionId, position,
    record: { ...state.record }, trophies: [...(state.season.userTrophies || []), ...(position === 1 ? [state.club.division] : [])],
    leaders: seasonLeaders(state.seasonStats || {}),
  }];
  const end = endOfSeason(next.season, next.world, POOL_BY_ID);
  // Every AI club: wear and retirement, academy, signings.
  const off = aiOffseason(end.world, {
    pools: CLUB_POOLS, poolById: POOL_BY_ID, allCards: PLAYER_CARDS, userIds: ownedIds(next), seed: seed + 11,
    countryOf: (divId) => DIVISION_BY_ID[divId].code, userClubId: next.club.id,
  });
  next.world = off.world;
  refreshStrengths(next.world, POOL_BY_ID);
  applyCurses(next.world, next.houseRules?.cursed || [], POOL_BY_ID);
  // Every named card that changed club this summer, in the career log.
  const squadIds = next.squad.map((c) => c.id);
  next.moves = diffMoves(next.moves || {}, holders(end.world, next.club.id, squadIds), holders(next.world, next.club.id, squadIds), state.season.year + 1, (id, from, to) => {
    if (to) return off.joined?.[id] === 'academy' ? 'a' : 's';
    return next.world.resting?.[id] && !end.world.resting?.[id] ? 'x' : 'r';
  });
  const userMove = end.moves.find((m) => m.clubId === next.club.id) || null;
  next.club = clubInfo(next.club, next.world.clubs[next.club.id].divisionId);
  next.lastSeason = {
    year: next.season.year,
    position,
    division: state.club.division,
    userMove,
    champions: Object.fromEntries(Object.entries(end.champions).map(([d, id]) => [d, next.world.clubs[id].name])),
    moves: end.moves.map((m) => ({ ...m, name: next.world.clubs[m.clubId].name, fromName: divisionName(m.from), toName: divisionName(m.to) })),
    news: off.news.slice(0, 30),
    cups: Object.fromEntries(Object.entries(state.season.comps.cups).map(([code, c]) => [code, c.winner ? next.world.clubs[c.winner].name : null])),
    continental: Object.fromEntries(CONTINENTS.map((k) => [k, state.season.comps.continental[k].winner ? next.world.clubs[state.season.comps.continental[k].winner].name : null])),
    cwc: state.season.comps.cwc?.winner ? next.world.clubs[state.season.comps.cwc.winner].name : null,
    userTrophies: state.season.userTrophies || [],
  };
  // Board review: objective, reputation, and job offers (or the sack).
  if (next.gm) {
    const summary = seasonSummary(state);
    const objective = state.gm.objective || { target: 8, text: 'Finish the season' };
    const verdict = judgeObjective(objective, position);
    const items = weighReputation(reputationChanges({ verdict, promoted: summary.promoted, leagueTitle: position === 1, trophies: state.season.userTrophies || [] }), state.club.level, next.gm.reputation);
    const before = next.gm.reputation;
    next.gm.missedInRow = verdict === 'missed' ? next.gm.missedInRow + 1 : 0;
    next.gm.confidence = seasonConfidence(next.gm.confidence, verdict, summary.promoted);
    next.gm.securityEnd = security(next.gm.confidence);
    // A first season at a club is a free pass: the owners give a new manager time.
    const stint = next.gm.career?.[next.gm.career.length - 1];
    const firstSeason = !stint || state.season.year <= stint.from;
    next.gm.sacked = !firstSeason && (next.gm.securityEnd < SACK_LINE || (next.gm.missedInRow >= 2 && next.gm.securityEnd < WARNING_LINE));
    // Contract: renewed at expiry if the owners are reasonably happy; otherwise you're out of contract.
    next.gm.contract = next.gm.contract || newContract(stint?.from || 1, state.club.level);
    if (!next.gm.sacked && next.gm.contract.until <= state.season.year) {
      if (verdict !== 'missed' || next.gm.securityEnd >= 35) {
        next.gm.contract = { from: next.gm.contract.from, until: state.season.year + 2 };
        pushInbox(next, 'career', 'Contract extended', `The owners extend your contract until the end of season ${state.season.year + 2}.`);
      } else {
        next.gm.sacked = true;
        next.gm.outOfContract = true;
        pushInbox(next, 'career', 'Contract not renewed', 'The owners let your contract run out. Three clubs have called about you: pick one in Career.');
      }
    }
    if (next.gm.sacked && !next.gm.outOfContract) {
      items.push({ label: 'Sacked by the board', value: -15 });
      pushInbox(next, 'career', 'You have been sacked', 'The owners have decided to make a change. Three clubs have already called: pick one in Career.');
    }
    next.gm.reputation = applyReputation(before, items);
    next.gm.review = { season: state.season.year, objective, position, verdict, items, before, after: next.gm.reputation, sacked: next.gm.sacked };
    pushInbox(next, 'board', `Season ${state.season.year} review: objective ${verdict}`, `${objective.text}: you finished ${position}${['th', 'st', 'nd', 'rd'][position % 10 > 3 || [11, 12, 13].includes(position % 100) ? 0 : position % 10]}. Reputation ${before} → ${next.gm.reputation}.`);
    if (position === 1) pushInbox(next, 'title', `🏆 Champions of ${state.club.division}!`, `${state.club.name} win the league. The whole city is out in the streets.`);
    next.gm.searched = false;
    next.gm.offers = jobOffers(next.world, {
      passive: !next.gm.sacked,
      reputation: next.gm.reputation, currentClubId: next.club.id, sacked: next.gm.sacked, good: verdict !== 'missed', seed: seed + 41,
    });
  }
  // Your academy intake: club legends where possible, waiting for Keep/Discard.
  const intake = userAcademyIntake(next.world, {
    level: lvl(next, 'academy'), clubId: next.club.id, nation: DIVISION_BY_ID[next.club.divisionId].code,
    pools: CLUB_POOLS, poolById: POOL_BY_ID, allCards: PLAYER_CARDS, userIds: ownedIds(next), seed: seed + 23,
  });
  const rngYouth = makeRng(seed + 31);
  const cards = intake.map((c) => (c.fallbackTier !== undefined ? youthPlayer(next, rngYouth, rngYouth.pick(['DEF', 'MID', 'FWD']), c.fallbackTier) : c));
  if (cards.length) next.pendingOpen = { source: 'Academy intake', cards, index: 0 };
  // One free off-season card as a season reward.
  const rng = makeRng(seed);
  next.inventory.offseason.push(randomOffseasonCard(next, rng));
  next.activeEvent = null;
  next.perks = { shape: 0 };
  next.cardPlays = 0; // the summer opens next season's card plays
  next.phase = 'offseason';
  next.market = makeMarket(next, rng, 'summer');
  return next;
}

function rollRarity(rng) {
  const total = MARKET_WEIGHTS.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < MARKET_WEIGHTS.length; i += 1) {
    roll -= MARKET_WEIGHTS[i];
    if (roll < 0) return TIERS[i];
  }
  return TIERS[0];
}

// An area card is only offered at a rarity that can still raise that area.
const canRaise = (state, type, rarity) => {
  const def = OFFSEASON_CARDS[type];
  if (!def.facility) return true;
  const level = lvl(state, def.facility);
  const t = tierIndex(rarity);
  return level < 5 && (t === 4 || level < def.values[t]);
};

function randomOffseasonCard(state, rng, group = null) {
  const types = OFFSEASON_IDS.filter((id) => (!group || OFFSEASON_CARDS[id].group === group) && !(OFFSEASON_CARDS[id].summerOnly && state.phase !== 'offseason'));
  let card = { uid: uid(state), type: rng.pick(types), rarity: rollRarity(rng) };
  for (let i = 0; i < 6 && !canRaise(state, card.type, card.rarity); i += 1) card = { ...card, type: rng.pick(types) };
  if (!canRaise(state, card.type, card.rarity)) card.type = 'boostCrate';
  return card;
}

// The Transfer Market is open all year: 9 offers each summer, and 6 fresh ones at the
// start of the season and every MARKET_EVERY league matchdays.
export const MARKET_EVERY = 4;
const MARKET_GROUPS = {
  summer: ['transfer', 'transfer', 'transfer', 'club', 'club', 'club', 'club', 'event', 'event'],
  season: ['transfer', 'transfer', 'club', 'club', 'club', 'event'],
};
function makeMarket(state, rng, kind) {
  const offers = MARKET_GROUPS[kind].map((g) => randomOffseasonCard(state, rng, g));
  // Every summer market has at least one signing card.
  if (kind === 'summer' && !offers.some((o) => OFFSEASON_CARDS[o.type].scope)) offers[0] = { ...offers[0], type: 'worldSigning' };
  const priced = offers.map((o) => {
    const area = OFFSEASON_CARDS[o.type].facility;
    return { ...o, price: cardPrice(o.type, o.rarity, area ? lvl(state, area) : null), sold: false };
  });
  return { offers: priced, round: Math.floor((state.season?.matchday || 0) / MARKET_EVERY), fresh: true, kind };
}

// New offers every MARKET_EVERY league matchdays during the season (called after each match).
function refreshMarket(next, seed) {
  if (next.phase !== 'season' || !next.season) return;
  const round = Math.floor(next.season.matchday / MARKET_EVERY);
  if (next.market && round <= next.market.round) return;
  next.market = makeMarket(next, makeRng(seed), 'season');
}

// The Market tab was opened: the "new offers" line on Home goes away.
export function seeMarket(state) {
  if (!state.market?.fresh) return state;
  return { ...state, market: { ...state.market, fresh: false } };
}

// League matchdays until the next market refresh (null outside the season).
export function marketRefreshIn(state) {
  if (state.phase !== 'season' || !state.season || !state.market) return null;
  return (state.market.round + 1) * MARKET_EVERY - state.season.matchday;
}

export function buyMarketCard(state, offerUid) {
  const offer = state.market?.offers.find((o) => o.uid === offerUid);
  if (!offer || offer.sold || state.coins < offer.price) return state;
  const next = structuredClone(state);
  const o = next.market.offers.find((x) => x.uid === offerUid);
  o.sold = true;
  next.coins -= o.price;
  track(next, 'spent', 'Transfer Market', o.price);
  next.inventory.offseason.push({ uid: o.uid, type: o.type, rarity: o.rarity });
  return next;
}

export function startNextSeason(state, seed) {
  if (state.phase !== 'offseason' || state.pendingOpen) return state;
  if (state.gm?.sacked) return state; // a sacked GM must take a new job first
  const next = structuredClone(state);
  next.season = newSeason(next, state.season.year + 1, seed);
  next.lastFinance = next.finance || null;
  next.finance = { income: {}, spent: {} };
  if (next.gm) {
    next.gm.offers = [];
    if (!next.gm.newJob) next.gm.confidence = carryConfidence(next.gm.confidence);
    next.gm.newJob = false;
  }
  setObjective(next);
  next.phase = 'season';
  next.market = makeMarket(next, makeRng(seed + 77), 'season');
  next.record = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  next.seasonStats = {};
  return next;
}

// ---------------------------------------------------------------------------
// Changing clubs: take any 2 cards, everything else stays behind.

// Everything the user could take: { key, kind, label, rarity }
export function carryOptions(state) {
  const opts = [];
  for (const c of state.squad) opts.push({ key: `player:${c.id}`, kind: 'player', label: `${c.name} (${c.pos})`, rarity: c.rarity });
  for (const role of ['coach', 'assistant']) {
    const c = state.coaches[role];
    if (c && c.passive) opts.push({ key: `coach:${role}`, kind: 'coach', label: `${c.name} (coach)`, rarity: c.rarity });
  }
  state.inventory.packs.forEach((p, i) => opts.push({ key: `pack:${i}`, kind: 'pack', label: PACKS[p].name, rarity: null }));
  for (const item of state.inventory.offseason) opts.push({ key: `off:${item.uid}`, kind: 'offseason', label: OFFSEASON_CARDS[item.type].name, rarity: item.rarity });
  for (const [b, n] of Object.entries(state.inventory.boosts)) if (n > 0) opts.push({ key: `boost:${b}`, kind: 'boost', label: `${BOOSTS[b].name} boost`, rarity: null });
  return opts;
}

export function acceptOffer(state, clubId, carryKeys = [], seed = 1) {
  const offer = state.gm?.offers.find((o) => o.clubId === clubId);
  if (!offer || state.phase !== 'offseason' || state.pendingOpen || carryKeys.length > 2) return state;
  const next = structuredClone(state);
  const rng = makeRng(seed);
  const oldId = next.club.id;
  const world = next.world;
  const carried = carryKeys.map((k) => k.split(':'));

  // 1. The old club keeps the named cards you leave behind.
  const carriedPlayers = carried.filter(([k]) => k === 'player').map(([, id]) => id);
  const leftNamed = next.squad.filter((c) => POOL_BY_ID[c.id] && !carriedPlayers.includes(c.id));
  const oldDiv = DIVISION_BY_ID[world.clubs[oldId].divisionId];
  world.clubs[oldId].keyPlayers = leftNamed.sort((a, b) => overall(b) - overall(a)).slice(0, namedCap(oldId, oldDiv)).map((c) => c.id);
  for (const c of leftNamed) world.cardLeft[c.id] = c.matchesLeft ?? 150;
  for (const c of next.squad) {
    if (carriedPlayers.includes(c.id)) logMove(next, c.id, oldId, clubId, 'c');
    else if (!world.clubs[oldId].keyPlayers.includes(c.id)) logMove(next, c.id, oldId, null, 'r');
  }

  // 2. The new club's squad: its named cards plus generic commons, then your carried players.
  const newClub = world.clubs[clubId];
  const level = DIVISION_BY_ID[newClub.divisionId].level;
  const start = clubStart(world, clubId);
  const named = newClub.keyPlayers.map((id) => ({ ...structuredClone(POOL_BY_ID[id]), matchesLeft: world.cardLeft[id] ?? POOL_BY_ID[id].matchesLeft }));
  newClub.keyPlayers = [];
  const used = new Set(named.map((c) => c.name.split(' ').slice(-1)[0]));
  const want = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD'];
  const squad = named.sort((a, b) => overall(b) - overall(a)).slice(0, 10);
  for (const c of squad) { const i = want.indexOf(c.pos); if (i >= 0) want.splice(i, 1); else want.pop(); }
  want.forEach((pos, i) => squad.push(makeGenericCard(rng, { id: `gen-${clubId}-${uid(next)}-${i}`, pos, rating: FILLER_RATING[level], used })));
  for (const id of carriedPlayers) {
    const card = next.squad.find((c) => c.id === id);
    const victims = squad.filter((c) => c.generic);
    const pool = victims.length ? victims : squad;
    const target = pool.find((c) => c.pos === card.pos) || pool.sort((a, b) => overall(a) - overall(b))[0];
    squad.splice(squad.indexOf(target), 1, card);
  }

  // 3. Coaches: the club's coach, unless you bring yours.
  const owned = new Set(ownedIds(next));
  const coachOptions = COACH_CARDS.filter((c) => c.rarity === start.coachRarity && !owned.has(c.id));
  let coach = coachOptions.length ? { ...structuredClone(rng.pick(coachOptions)), role: 'coach' } : genericCoach(next, 'coach');
  let assistant = genericCoach(next, 'assistant');
  const carriedCoach = carried.find(([k]) => k === 'coach');
  if (carriedCoach) {
    assistant = { ...coach, role: 'assistant' };
    coach = { ...next.coaches[carriedCoach[1]], role: 'coach' };
  }

  // 4. Inventory: only what you carry.
  const inventory = { boosts: {}, packs: [], offseason: [] };
  for (const [kind, ref] of carried) {
    if (kind === 'pack') inventory.packs.push(next.inventory.packs[Number(ref)]);
    if (kind === 'offseason') inventory.offseason.push(next.inventory.offseason.find((i) => i.uid === ref));
    if (kind === 'boost') inventory.boosts[ref] = 1;
  }

  next.club = clubInfo({ id: newClub.id, name: newClub.name, short: newClub.short, colors: newClub.colors }, newClub.divisionId);
  next.squad = squad;
  next.coaches = { coach, assistant };
  next.lineup = autoArrange(bestSeven(squad, coach.formation || '2-2-2'), coach.formation || '2-2-2');
  next.bench = squad.filter((c) => !next.lineup.includes(c.id)).map((c) => c.id);
  next.lastLineup = [...next.lineup];
  next.cohesion = 30;
  next.inventory = inventory;
  next.coins = start.coins;
  next.facilities = fullFacilities(start.facilities);
  next.activeEvent = null;
  next.perks = { shape: 0 };
  next.market = makeMarket(next, rng, 'summer'); // the new club's market, priced for its areas
  next.record = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  next.seasonStats = {};
  for (const c of squad) if (POOL_BY_ID[c.id] && !next.album.includes(c.id)) next.album.push(c.id);

  const year = next.season.year;
  const last = next.gm.career[next.gm.career.length - 1];
  if (last) last.to = year;
  next.gm.career.push({ clubId, name: newClub.name, from: year + 1, to: null });
  next.gm.sacked = false;
  next.gm.missedInRow = 0;
  next.gm.offers = [];
  next.gm.confidence = { ...START_CONFIDENCE };
  next.gm.newJob = true;
  next.gm.outOfContract = false;
  next.gm.contract = newContract(year + 1, DIVISION_BY_ID[newClub.divisionId].level);
  pushInbox(next, 'career', `You sign for ${newClub.name}`, `A ${next.gm.contract.until - next.gm.contract.from + 1}-season contract, until the end of season ${next.gm.contract.until}.`);
  return next;
}

export const offerRequirement = (state, clubId) => requiredReputation(state.world, clubId);

// House rules: curse (or lift the curse on) a club. Its stars leave and it loses at least half its games.
export function toggleCurse(state, clubId) {
  if (clubId === state.club.id) return state;
  const next = structuredClone(state);
  const list = new Set(next.houseRules?.cursed || []);
  if (list.has(clubId)) list.delete(clubId); else list.add(clubId);
  next.houseRules = { ...(next.houseRules || {}), cursed: [...list] };
  applyCurses(next.world, next.houseRules.cursed, POOL_BY_ID);
  return next;
}

// Off-season: actively look for a new job. Once per summer; the owners notice (−6 confidence).
export const LOOK_COST = 6;
export function lookForOffers(state, seed) {
  if (state.phase !== 'offseason' || !state.gm || state.gm.searched || state.gm.sacked) return state;
  const next = structuredClone(state);
  const verdict = next.gm.review?.verdict || 'met';
  const found = jobOffers(next.world, { reputation: next.gm.reputation, currentClubId: next.club.id, good: verdict !== 'missed', seed });
  const have = new Set(next.gm.offers.map((o) => o.clubId));
  next.gm.offers = [...next.gm.offers, ...found.filter((o) => !have.has(o.clubId))];
  next.gm.searched = true;
  next.gm.confidence = { ...next.gm.confidence, board: Math.max(0, (next.gm.confidence?.board ?? 60) - LOOK_COST) };
  return next;
}

// ---------------------------------------------------------------------------
// Using off-season cards

// Everyone a signing card could bring: free agents and players at other clubs.
export function signingCandidates(state, tiers, scope) {
  const mine = new Set(ownedIds(state));
  const resting = new Set(Object.keys(state.world?.resting || {}));
  const nation = DIVISION_BY_ID[state.club.divisionId].code;
  const ok = (c) => !mine.has(c.id) && !resting.has(c.id) && tiers.includes(TIERS.indexOf(c.rarity));
  const all = PLAYER_CARDS.filter(ok);
  if (scope !== 'national') return all;
  const local = all.filter((c) => c.nation === nation);
  return local.length ? local : all;
}

// Which club (if any) currently holds a card.
export function holderOf(state, cardId) {
  return Object.values(state.world?.clubs || {}).find((c) => c.keyPlayers.includes(cardId)) || null;
}

// Card plays: every management card you play counts, up to the season's limit (8, +1 at
// Analytics level 3 and 5). The count resets when the season ends: summer plays count
// towards the season that follows.
export const cardPlaysLeft = (state) => Math.max(0, cardPlayLimit(state.facilities) - (state.cardPlays || 0));
export const cardPlays = (state) => ({ used: state.cardPlays || 0, limit: cardPlayLimit(state.facilities) });

// Checks whether a card can be used now, with a reason for the UI.
export function canUseOffseason(state, item) {
  const def = OFFSEASON_CARDS[item.type];
  if (!def) return { ok: false, reason: 'Unknown card.' };
  if (state.phase === 'seasonEnd') return { ok: false, reason: 'Collect the season rewards on Home first.' };
  if (def.summerOnly && state.phase !== 'offseason') return { ok: false, reason: 'Summer only: it prepares the start of a season.' };
  if (state.pendingOpen) return { ok: false, reason: 'Finish deciding on your new cards first.' };
  if (!cardPlaysLeft(state)) {
    const { used, limit } = cardPlays(state);
    return { ok: false, reason: `No card plays left (${used} / ${limit}). They reset when the season ends.` };
  }
  if (def.group === 'event' && state.activeEvent) return { ok: false, reason: 'One season event per season, and one is already active.' };
  if (def.facility) {
    const level = lvl(state, def.facility);
    const t = tierIndex(item.rarity);
    const cap = def.values[t];
    if (level >= 5) return { ok: false, reason: 'Already at max level.' };
    if (t < 4 && level >= cap) return { ok: false, reason: `This rarity only builds up to level ${cap}. You're at ${level}.` };
  }
  if (def.scope && !signingCandidates(state, SIGNING_TIERS[tierIndex(item.rarity)], def.scope).length) {
    return { ok: false, reason: 'Nobody available to sign right now.' };
  }
  return { ok: true };
}

const removeItem = (next, itemUid) => {
  next.inventory.offseason = next.inventory.offseason.filter((i) => i.uid !== itemUid);
};

// target: { playerId, coachRole, position, trait, formation, passive }
// Returns { state, message, success }. A card that works uses one of the season's card plays.
export function useOffseasonCard(state, itemUid, target = {}, seed = 1) {
  const r = playCard(state, itemUid, target, seed);
  if (r.success) r.state.cardPlays = (state.cardPlays || 0) + 1;
  return r;
}

function playCard(state, itemUid, target, seed) {
  const item = state.inventory.offseason.find((i) => i.uid === itemUid);
  if (!item) return { state, message: 'Card not found.' };
  const check = canUseOffseason(state, item);
  if (!check.ok) return { state, message: check.reason };
  const def = OFFSEASON_CARDS[item.type];
  const t = tierIndex(item.rarity);
  const v = def.values[t];
  const rng = makeRng(seed);
  const next = structuredClone(state);
  removeItem(next, itemUid);
  const player = target.playerId ? next.squad.find((c) => c.id === target.playerId) : null;
  const queue = (cards, source) => {
    next.pendingOpen = { source, cards, index: 0 };
  };

  const when = state.phase === 'season' ? 'for the rest of this season' : 'all next season';
  if (def.group === 'event') {
    next.activeEvent = { type: item.type, rarity: item.rarity };
    return { state: next, message: `${def.name} is active ${when}.`, success: true };
  }
  if (def.facility) {
    const key = def.facility;
    next.facilities = { ...fullFacilities(next.facilities) };
    next.facilities[key] = Math.min(5, next.facilities[key] + (t === 4 ? 2 : 1));
    return { state: next, message: `${FACILITY_LABEL[key]} is now level ${next.facilities[key]}.`, success: true };
  }

  switch (item.type) {
    case 'careerExtension': {
      const person = target.coachRole ? next.coaches[target.coachRole] : player;
      if (!person || person.matchesLeft == null) return { state, message: 'Pick a player or coach with a career count.' };
      person.matchesLeft += v;
      return { state: next, message: `${person.name}: +${v} matches.`, success: true };
    }
    case 'personalTrainer': {
      if (!player) return { state, message: 'Pick a player.' };
      player.att += v; player.def += v; player.phy += v;
      return { state: next, message: `${player.name}: +${v} to all stats.`, success: true };
    }
    case 'positionRetraining': {
      if (!player || !POSITIONS.includes(target.position) || target.position === player.pos) return { state, message: 'Pick a player and a new position.' };
      player.pos = target.position;
      player.att = Math.max(15, player.att - v); player.def = Math.max(15, player.def - v); player.phy = Math.max(30, player.phy - v);
      return { state: next, message: `${player.name} now plays ${target.position}.`, success: true };
    }
    case 'traitCoach': {
      if (!player) return { state, message: 'Pick a player.' };
      let trait = target.trait;
      if (!v || !trait) {
        const options = Object.keys(TRAITS).filter((k) => k !== player.trait && (k !== 'shotStopper' || player.pos === 'GK'));
        trait = rng.pick(options);
      }
      player.trait = trait;
      return { state: next, message: `${player.name} learned ${TRAITS[trait].name}.`, success: true };
    }
    case 'tacticalCourse': {
      const coach = next.coaches.coach;
      if (!coach || !target.formation) return { state, message: 'Pick a formation.' };
      coach.formation = target.formation;
      if (v && target.passive) coach.passive = target.passive;
      next.lineup = autoArrange(next.lineup.map((id) => next.squad.find((c) => c.id === id)), coach.formation);
      return { state: next, message: `${coach.name} now plays ${coach.formation}.`, success: true };
    }
    case 'sportsScience': {
      next.perks = { ...(next.perks || {}), shape: (next.perks?.shape || 0) + v };
      return { state: next, message: `Sports Science: +${next.perks.shape} team shape ${when}.`, success: true };
    }
    case 'boostCrate': {
      const got = [];
      for (let i = 0; i < v; i += 1) {
        const b = rng.pick(BOOST_IDS);
        next.inventory.boosts[b] = (next.inventory.boosts[b] || 0) + 1;
        got.push(BOOSTS[b].name);
      }
      return { state: next, message: `Boost Crate: ${got.join(', ')}.`, success: true };
    }
    case 'worldSigning':
    case 'nationalSigning': {
      const pick = rng.pick(signingCandidates(state, SIGNING_TIERS[t], def.scope));
      const from = holderOf(state, pick.id);
      queue([structuredClone(pick)], from ? `Signed from ${from.name}` : 'Free agent');
      return { state: next, message: `${pick.name} ${from ? `agrees to leave ${from.name}` : 'is a free agent'} and wants to join you.`, success: true };
    }
    case 'veteranSigning': {
      const tier = Math.min(4, Math.max(1, t + 1));
      const options = signingCandidates(state, [tier], 'world');
      if (!options.length) return { state, message: 'Nobody available to sign right now.' };
      const card = structuredClone(rng.pick(options));
      const from = holderOf(state, card.id);
      card.matchesLeft = v;
      queue([card], from ? `Veteran from ${from.name}` : 'Veteran free agent');
      return { state: next, message: `${card.name} wants one last adventure.`, success: true };
    }
    case 'youthIntake': {
      if (!POSITIONS.includes(target.position)) return { state, message: 'Pick a position.' };
      const [found] = t > 0 ? academyCards(next, seed, { count: 1, tier: t, pos: target.position }) : [];
      const card = found && found.fallbackTier === undefined ? found : null;
      queue([card || youthPlayer(next, rng, target.position, t)], 'Youth Intake');
      return { state: next, message: card ? `${card.name} comes through the academy.` : 'A new youngster is ready.', success: true };
    }
    case 'goldenGeneration': {
      const found = academyCards(next, seed, { count: 2, tier: v })
        .map((c) => (c.fallbackTier !== undefined ? youthPlayer(next, rng, rng.pick(['DEF', 'MID', 'FWD']), v) : c));
      queue(found, 'Golden Generation');
      return { state: next, message: 'Your academy has produced two special talents!', success: true };
    }
    default:
      return { state, message: 'This card has no effect yet.' };
  }
}

// Academy cards of an exact rarity: the club's own legends first, then from elsewhere.
function academyCards(state, seed, { count, tier, pos = null }) {
  return userAcademyIntake(state.world, {
    level: null, bonusCards: count, exactTier: tier, pos, clubId: state.club.id,
    nation: DIVISION_BY_ID[state.club.divisionId].code, pools: CLUB_POOLS, poolById: POOL_BY_ID,
    allCards: PLAYER_CARDS, userIds: ownedIds(state), seed,
  });
}

export const academyInfo = (level) => ({ count: ACADEMY_COUNT[level], best: TIERS[ACADEMY_MAX_TIER[level]] });

const YOUTH_RATING = [58, 64, 71, 78, 85];

function youthPlayer(state, rng, pos, tier) {
  const rating = YOUTH_RATING[tier] - 1 + rng.int(-1, 1) + Math.floor(lvl(state, 'academy') / 2);
  const card = makeGenericCard(rng, { id: `youth-${uid(state)}`, pos, rating });
  card.rarity = rarityForOverall(overall(card));
  card.matchesLeft = 200 + rng.int(0, 40);
  card.youth = true;
  if (rng.next() < 0.5) card.trait = rng.pick(Object.keys(TRAITS).filter((k) => k !== 'shotStopper' || pos === 'GK'));
  return card;
}

// ---------------------------------------------------------------------------
// Career log: moves of the players you sign, release, retire or take with you (engine/careers.js).

const trackedPlayer = (state, id) => !!POOL_BY_ID[id] || !!state.playerStats?.[id] || !!state.careers?.[id];
const sourceMove = (source = '') => (/academy|youth|golden/i.test(source) ? 'a' : /signed|free agent|veteran/i.test(source) ? 's' : 'p');
function logMove(next, id, from, to, type) {
  if (!trackedPlayer(next, id)) return;
  const year = next.phase === 'offseason' ? (next.season?.year || 0) + 1 : (next.season?.year || 1);
  next.moves = recordMove(next.moves || {}, id, year, from, to, type);
}

// Older saves: fills in the club areas, card plays and the all-year Transfer Market.
// Safe to run on any save, any number of times.
export function migrateClubState(state) {
  if (!state || !state.club) return state;
  const next = { ...state };
  next.facilities = fullFacilities(state.facilities);
  if (typeof next.cardPlays !== 'number') next.cardPlays = 0;
  if (state.inventory?.offseason?.some((i) => RENAMED_CARDS[i.type] || !OFFSEASON_CARDS[i.type])) {
    next.inventory = {
      ...state.inventory,
      offseason: state.inventory.offseason.map((i) => (RENAMED_CARDS[i.type] ? { ...i, type: RENAMED_CARDS[i.type] } : i)).filter((i) => OFFSEASON_CARDS[i.type]),
    };
  }
  if (next.market?.offers) {
    next.market = { ...next.market, offers: next.market.offers.filter((o) => OFFSEASON_CARDS[RENAMED_CARDS[o.type] || o.type]).map((o) => ({ ...o, type: RENAMED_CARDS[o.type] || o.type })) };
    if (next.market.round == null) next.market.round = Math.floor((next.season?.matchday || 0) / MARKET_EVERY);
  }
  if (!next.market && (next.phase === 'season' || next.phase === 'offseason')) {
    next.market = makeMarket(next, makeRng((next.season?.year || 1) * 31 + (next.season?.matchday || 0)), next.phase === 'season' ? 'season' : 'summer');
  }
  return next;
}

// ---------------------------------------------------------------------------
// Saving (browser storage; the game still works when storage is unavailable)

const KEY = 'football-cards-save-v3';

export function loadClubState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === SAVE_VERSION ? migrateClubState(parsed) : null;
  } catch {
    return null;
  }
}

export function saveClubState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked or full: keep playing without saving.
  }
}

export function clearClubState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
