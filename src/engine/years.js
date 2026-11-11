// Calendar years. Internally seasons are numbered 1, 2, 3…; players see years.
// Season 1 is the 2026–27 season, shown as "2027" (a season is named by the year it ends in,
// the same way the real-life history lists are), so season N is 2026 + N.
export const FIRST_YEAR = 2027;
export const seasonYear = (n) => FIRST_YEAR - 1 + (Number(n) || 1);
// The label used everywhere a season is shown: "2027".
export const yearLabel = (n) => String(seasonYear(n));
// "2027–2029", or "2027" for a single season, or "2027–now".
export const yearSpan = (from, to, current = false) => (current ? `${yearLabel(from)}–now` : from === to || to == null ? yearLabel(from) : `${yearLabel(from)}–${yearLabel(to)}`);
