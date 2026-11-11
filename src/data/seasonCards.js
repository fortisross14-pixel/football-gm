// Season cards: dealt at the end of every season (3 to choose from, redraws for coins).
// The one you pick is next season's active event (state.seasonCard → state.activeEvent),
// using the same effects as the old season-event cards. Rarity sets the strength.
//
// The deck is the old event-group cards from data/offseason.js plus a few that only
// exist as season cards (defined here, group 'season': never sold in the market).

const pct = (v) => `${v}%`;

export const SEASON_ONLY_CARDS = {
  bargainHunter: {
    name: 'Bargain Hunter', group: 'season', icon: '🏷', base: 250,
    values: [10, 15, 20, 25, 30],
    text: (v) => `Packs ${pct(v)} cheaper all season.`,
  },
  highVisibility: {
    name: 'High Visibility', group: 'season', icon: '📡', base: 250,
    values: [4, 6, 8, 10, 14],
    text: (v) => `At season end: one more job offer, from clubs that would normally want ${v} more reputation.`,
  },
  sponsorsFavourite: {
    name: "Sponsor's Favourite", group: 'season', icon: '🤑', base: 250,
    values: [6, 9, 12, 16, 22],
    text: (v) => `A sponsor bonus of ◎ ${v} every match (× your division's reward multiplier), on top of any sponsor deal.`,
  },
  packedHouse: {
    name: 'Packed House', group: 'season', icon: '🏟', base: 250,
    values: [25, 35, 50, 65, 90],
    text: (v) => `+${pct(v)} home gate income.`,
  },
};

// Every card in the season deck (types from OFFSEASON_CARDS).
export const SEASON_DECK = [
  'fortressSeason', 'indomitableSpirit', 'marketingTour', 'scoutingNetwork', 'tacticalContinuity', 'preseasonCamp',
  'fitnessProgram', 'underdogMentality', 'shootingDrills', 'cupRun', 'continentalNights', 'sportsScience', 'goldenGeneration',
  ...Object.keys(SEASON_ONLY_CARDS),
];

// How often each rarity is dealt (Common … Legend).
export const SEASON_WEIGHTS = [42, 30, 18, 8, 2];
// Coins to redraw the 3 cards, per summer.
export const REDRAW_COSTS = [200, 400, 800];
export const HAND_SIZE = 3;
