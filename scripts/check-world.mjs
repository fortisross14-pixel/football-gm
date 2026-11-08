// Validates world region files. Usage: node scripts/check-world.mjs [src/data/world/<region>.js ...]
// With no arguments, checks every region file in src/data/world/.
import { readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIVISIONS, DIVISION_BY_ID, LEVEL_RATING, keyPlayerTarget } from '../src/data/world/structure.js';
import { PLAYER_POOL } from '../src/data/pool.js';
import { overall, rarityForOverall, TRAITS, FORMATIONS, POSITIONS } from '../src/engine/cards.js';
import { COACH_PASSIVES } from '../src/data/coachPassives.js';

const dir = resolve('src/data/world');
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => resolve(f))
  : readdirSync(dir).filter((f) => f.endsWith('.js') && !['structure.js', 'index.js'].includes(f) && !f.startsWith('squads-')).map((f) => resolve(dir, f));

const errors = [];
const warn = [];
const err = (m) => errors.push(m);
const HEX = /^#[0-9a-f]{6}$/i;
const MATCHES = { common: [150, 200], uncommon: [140, 190], rare: [120, 180], epic: [110, 160], legend: [100, 140] };
const poolIds = new Set(PLAYER_POOL.map((p) => p.id));
const allClubIds = new Map();
const allPlayerIds = new Map();
const taggedExisting = new Map();
let clubCount = 0;
let playerCount = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  const name = basename(file);
  const { CLUBS = {}, PLAYERS = [], CLUB_TAGS = {} } = mod;
  const clubsHere = new Map();

  for (const [divId, clubs] of Object.entries(CLUBS)) {
    const div = DIVISION_BY_ID[divId];
    if (!div) { err(`${name}: unknown division id ${divId}`); continue; }
    if (clubs.length !== 8) err(`${name}: ${divId} has ${clubs.length} clubs (need 8)`);
    const shorts = new Set();
    const [lo, hi] = LEVEL_RATING[div.level];
    for (const c of clubs) {
      clubCount += 1;
      const where = `${name} ${divId} ${c.id}`;
      if (!/^[a-z0-9-]+$/.test(c.id || '')) err(`${where}: bad id`);
      if (allClubIds.has(c.id)) err(`${where}: duplicate club id (also in ${allClubIds.get(c.id)})`);
      allClubIds.set(c.id, `${name} ${divId}`);
      clubsHere.set(c.id, div);
      if (!c.name) err(`${where}: missing name`);
      if (!/^[A-Z0-9]{3}$/.test(c.short || '')) err(`${where}: short must be 3 capitals, got ${c.short}`);
      if (shorts.has(c.short)) err(`${where}: short ${c.short} repeated in division`);
      shorts.add(c.short);
      if (!(c.rating >= lo && c.rating <= hi)) err(`${where}: rating ${c.rating} outside L${div.level} range ${lo}-${hi}`);
      if (!FORMATIONS[c.formation]) err(`${where}: bad formation ${c.formation}`);
      if (!COACH_PASSIVES[c.passive]) err(`${where}: bad passive ${c.passive}`);
      for (const k of ['primary', 'secondary', 'away']) if (!HEX.test(c.colors?.[k] || '')) err(`${where}: colors.${k} must be #rrggbb`);
    }
  }

  const perClub = new Map();
  for (const p of PLAYERS) {
    playerCount += 1;
    const where = `${name} player ${p.id}`;
    if (!/^p-[a-z0-9-]+$/.test(p.id || '')) err(`${where}: bad id`);
    if (poolIds.has(p.id)) err(`${where}: already in pool.js, use CLUB_TAGS instead`);
    if (allPlayerIds.has(p.id)) err(`${where}: duplicate player id (also in ${allPlayerIds.get(p.id)})`);
    allPlayerIds.set(p.id, name);
    if (!POSITIONS.includes(p.pos)) err(`${where}: bad pos`);
    if (p.trait !== null && !TRAITS[p.trait]) err(`${where}: bad trait ${p.trait}`);
    if (p.trait === 'shotStopper' && p.pos !== 'GK') err(`${where}: shotStopper is GK only`);
    const ovr = overall(p);
    if (rarityForOverall(ovr) !== p.rarity) err(`${where}: OVR ${ovr} doesn't match rarity ${p.rarity} (should be ${rarityForOverall(ovr)})`);
    const range = MATCHES[p.rarity];
    if (range && p.matchesLeft > range[1]) err(`${where}: matchesLeft ${p.matchesLeft} above ${range[1]}`);
    if (range && p.matchesLeft < 40) err(`${where}: matchesLeft ${p.matchesLeft} too low`);
    if (!/^[A-Z]{3}$/.test(p.nation || '')) err(`${where}: nation must be a 3-letter code`);
    if (!clubsHere.has(p.clubId)) err(`${where}: clubId ${p.clubId} is not a club in this file`);
    perClub.set(p.clubId, (perClub.get(p.clubId) || 0) + 1);
  }
  for (const [pid, clubId] of Object.entries(CLUB_TAGS)) {
    if (!poolIds.has(pid)) err(`${name} CLUB_TAGS: ${pid} is not in pool.js`);
    if (!clubsHere.has(clubId)) err(`${name} CLUB_TAGS: ${clubId} is not a club in this file`);
    if (taggedExisting.has(pid)) warn.push(`${pid} tagged twice (${taggedExisting.get(pid)} and ${name})`);
    taggedExisting.set(pid, name);
    perClub.set(clubId, (perClub.get(clubId) || 0) + 1);
  }
  for (const [clubId, div] of clubsHere) {
    const n = perClub.get(clubId) || 0;
    const want = keyPlayerTarget(div);
    if (n < want) warn.push(`${name} ${clubId}: ${n} named players (target ${want})`);
  }
}

const coveredDivs = new Set();
for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  for (const d of Object.keys(mod.CLUBS || {})) coveredDivs.add(d);
}
console.log(`files: ${files.length} · divisions: ${coveredDivs.size}/${DIVISIONS.length} · clubs: ${clubCount} · new players: ${playerCount} · tagged pool players: ${taggedExisting.size}`);
if (warn.length) console.log(`warnings (${warn.length}):\n  ${warn.slice(0, 40).join('\n  ')}`);
if (errors.length) {
  console.log(`ERRORS (${errors.length}):\n  ${errors.slice(0, 80).join('\n  ')}`);
  process.exit(1);
}
console.log('OK');
