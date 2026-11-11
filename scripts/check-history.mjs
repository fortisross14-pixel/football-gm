// Validates the real-life history files (src/data/history/).
//   node scripts/check-history.mjs            errors and a coverage summary
//   node scripts/check-history.mjs --counts   also title counts per club per competition
//   node scripts/check-history.mjs --club real-madrid
import { HISTORY_FILES, RAW_HISTORY, REAL_HISTORY, REAL_TITLES, WORLD_CLUBS, LAST_REAL_YEAR, isClubId, resolveWinner } from '../src/data/history/index.js';
import { DIVISION_BY_ID, DIVISIONS } from '../src/data/world/structure.js';

const errors = [];
const resolvedNames = new Set();
const KEY = /^(L:[a-z]{3}-\d|N:[A-Z]{3}|C:[A-Z]{3}|S:[A-Z]{3}|K2?:[a-z]+|KS:[a-z]+|W)$/;
const CONFS = ['europe', 'southamerica', 'northamerica', 'africa', 'asia', 'oceania'];
const CODES = new Set(DIVISIONS.map((d) => d.code));

const seen = {};
for (const [file, mod] of Object.entries(HISTORY_FILES)) {
  for (const [key, h] of Object.entries(mod.HISTORY)) {
    if (seen[key]) errors.push(`${key}: defined in ${seen[key]} and ${file}`);
    seen[key] = file;
    if (!KEY.test(key)) errors.push(`${key}: bad key`);
    const [kind, ref] = key.split(':');
    if (kind === 'L' && !DIVISION_BY_ID[ref]) errors.push(`${key}: no such division`);
    if ((kind === 'C' || kind === 'S') && !CODES.has(ref)) errors.push(`${key}: no such country code`);
    if (kind?.startsWith('K') && !CONFS.includes(ref)) errors.push(`${key}: unknown confederation`);
    if (!h.name) errors.push(`${key}: no name`);
    if (!Number.isInteger(h.from) || h.from < 1850) errors.push(`${key}: bad from`);
    if (!Array.isArray(h.w) || !h.w.length) { errors.push(`${key}: no winners`); continue; }
    const last = h.from + h.w.length - 1;
    if (last > LAST_REAL_YEAR) errors.push(`${key}: runs to ${last}, after ${LAST_REAL_YEAR}`);
    if (h.w.at(-1) == null) errors.push(`${key}: ends with an empty year`);
    h.w.forEach((w, i) => {
      for (const x of Array.isArray(w) ? w : [w]) {
        if (x == null) { if (Array.isArray(w)) errors.push(`${key} ${h.from + i}: null inside a list`); continue; }
        if (typeof x !== 'string' || !x.trim()) errors.push(`${key} ${h.from + i}: bad entry ${JSON.stringify(x)}`);
        else if (isClubId(x) && !WORLD_CLUBS[x]) errors.push(`${key} ${h.from + i}: unknown club id '${x}'`);
      }
    });
  }
}
for (const [key, h] of Object.entries(REAL_HISTORY)) {
  RAW_HISTORY[key].w.flat().forEach((x) => {
    if (typeof x === 'string' && !isClubId(x)) {
      const r = resolveWinner(x);
      if (r.id) resolvedNames.add(`${x} → ${r.id}`);
    }
  });
  // years strictly increasing (no duplicates)
  for (let i = 1; i < h.years.length; i += 1) if (h.years[i].year <= h.years[i - 1].year) errors.push(`${key}: years out of order at ${h.years[i].year}`);
}

const keys = Object.keys(REAL_HISTORY).sort();
console.log(`${keys.length} competitions, ${Object.values(REAL_HISTORY).reduce((n, h) => n + h.years.length, 0)} seasons, ${Object.keys(REAL_TITLES).length} world clubs with real titles.`);
for (const k of keys) {
  const h = REAL_HISTORY[k];
  console.log(`  ${k.padEnd(16)} ${String(h.years[0]?.year).padEnd(5)}–${h.years.at(-1)?.year}  ${h.name}`);
}
if (resolvedNames.size) console.log(`Names matched to world clubs: ${[...resolvedNames].join(', ')}`);

const args = process.argv.slice(2);
if (args.includes('--counts')) {
  for (const k of keys) {
    const c = {};
    for (const { winners } of REAL_HISTORY[k].years) for (const w of winners) c[w.id || `(${w.name})`] = (c[w.id || `(${w.name})`] || 0) + 1;
    console.log(`${k}: ${Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, n]) => `${id} ${n}`).join(', ')}`);
  }
}
const ci = args.indexOf('--club');
if (ci >= 0) {
  const id = args[ci + 1];
  for (const [k, ys] of Object.entries(REAL_TITLES[id] || {})) console.log(`${k} ×${ys.length}: ${ys.join(', ')}`);
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):\n${errors.join('\n')}`);
  process.exit(1);
}
console.log('History data OK.');
