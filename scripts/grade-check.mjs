// Tactics grade check: a user-like team (cohesion +5%) with green / grey / red tactics
// against AI clubs of the same strength and stronger, the way the game builds them
// (settled edge, coach fit, club identity tactics). Usage: node scripts/grade-check.mjs [matches]
import { simulateMatch, teamFit } from '../src/engine/match.js';
import { buildAiTeam, makeGenericCard, AI_SETTLED_BY_LEVEL } from '../src/engine/aiTeam.js';
import { makeRng } from '../src/engine/rng.js';
import { FORMATIONS } from '../src/engine/cards.js';
import { PHILOSOPHIES, PHILOSOPHY_IDS } from '../src/data/philosophies.js';
import { COACH_POOL } from '../src/data/pool.js';

const N = Number(process.argv[2]) || 2000;
const LEVEL = 2;

function squad(id, rating, seed) {
  const rng = makeRng(seed);
  const f = '2-3-1';
  const players = [...FORMATIONS[f].map((s, i) => makeGenericCard(rng, { id: `${id}${i}`, pos: s.pos, rating, rarity: 'rare' })),
    ...['GK', 'DEF', 'MID'].map((pos, i) => makeGenericCard(rng, { id: `${id}b${i}`, pos, rating: rating - 4, rarity: 'rare' }))];
  return { formation: f, players, lineup: players.slice(0, 7).map((p) => p.id), bench: players.slice(7).map((p) => p.id) };
}
function user(tactics, coach) {
  const sq = squad('U', 70, 3);
  const base = buildAiTeam({ id: 'U', name: 'U', short: 'USR', colors: {}, level: LEVEL, formation: sq.formation, keyPlayers: [] }, 1);
  const t = { ...base, ...sq, isAI: false, mods: { all: 0.05 }, coach: { ...coach, passive: null }, tactics, fit: undefined };
  return { ...t, fit: teamFit(t) };
}
function ai(rating, i) {
  const id = `opp${i % 40}`; // different ids → different club identities
  const sq = squad(id, rating, 100 + (i % 40));
  return { ...buildAiTeam({ id, name: id, short: 'AI', colors: {}, level: LEVEL, formation: sq.formation, keyPlayers: [] }, i), ...sq };
}

// Find a coach + preset combination for each grade with this squad.
const coaches = COACH_POOL.filter((c) => c.rarity === 'rare' || c.rarity === 'uncommon');
const combos = { green: null, grey: null, red: null };
for (const c of coaches) for (const id of PHILOSOPHY_IDS) {
  const f = user(PHILOSOPHIES[id].t, c).fit;
  if (!combos[f.grade]) combos[f.grade] = { coach: c, id, f };
}
console.log(`AI settled edge at level ${LEVEL}: +${AI_SETTLED_BY_LEVEL[LEVEL] * 100}% · user cohesion +5%`);
for (const grade of ['green', 'grey', 'red']) {
  const c = combos[grade];
  if (!c) { console.log(`${grade}: no combination found`); continue; }
  const row = [];
  for (const gap of [-4, 0, 4, 8]) {
    let w = 0, d = 0, l = 0;
    for (let i = 0; i < N; i += 1) {
      const home = i % 2 === 0;
      const me = user(PHILOSOPHIES[c.id].t, c.coach);
      const them = ai(70 + gap, i);
      const m = simulateMatch({ home: home ? me : them, away: home ? them : me, seed: 77 + i * 7919 });
      const side = home ? 0 : 1;
      if (m.result.winner === side) w += 1; else if (m.result.winner === null) d += 1; else l += 1;
    }
    row.push(`${gap >= 0 ? '+' : ''}${gap}: W ${Math.round((w / N) * 100)}% D ${Math.round((d / N) * 100)}% L ${Math.round((l / N) * 100)}%`);
  }
  console.log(`${grade.padEnd(5)} (${c.coach.name}, ${PHILOSOPHIES[c.id].name}, dist ${c.f.distance}, suits ${c.f.suit}%, team ${(c.f.bonus * 100).toFixed(1)}%)`);
  console.log(`   rival rating ${row.join(' | ')}`);
}
