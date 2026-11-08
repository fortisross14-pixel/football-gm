// The user's club state for milestone 1, and how a finished match changes it.

import { USER_CLUB, USER_SQUAD, USER_LINEUP, USER_BENCH, USER_COACHES, START_INVENTORY, LEVEL_MULTIPLIER } from '../data/demo.js';
import { makeGenericCard } from '../engine/aiTeam.js';
import { makeRng } from '../engine/rng.js';
import { RARITIES } from '../engine/cards.js';

export const SAVE_VERSION = 1;

export function newClubState() {
  return {
    version: SAVE_VERSION,
    club: USER_CLUB,
    coins: 0,
    squad: structuredClone(USER_SQUAD),
    lineup: [...USER_LINEUP],
    bench: [...USER_BENCH],
    coaches: structuredClone(USER_COACHES),
    inventory: { ...START_INVENTORY },
    record: { w: 0, d: 0, l: 0, gf: 0, ga: 0 },
    history: [],
    playerStats: {},
    hallOfFame: [],
  };
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
  };
}

// Coins for one match, following the design doc (§6.1).
export function matchRewards(state, match, userSide, opponentLevel) {
  const mult = LEVEL_MULTIPLIER[state.club.level] || 1;
  const own = match.score[userSide];
  const conceded = match.score[1 - userSide];
  const winner = match.result.winner;
  const items = [];
  if (winner === userSide) items.push({ label: 'Win', coins: 100 * mult });
  else if (winner === null) items.push({ label: 'Draw', coins: 40 * mult });
  else items.push({ label: own === conceded ? 'Lost on penalties' : 'Defeat', coins: 15 * mult });
  if (conceded === 0) items.push({ label: 'Clean sheet', coins: 20 * mult });
  if (own >= 3) items.push({ label: '3+ goals', coins: 20 * mult });
  if (match.teams[userSide].isHome) items.push({ label: 'Home gate', coins: 40 * mult });
  const popularity = state.squad.reduce((sum, c) => sum + (RARITIES[c.rarity]?.popularity || 0), 0);
  items.push({ label: 'Merchandise', coins: Math.round(popularity * 0.5 * 2) });
  if (opponentLevel < state.club.level && winner === userSide) items.push({ label: 'Giant killing', coins: 50 * mult });
  return { items, total: items.reduce((s, i) => s + i.coins, 0) };
}

// Applies a finished match: coins, record, stats, matches left, retirements, used boosts.
export function applyMatch(state, match, userSide, opponent, rewards) {
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
    next.inventory[boostId] = Math.max(0, (next.inventory[boostId] || 0) - 1);
  }

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
    if (card && card.matchesLeft !== null && card.matchesLeft !== undefined) {
      card.matchesLeft -= 1;
      if (card.matchesLeft <= 0) retired.push(card);
    }
  }

  // Retired cards go to the Hall of Fame and an Academy player takes the slot.
  const rng = makeRng(match.seed);
  for (const card of retired) {
    next.hallOfFame.push({ card, stats: next.playerStats[card.id] });
    const replacement = makeGenericCard(rng, { id: `academy-${Date.now()}-${card.id}`, pos: card.pos, rating: 50, rarity: 'academy' });
    replacement.matchesLeft = null;
    next.squad = next.squad.map((c) => (c.id === card.id ? replacement : c));
    next.lineup = next.lineup.map((id) => (id === card.id ? replacement.id : id));
    next.bench = next.bench.map((id) => (id === card.id ? replacement.id : id));
  }

  for (const role of ['coach', 'assistant']) {
    const coach = next.coaches[role];
    if (coach && coach.matchesLeft) coach.matchesLeft -= 1;
  }

  next.history.unshift({
    opponent: opponent.name,
    opponentShort: opponent.short,
    score: [own, conceded],
    shootout: match.shootout ? [match.shootout.score[userSide], match.shootout.score[1 - userSide]] : null,
    outcome: winner === userSide ? 'W' : winner === null ? 'D' : 'L',
    competition: match.context.knockout ? 'Cup' : 'League',
    venue: team.isHome ? 'H' : 'A',
  });
  next.history = next.history.slice(0, 20);
  return { state: next, retired };
}

// ---------------------------------------------------------------------------
// Saving (browser storage; the game still works when storage is unavailable)

const KEY = 'football-cards-save-v1';

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
