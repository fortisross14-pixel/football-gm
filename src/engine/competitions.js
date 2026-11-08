// Cups, continental tournaments and the Club World Cup, plus the season calendar
// that interleaves them with league matchdays.
import { makeRng } from './rng.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { standings } from './season.js';

// The season, in order. L = league matchday; the rest are midweek rounds.
export const CALENDAR = [
  'L', 'L', 'CQ', 'L', 'CG0', 'CUP0', 'L', 'L', 'CG1', 'CUP1', 'L', 'L', 'CG2', 'L', 'L',
  'CSF', 'CUP2', 'L', 'L', 'L', 'CUP3', 'L', 'L', 'CF', 'CWC0', 'CWC1', 'CWC2', 'CWCF',
];

export const CONTINENTS = ['europe', 'americas', 'afap'];
export const CONTINENT_NAME = { europe: 'European Cup', americas: 'Americas Cup', afap: 'Africa–APAC Cup' };
export const CUP_ROUND_NAME = { 16: ['Round of 16', 'Quarter-final', 'Semi-final', 'Final'], 8: ['Quarter-final', 'Semi-final', 'Final'] };

const COUNTRIES = [...new Map(DIVISIONS.map((d) => [d.code, d])).values()];
const tier1 = (code) => DIVISIONS.find((d) => d.code === code && d.tier === 1);

// ---------------------------------------------------------------------------
// Qualification

// From final tables (or, for season 1, club strength): who plays where next season.
// tables: { divId: [clubId ordered] }, points: { divId: { clubId: pts } }
export function qualifiers(tables, points = {}) {
  const champ = (code) => tables[tier1(code).id][0];
  const runnerUp = (code) => tables[tier1(code).id][1];
  const europe = {
    direct: ['ENG', 'ESP', 'ITA', 'GER'].map(champ),
    qualifying: ['FRA', 'POR', 'NED', 'TUR', 'SCO', 'AUT', 'GRE', 'EUR'].map(champ),
  };
  const americas = [...['ARG', 'BRA', 'MEX', 'USA', 'COL', 'SAM'].map(champ), runnerUp('ARG'), runnerUp('BRA')];
  const afapCodes = ['JPN', 'ASI', 'APC', 'SAU', 'NGA', 'EGY', 'AFR'];
  const bestRunnerUp = afapCodes
    .map((code) => ({ id: runnerUp(code), pts: points[tier1(code).id]?.[runnerUp(code)] ?? 0 }))
    .sort((a, b) => b.pts - a.pts)[0].id;
  return { europe, americas, afap: [...afapCodes.map(champ), bestRunnerUp] };
}

export function tablesByStrength(world) {
  const tables = {};
  for (const div of DIVISIONS) tables[div.id] = [...world.divisions[div.id]].sort((a, b) => world.clubs[b].strength - world.clubs[a].strength);
  return tables;
}

export function tablesFromSeason(season) {
  const tables = {};
  const points = {};
  for (const div of DIVISIONS) {
    const rows = standings(season, div.id);
    tables[div.id] = rows.map((r) => r.id);
    points[div.id] = Object.fromEntries(rows.map((r) => [r.id, r.pts]));
  }
  return { tables, points };
}

// ---------------------------------------------------------------------------
// Setup

const tie = (home, away, opts = {}) => ({ home, away, score: null, pens: null, winner: null, ...opts });

function groupFixtures(ids) {
  const [a, b, c, d] = ids;
  return [
    [tie(a, b), tie(c, d)],
    [tie(d, a), tie(b, c)],
    [tie(a, c), tie(b, d)],
  ];
}

export function createCompetitions(world, qual, seed) {
  const rng = makeRng(seed);
  const shuffle = (list) => [...list].sort(() => rng.next() - 0.5);

  // Domestic cups: division 1 + 2 where there is one, otherwise division 1.
  const cups = {};
  for (const country of COUNTRIES) {
    const divs = DIVISIONS.filter((d) => d.code === country.code && d.tier <= 2);
    const clubs = divs.flatMap((d) => world.divisions[d.id]);
    cups[country.code] = { country: country.country, size: clubs.length, clubs, rounds: [], winner: null };
  }

  const continental = {};
  for (const cont of CONTINENTS) {
    const entrants = cont === 'europe' ? qual.europe.direct : qual[cont];
    continental[cont] = {
      entrants: cont === 'europe' ? [...qual.europe.direct, ...qual.europe.qualifying] : [...entrants],
      qualifying: cont === 'europe' ? pairUp(shuffle(qual.europe.qualifying)) : null,
      groups: cont === 'europe' ? null : makeGroups(shuffle(entrants)),
      semis: null,
      final: null,
      winner: null,
    };
  }
  return { cups, continental, cwc: null };
}

function pairUp(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 2) out.push(tie(ids[i], ids[i + 1]));
  return out;
}

function makeGroups(ids) {
  return [ids.slice(0, 4), ids.slice(4, 8)].map((clubs) => ({
    clubs,
    fixtures: groupFixtures(clubs),
    table: Object.fromEntries(clubs.map((id) => [id, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }])),
  }));
}

export function groupStandings(group) {
  return Object.entries(group.table)
    .map(([id, r]) => ({ id, ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// Which games belong to a calendar slot

const cupStartSlot = (cup) => (cup.size >= 16 ? 0 : 1);

// Makes sure the slot's games exist (draws for cups, semis and finals), then lists them.
// Each entry: { comp, key, game, knockout, neutral, label }
export function prepareSlot(comps, slot, world, seed) {
  const rng = makeRng(seed);
  const games = [];
  if (slot.startsWith('CUP')) {
    const n = Number(slot.slice(3));
    for (const [code, cup] of Object.entries(comps.cups)) {
      const round = n - cupStartSlot(cup);
      if (round < 0 || cup.winner) continue;
      if (!cup.rounds[round]) cup.rounds[round] = drawCupRound(cup, round, world, rng);
      const names = CUP_ROUND_NAME[cup.size >= 16 ? 16 : 8];
      cup.rounds[round].forEach((game) => games.push({ comp: 'cup', key: code, game, knockout: true, neutral: false, label: `${cup.country} Cup · ${names[round]}`, competition: 'cup' }));
    }
  } else if (slot === 'CQ') {
    const e = comps.continental.europe;
    e.qualifying.forEach((game) => games.push({ comp: 'cont', key: 'europe', game, knockout: true, neutral: false, label: `${CONTINENT_NAME.europe} · Qualifying`, competition: 'continental' }));
  } else if (slot.startsWith('CG')) {
    const r = Number(slot.slice(2));
    for (const cont of CONTINENTS) {
      const c = comps.continental[cont];
      if (!c.groups) c.groups = makeGroups(groupEntrants(c, rng));
      c.groups.forEach((g, gi) => g.fixtures[r].forEach((game) => games.push({ comp: 'cont', key: cont, group: gi, game, knockout: false, neutral: false, label: `${CONTINENT_NAME[cont]} · Group ${'AB'[gi]}`, competition: 'continental' })));
    }
  } else if (slot === 'CSF') {
    for (const cont of CONTINENTS) {
      const c = comps.continental[cont];
      if (!c.semis) {
        const [a, b] = c.groups.map(groupStandings);
        c.semis = [tie(a[0].id, b[1].id), tie(b[0].id, a[1].id)];
      }
      c.semis.forEach((game) => games.push({ comp: 'cont', key: cont, game, knockout: true, neutral: false, label: `${CONTINENT_NAME[cont]} · Semi-final`, competition: 'continental' }));
    }
  } else if (slot === 'CF') {
    for (const cont of CONTINENTS) {
      const c = comps.continental[cont];
      if (!c.final) c.final = tie(c.semis[0].winner, c.semis[1].winner, { neutral: true });
      games.push({ comp: 'cont', key: cont, game: c.final, knockout: true, neutral: true, label: `${CONTINENT_NAME[cont]} · Final`, competition: 'continental' });
    }
  } else if (slot.startsWith('CWC')) {
    if (!comps.cwc) {
      const clubs = CONTINENTS.map((cont) => comps.continental[cont].winner);
      const [a, b, c] = clubs;
      comps.cwc = {
        clubs,
        fixtures: [tie(a, b, { neutral: true }), tie(b, c, { neutral: true }), tie(c, a, { neutral: true })],
        table: Object.fromEntries(clubs.map((id) => [id, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }])),
        final: null,
        winner: null,
      };
    }
    if (slot === 'CWCF') {
      if (!comps.cwc.final) {
        const [first, second] = groupStandings(comps.cwc);
        comps.cwc.final = tie(first.id, second.id, { neutral: true });
      }
      games.push({ comp: 'cwc', key: 'cwc', game: comps.cwc.final, knockout: true, neutral: true, label: 'Club World Cup · Final', competition: 'cwc' });
    } else {
      const game = comps.cwc.fixtures[Number(slot.slice(3))];
      games.push({ comp: 'cwc', key: 'cwc', group: true, game, knockout: false, neutral: true, label: 'Club World Cup', competition: 'cwc' });
    }
  }
  return games;
}

// Europe: 4 direct entrants plus the 4 qualifying winners. Others: the entrants as drawn.
function groupEntrants(c, rng) {
  const qualified = c.qualifying ? c.qualifying.map((t) => t.winner) : [];
  const direct = c.entrants.filter((id) => !c.qualifying || !c.qualifying.some((t) => t.home === id || t.away === id));
  return [...direct, ...qualified].sort(() => rng.next() - 0.5);
}

function drawCupRound(cup, round, world, rng) {
  const alive = round === 0 ? [...cup.clubs] : cup.rounds[round - 1].map((g) => g.winner);
  const order = alive.sort(() => rng.next() - 0.5);
  const games = [];
  for (let i = 0; i < order.length; i += 2) {
    const [a, b] = [order[i], order[i + 1]];
    const ta = DIVISION_BY_ID[world.clubs[a].divisionId].tier;
    const tb = DIVISION_BY_ID[world.clubs[b].divisionId].tier;
    // The lower-division club plays at home; the final is at a neutral venue.
    const final = alive.length === 2;
    const [home, away] = ta > tb ? [a, b] : tb > ta ? [b, a] : [a, b];
    games.push(tie(home, away, final ? { neutral: true } : {}));
  }
  return games;
}

// ---------------------------------------------------------------------------
// Results

// Records a result for a slot entry, including penalties for knockout draws.
export function recordGame(comps, entry, score, pens = null) {
  const g = entry.game;
  g.score = [...score];
  if (entry.knockout) {
    if (score[0] !== score[1]) g.winner = score[0] > score[1] ? g.home : g.away;
    else {
      g.pens = pens;
      g.winner = pens[0] > pens[1] ? g.home : g.away;
    }
  }
  if (!entry.knockout) {
    const table = entry.comp === 'cwc' ? comps.cwc.table : comps.continental[entry.key].groups[entry.group].table;
    [[g.home, score[0], score[1]], [g.away, score[1], score[0]]].forEach(([id, gf, ga]) => {
      const r = table[id];
      r.p += 1; r.gf += gf; r.ga += ga;
      if (gf > ga) { r.w += 1; r.pts += 3; } else if (gf === ga) { r.d += 1; r.pts += 1; } else r.l += 1;
    });
  }
  // Trophies
  if (entry.comp === 'cup' && entry.knockout) {
    const cup = comps.cups[entry.key];
    const last = cup.rounds[cup.rounds.length - 1];
    if (last.length === 1 && last[0].winner) cup.winner = last[0].winner;
  }
  if (entry.comp === 'cont' && comps.continental[entry.key].final === g) comps.continental[entry.key].winner = g.winner;
  if (entry.comp === 'cwc' && comps.cwc.final === g) comps.cwc.winner = g.winner;
}

// Fast result for AI games (uses the league engine's quick model); knockout draws go to penalties.
export function quickKnockout(rng, world, entry, quickResult, poolById) {
  const r = quickResult(world, entry.game.home, entry.game.away, poolById, rng, entry.neutral);
  let pens = null;
  if (entry.knockout && r.score[0] === r.score[1]) {
    const sh = world.clubs[entry.game.home].strength;
    const sa = world.clubs[entry.game.away].strength;
    const pHome = Math.min(0.7, Math.max(0.3, 0.5 + (sh - sa) / 60));
    const homeWins = rng.next() < pHome;
    const base = 3 + rng.int(0, 2);
    pens = homeWins ? [base + 1, base] : [base, base + 1];
  }
  return { score: r.score, pens, goals: r.goals };
}

// The stats-book key for a competition entry.
export const compKey = (entry) => (entry.comp === 'cup' ? `C:${entry.key}` : entry.comp === 'cont' ? `K:${entry.key}` : 'W');

export const involves = (entry, clubId) => entry.game.home === clubId || entry.game.away === clubId;
