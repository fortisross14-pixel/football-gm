// Engine checks: determinism, boosts, subs, penalties, applying results.
import assert from 'node:assert/strict';
import {
  createMatch, playSegment, playBoost, canPlayBoost, substitute, simulateMatch, SEGMENTS,
} from '../src/engine/match.js';
import { buildAiTeam } from '../src/engine/aiTeam.js';
import { OPPONENTS } from '../src/data/demo.js';
import { newClubState, buildUserTeam, matchRewards, applyMatch } from '../src/state/club.js';

const club = newClubState();
const user = (loadout = []) => buildUserTeam(club, loadout, true);
const opp = OPPONENTS[1];
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };

test('same seed gives the same match', () => {
  const a = simulateMatch({ home: user(), away: buildAiTeam(opp, 3), seed: 42 });
  const b = simulateMatch({ home: user(), away: buildAiTeam(opp, 3), seed: 42 });
  assert.deepEqual(a.score, b.score);
  assert.deepEqual(a.events.map((e) => e.text), b.events.map((e) => e.text));
});

test('a match has 6 segments and a full-time result', () => {
  const m = simulateMatch({ home: user(), away: buildAiTeam(opp, 3), seed: 7 });
  assert.equal(m.segment, SEGMENTS);
  assert.equal(m.phase, 'fulltime');
  assert.ok(m.result.motm);
  assert.equal(m.result.appeared[0].length >= 7, true);
});

test('substitution swaps players and uses a sub', () => {
  let m = createMatch({ home: user(), away: buildAiTeam(opp, 3), seed: 9 });
  m = playSegment(m);
  m = substitute(m, 0, 'c-aspas', 'c-vela');
  assert.equal(m.teams[0].subsLeft, 2);
  assert.ok(m.teams[0].slots.some((s) => s.playerId === 'c-vela'));
  assert.ok(!m.teams[0].bench.includes('c-vela'));
});

test('boosts are consumed and gated', () => {
  let m = createMatch({ home: user(['goldenChance', 'captainsSpeech', 'gameManagement']), away: buildAiTeam(opp, 3), seed: 11 });
  assert.equal(canPlayBoost(m, 0, 'captainsSpeech').ok, false, 'speech needs to be losing');
  assert.equal(canPlayBoost(m, 0, 'gameManagement').ok, false, 'game management needs last segment');
  assert.equal(canPlayBoost(m, 0, 'goldenChance').ok, false, 'golden chance needs a target');
  m = playBoost(m, 0, 'goldenChance', 'c-pedri');
  assert.deepEqual(m.teams[0].boostsUsed, ['goldenChance']);
  m = playSegment(m);
  assert.ok(m.events.some((e) => (e.type === 'goal' || e.type === 'chance') && e.playerId === 'c-pedri' && e.kind === 'golden'));
});

test('knockout draws go to penalties with a winner', () => {
  let found = 0;
  for (let seed = 1; seed < 400 && found < 20; seed += 1) {
    const m = simulateMatch({ home: user(), away: buildAiTeam(OPPONENTS[1], seed), seed, context: { knockout: true } });
    if (!m.shootout) continue;
    found += 1;
    assert.equal(m.score[0], m.score[1]);
    const [a, b] = m.shootout.score;
    assert.notEqual(a, b);
    assert.equal(m.result.winner, a > b ? 0 : 1);
  }
  assert.ok(found > 0, 'expected some shootouts');
});

test('applying a match pays coins and wears cards', () => {
  const m = simulateMatch({ home: { ...user(['secondWind']), isAI: false }, away: buildAiTeam(opp, 3), seed: 5 });
  const rewards = matchRewards(club, m, 0, opp.level);
  const { state } = applyMatch(club, m, 0, opp, rewards);
  assert.equal(state.coins, rewards.total);
  const pedri = state.squad.find((c) => c.id === 'c-pedri');
  assert.equal(pedri.matchesLeft, 157);
  assert.equal(state.record.w + state.record.d + state.record.l, 1);
  assert.equal(state.coaches.coach.matchesLeft, 183);
});

test('a card retires at zero matches and is replaced', () => {
  const worn = structuredClone(club);
  worn.squad.find((c) => c.id === 'c-aspas').matchesLeft = 1;
  const m = simulateMatch({ home: buildUserTeam(worn, [], true), away: buildAiTeam(opp, 3), seed: 5 });
  const { state, retired } = applyMatch(worn, m, 0, opp, matchRewards(worn, m, 0, opp.level));
  assert.equal(retired[0].id, 'c-aspas');
  assert.equal(state.hallOfFame.length, 1);
  assert.ok(!state.lineup.includes('c-aspas'));
  assert.equal(state.squad.length, 10);
});

console.log(`\n${passed} tests passed`);
