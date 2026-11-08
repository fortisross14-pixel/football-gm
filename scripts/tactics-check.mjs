// Tactics check: instructions and coach fit against a neutral side of equal strength.
// Usage: node scripts/tactics-check.mjs [matches]
import { simulateMatch } from '../src/engine/match.js';
import { buildAiTeam, makeGenericCard } from '../src/engine/aiTeam.js';
import { makeRng } from '../src/engine/rng.js';
import { FORMATIONS } from '../src/engine/cards.js';
import { PHILOSOPHIES } from '../src/data/philosophies.js';
import { COACH_POOL } from '../src/data/pool.js';

const N = Number(process.argv[2]) || 3000;
// Coach passives are switched off here so only the philosophy fit shows.
const coach = (id) => ({ ...COACH_POOL.find((c) => c.id === id), passive: null });
function team(id, tactics, opts = {}) {
  const c = { id, name: id, short: id, colors: {}, rating: 70, formation: '2-3-1', keyPlayers: [], settled: 0 };
  const rng = makeRng(7);
  const players = [...FORMATIONS[c.formation].map((s, i) => makeGenericCard(rng, { id: `${id}${i}`, pos: s.pos, rating: 70, rarity: 'rare' })),
    ...['GK', 'DEF', 'MID'].map((pos, i) => makeGenericCard(rng, { id: `${id}b${i}`, pos, rating: 66, rarity: 'rare' }))];
  if (opts.phy) for (const p of players) p.phy = opts.phy;
  if (opts.playmakers) for (const p of players) p.trait = 'playmaker';
  return {
    ...buildAiTeam(c, 1), players, lineup: players.slice(0, 7).map((p) => p.id), bench: players.slice(7).map((p) => p.id),
    mods: { all: 0 }, tactics, coach: opts.coach || null, fit: opts.coach ? undefined : { bonus: 0 },
  };
}
function run(label, tactics, opts = {}) {
  let pts = 0, gf = 0, ga = 0;
  for (let i = 0; i < N; i += 1) {
    const s = simulateMatch({ home: team('A', tactics, opts), away: team('B', opts.vs || {}), seed: 99 + i * 7919 });
    pts += s.result.winner === 0 ? 3 : s.result.winner === null ? 1 : 0;
    gf += s.score[0]; ga += s.score[1];
  }
  console.log(`${label.padEnd(44)} pts/game ${(pts / N).toFixed(2)}  GF ${(gf / N).toFixed(2)}  GA ${(ga / N).toFixed(2)}`);
}
const P = (id) => PHILOSOPHIES[id].t;
console.log('— One instruction at a time (average squad, no coach effect)');
run('Neutral', {});
run('Attack mentality', { approach: 'attacking' });
run('Defend mentality', { approach: 'cautious' });
run('Press 5', { press: 5 });
run('Press 1', { press: 1 });
run('Tempo 5', { tempo: 5 });
run('Tempo 5, good passers (PAS +7)', { tempo: 5 }, { playmakers: true });
run('Tempo 1', { tempo: 1 });
run('Line 5', { line: 5 });
run('Line 5, slow squad (PHY 55)', { line: 5 }, { phy: 55 });
run('Line 1', { line: 1 });
run('Long balls', { buildUp: 'long' });
run('Long balls, strong squad (PHY 85)', { buildUp: 'long' }, { phy: 85 });
run('Offside trap', { offsideTrap: true });
run('Offside trap, slow squad (PHY 55)', { offsideTrap: true }, { phy: 55 });
run('Set pieces', { setPieces: true });
run('Counter-attacks', { counter: true });
run('Counter vs line 5', { counter: true }, { vs: { line: 5 } });
run('Press 5 vs short build-up', { press: 5 }, { vs: { buildUp: 'short' } });
run('Press 5 vs long balls', { press: 5 }, { vs: { buildUp: 'long' } });
console.log('— Coach fit');
run('Total football + Luis Enrique (epic, fits)', P('totalFootball'), { coach: coach('k-luis-enrique') });
run('Total football + Simeone (epic, clash)', P('totalFootball'), { coach: coach('k-diego-simeone') });
run('Catenaccio + Simeone (fits)', P('catenaccio'), { coach: coach('k-diego-simeone') });
run('Catenaccio + Luis Enrique (clash)', P('catenaccio'), { coach: coach('k-luis-enrique') });
console.log('— Philosophy vs philosophy (instructions only)');
const IDS = Object.keys(PHILOSOPHIES);
const M = Math.max(400, Math.round(N / 4));
const row = (a) => IDS.map((b) => {
  let pts = 0;
  for (let i = 0; i < M; i += 1) {
    const s = simulateMatch({ home: team('A', P(a)), away: team('B', P(b)), seed: 7 + i * 7919 });
    const h = s.result.winner === 0 ? 3 : s.result.winner === null ? 1 : 0;
    const s2 = simulateMatch({ home: team('A', P(b)), away: team('B', P(a)), seed: 11 + i * 7919 });
    pts += h + (s2.result.winner === 1 ? 3 : s2.result.winner === null ? 1 : 0);
  }
  return (pts / (2 * M)).toFixed(2);
});
console.log(`${''.padEnd(14)}${IDS.map((b) => b.slice(0, 8).padStart(9)).join('')}`);
for (const a of IDS) console.log(`${a.padEnd(14)}${row(a).map((v) => v.padStart(9)).join('')}`);
