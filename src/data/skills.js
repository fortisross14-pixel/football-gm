// Intrinsic skills: elite players and coaches carry one skill each.
// A team can activate at most 2 skills per match, each card once, at any
// decision point that meets the skill's condition. Strength grows with rarity.
// Rare cards have a skill about half the time; Epic and Legend always do.

export const MAX_SKILLS = 2;

// tier: 0 Rare, 1 Epic, 2 Legend. `v` returns the effect strength for a tier.
export const SKILLS = {
  // Forwards
  clutch: {
    name: 'Clutch', icon: '⏱', kind: 'player', pos: ['FWD', 'MID'], when: 'late',
    text: (t) => `From 75': +${[12, 15, 20][t]}% ATT for this player until the end.`,
    effects: (t, ctx) => [{ type: 'playerAtt', playerId: ctx.cardId, value: [0.12, 0.15, 0.2][t], to: 5 }],
  },
  clearChance: {
    name: 'Clear Chance', icon: '🎯', kind: 'player', pos: ['FWD', 'MID'],
    text: (t) => `Creates a clear chance for this player now (${['good', 'great', 'huge'][t]} chance of a goal).`,
    effects: (t, ctx) => [{ type: 'goldenChance', playerId: ctx.cardId, quality: [0.6, 0.72, 0.85][t] }],
  },
  hunter: {
    name: 'Box Hunter', icon: '🦊', kind: 'player', pos: ['FWD'],
    text: (t) => `+${[20, 25, 35][t]}% finishing for this player for 30 minutes.`,
    effects: (t, ctx) => [{ type: 'playerFinish', playerId: ctx.cardId, value: [0.2, 0.25, 0.35][t], len: 2 }],
  },
  // Midfielders
  maestro: {
    name: 'Maestro', icon: '🎼', kind: 'player', pos: ['MID'],
    text: (t) => `+${[15, 20, 25][t]}% midfield control for 30 minutes.`,
    effects: (t) => [{ type: 'control', value: [0.15, 0.2, 0.25][t], len: 2 }],
  },
  killerPass: {
    name: 'Killer Pass', icon: '🗝', kind: 'player', pos: ['MID'],
    text: (t) => `Your team gets ${t === 2 ? 'two' : 'one'} extra chance${t === 2 ? 's' : ''} this 15' (quality ${['good', 'great', 'great'][t]}).`,
    effects: (t) => Array.from({ length: t === 2 ? 2 : 1 }, () => ({ type: 'extraChance', quality: [0.55, 0.65, 0.62][t] })),
  },
  // Defenders and keepers
  lastLine: {
    name: 'Last Line', icon: '🧱', kind: 'player', pos: ['DEF'],
    text: (t) => `Rivals create ${[30, 40, 50][t]}% fewer chances for 15 minutes.`,
    effects: (t) => [{ type: 'oppChances', value: [0.3, 0.4, 0.5][t] }],
  },
  stopper: {
    name: 'Man-Marker', icon: '🔒', kind: 'player', pos: ['DEF', 'MID'],
    text: (t) => `+${[20, 25, 30][t]}% team DEF for ${t === 2 ? 30 : 15} minutes.`,
    effects: (t) => [{ type: 'def', value: [0.2, 0.25, 0.3][t], len: t === 2 ? 2 : 1 }],
  },
  wallOfHands: {
    name: 'Wall of Hands', icon: '🧤', kind: 'player', pos: ['GK'],
    text: (t) => `Rivals convert ${[30, 40, 50][t]}% fewer chances for ${t === 2 ? 30 : 15} minutes.`,
    effects: (t) => [{ type: 'oppConversion', value: [0.3, 0.4, 0.5][t], len: t === 2 ? 2 : 1 }],
  },
  // Coaches (head coach or assistant)
  keepResult: {
    name: 'Keep the Result', icon: '🛡', kind: 'coach', when: 'leading',
    text: (t) => `When leading: +${[35, 35, 45][t]}% team DEF for ${t === 2 ? 30 : 15} minutes.`,
    effects: (t) => [{ type: 'def', value: [0.35, 0.35, 0.45][t], len: t === 2 ? 2 : 1 }],
  },
  allIn: {
    name: 'All In', icon: '🔥', kind: 'coach', when: 'notWinning',
    text: (t) => `When not winning: +${[30, 35, 45][t]}% ATT, −15% DEF for ${t === 2 ? 30 : 15} minutes.`,
    effects: (t) => [{ type: 'att', value: [0.3, 0.35, 0.45][t], len: t === 2 ? 2 : 1 }, { type: 'def', value: -0.15, len: t === 2 ? 2 : 1 }],
  },
  teamTalk: {
    name: 'Half-Time Talk', icon: '📣', kind: 'coach', when: 'halftime',
    text: (t) => `At half time: +${[10, 12, 15][t]}% all stats for the whole second half.`,
    effects: (t) => [{ type: 'all', value: [0.1, 0.12, 0.15][t], to: 5 }],
  },
  pressTrap: {
    name: 'Pressing Trap', icon: '🕸', kind: 'coach',
    text: (t) => `Rival midfield control −${[15, 20, 25][t]}% for 30 minutes.`,
    effects: (t) => [{ type: 'oppControl', value: [0.15, 0.2, 0.25][t], len: 2 }],
  },
  freshLegs: {
    name: 'Fresh Legs', icon: '🫁', kind: 'coach',
    text: (t) => `Every player on the pitch recovers ${[25, 35, 50][t]} stamina.`,
    effects: (t) => [{ type: 'stamina', value: [25, 35, 50][t] }],
  },
};

export const SKILL_TIER = { rare: 0, epic: 1, legend: 2 };

const POOL_BY_POS = {
  GK: ['wallOfHands'],
  DEF: ['lastLine', 'stopper'],
  MID: ['maestro', 'killerPass', 'clearChance', 'stopper', 'clutch'],
  FWD: ['clutch', 'clearChance', 'hunter'],
  COACH: ['keepResult', 'allIn', 'teamTalk', 'pressTrap', 'freshLegs'],
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const isCoachCard = (card) => !!card && !card.pos && !!card.formation;

// The skill a card carries, or null. Explicit `card.skill` wins; otherwise it is
// derived from the card id, so a card always has the same skill.
export function skillOf(card) {
  if (!card || card.generic) return null;
  const tier = SKILL_TIER[card.rarity];
  if (tier === undefined) return null;
  const h = hash(card.baseId || card.id || card.name);
  if (card.skill === null) return null;
  let id = card.skill;
  if (!id) {
    if (tier === 0 && h % 2 === 1) return null;
    const pool = POOL_BY_POS[isCoachCard(card) ? 'COACH' : card.pos] || [];
    if (!pool.length) return null;
    id = pool[(h >>> 3) % pool.length];
  }
  const def = SKILLS[id];
  if (!def) return null;
  return { id, tier, ...def, desc: def.text(tier) };
}
