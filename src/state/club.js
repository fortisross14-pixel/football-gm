// The user's club: squad, coins, inventory, season and off-season.
// Every function takes the state and returns a new one (plus extra info where useful).

import { USER_CLUB, USER_SQUAD, USER_LINEUP, USER_BENCH, USER_COACHES, START_INVENTORY, LEVEL_MULTIPLIER } from '../data/demo.js';
import { PLAYER_POOL, COACH_POOL } from '../data/pool.js';
import { LEAGUE, AI_CLUBS } from '../data/league.js';
import { BOOST_IDS, BOOSTS } from '../data/boosts.js';
import { OFFSEASON_CARDS, OFFSEASON_IDS, MARKET_WEIGHTS, TIERS, tierIndex, cardValue, cardPrice } from '../data/offseason.js';
import { makeGenericCard } from '../engine/aiTeam.js';
import { makeRng } from '../engine/rng.js';
import { RARITIES, TRAITS, POSITIONS, overall, rarityForOverall, autoArrange } from '../engine/cards.js';
import { PACKS, openPack, mergeDuplicate, drawFromPool, MAX_STARS } from '../engine/packs.js';
import { createSeason, recordResult, finishMatchday, goalsFromMatch, standings, removeKeyPlayer } from '../engine/season.js';

export const SAVE_VERSION = 2;

export const POOLS = { player: PLAYER_POOL, coach: COACH_POOL };
export const POOL_BY_ID = Object.fromEntries([...PLAYER_POOL, ...COACH_POOL].map((c) => [c.id, c]));

const STADIUM_INCOME = [40, 70, 110, 160, 230, 320];
const MERCH_MULT = [0.5, 1, 1.5, 2, 2.5, 3];
const COHESION_GAIN = [4, 6, 8, 10, 12, 14];
const COHESION_MAX_BONUS = [0.04, 0.05, 0.06, 0.07, 0.08, 0.1];
export const FACILITY_LABEL = { stadium: 'Stadium', merch: 'Merchandise', training: 'Training ground', academy: 'Youth academy' };

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mult = (state) => LEVEL_MULTIPLIER[state.club.level] || 1;
const uid = (state) => {
  state.nextUid = (state.nextUid || 1) + 1;
  return `u${state.nextUid}`;
};

// ---------------------------------------------------------------------------
// New game

export function newClubState(seed = 12345) {
  const squad = structuredClone(USER_SQUAD);
  const state = {
    version: SAVE_VERSION,
    club: { ...USER_CLUB, level: LEAGUE.level, division: LEAGUE.name },
    coins: 300,
    squad,
    lineup: [...USER_LINEUP],
    bench: [...USER_BENCH],
    coaches: structuredClone(USER_COACHES),
    inventory: { boosts: { ...START_INVENTORY }, packs: ['bronze'], offseason: [] },
    facilities: { stadium: 1, merch: 0, training: 1, academy: 0 },
    cohesion: 50,
    lastLineup: [...USER_LINEUP],
    activeEvent: null,
    perks: { shirtSponsor: 0 },
    record: { w: 0, d: 0, l: 0, gf: 0, ga: 0 },
    history: [],
    playerStats: {},
    hallOfFame: [],
    album: squad.filter((c) => POOL_BY_ID[c.id]).map((c) => c.id),
    trophies: [],
    phase: 'season', // season → seasonEnd → offseason → season
    market: null,
    pendingOpen: null,
    nextUid: 1,
    season: null,
  };
  state.season = createSeason({ year: 1, userClub: state.club, aiClubs: AI_CLUBS, pool: PLAYER_POOL, ownedIds: ownedIds(state), seed });
  return state;
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

export function cohesionBonus(state) {
  return (effectiveCohesion(state) / 100) * COHESION_MAX_BONUS[state.facilities.training];
}

export function seasonMods(state) {
  const mods = { all: cohesionBonus(state), home: 0, comeback: 0, drain: 0, finishing: 0, underdog: 0 };
  const ev = state.activeEvent;
  if (!ev) return mods;
  const v = cardValue(ev.type, ev.rarity);
  switch (ev.type) {
    case 'fortressSeason': mods.home = v / 100; break;
    case 'indomitableSpirit': mods.comeback = v / 100; break;
    case 'underdogMentality': mods.underdog = v / 100; break;
    case 'shootingDrills': mods.finishing = v / 100; break;
    case 'fitnessProgram': mods.drain = v / 100; break;
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
  };
}

export function squadPopularity(state) {
  return state.squad.reduce((sum, c) => sum + (RARITIES[c.rarity]?.popularity || 0) * (1 + 0.25 * (c.stars || 0)), 0);
}

export function matchRewards(state, match, userSide) {
  const m = mult(state);
  const own = match.score[userSide];
  const conceded = match.score[1 - userSide];
  const winner = match.result.winner;
  const items = [];
  if (winner === userSide) items.push({ label: 'Win', coins: 100 * m });
  else if (winner === null) items.push({ label: 'Draw', coins: 40 * m });
  else items.push({ label: 'Defeat', coins: 15 * m });
  if (conceded === 0) items.push({ label: 'Clean sheet', coins: 20 * m });
  if (own >= 3) items.push({ label: '3+ goals', coins: 20 * m });
  if (match.teams[userSide].isHome) items.push({ label: `Home gate (stadium L${state.facilities.stadium})`, coins: STADIUM_INCOME[state.facilities.stadium] * m });
  let merch = squadPopularity(state) * MERCH_MULT[state.facilities.merch] * 2;
  if (state.activeEvent?.type === 'marketingTour') merch *= cardValue('marketingTour', state.activeEvent.rarity) / 100;
  if (merch > 0) items.push({ label: `Merchandise (L${state.facilities.merch})`, coins: Math.round(merch) });
  if (state.perks.shirtSponsor) items.push({ label: 'Shirt sponsor', coins: state.perks.shirtSponsor });
  return { items, total: items.reduce((s, i) => s + i.coins, 0) };
}

// Applies a finished league match: coins, record, stats, wear, retirements, cohesion, table.
export function applyMatch(state, match, userSide, opponent, rewards, seed) {
  const next = structuredClone(state);
  const team = match.teams[userSide];
  const own = match.score[userSide];
  const conceded = match.score[1 - userSide];
  const winner = match.result.winner;

  next.coins += rewards.total;
  if (winner === userSide) next.record.w += 1;
  else if (winner === null) next.record.d += 1;
  else next.record.l += 1;
  next.record.gf += own;
  next.record.ga += conceded;

  for (const boostId of team.boostsUsed) {
    next.inventory.boosts[boostId] = Math.max(0, (next.inventory.boosts[boostId] || 0) - 1);
  }

  // Cohesion
  const gain = COHESION_GAIN[next.facilities.training];
  next.cohesion = clamp(effectiveCohesion(state) + gain, cohesionFloor(state), 100);
  next.lastLineup = [...state.lineup];

  const appeared = match.result.appeared[userSide];
  const motmId = match.result.motm?.side === userSide ? match.result.motm.playerId : null;
  const retired = [];
  for (const id of appeared) {
    const p = team.players[id];
    const s = next.playerStats[id] || { apps: 0, goals: 0, assists: 0, motm: 0, ratingSum: 0 };
    s.apps += 1;
    s.goals += p.goals;
    s.assists += p.assists;
    s.ratingSum += p.rating || 6;
    if (id === motmId) s.motm += 1;
    next.playerStats[id] = s;
    const card = next.squad.find((c) => c.id === id);
    if (card && card.matchesLeft != null) {
      card.matchesLeft -= 1;
      if (card.matchesLeft <= 0) retired.push(card);
    }
  }

  const rng = makeRng(seed);
  for (const card of retired) {
    next.hallOfFame.push({ card, stats: next.playerStats[card.id], season: next.season?.year });
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
    opponent: opponent.name,
    opponentShort: opponent.short,
    score: [own, conceded],
    shootout: null,
    outcome: winner === userSide ? 'W' : winner === null ? 'D' : 'L',
    competition: `MD ${(next.season?.matchday ?? 0) + 1}`,
    venue: team.isHome ? 'H' : 'A',
  });
  next.history = next.history.slice(0, 30);

  // League table, other games, next matchday.
  if (next.season) {
    const [homeId, awayId] = userSide === 0 ? [team.id, match.teams[1].id] : [match.teams[0].id, team.id];
    next.season = recordResult(next.season, homeId, awayId, match.score, goalsFromMatch(match));
    next.season = finishMatchday(next.season, next.club.id, POOL_BY_ID, seed + 7);
    if (next.season.done) next.phase = 'seasonEnd';
  }
  return { state: next, retired: [...retired, ...retiredCoaches] };
}

function academyPlayer(state, rng, pos) {
  const card = makeGenericCard(rng, { id: `academy-${uid(state)}`, pos, rating: 48 + 2 * state.facilities.academy, rarity: 'academy' });
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
  return startOpening(next, packId, seed);
}

export function openOwnedPack(state, index, seed) {
  if (state.pendingOpen) return state;
  const next = structuredClone(state);
  const [packId] = next.inventory.packs.splice(index, 1);
  return startOpening(next, packId, seed);
}

function startOpening(next, packId, seed) {
  const shift = next.activeEvent?.type === 'scoutingNetwork' ? cardValue('scoutingNetwork', next.activeEvent.rarity) : 0;
  const { cards } = openPack(packId, seed, POOLS, shift);
  next.pendingOpen = { source: PACKS[packId].name, packId, cards, index: 0 };
  return next;
}

export function buyBoost(state, boostId) {
  const price = BOOSTS[boostId].price;
  if (state.coins < price) return state;
  const next = structuredClone(state);
  next.coins -= price;
  next.inventory.boosts[boostId] = (next.inventory.boosts[boostId] || 0) + 1;
  return next;
}

// ---------------------------------------------------------------------------
// Keep / merge / discard for any new card (packs, poach, free agents, youth)

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
    next.coaches[r] = { ...fresh, role: r };
    if (r === 'coach') next.lineup = autoArrange(next.lineup.map((id) => next.squad.find((c) => c.id === id)), fresh.formation);
  } else {
    const old = next.squad.find((c) => c.id === replaceId);
    if (!old) return state;
    next.coins += quickSell(old);
    replaceInSquad(next, replaceId, fresh);
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
  if (POOL_BY_ID[card.id] && !next.album.includes(card.id)) next.album.push(card.id);
  advancePending(next);
  return next;
}

function removeFromRivals(next, cardId) {
  if (next.season) next.season = removeKeyPlayer(next.season, cardId);
}

export const canMerge = (state, card) => {
  const dup = duplicateOf(state, card);
  return !!dup && (dup.stars || 0) < MAX_STARS;
};

// ---------------------------------------------------------------------------
// Season end and off-season

export function seasonSummary(state) {
  const table = standings(state.season);
  const position = table.findIndex((r) => r.id === state.club.id) + 1;
  const prize = (LEAGUE.prizes[position - 1] || 0) * mult(state);
  const packs = position === 1 ? ['gold'] : position <= 3 ? ['silver'] : [];
  return { table, position, prize, packs };
}

export function closeSeason(state, seed) {
  if (state.phase !== 'seasonEnd') return state;
  const next = structuredClone(state);
  const { position, prize, packs, table } = seasonSummary(state);
  next.coins += prize;
  next.inventory.packs.push(...packs);
  const champion = next.season.clubs.find((c) => c.id === table[0].id);
  next.trophies.push({ season: next.season.year, competition: LEAGUE.name, position, champion: champion.name });
  // One free off-season card as a season reward.
  const rng = makeRng(seed);
  next.inventory.offseason.push(randomOffseasonCard(next, rng));
  next.activeEvent = null;
  next.perks = { shirtSponsor: 0 };
  next.phase = 'offseason';
  next.market = { offers: makeMarketOffers(next, rng), poachTried: [] };
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

function randomOffseasonCard(state, rng, group = null) {
  const types = OFFSEASON_IDS.filter((id) => !group || OFFSEASON_CARDS[id].group === group);
  return { uid: uid(state), type: rng.pick(types), rarity: rollRarity(rng) };
}

function makeMarketOffers(state, rng) {
  const groups = ['transfer', 'transfer', 'transfer', 'transfer', 'club', 'club', 'event', 'event', 'event'];
  const offers = groups.map((g) => randomOffseasonCard(state, rng, g));
  // Always offer at least one Poach so there's a way to target a rival's player.
  if (!offers.some((o) => o.type === 'poach')) offers[0] = { ...offers[0], type: 'poach' };
  return offers.map((o) => ({ ...o, price: cardPrice(o.type, o.rarity), sold: false }));
}

export function buyMarketCard(state, offerUid) {
  const offer = state.market?.offers.find((o) => o.uid === offerUid);
  if (!offer || offer.sold || state.coins < offer.price) return state;
  const next = structuredClone(state);
  const o = next.market.offers.find((x) => x.uid === offerUid);
  o.sold = true;
  next.coins -= o.price;
  next.inventory.offseason.push({ uid: o.uid, type: o.type, rarity: o.rarity });
  return next;
}

export function startNextSeason(state, seed) {
  if (state.phase !== 'offseason' || state.pendingOpen) return state;
  const next = structuredClone(state);
  // Rival clubs change a little each year.
  const rng = makeRng(seed);
  const aiClubs = AI_CLUBS.map((c) => ({ ...c, rating: clamp(c.rating + rng.int(-2, 2), 60, 76) }));
  next.season = createSeason({ year: state.season.year + 1, userClub: next.club, aiClubs, pool: PLAYER_POOL, ownedIds: ownedIds(next), seed });
  next.phase = 'season';
  next.market = null;
  next.record = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  return next;
}

// ---------------------------------------------------------------------------
// Using off-season cards

export const POACH_BASE = [85, 65, 40, 18, 6];

export function poachChance(targetCard, poachRarity) {
  return Math.min(95, POACH_BASE[tierIndex(targetCard.rarity)] + cardValue('poach', poachRarity));
}

export function poachTargets(state) {
  if (!state.season) return [];
  return state.season.clubs
    .filter((c) => !c.isUser)
    .flatMap((c) => (c.keyPlayers || []).map((id) => ({ club: c, card: POOL_BY_ID[id] })))
    .filter((t) => t.card);
}

// Checks whether a card can be used now, with a reason for the UI.
export function canUseOffseason(state, item) {
  const def = OFFSEASON_CARDS[item.type];
  if (state.phase !== 'offseason') return { ok: false, reason: 'Off-season only. The Transfer Market opens when the season ends.' };
  if (state.pendingOpen) return { ok: false, reason: 'Finish deciding on your new cards first.' };
  if (def.group === 'event' && state.activeEvent) return { ok: false, reason: 'You already picked this season\'s event.' };
  if (def.facility) {
    const level = state.facilities[def.facility];
    const t = tierIndex(item.rarity);
    const cap = def.values[t];
    if (level >= 5) return { ok: false, reason: 'Already at max level.' };
    if (t < 4 && level >= cap) return { ok: false, reason: `This rarity only builds up to level ${cap}. You're at ${level}.` };
  }
  if (item.type === 'poach' && !poachTargets(state).some((t) => !state.market?.poachTried.includes(t.card.id))) {
    return { ok: false, reason: 'No rival players left to approach this off-season.' };
  }
  return { ok: true };
}

const removeItem = (next, itemUid) => {
  next.inventory.offseason = next.inventory.offseason.filter((i) => i.uid !== itemUid);
};

// target: { playerId, coachRole, position, trait, formation, passive, poachId }
// Returns { state, message, success }.
export function useOffseasonCard(state, itemUid, target = {}, seed = 1) {
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

  if (def.group === 'event') {
    next.activeEvent = { type: item.type, rarity: item.rarity };
    return { state: next, message: `${def.name} is active for next season.`, success: true };
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
    case 'stadiumEvolution':
    case 'merchExpansion':
    case 'trainingGround':
    case 'youthAcademy': {
      const key = def.facility;
      next.facilities[key] = Math.min(5, next.facilities[key] + (t === 4 ? 2 : 1));
      return { state: next, message: `${FACILITY_LABEL[key]} is now level ${next.facilities[key]}.`, success: true };
    }
    case 'shirtSponsor': {
      next.perks.shirtSponsor += v;
      return { state: next, message: `Shirt sponsor signed: +${next.perks.shirtSponsor} coins per match next season.`, success: true };
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
    case 'freeAgent': {
      if (!POSITIONS.includes(target.position)) return { state, message: 'Pick a position.' };
      const owned = new Set(ownedIds(next));
      const card = drawFromPool(rng, PLAYER_POOL, t, (c) => c.pos === target.position && !owned.has(c.id))
        || drawFromPool(rng, PLAYER_POOL, t, (c) => c.pos === target.position);
      queue([card], 'Free Agent');
      return { state: next, message: `${card.name} is available.`, success: true };
    }
    case 'veteranSigning': {
      if (!POSITIONS.includes(target.position)) return { state, message: 'Pick a position.' };
      const owned = new Set(ownedIds(next));
      const card = drawFromPool(rng, PLAYER_POOL, Math.min(4, t + 1), (c) => c.pos === target.position && !owned.has(c.id));
      card.matchesLeft = v;
      queue([card], 'Veteran Signing');
      return { state: next, message: `${card.name} wants one last adventure.`, success: true };
    }
    case 'youthIntake': {
      if (!POSITIONS.includes(target.position)) return { state, message: 'Pick a position.' };
      queue([youthPlayer(next, rng, target.position, t)], 'Youth Intake');
      return { state: next, message: 'A new youngster is ready.', success: true };
    }
    case 'goldenGeneration': {
      const tier = v;
      const cards = [0, 1].map(() => youthPlayer(next, rng, rng.pick(['DEF', 'MID', 'FWD']), tier));
      queue(cards, 'Golden Generation');
      return { state: next, message: 'Your academy has produced two special talents!', success: true };
    }
    case 'poach': {
      const pick = poachTargets(state).find((x) => x.card.id === target.poachId);
      if (!pick || next.market.poachTried.includes(pick.card.id)) return { state, message: 'Pick a rival player to approach.' };
      next.market.poachTried.push(pick.card.id);
      const chance = poachChance(pick.card, item.rarity);
      const success = rng.next() * 100 < chance;
      if (!success) return { state: next, message: `${pick.club.name} refused to sell ${pick.card.name} (${chance}% chance). The Poach card is lost.`, success: false };
      queue([structuredClone(pick.card)], `Poached from ${pick.club.name}`);
      return { state: next, message: `${pick.club.name} accepted! ${pick.card.name} can join you.`, success: true };
    }
    default:
      return { state, message: 'This card has no effect yet.' };
  }
}

const YOUTH_RATING = [58, 64, 71, 78, 85];

function youthPlayer(state, rng, pos, tier) {
  const rating = YOUTH_RATING[tier] - 1 + rng.int(-1, 1) + Math.floor(state.facilities.academy / 2);
  const card = makeGenericCard(rng, { id: `youth-${uid(state)}`, pos, rating });
  card.rarity = rarityForOverall(overall(card));
  card.matchesLeft = 200 + rng.int(0, 40);
  card.youth = true;
  if (rng.next() < 0.5) card.trait = rng.pick(Object.keys(TRAITS).filter((k) => k !== 'shotStopper' || pos === 'GK'));
  return card;
}

// ---------------------------------------------------------------------------
// Saving (browser storage; the game still works when storage is unavailable)

const KEY = 'football-cards-save-v2';

export function loadClubState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === SAVE_VERSION ? parsed : null;
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
