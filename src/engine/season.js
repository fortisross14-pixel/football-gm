// World season: every division's fixtures, tables and scorers, fast AI results,
// and promotion/relegation at the end.
import { recordGame as recordStats } from './statsbook.js';
import { makeRng } from './rng.js';
import { buildAiTeam, pickSquad, squadStrength, FILLER_RATING } from './aiTeam.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { drawStartingSquads } from './transfers.js';

// ---------------------------------------------------------------------------
// World (clubs and which division they're in). Persists across seasons.

// clubsByDivision: { divId: [club data] }, pools: { clubId: [card ids of its history] }.
// Each club's starting named cards are drawn at random from its pool.
export function buildWorld(clubsByDivision, pools, poolById, ownedIds = [], seed = 1) {
  const clubs = {};
  const divisions = {};
  for (const div of DIVISIONS) {
    const list = clubsByDivision[div.id] || [];
    divisions[div.id] = list.map((c) => c.id);
    for (const c of list) clubs[c.id] = { ...c, divisionId: div.id, level: div.level, keyPlayers: [] };
  }
  const world = { clubs, divisions, cardLeft: {}, resting: {}, retiredCount: 0 };
  drawStartingSquads(world, pools, poolById, ownedIds, seed);
  for (const c of Object.values(clubs)) c.strength = clubStrength(c, poolById);
  return world;
}

export function refreshStrengths(world, poolById) {
  for (const c of Object.values(world.clubs)) c.strength = clubStrength(c, poolById);
}

const hash = (str) => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

// Strength = the starting 7's average OVR (named cards plus generic fillers).
export function clubStrength(club, poolById) {
  const named = club.keyPlayers.map((id) => poolById[id]).filter(Boolean);
  const { lineup } = pickSquad(named, club.formation, FILLER_RATING[club.level], makeRng(hash(club.id)), club.id);
  return squadStrength(lineup, club.formation);
}

export const clubById = (world, id) => world.clubs[id];

export function removeKeyPlayer(world, playerId, poolById) {
  const next = structuredClone(world);
  for (const c of Object.values(next.clubs)) {
    if (!c.keyPlayers.includes(playerId)) continue;
    c.keyPlayers = c.keyPlayers.filter((id) => id !== playerId);
    c.strength = clubStrength(c, poolById);
  }
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

const emptyRow = () => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, cs: 0, form: [] });

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
    if (ga === 0) row.cs = (row.cs || 0) + 1;
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
export const CURSE_LOSS = 0.6;

// House rule (Menu → House rules): cursed clubs lose their Rare+ stars every summer and
// play with a heavy handicap. The owner's request: "make Barcelona a bad team".
export function applyCurses(world, cursed = [], poolById = {}) {
  for (const [id, club] of Object.entries(world.clubs)) {
    club.cursed = cursed.includes(id);
    if (!club.cursed) continue;
    club.keyPlayers = (club.keyPlayers || []).filter((pid) => ['common', 'uncommon'].includes(poolById[pid]?.rarity));
    club.strength = clubStrength(club, poolById);
  }
  return world;
}

export function quickResult(world, homeId, awayId, poolById, rng, neutral = false) {
  const h = world.clubs[homeId];
  const a = world.clubs[awayId];
  const diff = (h.strength ?? h.rating) - (a.strength ?? a.rating);
  const home = neutral ? 0 : 0.07;
  const lh = 1.6 * Math.exp(diff / 27 + home);
  const la = 1.6 * Math.exp(-diff / 27 - home);
  const score = [rng.poisson(lh), rng.poisson(la)];
  // House rule: a cursed club loses at least half its games.
  for (const side of [0, 1]) {
    if (![h, a][side].cursed || [h, a][1 - side].cursed) continue;
    if (score[side] >= score[1 - side] && rng.next() < CURSE_LOSS) {
      score[side] = Math.max(0, Math.min(score[side], score[1 - side] - 1));
      if (score[side] >= score[1 - side]) score[1 - side] = score[side] + 1;
    }
  }
  const goals = [];
  [h, a].forEach((club, side) => {
    for (let i = 0; i < score[side]; i += 1) {
      const keys = club.keyPlayers.map((id) => poolById[id]).filter((p) => p && p.pos !== 'GK');
      if (keys.length && rng.next() < Math.min(0.7, 0.14 * keys.length)) {
        const p = rng.weighted(keys, (c) => ({ FWD: 3, MID: 1.4, DEF: 0.4 }[c.pos] || 0) * c.att);
        goals.push({ side, playerId: p.id, name: p.name });
      } else goals.push({ side, playerId: null });
    }
  });
  return { score, goals };
}

// Plays the matchday: records the user's game (already played) and quick-sims every other game.
// userGame: { divisionId, homeId, awayId, score, goals }
// stats: optional live stats book (engine/statsbook.js); the user's own game is recorded elsewhere with full detail.
export function playMatchday(season, world, userGame, poolById, seed, stats = null, userClubId = null) {
  const next = structuredClone(season);
  const rng = makeRng(seed);
  for (const [divId, div] of Object.entries(next.divisions)) {
    for (const g of div.fixtures[next.matchday]) {
      if (userGame && divId === userGame.divisionId && g.home === userGame.homeId && g.away === userGame.awayId) {
        record(div, g.home, g.away, userGame.score, userGame.goals);
      } else {
        const r = quickResult(world, g.home, g.away, poolById, rng);
        record(div, g.home, g.away, r.score, r.goals);
        recordStats(stats, { world, poolById, comp: `L:${divId}`, homeId: g.home, awayId: g.away, score: r.score, goals: r.goals, userClubId });
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
  const team = buildAiTeam({ ...club, coach: { passive: club.passive }, keyPlayers }, seed ^ hash(clubId));
  if (club.cursed) team.mods = { ...team.mods, all: (team.mods.all || 0) - 0.3 };
  return team;
}

// ---------------------------------------------------------------------------
// End of season: champions, promotion and relegation.

export function endOfSeason(season, world, poolById) {
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
  // Moved clubs get generic players of their new division's level.
  for (const m of moves) {
    const club = next.clubs[m.clubId];
    club.level = DIVISION_BY_ID[m.to].level;
    club.strength = clubStrength(club, poolById);
  }
  return { world: next, champions, moves };
}

export const divisionName = (divId) => DIVISION_BY_ID[divId]?.name || divId;
