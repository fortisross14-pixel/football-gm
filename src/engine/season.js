// League season: fixtures, table, scorers, AI-vs-AI results.
import { makeRng } from './rng.js';
import { overall } from './cards.js';
import { simulateMatch } from './match.js';
import { buildAiTeam } from './aiTeam.js';

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

// Gives each AI club up to 2 named key players from the pool near its rating.
export function assignKeyPlayers(clubs, pool, ownedIds, seed) {
  const rng = makeRng(seed);
  const taken = new Set(ownedIds);
  return clubs.map((club) => {
    const keys = [];
    for (let k = 0; k < 2; k += 1) {
      const options = pool.filter((c) => !taken.has(c.id) && c.pos !== 'GK' && Math.abs(overall(c) - (club.rating + 2)) <= 4 && !keys.some((x) => x.pos === c.pos));
      if (!options.length) break;
      const pick = rng.pick(options);
      taken.add(pick.id);
      keys.push(pick.id);
    }
    return { ...club, keyPlayers: keys };
  });
}

export function createSeason({ year, userClub, aiClubs, pool, ownedIds, seed }) {
  const clubs = [
    { id: userClub.id, name: userClub.name, short: userClub.short, colors: userClub.colors, isUser: true },
    ...assignKeyPlayers(aiClubs, pool, ownedIds, seed),
  ];
  const table = {};
  for (const c of clubs) table[c.id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
  return {
    year,
    clubs,
    fixtures: makeFixtures(clubs.map((c) => c.id), seed + 1),
    matchday: 0,
    table,
    scorers: {}, // playerId → { name, clubId, goals }
    done: false,
  };
}

export const clubById = (season, id) => season.clubs.find((c) => c.id === id);

export function standings(season) {
  return Object.entries(season.table)
    .map(([id, row]) => ({ id, ...row, gd: row.gf - row.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

export function userFixture(season, userId) {
  const games = season.fixtures[season.matchday];
  if (!games) return null;
  const game = games.find((g) => g.home === userId || g.away === userId);
  if (!game) return null;
  const isHome = game.home === userId;
  return { ...game, isHome, opponentId: isHome ? game.away : game.home };
}

// Records one match. goals: [{ side: 0|1, playerId, name }]
export function recordResult(season, homeId, awayId, score, goals) {
  const next = structuredClone(season);
  const game = next.fixtures[next.matchday].find((g) => g.home === homeId && g.away === awayId);
  game.score = [...score];
  const [h, a] = score;
  const rows = [next.table[homeId], next.table[awayId]];
  rows.forEach((row, i) => {
    const gf = i === 0 ? h : a;
    const ga = i === 0 ? a : h;
    row.p += 1;
    row.gf += gf;
    row.ga += ga;
    const res = gf > ga ? 'W' : gf === ga ? 'D' : 'L';
    if (res === 'W') { row.w += 1; row.pts += 3; } else if (res === 'D') { row.d += 1; row.pts += 1; } else row.l += 1;
    row.form = [...row.form, res].slice(-5);
  });
  for (const g of goals) {
    const clubId = g.side === 0 ? homeId : awayId;
    const s = next.scorers[g.playerId] || { name: g.name, clubId, goals: 0 };
    s.goals += 1;
    s.clubId = clubId;
    next.scorers[g.playerId] = s;
  }
  return next;
}

export function aiTeamFor(season, clubId, poolById, seed) {
  const club = clubById(season, clubId);
  const keyPlayers = (club.keyPlayers || []).map((id) => poolById[id]).filter(Boolean);
  return buildAiTeam({ ...club, keyPlayers }, seed);
}

export function goalsFromMatch(match) {
  return match.events
    .filter((e) => e.type === 'goal')
    .map((e) => ({ side: e.side, playerId: e.playerId, name: match.teams[e.side].players[e.playerId].card.name }));
}

// Plays every other game of the current matchday, then moves to the next one.
export function finishMatchday(season, userId, poolById, seed) {
  let next = season;
  const rng = makeRng(seed);
  for (const g of season.fixtures[season.matchday]) {
    if (g.home === userId || g.away === userId) continue;
    const s = rng.int(1, 2 ** 30);
    const home = { ...aiTeamFor(next, g.home, poolById, s), isHome: true };
    const away = aiTeamFor(next, g.away, poolById, s + 1);
    const m = simulateMatch({ home, away, seed: s });
    next = recordResult(next, g.home, g.away, m.score, goalsFromMatch(m));
  }
  next = structuredClone(next);
  next.matchday += 1;
  if (next.matchday >= next.fixtures.length) next.done = true;
  return next;
}

export function removeKeyPlayer(season, playerId) {
  const next = structuredClone(season);
  for (const c of next.clubs) if (c.keyPlayers) c.keyPlayers = c.keyPlayers.filter((id) => id !== playerId);
  return next;
}

export function topScorers(season, limit = 10) {
  return Object.entries(season.scorers)
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
    .slice(0, limit);
}
