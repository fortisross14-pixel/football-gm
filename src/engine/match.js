// 7v7 match engine. Pure functions: state in, new state out.
//
// A match is 6 segments of 15 minutes. Before each segment there is a decision
// point where a side can change mentality, make substitutions and play boosts.
// Knockout draws go to a penalty shootout.

import { FORMATIONS, slotFit, overall } from './cards.js';
import { makeRng } from './rng.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { BOOSTS } from '../data/boosts.js';
import { SKILLS, MAX_SKILLS, skillOf } from '../data/skills.js';
import { derbyName } from '../data/rivals.js';
import { coachStyle, styleDistance } from '../data/philosophies.js';
import {
  DEFAULT_TACTICS, normalizeTactics, sideAttrs, controlEdge, chanceMult, qualityEdge, setPieceChance, drainMult,
  suitability, tacticsGrade, GRADE_BONUS,
} from './tactics.js';
import { teamAttrs } from './attributes.js';
import { pickLine, short } from './commentary.js';

export const SEGMENTS = 6;
export const MAX_SUBS = 3;
export const BASE_BOOST_SLOTS = 3;

// Tuning knobs (checked by scripts/balance.mjs).
const BASE_CHANCES = 1.0; // per team per segment at equal midfield control
const BASE_CONVERSION = 0.3;
const CONTROL_EXPONENT = 1.1;
const HOME_BONUS = 0.03;

const ATTACK_WEIGHT = { GK: 0, DEF: 0.2, MID: 0.6, FWD: 1 };
const DEFENSE_WEIGHT = { GK: 0, DEF: 1, MID: 0.5, FWD: 0.15 };
const CONTROL_WEIGHT = { GK: 0, DEF: 0.5, MID: 1, FWD: 0.5 };
const SHOOTER_WEIGHT = { GK: 0, DEF: 0.4, MID: 1.4, FWD: 3 };

// Team instructions live in engine/tactics.js.
export { DEFAULT_TACTICS };
const APPROACH_MENTALITY = { cautious: 'defensive', balanced: 'balanced', attacking: 'attacking' };

// Playing your coach's way: a team-wide bonus, or a penalty when instructions clash.
export function teamFit(input) {
  const tactics = normalizeTactics(input.tactics);
  const style = coachStyle(input.coach);
  const distance = styleDistance(tactics, style);
  const slots = FORMATIONS[input.formation] || [];
  const byId = Object.fromEntries((input.players || []).map((c) => [c.id, c]));
  const A = teamAttrs(slots.map((sl, i) => ({ card: byId[input.lineup?.[i]], pos: sl.pos, x: sl.x })).filter((e) => e.card));
  const suit = suitability(tactics, A);
  const grade = tacticsGrade(distance, suit);
  // Better coaches get more out of a good plan.
  const skill = { academy: 0.7, common: 0.8, uncommon: 0.9, rare: 1, epic: 1.1, legend: 1.2 }[input.coach?.rarity] ?? 0.8;
  const bonus = grade === 'green' ? GRADE_BONUS.green * skill : GRADE_BONUS[grade];
  return { style, distance, suit, grade, bonus };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clone = (v) => structuredClone(v);

// ---------------------------------------------------------------------------
// Setup

// team input: { id, name, short, colors, formation, players: [cards],
//   lineup: [playerId x7 in formation slot order], bench: [playerId x<=3],
//   coach, assistant, loadout: [boostId], isAI,
//   mods: { all, home, comeback, drain, finishing, underdog } }  (season effects, fractions)
export function createMatch({ home, away, context = {}, seed = 1 }) {
  return {
    seed: seed >>> 0,
    segment: 0,
    phase: 'live', // live → (penalties) → fulltime
    context: {
      competition: context.competition || 'league',
      knockout: !!context.knockout,
      neutral: !!context.neutral,
      derby: !!derbyName(home.id, away.id),
    },
    teams: [buildTeam(home, true, context), buildTeam(away, false, context)],
    score: [0, 0],
    events: derbyName(home.id, away.id) ? [{ minute: 0, side: null, type: 'derby', text: `🔥 It's derby day: ${derbyName(home.id, away.id)}! ${home.short} vs ${away.short}, and nobody here wants to lose this one.` }] : [],
    segmentSummaries: [],
    shootout: null,
    result: null,
  };
}

function buildTeam(input, isHome, context) {
  const slots = FORMATIONS[input.formation].map((slot, i) => ({ ...slot, playerId: input.lineup[i] }));
  const players = {};
  for (const card of input.players) {
    players[card.id] = {
      card,
      stamina: 100,
      onPitch: false,
      enteredAt: null,
      leftAt: null,
      superSub: false,
      goals: 0,
      assists: 0,
      shots: 0,
      saves: 0,
      conceded: 0,
    };
  }
  for (const slot of slots) {
    players[slot.playerId].onPitch = true;
    players[slot.playerId].enteredAt = 0;
  }
  const tactician = passiveValue(input.coach, input.assistant, 'tactician');
  const ovr = Math.round(slots.reduce((s, slot) => s + overall(players[slot.playerId].card), 0) / slots.length);
  return {
    ovr,
    mods: { all: 0, home: 0, comeback: 0, drain: 0, finishing: 0, underdog: 0, cup: 0, continental: 0, ...(input.mods || {}) },
    eventName: input.eventName || null,
    announced: [],
    id: input.id,
    name: input.name,
    short: input.short,
    colors: input.colors,
    formation: input.formation,
    coach: input.coach || null,
    assistant: input.assistant || null,
    isAI: !!input.isAI,
    isHome: isHome && !context.neutral,
    slots,
    bench: [...input.bench],
    players,
    mentality: APPROACH_MENTALITY[normalizeTactics(input.tactics).approach] || 'balanced',
    tactics: normalizeTactics(input.tactics),
    fit: input.fit || teamFit(input),
    subsLeft: MAX_SUBS,
    boostSlots: BASE_BOOST_SLOTS + Math.floor(tactician),
    loadout: [...(input.loadout || [])],
    boostsUsed: [],
    skillsLeft: MAX_SKILLS,
    skillsUsed: [], // { cardId, skillId, segment }
    effects: [],
    superSubPending: false,
  };
}

function passiveValue(coach, assistant, id) {
  const value = COACH_PASSIVES[id]?.value || 0;
  return (coach?.passive === id ? value : 0) + (assistant?.passive === id ? value * 0.5 : 0);
}

const teamPassive = (team, id) => passiveValue(team.coach, team.assistant, id);

export function onPitch(team) {
  return team.slots.map((slot) => ({ slot, p: team.players[slot.playerId] }));
}

// ---------------------------------------------------------------------------
// Decisions

export function setMentality(state, side, mentality) {
  const next = clone(state);
  next.teams[side].mentality = mentality;
  return next;
}

export function canSubstitute(state, side, outId, inId) {
  const team = state.teams[side];
  if (state.phase !== 'live') return { ok: false, reason: 'The match is over.' };
  if (team.subsLeft <= 0) return { ok: false, reason: 'No substitutions left.' };
  if (!team.slots.some((s) => s.playerId === outId)) return { ok: false, reason: 'That player is not on the pitch.' };
  if (!team.bench.includes(inId)) return { ok: false, reason: 'That player is not on the bench.' };
  return { ok: true };
}

export function substitute(state, side, outId, inId) {
  if (!canSubstitute(state, side, outId, inId).ok) return state;
  const next = clone(state);
  const team = next.teams[side];
  const minute = next.segment * 15;
  const slot = team.slots.find((s) => s.playerId === outId);
  slot.playerId = inId;
  team.bench = team.bench.filter((id) => id !== inId);
  team.subsLeft -= 1;
  const out = team.players[outId];
  const incoming = team.players[inId];
  out.onPitch = false;
  out.leftAt = minute;
  incoming.onPitch = true;
  incoming.enteredAt = minute;
  incoming.stamina = 100;
  if (team.superSubPending) {
    incoming.superSub = true;
    team.superSubPending = false;
  }
  next.events.push({
    minute,
    side,
    type: 'sub',
    playerId: inId,
    text: `Substitution ${team.short}: ${incoming.card.name} on for ${out.card.name}.${incoming.superSub ? ' Super Sub!' : ''}`,
  });
  return next;
}

export function canPlayBoost(state, side, boostId, targetId) {
  const team = state.teams[side];
  const boost = BOOSTS[boostId];
  if (!boost) return { ok: false, reason: 'Unknown boost.' };
  if (state.phase !== 'live' || state.segment >= SEGMENTS) return { ok: false, reason: 'The match is over.' };
  if (!team.loadout.includes(boostId)) return { ok: false, reason: 'You did not bring this boost.' };
  const [own, opp] = side === 0 ? state.score : [state.score[1], state.score[0]];
  if (boost.when === 'losing' && own >= opp) return { ok: false, reason: 'Only when losing.' };
  if (boost.when === 'leadingLast' && !(own > opp && state.segment === SEGMENTS - 1)) {
    return { ok: false, reason: 'Only when leading before the last 15\'.' };
  }
  if (boostId === 'captainsSpeech' && team.effects.some((e) => e.source === 'captainsSpeech')) {
    return { ok: false, reason: 'Already active.' };
  }
  if (boostId === 'superSub' && (team.superSubPending || team.subsLeft <= 0 || !team.bench.length)) {
    return { ok: false, reason: 'No substitution available.' };
  }
  if (boost.target === 'player') {
    if (!targetId || !team.slots.some((s) => s.playerId === targetId)) return { ok: false, reason: 'Pick a player on the pitch.' };
  }
  return { ok: true };
}

export function playBoost(state, side, boostId, targetId = null) {
  if (!canPlayBoost(state, side, boostId, targetId).ok) return state;
  const next = clone(state);
  const team = next.teams[side];
  const seg = next.segment;
  team.loadout.splice(team.loadout.indexOf(boostId), 1);
  team.boostsUsed.push(boostId);
  const add = (effect) => team.effects.push({ source: boostId, from: seg, to: seg, ...effect });
  switch (boostId) {
    case 'goldenChance': add({ type: 'goldenChance', playerId: targetId }); break;
    case 'secondWind':
      for (const { p } of onPitch(team)) p.stamina = Math.min(100, p.stamina + 40);
      break;
    case 'ironWall': add({ type: 'def', value: 0.25 }); break;
    case 'allOutAttack': add({ type: 'att', value: 0.3 }); add({ type: 'def', value: -0.2 }); break;
    case 'captainsSpeech': add({ type: 'all', value: 0.1, to: SEGMENTS }); break;
    case 'setPiece': add({ type: 'setPiece' }); break;
    case 'superSub': team.superSubPending = true; break;
    case 'gameManagement': add({ type: 'gameManagement' }); break;
    case 'twelfthMan': add({ type: 'all', value: 0.15, to: seg + 1 }); break;
    default: break;
  }
  const target = targetId ? ` (${team.players[targetId].card.name})` : '';
  next.events.push({ minute: seg * 15, side, type: 'boost', boostId, text: `${team.short} play ${BOOSTS[boostId].name}${target}.` });
  return next;
}

// ---------------------------------------------------------------------------
// Skills

// Every skill this side could use this match: players on the pitch plus both coaches.
export function teamSkills(team) {
  const out = [];
  for (const { slot, p } of onPitch(team)) {
    const skill = skillOf(p.card);
    if (skill) out.push({ cardId: p.card.id, name: p.card.name, source: slot.pos, skill });
  }
  for (const [role, coach] of [['Coach', team.coach], ['Assistant', team.assistant]]) {
    const skill = skillOf(coach);
    if (skill) out.push({ cardId: coach.id, name: coach.name, source: role, skill });
  }
  return out;
}

export function canUseSkill(state, side, cardId) {
  const team = state.teams[side];
  if (state.phase !== 'live' || state.segment >= SEGMENTS) return { ok: false, reason: 'The match is over.' };
  const entry = teamSkills(team).find((e) => e.cardId === cardId);
  if (!entry) return { ok: false, reason: 'Not available.' };
  if (team.skillsUsed.some((u) => u.cardId === cardId)) return { ok: false, reason: 'Already used this match.' };
  if (team.skillsLeft <= 0) return { ok: false, reason: `Only ${MAX_SKILLS} skills per match.` };
  const [own, opp] = side === 0 ? state.score : [state.score[1], state.score[0]];
  const seg = state.segment;
  const when = entry.skill.when;
  if (when === 'late' && seg < SEGMENTS - 1) return { ok: false, reason: 'From 75\' only.' };
  if (when === 'halftime' && seg !== 3) return { ok: false, reason: 'At half time only.' };
  if (when === 'leading' && own <= opp) return { ok: false, reason: 'Only when leading.' };
  if (when === 'notWinning' && own > opp) return { ok: false, reason: 'Only when not winning.' };
  return { ok: true, entry };
}

export function activateSkill(state, side, cardId) {
  const check = canUseSkill(state, side, cardId);
  if (!check.ok) return state;
  const next = clone(state);
  const team = next.teams[side];
  const seg = next.segment;
  const { skill, name } = check.entry;
  team.skillsLeft -= 1;
  team.skillsUsed.push({ cardId, skillId: skill.id, segment: seg });
  for (const e of SKILLS[skill.id].effects(skill.tier, { cardId })) {
    if (e.type === 'stamina') {
      for (const { p } of onPitch(team)) p.stamina = Math.min(100, p.stamina + e.value);
      continue;
    }
    const { len, ...rest } = e;
    team.effects.push({ source: `skill:${skill.id}`, from: seg, to: rest.to ?? seg + (len || 1) - 1, ...rest });
  }
  next.events.push({ minute: seg * 15, side, type: 'skill', skillId: skill.id, cardId, text: `${skill.icon} ${team.short}: ${name} uses ${skill.name}!` });
  return next;
}

// AI picks its moments: protect leads late, chase games late, team talks at half time.
function aiSkills(state, side) {
  let next = state;
  const seg = state.segment;
  const [own, opp] = side === 0 ? state.score : [state.score[1], state.score[0]];
  const ahead = own > opp;
  const behind = own < opp;
  const wants = (id) => {
    switch (id) {
      case 'keepResult': case 'lastLine': case 'stopper': case 'wallOfHands': return ahead && seg >= 4;
      case 'allIn': return behind && seg >= 4;
      case 'teamTalk': return seg === 3 && !ahead;
      case 'clutch': return seg === 5 && own - opp < 2;
      case 'clearChance': case 'killerPass': case 'hunter': return (seg >= 4 && !ahead) || (seg === 2 && own === opp);
      case 'maestro': case 'pressTrap': return seg === 3 || (seg >= 4 && behind);
      case 'freshLegs': return seg === 4;
      default: return false;
    }
  };
  for (const entry of teamSkills(next.teams[side])) {
    if (next.teams[side].skillsLeft <= 0) break;
    if (!wants(entry.skill.id)) continue;
    if (canUseSkill(next, side, entry.cardId).ok) next = activateSkill(next, side, entry.cardId);
  }
  return next;
}

// Simple AI: mentality by score/time, substitutes tired players, uses skills.
export function aiDecide(state, side) {
  let next = state;
  const team = next.teams[side];
  const seg = next.segment;
  const [own, opp] = side === 0 ? next.score : [next.score[1], next.score[0]];
  let mentality = APPROACH_MENTALITY[team.tactics?.approach] || 'balanced';
  if (seg >= 3 && own < opp) mentality = 'attacking';
  else if (seg >= 4 && own > opp) mentality = 'defensive';
  if (team.mentality !== mentality) next = setMentality(next, side, mentality);
  next = aiSkills(next, side);

  if (seg >= 3) {
    for (let guard = 0; guard < MAX_SUBS; guard += 1) {
      const t = next.teams[side];
      if (t.subsLeft <= 0 || !t.bench.length) break;
      const tired = onPitch(t)
        .filter(({ slot, p }) => slot.pos !== 'GK' && p.stamina < 66)
        .sort((a, b) => a.p.stamina - b.p.stamina)[0];
      if (!tired) break;
      const options = t.bench.map((id) => t.players[id]).filter((p) => p.card.pos !== 'GK');
      if (!options.length) break;
      const best = options.sort((a, b) => benchScore(b, tired.slot.pos) - benchScore(a, tired.slot.pos))[0];
      next = substitute(next, side, tired.slot.playerId, best.card.id);
    }
  }
  return next;
}

const benchScore = (p, pos) => (p.card.att + p.card.def + p.card.phy) * slotFit(p.card.pos, pos);

// ---------------------------------------------------------------------------
// Simulation

function modifiers(state, side, seg) {
  const team = state.teams[side];
  const { competition } = state.context;
  const field = onPitch(team);
  const active = team.effects.filter((e) => e.from <= seg && e.to >= seg);
  const sum = (type) => active.filter((e) => e.type === type).reduce((s, e) => s + e.value, 0);
  const season = team.mods;
  const opp = state.teams[1 - side];
  const [own, against] = side === 0 ? state.score : [state.score[1], state.score[0]];
  let all = sum('all') + season.all + (team.fit?.bonus || 0);
  if (team.isHome) all += HOME_BONUS + season.home;
  if (seg >= 4 && own < against) all += season.comeback;
  if (opp.ovr > team.ovr + 1) all += season.underdog;
  if (seg >= 3) all += teamPassive(team, 'motivator');
  if (competition === 'cup') all += teamPassive(team, 'cupSpecialist') + season.cup;
  if (competition === 'continental' || competition === 'cwc') all += season.continental;
  all += field.filter(({ p }) => p.card.trait === 'leader').length * 0.03;
  const att = sum('att') + teamPassive(team, 'attackMinded');
  const def = sum('def') + teamPassive(team, 'ironDiscipline') + field.filter(({ p }) => p.card.trait === 'wall').length * 0.1;
  return { all, att, def, active, sum };
}

function effective(p, slotPos, mods, seg, competition) {
  const fit = slotFit(p.card.pos, slotPos);
  const fatigue = 0.75 + 0.25 * (p.stamina / 100);
  let personal = 0;
  if (p.superSub) personal += 0.15;
  if (p.card.trait === 'bigGame' && (competition === 'continental' || competition === 'cwc')) personal += 0.1;
  const clutch = p.card.trait === 'clutch' && seg === SEGMENTS - 1 ? 0.15 : 0;
  for (const e of mods.active) if (e.type === 'playerAtt' && e.playerId === p.card.id) personal += e.value;
  const base = fit * fatigue;
  return {
    att: p.card.att * base * (1 + mods.all + mods.att + personal + clutch),
    def: p.card.def * base * (1 + mods.all + mods.def + personal),
  };
}

function teamPower(state, side, seg) {
  const team = state.teams[side];
  const mods = modifiers(state, side, seg);
  const { competition } = state.context;
  let attack = 0;
  let defense = 0;
  let control = 0;
  let gk = null;
  const shooters = [];
  for (const { slot, p } of onPitch(team)) {
    const e = effective(p, slot.pos, mods, seg, competition);
    if (slot.pos === 'GK') {
      gk = { p, def: e.def * (p.card.trait === 'shotStopper' ? 1.1 : 1) };
      continue;
    }
    attack += e.att * ATTACK_WEIGHT[slot.pos];
    defense += e.def * DEFENSE_WEIGHT[slot.pos];
    control += ((e.att + e.def) / 2) * CONTROL_WEIGHT[slot.pos];
    shooters.push({ p, att: e.att, pos: slot.pos });
  }
  const playmakers = onPitch(team).filter(({ p }) => p.card.trait === 'playmaker').length;
  return { attack, defense, control, gk, shooters, mods, playmakers };
}

export function playSegment(state) {
  if (state.phase !== 'live' || state.segment >= SEGMENTS) return state;
  const next = clone(state);
  const rng = makeRng(next.seed);
  const seg = next.segment;
  announceEvents(next, seg);
  const powers = [teamPower(next, 0, seg), teamPower(next, 1, seg)];
  const tac = (side) => next.teams[side].tactics || DEFAULT_TACTICS;
  const attrsOf = [sideAttrs(next.teams[0]), sideAttrs(next.teams[1])];
  const ctrl = (side) => {
    const t = controlEdge(tac(side), tac(1 - side), attrsOf[side], attrsOf[1 - side]);
    return Math.max(0.3, 1 + powers[side].mods.sum('control') - powers[1 - side].mods.sum('oppControl') + t);
  };
  const cA = (powers[0].control * ctrl(0)) ** CONTROL_EXPONENT;
  const cB = (powers[1].control * ctrl(1)) ** CONTROL_EXPONENT;
  const share = [cA / (cA + cB), cB / (cA + cB)];
  const scoreAtStart = [...next.score];
  const segEvents = [];

  for (const side of [0, 1]) {
    const opp = 1 - side;
    const team = next.teams[side];
    const oppTeam = next.teams[opp];
    const me = powers[side];
    const them = powers[opp];
    let lambda = 2 * BASE_CHANCES * share[side];
    lambda *= { attacking: 1.25, balanced: 1, defensive: 0.7 }[team.mentality];
    lambda *= { attacking: 1.15, balanced: 1, defensive: 0.85 }[oppTeam.mentality];
    const mine = tac(side);
    const theirs = tac(opp);
    lambda *= chanceMult(mine, theirs, attrsOf[side], attrsOf[opp]);
    if (them.mods.active.some((e) => e.type === 'gameManagement')) lambda *= 0.6;
    lambda *= Math.max(0.2, 1 - them.mods.sum('oppChances'));

    // Strength gaps matter, but football stays unpredictable: differences are softened.
    let quality = 0.5 + (me.attack / (me.attack + them.defense) - 0.5) * 0.6;
    quality += me.playmakers * 0.03;
    const trailing = scoreAtStart[side] < scoreAtStart[opp];
    if (trailing) quality *= 1 + teamPassive(team, 'counterMaster');
    // Game state: a trailing side pushes harder in the second half.
    if (trailing && seg >= 3) lambda *= 1.15;
    if (team.mentality === 'attacking') quality += 0.02;
    if (oppTeam.mentality === 'defensive') quality -= 0.04;
    // Instructions read against both squads' numbers (see engine/tactics.js).
    quality += qualityEdge(mine, theirs, attrsOf[side], attrsOf[opp], oppTeam.mentality);

    const chances = [];
    const count = rng.poisson(lambda);
    for (let i = 0; i < count; i += 1) chances.push({ kind: 'open', quality });
    for (const e of me.mods.active) {
      if (e.type === 'goldenChance') chances.push({ kind: 'golden', quality: e.quality ?? 0.85, playerId: e.playerId });
      if (e.type === 'extraChance') chances.push({ kind: 'open', quality: e.quality });
      if (e.type === 'setPiece') chances.push({ kind: 'setPiece', quality: 0.6 });
    }
    const sp = setPieceChance(mine, attrsOf[side]);
    if (sp && rng.next() < sp.p) chances.push({ kind: 'setPiece', quality: sp.quality });

    for (const chance of chances) {
      const minute = seg * 15 + rng.int(1, 15);
      let shooter;
      if (chance.kind === 'golden') shooter = me.shooters.find((s) => s.p.card.id === chance.playerId);
      if (chance.kind === 'setPiece') shooter = rng.weighted(me.shooters, (s) => (s.pos === 'MID' ? 0.6 : 1.2) * (s.p.card.def + s.att));
      if (!shooter) shooter = rng.weighted(me.shooters, (s) => SHOOTER_WEIGHT[s.pos] * s.att);
      if (!shooter) continue;
      const gkDef = them.gk ? them.gk.def : 30;
      const finish = clamp(2 / (1 + Math.exp(-(shooter.att - gkDef) / 20)), 0.55, 1.5);
      let p = BASE_CONVERSION * (0.45 + 1.1 * chance.quality) * finish;
      if (shooter.p.card.trait === 'poacher') p *= 1.15;
      p *= 1 + team.mods.finishing;
      for (const e of me.mods.active) if (e.type === 'playerFinish' && e.playerId === shooter.p.card.id) p *= 1 + e.value;
      p *= Math.max(0.3, 1 - them.mods.sum('oppConversion'));
      p = clamp(p, 0.04, 0.8);
      shooter.p.shots += 1;
      const name = shooter.p.card.name;
      if (rng.next() < p) {
        let assist = null;
        if (chance.kind !== 'setPiece' && rng.next() < 0.75) {
          const mates = me.shooters.filter((s) => s !== shooter);
          const pick = rng.weighted(mates, (s) => (s.pos === 'MID' ? 2 : 1) * s.att * (s.p.card.trait === 'playmaker' ? 1.6 : 1));
          if (pick) assist = pick.p;
        }
        shooter.p.goals += 1;
        if (assist) assist.assists += 1;
        segEvents.push({
          minute, side, type: 'goal', playerId: shooter.p.card.id, assistId: assist?.card.id || null, kind: chance.kind,
          lineKey: chance.kind === 'golden' ? 'goldenGoal' : chance.kind === 'setPiece' ? 'setPieceGoal' : 'goal',
          names: [short(name), assist ? short(assist.card.name) : null, team.short],
        });
      } else {
        const roll = rng.next();
        const saveChance = them.gk ? clamp(0.35 + (them.gk.def - 60) / 100, 0.25, 0.65) : 0.1;
        let outcome = 'miss';
        if (roll < saveChance) outcome = 'save';
        else if (roll < saveChance + 0.08) outcome = 'post';
        else if (roll < saveChance + 0.3) outcome = 'block';
        if (outcome === 'save' && them.gk) them.gk.p.saves += 1;
        segEvents.push({
          minute, side, type: 'chance', outcome, playerId: shooter.p.card.id, kind: chance.kind,
          lineKey: outcome,
          names: outcome === 'save' ? [short(name), them.gk ? short(them.gk.p.card.name) : 'the keeper'] : [short(name)],
        });
      }
    }
  }

  segEvents.sort((a, b) => a.minute - b.minute);
  for (const ev of segEvents) {
    ev.text = pickLine(rng, ev.lineKey, ...ev.names);
    if (ev.type === 'goal') {
      next.score[ev.side] += 1;
      for (const { slot, p } of onPitch(next.teams[1 - ev.side])) {
        if (slot.pos === 'GK' || slot.pos === 'DEF') p.conceded += 1;
      }
    }
    delete ev.names;
    delete ev.lineKey;
    next.events.push(ev);
  }
  if (!segEvents.some((e) => e.type === 'goal')) {
    const dominant = share[0] > 0.58 ? 0 : share[1] > 0.58 ? 1 : null;
    const text = dominant === null ? pickLine(rng, 'quiet') : pickLine(rng, 'control', next.teams[dominant].short);
    next.events.push({ minute: seg * 15 + 8, side: dominant, type: 'flavor', text });
    next.events.sort((a, b) => a.minute - b.minute);
  }

  // Fatigue
  for (const side of [0, 1]) {
    const team = next.teams[side];
    const guru = teamPassive(team, 'fitnessGuru');
    const mentality = { attacking: 1.15, balanced: 1, defensive: 0.9 }[team.mentality];
    for (const { slot, p } of onPitch(team)) {
      const style = drainMult(team.tactics || DEFAULT_TACTICS);
      let drain = 9 * (1.4 - p.card.phy / 100) * mentality * style * (1 - guru) * (1 - team.mods.drain);
      if (p.card.trait === 'engine') drain *= 0.5;
      if (slot.pos === 'GK') drain *= 0.4;
      p.stamina = clamp(p.stamina - drain, 0, 100);
    }
  }

  next.segmentSummaries.push({ segment: seg, control: share, score: [...next.score] });
  next.segment += 1;
  next.seed = rng.seed;
  if (next.segment >= SEGMENTS) {
    const drawn = next.score[0] === next.score[1];
    if (next.context.knockout && drawn) next.phase = 'penalties';
    else return finalize(next);
  }
  return next;
}

// Commentary when a season event starts to help (once per match).
function announceEvents(state, seg) {
  const { competition } = state.context;
  for (const side of [0, 1]) {
    const team = state.teams[side];
    const m = team.mods;
    if (!team.eventName) continue;
    const [own, against] = side === 0 ? state.score : [state.score[1], state.score[0]];
    const say = (key, text) => {
      if (team.announced.includes(key)) return;
      team.announced.push(key);
      state.events.push({ minute: seg * 15, side, type: 'boost', text });
    };
    const pct = (v) => `+${Math.round(v * 100)}%`;
    if (m.comeback && seg >= 4 && own < against) say('comeback', `${team.eventName}: ${team.short} refuse to give up (${pct(m.comeback)})!`);
    if (seg === 0 && m.underdog && state.teams[1 - side].ovr > team.ovr + 1) say('underdog', `${team.eventName}: ${team.short} are the underdogs and love it (${pct(m.underdog)}).`);
    if (seg === 0 && m.home && team.isHome) say('home', `${team.eventName}: the home crowd roars (${pct(m.home)}).`);
    if (seg === 0 && m.cup && competition === 'cup') say('cup', `${team.eventName}: cup nights bring out the best in ${team.short} (${pct(m.cup)}).`);
    if (seg === 0 && m.continental && (competition === 'continental' || competition === 'cwc')) say('cont', `${team.eventName}: ${team.short} rise to the occasion (${pct(m.continental)}).`);
  }
}

// ---------------------------------------------------------------------------
// Penalties

export function runShootout(state) {
  if (state.phase !== 'penalties') return state;
  const next = clone(state);
  const rng = makeRng(next.seed);
  const takers = [0, 1].map((side) => {
    const field = onPitch(next.teams[side]);
    const outfield = field.filter(({ slot }) => slot.pos !== 'GK').map(({ p }) => p).sort((a, b) => b.card.att - a.card.att);
    const keeper = field.find(({ slot }) => slot.pos === 'GK')?.p;
    return keeper ? [...outfield, keeper] : outfield;
  });
  const keepers = [0, 1].map((side) => onPitch(next.teams[side]).find(({ slot }) => slot.pos === 'GK')?.p);
  const kicks = [];
  const score = [0, 0];
  let round = 0;
  let decided = false;
  while (round < 30) {
    for (const side of [0, 1]) {
      const taker = takers[side][round % takers[side].length];
      const gk = keepers[1 - side];
      let p = clamp(0.76 + (taker.card.att - (gk?.card.def ?? 40)) / 150, 0.55, 0.92);
      if (gk?.card.trait === 'shotStopper') p -= 0.06;
      if (taker.card.trait === 'clutch') p += 0.04;
      const scored = rng.next() < p;
      if (scored) score[side] += 1;
      kicks.push({ side, playerId: taker.card.id, name: taker.card.name, scored, score: [...score] });
      // In the first 5 rounds, stop early once one side can't catch up.
      if (round < 5) {
        const remaining = [4 - round, side === 0 ? 5 - round : 4 - round];
        if (score[0] + remaining[0] < score[1] || score[1] + remaining[1] < score[0]) {
          decided = true;
          break;
        }
      }
    }
    if (decided) break;
    round += 1;
    if (round >= 5 && score[0] !== score[1]) break;
  }
  next.shootout = { kicks, score, winner: score[0] > score[1] ? 0 : 1 };
  next.seed = rng.seed;
  return finalize(next);
}

// ---------------------------------------------------------------------------
// Result

function finalize(state) {
  const next = state;
  const rng = makeRng(next.seed);
  const winner = next.score[0] !== next.score[1]
    ? (next.score[0] > next.score[1] ? 0 : 1)
    : next.shootout ? next.shootout.winner : null;
  const ratings = [];
  for (const side of [0, 1]) {
    const team = next.teams[side];
    const conceded = next.score[1 - side];
    for (const p of Object.values(team.players)) {
      if (p.enteredAt === null) continue;
      const left = p.leftAt ?? 90;
      const minutes = left - p.enteredAt;
      const pos = p.card.pos;
      let r = 6.2 + p.goals * 1.0 + p.assists * 0.6 + p.saves * 0.25;
      if (pos === 'GK') r -= p.conceded * 0.35;
      if (pos === 'DEF') r -= p.conceded * 0.15;
      if ((pos === 'GK' || pos === 'DEF') && conceded === 0 && minutes >= 45) r += pos === 'GK' ? 0.8 : 0.5;
      if (winner === side) r += 0.3;
      if (winner === 1 - side) r -= 0.2;
      r += (rng.next() - 0.5) * 0.6;
      p.rating = Math.round(clamp(r, 3, 10) * 10) / 10;
      p.minutes = minutes;
      ratings.push({ side, playerId: p.card.id, rating: p.rating });
    }
  }
  const motm = [...ratings].sort((a, b) => b.rating - a.rating || (b.side === winner) - (a.side === winner))[0];
  next.phase = 'fulltime';
  next.seed = rng.seed;
  next.result = {
    score: [...next.score],
    shootout: next.shootout ? [...next.shootout.score] : null,
    winner,
    motm,
    appeared: [0, 1].map((side) => Object.values(next.teams[side].players).filter((p) => p.enteredAt !== null).map((p) => p.card.id)),
  };
  return next;
}

// Headless full match, both sides AI-controlled. Used for AI-vs-AI games and balancing.
export function simulateMatch(options) {
  let state = createMatch(options);
  while (state.phase === 'live') {
    state = aiDecide(state, 0);
    state = aiDecide(state, 1);
    state = playSegment(state);
  }
  if (state.phase === 'penalties') state = runShootout(state);
  return state;
}
