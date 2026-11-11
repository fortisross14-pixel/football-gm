// The four yearly awards, decided at season end from the live stats book and the season's trophies.
//   Best Player, Best Goalkeeper, Best Young Player (a card with more than 100 matches left):
//     individual performance, weighted by league level, plus big weight for titles won
//     (a good player who won the Premier League and the European Cup beats a better one who won nothing).
//   Top Scorer: pure league goals, top-flight leagues only.

import { DIVISION_BY_ID } from '../data/world/structure.js';
import { CONTINENT_NAME, CONTINENT2_NAME, CONT_SUPER_NAME, cupName, superCupName } from './competitions.js';

const LEVEL_FACTOR = { 1: 1, 2: 0.6, 3: 0.35 };
const LEAGUE_TITLE = { 1: 6, 2: 2, 3: 1 };
export const YOUNG_MATCHES = 100;

// Title points per club this season, from the archive entry (engine/history.js).
export function titlePoints(entry) {
  const pts = {};
  const add = (id, v, label) => {
    if (!id) return;
    const t = pts[id] || (pts[id] = { v: 0, list: [] });
    t.v += v;
    t.list.push(label);
  };
  for (const [divId, lg] of Object.entries(entry.leagues)) {
    const div = DIVISION_BY_ID[divId];
    add(lg.table[0][0], LEAGUE_TITLE[div.level] || 1, div.name);
  }
  for (const [code, c] of Object.entries(entry.cups)) add(c?.winner, 2, cupName(code));
  for (const [code, c] of Object.entries(entry.supercups || {})) add(c?.winner, 0.5, superCupName(code));
  for (const [k, c] of Object.entries(entry.continental)) add(c?.winner, 7, CONTINENT_NAME[k] || k);
  for (const [k, c] of Object.entries(entry.continental2 || {})) add(c?.winner, 4, CONTINENT2_NAME[k] || k);
  for (const [k, c] of Object.entries(entry.contSuper || {})) add(c?.winner, 1, CONT_SUPER_NAME[k] || k);
  add(entry.cwc?.winner, 4, 'Club World Cup');
  return pts;
}

function totals(row) {
  let apps = 0; let goals = 0; let motm = 0; let cs = 0; let rsum = 0; let leagueGoals = 0; let level = 3; let topGoals = 0;
  for (const [comp, t] of Object.entries(row.s)) {
    apps += t[0]; goals += t[1]; motm += t[2]; cs += t[3]; rsum += t[4];
    if (comp.startsWith('L:')) {
      const lvl = DIVISION_BY_ID[comp.slice(2)]?.level ?? 3;
      level = Math.min(level, lvl);
      leagueGoals += t[1];
      if (lvl === 1) topGoals += t[1];
    }
  }
  return { apps, goals, motm, cs, rating: apps ? rsum / apps : 0, leagueGoals, topGoals, level };
}

// book: stats.season before it resets. matchesLeftOf(id) → number | null (null = never retires).
export function decideAwards(book, entry, { year, matchesLeftOf = () => 0 }) {
  const titles = titlePoints(entry);
  const cands = Object.entries(book.players).map(([id, row]) => ({ id, name: row.n, clubId: row.c, pos: row.p, ...totals(row) })).filter((p) => p.apps >= 10);
  const perf = (p) => ((p.rating - 6.5) * 6 + p.goals * 0.12 + p.motm * 0.35 + (p.pos === 'GK' ? p.cs * 0.3 : 0)) * (LEVEL_FACTOR[p.level] ?? 0.35);
  const score = (p) => perf(p) + (titles[p.clubId]?.v || 0);
  const pick = (list) => {
    const best = [...list].sort((a, b) => score(b) - score(a))[0];
    return best ? { id: best.id, name: best.name, clubId: best.clubId, pos: best.pos, apps: best.apps, goals: best.goals, rating: Math.round(best.rating * 100) / 100, titles: titles[best.clubId]?.list || [] } : null;
  };
  const young = cands.filter((p) => { const left = matchesLeftOf(p.id); return left === null || left > YOUNG_MATCHES; });
  const scorer = Object.entries(book.players).map(([id, row]) => ({ id, name: row.n, clubId: row.c, ...totals(row) })).filter((p) => p.topGoals > 0)
    .sort((a, b) => b.topGoals - a.topGoals || b.rating - a.rating)[0];
  return {
    year,
    best: pick(cands.filter((p) => p.pos !== 'GK')),
    gk: pick(cands.filter((p) => p.pos === 'GK')),
    young: pick(young.filter((p) => p.pos !== 'GK' || true)),
    scorer: scorer ? { id: scorer.id, name: scorer.name, clubId: scorer.clubId, goals: scorer.topGoals, apps: scorer.apps } : null,
  };
}
