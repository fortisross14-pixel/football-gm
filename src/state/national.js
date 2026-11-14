// National team job (v2.5): a second, lighter job next to your club. No money and no packs:
// you call up any of the nation's players (yours, other clubs', its academy products), appoint
// the head coach, and play the qualifiers in the international windows and the summer
// tournaments. Results move your reputation. Federations offer jobs by reputation: Brazil or
// Germany only call a top manager.
//
// state.nationJob: { code, since, coach, calls: { id: 'start' | 'bench' }, record, caps, results, trophies }
// state.nationOffers: [code] (refreshed every summer)
import { makeRng } from '../engine/rng.js';
import { overall, autoArrange, FORMATIONS } from '../engine/cards.js';
import { genericName } from '../engine/aiTeam.js';
import { COACH_POOL } from '../data/pool.js';
import {
  NATIONAL_TEAMS, NATION_CODES, NATION_REPUTATION, INTL_CONF_LABEL,
} from '../data/nationalTeams.js';
import {
  nationPools, nationStrengths, bestSelection, nationFormation, federationCoach, nationMatchTeam, seasonIntl,
  prepareIntlSlot, involvesNation, recordIntl, quickIntl, isIntlSlot, nationTeamId, nationAsClub, nationName,
  tournamentName, tournamentStage, qualifiedFrom, WORLD_CUP,
} from '../engine/intl.js';
import { pushInbox } from './chronicle.js';
import { CALENDAR } from '../engine/competitions.js';
import { seasonYear } from '../engine/years.js';

export const userNation = (state) => state.nationJob?.code || null;

// Everyone's call-up pool and strength right now.
export function intlContext(state, poolById) {
  const pools = nationPools(state.world, poolById, { userCards: state.squad || [], userClubId: state.club?.id, year: state.season?.year ?? 2027 });
  return { pools, strengths: nationStrengths(pools) };
}

export function newSeasonIntl(state, year, seed, poolById) {
  const { strengths } = intlContext({ ...state, season: { year } }, poolById);
  return seasonIntl(state.season?.intl || null, seasonYear(year), strengths, seed);
}

// Plays an international slot inside the season loop. Returns true when your nation plays in it
// (the loop stops there, like for your club's games).
export function playIntlSlot(state, slot, rng, poolById) {
  const intl = state.season.intl;
  if (!intl) return false;
  const { strengths } = intlContext(state, poolById);
  const entries = prepareIntlSlot(intl, slot, strengths, rng.int(1, 2 ** 30));
  const mine = userNation(state);
  if (entries.some((e) => involvesNation(e, mine))) return true;
  for (const e of entries) {
    const r = quickIntl(rng, e, strengths);
    recordIntl(intl, e, r.score, r.pens);
  }
  return false;
}

// Your nation's game in this slot, if any (the same shape as a club fixture, plus national: true).
export function nationalFixture(state, slot, poolById) {
  const code = userNation(state);
  if (!code || !isIntlSlot(slot) || !state.season?.intl) return null;
  const intl = structuredClone(state.season.intl);
  const { strengths } = intlContext(state, poolById);
  const entry = prepareIntlSlot(intl, slot, strengths, 1).find((e) => involvesNation(e, code));
  if (!entry) return null;
  const home = entry.game.home === code;
  const opp = home ? entry.game.away : entry.game.home;
  return {
    slot, national: true, nation: code, opponentNation: opp, competition: 'national', label: entry.label,
    homeId: nationTeamId(entry.game.home), awayId: nationTeamId(entry.game.away), isHome: home && !entry.neutral,
    neutral: entry.neutral, knockout: entry.knockout, opponentId: nationTeamId(opp), opponent: nationAsClub(opp, strengths[opp]),
  };
}

// ---------------------------------------------------------------------------
// Call-ups and the head coach

export const CALL_STARTERS = 7;
export const CALL_RESERVES = 5;

// Your squad for the next game: { formation, lineup: [card x7 in slot order], bench: [card], pool }.
// Your picks first; empty places are filled with the best available.
export function nationSelection(state, poolById, ctx = null) {
  const job = state.nationJob;
  const { pools } = ctx || intlContext(state, poolById);
  const pool = pools[job.code] || [];
  const formation = job.coach?.formation || nationFormation(job.code);
  const calls = job.calls || {};
  const byId = Object.fromEntries(pool.map((c) => [c.id, c]));
  let starters = Object.keys(calls).filter((id) => calls[id] === 'start' && byId[id]).map((id) => byId[id]);
  let bench = Object.keys(calls).filter((id) => calls[id] === 'bench' && byId[id]).map((id) => byId[id]);
  const auto = bestSelection(pool, formation);
  const taken = new Set([...starters, ...bench].map((c) => c.id));
  for (const c of auto.lineup) if (starters.length < CALL_STARTERS && !taken.has(c.id)) { starters.push(c); taken.add(c.id); }
  for (const c of [...auto.bench, ...pool]) if (bench.length < CALL_RESERVES && !taken.has(c.id)) { bench.push(c); taken.add(c.id); }
  starters = starters.slice(0, CALL_STARTERS);
  bench = bench.slice(0, CALL_RESERVES);
  const order = autoArrange(starters, formation);
  return { formation, lineup: order.map((id) => byId[id] || starters.find((c) => c.id === id)), bench, pool };
}

// Tap a player: not called → starter (if there is room) → reserve (if there is room) → not called.
export function cycleCall(state, id) {
  if (!state.nationJob) return state;
  const next = structuredClone(state);
  const calls = next.nationJob.calls || {};
  const count = (role) => Object.values(calls).filter((r) => r === role).length;
  const now = calls[id];
  if (!now) calls[id] = count('start') < CALL_STARTERS ? 'start' : count('bench') < CALL_RESERVES ? 'bench' : undefined;
  else if (now === 'start') calls[id] = count('bench') < CALL_RESERVES ? 'bench' : undefined;
  else delete calls[id];
  if (calls[id] === undefined) delete calls[id];
  next.nationJob.calls = calls;
  return next;
}

// Your picks become the current best selection, so you can edit from there.
export function lockSelection(state, poolById) {
  if (!state.nationJob) return state;
  const sel = nationSelection(state, poolById);
  const next = structuredClone(state);
  next.nationJob.calls = Object.fromEntries([...sel.lineup.map((c) => [c.id, 'start']), ...sel.bench.map((c) => [c.id, 'bench'])]);
  return next;
}
export function clearCalls(state) {
  if (!state.nationJob) return state;
  const next = structuredClone(state);
  next.nationJob.calls = {};
  return next;
}

// Head coaches you can appoint: the federation's own man, the nation's coach cards, and two
// candidates the federation has shortlisted. Better nations attract better coaches.
const COACH_RARITY = ['legend', 'epic', 'rare', 'uncommon', 'common'];
const PASSIVE_LIST = ['tactician', 'motivator', 'ironDiscipline', 'counterMaster', 'attackMinded', 'fitnessGuru', 'cupSpecialist'];
export function nationCoachOptions(code, year = 2027) {
  const n = NATIONAL_TEAMS[code];
  const rng = makeRng([...`${code}${year}`].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 11));
  const best = Math.max(0, n.prestige - 1);
  const own = COACH_POOL.filter((c) => c.nation === code && COACH_RARITY.indexOf(c.rarity) >= best).slice(0, 2);
  const used = new Set();
  const make = (i, tier) => {
    const surname = genericName(rng, used);
    return {
      id: `nc-${code}-${year}-${i}`, name: `${'ABCDEFGHJKLMNPRST'[rng.int(0, 16)]}. ${surname}`, role: 'coach',
      rarity: COACH_RARITY[Math.min(4, tier)], formation: rng.pick(Object.keys(FORMATIONS)), passive: rng.pick(PASSIVE_LIST), nation: code,
    };
  };
  return [federationCoach(code), ...own.map((c) => ({ ...c, matchesLeft: null })), make(1, best), make(2, best + 1)];
}

export function appointCoach(state, coachId) {
  if (!state.nationJob) return state;
  const coach = nationCoachOptions(state.nationJob.code, state.nationJob.since).find((c) => c.id === coachId);
  if (!coach) return state;
  const next = structuredClone(state);
  next.nationJob.coach = coach;
  return next;
}

// ---------------------------------------------------------------------------
// Jobs

export const nationRequirement = (code) => NATION_REPUTATION[NATIONAL_TEAMS[code].prestige];

// Federations looking for a coach this summer: the best nations your reputation reaches,
// with a little luck. Two offers (one with the Media Darling-style boost from extra).
export function nationalOffers(state, seed, count = 2) {
  const rep = state.gm?.reputation ?? 0;
  const mine = userNation(state);
  const rng = makeRng(seed);
  const open = NATION_CODES.filter((c) => c !== mine && nationRequirement(c) <= rep && (!mine || NATIONAL_TEAMS[c].prestige <= NATIONAL_TEAMS[mine].prestige));
  if (!open.length) return [];
  const top = Math.min(...open.map((c) => NATIONAL_TEAMS[c].prestige));
  const near = open.filter((c) => NATIONAL_TEAMS[c].prestige <= top + 1);
  const picks = [];
  const list = [...near].sort(() => rng.next() - 0.5);
  for (const c of list) if (picks.length < count) picks.push(c);
  return picks;
}

export function acceptNationalJob(state, code) {
  if (!NATIONAL_TEAMS[code] || !(state.nationOffers || []).includes(code)) return state;
  const next = structuredClone(state);
  const year = next.season?.year ?? 2027;
  const old = next.nationJob;
  if (old) next.nationPast = [...(next.nationPast || []), { code: old.code, from: old.since, to: year, record: old.record, trophies: old.trophies || [] }];
  next.nationJob = {
    code, since: year, coach: federationCoach(code), calls: {},
    record: { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }, caps: {}, results: [], trophies: [],
  };
  next.nationOffers = (next.nationOffers || []).filter((c) => c !== code);
  pushInbox(next, 'career', `New job: ${nationName(code)} head of football`, `The ${nationName(code)} federation hands you the national team. Pick your head coach and call up your players before the next international window.`);
  return next;
}

export function resignNationalJob(state) {
  if (!state.nationJob) return state;
  const next = structuredClone(state);
  const old = next.nationJob;
  next.nationPast = [...(next.nationPast || []), { code: old.code, from: old.since, to: next.season?.year ?? old.since, record: old.record, trophies: old.trophies || [] }];
  next.nationJob = null;
  pushInbox(next, 'career', `You leave ${nationName(old.code)}`, 'You step down as national team manager to focus on your club.');
  return next;
}

// ---------------------------------------------------------------------------
// Playing

export function userNationTeam(state, poolById, isHome) {
  const sel = nationSelection(state, poolById);
  const team = nationMatchTeam(state.nationJob.code, sel, state.nationJob.coach, { isAI: false, settled: 0.06 });
  return { ...team, isHome };
}

export function aiNationTeam(state, code, poolById) {
  const { pools } = intlContext(state, poolById);
  const coach = federationCoach(code);
  return nationMatchTeam(code, bestSelection(pools[code], coach.formation), coach);
}

// Records your nation's result (match: an engine match, or null with `quick` for a simulated
// one) and everyone else's games in the slot. Returns the new state (the caller moves the
// season on).
export function recordNationalSlot(state, { match = null, userSide = 0, quick = null }, seed, poolById) {
  const next = structuredClone(state);
  const intl = next.season.intl;
  const { strengths } = intlContext(next, poolById);
  const code = userNation(next);
  const rng = makeRng(seed);
  const entries = prepareIntlSlot(intl, CALENDAR[next.season.slot], strengths, 1);
  for (const e of entries) {
    if (involvesNation(e, code)) {
      const r = match ? { score: match.score, pens: match.shootout ? [...match.shootout.score] : null } : quick || quickIntl(rng, e, strengths);
      const done = recordIntl(intl, e, r.score, r.pens);
      const side = e.game.home === code ? 0 : 1;
      const own = r.score[side]; const ag = r.score[1 - side];
      const won = e.game.winner ? e.game.winner === code : own > ag;
      const outcome = won ? 'W' : own === ag && !e.knockout ? 'D' : e.knockout ? 'L' : own > ag ? 'W' : 'L';
      const job = next.nationJob;
      job.record.p += 1; job.record.gf += own; job.record.ga += ag;
      if (outcome === 'W') job.record.w += 1; else if (outcome === 'D') job.record.d += 1; else job.record.l += 1;
      const opp = side === 0 ? e.game.away : e.game.home;
      job.results = [{ year: intl.year, label: e.label, opp, score: [own, ag], pens: e.game.pens ? [e.game.pens[side], e.game.pens[1 - side]] : null, outcome }, ...(job.results || [])].slice(0, 40);
      if (match) {
        const team = match.teams[userSide];
        for (const id of match.result.appeared[userSide]) {
          const p = team.players[id];
          const cap = job.caps[id] || { name: p.card.name, pos: p.card.pos, apps: 0, goals: 0 };
          cap.apps += 1; cap.goals += p.goals;
          job.caps[id] = cap;
        }
      }
      if (done?.winner === code) {
        job.trophies = [...(job.trophies || []), { year: intl.year, name: tournamentName(done.key) }];
        pushInbox(next, 'title', `🏆 ${nationName(code)} win the ${tournamentName(done.key)}!`, 'A nation celebrates. Your name will be sung for years.');
      }
    } else {
      const r = quickIntl(rng, e, strengths);
      recordIntl(intl, e, r.score, r.pens);
    }
  }
  return next;
}

// ---------------------------------------------------------------------------
// Summer review: what the national team did for your reputation.

const STAGE_REP = { W: { winner: 9, final: 5, semi: 3, quarter: 1, group: 0 }, cont: { winner: 6, final: 3, semi: 2, quarter: 1, group: 0 } };
const STAGE_TEXT = { winner: 'won it', final: 'reached the final', semi: 'reached the semi-finals', quarter: 'reached the quarter-finals', group: 'went out in the group stage' };

// Reputation items for the season just ended: { items: [{ label, value }], lines: [text] }.
export function nationalSeasonItems(state) {
  const job = state.nationJob;
  const intl = state.season?.intl;
  if (!job || !intl || intl.campaign?.year !== intl.year) return { items: [], lines: [] };
  const code = job.code;
  const conf = NATIONAL_TEAMS[code].conf;
  const key = intl.campaign.kind === 'WC' ? 'W' : conf;
  const t = intl.tournaments?.[key];
  const name = intl.campaign.kind === 'WC' ? WORLD_CUP : tournamentName(conf);
  const rep = state.gm?.reputation ?? 0;
  const damp = (v) => (v > 0 ? Math.max(1, Math.round(v * (1 - rep / 150))) : v);
  const stage = tournamentStage(t, code);
  if (!stage) {
    // Out in qualifying: a let-down only for a nation that should have gone through.
    const expected = NATIONAL_TEAMS[code].prestige <= (intl.campaign.kind === 'WC' ? 2 : 3);
    return expected
      ? { items: [{ label: `${nationName(code)} missed the ${name}`, value: -3 }], lines: [`${nationName(code)} did not qualify for the ${name}.`] }
      : { items: [], lines: [`${nationName(code)} did not qualify for the ${name}.`] };
  }
  const base = STAGE_REP[key === 'W' ? 'W' : 'cont'][stage];
  // Small nations get extra credit for going far; giants are expected to.
  const bonus = stage !== 'group' ? Math.max(0, NATIONAL_TEAMS[code].prestige - 2) : 0;
  const qualBonus = NATIONAL_TEAMS[code].prestige >= 4 ? 1 : 0;
  const items = [];
  if (qualBonus) items.push({ label: `${nationName(code)} qualified for the ${name}`, value: damp(qualBonus) });
  if (base + bonus > 0) items.push({ label: `${nationName(code)} ${STAGE_TEXT[stage]} at the ${name}`, value: damp(base + bonus) });
  return { items, lines: [`${nationName(code)} ${STAGE_TEXT[stage]} at the ${name}.`] };
}

// Who qualified for this summer's tournament(s) so far, for the UI (after the campaign ends).
export function campaignQualifiers(intl, conf) {
  return intl?.campaign?.confs?.[conf] ? qualifiedFrom(intl.campaign.confs[conf]) : [];
}

export const confLabel = (conf) => INTL_CONF_LABEL[conf];
export const nationPrestige = (code) => NATIONAL_TEAMS[code]?.prestige;
export { nationName, seasonYear, overall };
