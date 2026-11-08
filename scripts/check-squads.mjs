// Validates club squads. Usage: node scripts/check-squads.mjs [src/data/world/squads-<region>.js ...]
// With no arguments, checks every squads-*.js file together (cross-file duplicates too).
import { readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIVISION_BY_ID, squadTarget } from '../src/data/world/structure.js';
import { PLAYER_POOL } from '../src/data/pool.js';
import * as europeA from '../src/data/world/europe-a.js';
import * as europeB from '../src/data/world/europe-b.js';
import * as europeC from '../src/data/world/europe-c-southam.js';
import * as rest from '../src/data/world/rest.js';

const REGIONS = [europeA, europeB, europeC, rest];
const CLUBS_BY_DIVISION = Object.assign({}, ...REGIONS.map((r) => r.CLUBS));
const PLAYER_CARDS = [...PLAYER_POOL, ...REGIONS.flatMap((r) => r.PLAYERS)];
import { overall, rarityForOverall, TRAITS, POSITIONS } from '../src/engine/cards.js';

const dir = resolve('src/data/world');
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => resolve(f))
  : readdirSync(dir).filter((f) => /^squads-.*\.js$/.test(f)).map((f) => resolve(dir, f));

const errors = [];
const warns = [];
const MATCHES = { uncommon: [140, 190], rare: [120, 180], epic: [110, 160], legend: [100, 140] };
const clubDiv = {};
for (const [divId, clubs] of Object.entries(CLUBS_BY_DIVISION)) for (const c of clubs) clubDiv[c.id] = DIVISION_BY_ID[divId];
const known = new Map(PLAYER_CARDS.map((p) => [p.id, { card: p, from: 'existing' }]));
const assigned = new Map();
const squadsByFile = [];

for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  const name = basename(file);
  for (const p of mod.PLAYERS || []) {
    const where = `${name} new card ${p.id}`;
    if (known.has(p.id)) { errors.push(`${where}: id already exists (${known.get(p.id).from})`); continue; }
    known.set(p.id, { card: p, from: name });
    if (!/^p-[a-z0-9-]+$/.test(p.id)) errors.push(`${where}: bad id`);
    if (!POSITIONS.includes(p.pos)) errors.push(`${where}: bad pos`);
    if (p.trait !== null && !TRAITS[p.trait]) errors.push(`${where}: bad trait`);
    if (p.trait === 'shotStopper' && p.pos !== 'GK') errors.push(`${where}: shotStopper is GK only`);
    const r = rarityForOverall(overall(p));
    if (r !== p.rarity) errors.push(`${where}: OVR ${overall(p)} → ${r}, but rarity says ${p.rarity}`);
    const m = MATCHES[p.rarity];
    if (!m) errors.push(`${where}: new cards must be uncommon or better`);
    else if (p.matchesLeft < 60 || p.matchesLeft > m[1]) errors.push(`${where}: matchesLeft ${p.matchesLeft} outside 60–${m[1]}`);
    if (!/^[A-Z]{3}$/.test(p.nation || '')) errors.push(`${where}: nation must be a 3-letter code`);
  }
  squadsByFile.push([name, mod.SQUADS || {}]);
}

let total = 0;
for (const [name, squads] of squadsByFile) {
  for (const [clubId, ids] of Object.entries(squads)) {
    const div = clubDiv[clubId];
    if (!div) { errors.push(`${name}: unknown club ${clubId}`); continue; }
    const [lo, hi] = squadTarget(clubId, div);
    if (ids.length < lo || ids.length > hi) errors.push(`${name} ${clubId}: ${ids.length} named cards, needs ${lo}–${hi}`);
    for (const id of ids) {
      total += 1;
      const k = known.get(id);
      if (!k) { errors.push(`${name} ${clubId}: card ${id} doesn't exist`); continue; }
      if (k.card.rarity === 'common' || k.card.rarity === 'academy') errors.push(`${name} ${clubId}: ${id} is ${k.card.rarity}; named squad cards must be uncommon or better`);
      if (assigned.has(id)) errors.push(`${id} is in two squads: ${assigned.get(id)} and ${clubId} (${name})`);
      assigned.set(id, clubId);
    }
  }
}
// Clubs with a minimum above 0 must appear.
for (const [clubId, div] of Object.entries(clubDiv)) {
  const [lo] = squadTarget(clubId, div);
  const present = squadsByFile.some(([, s]) => s[clubId]);
  if (!present && lo > 0 && process.argv.slice(2).length === 0) warns.push(`${clubId}: no squad entry (needs ${lo}+)`);
}
console.log(`files: ${files.length} · clubs with squads: ${squadsByFile.reduce((a, [, s]) => a + Object.keys(s).length, 0)} · named cards: ${total} · new cards: ${[...known.values()].filter((k) => k.from !== 'existing').length}`);
if (warns.length) console.log(`warnings (${warns.length}):\n  ${warns.slice(0, 30).join('\n  ')}`);
if (errors.length) { console.log(`ERRORS (${errors.length}):\n  ${errors.slice(0, 80).join('\n  ')}`); process.exit(1); }
console.log('OK');
