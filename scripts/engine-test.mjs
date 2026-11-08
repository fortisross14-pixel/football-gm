// Engine and club-state checks. Run with: npm test
import assert from 'node:assert/strict';
import {
  createMatch, playSegment, playBoost, canPlayBoost, substitute, simulateMatch, SEGMENTS,
} from '../src/engine/match.js';
import { buildAiTeam } from '../src/engine/aiTeam.js';
import { overall, rarityForOverall } from '../src/engine/cards.js';
import { openPack, PACKS } from '../src/engine/packs.js';
import { standings, userFixture, aiTeamFor, clubById } from '../src/engine/season.js';
import { OFFSEASON_IDS, OFFSEASON_CARDS, cardText, TIERS } from '../src/data/offseason.js';
import { PLAYER_POOL, COACH_POOL } from '../src/data/pool.js';
import { OPPONENTS } from '../src/data/demo.js';
import { squadTarget, DIVISION_BY_ID } from '../src/data/world/structure.js';
import {
  newClubState, buildUserTeam, matchRewards, applyMatch, buyPack, keepPending, mergePending, discardPending,
  pendingCard, duplicateOf, closeSeason, buyMarketCard, useOffseasonCard, startNextSeason, poachTargets, POOLS, POOL_BY_ID,
} from '../src/state/club.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const fresh = () => newClubState(99);
const opp = OPPONENTS[1];
const user = (club, loadout = []) => buildUserTeam(club, loadout, true);

// Plays the user's league match for the current matchday (AI controls both sides).
function playMatchday(state, seed) {
  const fx = userFixture(state.season, state.club.divisionId, state.club.id);
  const oppId = fx.opponentId;
  const ai = aiTeamFor(state.world, oppId, POOL_BY_ID, seed);
  const me = buildUserTeam(state, [], fx.isHome);
  const [home, away] = fx.isHome ? [me, ai] : [ai, me];
  const m = simulateMatch({ home, away, seed });
  const side = fx.isHome ? 0 : 1;
  return applyMatch(state, m, side, clubById(state.world, oppId), matchRewards(state, m, side), seed).state;
}

test('card pool rarities match overall ratings', () => {
  for (const c of PLAYER_POOL) assert.equal(rarityForOverall(overall(c)), c.rarity, `${c.name} ${overall(c)}`);
  assert.ok(COACH_POOL.length >= 10);
});

test('same seed gives the same match', () => {
  const club = fresh();
  const a = simulateMatch({ home: user(club), away: buildAiTeam(opp, 3), seed: 42 });
  const b = simulateMatch({ home: user(club), away: buildAiTeam(opp, 3), seed: 42 });
  assert.deepEqual(a.score, b.score);
});

test('a match has 6 segments and a full-time result', () => {
  const m = simulateMatch({ home: user(fresh()), away: buildAiTeam(opp, 3), seed: 7 });
  assert.equal(m.segment, SEGMENTS);
  assert.equal(m.phase, 'fulltime');
});

test('substitution and boosts', () => {
  const club = fresh();
  const star = club.lineup[6];
  let m = createMatch({ home: user(club, ['goldenChance', 'captainsSpeech']), away: buildAiTeam(opp, 3), seed: 11 });
  assert.equal(canPlayBoost(m, 0, 'captainsSpeech').ok, false);
  m = playBoost(m, 0, 'goldenChance', star);
  m = playSegment(m);
  assert.ok(m.events.some((e) => e.playerId === star && e.kind === 'golden'));
  m = substitute(m, 0, club.lineup[5], club.bench[1]);
  assert.equal(m.teams[0].subsLeft, 2);
});

test('knockout draws go to penalties', () => {
  let found = 0;
  for (let seed = 1; seed < 300 && found < 10; seed += 1) {
    const m = simulateMatch({ home: user(fresh()), away: buildAiTeam(opp, seed), seed, context: { knockout: true } });
    if (!m.shootout) continue;
    found += 1;
    assert.notEqual(m.shootout.score[0], m.shootout.score[1]);
  }
  assert.ok(found > 0);
});

test('packs respect guarantees', () => {
  for (let seed = 1; seed < 200; seed += 1) {
    const gold = openPack('gold', seed, POOLS).cards;
    assert.equal(gold.length, 3);
    assert.ok(gold.some((c) => TIERS.indexOf(c.rarity) >= 3), 'gold needs an epic+');
    const coach = openPack('coach', seed, POOLS).cards;
    assert.ok(coach.every((c) => c.role === 'coach'));
  }
});

test('keep, merge and discard', () => {
  let s = fresh();
  s.coins = 10000;
  s = buyPack(s, 'silver', 5);
  assert.equal(s.coins, 10000 - PACKS.silver.price);
  // Keep the first card in place of an academy player.
  const first = pendingCard(s);
  if (!duplicateOf(s, first)) {
    s = keepPending(s, { replaceId: s.bench[0] });
    assert.ok(s.squad.some((c) => c.id === first.id));
    assert.equal(s.squad.length, 10);
  } else s = mergePending(s);
  const coinsBefore = s.coins;
  s = discardPending(s);
  assert.ok(s.coins >= coinsBefore);
  // Force a duplicate of a named card and merge it.
  const named = s.squad.find((c) => POOL_BY_ID[c.id]);
  const att = named.att;
  s.pendingOpen = { source: 'test', cards: [structuredClone(POOL_BY_ID[named.id])], index: 0 };
  s = mergePending(s);
  const merged = s.squad.find((c) => c.id === named.id);
  assert.equal(merged.stars, 1);
  assert.equal(merged.att, att + 2);
  assert.equal(s.pendingOpen, null);
});

test('a full season runs, ends and opens the Transfer Market', () => {
  let s = fresh();
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 100 + md);
  assert.equal(s.phase, 'seasonEnd');
  const table = standings(s.season, s.club.divisionId);
  assert.equal(table.length, 8);
  assert.ok(table.every((r) => r.p === 14));
  assert.equal(table.reduce((a, r) => a + r.gf, 0), table.reduce((a, r) => a + r.ga, 0));
  const coins = s.coins;
  s = closeSeason(s, 3);
  assert.equal(s.phase, 'offseason');
  assert.ok(s.coins > coins);
  assert.equal(s.market.offers.length, 9);
  assert.ok(s.market.offers.some((o) => o.type === 'poach'));
  assert.ok(s.inventory.offseason.length >= 1);
  s.coins = 99999;
  s = buyMarketCard(s, s.market.offers[0].uid);
  assert.ok(s.market.offers[0].sold);
  s = startNextSeason(s, 4);
  assert.equal(s.phase, 'season');
  assert.equal(s.season.year, 2);
});

test('all 25 off-season card types can be used', () => {
  assert.equal(OFFSEASON_IDS.length, 25);
  let base = fresh();
  for (let md = 0; md < 14; md += 1) base = playMatchday(base, 300 + md);
  base = closeSeason(base, 1);
  for (const type of OFFSEASON_IDS) {
    for (const rarity of TIERS) {
      assert.ok(cardText(type, rarity).length > 5);
      const s = structuredClone(base);
      s.inventory.offseason = [{ uid: 'x', type, rarity }];
      s.facilities = { stadium: 0, merch: 0, training: 0, academy: 0 };
      const target = {
        playerId: s.lineup[3], position: 'FWD', trait: 'clutch', formation: '3-1-2', passive: 'tactician', coachRole: undefined,
        poachId: poachTargets(s)[0]?.card.id,
      };
      const r = useOffseasonCard(s, 'x', target, 9);
      if (type === 'poach') assert.ok(r.message.length > 0);
      else assert.equal(r.success, true, `${type}/${rarity}: ${r.message}`);
      if (OFFSEASON_CARDS[type].group === 'event') assert.equal(r.state.activeEvent.type, type);
    }
  }
});

test('promotion and relegation move clubs between tiers', () => {
  let s = fresh();
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 700 + md);
  s.season.divisions['esp-3'].table.racing.pts = 999; // force the title
  s = closeSeason(s, 8);
  assert.equal(s.club.divisionId, 'esp-2');
  assert.equal(s.club.level, 2);
  assert.equal(s.lastSeason.userMove.type, 'promoted');
  assert.equal(s.lastSeason.moves.length, 26); // 13 pairs of adjacent tiers
  for (const ids of Object.values(s.world.divisions)) assert.equal(ids.length, 8);
  assert.ok(s.world.divisions['esp-2'].includes('racing'));
  s = startNextSeason(s, 9);
  assert.ok(userFixture(s.season, 'esp-2', 'racing'));
});

test('the world has 38 full divisions and a big card pool', () => {
  const s = fresh();
  assert.equal(Object.keys(s.world.divisions).length, 38);
  assert.equal(Object.keys(s.world.clubs).length, 304);
  assert.ok(POOLS.player.length >= 400, `pool ${POOLS.player.length}`);
  for (const c of Object.values(s.world.clubs)) {
    const [lo, hi] = squadTarget(c.id, DIVISION_BY_ID[c.divisionId]);
    if (c.id === 'racing') continue;
    assert.ok(c.keyPlayers.length >= lo && c.keyPlayers.length <= hi, `${c.id}: ${c.keyPlayers.length} named`);
  }
  // The user's club starts with its named cards plus generic commons.
  assert.equal(s.squad.length, 10);
  assert.ok(s.squad.filter((c) => c.generic).every((c) => c.rarity === 'common' && !c.name.includes(' ')));
});

test('a card retires at zero matches and is replaced', () => {
  const worn = fresh();
  const id = worn.lineup[3];
  worn.squad.find((c) => c.id === id).matchesLeft = 1;
  const next = playMatchday(worn, 5);
  assert.ok(!next.squad.some((c) => c.id === id));
  assert.equal(next.hallOfFame.length, 1);
  assert.equal(next.squad.length, 10);
});

console.log(`\n${passed} tests passed`);
