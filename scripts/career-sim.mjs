// Career simulator for balancing: a bot plays whole careers the way a sensible player would
// and prints progress, economy, match and world metrics.
// Usage: node scripts/career-sim.mjs [careers=12] [seasons=10]
import {
  newClubState, starterOffers, nextUserGame, buildUserTeam, matchRewards, applyMatch, buyPack, pendingCard,
  duplicateOf, canMerge, keepPending, mergePending, discardPending, closeSeason, buyMarketCard, useOffseasonCard,
  startNextSeason, acceptOffer, carryOptions, seasonSummary, userStrength, canUseOffseason, POOL_BY_ID, isCoach, lookForOffers,
} from '../src/state/club.js';
import { aiTeamFor, clubById, standings } from '../src/engine/season.js';
import { simulateMatch } from '../src/engine/match.js';
import { overall, autoArrange, FORMATIONS, slotFit } from '../src/engine/cards.js';
import { PACKS } from '../src/engine/packs.js';
import { OFFSEASON_CARDS } from '../src/data/offseason.js';
import { DIVISION_BY_ID, TOP_CLUBS } from '../src/data/world/structure.js';
import { CONTINENTS } from '../src/engine/competitions.js';
import { PHILOSOPHIES, coachStyle, clubIdentity, styleDistance } from '../src/data/philosophies.js';
import { suitability } from '../src/engine/tactics.js';
import { teamAttrs } from '../src/engine/attributes.js';

const userAttrs = (state) => teamAttrs(FORMATIONS[state.coaches.coach.formation].map((sl, i) => ({ card: state.squad.find((c) => c.id === state.lineup[i]), pos: sl.pos, x: sl.x })).filter((e) => e.card));

const CAREERS = Number(process.argv[2]) || 12;
const SEASONS = Number(process.argv[3]) || 10;

// ---------------------------------------------------------------------------
// Bot policy

function bestLineup(state) {
  const formation = state.coaches.coach?.formation || '2-2-2';
  const slots = FORMATIONS[formation];
  const pool = [...state.squad];
  const picked = slots.map((slot) => {
    pool.sort((a, b) => overall(b) * slotFit(b.pos, slot.pos) - overall(a) * slotFit(a.pos, slot.pos));
    return pool.shift();
  });
  const lineup = autoArrange(picked, formation);
  return { ...state, lineup, bench: state.squad.filter((c) => !lineup.includes(c.id)).map((c) => c.id) };
}

// Bot skill: BOT=great|average|poor|bad (default average).
//   great:   picks the style that best fits coach and squad, shops and uses the market well
//   average: plays the coach's style, sensible shopping (the "not making big mistakes" player)
//   poor:    default tactics, cheap packs, little market use, looks for jobs every other summer
//   bad:     random style each season, wastes coins on bronze packs, never uses the market
const BOT = process.env.BOT || 'average';

function smartTactics(state) {
  if (process.env.TACTICS === 'default' || BOT === 'poor') return state;
  if (BOT === 'bad') {
    const ids = Object.keys(PHILOSOPHIES);
    return { ...state, tactics: { ...PHILOSOPHIES[ids[(state.season?.year * 7 + state.club.id.length) % ids.length]].t } };
  }
  if (BOT === 'great') {
    const A = userAttrs(state);
    const coachId = coachStyle(state.coaches.coach);
    const score = (id) => suitability(PHILOSOPHIES[id].t, A) / 25 - styleDistance(PHILOSOPHIES[id].t, coachId) - 0.4 * styleDistance(PHILOSOPHIES[id].t, clubIdentity(state.world.clubs[state.club.id]));
    const best = Object.keys(PHILOSOPHIES).sort((a, b) => score(b) - score(a))[0];
    return { ...state, tactics: { ...PHILOSOPHIES[best].t } };
  }
  // Play the coach's style unless it clashes with what the owners want; then meet in the club's way.
  const coach = coachStyle(state.coaches.coach);
  const club = clubIdentity(state.world.clubs[state.club.id]);
  const pick = styleDistance(PHILOSOPHIES[coach].t, club) > 3.5 && process.env.TACTICS === 'owners' ? club : coach;
  return { ...state, tactics: { ...PHILOSOPHIES[pick].t } };
}

// Decide on every waiting card: merge duplicates, keep upgrades, discard the rest.
function decide(state) {
  let s = state;
  if (BOT === 'bad') { while (s.pendingOpen) s = discardPending(s); return smartTactics(s); }
  for (let guard = 0; guard < 20 && s.pendingOpen; guard += 1) {
    const card = pendingCard(s);
    if (duplicateOf(s, card)) { s = canMerge(s, card) ? mergePending(s) : discardPending(s); continue; }
    if (isCoach(card)) {
      const worse = ['coach', 'assistant'].find((r) => !s.coaches[r]?.passive || rank(card.rarity) > rank(s.coaches[r].rarity));
      s = worse ? keepPending(s, { role: worse }) : discardPending(s);
      continue;
    }
    const samePos = s.squad.filter((c) => c.pos === card.pos).sort((a, b) => overall(a) - overall(b));
    const weakest = [...s.squad].sort((a, b) => overall(a) - overall(b))[0];
    const target = samePos[0] && overall(samePos[0]) < overall(card) ? samePos[0] : overall(weakest) + 3 < overall(card) ? weakest : null;
    s = target ? keepPending(s, { replaceId: target.id }) : discardPending(s);
  }
  return smartTactics(bestLineup(s));
}
const rank = (r) => ['academy', 'common', 'uncommon', 'rare', 'epic', 'legend'].indexOf(r);

// Spend: keep a reserve, prefer Gold when rich, otherwise Silver.
function shop(state, seed, stats) {
  let s = state;
  for (let i = 0; i < 6; i += 1) {
    const reserve = 300;
    let pack = s.coins >= PACKS.gold.price + reserve ? 'gold' : s.coins >= PACKS.silver.price + reserve ? 'silver' : null;
    if (BOT === 'poor') pack = s.coins >= 700 ? 'bronze' : null;
    if (BOT === 'bad') pack = null;
    if (!pack) break;
    s = buyPack(s, pack, seed + i);
    stats.packs[pack] = (stats.packs[pack] || 0) + 1;
    for (const c of s.pendingOpen?.cards || []) stats.pulls[c.rarity] = (stats.pulls[c.rarity] || 0) + 1;
    s = decide(s);
  }
  return s;
}

function offseason(state, seed) {
  let s = decide(state);
  if (BOT === 'bad') return s;
  // Buy what helps: signings first, then facilities, then one event.
  const order = ['worldSigning', 'nationalSigning', 'veteranSigning', 'stadiumEvolution', 'trainingGround', 'merchExpansion', 'youthAcademy', 'personalTrainer', 'careerExtension'];
  const offers = [...s.market.offers].sort((a, b) => {
    const ia = order.indexOf(a.type); const ib = order.indexOf(b.type);
    return (ia < 0 ? 50 : ia) - (ib < 0 ? 50 : ib);
  });
  let eventBought = false;
  for (const o of offers) {
    const isEvent = OFFSEASON_CARDS[o.type].group === 'event';
    if (isEvent && eventBought) continue;
    if (s.coins - o.price < 400) continue;
    if (!order.includes(o.type) && !isEvent) continue;
    s = buyMarketCard(s, o.uid);
    if (isEvent) eventBought = true;
  }
  // Use everything usable.
  for (const item of [...s.inventory.offseason]) {
    if (!canUseOffseason(s, item).ok) continue;
    const best = [...s.squad].sort((a, b) => overall(b) - overall(a))[0];
    const oldest = [...s.squad].filter((c) => c.matchesLeft != null).sort((a, b) => a.matchesLeft - b.matchesLeft)[0];
    const target = { playerId: item.type === 'careerExtension' ? oldest?.id : best.id, position: 'FWD', formation: s.coaches.coach.formation === '2-3-1' ? '2-2-2' : '2-3-1' };
    const r = useOffseasonCard(s, item.uid, target, seed++);
    s = decide(r.state);
  }
  return s;
}

function chooseOffer(state) {
  const looks = process.env.NO_LOOK !== '1' && (BOT !== 'poor' || state.season.year % 2 === 0);
  if (looks) state = lookForOffers(state, 4242 + state.season.year);
  const offers = state.gm.offers;
  if (!offers.length) return state;
  const best = [...offers].sort((a, b) => state.world.clubs[b.clubId].strength - state.world.clubs[a.clubId].strength)[0];
  const better = state.world.clubs[best.clubId].strength > userStrength(state) + 1 || DIVISION_BY_ID[state.world.clubs[best.clubId].divisionId].level < state.club.level;
  if (!better && !state.gm.sacked) return state;
  const players = carryOptions(state).filter((o) => o.kind === 'player').map((o) => ({ o, ovr: overall(state.squad.find((c) => `player:${c.id}` === o.key)) }));
  const carry = players.sort((a, b) => b.ovr - a.ovr).slice(0, 2).map((x) => x.o.key);
  return bestLineup(acceptOffer(state, best.clubId, carry, 99));
}

function playNext(state, seed, stats) {
  const game = nextUserGame(state);
  const homeFirst = game.homeId === state.club.id;
  const me = buildUserTeam(state, [], homeFirst && !game.neutral);
  const ai = aiTeamFor(state.world, game.opponentId, POOL_BY_ID, seed);
  const m = simulateMatch({ home: homeFirst ? me : ai, away: homeFirst ? ai : me, seed, context: { competition: game.competition, knockout: game.knockout, neutral: game.neutral } });
  const side = homeFirst ? 0 : 1;
  const opp = clubById(state.world, game.opponentId);
  // Upsets: who was stronger?
  const myStr = userStrength(state);
  const gap = opp.strength - myStr;
  const res = m.result.winner === side ? 'W' : m.result.winner === null ? 'D' : 'L';
  if (Math.abs(gap) >= 4) {
    const key = gap > 0 ? 'underdog' : 'favourite';
    stats.upsets[key].n += 1;
    if (res === 'W') stats.upsets[key].w += 1;
    if (res === 'D') stats.upsets[key].d += 1;
  }
  stats.goals += m.score[0] + m.score[1];
  stats.matches += 1;
  stats.byComp[game.competition] = (stats.byComp[game.competition] || 0) + 1;
  const rewards = matchRewards(state, m, side, game);
  return applyMatch(state, m, side, opp, rewards, seed, game).state;
}

// ---------------------------------------------------------------------------
// Run careers

const stats = {
  packs: {}, pulls: {}, goals: 0, matches: 0, byComp: {},
  upsets: { underdog: { n: 0, w: 0, d: 0 }, favourite: { n: 0, w: 0, d: 0 } },
  bySeason: Array.from({ length: SEASONS }, () => ({ level: [], pos: [], coinsIn: [], strengthGap: [], rep: [], retired: 0, trophies: 0, continental: 0, cats: {}, verdicts: {} })),
  firstD2: [], firstD1: [], firstContinental: [], topClub: [], sacked: 0, moves: 0,
  worldNamed: [], contWinners: {}, cardSeasons: [],
};

const t0 = Date.now();
for (let c = 0; c < CAREERS; c += 1) {
  const offer = starterOffers(1000 + c)[c % 3];
  let s = bestLineup(newClubState(5000 + c * 17, { clubId: offer.clubId, gmName: 'Bot' }));
  let seed = 10000 * (c + 1);
  const firstSeen = new Map();
  const reached = { d2: null, d1: null, cont: null, top: null };
  for (let y = 0; y < SEASONS; y += 1) {
    const row = stats.bySeason[y];
    const hof = s.hallOfFame.length;
    s = decide(s);
    s = shop(s, seed++, stats);
    for (const card of s.squad) if (POOL_BY_ID[card.id] && !firstSeen.has(card.id)) firstSeen.set(card.id, y);
    let guard = 0;
    while (s.phase === 'season' && guard < 70) {
      s = playNext(s, seed++, stats);
      s = decide(s);
      if (guard % 6 === 5) s = shop(s, seed++, stats);
      guard += 1;
    }
    const sum = seasonSummary(s);
    row.level.push(s.club.level);
    row.pos.push(sum.position);
    row.coinsIn.push(Object.values(s.finance?.income || {}).reduce((a, b) => a + b, 0));
    for (const [k, v] of Object.entries(s.finance?.income || {})) row.cats[k] = (row.cats[k] || 0) + v / CAREERS;
    const div = s.world.divisions[s.club.divisionId].filter((id) => id !== s.club.id).map((id) => s.world.clubs[id].strength);
    row.strengthGap.push(userStrength(s) - div.reduce((a, b) => a + b, 0) / div.length);
    row.trophies += (s.season.userTrophies || []).length;
    if (CONTINENTS.some((k) => s.season.comps.continental[k].entrants.includes(s.club.id))) {
      row.continental += 1;
      if (reached.cont === null) reached.cont = y + 1;
    }
    for (const k of CONTINENTS) {
      const w = s.season.comps.continental[k].winner;
      if (w) stats.contWinners[w] = (stats.contWinners[w] || 0) + 1;
    }
    s = closeSeason(s, seed++);
    row.retired += s.hallOfFame.length - hof;
    for (const h of s.hallOfFame.slice(hof)) if (firstSeen.has(h.card.id)) stats.cardSeasons.push(y - firstSeen.get(h.card.id) + 1);
    row.rep.push(s.gm.reputation);
    row.verdicts[s.gm.review.verdict] = (row.verdicts[s.gm.review.verdict] || 0) + 1;
    if (s.gm.sacked) stats.sacked += 1;
    s = offseason(s, seed++);
    const before = s.club.id;
    s = chooseOffer(s);
    if (s.club.id !== before) stats.moves += 1;
    if (s.club.level <= 2 && reached.d2 === null) reached.d2 = y + 2;
    if (s.club.level === 1 && reached.d1 === null) reached.d1 = y + 2;
    if (TOP_CLUBS.includes(s.club.id) && reached.top === null) reached.top = y + 2;
    s = decide(s);
    s = startNextSeason(s, seed++);
    if (s.phase !== 'season') { s = decide(s); s = startNextSeason(s, seed++); }
  }
  if (process.env.DUMP_STATE) (await import('node:fs')).writeFileSync(process.env.DUMP_STATE, JSON.stringify(s));
  stats.firstD2.push(reached.d2);
  stats.firstD1.push(reached.d1);
  stats.firstContinental.push(reached.cont);
  stats.topClub.push(reached.top);
  stats.worldNamed.push(Object.values(s.world.clubs).reduce((a, cl) => a + cl.keyPlayers.length, 0) / 304);
  process.stdout.write(`career ${c + 1}/${CAREERS} done\r`);
}

// ---------------------------------------------------------------------------
// Report

const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const f1 = (v) => v.toFixed(1);
const reachedPct = (list) => `${list.filter((x) => x !== null).length}/${list.length}${list.some((x) => x !== null) ? ` (median season ${median(list.filter((x) => x !== null))})` : ''}`;
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

console.log(`\n${CAREERS} careers × ${SEASONS} seasons in ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
console.log('Season | avg level | avg finish | income | strength vs division | reputation | retirements | trophies | continental');
stats.bySeason.forEach((r, i) => {
  console.log(`  ${String(i + 1).padStart(2)}   |   ${f1(avg(r.level))}     |    ${f1(avg(r.pos))}     | ${String(Math.round(avg(r.coinsIn))).padStart(6)} |       ${avg(r.strengthGap) >= 0 ? '+' : ''}${f1(avg(r.strengthGap))}          |    ${String(Math.round(avg(r.rep))).padStart(3)}     |    ${f1(r.retired / CAREERS)}      |   ${r.trophies}      |   ${r.continental}`);
});
for (const i of [0, Math.floor(SEASONS / 2), SEASONS - 1]) {
  const cats = stats.bySeason[i].cats;
  console.log(`Income season ${i + 1}: ${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v)}`).join(' · ')}`);
}
console.log(`Board verdicts: ${['exceeded', 'met', 'missed'].map((v) => `${v} ${stats.bySeason.reduce((a, r) => a + (r.verdicts[v] || 0), 0)}`).join(' · ')}`);
console.log(`\nReached a level-2 club: ${reachedPct(stats.firstD2)} · level-1 club: ${reachedPct(stats.firstD1)} · continental: ${reachedPct(stats.firstContinental)} · top club: ${reachedPct(stats.topClub)}`);
console.log(`Moves: ${stats.moves} · sackings: ${stats.sacked}`);
const total = Object.values(stats.pulls).reduce((a, b) => a + b, 0);
console.log(`Packs bought: ${JSON.stringify(stats.packs)} · pulls: ${['common', 'uncommon', 'rare', 'epic', 'legend'].map((r) => `${r} ${((100 * (stats.pulls[r] || 0)) / Math.max(1, total)).toFixed(0)}%`).join(' ')}`);
console.log(`Matches: ${stats.matches} (${JSON.stringify(stats.byComp)}) · goals/match ${f1(stats.goals / stats.matches)}`);
const u = stats.upsets;
console.log(`As underdog (4+ weaker): won ${f1((100 * u.underdog.w) / Math.max(1, u.underdog.n))}% drew ${f1((100 * u.underdog.d) / Math.max(1, u.underdog.n))}% of ${u.underdog.n} · as favourite: won ${f1((100 * u.favourite.w) / Math.max(1, u.favourite.n))}% of ${u.favourite.n}`);
console.log(`User cards lasted ${f1(avg(stats.cardSeasons))} seasons on average before retiring (${stats.cardSeasons.length} retirements)`);
console.log(`World named cards per club after ${SEASONS} seasons: ${f1(avg(stats.worldNamed))}`);
const top = Object.entries(stats.contWinners).sort((a, b) => b[1] - a[1]).slice(0, 6);
console.log(`Most continental titles: ${top.map(([id, n]) => `${id} ${n}`).join(', ')} (of ${CAREERS * SEASONS * 3})`);
