// The world: 38 divisions of 8 clubs. Club lists live in the region files.
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
  ...single('sco', 'Scotland', 3, 'europe'),
  ...single('aut', 'Austria', 3, 'europe'),
  ...single('gre', 'Greece', 3, 'europe'),
  ...single('eur', 'Europe Other', 3, 'europe'),
  ...single('mex', 'Mexico', 2, 'americas'),
  ...single('usa', 'USA', 3, 'americas'),
  ...single('col', 'Colombia', 3, 'americas'),
  ...single('sam', 'South America Other', 3, 'americas'),
  ...single('jpn', 'Japan', 3, 'afap'),
  ...single('asi', 'Asia Other', 3, 'afap'),
  ...single('apc', 'APAC Other', 3, 'afap'),
  ...single('sau', 'Saudi Arabia', 2, 'afap'),
  ...single('nga', 'Nigeria', 3, 'afap'),
  ...single('egy', 'Egypt', 3, 'afap'),
  ...single('afr', 'Africa Other', 3, 'afap'),
].map((d) => ({ ...d, name: d.tier === 1 && !['ESP', 'ENG', 'ITA', 'GER', 'FRA', 'POR', 'NED', 'ARG', 'BRA'].includes(d.code) ? d.country : `${d.country} · Division ${d.tier}` }));

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
