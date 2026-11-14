// National teams (v2.5): call-ups, qualifiers and the summer tournaments.
//
// A four-year cycle (season 1 = 2027). Europe:    qualifiers → European Championship → World Cup
// qualifiers → World Cup. Americas, Africa, Asia-Pacific: their continental cup (no qualifiers,
// the 16 strongest nations, 12 in Africa) → World Cup qualifiers → continental cup → World Cup.
//
//   year      Europe                    Americas / Africa / Asia-Pacific
//   2027      Euro qualifiers           continental cup
//   2028      European Championship     World Cup qualifiers
//   2029      World Cup qualifiers      continental cup
//   2030      World Cup (16 nations: Europe 7, Americas 4, Africa 3, Asia-Pacific 2)
//
// Qualifiers: one season, six international windows (N0–N5). Each confederation is drawn by pots
// into groups of 3–4, home and away. Group winners first, then the best runners-up, … by points
// per game. Tournaments (T slots, after the club season): groups of four, single round-robin at
// neutral venues; 2 groups → semi-finals, 3 or 4 groups → quarter-finals (with 3 groups, the two
// best third-placed nations too); then the final.
//
// Who plays: the nation's named players at clubs around the world (and in your squad), plus the
// players its clubs' academies produce for the national team (generic, by the nation's prestige).
import { makeRng } from './rng.js';
import { overall } from './cards.js';
import { makeGenericCard, pickSquad, squadStrength } from './aiTeam.js';
import { PHILOSOPHIES, coachStyle } from '../data/philosophies.js';
import { NATIONS } from '../data/nations.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import {
  NATIONAL_TEAMS, NATION_CODES, INTL_CONFS, YOUTH_RATING, clubNation,
} from '../data/nationalTeams.js';

export const CYCLE_START = 2027;
export const WC_SLOTS = { europe: 7, americas: 4, africa: 3, apac: 2 };
export const EURO_SIZE = 8;
export const OPEN_CUP_SIZE = 16; // continental cups without qualifiers: the strongest 16 (Africa: all 12)
export const WORLD_CUP = 'World Cup';
export const NATIONS_CUP_NAME = {
  europe: 'European Championship', americas: 'Copa de las Américas', africa: 'Africa Cup of Nations', apac: 'Asia-Pacific Cup',
};
// Calendar slots (engine/competitions.js CALENDAR): qualifier windows, then the summer tournament.
export const WINDOW_SLOTS = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'];
export const TOURNAMENT_SLOTS = ['T0', 'T1', 'T2', 'TQ', 'TS', 'TF'];
export const isIntlSlot = (slot) => slot[0] === 'N' || slot[0] === 'T';

const mod = (a, n) => ((a % n) + n) % n;
export const cyclePhase = (year) => mod(year - CYCLE_START, 4);
export const isWorldCupYear = (year) => cyclePhase(year) === 3;

// What a confederation does in a year: { qual: 'cup' | 'W' | null, tour: 'cup' | 'W' | null }.
export function confYear(conf, year) {
  const p = cyclePhase(year);
  if (p === 3) return { qual: null, tour: 'W' };
  if (conf === 'europe') return [{ qual: 'cup', tour: null }, { qual: null, tour: 'cup' }, { qual: 'W', tour: null }][p];
  return [{ qual: null, tour: 'cup' }, { qual: 'W', tour: null }, { qual: null, tour: 'cup' }][p];
}
// The year's events in words, for the UI: { conf: 'Euro qualifiers' … }.
export function yearPlan(year) {
  const out = {};
  for (const conf of INTL_CONFS) {
    const y = confYear(conf, year);
    out[conf] = y.tour === 'W' ? WORLD_CUP : y.tour ? NATIONS_CUP_NAME[conf] : y.qual === 'W' ? `${WORLD_CUP} qualifiers` : `${NATIONS_CUP_NAME[conf]} qualifiers`;
  }
  return out;
}
export const tournamentName = (key) => (key === 'W' ? WORLD_CUP : NATIONS_CUP_NAME[key]);
export const nationName = (code) => NATIONS[code]?.name || code;
export const nationFlag = (code) => NATIONS[code]?.flag || '';
// Nations in the match engine and the UI: a club-like object.
export const nationTeamId = (code) => `nat-${code}`;
export const nationOfTeamId = (id) => (typeof id === 'string' && id.startsWith('nat-') ? id.slice(4) : null);
export function nationAsClub(code, strength) {
  const n = NATIONAL_TEAMS[code];
  return { id: nationTeamId(code), name: nationName(code), short: code, colors: n.colors, strength, national: true, flag: nationFlag(code) };
}

const hash = (str) => [...String(str)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const FORMATION_LIST = ['2-2-2', '2-3-1', '3-2-1', '3-1-2'];
export const nationFormation = (code) => FORMATION_LIST[hash(code) % FORMATION_LIST.length];
const PASSIVES = ['tactician', 'motivator', 'ironDiscipline', 'counterMaster', 'attackMinded', 'fitnessGuru', 'cupSpecialist'];

// ---------------------------------------------------------------------------
// Call-ups

// Clubs per nation (for the academy products' clubs).
export function clubsByNation(world) {
  const out = {};
  for (const c of Object.values(world.clubs)) {
    const code = clubNation(c.id, DIVISION_BY_ID[c.divisionId]?.code);
    if (code && NATIONAL_TEAMS[code]) (out[code] ||= []).push(c.id);
  }
  return out;
}

const YOUTH_SHAPE = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD'];

// The players a nation's clubs' academies bring through for its national team this year.
// More clubs at home (a stronger domestic game) lifts them a little.
export function nationYouth(code, year, clubs = []) {
  const n = NATIONAL_TEAMS[code];
  const rng = makeRng(hash(`${code}:${year}`));
  const used = new Set();
  const base = YOUTH_RATING[n.prestige] + (clubs.length >= 20 ? 1 : 0);
  return YOUTH_SHAPE.map((pos, i) => {
    const card = makeGenericCard(rng, { id: `ny-${code}-${year}-${i}`, pos, rating: base + rng.int(-2, 1), used, nation: code });
    return { ...card, matchesLeft: null, youth: true, clubId: clubs.length ? clubs[(hash(card.name) + i) % clubs.length] : null };
  });
}

// Every nation's eligible players: { code: [card] } (each card carries clubId, and `yours` for
// cards in your squad). userClubId: your club, for your own cards.
export function nationPools(world, poolById, { userCards = [], userClubId = null, year = 2027 } = {}) {
  const pools = Object.fromEntries(NATION_CODES.map((c) => [c, []]));
  for (const card of userCards) {
    if (pools[card.nation] && card.role !== 'coach') pools[card.nation].push({ ...card, clubId: userClubId, yours: true });
  }
  for (const club of Object.values(world.clubs)) {
    for (const id of club.keyPlayers || []) {
      const card = poolById[id];
      if (card && pools[card.nation]) pools[card.nation].push({ ...card, matchesLeft: world.cardLeft?.[id] ?? card.matchesLeft, clubId: club.id });
    }
  }
  const byNation = clubsByNation(world);
  for (const code of NATION_CODES) {
    pools[code].push(...nationYouth(code, year, byNation[code] || []));
    pools[code].sort((a, b) => overall(b) - overall(a));
  }
  return pools;
}

// Best 7 for the formation plus the next best five (a 12-player squad).
export function bestSelection(pool, formation) {
  const { lineup } = pickSquad(pool, formation, 40, makeRng(1), 'sel');
  const ids = new Set(lineup.map((c) => c.id));
  const bench = [];
  const need = ['GK', 'DEF', 'MID', 'FWD'];
  for (const pos of need) {
    const c = pool.find((x) => !ids.has(x.id) && x.pos === pos);
    if (c) { bench.push(c); ids.add(c.id); }
  }
  for (const c of pool) {
    if (bench.length >= 5) break;
    if (!ids.has(c.id)) { bench.push(c); ids.add(c.id); }
  }
  return { lineup, bench };
}

export function nationStrengths(pools) {
  const out = {};
  for (const code of NATION_CODES) out[code] = squadStrength(bestSelection(pools[code], nationFormation(code)).lineup, nationFormation(code));
  return out;
}

// The coach a nation's federation appoints when you are not in charge.
export function federationCoach(code) {
  const n = NATIONAL_TEAMS[code];
  const rarity = ['legend', 'epic', 'rare', 'uncommon', 'common', 'common'][n.prestige] || 'common';
  return { id: `nc-${code}`, name: `${nationName(code)} coach`, role: 'coach', rarity, formation: nationFormation(code), passive: PASSIVES[hash(code) % PASSIVES.length], nation: code };
}

// A national team for the match engine. selection: { lineup: [card], bench: [card] }.
export function nationMatchTeam(code, selection, coach, { isAI = true, settled = 0.08 } = {}) {
  const club = nationAsClub(code);
  const formation = coach?.formation || nationFormation(code);
  const players = [...selection.lineup, ...selection.bench];
  return {
    id: club.id, name: club.name, short: club.short, colors: club.colors, formation,
    players, lineup: selection.lineup.map((c) => c.id), bench: selection.bench.map((c) => c.id),
    coach, assistant: null, loadout: [], isAI,
    // National teams play their coach's way: no clash between the plan and the coach.
    tactics: { ...PHILOSOPHIES[coachStyle(coach)].t },
    mods: { all: settled },
  };
}

// ---------------------------------------------------------------------------
// Qualifying

const tie = (home, away, opts = {}) => ({ home, away, score: null, pens: null, winner: null, ...opts });
const emptyRow = () => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

// Six rounds, everyone home and away (groups of three: one team rests each round).
function doubleRoundRobin(ids) {
  if (ids.length === 3) {
    const [a, b, c] = ids;
    return [[tie(a, b)], [tie(b, c)], [tie(c, a)], [tie(b, a)], [tie(c, b)], [tie(a, c)]];
  }
  const [a, b, c, d] = ids;
  return [
    [tie(a, b), tie(c, d)], [tie(d, a), tie(b, c)], [tie(a, c), tie(b, d)],
    [tie(b, a), tie(d, c)], [tie(a, d), tie(c, b)], [tie(c, a), tie(d, b)],
  ];
}

function drawGroups(teams, nGroups, rng) {
  const groups = Array.from({ length: nGroups }, () => []);
  for (let p = 0; p * nGroups < teams.length; p += 1) {
    const pot = teams.slice(p * nGroups, p * nGroups + nGroups).sort(() => rng.next() - 0.5);
    pot.forEach((t, i) => groups[i].push(t));
  }
  return groups;
}

export function confNations(conf) {
  return NATION_CODES.filter((c) => NATIONAL_TEAMS[c].conf === conf);
}

// This year's qualifying groups, per confederation that qualifies this year.
export function createQualifiers(year, strengths, seed) {
  const rng = makeRng(seed);
  const out = {};
  for (const conf of INTL_CONFS) {
    const { qual } = confYear(conf, year);
    if (!qual) continue;
    const teams = confNations(conf).sort((a, b) => (strengths[b] || 0) - (strengths[a] || 0) || a.localeCompare(b));
    const groups = drawGroups(teams, Math.ceil(teams.length / 4), rng).map((ids) => ({
      teams: ids, rounds: doubleRoundRobin(ids), table: Object.fromEntries(ids.map((id) => [id, emptyRow()])),
    }));
    out[conf] = { target: qual, groups, slots: qual === 'W' ? WC_SLOTS[conf] : EURO_SIZE };
  }
  return out;
}

export function groupTable(group) {
  return Object.entries(group.table)
    .map(([id, r]) => ({ id, ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

const per = (r, k) => (r.p ? r[k] / r.p : 0);
const byRecord = (a, b) => per(b, 'pts') - per(a, 'pts') || per(b, 'gd') - per(a, 'gd') || per(b, 'gf') - per(a, 'gf') || a.id.localeCompare(b.id);

// Qualifiers in order: every group winner, then runners-up, … by points per game.
export function qualifiedFrom(q) {
  const rows = [];
  q.groups.forEach((g) => groupTable(g).forEach((r, pos) => rows.push({ ...r, pos })));
  rows.sort((a, b) => a.pos - b.pos || byRecord(a, b));
  return rows.slice(0, q.slots).map((r) => r.id);
}
// ---------------------------------------------------------------------------
// Tournaments

function singleRoundRobin(ids) {
  const [a, b, c, d] = ids;
  return [[tie(a, b, { neutral: true }), tie(c, d, { neutral: true })], [tie(a, c, { neutral: true }), tie(d, b, { neutral: true })], [tie(d, a, { neutral: true }), tie(b, c, { neutral: true })]];
}

export function createTournament(key, teams, strengths, seed) {
  const rng = makeRng(seed);
  const sorted = [...teams].sort((a, b) => (strengths[b] || 0) - (strengths[a] || 0) || a.localeCompare(b));
  const groups = drawGroups(sorted, teams.length / 4, rng).map((ids) => ({
    teams: ids, rounds: singleRoundRobin(ids), table: Object.fromEntries(ids.map((id) => [id, emptyRow()])),
  }));
  return { key, teams: [...teams], groups, quarters: null, semis: null, final: null, winner: null, runnerUp: null };
}

// Group places → knockout ties. 2 groups: A1–B2, B1–A2. 4 groups: A1–B2, B1–A2, C1–D2, D1–C2.
// 3 groups: the six top-two nations and the two best thirds, seeded 1–8 (1 v 8, 2 v 7 …).
function afterGroups(t) {
  const tables = t.groups.map(groupTable);
  if (tables.length === 3) {
    const tier = (k) => tables.map((tb) => tb[k]).sort(byRecord);
    const seeds = [...tier(0), ...tier(1), ...tier(2).slice(0, 2)].map((r) => r.id);
    return [0, 1, 2, 3].map((i) => tie(seeds[i], seeds[7 - i], { neutral: true }));
  }
  const out = [];
  for (let i = 0; i < tables.length; i += 2) {
    const [a, b] = [tables[i], tables[i + 1]];
    out.push(tie(a[0].id, b[1].id, { neutral: true }), tie(b[0].id, a[1].id, { neutral: true }));
  }
  return out;
}

// This summer's tournaments. qualified: { cup: { europe: [codes] }, W: { conf: [codes] } } from
// earlier qualifiers; open cups take the strongest nations straight in.
export function tournamentsFor(year, qualified, strengths, seed) {
  const out = {};
  INTL_CONFS.forEach((conf, i) => {
    const { tour } = confYear(conf, year);
    if (tour !== 'cup') return;
    const teams = conf === 'europe'
      ? (qualified?.cup?.europe || []).slice(0, EURO_SIZE)
      : confNations(conf).sort((a, b) => (strengths[b] || 0) - (strengths[a] || 0) || a.localeCompare(b)).slice(0, OPEN_CUP_SIZE);
    const n = teams.length - (teams.length % 4);
    if (n >= 8) out[conf] = createTournament(conf, teams.slice(0, n), strengths, seed + i);
  });
  if (isWorldCupYear(year)) {
    const teams = INTL_CONFS.flatMap((conf) => (qualified?.W?.[conf] || []).slice(0, WC_SLOTS[conf]));
    if (teams.length === 16) out.W = createTournament('W', teams, strengths, seed + 9);
  }
  return out;
}

// ---------------------------------------------------------------------------
// The season's national-team state (season.intl)

// prev: last season's intl (or null for a new career). Carries who qualified for what, and the
// list of past tournaments.
export function seasonIntl(prev, year, strengths, seed) {
  const qualified = structuredClone(prev?.qualified || { cup: {}, W: {} });
  for (const [conf, q] of Object.entries(prev?.quals || {})) {
    qualified[q.target === 'W' ? 'W' : 'cup'][conf] = qualifiedFrom(q);
  }
  // A new cycle: last cycle's World Cup places are spent.
  if (cyclePhase(year) === 0) qualified.W = {};
  return { year, quals: createQualifiers(year, strengths, seed), qualified, tournaments: {}, history: prev?.history || [] };
}

const ROUND_LABEL = { TQ: 'Quarter-final', TS: 'Semi-final', TF: 'Final' };

// Makes sure the slot's games exist, then lists them.
// Each entry: { kind: 'qual' | 'tour', key, group, game, knockout, neutral, label }
export function prepareIntlSlot(intl, slot, strengths, seed) {
  const games = [];
  if (!intl) return games;
  if (slot[0] === 'N') {
    const r = WINDOW_SLOTS.indexOf(slot);
    for (const [conf, q] of Object.entries(intl.quals || {})) {
      q.groups.forEach((g, gi) => (g.rounds[r] || []).forEach((game) => games.push({
        kind: 'qual', key: conf, group: gi, game, knockout: false, neutral: false,
        label: `${q.target === 'W' ? WORLD_CUP : NATIONS_CUP_NAME[conf]} qualifying · Group ${'ABCDEFGH'[gi]}`,
      })));
    }
    return games;
  }
  if (slot === 'T0' && !intl.drawn) { intl.tournaments = tournamentsFor(intl.year, intl.qualified, strengths, seed); intl.drawn = true; }
  for (const t of Object.values(intl.tournaments)) {
    const name = tournamentName(t.key);
    if (slot === 'T0' || slot === 'T1' || slot === 'T2') {
      const r = Number(slot[1]);
      t.groups.forEach((g, gi) => g.rounds[r].forEach((game) => games.push({ kind: 'tour', key: t.key, group: gi, game, knockout: false, neutral: true, label: `${name} · Group ${'ABCD'[gi]}` })));
    } else if (slot === 'TQ') {
      if (t.groups.length < 3) continue;
      if (!t.quarters) t.quarters = afterGroups(t);
      t.quarters.forEach((game) => games.push({ kind: 'tour', key: t.key, game, knockout: true, neutral: true, label: `${name} · Quarter-final` }));
    } else if (slot === 'TS') {
      if (!t.semis) t.semis = t.groups.length === 2 ? afterGroups(t) : [tie(t.quarters[0].winner, t.quarters[1].winner, { neutral: true }), tie(t.quarters[2].winner, t.quarters[3].winner, { neutral: true })];
      t.semis.forEach((game) => games.push({ kind: 'tour', key: t.key, game, knockout: true, neutral: true, label: `${name} · Semi-final` }));
    } else if (slot === 'TF') {
      if (!t.final) t.final = tie(t.semis[0].winner, t.semis[1].winner, { neutral: true });
      games.push({ kind: 'tour', key: t.key, game: t.final, knockout: true, neutral: true, label: `${name} · ${ROUND_LABEL.TF}` });
    }
  }
  return games;
}

export const involvesNation = (entry, code) => !!code && (entry.game.home === code || entry.game.away === code);

// Records a result. Returns the finished tournament when this was its final.
export function recordIntl(intl, entry, score, pens = null) {
  const g = entry.game;
  g.score = [...score];
  if (entry.knockout) {
    if (score[0] !== score[1]) g.winner = score[0] > score[1] ? g.home : g.away;
    else { g.pens = pens; g.winner = pens[0] > pens[1] ? g.home : g.away; }
  } else {
    const group = entry.kind === 'qual' ? intl.quals[entry.key].groups[entry.group] : intl.tournaments[entry.key].groups[entry.group];
    [[g.home, score[0], score[1]], [g.away, score[1], score[0]]].forEach(([id, gf, ga]) => {
      const r = group.table[id];
      r.p += 1; r.gf += gf; r.ga += ga;
      if (gf > ga) { r.w += 1; r.pts += 3; } else if (gf === ga) { r.d += 1; r.pts += 1; } else r.l += 1;
    });
  }
  if (entry.kind === 'tour') {
    const t = intl.tournaments[entry.key];
    if (t.final === g) {
      t.winner = g.winner;
      t.runnerUp = g.winner === g.home ? g.away : g.home;
      intl.history = [...(intl.history || []), { year: intl.year, key: t.key, winner: t.winner, runnerUp: t.runnerUp, semis: (t.semis || []).map((s) => (s.winner === s.home ? s.away : s.home)) }];
      return t;
    }
  }
  return null;
}

// Fast result (the same model as AI club games: about 3.3 goals a game).
export function quickIntl(rng, entry, strengths) {
  const diff = (strengths[entry.game.home] || 60) - (strengths[entry.game.away] || 60);
  const home = entry.neutral ? 0 : 0.07;
  const score = [rng.poisson(1.6 * Math.exp(diff / 27 + home)), rng.poisson(1.6 * Math.exp(-diff / 27 - home))];
  let pens = null;
  if (entry.knockout && score[0] === score[1]) {
    const homeWins = rng.next() < Math.min(0.7, Math.max(0.3, 0.5 + diff / 60));
    const base = 3 + rng.int(0, 2);
    pens = homeWins ? [base + 1, base] : [base, base + 1];
  }
  return { score, pens };
}

// How far a nation got in a tournament: 'winner' | 'final' | 'semi' | 'quarter' | 'group' | null.
export function tournamentStage(t, code) {
  if (!t || !t.teams.includes(code)) return null;
  if (t.winner === code) return 'winner';
  if (t.final && [t.final.home, t.final.away].includes(code)) return 'final';
  if (t.semis && t.semis.some((s) => [s.home, s.away].includes(code))) return 'semi';
  if (t.quarters && t.quarters.some((s) => [s.home, s.away].includes(code))) return 'quarter';
  return 'group';
}

// Title counts for the national-team ranking: real titles plus the game's.
export function nationTitles(history = [], real = {}) {
  const out = {};
  const add = (code, k, n = 1) => { out[code] = out[code] || { W: 0, cont: 0 }; out[code][k] += n; };
  for (const [code, n] of Object.entries(real.W || {})) add(code, 'W', n);
  for (const conf of INTL_CONFS) for (const [code, n] of Object.entries(real[conf] || {})) add(code, 'cont', n);
  for (const h of history) add(h.winner, h.key === 'W' ? 'W' : 'cont');
  return out;
}
