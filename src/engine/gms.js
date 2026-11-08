// The other general managers: one per AI club. They earn reputation from results,
// get sacked when they badly miss what their squad should achieve, and move up.
import { makeRng } from './rng.js';
import { SURNAMES } from './aiTeam.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';

const FIRST = ['Álex', 'Marco', 'Luis', 'Jonas', 'Pierre', 'Sven', 'Diego', 'Rui', 'Kenji', 'Omar', 'Tomás', 'Erik', 'Paolo', 'Javi', 'Ivan', 'Hugo', 'Samuel', 'Bruno', 'Leo', 'Nico', 'Ana', 'Sara', 'Elena', 'Marta', 'Ines', 'Lucía', 'Mia', 'Yuki', 'Fatima', 'Grace'];
const BASE_REP = { 1: 62, 2: 38, 3: 18 };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function newGm(rng, level, year) {
  return {
    name: `${rng.pick(FIRST)} ${rng.pick(SURNAMES)}`,
    rep: clamp(BASE_REP[level] + rng.int(-8, 12), 0, 100),
    since: year, titles: 0, cups: 0, intl: 0, seasons: 0, best: null, history: [],
  };
}

// Adds a GM to every AI club that has none (also upgrades older saves).
export function ensureGms(world, seed = 1, year = 1, userClubId = null) {
  const rng = makeRng(seed);
  world.gms = world.gms || {};
  for (const [id, c] of Object.entries(world.clubs)) {
    if (id === userClubId) continue;
    if (!world.gms[id]) world.gms[id] = newGm(rng, c.level, year);
  }
  return world;
}

// After a season: reputation from finish vs expectation (rank by squad strength), trophies;
// a big miss two years running (or one disaster) costs the job.
export function updateGms(world, { archiveEntry, seed, userClubId, year }) {
  const rng = makeRng(seed);
  const sacked = [];
  for (const div of DIVISIONS) {
    const lg = archiveEntry.leagues[div.id];
    if (!lg) continue;
    const ids = lg.table.map((r) => r[0]);
    const expected = [...ids].sort((a, b) => (world.clubs[b]?.strength || 0) - (world.clubs[a]?.strength || 0));
    ids.forEach((id, i) => {
      if (id === userClubId) return;
      const gm = world.gms?.[id];
      if (!gm) return;
      const pos = i + 1;
      const exp = expected.indexOf(id) + 1;
      const weight = { 1: 1, 2: 0.8, 3: 0.6 }[div.level];
      let d = (exp - pos) * 3 * weight;
      if (pos === 1) d += 8 * weight;
      if (pos === ids.length && div.tier > 0) d -= 3;
      gm.rep = clamp(Math.round(gm.rep + d * (1 - gm.rep / 160)), 0, 100);
      gm.seasons += 1;
      if (pos === 1) gm.titles += 1;
      gm.best = gm.best === null ? pos : Math.min(gm.best, pos);
      gm.history = [...gm.history, { year, clubId: id, divId: div.id, pos }].slice(-40);
      gm.miss = exp - pos <= -3 ? (gm.miss || 0) + 1 : 0;
      if (gm.miss >= 2 || exp - pos <= -5) {
        sacked.push({ clubId: id, gm });
        world.gms[id] = newGm(rng, div.level, year + 1);
      }
    });
  }
  for (const c of [...Object.values(archiveEntry.cups), ...Object.values(archiveEntry.continental), archiveEntry.cwc]) {
    const gm = c?.winner && world.gms?.[c.winner];
    if (!gm) continue;
    const intl = Object.values(archiveEntry.continental).includes(c) || c === archiveEntry.cwc;
    if (intl) gm.intl += 1; else gm.cups += 1;
    gm.rep = clamp(gm.rep + (intl ? 8 : 3), 0, 100);
  }
  // Former GMs keep their place in the all-time book.
  world.formerGms = [...(world.formerGms || []), ...sacked.map(({ clubId, gm }) => ({ ...gm, clubId, until: year }))]
    .sort((a, b) => b.titles - a.titles || b.rep - a.rep).slice(0, 60);
  return sacked;
}

export function gmRanking(world, user) {
  const list = Object.entries(world.gms || {}).filter(([clubId]) => clubId !== user?.clubId).map(([clubId, g]) => ({ ...g, clubId, level: DIVISION_BY_ID[world.clubs[clubId].divisionId].level }));
  if (user) list.push(user);
  return list.sort((a, b) => b.rep - a.rep || b.titles - a.titles);
}
