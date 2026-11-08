// Off-season cards: bought in the Transfer Market, played between seasons.
// Each card has a rarity (index 0–4 = common…legend) that sets its strength.
//
// group:  'transfer' — squad moves, played any number of times
//         'club'     — facilities and club deals, played any number of times
//         'event'    — season events, only 1 per season
// target: what the player has to pick when using the card.

export const TIERS = ['common', 'uncommon', 'rare', 'epic', 'legend'];
export const tierIndex = (rarity) => Math.max(0, TIERS.indexOf(rarity));

// How often each rarity shows up in the Transfer Market offer.
export const MARKET_WEIGHTS = [45, 28, 17, 8, 2];
const PRICE_MULT = [1, 1.7, 2.8, 4.5, 8];

const pct = (v) => `${v}%`;

export const OFFSEASON_CARDS = {
  // ---------------------------------------------------------------- Transfers
  careerExtension: {
    name: 'Career Extension', group: 'transfer', icon: '⏳', base: 150, target: 'person',
    values: [10, 15, 20, 30, 45],
    text: (v) => `+${v} matches to one player or coach.`,
  },
  poach: {
    name: 'Poach', group: 'transfer', icon: '🎯', base: 300, target: 'poach',
    values: [0, 8, 15, 25, 40],
    text: (v) => `Try to sign a named player from a league rival.${v ? ` +${v}% success chance.` : ''} Lower-rarity targets are easier.`,
  },
  freeAgent: {
    name: 'Free Agent', group: 'transfer', icon: '✍', base: 220, target: 'position',
    values: [0, 1, 2, 3, 4],
    text: (v, r) => `Sign a random ${r} player in the position you choose.`,
  },
  youthIntake: {
    name: 'Youth Intake', group: 'transfer', icon: '🌱', base: 180, target: 'position',
    values: [0, 1, 2, 3, 4],
    text: (v, r) => `An academy youngster of ${r} level joins in the position you choose. Very long career.`,
  },
  goldenGeneration: {
    name: 'Golden Generation', group: 'transfer', icon: '✨', base: 450, target: null,
    values: [1, 1, 2, 3, 4],
    text: (v) => `Your academy produces 2 youngsters of ${['uncommon', 'uncommon', 'rare', 'epic', 'legend'][v]} level.`,
  },
  veteranSigning: {
    name: 'Veteran Signing', group: 'transfer', icon: '🧓', base: 200, target: 'position',
    values: [20, 25, 30, 40, 50],
    text: (v, r) => `Sign a player one rarity above ${r} in the position you choose, with only ${v} matches left.`,
  },
  personalTrainer: {
    name: 'Personal Trainer', group: 'transfer', icon: '💪', base: 150, target: 'player',
    values: [2, 3, 4, 5, 7],
    text: (v) => `+${v} ATT, DEF and PHY to one player.`,
  },
  positionRetraining: {
    name: 'Position Retraining', group: 'transfer', icon: '🔁', base: 120, target: 'playerPosition',
    values: [4, 3, 2, 1, 0],
    text: (v) => `Move one player to a new position${v ? ` (−${v} to all stats)` : ' with no stat loss'}.`,
  },
  traitCoach: {
    name: 'Trait Coach', group: 'transfer', icon: '🎓', base: 150, target: 'playerTrait',
    values: [0, 0, 1, 1, 1],
    text: (v) => (v ? 'Teach one player the trait of your choice.' : 'Teach one player a random new trait.'),
  },
  tacticalCourse: {
    name: 'Tactical Course', group: 'transfer', icon: '📋', base: 150, target: 'formation',
    values: [0, 0, 0, 1, 1],
    text: (v) => `Your head coach learns a new formation of your choice${v ? ' and can switch passive' : ''}.`,
  },

  // --------------------------------------------------------------------- Club
  stadiumEvolution: {
    name: 'Stadium Evolution', group: 'club', icon: '🏟', base: 250, target: null, facility: 'stadium',
    values: [2, 3, 4, 5, 5],
    text: (v, r, t) => (t === 4 ? 'Stadium +2 levels (max 5). More income per home game.' : `Stadium +1 level, up to level ${v}. More income per home game.`),
  },
  merchExpansion: {
    name: 'Merchandise Expansion', group: 'club', icon: '👕', base: 220, target: null, facility: 'merch',
    values: [2, 3, 4, 5, 5],
    text: (v, r, t) => (t === 4 ? 'Merchandise +2 levels (max 5).' : `Merchandise +1 level, up to level ${v}. Popular players sell more shirts.`),
  },
  trainingGround: {
    name: 'Training Ground', group: 'club', icon: '🏋', base: 250, target: null, facility: 'training',
    values: [2, 3, 4, 5, 5],
    text: (v, r, t) => (t === 4 ? 'Training ground +2 levels (max 5).' : `Training ground +1 level, up to level ${v}. Faster, stronger cohesion.`),
  },
  youthAcademy: {
    name: 'Youth Academy', group: 'club', icon: '🏫', base: 250, target: null, facility: 'academy',
    values: [2, 3, 4, 5, 5],
    text: (v, r, t) => (t === 4 ? 'Youth academy +2 levels (max 5).' : `Youth academy +1 level, up to level ${v}. Better academy players.`),
  },
  shirtSponsor: {
    name: 'Shirt Sponsor', group: 'club', icon: '🤝', base: 100, target: null,
    values: [10, 18, 30, 50, 90],
    text: (v) => `+${v} coins for every match next season.`,
  },
  boostCrate: {
    name: 'Boost Crate', group: 'club', icon: '📦', base: 150, target: null,
    values: [3, 4, 5, 6, 8],
    text: (v) => `${v} random in-game boosts.`,
  },

  // ------------------------------------------------------------ Season events
  fortressSeason: {
    name: 'Fortress Season', group: 'event', icon: '🏰', base: 300,
    values: [4, 6, 8, 10, 13],
    text: (v) => `+${pct(v)} all stats at home.`,
  },
  indomitableSpirit: {
    name: 'Indomitable Spirit', group: 'event', icon: '🔥', base: 300,
    values: [8, 10, 12, 15, 20],
    text: (v) => `When losing from 60': +${pct(v)} all stats.`,
  },
  marketingTour: {
    name: 'Marketing Tour', group: 'event', icon: '✈', base: 250,
    values: [125, 140, 160, 180, 220],
    text: (v) => `Merchandise income ×${(v / 100).toFixed(2).replace(/0$/, '')}.`,
  },
  scoutingNetwork: {
    name: 'Scouting Network', group: 'event', icon: '🔭', base: 350,
    values: [3, 5, 8, 12, 18],
    text: (v) => `Better pack odds all season (${v} points moved from Common to higher rarities).`,
  },
  tacticalContinuity: {
    name: 'Tactical Continuity', group: 'event', icon: '🧩', base: 250,
    values: [30, 40, 50, 60, 80],
    text: (v) => `Cohesion never drops below ${v}.`,
  },
  preseasonCamp: {
    name: 'Pre-season Camp', group: 'event', icon: '⛺', base: 250,
    values: [3, 3, 4, 5, 6],
    bonus: [4, 5, 6, 7, 9],
    text: (v, r, t) => `+${[4, 5, 6, 7, 9][t]}% all stats in the first ${v} matchdays.`,
  },
  fitnessProgram: {
    name: 'Fitness Program', group: 'event', icon: '🫀', base: 250,
    values: [10, 15, 20, 25, 35],
    text: (v) => `Stamina drains ${pct(v)} slower.`,
  },
  underdogMentality: {
    name: 'Underdog Mentality', group: 'event', icon: '🐺', base: 250,
    values: [5, 7, 9, 12, 16],
    text: (v) => `+${pct(v)} all stats against higher-rated teams.`,
  },
  shootingDrills: {
    name: 'Shooting Drills', group: 'event', icon: '🎯', base: 300,
    values: [5, 7, 10, 13, 18],
    text: (v) => `+${pct(v)} finishing all season.`,
  },
};

export const OFFSEASON_IDS = Object.keys(OFFSEASON_CARDS);

export function cardValue(type, rarity) {
  return OFFSEASON_CARDS[type].values[tierIndex(rarity)];
}

export function cardText(type, rarity) {
  const def = OFFSEASON_CARDS[type];
  const t = tierIndex(rarity);
  return def.text(def.values[t], rarity, t);
}

export function cardPrice(type, rarity) {
  return Math.round((OFFSEASON_CARDS[type].base * PRICE_MULT[tierIndex(rarity)]) / 10) * 10;
}

export const GROUP_LABEL = { transfer: 'Transfer', club: 'Club', event: 'Season event' };
