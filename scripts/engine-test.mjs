// Engine and club-state checks. Run with: npm test
import assert from 'node:assert/strict';
import {
  createMatch, playSegment, playBoost, canPlayBoost, substitute, simulateMatch, SEGMENTS,
} from '../src/engine/match.js';
import { buildAiTeam } from '../src/engine/aiTeam.js';
import { overall, rarityForOverall } from '../src/engine/cards.js';
import { openPack, PACKS } from '../src/engine/packs.js';
import { standings, userFixture, aiTeamFor, clubById } from '../src/engine/season.js';
import { OFFSEASON_IDS, OFFSEASON_CARDS, cardText, TIERS, SIGNING_TIERS } from '../src/data/offseason.js';
import { PLAYER_POOL, COACH_POOL } from '../src/data/pool.js';
import { OPPONENTS } from '../src/data/demo.js';
import { DIVISION_BY_ID } from '../src/data/world/structure.js';
import { startingDraw, aiOffseason } from '../src/engine/transfers.js';
import { CLUB_POOLS, PLAYER_CARDS } from '../src/data/world/index.js';
import {
  newClubState, buildUserTeam, matchRewards, applyMatch, buyPack, keepPending, mergePending, discardPending,
  pendingCard, duplicateOf, nextUserGame, newSeason, closeSeason, acceptOffer, carryOptions, buyMarketCard, useOffseasonCard, startNextSeason, POOLS, POOL_BY_ID,
} from '../src/state/club.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const fresh = () => newClubState(99);
// Decides on any waiting cards (e.g. the academy intake) by discarding them.
const resolve = (s) => { let x = s; while (x.pendingOpen) x = discardPending(x); return x; };
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
  assert.ok(s.market.offers.some((o) => ['worldSigning', 'nationalSigning'].includes(o.type)));
  assert.ok(s.inventory.offseason.length >= 1);
  s.coins = 99999;
  s = buyMarketCard(s, s.market.offers[0].uid);
  assert.ok(s.market.offers[0].sold);
  assert.equal(startNextSeason(s, 4).phase, 'offseason', 'academy cards must be decided first');
  s = startNextSeason(resolve(s), 4);
  assert.equal(s.phase, 'season');
  assert.equal(s.season.year, 2);
});

test('all 27 off-season card types can be used', () => {
  assert.equal(OFFSEASON_IDS.length, 27);
  let base = fresh();
  for (let md = 0; md < 14; md += 1) base = playMatchday(base, 300 + md);
  base = resolve(closeSeason(base, 1));
  for (const type of OFFSEASON_IDS) {
    for (const rarity of TIERS) {
      assert.ok(cardText(type, rarity).length > 5);
      const s = structuredClone(base);
      s.inventory.offseason = [{ uid: 'x', type, rarity }];
      s.facilities = { stadium: 0, merch: 0, training: 0, academy: 0 };
      const target = {
        playerId: s.lineup[3], position: 'FWD', trait: 'clutch', formation: '3-1-2', passive: 'tactician', coachRole: undefined,
      };
      const r = useOffseasonCard(s, 'x', target, 9);
      assert.equal(r.success, true, `${type}/${rarity}: ${r.message}`);
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
  s = startNextSeason(resolve(s), 9);
  assert.ok(userFixture(s.season, 'esp-2', 'racing'));
});

test('the world has 38 full divisions and a big card pool', () => {
  const s = fresh();
  assert.equal(Object.keys(s.world.divisions).length, 38);
  assert.equal(Object.keys(s.world.clubs).length, 304);
  assert.ok(POOLS.player.length >= 400, `pool ${POOLS.player.length}`);
  const seen = new Set(s.squad.map((c) => c.id));
  for (const c of Object.values(s.world.clubs)) {
    if (c.id === 'racing') continue;
    const [lo, hi] = startingDraw(c.id, DIVISION_BY_ID[c.divisionId]);
    const pool = (CLUB_POOLS[c.id] || []).length;
    assert.ok(c.keyPlayers.length >= Math.min(lo, pool) - 2 && c.keyPlayers.length <= hi, `${c.id}: ${c.keyPlayers.length} named`);
    for (const id of c.keyPlayers) {
      assert.ok(CLUB_POOLS[c.id].includes(id), `${id} drawn from another club's pool`);
      assert.ok(!seen.has(id), `${id} held twice`);
      seen.add(id);
    }
  }
  // The user's club starts with its named cards plus generic commons.
  assert.equal(s.squad.length, 10);
  assert.ok(s.squad.filter((c) => c.generic).every((c) => c.rarity === 'common' && !c.name.includes(' ')));
});

test('off-season: academies, signings and retirements keep one card per club', () => {
  let s = fresh();
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 900 + md);
  s = closeSeason(s, 12);
  assert.ok(s.lastSeason.news.length > 0, 'expected some notable moves');
  const holders = new Map();
  for (const c of Object.values(s.world.clubs)) {
    assert.ok(c.keyPlayers.length <= 10);
    for (const id of c.keyPlayers) {
      assert.ok(!holders.has(id), `${id} at ${holders.get(id)} and ${c.id}`);
      holders.set(id, c.id);
    }
  }
  for (const card of s.squad) assert.ok(!holders.has(card.id), `${card.id} held by user and ${holders.get(card.id)}`);
  // Ten more seasons of AI off-seasons keep squads valid and retire old cards.
  let w = s.world;
  for (let y = 0; y < 10; y += 1) w = aiOffseason(w, { pools: CLUB_POOLS, poolById: POOL_BY_ID, allCards: PLAYER_CARDS, userIds: [], seed: y, countryOf: (d) => DIVISION_BY_ID[d].code }).world;
  assert.ok(w.retiredCount > 50, `retired ${w.retiredCount}`);
  const avg = Object.values(w.clubs).reduce((a, c) => a + c.keyPlayers.length, 0) / 304;
  assert.ok(avg > 2, `squads ran dry: ${avg.toFixed(2)} named per club`);
  for (const c of Object.values(w.clubs)) assert.ok(c.keyPlayers.length <= 10);
});

test('signing cards bring a random player of the right rarity, maybe from another club', () => {
  let base = fresh();
  for (let md = 0; md < 14; md += 1) base = playMatchday(base, 1300 + md);
  base = resolve(closeSeason(base, 2));
  let fromClub = 0;
  for (let i = 0; i < 40; i += 1) {
    const s = structuredClone(base);
    const rarity = ['common', 'uncommon', 'rare', 'epic', 'legend'][i % 5];
    const type = i % 2 ? 'nationalSigning' : 'worldSigning';
    s.inventory.offseason = [{ uid: 'x', type, rarity }];
    const r = useOffseasonCard(s, 'x', {}, 100 + i);
    assert.equal(r.success, true, r.message);
    const card = r.state.pendingOpen.cards[0];
    assert.ok(SIGNING_TIERS[i % 5].includes(['common', 'uncommon', 'rare', 'epic', 'legend'].indexOf(card.rarity)));
    if (r.state.pendingOpen.source.startsWith('Signed from')) {
      fromClub += 1;
      const holder = Object.values(r.state.world.clubs).find((c) => c.keyPlayers.includes(card.id));
      assert.ok(holder, 'should still be at the club until kept');
      const kept = keepPending(r.state, { replaceId: r.state.bench[0] });
      assert.ok(!Object.values(kept.world.clubs).some((c) => c.keyPlayers.includes(card.id)), 'keeping removes them from the club');
    }
  }
  assert.ok(fromClub > 0, 'some signings should come from other clubs');
});

// Plays the user's next game in any competition, the way the app does.
function playNext(state, seed) {
  const game = nextUserGame(state);
  const homeFirst = game.homeId === state.club.id;
  const me = buildUserTeam(state, [], homeFirst && !game.neutral);
  const ai = aiTeamFor(state.world, game.opponentId, POOL_BY_ID, seed);
  const m = simulateMatch({ home: homeFirst ? me : ai, away: homeFirst ? ai : me, seed, context: { competition: game.competition, knockout: game.knockout, neutral: game.neutral } });
  const side = homeFirst ? 0 : 1;
  return applyMatch(state, m, side, clubById(state.world, game.opponentId), matchRewards(state, m, side, game), seed, game).state;
}

test('cups, continental tournaments and the Club World Cup all finish', () => {
  let s = fresh();
  let guard = 0;
  while (s.phase === 'season' && guard < 60) { s = playNext(s, 2000 + guard); guard += 1; }
  assert.equal(s.phase, 'seasonEnd');
  const { comps } = s.season;
  for (const [code, cup] of Object.entries(comps.cups)) assert.ok(cup.winner, `${code} cup has no winner`);
  for (const k of ['europe', 'americas', 'afap']) {
    const c = comps.continental[k];
    assert.ok(c.winner, `${k} has no winner`);
    assert.equal(c.groups.length, 2);
    for (const g of c.groups) assert.ok(Object.values(g.table).every((r) => r.p === 3));
  }
  assert.ok(comps.cwc.winner);
  assert.ok(comps.cwc.clubs.includes(comps.cwc.winner));
  s = closeSeason(s, 3);
  assert.ok(s.lastSeason.continental.europe);
  assert.equal(s.qualification.europe.direct.length, 4);
  assert.equal(s.qualification.americas.length, 8);
  assert.equal(s.qualification.afap.length, 8);
});

test('a qualified club plays its continental games through the season', () => {
  let s = fresh();
  s.qualification.europe.direct[0] = 'racing';
  s.season = newSeason(s, 1, 77);
  let guard = 0;
  const seen = new Set();
  while (s.phase === 'season' && guard < 60) {
    seen.add(nextUserGame(s).competition);
    s = playNext(s, 3000 + guard);
    guard += 1;
  }
  assert.ok(seen.has('continental'), 'should play continental games');
  const groupGames = s.history.filter((h) => h.competition === 'European Cup').length;
  assert.ok(groupGames >= 3, `played ${groupGames} European games`);
  assert.equal(s.phase, 'seasonEnd');
});

test('popularity grows with goals and the books track money', () => {
  let s = fresh();
  for (let md = 0; md < 6; md += 1) s = playMatchday(s, 4000 + md);
  const scorers = s.squad.filter((c) => (s.playerStats[c.id]?.goals || 0) > 0);
  assert.ok(scorers.length > 0);
  assert.ok(scorers.every((c) => c.fame > 0));
  assert.ok(s.finance.income.Results > 0);
  assert.ok(s.finance.income.Gate > 0);
});

test('season events show up in the match and change it', () => {
  const club = fresh();
  club.activeEvent = { type: 'cupRun', rarity: 'legend' };
  const team = buildUserTeam(club, [], true);
  assert.equal(team.mods.cup, 0.17);
  let m = createMatch({ home: team, away: buildAiTeam(opp, 3), seed: 4, context: { competition: 'cup', knockout: true } });
  m = playSegment(m);
  assert.ok(m.events.some((e) => e.text.startsWith('Cup Run')));
});

test('GM career: objective, review, offers and switching clubs with 2 cards', () => {
  let s = fresh();
  assert.ok(s.gm.objective && s.gm.objective.text);
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 5000 + md);
  // Force a strong season so offers arrive.
  s.season.divisions['esp-3'].table.racing.pts = 999;
  s = resolve(closeSeason(s, 4));
  assert.equal(s.gm.review.verdict === 'missed', false);
  assert.ok(s.gm.reputation > 10, `reputation ${s.gm.reputation}`);
  // Make sure there is at least one offer to test with.
  if (!s.gm.offers.length) s.gm.offers = [{ clubId: 'sporting', required: 0, name: 'Sporting Gijón', division: 'x', level: 3 }];
  const offer = s.gm.offers[0];
  const opts = carryOptions(s);
  const star = s.squad.find((c) => POOL_BY_ID[c.id]);
  const carry = [`player:${star.id}`, opts.find((o) => o.kind === 'coach').key];
  const keptCoach = s.coaches.coach.name;
  const moved = acceptOffer(s, offer.clubId, carry, 7);
  assert.equal(moved.club.id, offer.clubId);
  assert.ok(moved.squad.some((c) => c.id === star.id), 'carried player comes along');
  assert.equal(moved.coaches.coach.name, keptCoach, 'carried coach comes along');
  assert.equal(moved.squad.length, 10);
  assert.equal(moved.inventory.packs.length, 0, 'uncarried packs stay behind');
  assert.equal(moved.world.clubs[offer.clubId].keyPlayers.length, 0, 'your club has no AI squad');
  const leftBehind = s.squad.filter((c) => POOL_BY_ID[c.id] && c.id !== star.id).map((c) => c.id);
  for (const id of leftBehind.slice(0, 1)) assert.ok(moved.world.clubs.racing.keyPlayers.includes(id), 'old club keeps your legends');
  assert.equal(moved.gm.career.length, 2);
  const next = startNextSeason(moved, 9);
  assert.equal(next.phase, 'season');
  assert.ok(nextUserGame(next));
  assert.ok(next.gm.objective);
});

test('two missed objectives in a row get you sacked', () => {
  let s = fresh();
  s.gm.missedInRow = 1;
  s.gm.objective = { target: 1, text: 'Win the league' };
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 6000 + md);
  s.season.divisions['esp-3'].table.racing.pts = -50; // finish last
  s = resolve(closeSeason(s, 5));
  assert.equal(s.gm.sacked, true);
  assert.ok(s.gm.offers.length >= 1);
  assert.equal(startNextSeason(s, 1).phase, 'offseason', 'must take a job first');
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
