// Engine and club-state checks. Run with: npm test
import assert from 'node:assert/strict';
import {
  createMatch, playSegment, playBoost, canPlayBoost, substitute, simulateMatch, SEGMENTS,
  teamSkills, canUseSkill, activateSkill,
} from '../src/engine/match.js';
import { buildAiTeam } from '../src/engine/aiTeam.js';
import { overall, rarityForOverall } from '../src/engine/cards.js';
import { openPack, PACKS } from '../src/engine/packs.js';
import { MATCHDAYS, standings, userFixture, aiTeamFor, clubById } from '../src/engine/season.js';
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
import { careerLines, playerSeasons, playerMoves, clubSpells, clubMoves, managerSeasons, clubManagers, clubRecord, clubPlayersAllTime } from '../src/engine/careers.js';
import { CLUB_POOLS, PLAYER_CARDS } from '../src/data/world/index.js';
import {
  newClubState, buildUserTeam, matchRewards, applyMatch, buyPack, keepPending, mergePending, discardPending,
  pendingCard, duplicateOf, nextUserGame, newSeason, closeSeason, toggleCurse, teamShape, shapeLabel, acceptOffer, carryOptions, starterOffers, discardCommons, buyMarketCard, useOffseasonCard, startNextSeason, POOLS, POOL_BY_ID,
  canUseOffseason, cardPlays, migrateClubState, effectiveCohesion, seasonMods, packShift, MARKET_EVERY, MARKET_SIZE,
  buyClubPack, openOwnedClubPack, pickClubCard, businessIncome,
  startConstruction, constructionOf, setTicketPrice, signSponsor, sponsorOffers, activeSponsor,
} from '../src/state/club.js';
import { CLUB_PACKS, drawClubCards } from '../src/data/clubPacks.js';
import { teamFit } from '../src/engine/match.js';
import { PHILOSOPHIES as PHILOSOPHIES_FOR_TEST } from '../src/data/philosophies.js';
import { AREA_IDS, cardPlayLimit } from '../src/data/facilities.js';
import { cardPrice } from '../src/data/offseason.js';
import { drawGmTrait, GM_STYLES, GM_TRAITS, scaleConfidence } from '../src/engine/gmTraits.js';
import { suitability } from '../src/engine/tactics.js';
import { styleDistance, coachStyle, PHILOSOPHIES } from '../src/data/philosophies.js';
import {
  seasonDealOptions, pickSeasonCard, redrawSeasonCards, redrawCost, packPrice, PACK_LIFE,
} from '../src/state/club.js';
import { REDRAW_COSTS, SEASON_DECK } from '../src/data/seasonCards.js';

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
    assert.equal(s.squad.length, 12);
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
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 100 + md);
  assert.equal(s.phase, 'seasonEnd');
  const table = standings(s.season, s.club.divisionId);
  assert.equal(table.length, 10);
  assert.ok(table.every((r) => r.p === MATCHDAYS));
  assert.equal(table.reduce((a, r) => a + r.gf, 0), table.reduce((a, r) => a + r.ga, 0));
  const coins = s.coins;
  s = closeSeason(s, 3);
  assert.equal(s.phase, 'offseason');
  assert.ok(s.coins > coins);
  assert.equal(s.market.offers.length, MARKET_SIZE.summer);
  assert.ok(s.market.offers.some((o) => ['worldSigning', 'nationalSigning'].includes(o.type)));
  assert.ok(s.market.offers.every((o) => OFFSEASON_CARDS[o.type].group === 'transfer'), 'the market sells transfer cards only');
  assert.equal(s.inventory.offseason.length + s.inventory.club.length, 1, 'one free management card as a season reward');
  s.coins = 99999;
  s = buyMarketCard(s, s.market.offers[0].uid);
  assert.ok(s.market.offers[0].sold);
  assert.equal(startNextSeason(s, 4).phase, 'offseason', 'academy cards must be decided first');
  s = startNextSeason(resolve(s), 4);
  assert.equal(s.phase, 'season');
  assert.equal(s.season.year, 2);
});

test('all 42 management card types (and the season-only cards) can be used', () => {
  assert.equal(OFFSEASON_IDS.filter((id) => OFFSEASON_CARDS[id].group !== 'season').length, 42);
  let base = fresh();
  for (let md = 0; md < MATCHDAYS; md += 1) base = playMatchday(base, 300 + md);
  base = resolve(closeSeason(base, 1));
  for (const type of OFFSEASON_IDS) {
    for (const rarity of TIERS) {
      assert.ok(cardText(type, rarity).length > 5);
      const s = structuredClone(base);
      s.inventory.offseason = [{ uid: 'x', type, rarity }];
      s.seasonDeal = null; // an older save's summer: event cards are still played from the inventory
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
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 700 + md);
  s.season.divisions['esp-3'].table.racing.pts = 999; // force the title
  s = closeSeason(s, 8);
  assert.equal(s.club.divisionId, 'esp-2');
  assert.equal(s.club.level, 2);
  assert.equal(s.lastSeason.userMove.type, 'promoted');
  assert.equal(s.lastSeason.moves.length, 60); // 15 pairs of adjacent tiers × 2 up, 2 down
  for (const ids of Object.values(s.world.divisions)) assert.equal(ids.length, 10);
  assert.ok(s.world.divisions['esp-2'].includes('racing'));
  s = startNextSeason(resolve(s), 9);
  assert.ok(userFixture(s.season, 'esp-2', 'racing'));
});

test('the world has 44 full divisions of 10 and a big card pool', () => {
  const s = fresh();
  assert.equal(Object.keys(s.world.divisions).length, 44);
  assert.equal(Object.keys(s.world.clubs).length, 440);
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
  assert.equal(s.squad.length, 12);
  assert.ok(s.squad.filter((c) => c.generic).every((c) => c.rarity === 'common' && !c.name.includes(' ')));
});

test('off-season: academies, signings and retirements keep one card per club', () => {
  let s = fresh();
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 900 + md);
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
  const avg = Object.values(w.clubs).reduce((a, c) => a + c.keyPlayers.length, 0) / Object.keys(w.clubs).length;
  assert.ok(avg > 2, `squads ran dry: ${avg.toFixed(2)} named per club`);
  for (const c of Object.values(w.clubs)) assert.ok(c.keyPlayers.length <= 10);
});

test('signing cards bring a random player of the right rarity, maybe from another club', () => {
  let base = fresh();
  for (let md = 0; md < MATCHDAYS; md += 1) base = playMatchday(base, 1300 + md);
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
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 5000 + md);
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
  assert.equal(moved.squad.length, 12);
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
  s.gm.career[s.gm.career.length - 1].from = 0; // not the first season at the club
  s.gm.objective = { target: 1, text: 'Win the league' };
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 6000 + md);
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
  assert.equal(s.squad.length, 12);
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
  assert.equal(next.squad.length, 12);
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
  assert.equal(lg.table.length, 10);
  assert.ok(lg.glove && lg.glove[1]);
  assert.ok(Object.keys(entry.leagues).length >= 44);
  assert.ok(played.records && Object.keys(played.records.players).length > 50);
  const champ = lg.table[0][0];
  assert.equal(clubHistory(played.archive, champ).honours.league, 1);
  assert.ok(titleTable(played.archive).length >= 44);
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
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 9100 + md);
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
  for (let i = 0; i < 12; i += 1) rotate = play(rotate, [rotate.lineup[0], ...ids.filter((id) => id !== rotate.lineup[0]).slice(i % 5, (i % 5) + 6)]);
  assert.ok(teamShape(same) < 65, `same 7: ${teamShape(same)}`);
  assert.ok(teamShape(rotate) > teamShape(same) + 10, `rotating: ${teamShape(rotate)} vs ${teamShape(same)}`);
  assert.ok(teamShape({ ...same, perks: { shape: 30 } }) >= teamShape(same) + 25);
  assert.equal(shapeLabel(90), 'Fresh');
  assert.equal(shapeLabel(40), 'Exhausted');
});

test('v1.9 world: every division has 10 clubs, seasons have 18 league matchdays, squads hold 12', async () => {
  const { CLUBS_BY_DIVISION } = await import('../src/data/world/index.js');
  const { DIVISIONS } = await import('../src/data/world/structure.js');
  const { CALENDAR, createCompetitions, qualifiers, tablesByStrength, cupRoundNames } = await import('../src/engine/competitions.js');
  for (const d of DIVISIONS) assert.equal(CLUBS_BY_DIVISION[d.id]?.length, 10, d.id);
  assert.equal(MATCHDAYS, 18);
  assert.equal(CALENDAR.filter((x) => x === 'L').length, MATCHDAYS);
  const s = fresh();
  assert.equal(s.squad.length, 12);
  assert.equal(s.bench.length, 5);
  for (const fx of Object.values(s.season.divisions)) assert.equal(fx.fixtures.length, 18);
  // Cups: 20 clubs (divisions 1 + 2) → 8 play a preliminary round into a 16 bracket; 10 → 4 into 8.
  const comps = createCompetitions(s.world, qualifiers(tablesByStrength(s.world)), 3);
  assert.equal(comps.cups.ESP.size, 20);
  assert.equal(comps.cups.ESP.prelim.length, 8);
  assert.equal(cupRoundNames(comps.cups.ESP).length, 5);
  assert.equal(comps.cups.BEL.prelim.length, 4);
  assert.equal(cupRoundNames(comps.cups.BEL).length, 4);
  // Europe: 11 champions for 4 places, the last 6 listed play a preliminary round first.
  assert.equal(comps.continental.europe.prelim.length, 3);
  assert.equal(comps.continental.europe.seeded.length, 5);
});

test('v1.9 season: the league, cups and continental rounds all finish', () => {
  let s = fresh();
  for (let guard = 0; guard < 60 && s.phase === 'season'; guard += 1) {
    const game = nextUserGame(s);
    const homeFirst = game.homeId === s.club.id;
    const me = buildUserTeam(s, [], homeFirst && !game.neutral);
    const ai = aiTeamFor(s.world, game.opponentId, POOL_BY_ID, guard);
    const m = simulateMatch({ home: homeFirst ? me : ai, away: homeFirst ? ai : me, seed: guard, context: { competition: game.competition, knockout: game.knockout, neutral: game.neutral } });
    const side = homeFirst ? 0 : 1;
    s = applyMatch(s, m, side, clubById(s.world, game.opponentId), matchRewards(s, m, side, game), 50 + guard, game).state;
  }
  assert.equal(s.phase, 'seasonEnd');
  assert.ok(Object.values(s.season.divisions).every((d) => Object.values(d.table).every((r) => r.p === 18)));
  assert.ok(Object.values(s.season.comps.cups).every((c) => c.winner));
  assert.ok(['europe', 'americas', 'afap'].every((k) => s.season.comps.continental[k].winner));
  assert.ok(s.season.comps.cwc.winner);
});

test('careers: two seasons fold per player, moves are logged, club pages read them', () => {
  let s = closeSeason(playFull(fresh()), 21);
  const oneId = Object.keys(s.careers).find((id) => POOL_BY_ID[id] && s.careers[id].length === 1);
  assert.ok(oneId, 'season 1 lines');
  assert.ok(Object.keys(s.coachCareers).length > 290, 'every manager has a line');
  assert.ok(s.coachCareers.you?.length === 1);
  // A named card that the AI moved this summer (academy, signing, release or retirement).
  const moved = Object.keys(s.moves).filter((id) => POOL_BY_ID[id]);
  assert.ok(moved.length > 20, `moves ${moved.length}`);
  s = resolve(s);
  const star = s.squad.find((c) => POOL_BY_ID[c.id]);
  s.gm.offers = [{ clubId: 'sporting', required: 0, name: 'Sporting Gijón', division: 'x', level: 3 }];
  s = acceptOffer(s, 'sporting', [`player:${star.id}`], 3);
  assert.deepEqual(playerMoves(s, star.id).at(-1), { year: 2, from: 'racing', to: 'sporting', type: 'c' });
  s = closeSeason(playFull(startNextSeason(s, 5)), 22);
  // Two seasons for the same player, the second at the new club.
  const lines = careerLines(s.careers[star.id]);
  assert.equal(lines.length, 2);
  assert.deepEqual(lines.map((l) => [l.year, l.clubId]), [[1, 'racing'], [2, 'sporting']]);
  assert.ok(lines.every((l) => l.apps > 0 && l.avg > 3 && l.avg < 10));
  const seasons = playerSeasons(s, star.id);
  assert.ok(seasons[0].divId && seasons[0].level, 'league and level from the archive');
  assert.deepEqual(clubSpells(seasons, playerMoves(s, star.id)).map((x) => x.clubId), ['racing', 'sporting']);
  assert.ok(clubMoves(s, 'sporting').some((m) => m.id === star.id && m.dir === 'in'));
  const two = Object.values(s.careers).filter((l) => l.length === 2).length;
  assert.ok(two > 300, `players with 2 seasons: ${two}`);
  // Size per season stays small.
  assert.ok(JSON.stringify(s.careers).length < 120000, `careers ${JSON.stringify(s.careers).length}`);
  // Managers and club books.
  const you = managerSeasons(s, 'you');
  assert.deepEqual(you.map((x) => x.clubId), ['sporting', 'racing']);
  assert.ok(clubManagers(s, 'racing').some((m) => m.key === 'you'));
  const rec = clubRecord(s, 'racing').all;
  assert.ok(Object.values(rec).reduce((n, r) => n + r[0], 0) >= 14);
  assert.ok(clubPlayersAllTime(s, 'sporting').some((p) => p.id === star.id));
});

test('no sacking in a first season at a club', () => {
  let s = fresh();
  s.gm.missedInRow = 1;
  s.gm.confidence = { board: 5, fans: 5 };
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 7000 + md);
  s = resolve(closeSeason(s, 5));
  assert.equal(s.gm.sacked, false);
});

test('old saves without careers still load and start their log at season end', () => {
  let s = playFull(startNextSeason(resolve(closeSeason(playFull(fresh()), 31)), 32));
  for (const k of ['careers', 'careerNames', 'moves', 'coachCareers', 'clubRecords']) delete s[k];
  assert.deepEqual(playerSeasons(s, s.squad[0].id).filter((r) => !r.live), []);
  assert.deepEqual(clubMoves(s, 'racing'), []);
  s = closeSeason(s, 33);
  const id = Object.keys(s.careers).find((x) => POOL_BY_ID[x] && s.careers[x].length === 2);
  assert.ok(id, 'last season is backfilled from the stats book');
});

// ---------------------------------------------------------------------------
// Club management: cards any time, card plays, club areas, old saves

test('management cards can be played mid-season; events last the rest of the season', () => {
  let s = fresh();
  for (let md = 0; md < 3; md += 1) s = playMatchday(s, 1500 + md);
  assert.equal(s.phase, 'season');
  s.inventory.offseason = [{ uid: 'a', type: 'fortressSeason', rarity: 'rare' }, { uid: 'b', type: 'clubStore', rarity: 'common' }, { uid: 'c', type: 'preseasonCamp', rarity: 'rare' }];
  let r = useOffseasonCard(s, 'a', {}, 1);
  assert.equal(r.success, true, r.message);
  assert.match(r.message, /rest of this season/);
  assert.ok(seasonMods(r.state).home > 0);
  r = useOffseasonCard(r.state, 'b', {}, 2);
  assert.equal(r.success, true, r.message);
  assert.equal(r.state.facilities.store, 0, 'building works first');
  assert.equal(r.state.construction[0].area, 'store');
  assert.equal(r.state.cardPlays, 2);
  assert.equal(canUseOffseason(r.state, { type: 'preseasonCamp', rarity: 'rare' }).ok, false, 'pre-season camp is summer only');
  // The event ends with the season; the club area stays.
  let e = r.state;
  for (let md = 3; md < MATCHDAYS; md += 1) e = playMatchday(e, 1600 + md);
  e = closeSeason(e, 5);
  assert.equal(e.activeEvent, null);
  assert.equal(e.facilities.store, 1);
  assert.equal(e.cardPlays, 0, 'card plays reset when the season ends');
});

test('per-season card-play limit, +1 with Analytics level 3', () => {
  const s = fresh();
  const limit = cardPlays(s).limit;
  assert.equal(limit, 8);
  s.coins = 0;
  s.inventory.offseason = Array.from({ length: limit + 2 }, (_, i) => ({ uid: `p${i}`, type: 'boostCrate', rarity: 'common' }));
  let x = s;
  for (let i = 0; i < limit; i += 1) {
    const r = useOffseasonCard(x, `p${i}`, {}, i);
    assert.equal(r.success, true, r.message);
    x = r.state;
  }
  assert.equal(cardPlays(x).used, limit);
  const blocked = useOffseasonCard(x, `p${limit}`, {}, 99);
  assert.notEqual(blocked.success, true);
  assert.match(blocked.message, /No card plays left/);
  assert.equal(cardPlayLimit({ analytics: 3 }), 9);
  assert.equal(cardPlayLimit({ analytics: 5 }), 10);
  const more = { ...x, facilities: { ...x.facilities, analytics: 3 } };
  assert.equal(useOffseasonCard(more, `p${limit}`, {}, 98).success, true);
});

test('club areas: business areas add income items, sports areas lift shape, cohesion and odds', () => {
  let s = fresh();
  const fx = userFixture(s.season, s.club.divisionId, s.club.id);
  const ai = aiTeamFor(s.world, fx.opponentId, POOL_BY_ID, 3);
  const me = buildUserTeam(s, [], true);
  const m = simulateMatch({ home: me, away: ai, seed: 4 });
  const base = matchRewards(s, m, 0);
  const rich = { ...s, facilities: { ...s.facilities, hospitality: 3, store: 2, sponsor: 2 } };
  const more = matchRewards(rich, m, 0);
  for (const label of ['Hospitality', 'Club store', 'Sponsor']) assert.ok(more.items.some((i) => i.label.startsWith(label)), `${label} income`);
  assert.ok(more.total > base.total);
  // Spa: better shape; Gym: slower stamina drain; Analytics: pack odds.
  assert.ok(teamShape({ ...s, facilities: { ...s.facilities, spa: 5 } }) >= Math.min(100, teamShape(s) + 10));
  assert.ok(seasonMods({ ...s, facilities: { ...s.facilities, gym: 3 } }).drain > seasonMods(s).drain);
  assert.equal(packShift({ ...s, facilities: { ...s.facilities, analytics: 5 } }), 6);
  // Training fields: more cohesion per match.
  const low = { ...s, cohesion: 20, facilities: { ...s.facilities, training: 0 } };
  const high = { ...s, cohesion: 20, facilities: { ...s.facilities, training: 5 } };
  const after = (st) => applyMatch(st, m, 0, clubById(st.world, fx.opponentId), matchRewards(st, m, 0), 7).state.cohesion;
  assert.ok(after(high) > after(low));
  // Card prices scale with the area's level.
  assert.ok(cardPrice('hospitality', 'epic', 4) > cardPrice('hospitality', 'epic', 1));
});

test('the Transfer Market is open all season and refreshes every few matchdays', () => {
  let s = fresh();
  assert.equal(s.phase, 'season');
  assert.equal(s.market.offers.length, MARKET_SIZE.season);
  assert.ok(s.market.offers.every((o) => !OFFSEASON_CARDS[o.type].summerOnly));
  const first = s.market.offers.map((o) => o.uid).join();
  s.coins = 99999;
  s = buyMarketCard(s, s.market.offers[0].uid);
  assert.ok(s.market.offers[0].sold);
  assert.equal(s.inventory.offseason.length, 1);
  for (let md = 0; md < MARKET_EVERY; md += 1) s = playMatchday(s, 1700 + md);
  assert.notEqual(s.market.offers.map((o) => o.uid).join(), first, 'new offers after a few matchdays');
  assert.equal(s.market.fresh, true);
});

test('old saves load: missing club areas, card plays and market are filled in', () => {
  const s = fresh();
  const old = structuredClone(s);
  old.facilities = { stadium: 4, merch: 3, training: 2, academy: 1 };
  delete old.cardPlays;
  old.market = null;
  old.perks = { shirtSponsor: 20, shape: 0 };
  old.inventory.offseason = [{ uid: 'o1', type: 'shirtSponsor', rarity: 'rare' }];
  const m = migrateClubState(old);
  for (const k of AREA_IDS) assert.ok(Number.isInteger(m.facilities[k]), k);
  assert.equal(m.facilities.stadium, 4);
  assert.equal(m.facilities.hospitality, 2);
  assert.equal(m.facilities.gym, 0);
  assert.equal(m.cardPlays, 0);
  assert.ok(m.market.offers.length > 0);
  assert.equal(m.inventory.club[0].type, 'findSponsor', 'old club-group cards move to the club inventory');
  assert.equal(m.inventory.offseason.length, 0);
  assert.equal(useOffseasonCard(m, 'o1', {}, 1).state.construction[0].to, m.facilities.sponsor + 1, 'building works start');
  assert.deepEqual(migrateClubState(m).facilities, m.facilities, 'migration is idempotent');
  // An old save with only the four facilities still plays a match.
  const legacy = { ...old, facilities: { stadium: 1, merch: 0, training: 1, academy: 0 } };
  const fx = userFixture(legacy.season, legacy.club.divisionId, legacy.club.id);
  const mt = simulateMatch({ home: buildUserTeam(legacy, [], true), away: aiTeamFor(legacy.world, fx.opponentId, POOL_BY_ID, 1), seed: 2 });
  assert.ok(matchRewards(legacy, mt, 0).items.some((i) => i.label === 'Shirt sponsor'));
  assert.ok(effectiveCohesion(legacy) >= 0);
});

test('building works: an area card queues a project that finishes after 2 + level league matchdays', () => {
  let s = fresh();
  const from = s.facilities.stadium;
  let r = startConstruction(s, 'stadium', 1);
  assert.equal(r.success, true, r.message);
  s = r.state;
  const p = constructionOf(s, 'stadium');
  assert.equal(p.to, from + 1);
  assert.equal(p.total, 2 + from + 1);
  assert.equal(s.facilities.stadium, from, 'not instant');
  assert.equal(startConstruction(s, 'stadium', 1).success, false, 'one project per area');
  assert.equal(canUseOffseason(s, { type: 'stadiumEvolution', rarity: 'legend' }).ok, false);
  assert.equal(startConstruction(s, 'gym', 1).success, true, 'other areas can build at the same time');
  for (let md = 0; md < p.total - 1; md += 1) s = playMatchday(s, 2100 + md);
  assert.equal(s.facilities.stadium, from, 'still building');
  assert.equal(constructionOf(s, 'stadium').left, 1);
  s = playMatchday(s, 2199);
  assert.equal(s.facilities.stadium, from + 1);
  assert.equal(constructionOf(s, 'stadium'), null);
  assert.ok(s.inbox.some((m) => m.title.startsWith('🏗 Construction finished: Stadium')));
  // A Legend card builds +2; a summer project is ready for the first matchday.
  let o = resolve(closeSeason(playFull(fresh()), 31));
  o.inventory.offseason = [{ uid: 'leg', type: 'clubStore', rarity: 'legend' }];
  const store = o.facilities.store;
  r = useOffseasonCard(o, 'leg', {}, 1);
  assert.equal(r.success, true, r.message);
  assert.match(r.message, /first matchday/);
  assert.equal(constructionOf(r.state, 'store').to, Math.min(5, store + 2));
  o = startNextSeason(r.state, 4);
  assert.equal(o.facilities.store, Math.min(5, store + 2));
  assert.equal(o.construction.length, 0);
});

const fakeMatch = (s, score, winner, home = true) => ({
  score, result: { winner, appeared: [[], []] }, teams: [{ id: s.club.id, isHome: home }, { id: 'nobody', isHome: !home }],
});

test('ticket prices: High earns more at the gate and upsets the fans, Low helps at home', () => {
  const s = fresh();
  const gate = (st) => businessIncome(st).find((i) => i.area === 'stadium').coins;
  const high = setTicketPrice(s, 'high');
  const low = setTicketPrice(s, 'low');
  assert.equal(high.ticketPrice, 'high');
  assert.ok(Math.abs(gate(high) - gate(s) * 1.25) <= 1, `${gate(high)} vs ${gate(s)}`);
  assert.ok(gate(low) < gate(s));
  assert.equal(seasonMods(low).home - seasonMods(s).home, 0.01);
  assert.equal(setTicketPrice(s, 'silly'), s);
  const fans = (st) => {
    const fx = userFixture(st.season, st.club.divisionId, st.club.id);
    const me = buildUserTeam(st, [], true);
    const m = simulateMatch({ home: me, away: aiTeamFor(st.world, fx.opponentId, POOL_BY_ID, 5), seed: 6 });
    return applyMatch(st, m, 0, clubById(st.world, fx.opponentId), matchRewards(st, m, 0), 7).state.gm.confidence.fans;
  };
  const f = fans(s);
  assert.ok(Math.abs(fans(high) - (f - 0.6)) < 0.02, 'high prices: fans −0.6 a home match');
  assert.ok(Math.abs(fans(low) - (f + 0.6)) < 0.02, 'low prices: fans +0.6 a home match');
});

test('sponsor contracts: three summer offers, Performance pays per win, Glory per trophy, Steady by default', () => {
  let s = fresh();
  const steady = activeSponsor(s);
  assert.equal(steady.type, 'steady');
  assert.ok(matchRewards(s, fakeMatch(s, [0, 1], 1), 0).items.some((i) => i.label.startsWith('Sponsor ·')), 'steady pays every match');
  s = resolve(closeSeason(playFull(s), 41));
  assert.equal(sponsorOffers(s).length, 3);
  assert.equal(startNextSeason(s, 1).sponsor.type, 'steady', 'no choice → steady');
  const r = signSponsor(s, 'performance');
  assert.equal(r.success, true, r.message);
  assert.ok(r.state.inbox[0].title.startsWith('🤝 Sponsor signed'));
  let p = startNextSeason(r.state, 2);
  assert.equal(p.sponsor.type, 'performance');
  const terms = activeSponsor(p);
  assert.equal(terms.perMatch, 0);
  assert.ok(terms.perWin >= 2 * activeSponsor({ ...p, sponsor: { type: 'steady', brand: 'x' } }).perMatch);
  const win = matchRewards(p, fakeMatch(p, [2, 0], 0), 0);
  const loss = matchRewards(p, fakeMatch(p, [0, 2], 1), 0);
  assert.equal(win.items.find((i) => i.label.startsWith('Sponsor win bonus')).coins, terms.perWin);
  assert.ok(!loss.items.some((i) => i.label.startsWith('Sponsor')));
  for (let md = 0; md < 12 && !p.record.w; md += 1) p = playMatchday(p, 2300 + md);
  assert.ok(p.record.w > 0);
  assert.ok((p.finance.income.Sponsor || 0) >= terms.perWin, 'win bonus in the season finances');
  // Glory: a cup final win pays the trophy bonus.
  const g = { ...p, sponsor: { type: 'glory', brand: 'Crown Airways' } };
  const final = matchRewards(g, fakeMatch(g, [1, 0], 0), 0, { competition: 'cup', label: 'Cup · Final' });
  assert.equal(final.items.find((i) => i.label.startsWith('Sponsor trophy bonus')).coins, activeSponsor(g).perTrophy);
  assert.ok(activeSponsor(g).perTrophy > 10 * activeSponsor(g).perMatch);
  assert.equal(signSponsor(p, 'glory').success, false, 'signed in the summer only');
});

test('finance history: one entry per season with income, spending and balance', () => {
  const closed = closeSeason(playFull(fresh()), 51);
  assert.equal(closed.financeHistory.length, 1);
  const e = closed.financeHistory[0];
  assert.equal(e.year, 1);
  assert.ok(e.in > 0 && e.income.Prizes > 0);
  assert.equal(e.balance, closed.coins);
  let s = resolve(closed); // summer: academy cards sold
  s = startNextSeason(s, 3);
  assert.equal(s.financeHistory.length, 1, 'the same season, brought up to date');
  assert.equal(s.financeHistory[0].balance, s.coins);
  assert.deepEqual(s.finance, { income: {}, spent: {} });
});

test('v2.2 business fields: older saves without them load and play', () => {
  const s = fresh();
  const old = structuredClone(s);
  for (const k of ['construction', 'ticketPrice', 'sponsor', 'sponsorOffers', 'financeHistory', 'clubEffects']) delete old[k];
  const m = migrateClubState(old);
  assert.deepEqual(m.construction, []);
  assert.equal(m.ticketPrice, 'normal');
  assert.equal(m.sponsor.type, 'steady');
  assert.deepEqual(m.financeHistory, []);
  assert.deepEqual(m.clubEffects, []);
  assert.equal(activeSponsor(old).type, 'steady', 'works even before migration');
  assert.ok(playMatchday(m, 77).history.length === 1);
  // An old summer save gets sponsor offers.
  const summer = migrateClubState({ ...old, phase: 'offseason' });
  assert.equal(sponsorOffers(summer).length, 3);
});

// ---------------------------------------------------------------------------
// GM cards, season deal, card lifespans (v2.2)

const withTrait = (s, id, rarity = 'rare') => ({ ...s, gm: { ...s.gm, trait: { id, rarity } } });

test('GM card: each style deals only its own cards, every rarity Common to Epic', () => {
  for (const [style, def] of Object.entries(GM_STYLES)) {
    const seen = new Set();
    for (let i = 0; i < 60; i += 1) {
      const t = drawGmTrait(style, i);
      assert.ok(def.cards.includes(t.id), `${style}: ${t.id}`);
      assert.ok(['common', 'uncommon', 'rare', 'epic'].includes(t.rarity));
      seen.add(t.id);
    }
    assert.equal(seen.size, def.cards.length, `${style} deals all its cards`);
  }
  assert.equal(Object.keys(GM_TRAITS).length, 12);
  const s = newClubState(5, { gmName: 'T', nation: 'ESP', style: 'tactical', trait: { id: 'gameReader', rarity: 'epic' } });
  assert.deepEqual(s.gm.trait, { id: 'gameReader', rarity: 'epic' });
  assert.equal(s.gm.nation, 'ESP');
  const old = structuredClone(s); delete old.gm.trait; delete old.seasonCard;
  assert.equal(migrateClubState(old).gm.trait, null, 'older careers: no GM card');
});

test('Tactics Connoisseur turns red advice grey, and the grade with it', () => {
  const A = { pas: 50, sho: 60, def: 60, phy: 50, set: 40, defDef: 55, defPhy: 50, fwdPhy: 50, wide: 60, central: 60 };
  const t = { ...DEFAULT_TACTICS, press: 5, tempo: 5, line: 5 };
  const reds = styleAdvice(t, A).filter((a) => a.tone === 'bad').length;
  assert.ok(reds >= 2);
  const one = styleAdvice(t, A, { cover: 1 });
  assert.equal(one.filter((a) => a.tone === 'bad').length, reds - 1);
  assert.ok(one.find((a) => a.tone === 'covered').note.includes('Tactics Connoisseur'));
  assert.equal(styleAdvice(t, A, { cover: 2 }).filter((a) => a.tone === 'covered').length, 2);
  assert.ok(suitability(t, A, { cover: 2 }) > suitability(t, A));
  // In a match: the user's grade improves from red to grey.
  const s = fresh();
  const base = { ...buildUserTeam(s, [], true), tactics: t };
  const squadA = { ...base, gm: { cover: 0 } };
  const covered = { ...base, gm: { cover: 2 } };
  assert.ok(teamFit(covered).suit >= teamFit(squadA).suit);
  const conn = buildUserTeam(withTrait(s, 'tacticsConnoisseur', 'epic'), [], true);
  assert.equal(conn.gm.cover, 2);
  assert.equal(buildUserTeam(withTrait(s, 'tacticsConnoisseur', 'uncommon'), [], true).gm.cover, 1);
});

test('Coach Tamer cuts the coach-fit distance (a clash can become grey)', () => {
  const s = fresh();
  const coach = coachStyle(s.coaches.coach);
  const far = Object.keys(PHILOSOPHIES).sort((a, b) => styleDistance(PHILOSOPHIES[b].t, coach) - styleDistance(PHILOSOPHIES[a].t, coach))[0];
  const team = { ...buildUserTeam(s, [], true), tactics: PHILOSOPHIES[far].t };
  const plain = teamFit(team);
  const tamed = teamFit({ ...team, gm: buildUserTeam(withTrait(s, 'coachTamer', 'epic'), [], true).gm });
  assert.equal(tamed.distance, Math.max(0, plain.distance - 2));
  assert.equal(teamFit({ ...team, gm: buildUserTeam(withTrait(s, 'coachTamer', 'common'), [], true).gm }).distance, Math.max(0, plain.distance - 1));
});

test('Money Man adds a share of all match income; Dealmaker and Bargain Hunter cut prices', () => {
  const s = fresh();
  const fx = userFixture(s.season, s.club.divisionId, s.club.id);
  const m = simulateMatch({ home: buildUserTeam(s, [], true), away: aiTeamFor(s.world, fx.opponentId, POOL_BY_ID, 1), seed: 3 });
  const plain = matchRewards(s, m, 0);
  const rich = matchRewards(withTrait(s, 'moneyMan', 'epic'), m, 0);
  const bonus = rich.items.find((i) => i.label === 'Money Man bonus');
  assert.equal(bonus.coins, Math.round(plain.total * 0.1));
  assert.equal(rich.total, plain.total + bonus.coins);
  assert.equal(packPrice(s, 'silver'), PACKS.silver.price);
  assert.equal(packPrice(withTrait(s, 'dealmaker', 'epic'), 'silver'), Math.round(PACKS.silver.price * 0.85 / 10) * 10);
  assert.equal(packPrice({ ...s, activeEvent: { type: 'bargainHunter', rarity: 'rare' } }, 'gold'), PACKS.gold.price * 0.8);
  const bought = buyPack({ ...withTrait(s, 'dealmaker', 'epic'), coins: 1000 }, 'silver', 1);
  assert.equal(bought.coins, 1000 - packPrice(withTrait(s, 'dealmaker', 'epic'), 'silver'));
});

test('cohesion, shape and confidence GM cards', () => {
  const s = fresh();
  const changed = { ...s, lastLineup: s.bench.slice(0, 7), cohesion: 80 };
  const loss = 80 - effectiveCohesion(changed);
  assert.ok(loss > 0);
  assert.equal(80 - effectiveCohesion(withTrait(changed, 'continuity', 'epic')), Math.round(loss * 0.4));
  assert.equal(teamShape(withTrait(s, 'fitnessFreak', 'epic')), Math.min(100, teamShape(s) + 12));
  assert.ok(Math.abs(seasonMods(withTrait(s, 'ironSquad', 'epic')).drain - seasonMods(s).drain - 0.12) < 1e-9);
  const conf = scaleConfidence({ board: 50, fans: 50 }, { board: 60, fans: 40 }, { id: 'ceosFriend', rarity: 'epic' });
  assert.equal(conf.board, 64);
  assert.equal(conf.fans, 40, 'only the owners change');
  assert.equal(scaleConfidence({ board: 50, fans: 50 }, { board: 40, fans: 60 }, { id: 'fanFavourite', rarity: 'common' }).fans, 62);
});

test('season deal: 3 cards at season end, pick one, redraws cost 200/400/800', () => {
  let s = fresh();
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 900 + md);
  s = resolve(closeSeason(s, 4));
  assert.equal(s.seasonDeal.hand.length, 3);
  assert.equal(new Set(s.seasonDeal.hand.map((c) => c.type)).size, 3);
  for (const c of s.seasonDeal.hand) assert.ok(SEASON_DECK.includes(c.type));
  assert.equal(s.seasonCard, null);
  s = { ...s, coins: 2000 };
  const costs = [];
  for (let i = 0; i < 4; i += 1) {
    const before = s.coins;
    costs.push(redrawCost(s));
    s = redrawSeasonCards(s, 10 + i);
    if (costs[i] !== null) assert.equal(before - s.coins, costs[i]);
  }
  assert.deepEqual(costs, [...REDRAW_COSTS, null]);
  assert.equal(s.coins, 2000 - 1400);
  // An old event card in the inventory is a free option in the deal.
  s.inventory.offseason.push({ uid: 'old1', type: 'fortressSeason', rarity: 'epic' });
  const opts = seasonDealOptions(s);
  assert.equal(opts.length, 4);
  const picked = pickSeasonCard(s, 'inv:old1', 3);
  assert.equal(picked.seasonCard.type, 'fortressSeason');
  assert.equal(picked.seasonCard.rarity, 'epic');
  assert.equal(picked.seasonCard.name, 'Fortress Season');
  assert.ok(!picked.inventory.offseason.some((i) => i.uid === 'old1'));
  assert.equal(picked.seasonDeal, null);
  const next = startNextSeason(resolve(picked), 5);
  assert.equal(next.phase, 'season');
  assert.deepEqual(next.activeEvent, { type: 'fortressSeason', rarity: 'epic' });
  assert.ok(seasonMods(next).home > 0);
  // Nobody picked: the first card is played at kick-off.
  const auto = startNextSeason(s, 6);
  assert.ok(auto.seasonCard && auto.activeEvent);
});

test('academy graduates start with their full career; pack players with 50–90%', () => {
  let s = fresh();
  s.facilities = { ...s.facilities, academy: 5 };
  for (let md = 0; md < MATCHDAYS; md += 1) s = playMatchday(s, 1300 + md);
  for (const id of Object.keys(POOL_BY_ID)) s.world.cardLeft[id] = 1; // worn out elsewhere: graduates still start fresh
  s = closeSeason(s, 9);
  const named = (s.pendingOpen?.cards || []).filter((c) => POOL_BY_ID[c.id]);
  assert.ok(named.length > 0, "the academy brings club legends");
  for (const c of named) assert.equal(c.matchesLeft, POOL_BY_ID[c.id].matchesLeft, c.name);
  const ratios = [];
  for (let i = 0; i < 30; i += 1) {
    const b = buyPack({ ...fresh(), coins: 5000 }, 'gold', 100 + i);
    for (const c of b.pendingOpen.cards) {
      const full = POOL_BY_ID[c.id].matchesLeft;
      ratios.push(c.matchesLeft / full);
      assert.ok(c.matchesLeft >= Math.floor(full * PACK_LIFE[0]) && c.matchesLeft <= Math.ceil(full * PACK_LIFE[1]), `${c.name} ${c.matchesLeft}/${full}`);
    }
  }
  assert.ok(Math.min(...ratios) < 0.6 && Math.max(...ratios) > 0.8, 'spread across the range');
});

test('signings keep the career they had at their old club', () => {
  const s = fresh();
  for (const id of Object.keys(POOL_BY_ID)) s.world.cardLeft[id] = 42;
  s.inventory.offseason = [{ uid: 'w', type: 'worldSigning', rarity: 'rare' }];
  const r = useOffseasonCard(s, 'w', {}, 7);
  assert.equal(r.success, true);
  assert.equal(r.state.pendingOpen.cards[0].matchesLeft, 42);
});

// ---------------------------------------------------------------------------
// Club cards: club packs (pick 1 of 3), temporary effects, old saves

test('club packs: Bronze shows 1, Silver 3, Gold 3 Rare+; you keep the one you pick', () => {
  let s = fresh();
  s.coins = 10000;
  const b = buyClubPack(s, 'clubBronze', 5);
  assert.equal(b.coins, s.coins - CLUB_PACKS.clubBronze.price);
  assert.equal(b.pendingPick.cards.length, 1);
  s = buyClubPack(s, 'clubSilver', 7);
  assert.equal(s.pendingPick.cards.length, 3);
  assert.equal(new Set(s.pendingPick.cards.map((c) => c.type)).size, 3, 'three different cards');
  assert.ok(s.pendingPick.cards.every((c) => OFFSEASON_CARDS[c.type].group === 'club'));
  assert.equal(buyClubPack(s, 'clubGold', 8), s, 'one pack at a time');
  assert.equal(buyPack(s, 'bronze', 8), s, 'no player pack while a pick is waiting');
  assert.equal(canUseOffseason(s, { type: 'teamBuilding', rarity: 'common' }).ok, false);
  const chosen = s.pendingPick.cards[1];
  s = pickClubCard(s, 1);
  assert.equal(s.pendingPick, null);
  assert.deepEqual(s.inventory.club.map((c) => c.uid), [chosen.uid]);
  assert.equal(s.inventory.offseason.length, 0, 'club cards never go to the transfer inventory');
  // Gold: Rare or better only, mostly infrastructure; owned packs open the same way.
  const rng = makeRng(3);
  const gold = Array.from({ length: 200 }, () => drawClubCards(rng, 'clubGold')).flat();
  assert.ok(gold.every((c) => TIERS.indexOf(c.rarity) >= 2));
  assert.ok(gold.filter((c) => OFFSEASON_CARDS[c.type].kind === 'area').length > gold.length * 0.6);
  s.inventory.clubPacks = ['clubGold'];
  s = openOwnedClubPack(s, 0, 4);
  assert.equal(s.inventory.clubPacks.length, 0);
  assert.ok(s.pendingPick.cards.every((c) => TIERS.indexOf(c.rarity) >= 2));
  // Area cards are only drawn at a rarity that can still raise that area.
  const maxed = { ...fresh(), coins: 99999 };
  maxed.facilities = Object.fromEntries(AREA_IDS.map((k) => [k, 5]));
  for (let i = 0; i < 20; i += 1) assert.ok(buyClubPack(maxed, 'clubSilver', i).pendingPick.cards.every((c) => !OFFSEASON_CARDS[c.type].facility));
});

test('club cards: infrastructure raises its area, card plays still count and run out', () => {
  const s = fresh();
  s.inventory.club = [{ uid: 'a', type: 'stadiumEvolution', rarity: 'uncommon' }, ...Array.from({ length: 9 }, (_, i) => ({ uid: `t${i}`, type: 'teamBuilding', rarity: 'common' }))];
  let r = useOffseasonCard(s, 'a', {}, 1);
  assert.equal(r.success, true, r.message);
  assert.equal(constructionOf(r.state, 'stadium').to, s.facilities.stadium + 1, 'infrastructure starts building works');
  assert.equal(r.state.inventory.club.length, 9);
  let x = r.state;
  for (let i = 0; i < 7; i += 1) { r = useOffseasonCard(x, `t${i}`, {}, i); assert.equal(r.success, true, r.message); x = r.state; }
  assert.equal(cardPlays(x).used, 8);
  assert.equal(x.cohesion, 100, 'Team Building adds cohesion (capped at 100)');
  const blocked = useOffseasonCard(x, 't8', {}, 9);
  assert.notEqual(blocked.success, true);
  assert.match(blocked.message, /No card plays left/);
});

test('High Season doubles the gate on home games and only counts down at home', () => {
  let s = fresh();
  s.inventory.club = [{ uid: 'hs', type: 'highSeason', rarity: 'rare' }];
  s = useOffseasonCard(s, 'hs', {}, 1).state;
  assert.equal(s.clubEffects.length, 1);
  assert.equal(s.clubEffects[0].gamesLeft, 3);
  assert.equal(canUseOffseason({ ...s, inventory: { ...s.inventory, club: [{ uid: 'h2', type: 'highSeason', rarity: 'common' }] } }, { type: 'highSeason', rarity: 'common' }).ok, false, 'one High Season at a time');
  const gate = businessIncome(s).find((i) => i.label.startsWith('Home gate (')).coins;
  const extra = businessIncome(s).find((i) => i.label.includes('High Season'));
  assert.ok(Math.abs(extra.coins - gate) <= 1, 'x2 gate: the extra equals the normal gate');
  assert.ok(extra.homeOnly);
  let homeGames = 0;
  for (let md = 0; md < 12 && s.clubEffects.length; md += 1) {
    const fx = userFixture(s.season, s.club.divisionId, s.club.id);
    const before = s.clubEffects[0].gamesLeft;
    const ai = aiTeamFor(s.world, fx.opponentId, POOL_BY_ID, md);
    const me = buildUserTeam(s, [], fx.isHome);
    const m = simulateMatch({ home: fx.isHome ? me : ai, away: fx.isHome ? ai : me, seed: 40 + md });
    const side = fx.isHome ? 0 : 1;
    const rewards = matchRewards(s, m, side);
    assert.equal(rewards.items.some((i) => i.label.includes('High Season')), fx.isHome, 'paid at home games only');
    s = applyMatch(s, m, side, clubById(s.world, fx.opponentId), rewards, 60 + md).state;
    if (fx.isHome) homeGames += 1;
    assert.equal(s.clubEffects[0]?.gamesLeft ?? 0, fx.isHome ? before - 1 : before);
  }
  assert.equal(homeGames, 3);
  assert.equal(s.clubEffects.length, 0, 'gone after 3 home games');
});

test('temporary club cards: merchandise, shape, sponsor night, owners and fans', () => {
  const s = fresh();
  s.inventory.club = [
    { uid: 'm', type: 'viralMerch', rarity: 'legend' }, { uid: 'r', type: 'recoveryCamp', rarity: 'epic' },
    { uid: 'n', type: 'sponsorNight', rarity: 'rare' }, { uid: 'p', type: 'pressCharm', rarity: 'legend' }, { uid: 'f', type: 'localHero', rarity: 'rare' },
  ];
  let x = s;
  for (const id of ['m', 'r', 'n', 'p', 'f']) { const r = useOffseasonCard(x, id, {}, 1); assert.equal(r.success, true, r.message); x = r.state; }
  assert.ok(businessIncome(x).some((i) => i.label.startsWith('Merchandise · Viral Merchandise +60%')));
  assert.equal(teamShape(x), Math.min(100, teamShape(s) + 12));
  assert.equal(x.coins, s.coins + 400, 'Sponsor Night pays 400 at Rare in a tier-3 league');
  assert.equal(x.gm.confidence.board, Math.min(100, s.gm.confidence.board + 10));
  assert.equal(x.gm.confidence.fans, Math.min(100, s.gm.confidence.fans + 6));
  assert.equal(x.clubEffects.length, 2, 'only the lasting ones are listed as active effects');
});

test('Analyst Report lifts the tactics grade one step for a few matches', () => {
  let s = fresh();
  // Find instructions that grade red and grey for this coach and squad.
  const styles = Object.values(PHILOSOPHIES_FOR_TEST).map((p) => p.t);
  const base = s;
  const fitWith = (t, st = base) => teamFit({ ...buildUserTeam({ ...st, tactics: t }, [], true) });
  const red = styles.find((t) => fitWith(t).grade === 'red');
  assert.ok(red, 'some style clashes with the coach');
  s.inventory.club = [{ uid: 'ar', type: 'analystReport', rarity: 'rare' }];
  s = useOffseasonCard(s, 'ar', {}, 1).state;
  assert.equal(buildUserTeam(s, [], true).gradeUp, 1);
  const up = fitWith(red, s);
  assert.equal(up.grade, 'grey', 'red → grey');
  assert.ok(up.bonus > fitWith(red).bonus);
  const grey = styles.find((t) => fitWith(t).grade === 'grey');
  if (grey) assert.equal(fitWith(grey, s).grade, 'green', 'grey → green');
  assert.equal(teamFit({ ...buildUserTeam(s, [], true), tactics: red }).grade, 'grey');
  for (let md = 0; md < 3; md += 1) s = playMatchday(s, 2100 + md);
  assert.equal(s.clubEffects.length, 0, 'lasts 3 matches at Rare');
  assert.equal(buildUserTeam(s, [], true).gradeUp, 0);
});

test('old saves: club cards move to the club inventory, events stay, market restocked with transfers', () => {
  const s = fresh();
  const old = structuredClone(s);
  delete old.inventory.club;
  delete old.inventory.clubPacks;
  delete old.clubEffects;
  old.inventory.offseason = [
    { uid: 'o1', type: 'stadiumEvolution', rarity: 'common' }, { uid: 'o2', type: 'boostCrate', rarity: 'rare' },
    { uid: 'o3', type: 'fortressSeason', rarity: 'rare' }, { uid: 'o4', type: 'worldSigning', rarity: 'common' },
  ];
  old.market.offers = [{ uid: 'm1', type: 'clubStore', rarity: 'common', price: 100, sold: false }, { uid: 'm2', type: 'cupRun', rarity: 'common', price: 100, sold: false }];
  const m = migrateClubState(old);
  assert.deepEqual(m.inventory.club.map((i) => i.uid), ['o1', 'o2']);
  assert.deepEqual(m.inventory.offseason.map((i) => i.uid), ['o3', 'o4'], 'event cards stay for the season-card draw');
  assert.deepEqual(m.inventory.clubPacks, []);
  assert.deepEqual(m.clubEffects, []);
  assert.ok(m.market.offers.length > 0 && m.market.offers.every((o) => OFFSEASON_CARDS[o.type].group === 'transfer'));
  assert.equal(useOffseasonCard(m, 'o1', {}, 1).state.construction[0].to, m.facilities.stadium + 1, 'a moved card still plays (building works)');
  assert.equal(useOffseasonCard(m, 'o3', {}, 1).state.activeEvent.type, 'fortressSeason', 'old event cards still play');
  assert.deepEqual(migrateClubState(m).inventory, m.inventory, 'migration is idempotent');
});

console.log(`\n${passed} tests passed`);
