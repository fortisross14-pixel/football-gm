// Tactics check: each instruction against a neutral side of equal strength.
// Usage: node scripts/tactics-check.mjs [matches]
import { simulateMatch } from '../src/engine/match.js';
import { buildAiTeam, makeGenericCard } from '../src/engine/aiTeam.js';
import { makeRng } from '../src/engine/rng.js';
import { FORMATIONS } from '../src/engine/cards.js';

const N = Number(process.argv[2]) || 3000;
function team(id, tactics, phy = null, coach = null) {
  const c = { id, name: id, short: id, colors: {}, rating: 70, formation: '2-3-1', keyPlayers: [], settled: 0 };
  const rng = makeRng(7);
  const players = [...FORMATIONS[c.formation].map((s, i) => makeGenericCard(rng, { id: `${id}${i}`, pos: s.pos, rating: 70, rarity: 'rare' })),
    ...['GK', 'DEF', 'MID'].map((pos, i) => makeGenericCard(rng, { id: `${id}b${i}`, pos, rating: 66, rarity: 'rare' }))];
  if (phy) for (const p of players) p.phy = phy;
  return { ...buildAiTeam(c, 1), players, lineup: players.slice(0, 7).map((p) => p.id), bench: players.slice(7).map((p) => p.id), mods: { all: 0 }, tactics, coach };
}
function run(label, tactics, opts = {}) {
  let pts = 0, gf = 0, ga = 0;
  for (let i = 0; i < N; i += 1) {
    const s = simulateMatch({ home: team('A', tactics, opts.phy, opts.coach), away: team('B', opts.vs || {}), seed: 99 + i * 7919 });
    pts += s.result.winner === 0 ? 3 : s.result.winner === null ? 1 : 0;
    gf += s.score[0]; ga += s.score[1];
  }
  console.log(`${label.padEnd(34)} pts/game ${(pts / N).toFixed(2)}  GF ${(gf / N).toFixed(2)}  GA ${(ga / N).toFixed(2)}`);
}
run('Neutral', {});
run('High press', { press: 'high' });
run('High press + fitness guru coach', { press: 'high' }, { coach: { passive: 'fitnessGuru' } });
run('High press, PHY 85 squad', { press: 'high' }, { phy: 85 });
run('Low block', { press: 'low' });
run('Short passing', { passing: 'short' });
run('Direct', { passing: 'direct' });
run('Direct, PHY 85 squad', { passing: 'direct' }, { phy: 85 });
run('Deep line', { line: 'deep' });
run('High line', { line: 'high' });
run('High line, PHY 85 squad', { line: 'high' }, { phy: 85 });
run('Deep line vs direct', { line: 'deep' }, { vs: { passing: 'direct' } });
run('High line vs direct', { line: 'high' }, { vs: { passing: 'direct' } });
run('High press vs short', { press: 'high' }, { vs: { passing: 'short' } });
run('High press vs direct', { press: 'high' }, { vs: { passing: 'direct' } });
run('Short vs deep line', { passing: 'short' }, { vs: { line: 'deep' } });
run('Direct vs deep line', { passing: 'direct' }, { vs: { line: 'deep' } });
run('Direct vs high line', { passing: 'direct' }, { vs: { line: 'high' } });
