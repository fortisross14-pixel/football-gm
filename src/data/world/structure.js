// The world: 44 divisions of 10 clubs. Club lists live in the region files.
//
// level sets AI strength and the reward multiplier (L1 ×3, L2 ×2, L3 ×1).
// continent decides which continental tournament a champion goes to.

const big4 = (code, country) => [1, 2, 3].map((tier) => ({
  id: `${code}-${tier}`, country, code: code.toUpperCase(), tier, level: tier, continent: 'europe',
}));
const major = (code, country, continent) => [1, 2].map((tier) => ({
  id: `${code}-${tier}`, country, code: code.toUpperCase(), tier, level: tier + 1, continent,
}));
const single = (code, country, level, continent) => [{
  id: `${code}-1`, country, code: code.toUpperCase(), tier: 1, level, continent,
}];

// Every league has a name. The "Other" regions get invented ones.
const LEAGUE_NAMES = {
  'esp-1': 'LaLiga', 'esp-2': 'Segunda División', 'esp-3': 'Primera Federación',
  'eng-1': 'Premier League', 'eng-2': 'Championship', 'eng-3': 'League One',
  'ita-1': 'Serie A', 'ita-2': 'Serie B', 'ita-3': 'Serie C',
  'ger-1': 'Bundesliga', 'ger-2': '2. Bundesliga', 'ger-3': '3. Liga',
  'fra-1': 'Ligue 1', 'fra-2': 'Ligue 2',
  'por-1': 'Primeira Liga', 'por-2': 'Liga Portugal 2',
  'ned-1': 'Eredivisie', 'ned-2': 'Eerste Divisie',
  'arg-1': 'Liga Profesional', 'arg-2': 'Primera Nacional',
  'bra-1': 'Brasileirão', 'bra-2': 'Série B',
  'tur-1': 'Süper Lig', 'sco-1': 'Scottish Premiership', 'aut-1': 'Austrian Bundesliga', 'gre-1': 'Super League Greece',
  'eur-1': 'European Frontier League',
  'bel-1': 'Pro League', 'sui-1': 'Swiss Super League', 'den-1': 'Danish Superliga',
  'mex-1': 'Liga MX', 'mex-2': 'Liga de Expansión MX', 'chi-1': 'Primera División de Chile', 'usa-1': 'MLS', 'col-1': 'Liga Colombiana', 'sam-1': 'Copa Andina League',
  'jpn-1': 'J1 League', 'jpn-2': 'J2 League', 'asi-1': 'Asian Super League', 'apc-1': 'Pacific Rim League', 'sau-1': 'Saudi Pro League',
  'nga-1': 'Nigeria Premier League', 'egy-1': 'Egyptian Premier League', 'afr-1': 'Pan-African League',
};

export const DIVISIONS = [
  ...big4('esp', 'Spain'),
  ...big4('eng', 'England'),
  ...big4('ita', 'Italy'),
  ...big4('ger', 'Germany'),
  ...major('fra', 'France', 'europe'),
  ...major('por', 'Portugal', 'europe'),
  ...major('ned', 'Netherlands', 'europe'),
  ...major('arg', 'Argentina', 'americas'),
  ...major('bra', 'Brazil', 'americas'),
  ...single('tur', 'Turkey', 2, 'europe'),
  ...single('bel', 'Belgium', 2, 'europe'),
  ...single('sui', 'Switzerland', 3, 'europe'),
  ...single('den', 'Denmark', 3, 'europe'),
  ...single('sco', 'Scotland', 3, 'europe'),
  ...single('aut', 'Austria', 3, 'europe'),
  ...single('gre', 'Greece', 3, 'europe'),
  ...single('eur', 'Europe Other', 3, 'europe'),
  ...major('mex', 'Mexico', 'americas'),
  ...single('usa', 'USA', 3, 'americas'),
  ...single('col', 'Colombia', 3, 'americas'),
  ...single('chi', 'Chile', 3, 'americas'),
  ...single('sam', 'South America Other', 3, 'americas'),
  // J1 and J2 are both level 3: J2 clubs are rated lower, and only J1's champion goes to the continent.
  ...[1, 2].map((tier) => ({ id: `jpn-${tier}`, country: 'Japan', code: 'JPN', tier, level: 3, continent: 'afap' })),
  ...single('asi', 'Asia Other', 3, 'afap'),
  ...single('apc', 'APAC Other', 3, 'afap'),
  ...single('sau', 'Saudi Arabia', 2, 'afap'),
  ...single('nga', 'Nigeria', 3, 'afap'),
  ...single('egy', 'Egypt', 3, 'afap'),
  ...single('afr', 'Africa Other', 3, 'afap'),
];

// Every division has this many clubs (a double round-robin of DIVISION_SIZE − 1 rounds each way).
export const DIVISION_SIZE = 10;

const tiersOf = (code) => DIVISIONS.filter((x) => x.code === code).length;
for (const d of DIVISIONS) {
  d.label = tiersOf(d.code) === 1 ? d.country : `${d.country} · Division ${d.tier}`;
  d.name = LEAGUE_NAMES[d.id] || d.country;
}

export const DIVISION_BY_ID = Object.fromEntries(DIVISIONS.map((d) => [d.id, d]));

// AI club rating range per level (club "rating" ≈ the OVR of its generic players).
export const LEVEL_RATING = { 1: [79, 88], 2: [72, 80], 3: [62, 74] };

// Key named players per club by division.
export function keyPlayerTarget(div) {
  if (div.level === 1) return 3;
  if (div.level === 2) return 2;
  return 1;
}

export const CONTINENT_LABEL = { europe: 'Europe', americas: 'Americas', afap: 'Africa–APAC' };

// The world's biggest clubs get the most named (Uncommon+) cards in their squad.
export const TOP_CLUBS = [
  'real-madrid', 'barcelona', 'atletico', 'arsenal', 'liverpool', 'man-city', 'chelsea', 'man-united',
  'inter', 'milan', 'juventus', 'napoli', 'bayern', 'dortmund', 'psg', 'benfica', 'porto', 'ajax',
  'river-plate', 'boca-juniors', 'flamengo', 'palmeiras', 'galatasaray',
];

export const THIN_POOLS = ['everton-chi'];

// Size of a club's history pool (named cards of any era it draws its squad and academy players from).
// The starting squad draws only part of it (see startingDraw in engine/transfers.js).
export function poolTarget(clubId, div) {
  if (TOP_CLUBS.includes(clubId)) return [14, 20];
  if (div.tier === 1 && div.level === 1) return [7, 10];
  // Clubs whose history is thinly documented (added in v1.9): smaller pools; the academy fills the rest.
  if (THIN_POOLS.includes(clubId)) return [2, 8];
  if (div.tier === 1 && div.level === 3) return [3, 8];
  if (div.tier === 1) return [5, 8];
  if (clubId === 'racing') return [5, 8];
  return [3, 5];
}
