// Real-life national leagues of clubs that play in an invented "Other" league in the game.
// Key 'N:<country>': a national league outside the game (it counts as the club's league titles).
// Same format as europe-leagues.js.

const SYD = 'sydney-fc'; const MV = 'melbourne-victory'; const BRI = 'brisbane-roar'; const CCM = 'central-coast'; const MC = 'melbourne-city';

export const HISTORY = {
  'N:AUS': {
    name: 'A-League', from: 2006, note: 'Grand Final winners (the A-League champions), from 2005–06.',
    w: [SYD, MV, 'Newcastle Jets', MV,
      /* 2010 */ SYD, BRI, BRI, CCM, BRI, MV, 'adelaide-united', SYD, MV, SYD,
      /* 2020 */ SYD, MC, 'Western United', CCM, CCM, MC],
  },
};
