// Checks every named player and coach card has a known nation code (src/data/nations.js).
// Usage: node scripts/check-nations.mjs
import { PLAYER_CARDS, COACH_CARDS, CLUBS_BY_DIVISION } from '../src/data/world/index.js';
import { NATIONS } from '../src/data/nations.js';
import { USER_COACHES, OPPONENTS } from '../src/data/demo.js';

const errors = [];
const used = {};
const DEMO = [...Object.values(USER_COACHES), ...OPPONENTS.flatMap((o) => o.keyPlayers || o.players || [])];
for (const c of [...PLAYER_CARDS, ...COACH_CARDS, ...DEMO]) {
  if (!c.nation) { errors.push(`${c.id} (${c.name}): no nation`); continue; }
  if (!NATIONS[c.nation]) errors.push(`${c.id} (${c.name}): unknown nation ${c.nation}`);
  used[c.nation] = (used[c.nation] || 0) + 1;
}
// Club coaches, if a club carries one.
for (const clubs of Object.values(CLUBS_BY_DIVISION)) {
  for (const club of clubs) if (club.coach?.name && !NATIONS[club.coach.nation]) errors.push(`${club.id} coach ${club.coach.name}: nation ${club.coach.nation}`);
}
for (const [code, n] of Object.entries(NATIONS)) {
  if (!n.name || !n.flag) errors.push(`nations.js ${code}: needs name and flag`);
}
const total = PLAYER_CARDS.length + COACH_CARDS.length + DEMO.length;
console.log(`cards: ${total} · nations used: ${Object.keys(used).length} · known: ${Object.keys(NATIONS).length}`);
if (process.argv.includes('--list')) console.log(Object.entries(used).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
if (errors.length) { console.log(`ERRORS (${errors.length}):\n  ${errors.slice(0, 200).join('\n  ')}`); process.exit(1); }
console.log('OK');
