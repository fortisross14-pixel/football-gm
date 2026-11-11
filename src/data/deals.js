// The club's commercial deals (v2.3), renewed every summer in the off-season flow:
//   - kit provider (the jersey): base coins + a share of the shirt sales,
//   - shirt sponsor: coins for every win, plus a card (renewal) or a signing bonus (new brand),
//   - TV rights: a fixed fee plus coins per game, per home game or per international game.
// The numbers are the single source for state/business.js and the UI. All brands are made up.

// Sponsor offers grow with the Sponsorship area (base per match at levels 0–5, the old
// steady contract) × the division multiplier × 0.8, over a typical season of 22 games.
export const SPONSOR_BASE = [3, 6, 11, 17, 24, 32];
export const SEASON_GAMES = 22;

// A sponsor offer's terms, as shares of the season value (SV).
//   renewal: per win + a card · bonus: big signing bonus, smaller per win · wins: small bonus, big per win
export const SPONSOR_KINDS = {
  renewal: { label: 'Renewal', icon: '🤝', bonus: 0, perWin: 0.085, text: 'Your current sponsor: coins for every win, plus a card for staying.' },
  bonus: { label: 'Signing bonus', icon: '💰', bonus: 0.6, perWin: 0.045, text: 'A big signing bonus on matchday 1, a little for every win.' },
  wins: { label: 'Win bonus', icon: '📈', bonus: 0.15, perWin: 0.085, text: 'A small signing bonus, more for every win.' },
};
export const SPONSOR_BRANDS = [
  'Harbour Bank', 'Northgate Insurance', 'Civic Water', 'Lindqvist Logistics', 'Volt Energy', 'Apex Motors',
  'Kickstart Telecom', 'Crown Airways', 'Goldleaf Holdings', 'Summit Group', 'Laurel Watches', 'Bluefin Foods',
];
// The renewal card: a player pack or an infrastructure card, by division level.
export const RENEWAL_PACK = { 1: 'silver', 2: 'bronze', 3: 'bronze' };
export const RENEWAL_CARD_RARITY = { 1: ['rare', 'epic'], 2: ['uncommon', 'rare'], 3: ['common', 'uncommon'] };

// Kit providers. reach: how many shops sell the shirt; pct: the club's share of sales;
// base: guaranteed coins, in kit units (KIT_UNIT × division multiplier × merchandise line).
export const KIT_TIERS = {
  global: { label: 'Global brand', icon: '🌍', reach: 1.5, pct: 0.12, base: 0.6, text: 'Sold all over the world. Small base, the biggest sales.' },
  national: { label: 'National brand', icon: '🏬', reach: 1.15, pct: 0.13, base: 1.6, text: 'In sports shops across the country.' },
  local: { label: 'Local maker', icon: '🧵', reach: 0.8, pct: 0.15, base: 2.5, text: 'The club shop and the city. The biggest base, the smallest sales.' },
};
export const KIT_TIER_IDS = Object.keys(KIT_TIERS);
export const KIT_BRANDS = {
  global: ['Strive', 'Vanta Sport', 'Orbis Athletic', 'Meridian'],
  national: ['Kestrel', 'Northline', 'Sprintline', 'Fieldcraft'],
  local: ['Corner Stitch', 'Old Mill Sportswear', 'Harbour Kitworks', 'Terrace Tailors'],
};
export const KIT_UNIT = 11;
// Shirts sold = demand × SHIRTS_PER_DEMAND × reach × design; shop takings = shirts × SHIRT_COINS.
export const SHIRTS_PER_DEMAND = 1200;
export const SHIRT_COINS = 1 / 90;
// Design: a new design sells 0.9–1.45× in its first season (a flop is possible) and costs a fee;
// a kept line loses 5% a season it has been worn (down to 0.8×).
export const NEW_DESIGN = { min: 0.9, max: 1.45, fee: 0.6 };
export const lineFactor = (age) => Math.max(0.8, 1 - 0.05 * age);
export const KIT_PATTERNS = ['plain', 'stripes', 'hoops', 'sash', 'halves', 'chevron', 'pinstripe'];
export const PATTERN_LABEL = { plain: 'Plain', stripes: 'Stripes', hoops: 'Hoops', sash: 'Sash', halves: 'Halves', chevron: 'Chevron', pinstripe: 'Pinstripes' };

// TV rights: T = division multiplier × TV_BASE[level] × fans × success, a season. Since v2.3
// league and cup results pay about 5% less (state/club.js RESULT_COINS): TV pays per game instead.
export const TV_BASE = { 1: 240, 2: 110, 3: 55 };
export const TV_KINDS = {
  game: { label: 'Per game', icon: '📺', fee: 0.45, per: 0.55 / SEASON_GAMES, unit: 'a game', text: 'Every match you play, any result.' },
  home: { label: 'Per home game', icon: '🏟', fee: 0.35, per: 0.65 / 11, unit: 'a home game', text: 'Every home match, any competition.' },
  intl: { label: 'International', icon: '🌐', fee: 0.6, per: 0.12, unit: 'an international game', text: 'Continental cups, continental super cup and Club World Cup matches only.' },
};
export const TV_KIND_IDS = Object.keys(TV_KINDS);
export const TV_BRANDS = ['PitchView', 'StreamGoal', 'Arena+', 'Channel 9 Sport', 'Velo TV', 'Matchday One', 'Touchline TV', 'Northstar Sports'];

// The off-season flow, in order. Kit, sponsor and TV must be settled before kick-off
// (defaults: keep the kit, renew the sponsor, take the first TV offer).
export const OFFSEASON_STEPS = [
  { id: 'summary', label: 'Season review', short: 'Review' },
  { id: 'card', label: 'Season card', short: 'Card' },
  { id: 'kit', label: 'Jersey', short: 'Jersey' },
  { id: 'sponsor', label: 'Sponsor', short: 'Sponsor' },
  { id: 'tv', label: 'TV rights', short: 'TV' },
  { id: 'ceo', label: 'CEO meeting', short: 'CEO' },
];
