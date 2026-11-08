// The history book: every season's champions, awards and records, for every
// league and cup in the world, plus all-time player and club records.
// Everything is stored by id (clubs and cards keep their names forever).

import { DIVISIONS } from '../data/world/structure.js';
import { standings, topScorers } from './season.js';
import { CONTINENTS } from './competitions.js';

// Player of the Season: goals, with a bonus for where the club finished.
const POS_BONUS = [4, 2, 1];

const finalOf = (tie) => (tie?.winner ? { winner: tie.winner, runnerUp: tie.winner === tie.home ? tie.away : tie.home } : null);

// A compact record of one finished season. `gkOf(clubId)` names the club's keeper.
export function archiveSeason(season, { gkOf, known = () => false }) {
  const leagues = {};
  for (const div of DIVISIONS) {
    const table = standings(season, div.id);
    if (!table.length) continue;
    const order = table.map((r) => r.id);
    const scorers = topScorers(season, div.id, 60);
    const top = scorers[0] || null;
    let mvp = null;
    let best = -1;
    for (const s of scorers) {
      const pos = order.indexOf(s.clubId);
      const v = s.goals + (POS_BONUS[pos] || 0);
      if (v > best) { best = v; mvp = s; }
    }
    const glove = [...table].sort((a, b) => a.ga - b.ga || (b.cs || 0) - (a.cs || 0) || b.pts - a.pts)[0];
    const keeper = gkOf(glove.id);
    const tuple = (x) => (known(x.id) ? [x.id, x.clubId, x.goals] : [x.id, x.clubId, x.goals, x.name]);
    leagues[div.id] = {
      table: table.map((r) => [r.id, r.pts, r.gf, r.ga, r.cs || 0, r.w, r.d, r.l]),
      top: top && tuple(top),
      mvp: mvp && tuple(mvp),
      glove: [keeper?.id || null, glove.id, glove.ga, glove.cs || 0, ...(keeper && !known(keeper.id) ? [keeper.name] : [])],
      // Top 8 kept forever; names only for cards outside the card pool (generic and academy players).
      scorers: scorers.slice(0, 8).map(tuple),
      allScorers: scorers.map((s) => [s.id, s.name, s.clubId, s.goals]), // folded into records, then dropped
    };
  }
  const cups = {};
  for (const [code, cup] of Object.entries(season.comps?.cups || {})) {
    const last = cup.rounds.at(-1);
    cups[code] = last?.length === 1 ? finalOf(last[0]) : (cup.winner ? { winner: cup.winner, runnerUp: null } : null);
  }
  const continental = {};
  for (const k of CONTINENTS) continental[k] = finalOf(season.comps?.continental?.[k]?.final);
  return { year: season.year, leagues, cups, continental, cwc: finalOf(season.comps?.cwc?.final) };
}

// All-time records folded season by season (so we never re-scan the archive for players).
export function foldRecords(records, entry, known = () => false) {
  const next = records ? structuredClone(records) : { players: {} };
  // Compact keys: g goals, m MVP awards, b golden boots, k golden gloves, s scoring seasons,
  // x best season, c goals by club, l last club, n name (only for cards outside the pool).
  const get = (id, name, clubId) => {
    const p = next.players[id] || { g: 0, s: 0, x: 0, c: {} };
    if (name && !known(id)) p.n = name;
    if (clubId) p.l = clubId;
    next.players[id] = p;
    return p;
  };
  for (const lg of Object.values(entry.leagues)) {
    for (const [id, name, clubId, goals] of lg.allScorers || []) {
      const p = get(id, name, clubId);
      p.g += goals;
      p.s += 1;
      p.x = Math.max(p.x, goals);
      p.c[clubId] = (p.c[clubId] || 0) + goals;
    }
    const award = (t, key) => { if (t?.[0]) { const p = get(t[0], t[3], t[1]); p[key] = (p[key] || 0) + 1; } };
    award(lg.top, 'b');
    award(lg.mvp, 'm');
    if (lg.glove?.[0]) { const p = get(lg.glove[0], lg.glove[4], lg.glove[1]); p.k = (p.k || 0) + 1; }
  }
  return next;
}

// A record as a readable object.
export const recordRow = (id, p, nameOf) => ({
  id, name: p.n || nameOf(id) || '?', goals: p.g, mvp: p.m || 0, boots: p.b || 0, gloves: p.k || 0,
  seasons: p.s, best: p.x, clubs: p.c, last: p.l,
});

// Awards stored as tuples, as objects.
export const awardRow = (t, nameOf) => (t ? { id: t[0], clubId: t[1], goals: t[2], name: t[3] || nameOf(t[0]) || '?' } : null);
export const gloveRow = (t, nameOf) => (t ? { id: t[0], clubId: t[1], ga: t[2], cs: t[3], name: t[4] || (t[0] ? nameOf(t[0]) : null) } : null);

// Drops the working data that only foldRecords needs.
export function compactEntry(entry) {
  const out = structuredClone(entry);
  for (const lg of Object.values(out.leagues)) delete lg.allScorers;
  return out;
}

// A stored scorer tuple as an object. nameOf(id) resolves pool cards.
export const scorerRow = (t, nameOf) => ({ id: t[0], clubId: t[1], goals: t[2], name: t[3] || nameOf(t[0]) || '?' });

// Honours and season-by-season finishes for one club, from the archive.
export function clubHistory(archive, clubId) {
  const honours = { league: 0, cup: 0, continental: 0, cwc: 0, runnerUp: 0 };
  const seasons = [];
  for (const entry of archive) {
    for (const [divId, lg] of Object.entries(entry.leagues)) {
      const pos = lg.table.findIndex((r) => r[0] === clubId);
      if (pos < 0) continue;
      const r = lg.table[pos];
      const row = { year: entry.year, divId, pos: pos + 1, pts: r[1], gf: r[2], ga: r[3], w: r[5], d: r[6], l: r[7], trophies: [] };
      if (pos === 0) { honours.league += 1; row.trophies.push('league'); }
      if (pos === 1) honours.runnerUp += 1;
      const scorer = lg.scorers.find((s) => s[1] === clubId);
      if (scorer) row.scorer = { id: scorer[0], name: scorer[3] || null, goals: scorer[2] };
      seasons.push(row);
    }
    for (const c of Object.values(entry.cups)) if (c?.winner === clubId) { honours.cup += 1; seasons.at(-1)?.trophies.push('cup'); }
    for (const c of Object.values(entry.continental)) if (c?.winner === clubId) { honours.continental += 1; seasons.at(-1)?.trophies.push('continental'); }
    if (entry.cwc?.winner === clubId) { honours.cwc += 1; seasons.at(-1)?.trophies.push('cwc'); }
  }
  return { honours, seasons: seasons.reverse() };
}

// Title counts for every club (optionally only one league), most decorated first.
export function titleTable(archive, divIds = null) {
  const rows = {};
  const get = (id) => (rows[id] = rows[id] || { id, league: 0, runnerUp: 0, cup: 0, continental: 0, cwc: 0 });
  for (const entry of archive) {
    for (const [divId, lg] of Object.entries(entry.leagues)) {
      if (divIds && !divIds.includes(divId)) continue;
      get(lg.table[0][0]).league += 1;
      if (lg.table[1]) get(lg.table[1][0]).runnerUp += 1;
    }
    if (!divIds) {
      for (const c of Object.values(entry.cups)) if (c?.winner) get(c.winner).cup += 1;
      for (const c of Object.values(entry.continental)) if (c?.winner) get(c.winner).continental += 1;
      if (entry.cwc?.winner) get(entry.cwc.winner).cwc += 1;
    }
  }
  const total = (r) => r.league + r.cup + r.continental * 2 + r.cwc * 3;
  return Object.values(rows).sort((a, b) => total(b) - total(a) || b.league - a.league || b.runnerUp - a.runnerUp);
}

// Leaders from the folded player records. key: goals | mvp | boots | gloves | best
export function playerLeaders(records, key, nameOf, limit = 15) {
  if (!records) return [];
  return Object.entries(records.players)
    .map(([id, p]) => recordRow(id, p, nameOf))
    .filter((p) => (p[key] || 0) > 0)
    .sort((a, b) => b[key] - a[key] || b.goals - a.goals)
    .slice(0, limit);
}

// The single best league seasons ever (goals in one season).
export function bestSeasons(archive, divIds = null, limit = 10) {
  const out = [];
  for (const entry of archive) {
    for (const [divId, lg] of Object.entries(entry.leagues)) {
      if (divIds && !divIds.includes(divId)) continue;
      for (const [id, clubId, goals, name] of lg.scorers.slice(0, 3)) out.push({ id, name: name || null, clubId, goals, year: entry.year, divId });
    }
  }
  return out.sort((a, b) => b.goals - a.goals || a.year - b.year).slice(0, limit);
}

// Player leaders inside some leagues only, from the archived top-8 scorer lists and awards.
export function leagueLeaders(archive, divIds, nameOf) {
  const rows = {};
  const get = (id, clubId, name) => (rows[id] = rows[id] || { id, name: name || nameOf(id) || '?', goals: 0, mvp: 0, boots: 0, gloves: 0, best: 0, last: clubId });
  for (const entry of archive) {
    for (const divId of divIds) {
      const lg = entry.leagues[divId];
      if (!lg) continue;
      for (const [id, clubId, goals, name] of lg.scorers) { const r = get(id, clubId, name); r.goals += goals; r.best = Math.max(r.best, goals); r.last = clubId; }
      if (lg.top) get(lg.top[0], lg.top[1], lg.top[3]).boots += 1;
      if (lg.mvp) get(lg.mvp[0], lg.mvp[1], lg.mvp[3]).mvp += 1;
      if (lg.glove?.[0]) get(lg.glove[0], lg.glove[1], lg.glove[4]).gloves += 1;
    }
  }
  return Object.values(rows);
}
