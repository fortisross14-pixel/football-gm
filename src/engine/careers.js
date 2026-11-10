// Careers: every player's and manager's seasons, and every move between clubs, kept forever.
// Folded once a season from the live stats book (engine/statsbook.js), before its season page resets.
//
//   state.careers[playerId]   = [[year, club, apps, avgRating×10, goals, motm, cs, awardsMask], …]
//   state.careerNames[id]     = [name, pos]                      (only for players outside the card pool)
//   state.moves[playerId]     = [[year, fromClubId|0, toClubId|0, type], …]
//       type: a academy · s signing · p pack · c carried by you to a new job · r released · x retired
//       year: the season the move counts for (summer moves count for the season that follows).
//   state.coachCareers[key]   = [[year, club, W, D, L, titles], …]  (key as in the stats book: 'clubId|name' or 'you')
//   Compact lines: club 0 = same club as the line before (for a manager's first line: the club in his key),
//   trailing zeros dropped. ≈ 35 KB raw per season for the whole world (decode with careerLines/coachLines).
//   state.clubRecords[clubId] = { [comp]: [P, W, D, L] }        (all-time, folded, does not grow)
//
// Division, league finish and team trophies are not stored per line: they come from the archive.

import { DIVISION_BY_ID } from '../data/world/structure.js';

export const AWARD_BITS = [
  { bit: 1, key: 'best', icon: '🏅', label: 'Best Player' },
  { bit: 2, key: 'scorer', icon: '⚽', label: 'Top Scorer' },
  { bit: 4, key: 'gk', icon: '🧤', label: 'Best Goalkeeper' },
  { bit: 8, key: 'young', icon: '🌱', label: 'Best Young Player' },
  { bit: 16, key: 'boot', icon: '👟', label: 'Golden Boot' },
  { bit: 32, key: 'mvp', icon: '⭐', label: 'League MVP' },
  { bit: 64, key: 'glove', icon: '🥅', label: 'Golden Glove' },
];

export const MOVE_LABEL = { a: 'Academy', s: 'Signed', p: 'Signed (pack)', c: 'Moved with the manager', r: 'Released', x: 'Retired' };

// Awards mask per player for one season: yearly awards plus every league's boot, MVP and glove.
function awardMasks(awards, entry) {
  const m = {};
  const add = (id, bit) => { if (id) m[id] = (m[id] || 0) | bit; };
  for (const a of AWARD_BITS.slice(0, 4)) add(awards?.[a.key]?.id, a.bit);
  for (const lg of Object.values(entry?.leagues || {})) {
    add(lg.top?.[0], 16);
    add(lg.mvp?.[0], 32);
    add(lg.glove?.[0], 64);
  }
  return m;
}

const trim = (line) => { while (line.length > 3 && !line[line.length - 1]) line.pop(); return line; };

// Decoded lines: [{ year, clubId, apps, avg, goals, motm, cs, mask }], oldest first.
export function careerLines(list = []) {
  let club = null;
  return list.map(([year, c, apps = 0, avg10 = 0, goals = 0, motm = 0, cs = 0, mask = 0]) => {
    club = c || club;
    return { year, clubId: club, apps, avg: avg10 / 10, goals, motm, cs, mask };
  });
}

// Decoded manager lines: [{ year, clubId, p, w, d, l, titles }], oldest first.
export function coachLines(key, list = []) {
  let club = key === 'you' ? null : key.split('|')[0];
  return list.map(([year, c, w = 0, d = 0, l = 0, titles = 0]) => {
    club = c || club;
    return { year, clubId: club, p: w + d + l, w, d, l, titles };
  });
}

function totals(row) {
  const t = [0, 0, 0, 0, 0];
  for (const s of Object.values(row.s)) for (let i = 0; i < 5; i += 1) t[i] += s[i];
  return t;
}

// One season of the book into the career log. known(id): the card is in the pool (no name needed).
// Mutates and returns `out` = { careers, careerNames, coachCareers, clubRecords }.
export function foldSeason(out, book, { year, awards = null, entry = null, known = () => true }) {
  out.careers = out.careers || {};
  out.careerNames = out.careerNames || {};
  out.coachCareers = out.coachCareers || {};
  out.clubRecords = out.clubRecords || {};
  const masks = awardMasks(awards, entry);
  for (const [id, row] of Object.entries(book?.players || {})) {
    const [apps, goals, motm, cs, rsum] = totals(row);
    if (!apps) continue;
    const list = out.careers[id] || (out.careers[id] = []);
    if (list.at(-1)?.[0] === year) list.pop();
    const prev = careerLines(list).at(-1)?.clubId;
    list.push(trim([year, row.c === prev ? 0 : row.c, apps, Math.round((rsum / apps) * 10), goals, motm, cs, masks[id] || 0]));
    if (!known(id)) out.careerNames[id] = [row.n, row.p];
  }
  for (const [key, row] of Object.entries(book?.coaches || {})) {
    const t = [0, 0, 0, 0];
    for (const s of Object.values(row.s)) for (let i = 0; i < 4; i += 1) t[i] += s[i];
    if (!t[0] && !row.t) continue;
    const list = out.coachCareers[key] || (out.coachCareers[key] = []);
    if (list.at(-1)?.[0] === year) list.pop();
    const prev = list.length ? coachLines(key, list).at(-1).clubId : (key === 'you' ? null : key.split('|')[0]);
    list.push(trim([year, row.c === prev ? 0 : row.c, t[1], t[2], t[3], row.t || 0]));
    // The club's all-time record per competition (a manager is at one club for a whole season).
    const rec = out.clubRecords[row.c] || (out.clubRecords[row.c] = {});
    for (const [comp, s] of Object.entries(row.s)) {
      const r = rec[comp] || (rec[comp] = [0, 0, 0, 0]);
      for (let i = 0; i < 4; i += 1) r[i] += s[i];
    }
  }
  return out;
}

// A move between clubs (null = free agent / retired). Same-club "moves" are ignored.
export function recordMove(moves, id, year, from, to, type) {
  if (!id || (from || 0) === (to || 0)) return moves;
  const list = moves[id] || (moves[id] = []);
  list.push([year, from || 0, to || 0, type]);
  return moves;
}

// Card → club for every named card held by a club (and the user's squad under the user's club id).
export function holders(world, userClubId = null, userIds = []) {
  const map = {};
  for (const c of Object.values(world?.clubs || {})) for (const id of c.keyPlayers || []) map[id] = c.id;
  for (const id of userIds) map[id] = userClubId;
  return map;
}

// Records every change between two holder maps. typeOf(id, from, to) → move type.
export function diffMoves(moves, before, after, year, typeOf) {
  for (const id of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const from = before[id] || 0;
    const to = after[id] || 0;
    if (from !== to) recordMove(moves, id, year, from, to, typeOf(id, from, to));
  }
  return moves;
}

// ---------------------------------------------------------------------------
// Readers (UI)

const leagueOf = (entry, clubId) => {
  if (!entry) return null;
  for (const [divId, lg] of Object.entries(entry.leagues)) {
    const pos = lg.table.findIndex((r) => r[0] === clubId);
    if (pos >= 0) return { divId, pos: pos + 1, row: lg.table[pos] };
  }
  return null;
};

// The trophies a club won in one archived season, as labels.
export function clubTrophies(entry, clubId, names = {}) {
  if (!entry || !clubId) return [];
  const out = [];
  const lg = leagueOf(entry, clubId);
  if (lg?.pos === 1) out.push({ kind: 'league', label: DIVISION_BY_ID[lg.divId]?.name || 'League' });
  for (const [code, c] of Object.entries(entry.cups)) if (c?.winner === clubId) out.push({ kind: 'cup', label: names.cup?.(code) || `${code} Cup` });
  for (const [k, c] of Object.entries(entry.continental)) if (c?.winner === clubId) out.push({ kind: 'continental', label: names.continental?.(k) || k });
  if (entry.cwc?.winner === clubId) out.push({ kind: 'cwc', label: 'Club World Cup' });
  return out;
}

const awardsFrom = (mask) => AWARD_BITS.filter((a) => mask & a.bit);

// A player's seasons, newest first, with the live season on top when he has played.
export function playerSeasons(state, id, names) {
  const byYear = Object.fromEntries((state.archive || []).map((e) => [e.year, e]));
  const rows = careerLines(state.careers?.[id]).map(({ year, clubId, apps, goals, motm, cs, avg, mask }) => {
    const lg = leagueOf(byYear[year], clubId);
    return {
      year, clubId, apps, goals, motm, cs, avg, divId: lg?.divId || null, pos: lg?.pos || null,
      level: lg ? DIVISION_BY_ID[lg.divId]?.level : null, awards: awardsFrom(mask), trophies: clubTrophies(byYear[year], clubId, names),
    };
  });
  const live = state.stats?.season?.players?.[id];
  const year = state.stats?.year || state.season?.year;
  if (live && !rows.some((r) => r.year === year)) {
    const [apps, goals, motm, cs, rsum] = totals(live);
    if (apps) {
      const divId = Object.keys(live.s).find((k) => k.startsWith('L:'))?.slice(2) || state.world.clubs[live.c]?.divisionId || null;
      rows.push({ year, clubId: live.c, apps, goals, motm, cs, avg: rsum / apps, divId, pos: null, level: DIVISION_BY_ID[divId]?.level || null, awards: [], trophies: [], live: true });
    }
  }
  return rows.sort((a, b) => b.year - a.year);
}

// Career totals from the season lines.
export function careerTotals(seasons) {
  const t = { seasons: seasons.length, apps: 0, goals: 0, motm: 0, cs: 0, rsum: 0, awards: 0, trophies: 0, clubs: new Set() };
  for (const s of seasons) {
    t.apps += s.apps; t.goals += s.goals; t.motm += s.motm; t.cs += s.cs; t.rsum += s.avg * s.apps;
    t.awards += s.awards.length; t.trophies += s.trophies.length; if (s.clubId) t.clubs.add(s.clubId);
  }
  return { ...t, avg: t.apps ? t.rsum / t.apps : 0, clubs: [...t.clubs] };
}

// Moves as objects, oldest first.
export const playerMoves = (state, id) => (state.moves?.[id] || []).map(([year, from, to, type]) => ({ year, from: from || null, to: to || null, type }));

// Spells at clubs (consecutive seasons or moves at the same club), oldest first.
export function clubSpells(seasons, moves) {
  const events = [
    ...seasons.map((s) => ({ year: s.year, clubId: s.clubId })),
    ...moves.filter((m) => m.to).map((m) => ({ year: m.year, clubId: m.to })),
  ].sort((a, b) => a.year - b.year);
  const spells = [];
  for (const e of events) {
    const last = spells.at(-1);
    if (last && last.clubId === e.clubId) last.to = Math.max(last.to, e.year);
    else spells.push({ clubId: e.clubId, from: e.year, to: e.year });
  }
  return spells;
}

// Every move in or out of a club, newest first.
export function clubMoves(state, clubId) {
  const out = [];
  for (const [id, list] of Object.entries(state.moves || {})) {
    for (const [year, from, to, type] of list) {
      if (from === clubId || to === clubId) out.push({ id, year, from: from || null, to: to || null, type, dir: to === clubId ? 'in' : 'out' });
    }
  }
  return out.sort((a, b) => b.year - a.year);
}

// A manager's seasons from the coach log, newest first, each with the club's league finish.
export function managerSeasons(state, key) {
  const byYear = Object.fromEntries((state.archive || []).map((e) => [e.year, e]));
  const rows = coachLines(key, state.coachCareers?.[key]).map(({ year, clubId, p, w, d, l, titles }) => {
    const lg = leagueOf(byYear[year], clubId);
    return { year, clubId, p, w, d, l, titles, divId: lg?.divId || null, pos: lg?.pos || null, trophies: clubTrophies(byYear[year], clubId) };
  });
  const live = state.stats?.season?.coaches?.[key];
  const year = state.stats?.year || state.season?.year;
  if (live && !rows.some((r) => r.year === year)) {
    const t = [0, 0, 0, 0];
    for (const s of Object.values(live.s)) for (let i = 0; i < 4; i += 1) t[i] += s[i];
    if (t[0]) rows.push({ year, clubId: live.c, p: t[0], w: t[1], d: t[2], l: t[3], titles: live.t || 0, divId: state.world.clubs[live.c]?.divisionId || null, pos: null, trophies: [], live: true });
  }
  return rows.sort((a, b) => b.year - a.year);
}

// Every manager a club has had (from the coach log), newest first: { key, name, from, to, p, w, d, l, titles }.
export function clubManagers(state, clubId, userName = 'You') {
  const map = {};
  const add = (key, name, year, p, w, d, l, titles) => {
    const m = map[key] || (map[key] = { key, name, from: year, to: year, p: 0, w: 0, d: 0, l: 0, titles: 0 });
    m.from = Math.min(m.from, year); m.to = Math.max(m.to, year);
    m.p += p; m.w += w; m.d += d; m.l += l; m.titles += titles;
  };
  const nameOfKey = (key) => (key === 'you' ? userName : key.split('|').slice(1).join('|'));
  for (const [key, list] of Object.entries(state.coachCareers || {})) {
    for (const x of coachLines(key, list)) if (x.clubId === clubId) add(key, nameOfKey(key), x.year, x.p, x.w, x.d, x.l, x.titles);
  }
  const year = state.stats?.year || state.season?.year;
  for (const [key, row] of Object.entries(state.stats?.season?.coaches || {})) {
    if (row.c !== clubId) continue;
    if (state.coachCareers?.[key]?.some((x) => x[0] === year)) continue;
    const t = [0, 0, 0, 0];
    for (const s of Object.values(row.s)) for (let i = 0; i < 4; i += 1) t[i] += s[i];
    add(key, nameOfKey(key), year, ...t, row.t || 0);
  }
  return Object.values(map).sort((a, b) => b.to - a.to || b.from - a.from);
}

// A club's record per competition: all-time folded plus the live season.
export function clubRecord(state, clubId) {
  const all = structuredClone(state.clubRecords?.[clubId] || {});
  const season = {};
  for (const row of Object.values(state.stats?.season?.coaches || {})) {
    if (row.c !== clubId) continue;
    for (const [comp, s] of Object.entries(row.s)) {
      const a = all[comp] || (all[comp] = [0, 0, 0, 0]);
      const b = season[comp] || (season[comp] = [0, 0, 0, 0]);
      for (let i = 0; i < 4; i += 1) { a[i] += s[i]; b[i] += s[i]; }
    }
  }
  return { all, season };
}

// A club's players all-time, from the career log (plus the live season): [{ id, apps, goals, motm, cs, avg, seasons }].
export function clubPlayersAllTime(state, clubId) {
  const map = {};
  const add = (id, apps, goals, motm, cs, rsum, year) => {
    const r = map[id] || (map[id] = { id, apps: 0, goals: 0, motm: 0, cs: 0, rsum: 0, years: new Set() });
    r.apps += apps; r.goals += goals; r.motm += motm; r.cs += cs; r.rsum += rsum; r.years.add(year);
  };
  for (const [id, list] of Object.entries(state.careers || {})) {
    for (const x of careerLines(list)) if (x.clubId === clubId) add(id, x.apps, x.goals, x.motm, x.cs, x.avg * x.apps, x.year);
  }
  const year = state.stats?.year || state.season?.year;
  for (const [id, row] of Object.entries(state.stats?.season?.players || {})) {
    if (row.c !== clubId || state.careers?.[id]?.some((x) => x[0] === year)) continue;
    const [apps, goals, motm, cs, rsum] = totals(row);
    add(id, apps, goals, motm, cs, rsum, year);
  }
  return Object.values(map).map((r) => ({ ...r, avg: r.apps ? r.rsum / r.apps : 0, seasons: r.years.size }));
}
