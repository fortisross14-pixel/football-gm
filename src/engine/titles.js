// Titles across real life and the game: real-life winners (data/history) up to 2026, then the
// in-game archive from 2027 on. Competition keys: 'L:<divId>' league, 'C:<code>' domestic cup,
// 'S:<code>' super cup, 'K:<conf>' / 'K2:<conf>' continental cups, 'KS:<conf>' continental super cup,
// 'W' Club World Cup.
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { CONTINENT_NAME } from './competitions.js';
import { REAL_HISTORY, REAL_TITLES } from '../data/history/index.js';
import { seasonYear } from './years.js';

// In-game continental tournaments that map onto a real competition with another key.
const ALIAS = { 'K:americas': 'K:southamerica' };
const UNALIAS = Object.fromEntries(Object.entries(ALIAS).map(([a, b]) => [b, a]));
export const realKeyOf = (gameKey) => (REAL_HISTORY[gameKey] ? gameKey : ALIAS[gameKey] || null);
const gameKeyOf = (key) => UNALIAS[key] || key;

export const KIND_OF = { L: 'league', C: 'cup', S: 'super', K: 'continental', K2: 'continental', KS: 'super', W: 'world' };
export const kindOf = (key) => KIND_OF[key.split(':')[0]] || 'cup';
const ORDER = { W: 0, K: 1, K2: 2, L: 3, C: 4, KS: 5, S: 6 };
const orderOf = (key) => ORDER[key.split(':')[0]] ?? 7;

const countryOf = (code) => DIVISIONS.find((d) => d.code === code)?.country;
// The competition as it exists in the game (null when the game doesn't play it).
export function gameCompName(key) {
  const [kind, ref] = key.split(':');
  if (key === 'W') return 'Club World Cup';
  if (kind === 'L') return DIVISION_BY_ID[ref]?.name || null;
  if (kind === 'C') return countryOf(ref) ? `${countryOf(ref)} Cup` : null;
  if (kind === 'K') return CONTINENT_NAME[ref] || null;
  return null;
}
// Game name when the game plays it (names stay the game's), else the real one.
export function competitionName(key) {
  return gameCompName(gameKeyOf(key)) || gameCompName(key) || REAL_HISTORY[key]?.name || key;
}

// Every winner in one archive entry: [{ key, winner, runnerUp }] with in-game keys.
export function entryWinners(entry) {
  const out = [];
  for (const [divId, lg] of Object.entries(entry.leagues || {})) if (lg.table?.[0]) out.push({ key: `L:${divId}`, winner: lg.table[0][0], runnerUp: lg.table[1]?.[0] || null });
  for (const [code, c] of Object.entries(entry.cups || {})) if (c?.winner) out.push({ key: `C:${code}`, winner: c.winner, runnerUp: c.runnerUp || null });
  for (const [k, c] of Object.entries(entry.continental || {})) if (c?.winner) out.push({ key: `K:${k}`, winner: c.winner, runnerUp: c.runnerUp || null });
  if (entry.cwc?.winner) out.push({ key: 'W', winner: entry.cwc.winner, runnerUp: entry.cwc.runnerUp || null });
  return out;
}
// The key a title is filed under: the real competition's key when there is one.
const fileKey = (gameKey) => realKeyOf(gameKey) || gameKey;

// One club's titles, real and in-game, per competition (most prestigious first).
// → [{ key, kind, name, real: [years], game: [years], n }]
export function clubTitles(archive, clubId) {
  const rows = {};
  const get = (key) => (rows[key] = rows[key] || { key, kind: kindOf(key), name: competitionName(key), real: [], game: [] });
  for (const [key, years] of Object.entries(REAL_TITLES[clubId] || {})) get(key).real.push(...years);
  for (const e of archive || []) {
    for (const w of entryWinners(e)) if (w.winner === clubId) get(fileKey(w.key)).game.push(seasonYear(e.year));
  }
  return Object.values(rows)
    .map((r) => ({ ...r, n: r.real.length + r.game.length }))
    .sort((a, b) => orderOf(a.key) - orderOf(b.key) || b.n - a.n || a.name.localeCompare(b.name));
}

// "×11 (1971, 1973, 1980, 1992, etc.)": years compressed, a year twice shown as "2013 ×2".
export function yearsText(years, max = Infinity) {
  const counts = [];
  for (const y of [...years].sort((a, b) => a - b)) {
    if (counts.length && counts.at(-1)[0] === y) counts.at(-1)[1] += 1;
    else counts.push([y, 1]);
  }
  const parts = counts.map(([y, n]) => (n > 1 ? `${y} ×${n}` : String(y)));
  return parts.length > max ? `${parts.slice(0, max).join(', ')}, etc.` : parts.join(', ');
}

// Counts for every world club (real + in-game). filter: all | league | cup | continental.
// "cup" counts domestic cups, "continental" continental cups and the Club World Cup; "all" adds super cups.
const IN_FILTER = {
  all: () => true,
  league: (k) => k === 'league',
  cup: (k) => k === 'cup',
  continental: (k) => k === 'continental' || k === 'world',
};
export function titleRanking(archive, filter = 'all', clubIds = null) {
  const ok = IN_FILTER[filter] || IN_FILTER.all;
  const rows = {};
  const add = (id, key, n = 1) => {
    if (clubIds && !clubIds.has(id)) return;
    const kind = kindOf(key);
    const r = (rows[id] = rows[id] || { id, league: 0, cup: 0, continental: 0, world: 0, super: 0, total: 0, last: 0 });
    r[kind] += n;
    if (ok(kind)) r.total += n;
  };
  for (const [id, byKey] of Object.entries(REAL_TITLES)) {
    for (const [key, years] of Object.entries(byKey)) {
      add(id, key, years.length);
      if (ok(kindOf(key)) && rows[id]) rows[id].last = Math.max(rows[id].last, ...years);
    }
  }
  for (const e of archive || []) {
    for (const w of entryWinners(e)) {
      if (w.key.startsWith('L:') && DIVISION_BY_ID[w.key.slice(2)]?.tier !== 1) continue; // top flights only
      add(w.winner, fileKey(w.key));
      if (ok(kindOf(w.key)) && rows[w.winner]) rows[w.winner].last = Math.max(rows[w.winner].last, seasonYear(e.year));
    }
  }
  return Object.values(rows).filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total || (b.continental + b.world) - (a.continental + a.world) || b.league - a.league || b.last - a.last);
}

// A competition's winners by year: real life, then the game.
// → { name, note, real: [{ year, winners: [{ id, name }] }], game: [{ year, season, winner, runnerUp }], most: [{ id, name, n }] }
export function competitionHistory(archive, gameKey) {
  const real = REAL_HISTORY[realKeyOf(gameKey)] || null;
  const game = [];
  for (const e of archive || []) {
    const w = entryWinners(e).find((x) => x.key === gameKey);
    if (w) game.push({ year: seasonYear(e.year), season: e.year, winner: w.winner, runnerUp: w.runnerUp });
  }
  const counts = {};
  const bump = (id, name) => {
    const k = id || `name:${name}`;
    (counts[k] = counts[k] || { id, name, n: 0, last: 0 }).n += 1;
    return counts[k];
  };
  for (const { year, winners } of real?.years || []) for (const x of winners) { const c = bump(x.id, x.name); c.last = Math.max(c.last, year); }
  for (const g of game) { const c = bump(g.winner, null); c.last = Math.max(c.last, g.year); }
  const most = Object.values(counts).sort((a, b) => b.n - a.n || b.last - a.last);
  return { name: competitionName(gameKey), note: real?.note || null, from: real?.from || null, real: real?.years || [], game, most };
}

// The club's league: its country's top flight.
export const leagueKeyOf = (divisionId) => {
  const div = DIVISION_BY_ID[divisionId];
  return div ? `L:${DIVISIONS.find((d) => d.code === div.code && d.tier === 1).id}` : null;
};

// A summary for sentences: league, domestic cup and continental titles, with the last year
// and how many in the last `window` seasons before `nowYear`.
export function honoursSummary(archive, clubId, divisionId, nowYear, window = 10) {
  const titles = clubTitles(archive, clubId);
  const lk = leagueKeyOf(divisionId);
  const pack = (rows) => {
    const years = rows.flatMap((r) => [...r.real, ...r.game]).filter((y) => y < nowYear).sort((a, b) => a - b);
    return { n: years.length, years, last: years.length ? Math.max(...years) : null, recent: years.filter((y) => y >= nowYear - window && y < nowYear).length, name: rows[0]?.name || null };
  };
  return {
    league: pack(titles.filter((r) => r.key === lk)),
    cup: pack(titles.filter((r) => r.kind === 'cup')),
    continental: pack(titles.filter((r) => r.key.startsWith('K:'))), // the top continental cup only
    continental2: pack(titles.filter((r) => r.key.startsWith('K2:'))),
    world: pack(titles.filter((r) => r.kind === 'world')),
    titles,
  };
}
