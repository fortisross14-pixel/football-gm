// National teams (v2.5): call-ups, qualifying campaigns and the summer tournaments.
//
// A four-year cycle (season 1 = 2027):
//   odd years  → qualifying, first half (three international windows: N0, N1, N2)
//   even years → qualifying, second half, then the tournament after the league (T slots)
//   2028, 2032, … the four continental championships (8 nations each)
//   2030, 2034, … the World Cup (16 nations: Europe 7, Americas 4, Africa 3, Asia-Pacific 2)
//
// Qualifying: each confederation is drawn into groups of 3–4 by pots (strongest first), a double
// round-robin over the two seasons. Group winners go first, then the best runners-up, and so on,
// by points per game. Tournaments: groups of four (single round-robin, neutral venues), then
// quarter-finals (16 nations) or straight to the semi-finals (8), and the final.
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

export const FIRST_CUP_YEAR = 2028;
export const FIRST_WORLD_CUP = 2030;
export const WC_SLOTS = { europe: 7, americas: 4, africa: 3, apac: 2 };
export const CUP_SIZE = 8;
export const WORLD_CUP = 'World Cup';
export const NATIONS_CUP_NAME = {
  europe: 'European Championship', americas: 'Copa de las Américas', africa: 'Africa Cup of Nations', apac: 'Asia-Pacific Cup',
};
// Calendar slots (engine/competitions.js CALENDAR): qualifier windows, then the summer tournament.
export const WINDOW_SLOTS = ['N0', 'N1', 'N2'];
export const TOURNAMENT_SLOTS = ['T0', 'T1', 'T2', 'TQ', 'TS', 'TF'];
export const isIntlSlot = (slot) => slot[0] === 'N' || slot[0] === 'T';

const mod = (a, n) => ((a % n) + n) % n;
export const isWorldCupYear = (y) => mod(y - FIRST_WORLD_CUP, 4) === 0;
export const isCupYear = (y) => mod(y - FIRST_CUP_YEAR, 4) === 0;
// The tournament a season's qualifiers lead to: this summer's (even years) or next summer's.
export function campaignFor(year) {
  const target = mod(year, 2) === 0 ? year : year + 1;
  return { year: target, kind: isWorldCupYear(target) ? 'WC' : 'CUP' };
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

export function createCampaign(year, strengths, seed) {
  const { year: target, kind } = campaignFor(year);
  const rng = makeRng(seed);
  const confs = {};
  for (const conf of INTL_CONFS) {
    const teams = confNations(conf).sort((a, b) => (strengths[b] || 0) - (strengths[a] || 0) || a.localeCompare(b));
    const groups = drawGroups(teams, Math.ceil(teams.length / 4), rng).map((ids) => ({
      teams: ids, rounds: doubleRoundRobin(ids), table: Object.fromEntries(ids.map((id) => [id, emptyRow()])),
    }));
    confs[conf] = { groups, slots: kind === 'WC' ? WC_SLOTS[conf] : CUP_SIZE };
  }
  return { kind, year: target, confs };
}

export function groupTable(group) {
  return Object.entries(group.table)
    .map(([id, r]) => ({ id, ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

// Qualifiers in order: every group winner, then runners-up, … by points per game.
export function qualifiedFrom(campaignConf) {
  const rows = [];
  campaignConf.groups.forEach((g) => groupTable(g).forEach((r, pos) => rows.push({ ...r, pos })));
  const per = (r, k) => (r.p ? r[k] / r.p : 0);
  rows.sort((a, b) => a.pos - b.pos || per(b, 'pts') - per(a, 'pts') || per(b, 'gd') - per(a, 'gd') || per(b, 'gf') - per(a, 'gf') || a.id.localeCompare(b.id));
  return rows.slice(0, campaignConf.slots).map((r) => r.id);
}

// Which qualifying round a window plays this season (null: none).
export function windowRound(campaign, year, slot) {
  const w = WINDOW_SLOTS.indexOf(slot);
  if (!campaign || w < 0) return null;
  if (year === campaign.year - 1) return w;
  if (year === campaign.year) return 3 + w;
  return null;
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

function afterGroups(t) {
  const tables = t.groups.map(groupTable);
  const out = [];
  for (let i = 0; i < tables.length; i += 2) {
    const [a, b] = [tables[i], tables[i + 1]];
    out.push(tie(a[0].id, b[1].id, { neutral: true }), tie(b[0].id, a[1].id, { neutral: true }));
  }
  return out;
}

// Builds the summer's tournaments from the finished campaign.
export function tournamentsFor(campaign, strengths, seed) {
  if (!campaign) return {};
  if (campaign.kind === 'WC') {
    const teams = INTL_CONFS.flatMap((conf) => qualifiedFrom(campaign.confs[conf]));
    return { W: createTournament('W', teams, strengths, seed) };
  }
  const out = {};
  INTL_CONFS.forEach((conf, i) => { out[conf] = createTournament(conf, qualifiedFrom(campaign.confs[conf]), strengths, seed + i); });
  return out;
}

// ---------------------------------------------------------------------------
// The season's national-team state (season.intl)

// prev: last season's intl (or null for a new career). Keeps the campaign while it runs and the
// list of past tournaments.
export function seasonIntl(prev, year, strengths, seed) {
  const keep = prev?.campaign && prev.campaign.year >= year ? prev.campaign : null;
  return {
    year,
    campaign: keep || createCampaign(year, strengths, seed),
    tournaments: {},
    history: prev?.history || [],
  };
}

const ROUND_LABEL = { TQ: 'Quarter-final', TS: 'Semi-final', TF: 'Final' };

// Makes sure the slot's games exist, then lists them.
// Each entry: { kind: 'qual' | 'tour', key, group, game, knockout, neutral, label }
export function prepareIntlSlot(intl, slot, strengths, seed) {
  const games = [];
  if (!intl) return games;
  if (slot[0] === 'N') {
    const r = windowRound(intl.campaign, intl.year, slot);
    if (r === null) return games;
    const target = intl.campaign.kind === 'WC' ? WORLD_CUP : 'continental championship';
    for (const conf of INTL_CONFS) {
      intl.campaign.confs[conf].groups.forEach((g, gi) => (g.rounds[r] || []).forEach((game) => games.push({
        kind: 'qual', key: conf, group: gi, game, knockout: false, neutral: false,
        label: `${intl.campaign.kind === 'WC' ? 'World Cup' : NATIONS_CUP_NAME[conf]} qualifying · Group ${'ABCDEFGH'[gi]}`, target,
      })));
    }
    return games;
  }
  if (intl.campaign?.year !== intl.year) return games;
  if (slot === 'T0' && !Object.keys(intl.tournaments).length) intl.tournaments = tournamentsFor(intl.campaign, strengths, seed);
  for (const t of Object.values(intl.tournaments)) {
    const name = tournamentName(t.key);
    if (slot === 'T0' || slot === 'T1' || slot === 'T2') {
      const r = Number(slot[1]);
      t.groups.forEach((g, gi) => g.rounds[r].forEach((game) => games.push({ kind: 'tour', key: t.key, group: gi, game, knockout: false, neutral: true, label: `${name} · Group ${'ABCD'[gi]}` })));
    } else if (slot === 'TQ') {
      if (t.groups.length !== 4) continue;
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
    const group = entry.kind === 'qual' ? intl.campaign.confs[entry.key].groups[entry.group] : intl.tournaments[entry.key].groups[entry.group];
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
