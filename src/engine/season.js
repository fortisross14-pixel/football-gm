// World season: every division's fixtures, tables and scorers, fast AI results,
// and promotion/relegation at the end.
import { makeRng } from './rng.js';
import { buildAiTeam } from './aiTeam.js';
import { DIVISIONS, DIVISION_BY_ID, LEVEL_RATING } from '../data/world/structure.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------------------
// World (clubs and which division they're in). Persists across seasons.

// clubsByDivision: { divId: [club data] }, players: cards with clubId, ownedIds: user's cards.
export function buildWorld(clubsByDivision, players, ownedIds = []) {
  const owned = new Set(ownedIds);
  const clubs = {};
  const divisions = {};
  for (const div of DIVISIONS) {
    const list = clubsByDivision[div.id] || [];
    divisions[div.id] = list.map((c) => c.id);
    for (const c of list) clubs[c.id] = { ...c, divisionId: div.id, keyPlayers: [] };
  }
  for (const p of players) {
    if (p.clubId && clubs[p.clubId] && !owned.has(p.id)) clubs[p.clubId].keyPlayers.push(p.id);
  }
  return { clubs, divisions };
}

export const clubById = (world, id) => world.clubs[id];

export function removeKeyPlayer(world, playerId) {
  const next = structuredClone(world);
  for (const c of Object.values(next.clubs)) c.keyPlayers = c.keyPlayers.filter((id) => id !== playerId);
  return next;
}

// ---------------------------------------------------------------------------
// Fixtures

// Double round-robin with the circle method: 8 clubs → 14 matchdays of 4 games.
export function makeFixtures(ids, seed) {
  const rng = makeRng(seed);
  const teams = [...ids].sort(() => rng.next() - 0.5);
  const n = teams.length;
  const rounds = [];
  const rot = teams.slice(1);
  for (let r = 0; r < n - 1; r += 1) {
    const order = [teams[0], ...rot];
    const games = [];
    for (let i = 0; i < n / 2; i += 1) {
      const a = order[i];
      const b = order[n - 1 - i];
      games.push(r % 2 === 0 ? { home: a, away: b } : { home: b, away: a });
    }
    rounds.push(games);
    rot.unshift(rot.pop());
  }
  const second = rounds.map((games) => games.map((g) => ({ home: g.away, away: g.home })));
  return [...rounds, ...second].map((games) => games.map((g) => ({ ...g, score: null })));
}

const emptyRow = () => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] });

export function createSeason({ year, world, seed }) {
  const divisions = {};
  DIVISIONS.forEach((div, i) => {
    const ids = world.divisions[div.id];
    if (!ids || ids.length < 2) return;
    divisions[div.id] = {
      fixtures: makeFixtures(ids, seed + i * 101),
      table: Object.fromEntries(ids.map((id) => [id, emptyRow()])),
      scorers: {},
    };
  });
  return { year, matchday: 0, done: false, divisions };
}

export const MATCHDAYS = 14;

// ---------------------------------------------------------------------------
// Results

function record(div, homeId, awayId, score, goals) {
  const game = div.fixtures.flat().find((g) => g.home === homeId && g.away === awayId && !g.score);
  if (game) game.score = [...score];
  const [h, a] = score;
  [[homeId, h, a], [awayId, a, h]].forEach(([id, gf, ga]) => {
    const row = div.table[id];
    row.p += 1;
    row.gf += gf;
    row.ga += ga;
    const res = gf > ga ? 'W' : gf === ga ? 'D' : 'L';
    if (res === 'W') { row.w += 1; row.pts += 3; } else if (res === 'D') { row.d += 1; row.pts += 1; } else row.l += 1;
    row.form = [...row.form, res].slice(-5);
  });
  for (const g of goals) {
    if (!g.playerId) continue;
    const clubId = g.side === 0 ? homeId : awayId;
    const s = div.scorers[g.playerId] || { name: g.name, clubId, goals: 0 };
    s.goals += 1;
    s.clubId = clubId;
    div.scorers[g.playerId] = s;
  }
}

// Fast rating-based result for AI-vs-AI games, calibrated against the full engine:
// about 3.3 goals per game, home side wins ~45% between equal teams.
export function quickResult(world, homeId, awayId, poolById, rng) {
  const h = world.clubs[homeId];
  const a = world.clubs[awayId];
  const diff = h.rating - a.rating;
  const lh = 1.6 * Math.exp(diff / 17 + 0.07);
  const la = 1.6 * Math.exp(-diff / 17 - 0.07);
  const score = [rng.poisson(lh), rng.poisson(la)];
  const goals = [];
  [h, a].forEach((club, side) => {
    for (let i = 0; i < score[side]; i += 1) {
      const keys = club.keyPlayers.map((id) => poolById[id]).filter((p) => p && p.pos !== 'GK');
      if (keys.length && rng.next() < 0.6) {
        const p = rng.weighted(keys, (c) => ({ FWD: 3, MID: 1.4, DEF: 0.4 }[c.pos] || 0) * c.att);
        goals.push({ side, playerId: p.id, name: p.name });
      } else goals.push({ side, playerId: null });
    }
  });
  return { score, goals };
}

// Plays the matchday: records the user's game (already played) and quick-sims every other game.
// userGame: { divisionId, homeId, awayId, score, goals }
export function playMatchday(season, world, userGame, poolById, seed) {
  const next = structuredClone(season);
  const rng = makeRng(seed);
  for (const [divId, div] of Object.entries(next.divisions)) {
    for (const g of div.fixtures[next.matchday]) {
      if (userGame && divId === userGame.divisionId && g.home === userGame.homeId && g.away === userGame.awayId) {
        record(div, g.home, g.away, userGame.score, userGame.goals);
      } else {
        const r = quickResult(world, g.home, g.away, poolById, rng);
        record(div, g.home, g.away, r.score, r.goals);
      }
    }
  }
  next.matchday += 1;
  if (next.matchday >= MATCHDAYS) next.done = true;
  return next;
}

export function goalsFromMatch(match) {
  return match.events
    .filter((e) => e.type === 'goal')
    .map((e) => ({ side: e.side, playerId: e.playerId, name: match.teams[e.side].players[e.playerId].card.name }));
}

// ---------------------------------------------------------------------------
// Queries

export function standings(season, divId) {
  const div = season.divisions[divId];
  if (!div) return [];
  return Object.entries(div.table)
    .map(([id, row]) => ({ id, ...row, gd: row.gf - row.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

export function userFixture(season, divId, userId) {
  const games = season.divisions[divId]?.fixtures[season.matchday];
  if (!games) return null;
  const game = games.find((g) => g.home === userId || g.away === userId);
  if (!game) return null;
  const isHome = game.home === userId;
  return { ...game, isHome, opponentId: isHome ? game.away : game.home };
}

export function topScorers(season, divId, limit = 10) {
  const div = season.divisions[divId];
  if (!div) return [];
  return Object.entries(div.scorers)
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function aiTeamFor(world, clubId, poolById, seed) {
  const club = world.clubs[clubId];
  const keyPlayers = club.keyPlayers.map((id) => poolById[id]).filter(Boolean);
  return buildAiTeam({ ...club, coach: { passive: club.passive }, keyPlayers }, seed);
}

// ---------------------------------------------------------------------------
// End of season: champions, promotion and relegation, rating drift.

export function endOfSeason(season, world, seed) {
  const rng = makeRng(seed);
  const next = structuredClone(world);
  const champions = {};
  const moves = [];
  for (const div of DIVISIONS) {
    const table = standings(season, div.id);
    if (table.length) champions[div.id] = table[0].id;
  }
  // 1 up and 1 down between adjacent tiers of the same country.
  for (const div of DIVISIONS) {
    const lower = DIVISIONS.find((d) => d.code === div.code && d.tier === div.tier + 1);
    if (!lower) continue;
    const up = standings(season, lower.id)[0]?.id;
    const down = standings(season, div.id).at(-1)?.id;
    if (!up || !down) continue;
    next.divisions[div.id] = next.divisions[div.id].map((id) => (id === down ? up : id));
    next.divisions[lower.id] = next.divisions[lower.id].map((id) => (id === up ? down : id));
    next.clubs[up].divisionId = div.id;
    next.clubs[down].divisionId = lower.id;
    moves.push({ clubId: up, from: lower.id, to: div.id, type: 'promoted' });
    moves.push({ clubId: down, from: div.id, to: lower.id, type: 'relegated' });
  }
  // Ratings drift toward their (new) division and move a little with results.
  for (const div of DIVISIONS) {
    const ids = next.divisions[div.id];
    const [lo, hi] = LEVEL_RATING[div.level];
    const mean = ids.reduce((s, id) => s + next.clubs[id].rating, 0) / ids.length;
    const table = standings(season, div.id);
    for (const id of ids) {
      const club = next.clubs[id];
      const pos = table.findIndex((r) => r.id === id);
      const form = pos >= 0 ? (3.5 - pos) * 0.3 : 0;
      const drift = (mean - club.rating) * 0.15 + form + rng.int(-1, 1);
      club.rating = clamp(Math.round(club.rating + drift), lo, hi);
    }
  }
  return { world: next, champions, moves };
}

export const divisionName = (divId) => DIVISION_BY_ID[divId]?.name || divId;
