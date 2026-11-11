// Cups, super cups, continental tournaments and the Club World Cup, plus the season calendar
// that interleaves them with league matchdays.
//
// Competition keys (stats book, archive, real-life history all use them):
//   'L:<divId>'   league                       'C:<code>'   domestic cup
//   'S:<code>'    domestic super cup           'K:<conf>'   continental cup (tier 1, champions)
//   'K2:<conf>'   second continental trophy    'KS:<conf>'  continental super cup (K vs K2 winner)
//   'W'           Club World Cup
// <code> is a country code (DIVISIONS[].code, e.g. ESP), <conf> a confederation id (CONTINENTS).
import { makeRng } from './rng.js';
import { DIVISIONS, DIVISION_BY_ID, CONTINENT_LABEL } from '../data/world/structure.js';
import { standings } from './season.js';

// The season, in order. L = league matchday (18); the rest are midweek rounds.
// S = domestic super cups (matchday 0), KS = continental super cups,
// CP = continental preliminary round, CQ = continental qualifying, CG = continental group games,
// CQF = quarter-finals (16-club tournaments), CSF / CF = semi-finals / finals,
// CUP0 = domestic cup preliminary round (20- and 10-club cups), CUP1–4 the knockout rounds.
export const CALENDAR = [
  'S', 'L', 'KS', 'L', 'CP', 'L', 'CQ', 'L', 'CUP0', 'L', 'CG0', 'L', 'CUP1', 'L', 'L', 'CG1', 'L', 'CUP2', 'L', 'L',
  'CG2', 'L', 'CUP3', 'L', 'CQF', 'L', 'CSF', 'L', 'CUP4', 'L', 'L', 'L', 'CF', 'CWC0', 'CWC1', 'CWC2', 'CWCF',
];
const CUP_SLOTS = CALENDAR.filter((s) => s.startsWith('CUP')).length;

// The six confederations.
export const CONTINENTS = ['europe', 'southamerica', 'northamerica', 'africa', 'asia', 'oceania'];
// Tier 1 (K): the champions' cup.
export const CONTINENT_NAME = {
  europe: 'European Cup', southamerica: 'South American Cup', northamerica: 'North American Cup',
  africa: 'African Cup', asia: 'Asian Cup', oceania: 'Oceania Cup',
};
// Tier 2 (K2): cup winners and the next-placed league clubs. Oceania has none.
export const CONTINENT2_NAME = {
  europe: 'European Trophy', southamerica: 'South American Trophy', northamerica: 'North American Trophy',
  africa: 'African Trophy', asia: 'Asian Trophy',
};
export const CONTINENTS2 = Object.keys(CONTINENT2_NAME);
// KS: the K winner against the K2 winner, at the start of the next season.
export const CONT_SUPER_NAME = Object.fromEntries(CONTINENTS2.map((k) => [k, `${CONTINENT_LABEL[k]} Super Cup`]));
export const COUNTRY_OF = Object.fromEntries(DIVISIONS.map((d) => [d.code, d.country]));
export const cupName = (code) => `${COUNTRY_OF[code] || code} Cup`;
export const superCupName = (code) => (code === 'ENG' ? 'Community Shield' : `${COUNTRY_OF[code] || code} Super Cup`);

// Which kind of trophy a trophy name is: continental | continental2 | contsuper | supercup | cwc | cup.
const NAME_KIND = {
  'Club World Cup': 'cwc',
  ...Object.fromEntries(Object.values(CONTINENT_NAME).map((n) => [n, 'continental'])),
  ...Object.fromEntries(Object.values(CONTINENT2_NAME).map((n) => [n, 'continental2'])),
  ...Object.fromEntries(Object.values(CONT_SUPER_NAME).map((n) => [n, 'contsuper'])),
};
export const trophyKind = (name) => NAME_KIND[name] || (/Super Cup$|Community Shield$/.test(name) ? 'supercup' : 'cup');

const BRACKET_ROUND = { 16: 'Round of 16', 8: 'Quarter-final', 4: 'Semi-final', 2: 'Final' };

// Domestic cups: the knockout bracket is the largest power of two that fits (16 from divisions
// 1 + 2, 8 from a single division). The weakest clubs play a preliminary round for the last places.
const bracketOf = (n) => 2 ** Math.floor(Math.log2(Math.max(2, n)));
export const cupHasPrelim = (cup) => cup.size > bracketOf(cup.size);
export function cupRoundNames(cup) {
  const names = [];
  if (cupHasPrelim(cup)) names.push('Preliminary round');
  for (let n = bracketOf(cup.size); n >= 2; n /= 2) names.push(BRACKET_ROUND[n] || `Round of ${n}`);
  return names;
}

export const COUNTRIES = [...new Map(DIVISIONS.map((d) => [d.code, d])).values()];
const tier1 = (code) => DIVISIONS.find((d) => d.code === code && d.tier === 1);

// ---------------------------------------------------------------------------
// Formats
//
// Each continental tournament: direct entrants plus a qualifying list (strongest first) for the
// remaining group places. More than two per place: the last-listed play a preliminary round.
// Fewer: the first-listed get a bye. Groups of 4 (single round-robin): 1 group → final (top two),
// 2 groups → semi-finals → final, 4 groups → quarter-finals → semi-finals → final.
//
// Domestic picks per country, from last season: league positions (pos 0 = champion) and the
// cup winner; "K2" picks take the cup winner, then the best-placed league clubs not already in.
export const FORMATS = {
  europe: {
    k: { groups: 2, direct: [['ENG', 1], ['ESP', 1], ['ITA', 1], ['GER', 1]], qualifying: [['FRA', 1], ['POR', 1], ['NED', 1], ['TUR', 1], ['BEL', 1], ['SCO', 1], ['AUT', 1], ['GRE', 1], ['DEN', 1], ['SUI', 1], ['EUR', 1]] },
    k2: { groups: 4, direct: [['ENG', 2], ['ESP', 2], ['ITA', 2], ['GER', 2]], qualifying: [['FRA', 2], ['POR', 2], ['NED', 2], ['TUR', 2], ['BEL', 2], ['SCO', 2], ['AUT', 2], ['GRE', 2], ['DEN', 2], ['SUI', 2], ['EUR', 2]] },
  },
  southamerica: {
    k: { groups: 2, direct: [['ARG', 2], ['BRA', 2]], qualifying: [['COL', 1], ['CHI', 1], ['SAM', 1], ['ARG', 1], ['BRA', 1], ['COL', 1], ['CHI', 1], ['SAM', 1]] },
    k2: { groups: 4, direct: [['ARG', 4], ['BRA', 4], ['COL', 2], ['CHI', 2]], qualifying: [['SAM', 2], ['COL', 2], ['CHI', 2], ['SAM', 2]] },
  },
  // Owner's format: the Mexican, US and North America Other champions go straight in; the Mexican
  // and US runners-up play off for the fourth place; one group, the top two play the final.
  northamerica: {
    k: { groups: 1, direct: [['MEX', 1], ['USA', 1], ['NAO', 1]], qualifying: [['MEX', 1], ['USA', 1]] },
    k2: { groups: 1, direct: [['MEX', 2], ['USA', 1], ['NAO', 1]], qualifying: [] },
  },
  africa: {
    k: { groups: 1, direct: [['EGY', 1], ['NGA', 1], ['AFR', 1]], qualifying: [['EGY', 1], ['AFR', 1]] },
    k2: { groups: 1, direct: [['EGY', 1], ['NGA', 1], ['AFR', 2]], qualifying: [] },
  },
  asia: {
    k: { groups: 2, direct: [['JPN', 2], ['SAU', 2], ['ASI', 2], ['APC', 2]], qualifying: [] },
    k2: { groups: 2, direct: [['JPN', 2], ['SAU', 2], ['ASI', 2], ['APC', 2]], qualifying: [] },
  },
  // One league: its top three and the cup winner (next-placed if already in).
  oceania: {
    k: { groups: 1, direct: [['OCE', 3]], qualifying: [], cupWinner: true },
    k2: null,
  },
};

// ---------------------------------------------------------------------------
// Qualification

// From final tables (or, for season 1, club strength): who plays where next season.
// tables: { divId: [clubId ordered] }, points: { divId: { clubId: pts } } (unused, kept for callers),
// cups: { code: { winner, runnerUp } } this season's cup finals, cont: { conf: { k, k2 } } winners.
// Returns { continental: { conf: { k: { direct, qualifying }, k2 } }, super: { code: [a, b] }, contSuper: { conf: [a, b] } }.
export function qualifiers(tables, points = {}, { cups = null, cont = null } = {}) {
  void points;
  const table = (code) => tables[tier1(code).id] || [];
  const cupOf = (code) => cups?.[code] || { winner: table(code)[1], runnerUp: table(code)[2] };
  const continental = {};
  for (const conf of CONTINENTS) {
    const format = FORMATS[conf];
    const taken = new Set();
    // League picks: next n best-placed not taken.
    const league = (code, n) => {
      const out = [];
      for (const id of table(code)) {
        if (out.length >= n) break;
        if (id && !taken.has(id)) { taken.add(id); out.push(id); }
      }
      return out;
    };
    // K2 picks: the cup winner first (if not taken), then league picks.
    const withCup = (code, n) => {
      const out = [];
      const w = cupOf(code).winner;
      if (n > 0 && w && !taken.has(w)) { taken.add(w); out.push(w); }
      return [...out, ...league(code, n - out.length)];
    };
    const build = (spec, pick) => (spec ? {
      groups: spec.groups,
      direct: spec.direct.flatMap(([code, n]) => pick(code, n)),
      qualifying: spec.qualifying.flatMap(([code, n]) => pick(code, n)),
    } : null);
    const k = build(format.k, league);
    if (format.k.cupWinner) k.direct.push(...withCup(format.k.direct[0][0], 1));
    // K2 counts its picks per country across direct and qualifying (a country listed twice continues).
    const k2 = build(format.k2, withCupOnce(withCup, league));
    continental[conf] = { k, k2 };
  }
  // Domestic super cups: league champion against the cup winner (the runner-up if they're the same).
  const superCups = {};
  for (const { code } of COUNTRIES) {
    const champ = table(code)[0];
    const cup = cupOf(code);
    const other = cup.winner && cup.winner !== champ ? cup.winner : (cup.runnerUp && cup.runnerUp !== champ ? cup.runnerUp : table(code)[1]);
    if (champ && other && champ !== other) superCups[code] = [champ, other];
  }
  // Continental super cups: K winner against K2 winner (season 1: the first-listed entrants).
  const contSuper = {};
  for (const conf of CONTINENTS2) {
    const a = cont?.[conf]?.k ?? continental[conf].k.direct[0];
    const b = cont?.[conf]?.k2 ?? continental[conf].k2?.direct[0];
    if (a && b && a !== b) contSuper[conf] = [a, b];
  }
  return { continental, super: superCups, contSuper };
}

// The first pick of each country in K2 takes the cup winner; later picks are league places.
function withCupOnce(withCup, league) {
  const seen = new Set();
  return (code, n) => {
    if (seen.has(code)) return league(code, n);
    seen.add(code);
    return withCup(code, n);
  };
}

// Every club in a continental tournament next season (K or K2).
export function continentalClubs(qual) {
  const out = new Set();
  for (const c of Object.values(qual?.continental || {})) {
    for (const t of [c.k, c.k2]) for (const id of [...(t?.direct || []), ...(t?.qualifying || [])]) out.add(id);
  }
  return out;
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

// This season's cup finals and continental winners, for next season's qualification.
export function seasonResults(comps) {
  const cups = {};
  for (const [code, cup] of Object.entries(comps?.cups || {})) {
    const fin = cup.rounds?.at(-1)?.length === 1 ? cup.rounds.at(-1)[0] : null;
    if (cup.winner) cups[code] = { winner: cup.winner, runnerUp: fin ? (fin.winner === fin.home ? fin.away : fin.home) : null };
  }
  const cont = {};
  for (const conf of CONTINENTS) cont[conf] = { k: comps?.continental?.[conf]?.winner || null, k2: comps?.continental2?.[conf]?.winner || null };
  return { cups, cont };
}

// ---------------------------------------------------------------------------
// Setup

const tie = (home, away, opts = {}) => ({ home, away, score: null, pens: null, winner: null, ...opts });
const emptyRow = () => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

function groupFixtures(ids) {
  if (ids.length === 3) {
    const [a, b, c] = ids;
    return [[tie(a, b, { neutral: true })], [tie(b, c, { neutral: true })], [tie(c, a, { neutral: true })]];
  }
  const [a, b, c, d] = ids;
  return [
    [tie(a, b), tie(c, d)],
    [tie(d, a), tie(b, c)],
    [tie(a, c), tie(b, d)],
  ];
}

function pairUp(ids) {
  const out = [];
  for (let i = 0; i + 1 < ids.length; i += 2) out.push(tie(ids[i], ids[i + 1]));
  return out;
}

function makeGroups(ids, n, size = 4) {
  return Array.from({ length: n }, (_, i) => ids.slice(i * size, i * size + size)).map((clubs) => ({
    clubs,
    fixtures: groupFixtures(clubs),
    table: Object.fromEntries(clubs.map((id) => [id, emptyRow()])),
  }));
}

export function groupStandings(group) {
  return Object.entries(group.table)
    .map(([id, r]) => ({ id, ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

// One continental tournament from its entry lists.
function createTournament(conf, tier, spec, shuffle) {
  const places = 4 * spec.groups;
  const direct = [...spec.direct];
  const q = [...spec.qualifying];
  const slots = places - direct.length;
  const t = {
    conf, tier, nGroups: spec.groups, entrants: [...direct, ...q], direct, prelim: null, seeded: null, qualifying: null,
    groups: null, quarters: null, semis: null, final: null, winner: null,
  };
  if (q.length > 2 * slots) {
    const extra = q.length - 2 * slots;
    t.prelim = pairUp(shuffle(q.slice(q.length - 2 * extra)));
    t.seeded = q.slice(0, q.length - 2 * extra);
  } else if (q.length > slots) {
    const byes = 2 * slots - q.length;
    direct.push(...q.slice(0, byes));
    t.qualifying = pairUp(shuffle(q.slice(byes)));
  } else direct.push(...q);
  if (!t.prelim && !t.qualifying) t.groups = makeGroups(shuffle(direct), spec.groups);
  return t;
}

export function createCompetitions(world, qual, seed) {
  const rng = makeRng(seed);
  const shuffle = (list) => [...list].sort(() => rng.next() - 0.5);

  // Domestic cups: division 1 + 2 where there is one, otherwise division 1.
  const cups = {};
  for (const country of COUNTRIES) {
    const divs = DIVISIONS.filter((d) => d.code === country.code && d.tier <= 2);
    const clubs = divs.flatMap((d) => world.divisions[d.id]);
    const cup = { country: country.country, size: clubs.length, clubs, byes: [...clubs], rounds: [], winner: null };
    if (cupHasPrelim(cup)) {
      // The lowest-ranked clubs (lower division first, then weakest) play the preliminary round.
      const rank = (id) => DIVISION_BY_ID[world.clubs[id].divisionId].tier * 1000 - (world.clubs[id].strength ?? 0);
      const order = [...clubs].sort((a, b) => rank(b) - rank(a) || a.localeCompare(b));
      const prelim = order.slice(0, 2 * (cup.size - bracketOf(cup.size)));
      cup.prelim = prelim;
      cup.byes = clubs.filter((id) => !prelim.includes(id));
    }
    cups[country.code] = cup;
  }

  // Super cups: one match at a neutral venue on matchday 0.
  const supercups = {};
  for (const [code, pair] of Object.entries(qual.super || {})) {
    if (!pair.every((id) => world.clubs[id])) continue;
    supercups[code] = { clubs: [...pair], game: tie(pair[0], pair[1], { neutral: true }), winner: null };
  }
  const contSuper = {};
  for (const [conf, pair] of Object.entries(qual.contSuper || {})) {
    if (!pair.every((id) => world.clubs[id])) continue;
    contSuper[conf] = { clubs: [...pair], game: tie(pair[0], pair[1], { neutral: true }), winner: null };
  }

  const continental = {};
  const continental2 = {};
  for (const conf of CONTINENTS) {
    const q = qual.continental?.[conf];
    if (!q) continue;
    continental[conf] = createTournament(conf, 1, q.k, shuffle);
    if (q.k2) continental2[conf] = createTournament(conf, 2, q.k2, shuffle);
  }
  return { cups, supercups, continental, continental2, contSuper, cwc: null };
}

// ---------------------------------------------------------------------------
// Which games belong to a calendar slot

// Every cup's final is in the last CUP slot; smaller cups start later.
const cupStartSlot = (cup) => CUP_SLOTS - cupRoundNames(cup).length;

const tournaments = (comps) => [
  ...Object.values(comps.continental || {}).map((t) => ({ t, comp: 'cont', competition: 'continental', name: CONTINENT_NAME[t.conf] })),
  ...Object.values(comps.continental2 || {}).map((t) => ({ t, comp: 'cont2', competition: 'continental2', name: CONTINENT2_NAME[t.conf] })),
];
export const tournamentOf = (comps, comp, key) => (comp === 'cont2' ? comps.continental2?.[key] : comps.continental?.[key]);

// Group places → knockout ties: A1–B2, B1–A2 (and C1–D2, D1–C2), winners at home.
function afterGroups(t) {
  const tables = t.groups.map(groupStandings);
  if (t.nGroups === 1) return [tie(tables[0][0].id, tables[0][1].id, { neutral: true })];
  const out = [];
  for (let i = 0; i < t.nGroups; i += 2) {
    const [a, b] = [tables[i], tables[i + 1]];
    out.push(tie(a[0].id, b[1].id), tie(b[0].id, a[1].id));
  }
  return out;
}

// Makes sure the slot's games exist (draws for cups, semis and finals), then lists them.
// Each entry: { comp, key, game, knockout, neutral, label, competition }
export function prepareSlot(comps, slot, world, seed) {
  const rng = makeRng(seed);
  const games = [];
  const push = (meta, game, round, extra = {}) => games.push({
    comp: meta.comp, key: meta.t.conf, game, knockout: true, neutral: !!game.neutral, label: `${meta.name} · ${round}`, competition: meta.competition, ...extra,
  });
  if (slot === 'S') {
    for (const [code, sc] of Object.entries(comps.supercups || {})) {
      games.push({ comp: 'super', key: code, game: sc.game, knockout: true, neutral: true, label: superCupName(code), competition: 'supercup' });
    }
  } else if (slot === 'KS') {
    for (const [conf, sc] of Object.entries(comps.contSuper || {})) {
      games.push({ comp: 'csuper', key: conf, game: sc.game, knockout: true, neutral: true, label: CONT_SUPER_NAME[conf], competition: 'contsuper' });
    }
  } else if (slot.startsWith('CUP')) {
    const n = Number(slot.slice(3));
    for (const [code, cup] of Object.entries(comps.cups)) {
      const round = n - cupStartSlot(cup);
      if (round < 0 || cup.winner) continue;
      if (round >= cupRoundNames(cup).length) continue;
      if (!cup.rounds[round]) cup.rounds[round] = drawCupRound(cup, round, world, rng);
      const names = cupRoundNames(cup);
      cup.rounds[round].forEach((game) => games.push({ comp: 'cup', key: code, game, knockout: true, neutral: false, label: `${cup.country} Cup · ${names[round]}`, competition: 'cup' }));
    }
  } else if (slot === 'CP') {
    for (const m of tournaments(comps)) (m.t.prelim || []).forEach((g) => push(m, g, 'Preliminary round'));
  } else if (slot === 'CQ') {
    for (const m of tournaments(comps)) {
      const { t } = m;
      if (!t.qualifying && t.prelim) t.qualifying = pairUp([...(t.seeded || []), ...t.prelim.map((x) => x.winner)].sort(() => rng.next() - 0.5));
      (t.qualifying || []).forEach((g) => push(m, g, 'Qualifying'));
    }
  } else if (slot.startsWith('CG')) {
    const r = Number(slot.slice(2));
    for (const m of tournaments(comps)) {
      const { t } = m;
      if (!t.groups) t.groups = makeGroups(groupEntrants(t, rng), t.nGroups);
      t.groups.forEach((g, gi) => g.fixtures[r].forEach((game) => games.push({
        comp: m.comp, key: t.conf, group: gi, game, knockout: false, neutral: false, label: `${m.name} · Group ${'ABCD'[gi]}`, competition: m.competition,
      })));
    }
  } else if (slot === 'CQF') {
    for (const m of tournaments(comps)) {
      const { t } = m;
      if (t.nGroups !== 4) continue;
      if (!t.quarters) t.quarters = afterGroups(t);
      t.quarters.forEach((g) => push(m, g, 'Quarter-final'));
    }
  } else if (slot === 'CSF') {
    for (const m of tournaments(comps)) {
      const { t } = m;
      if (t.nGroups === 1) continue;
      if (!t.semis) t.semis = t.nGroups === 2 ? afterGroups(t) : [tie(t.quarters[0].winner, t.quarters[1].winner), tie(t.quarters[2].winner, t.quarters[3].winner)];
      t.semis.forEach((g) => push(m, g, 'Semi-final'));
    }
  } else if (slot === 'CF') {
    for (const m of tournaments(comps)) {
      const { t } = m;
      if (!t.final) t.final = t.nGroups === 1 ? afterGroups(t)[0] : tie(t.semis[0].winner, t.semis[1].winner, { neutral: true });
      push(m, t.final, 'Final');
    }
  } else if (slot.startsWith('CWC')) {
    if (!comps.cwc) comps.cwc = createCwc(comps, rng);
    const cwc = comps.cwc;
    if (slot === 'CWCF') {
      if (!cwc.final) {
        const [a, b] = cwc.groups.map(groupStandings);
        cwc.final = tie(a[0].id, b[0].id, { neutral: true });
      }
      games.push({ comp: 'cwc', key: 'cwc', game: cwc.final, knockout: true, neutral: true, label: 'Club World Cup · Final', competition: 'cwc' });
    } else {
      const r = Number(slot.slice(3));
      cwc.groups.forEach((g, gi) => g.fixtures[r].forEach((game) => games.push({ comp: 'cwc', key: 'cwc', group: gi, game, knockout: false, neutral: true, label: `Club World Cup · Group ${'AB'[gi]}`, competition: 'cwc' })));
    }
  }
  return games;
}

// The six continental champions: two groups of three (Europe and South America apart), the group
// winners play the final.
function createCwc(comps, rng) {
  const winners = CONTINENTS.map((conf) => comps.continental?.[conf]?.winner).filter(Boolean);
  const [eu, sa, ...rest] = winners;
  const others = rest.sort(() => rng.next() - 0.5);
  const half = Math.ceil(others.length / 2);
  const groups = [[eu, ...others.slice(0, half)], [sa, ...others.slice(half)]].map((clubs) => ({
    clubs, fixtures: groupFixtures(clubs), table: Object.fromEntries(clubs.map((id) => [id, emptyRow()])),
  }));
  return { clubs: winners, groups, final: null, winner: null };
}

// Direct entrants plus the qualifying winners, drawn into groups.
function groupEntrants(t, rng) {
  const qualified = (t.qualifying || []).map((x) => x.winner);
  return [...t.direct, ...qualified].sort(() => rng.next() - 0.5);
}

function drawCupRound(cup, round, world, rng) {
  const prelim = cupHasPrelim(cup);
  const winners = round > 0 ? cup.rounds[round - 1].map((g) => g.winner) : [];
  let alive;
  if (round === 0) alive = prelim ? [...cup.prelim] : [...cup.clubs];
  else if (round === 1 && prelim) alive = [...cup.byes, ...winners];
  else alive = winners;
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
  } else {
    const table = entry.comp === 'cwc' ? comps.cwc.groups[entry.group].table : tournamentOf(comps, entry.comp, entry.key).groups[entry.group].table;
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
    if (cup.rounds.length === cupRoundNames(cup).length && last.length === 1 && last[0].winner) cup.winner = last[0].winner;
  }
  if (entry.comp === 'super') comps.supercups[entry.key].winner = g.winner;
  if (entry.comp === 'csuper') comps.contSuper[entry.key].winner = g.winner;
  if (entry.comp === 'cont' || entry.comp === 'cont2') {
    const t = tournamentOf(comps, entry.comp, entry.key);
    if (t.final === g) t.winner = g.winner;
  }
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
const KEY_PREFIX = { cup: 'C', super: 'S', cont: 'K', cont2: 'K2', csuper: 'KS' };
export const compKey = (entry) => (entry.comp === 'cwc' ? 'W' : `${KEY_PREFIX[entry.comp]}:${entry.key}`);

// A user game's competition ({ competition }) as a competition reference for the UI.
//   { type: 'league' | 'cup' | 'super' | 'cont' | 'cont2' | 'csuper' | 'cwc', id }
export function compRefOf(competition, divisionId) {
  const div = DIVISION_BY_ID[divisionId];
  switch (competition) {
    case 'cup': return { type: 'cup', id: div.code };
    case 'supercup': return { type: 'super', id: div.code };
    case 'continental': return { type: 'cont', id: div.continent };
    case 'continental2': return { type: 'cont2', id: div.continent };
    case 'contsuper': return { type: 'csuper', id: div.continent };
    case 'cwc': return { type: 'cwc', id: 'cwc' };
    default: return { type: 'league', id: divisionId };
  }
}
// A competition reference as its key, and back.
const REF_PREFIX = { cup: 'C', super: 'S', cont: 'K', cont2: 'K2', csuper: 'KS' };
export const refKey = (ref) => (ref.type === 'league' ? `L:${ref.id}` : ref.type === 'cwc' ? 'W' : `${REF_PREFIX[ref.type]}:${ref.id}`);
// The name of any competition key.
export function keyName(key) {
  if (key === 'W') return 'Club World Cup';
  const [kind, ref] = key.split(':');
  if (kind === 'L') return DIVISION_BY_ID[ref]?.name || ref;
  if (kind === 'C') return cupName(ref);
  if (kind === 'S') return superCupName(ref);
  if (kind === 'K') return CONTINENT_NAME[ref] || ref;
  if (kind === 'K2') return CONTINENT2_NAME[ref] || ref;
  if (kind === 'KS') return CONT_SUPER_NAME[ref] || ref;
  return key;
}
export const involves = (entry, clubId) => entry.game.home === clubId || entry.game.away === clubId;
