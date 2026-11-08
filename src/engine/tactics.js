// Team instructions and how they play out, read against the squad's five numbers
// (Passing, Shooting, Defense, Physical, Set pieces). Anyone looking at those numbers
// should be able to tell which settings suit the team.
//
// Sliders run 1–5 (3 = neutral). Choices are A or B. Switches are on or off.

import { teamAttrs } from './attributes.js';

export const SLIDERS = {
  press: { label: 'Pressing', low: 'Sit off', high: 'Hunt the ball', text: 'Higher: rivals lose control and you win the ball high. Burns stamina; strong Physical makes it bite.' },
  tempo: { label: 'Passing tempo', low: 'Patient', high: 'Fast', text: 'Faster: more chances, but only good Passing finds the target. Patient: more control, fewer chances.' },
  line: { label: 'Defensive line', low: 'Deep', high: 'High', text: 'Higher: rivals shoot less, but balls in behind hurt, more so with slow (low Physical) defenders.' },
};
export const CHOICES = {
  attack: { label: 'Attack through', a: 'wings', b: 'centre', names: { wings: 'Wings', centre: 'Centre' }, text: 'Go where your best attackers are: compare wide players with central ones.' },
  buildUp: { label: 'Build-up', a: 'short', b: 'long', names: { short: 'Short', long: 'Long balls' }, text: 'Short needs Passing and suffers against a high press. Long balls skip the press and need strong (Physical) forwards.' },
};
export const SWITCHES = {
  offsideTrap: { label: 'Offside trap', text: 'Fewer chances for rivals if your defenders read the game (Defense), but quick forwards beat slow (low Physical) defenders.' },
  setPieces: { label: 'Play for set pieces', text: 'Extra dead-ball chances. Worth it only with a good Set pieces taker.' },
  counter: { label: 'Counter-attacks', text: 'Break fast when you win the ball: deadly against high lines and attacking teams, needs Physical. Costs some control.' },
};
export const MENTALITIES = { cautious: 'Defend', balanced: 'Balanced', attacking: 'Attack' };

export const DEFAULT_TACTICS = {
  press: 3, tempo: 3, line: 3, attack: 'wings', buildUp: 'short', offsideTrap: false, setPieces: false, counter: false, approach: 'balanced',
};

// Older saves used words; map them to the new scale.
export function normalizeTactics(t = {}) {
  const map = { low: 2, mid: 3, high: 4, deep: 2, normal: 3 };
  const out = { ...DEFAULT_TACTICS, ...t };
  for (const k of ['press', 'tempo', 'line']) if (typeof out[k] !== 'number') out[k] = map[out[k]] ?? 3;
  if (t.passing === 'direct') { out.buildUp = 'long'; out.tempo = Math.max(out.tempo, 4); }
  if (!['wings', 'centre'].includes(out.attack)) out.attack = 'wings';
  if (!['short', 'long'].includes(out.buildUp)) out.buildUp = 'short';
  delete out.passing;
  return out;
}

const z = (v) => (v - 65) / 15; // 65 is an average club player; +1 ≈ 80, −1 ≈ 50

// Squad numbers for the players on the pitch now (slot x tells wide from central).
export function sideAttrs(team) {
  return teamAttrs(team.slots.map((s) => ({ card: team.players[s.playerId].card, pos: s.pos, x: s.x })));
}

// How strongly instructions swing a match. Tuned with scripts/tactics-check.mjs.
const K = 1.5;

// Control adjustment for `me` (fraction added to the control multiplier).
export function controlEdge(me, them, A, O) {
  let t = 0;
  const myP = me.press - 3;
  const opP = them.press - 3;
  t += 0.02 * myP * (1 + 0.4 * z(A.phy));
  // A press hurts short build-up, more so with poor passers; long balls skip it.
  const vsPress = me.buildUp === 'long' ? 0.3 : 1.3 - 0.3 * z(A.pas);
  t -= 0.02 * opP * (1 + 0.4 * z(O.phy)) * vsPress;
  t -= 0.012 * (me.tempo - 3);
  t += me.buildUp === 'short' ? 0.03 + 0.03 * z(A.pas) : -0.015;
  if (me.counter) t -= 0.015;
  return t * K;
}

// Multiplier on the number of chances `me` creates.
export function chanceMult(me, them, A, O) {
  let m = 1;
  m *= 1 + 0.05 * (me.tempo - 3);
  m *= 1 - 0.03 * (them.line - 3);
  if (me.buildUp === 'long') m *= 1.05;
  if (me.setPieces) m *= 0.95;
  if (them.offsideTrap) m *= 1 - (0.05 + 0.03 * z(O.defDef));
  return m ** K;
}

// Added to chance quality for `me` (about 0.5 is an even chance).
export function qualityEdge(me, them, A, O, oppMentality) {
  let q = 0;
  q += 0.008 * (me.press - 3);
  // A compact low block makes rivals' chances worse.
  if (them.press < 3) q -= 0.01 * (3 - them.press);
  q += 0.024 * (me.tempo - 3) * z(A.pas);
  // Patient play waits for better openings.
  q += 0.02 * (3 - me.tempo);
  if (A.wide !== null && A.central !== null) {
    const diff = (A.wide - A.central) / 100;
    q += me.attack === 'wings' ? diff * 0.3 : -diff * 0.3;
  }
  if (me.buildUp === 'long') q += 0.02 * z(A.fwdPhy) - 0.01;
  q += 0.035 * (them.line - 3) * (1 - 0.4 * z(O.defPhy));
  if (me.counter) {
    const open = them.line >= 4 || them.press >= 4 || oppMentality === 'attacking';
    q += (open ? 0.07 : 0.005) * (1 + 0.5 * z(A.phy));
  }
  if (them.offsideTrap) q += 0.045 - 0.04 * z(O.defPhy);
  return q * K;
}

// Set-piece focus: chance per segment of an extra dead-ball chance, and its quality.
export function setPieceChance(me, A) {
  if (!me.setPieces) return null;
  return { p: 0.2, quality: Math.max(0.1, 0.3 + 0.12 * z(A.set)) };
}

export function drainMult(t) {
  return (1 + 0.2 * (t.press - 3)) * (1 + 0.04 * (t.tempo - 3)) * (1 + 0.02 * (t.line - 3)) * (t.counter ? 1.05 : 1);
}

// Plain-language advice from the five numbers, one line per setting that matters.
export function styleAdvice(t, A) {
  const out = [];
  const n = (v) => Math.round(v);
  const good = (text) => out.push({ tone: 'good', text });
  const bad = (text) => out.push({ tone: 'bad', text });
  if (t.tempo >= 4) (A.pas >= 72 ? good : bad)(`Fast tempo with Passing ${n(A.pas)}: ${A.pas >= 72 ? 'your passers can play it.' : 'too many passes will go astray.'}`);
  if (t.tempo <= 2 && A.pas < 62) good(`Patient tempo protects weaker passers (Passing ${n(A.pas)}).`);
  if (t.press >= 4) (A.phy >= 70 ? good : bad)(`High press with Physical ${n(A.phy)}: ${A.phy >= 70 ? 'they can keep it up.' : 'they will tire fast. Consider Fresh Legs, Second Wind or a fitness coach.'}`);
  if (t.line >= 4) (A.defPhy >= 70 ? good : bad)(`High line with defenders' Physical ${n(A.defPhy)}: ${A.defPhy >= 70 ? 'quick enough to cover.' : 'slow defenders get caught in behind.'}`);
  if (t.offsideTrap) (A.defDef >= 72 && A.defPhy >= 66 ? good : bad)(`Offside trap with Defense ${n(A.defDef)} and Physical ${n(A.defPhy)} at the back: ${A.defDef >= 72 && A.defPhy >= 66 ? 'they can run it.' : 'risky.'}`);
  if (t.setPieces) (A.set >= 70 ? good : bad)(`Set pieces with a Set pieces rating of ${n(A.set)}: ${A.set >= 70 ? 'a real weapon.' : 'not worth it yet.'}`);
  if (t.buildUp === 'short') (A.pas >= 66 ? good : bad)(`Short build-up with Passing ${n(A.pas)}${A.pas >= 66 ? '.' : ': risky against pressing teams.'}`);
  if (t.buildUp === 'long') (A.fwdPhy >= 74 ? good : bad)(`Long balls with forwards' Physical ${n(A.fwdPhy)}: ${A.fwdPhy >= 74 ? 'they will win them.' : 'they will lose most of them.'}`);
  if (A.wide !== null && A.central !== null) {
    const wideBetter = A.wide > A.central + 2;
    const centreBetter = A.central > A.wide + 2;
    if (t.attack === 'wings' && centreBetter) bad(`Your central players (${n(A.central)}) are better than your wide ones (${n(A.wide)}): attack through the centre.`);
    else if (t.attack === 'centre' && wideBetter) bad(`Your wide players (${n(A.wide)}) are better than your central ones (${n(A.central)}): attack down the wings.`);
    else if (wideBetter || centreBetter) good(`Attacking through the ${t.attack === 'wings' ? 'wings' : 'centre'} uses your best attackers.`);
  }
  if (t.counter) (A.phy >= 68 ? good : bad)(`Counter-attacks with Physical ${n(A.phy)}${A.phy >= 68 ? ': quick enough to break.' : ': too slow to break.'}`);
  return out;
}

// 0–100: how well this squad suits these instructions (share of advice that is good).
export function suitability(t, A) {
  const adv = styleAdvice(t, A);
  if (!adv.length) return 60;
  return Math.round((adv.filter((a) => a.tone === 'good').length / adv.length) * 100);
}
