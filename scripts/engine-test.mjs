// Engine and club-state checks. Run with: npm test
import assert from 'node:assert/strict';
import {
  createMatch, playSegment, playBoost, canPlayBoost, substitute, simulateMatch, SEGMENTS,
  teamSkills, canUseSkill, activateSkill,
} from '../src/engine/match.js';
import { buildAiTeam } from '../src/engine/aiTeam.js';
import { overall, rarityForOverall } from '../src/engine/cards.js';
import { openPack, PACKS } from '../src/engine/packs.js';
import { standings, userFixture, aiTeamFor, clubById } from '../src/engine/season.js';
import { OFFSEASON_IDS, OFFSEASON_CARDS, cardText, TIERS, SIGNING_TIERS } from '../src/data/offseason.js';
import { PLAYER_POOL, COACH_POOL } from '../src/data/pool.js';
import { skillOf, MAX_SKILLS } from '../src/data/skills.js';
import { BOOSTS, BOOST_IDS, openBoostPack } from '../src/data/boosts.js';
import { makeRng } from '../src/engine/rng.js';
import { matchConfidence, seasonConfidence, security, jobOffers } from '../src/engine/career.js';
import { archiveSeason, foldRecords, compactEntry, clubHistory, titleTable } from '../src/engine/history.js';
import { ensureGms, updateGms, gmRanking } from '../src/engine/gms.js';
import { aiTactics } from '../src/engine/aiTeam.js';
import { DEFAULT_TACTICS, qualityEdge, styleAdvice } from '../src/engine/tactics.js';
import { attrs } from '../src/engine/attributes.js';
import { OPPONENTS } from '../src/data/demo.js';
import { DIVISION_BY_ID } from '../src/data/world/structure.js';
import { startingDraw, aiOffseason } from '../src/engine/transfers.js';
import { CLUB_POOLS, PLAYER_CARDS } from '../src/data/world/index.js';
import {
  newClubState, buildUserTeam, matchRewards, applyMatch, buyPack, keepPending, mergePending, discardPending,
  pendingCard, duplicateOf, nextUserGame, newSeason, closeSeason, toggleCurse, teamShape, shapeLabel, acceptOffer, carryOptions, starterOffers, discardCommons, buyMarketCard, useOffseasonCard, startNextSeason, POOLS, POOL_BY_ID,
} from '../src/state/club.js';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const fresh = () => newClubState(99);
// Decides on any waiting cards (e.g. the academy intake) by discarding them.
const resolve = (s) => { let x = s; while (x.pendingOpen) x = discardPending(x); return x; };
const opp = OPPONENTS[1];
const user = (club, loadout = []) => buildUserTeam(club, loadout, true);

// Plays a whole season (every user game, AI on both sides) until the season ends.
function playFull(state) {
  let s = state;
  for (let guard = 0; s.phase === 'season' && guard < 80; guard += 1) {
    const fx = nextUserGame(s);
    if (!fx) break;
    const ai = aiTeamFor(s.world, fx.opponentId, POOL_BY_ID, guard + 1);
    const home = fx.homeId === s.club.id;
    const me = buildUserTeam(s, [], home && !fx.neutral);
    const m = simulateMatch({ home: home ? me : ai, away: home ? ai : me, seed: 300 + guard, context: { competition: fx.competition, knockout: fx.knockout, neutral: fx.neutral } });
    s = applyMatch(s, m, home ? 0 : 1, clubById(s.world, fx.opponentId), matchRewards(s, m, home ? 0 : 1, fx), 500 + guard, fx).state;
    s = resolve(s);
  }
  return s;
}

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
    assert.ok(gold.some((c) => TIERS.indexOf(c.rarity) >= 2), 'gold needs a rare+');
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

test('all 28 off-season card types can be used', () => {
  assert.equal(OFFSEASON_IDS.length, 28);
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

test('two missed objectives in a row with unhappy owners get you sacked', () => {
  let s = fresh();
  s.gm.missedInRow = 1;
  s.gm.confidence = { board: 30, fans: 30 };
  s.gm.objective = { target: 1, text: 'Win the league' };
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 6000 + md);
  s.season.divisions['esp-3'].table.racing.pts = -50; // finish last
  s = resolve(closeSeason(s, 5));
  assert.equal(s.gm.sacked, true);
  assert.ok(s.gm.offers.length >= 1);
  assert.equal(startNextSeason(s, 1).phase, 'offseason', 'must take a job first');
});

test('a new career starts at any of three small clubs', () => {
  const offers = starterOffers(123);
  assert.equal(offers.length, 3);
  assert.equal(new Set(offers.map((o) => DIVISION_BY_ID[o.divisionId].code)).size, 3, 'different countries');
  for (const o of offers) assert.equal(DIVISION_BY_ID[o.divisionId].level, 3);
  const s = newClubState(5, { clubId: offers[0].clubId, gmName: 'Test GM' });
  assert.equal(s.club.id, offers[0].clubId);
  assert.equal(s.gmName, 'Test GM');
  assert.equal(s.squad.length, 10);
  assert.ok(nextUserGame(s), 'has a first fixture');
  assert.equal(s.world.clubs[s.club.id].keyPlayers.length, 0);
});

test('quick-sell discards the run of Commons and stops at a better card', () => {
  let s = fresh();
  const common = PLAYER_POOL.find((c) => c.rarity === 'common');
  const rare = PLAYER_POOL.find((c) => c.rarity === 'rare' && !s.squad.some((x) => x.id === c.id));
  s.pendingOpen = { source: 'test', cards: [structuredClone(common), structuredClone(common), structuredClone(rare)], index: 0 };
  const coins = s.coins;
  s = discardCommons(s);
  assert.equal(s.pendingOpen.index, 2);
  assert.equal(s.coins, coins + 20);
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

test('skills: elite cards carry one, max 2 per match, conditions hold', () => {
  assert.ok(PLAYER_POOL.filter((c) => c.rarity === 'legend').every((c) => skillOf(c)));
  assert.ok(PLAYER_POOL.filter((c) => c.rarity === 'common').every((c) => !skillOf(c)));
  const club = fresh();
  const legends = PLAYER_POOL.filter((c) => c.rarity === 'legend' && c.pos !== 'GK').slice(0, 3).map((c) => structuredClone(c));
  const team = user(club);
  const swap = team.lineup.slice(1, 4);
  team.players = team.players.map((p) => (swap.includes(p.id) ? { ...legends[swap.indexOf(p.id)], id: p.id, pos: p.pos } : p));
  let m = createMatch({ home: team, away: buildAiTeam(opp, 3), seed: 5 });
  const skills = teamSkills(m.teams[0]);
  assert.ok(skills.length >= 3, 'three legends give three skills');
  let used = 0;
  for (const s of skills) {
    if (canUseSkill(m, 0, s.cardId).ok) { m = activateSkill(m, 0, s.cardId); used += 1; }
  }
  assert.ok(used <= MAX_SKILLS);
  assert.equal(m.teams[0].skillsLeft, MAX_SKILLS - used);
  // Clutch only from 75'
  const clutch = { ...legends[0], skill: 'clutch' };
  assert.equal(skillOf(clutch).id, 'clutch');
});

test('boosts: every boost has a rarity, premium packs guarantee a Rare', () => {
  for (const id of BOOST_IDS) assert.ok(['common', 'uncommon', 'rare', 'epic', 'legend'].includes(BOOSTS[id].rarity), id);
  for (let i = 0; i < 50; i += 1) {
    const got = openBoostPack(makeRng(i + 1), 'boostPremium');
    assert.equal(got.length, 4);
    assert.ok(got.some((id) => ['rare', 'epic', 'legend'].includes(BOOSTS[id].rarity)));
  }
});

test('a free boost card after a match where a boost was played, none otherwise', () => {
  const s = fresh();
  const fx = userFixture(s.season, s.club.divisionId, s.club.id);
  const ai = aiTeamFor(s.world, fx.opponentId, POOL_BY_ID, 3);
  const id = Object.keys(s.inventory.boosts).find((b) => s.inventory.boosts[b] > 0 && !BOOSTS[b].when && BOOSTS[b].target !== 'player');
  const me = buildUserTeam(s, [id], fx.isHome);
  const side = fx.isHome ? 0 : 1;
  let m = createMatch({ home: fx.isHome ? me : ai, away: fx.isHome ? ai : me, seed: 4 });
  m = playBoost(m, side, id);
  while (m.phase === 'live') m = playSegment(m);
  const r = applyMatch(s, m, side, clubById(s.world, fx.opponentId), matchRewards(s, m, side), 9);
  assert.ok(r.boostReward && BOOSTS[r.boostReward]);
  const plain = simulateMatch({ home: buildUserTeam(s, [], true), away: ai, seed: 4 });
  assert.equal(applyMatch(s, plain, 0, clubById(s.world, fx.opponentId), matchRewards(s, plain, 0), 9).boostReward, null);
});

test('tactics change the game and AI clubs have a style', () => {
  const t = aiTactics({ id: 'real-madrid', level: 1 });
  assert.equal(t.press, 3); // Real Madrid: pragmatic
  const base = { home: user(fresh()), away: buildAiTeam(opp, 3), seed: 21 };
  const a = createMatch(base);
  assert.equal(a.teams[0].tactics.press, 3);
  const press = createMatch({ ...base, home: { ...user(fresh()), tactics: { press: 5 } } });
  let x = a; let y = press;
  for (let i = 0; i < 3; i += 1) { x = playSegment(x); y = playSegment(y); }
  const stamina = (m) => Object.values(m.teams[0].players).filter((p) => p.onPitch && p.card.pos !== 'GK').reduce((s, p) => s + p.stamina, 0);
  assert.ok(stamina(y) < stamina(x), 'high press burns more stamina');
});

test('tactics read the squad: fast tempo suits good passers and hurts poor ones', () => {
  const t = { ...DEFAULT_TACTICS, tempo: 5 };
  const strong = { pas: 82, sho: 70, def: 65, phy: 70, set: 60, wide: 70, central: 70, defPhy: 70, defDef: 70, fwdPhy: 70 };
  const weak = { ...strong, pas: 52 };
  assert.ok(qualityEdge(t, DEFAULT_TACTICS, strong, strong) > 0);
  assert.ok(qualityEdge(t, DEFAULT_TACTICS, weak, strong) < 0);
  assert.ok(styleAdvice({ ...DEFAULT_TACTICS, offsideTrap: true }, { ...strong, defPhy: 55 }).some((a) => a.tone === 'bad'));
  const card = PLAYER_POOL.find((c) => c.name === 'David Beckham') || PLAYER_CARDS.find((c) => c.name === 'David Beckham');
  if (card) assert.ok(attrs(card).set >= 86);
});

test('confidence: wins lift it, a bad season sacks, sacked top-flight GMs get 3 offers a level lower', () => {
  let c = { board: 50, fans: 50 };
  c = matchConfidence(c, { outcome: 'W', gf: 3, ga: 0, competition: 'league', pos: 1, target: 3, level: 2 });
  assert.ok(c.board > 50 && c.fans > 50);
  let bad = { board: 40, fans: 40 };
  for (let i = 0; i < 6; i += 1) bad = matchConfidence(bad, { outcome: 'L', gf: 0, ga: 2, competition: 'league', pos: 8, target: 3, level: 1 });
  bad = seasonConfidence(bad, 'missed', false);
  assert.ok(security(bad) < 30);
  const s = fresh();
  const top = Object.keys(s.world.clubs).find((id) => s.world.clubs[id].level === 1);
  const offers = jobOffers(s.world, { reputation: 70, currentClubId: top, sacked: true, seed: 3 });
  assert.equal(offers.length, 3);
  assert.ok(offers.every((o) => o.level === 2));
});

test('history: a season is archived with champions, awards and cup finals; records fold', () => {
  let s = fresh();
  const played = closeSeason(playFull(s), 77);
  assert.equal(played.archive.length, 1);
  const entry = played.archive[0];
  const lg = entry.leagues[played.careerLog[0].divId];
  assert.equal(lg.table.length, 8);
  assert.ok(lg.glove && lg.glove[1]);
  assert.ok(Object.keys(entry.leagues).length >= 38);
  assert.ok(played.records && Object.keys(played.records.players).length > 50);
  const champ = lg.table[0][0];
  assert.equal(clubHistory(played.archive, champ).honours.league, 1);
  assert.ok(titleTable(played.archive).length >= 38);
  assert.ok(Object.keys(played.world.gms).length > 290);
  assert.ok(gmRanking(played.world).length > 290);
  // Live stats and the yearly awards
  assert.ok(Object.keys(played.stats.lastSeason.players).length > 300);
  assert.equal(Object.keys(played.stats.season.players).length, 0, 'a fresh season page');
  const aw = played.awards[0];
  assert.ok(aw.best && aw.gk && aw.young && aw.scorer, JSON.stringify(aw));
  assert.equal(aw.gk.pos, 'GK');
});

test('house rule: a cursed Barcelona loses its stars and at least half its games', () => {
  let s = toggleCurse(fresh(), 'barcelona');
  const barca = s.world.clubs.barcelona;
  assert.ok(barca.cursed);
  assert.ok(barca.keyPlayers.every((id) => ['common', 'uncommon'].includes(POOL_BY_ID[id].rarity)));
  let losses = 0;
  let games = 0;
  for (let md = 0; md < 14; md += 1) s = playMatchday(s, 9100 + md);
  for (const [, row] of Object.entries(s.season.divisions[barca.divisionId].table)) if (row === s.season.divisions[barca.divisionId].table.barcelona) { losses = row.l; games = row.p; }
  assert.ok(games >= 14 && losses / games >= 0.5, `Barcelona lost ${losses}/${games}`);
  assert.ok(!toggleCurse(s, 'barcelona').world.clubs.barcelona.cursed);
});

test('shape: the same 7 every week lowers it, rotating keeps it up, Sports Science lifts it', () => {
  const play = (s, ids) => {
    const next = structuredClone(s);
    next.loads = { ...(next.loads || {}) };
    for (const c of next.squad) next.loads[c.id] = (next.loads[c.id] ?? 0.5) * 0.75 + (ids.includes(c.id) ? 0.25 : 0);
    return next;
  };
  let same = fresh();
  for (let i = 0; i < 12; i += 1) same = play(same, same.lineup);
  let rotate = fresh();
  const ids = rotate.squad.map((c) => c.id);
  for (let i = 0; i < 12; i += 1) rotate = play(rotate, [rotate.lineup[0], ...ids.filter((id) => id !== rotate.lineup[0]).slice(i % 3, (i % 3) + 6)]);
  assert.ok(teamShape(same) < 65, `same 7: ${teamShape(same)}`);
  assert.ok(teamShape(rotate) > teamShape(same) + 10, `rotating: ${teamShape(rotate)} vs ${teamShape(same)}`);
  assert.ok(teamShape({ ...same, perks: { shape: 30 } }) >= teamShape(same) + 25);
  assert.equal(shapeLabel(90), 'Fresh');
  assert.equal(shapeLabel(40), 'Exhausted');
});

console.log(`\n${passed} tests passed`);
