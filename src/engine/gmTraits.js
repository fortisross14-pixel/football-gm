// The GM card: one permanent trait for the whole career, dealt at random from the style
// the player picks when creating the GM (state.gm.trait = { id, rarity }). Rarity
// (Common … Epic) sets the strength. Every effect is modest by design (docs §7.7).
//
// Pure helpers: each takes the trait (or null) and returns a number to plug into the
// existing game formulas, so a save without a trait (older careers) plays exactly as before.
import { makeRng } from './rng.js';

export const GM_RARITIES = ['common', 'uncommon', 'rare', 'epic'];
// How often each rarity is dealt.
export const GM_RARITY_WEIGHTS = [45, 30, 18, 7];

export const GM_STYLES = {
  financial: { name: 'Financial', icon: '💼', text: 'Money and deals: more income, cheaper cards.', cards: ['moneyMan', 'dealmaker'] },
  tactical: { name: 'Tactical', icon: '📋', text: 'Reads the game: forgiving tactics, stronger skills.', cards: ['tacticsConnoisseur', 'gameReader'] },
  physical: { name: 'Physical', icon: '💪', text: 'Fit squads: better shape, slower stamina drain.', cards: ['fitnessFreak', 'ironSquad'] },
  cohesion: { name: 'Cohesion', icon: '🤝', text: 'A tight dressing room: cohesion builds faster and lasts.', cards: ['dressingRoomLeader', 'continuity'] },
  personal: { name: 'Personal', icon: '🎙', text: 'People skills: owners, fans, coaches and the press.', cards: ['ceosFriend', 'fanFavourite', 'coachTamer', 'mediaDarling'] },
};
export const GM_STYLE_IDS = Object.keys(GM_STYLES);

const pct = (v) => `${Math.round(v * 100)}%`;

// values[i] = strength at GM_RARITIES[i].
export const GM_TRAITS = {
  moneyMan: {
    name: 'Money Man', style: 'financial', icon: '💰', values: [0.05, 0.06, 0.08, 0.1],
    text: (v) => `+${pct(v)} on all club revenue: match income, business income and prize money.`,
  },
  dealmaker: {
    name: 'Dealmaker', style: 'financial', icon: '🤝', values: [0.1, 0.12, 0.14, 0.15],
    text: (v) => `Packs and Transfer Market cards ${pct(v)} cheaper.`,
  },
  tacticsConnoisseur: {
    name: 'Tactics Connoisseur', style: 'tactical', icon: '🧠', values: [1, 1, 2, 2],
    text: (v) => `${v === 1 ? 'One red tactics warning turns' : 'Two red tactics warnings turn'} grey: they stop counting against your plan's grade.`,
  },
  gameReader: {
    name: 'Game Reader', style: 'tactical', icon: '👁', values: [0.1, 0.15, 0.2, 1],
    text: (v, t) => (t === 3 ? '+1 skill per match (3 instead of 2).' : `Skills you fire are ${pct(v)} stronger.`),
  },
  fitnessFreak: {
    name: 'Fitness Freak', style: 'physical', icon: '🏃', values: [6, 8, 10, 12],
    text: (v) => `+${v} team shape, always.`,
  },
  ironSquad: {
    name: 'Iron Squad', style: 'physical', icon: '🛡', values: [0.05, 0.07, 0.09, 0.12],
    text: (v) => `Stamina drains ${pct(v)} slower in every match.`,
  },
  dressingRoomLeader: {
    name: 'Dressing-room Leader', style: 'cohesion', icon: '📣', values: [2, 3, 3, 4],
    text: (v) => `+${v} cohesion after every match.`,
  },
  continuity: {
    name: 'Continuity', style: 'cohesion', icon: '🔗', values: [0.3, 0.4, 0.5, 0.6],
    text: (v) => `Lineup changes cost ${pct(v)} less cohesion.`,
  },
  ceosFriend: {
    name: "CEO's Friend", style: 'personal', icon: '🥂', values: [[1.2, 0.8], [1.25, 0.75], [1.3, 0.7], [1.4, 0.6]],
    text: ([up, down]) => `Owners' confidence: gains ×${up}, losses ×${down}.`,
  },
  fanFavourite: {
    name: 'Fan Favourite', style: 'personal', icon: '🧣', values: [[1.2, 0.8], [1.25, 0.75], [1.3, 0.7], [1.4, 0.6]],
    text: ([up, down]) => `Fans' confidence: gains ×${up}, losses ×${down}.`,
  },
  coachTamer: {
    name: 'Coach Tamer', style: 'personal', icon: '🦁', values: [1, 1, 2, 2],
    text: (v) => `Your coach bends: the distance from his style counts ${v} less (a clash can become a loose fit).`,
  },
  mediaDarling: {
    name: 'Media Darling', style: 'personal', icon: '📺', values: [0.1, 0.12, 0.15, 0.2],
    text: (v) => `Reputation gains +${pct(v)}, and one more job offer whenever clubs call.`,
  },
};
export const GM_TRAIT_IDS = Object.keys(GM_TRAITS);

const tier = (rarity) => Math.max(0, GM_RARITIES.indexOf(rarity));
export const traitDef = (trait) => (trait && GM_TRAITS[trait.id]) || null;
export function traitValue(trait, id = trait?.id) {
  if (!trait || trait.id !== id || !GM_TRAITS[id]) return null;
  return GM_TRAITS[id].values[tier(trait.rarity)];
}
export function traitText(trait) {
  const def = traitDef(trait);
  return def ? def.text(def.values[tier(trait.rarity)], tier(trait.rarity)) : 'No GM card: this career started before GM cards existed.';
}

// Deals the GM card for a style: a random card of that style at a random rarity.
export function drawGmTrait(style, seed) {
  const rng = makeRng(seed);
  const ids = GM_STYLES[style]?.cards || GM_TRAIT_IDS;
  const id = rng.pick(ids);
  const rarity = rng.weighted(GM_RARITIES, (r) => GM_RARITY_WEIGHTS[GM_RARITIES.indexOf(r)]);
  return { id, rarity };
}

// ---------------------------------------------------------------------------
// Effects (0 / 1 / unchanged when the trait doesn't apply)

const num = (trait, id) => traitValue(trait, id) || 0;

export const revenueBonus = (trait) => num(trait, 'moneyMan'); // fraction of match + prize income
export const priceDiscount = (trait) => num(trait, 'dealmaker'); // fraction off packs and market
export const adviceCover = (trait) => num(trait, 'tacticsConnoisseur'); // red advice items that turn neutral
export const shapeBonus = (trait) => num(trait, 'fitnessFreak');
export const drainBonus = (trait) => num(trait, 'ironSquad'); // added to mods.drain
export const cohesionGainBonus = (trait) => num(trait, 'dressingRoomLeader');
export const changeCostFactor = (trait) => 1 - num(trait, 'continuity');
export const coachDistanceCut = (trait) => num(trait, 'coachTamer');
export const reputationBonus = (trait) => num(trait, 'mediaDarling');
export const extraJobOffers = (trait) => (trait?.id === 'mediaDarling' ? 1 : 0);
// Game Reader: Epic gives a third skill per match; lower rarities make skills stronger.
export const extraSkills = (trait) => (trait?.id === 'gameReader' && tier(trait.rarity) === 3 ? 1 : 0);
export const skillPower = (trait) => (trait?.id === 'gameReader' && tier(trait.rarity) < 3 ? num(trait, 'gameReader') : 0);

// Confidence after a change, with CEO's Friend (owners) or Fan Favourite (fans) scaling the move.
export function scaleConfidence(before, after, trait) {
  if (!before || !after) return after;
  const out = { ...after };
  for (const [key, id] of [['board', 'ceosFriend'], ['fans', 'fanFavourite']]) {
    const v = traitValue(trait, id);
    if (!v || before[key] == null || after[key] == null) continue;
    const d = after[key] - before[key];
    out[key] = Math.max(0, Math.min(100, before[key] + d * (d > 0 ? v[0] : v[1])));
  }
  return out;
}
