// Management cards ("off-season cards" in older saves), played from the Cards tab at any
// time, within the season's card-play limit (data/facilities.js). Each card has a rarity
// (index 0–4 = common…legend) that sets its strength.
//
// group:  'transfer' — squad moves, sold in the Transfer Market (open all year)
//         'club'     — club cards, from club packs (data/clubPacks.js), never in the market:
//                      kind 'area' raises one club area for good (infrastructure),
//                      kind 'temp' is a temporary boost (lasts N games, or happens at once)
//         'event'    — season events (the year-end season card draw); no longer in the market
// target: what the player has to pick when using the card.
// summerOnly: only playable in the off-season.
// Temporary cards: effect = { kind, homeOnly } puts an entry in state.clubEffects that lasts
// games[t] matches (home games only when homeOnly); no effect = it happens at once.
import { AREAS, FACILITY_LABEL } from './facilities.js';

export const TIERS = ['common', 'uncommon', 'rare', 'epic', 'legend'];
export const tierIndex = (rarity) => Math.max(0, TIERS.indexOf(rarity));

// How often each rarity shows up in the Transfer Market offer.
export const MARKET_WEIGHTS = [45, 28, 17, 8, 2];
const PRICE_MULT = [1, 1.7, 2.8, 4.5, 8];

const pct = (v) => `${v}%`;

// Which player rarities (tier indexes) a signing card of each rarity can bring.
export const SIGNING_TIERS = [[1], [1, 2], [2], [3], [3, 4]];
const TIER_LABEL = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legend'];
const signingLabel = (t) => SIGNING_TIERS[t].map((i) => TIER_LABEL[i]).join(' or ');

// A club-area card: +1 level up to the rarity's cap (Common 2 … Epic 5), Legend +2 levels.
function areaCard(facility, name, base, blurb) {
  return {
    name, group: 'club', kind: 'area', icon: AREAS[facility].icon, base, target: null, facility,
    values: [2, 3, 4, 5, 5],
    text: (v, r, t) => `${FACILITY_LABEL[facility]} ${t === 4 ? '+2 levels (max 5)' : `+1 level, up to level ${v}`}. ${blurb}`,
  };
}

export const OFFSEASON_CARDS = {
  // ---------------------------------------------------------------- Transfers
  careerExtension: {
    name: 'Career Extension', group: 'transfer', icon: '⏳', base: 150, target: 'person',
    values: [10, 15, 20, 30, 45],
    text: (v) => `+${v} matches to one player or coach.`,
  },
  worldSigning: {
    name: 'World Signing', group: 'transfer', icon: '🌍', base: 250, target: null, scope: 'world',
    values: [0, 1, 2, 3, 4],
    text: (v, r, t) => `Sign a random ${signingLabel(t)} player from any country: a free agent or someone at another club.`,
  },
  nationalSigning: {
    name: 'National Signing', group: 'transfer', icon: '🏳', base: 220, target: null, scope: 'national',
    values: [0, 1, 2, 3, 4],
    text: (v, r, t) => `Sign a random ${signingLabel(t)} player from your club's country: a free agent or someone at another club.`,
  },
  youthIntake: {
    name: 'Youth Intake', group: 'transfer', icon: '🌱', base: 180, target: 'position',
    values: [0, 1, 2, 3, 4],
    text: (v, r) => `An academy player of ${r} level in the position you choose: a club legend if one is available.`,
  },
  goldenGeneration: {
    name: 'Golden Generation', group: 'transfer', icon: '✨', base: 450, target: null,
    values: [1, 1, 2, 3, 4],
    text: (v) => `Your academy produces 2 ${['uncommon', 'uncommon', 'rare', 'epic', 'legend'][v]} players: club legends where possible, from elsewhere if not.`,
  },
  veteranSigning: {
    name: 'Veteran Signing', group: 'transfer', icon: '🧓', base: 200, target: null,
    values: [20, 25, 30, 40, 50],
    text: (v, r) => `Sign a random player one rarity above ${r}, with only ${v} matches left.`,
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
  stadiumEvolution: areaCard('stadium', 'Stadium Evolution', 220, 'More seats, a bigger home gate.'),
  hospitality: areaCard('hospitality', 'Restaurant & Boxes', 200, 'Hospitality: more income every home game.'),
  clubStore: areaCard('store', 'Club Store', 180, 'Store sales every match.'),
  merchExpansion: areaCard('merch', 'Merchandise Line', 200, 'New products: kits, lifestyle, global. Popular players sell more.'),
  findSponsor: areaCard('sponsor', 'Find a Sponsor', 170, 'A bigger sponsor, paid every match.'),
  trainingGround: areaCard('training', 'Training Fields', 220, 'Faster, stronger cohesion.'),
  gymUpgrade: areaCard('gym', 'Gym Upgrade', 180, 'Stamina drains slower in every match.'),
  spaRecovery: areaCard('spa', 'Spa & Recovery', 180, 'Better team shape, even without rotating.'),
  youthAcademy: areaCard('academy', 'Youth Academy', 220, 'More and better academy players each off-season.'),
  analyticsDept: areaCard('analytics', 'Analytics Dept.', 200, 'Better pack odds; more card plays at levels 3 and 5.'),
  sportsScience: {
    name: 'Sports Science', group: 'club', kind: 'temp', icon: '🧪', base: 180, target: null,
    values: [8, 12, 16, 22, 30],
    text: (v) => `+${v} team shape until the season ends (all next season if played in the summer).`,
  },
  boostCrate: {
    name: 'Boost Crate', group: 'club', kind: 'temp', icon: '📦', base: 150, target: null,
    values: [3, 4, 5, 6, 8],
    text: (v) => `${v} random in-game boosts.`,
  },

  // Temporary club cards: they last a few games, or pay off at once. Stronger with rarity.
  highSeason: {
    name: 'High Season', group: 'club', kind: 'temp', icon: '🎟', base: 200, target: null,
    values: [1.5, 1.75, 2, 2, 2.5], games: [3, 3, 3, 4, 5], effect: { kind: 'gate', homeOnly: true },
    text: (v, r, t) => `Home gate ×${v} for the next ${[3, 3, 3, 4, 5][t]} home games.`,
  },
  viralMerch: {
    name: 'Viral Merchandise', group: 'club', kind: 'temp', icon: '📈', base: 200, target: null,
    values: [20, 30, 40, 50, 60], games: [5, 5, 5, 5, 5], effect: { kind: 'merch' },
    text: (v) => `+${v}% merchandise income for the next 5 matches.`,
  },
  ticketPromo: {
    name: 'Ticket Promo', group: 'club', kind: 'temp', icon: '🎫', base: 160, target: null,
    values: [15, 20, 25, 35, 50], fans: [1, 1, 2, 2, 3], games: [3, 3, 3, 3, 3], effect: { kind: 'promo', homeOnly: true },
    text: (v, r, t) => `Home gate +${v}% and fans +${[1, 1, 2, 2, 3][t]} after each of the next 3 home games.`,
  },
  sponsorNight: {
    name: 'Sponsor Night', group: 'club', kind: 'temp', icon: '🥂', base: 150, target: null,
    values: [150, 250, 400, 650, 1000],
    text: (v) => `A one-off sponsor payment: ◎ ${v} (×1.5 in a tier-2 league, ×2 in tier 1).`,
  },
  teamBuilding: {
    name: 'Team Building', group: 'club', kind: 'temp', icon: '🏕', base: 150, target: null,
    values: [10, 15, 20, 25, 30],
    text: (v) => `+${v} cohesion now.`,
  },
  recoveryCamp: {
    name: 'Recovery Camp', group: 'club', kind: 'temp', icon: '🧊', base: 150, target: null,
    values: [6, 8, 10, 12, 15], games: [3, 3, 3, 4, 5], effect: { kind: 'shape' },
    text: (v, r, t) => `+${v} team shape for the next ${[3, 3, 3, 4, 5][t]} matches.`,
  },
  analystReport: {
    name: 'Analyst Report', group: 'club', kind: 'temp', icon: '📑', base: 200, target: null,
    values: [1, 1, 1, 1, 1], games: [2, 3, 3, 4, 5], effect: { kind: 'grade' },
    text: (v, r, t) => `Your tactics grade one step better (red → grey, grey → green) for the next ${[2, 3, 3, 4, 5][t]} matches.`,
  },
  pressCharm: {
    name: 'Press Charm', group: 'club', kind: 'temp', icon: '🎙', base: 150, target: null,
    values: [3, 4, 6, 8, 10],
    text: (v) => `Owners' confidence +${v} now.`,
  },
  localHero: {
    name: 'Local Hero', group: 'club', kind: 'temp', icon: '🦸', base: 150, target: null,
    values: [3, 4, 6, 8, 10],
    text: (v) => `Fans' confidence +${v} now.`,
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
    name: 'Pre-season Camp', group: 'event', icon: '⛺', base: 250, summerOnly: true,
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
  cupRun: {
    name: 'Cup Run', group: 'event', icon: '🏆', base: 250,
    values: [6, 8, 10, 13, 17],
    text: (v) => `+${pct(v)} all stats in domestic cup matches, and cup prize money ×1.5.`,
  },
  continentalNights: {
    name: 'Continental Nights', group: 'event', icon: '🌙', base: 300,
    values: [6, 8, 10, 13, 17],
    text: (v) => `+${pct(v)} all stats in continental and Club World Cup matches.`,
  },
};

export const OFFSEASON_IDS = Object.keys(OFFSEASON_CARDS);
// Club cards: infrastructure (one per area) and temporary ones.
export const CLUB_CARD_IDS = OFFSEASON_IDS.filter((id) => OFFSEASON_CARDS[id].group === 'club');
export const AREA_CARD_IDS = CLUB_CARD_IDS.filter((id) => OFFSEASON_CARDS[id].kind === 'area');
export const TEMP_CARD_IDS = CLUB_CARD_IDS.filter((id) => OFFSEASON_CARDS[id].kind === 'temp');
export const isClubCard = (type) => OFFSEASON_CARDS[type]?.group === 'club';
// How many games a temporary card lasts at a rarity (null: it happens at once).
export const cardGames = (type, rarity) => OFFSEASON_CARDS[type].games?.[tierIndex(rarity)] ?? null;

export function cardValue(type, rarity) {
  return OFFSEASON_CARDS[type].values[tierIndex(rarity)];
}

export function cardText(type, rarity) {
  const def = OFFSEASON_CARDS[type];
  const t = tierIndex(rarity);
  return def.text(def.values[t], rarity, t);
}

// Area cards cost more the higher the area already is (level = its current level).
export const LEVEL_PRICE = [0.8, 1, 1.25, 1.55, 1.9, 1.9];
export function cardPrice(type, rarity, level = null) {
  const def = OFFSEASON_CARDS[type];
  const k = def.facility && level !== null ? LEVEL_PRICE[Math.min(5, level)] : 1;
  return Math.round((def.base * PRICE_MULT[tierIndex(rarity)] * k) / 10) * 10;
}

// Cards from older saves that were replaced.
export const RENAMED_CARDS = { shirtSponsor: 'findSponsor' };

export const GROUP_LABEL = { transfer: 'Transfer', club: 'Club', event: 'Season event' };
// The label on top of a card: club cards say whether they last.
export const cardLabel = (type) => {
  const def = OFFSEASON_CARDS[type];
  if (def.group === 'club') return def.kind === 'area' ? 'Infrastructure' : 'Temporary';
  return GROUP_LABEL[def.group];
};

// A temporary card's text without its game count (the active-effects list shows games left).
export const effectText = (type, rarity) => cardText(type, rarity)
  .replace(/ after each of the next \d+ home games\./, ' after each home game.')
  .replace(/ for the next \d+ (home games|matches)\./, '.');
