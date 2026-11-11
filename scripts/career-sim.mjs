// Career simulator for balancing: a bot plays whole careers the way a sensible player would
// and prints progress, economy, match and world metrics.
// Usage: node scripts/career-sim.mjs [careers=12] [seasons=10]
import {
  newClubState, starterOffers, nextUserGame, buildUserTeam, matchRewards, applyMatch, buyPack, pendingCard,
  duplicateOf, canMerge, keepPending, mergePending, discardPending, closeSeason, buyMarketCard, useOffseasonCard,
  startNextSeason, acceptOffer, carryOptions, seasonSummary, userStrength, canUseOffseason, POOL_BY_ID, isCoach, lookForOffers,
  cardPlaysLeft, seeMarket, buyClubPack, pickClubCard, seasonDealOptions, pickSeasonCard, redrawSeasonCards, redrawCost,
  setTicketPrice, dealOffers, dealSigned, signKit, signSponsorDeal, signTv, kitSales, designFee, keepFactor, newDesignExpected,
  expectedGames, sponsorEV, tvEV, businessIncome,
} from '../src/state/club.js';
import { CLUB_PACKS } from '../src/data/clubPacks.js';
import { GM_STYLE_IDS, drawGmTrait } from '../src/engine/gmTraits.js';
import { AREA_IDS, STADIUM_INCOME, TICKET_PRICES } from '../src/data/facilities.js';
import { LEVEL_MULTIPLIER } from '../src/data/demo.js';
import { aiTeamFor, clubById, standings } from '../src/engine/season.js';
import { simulateMatch } from '../src/engine/match.js';
import { overall, autoArrange, FORMATIONS, slotFit } from '../src/engine/cards.js';
import { PACKS } from '../src/engine/packs.js';
import { OFFSEASON_CARDS, OFFSEASON_IDS, TIERS, MARKET_WEIGHTS } from '../src/data/offseason.js';
import { makeRng } from '../src/engine/rng.js';
import { DIVISION_BY_ID, TOP_CLUBS } from '../src/data/world/structure.js';
import { CONTINENTS } from '../src/engine/competitions.js';
import { requiredReputation } from '../src/engine/career.js';
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
globalThis.FOOTBALL_NO_STATS = process.env.STATS !== 'on';

function smartTactics(state) {
  if (process.env.TACTICS === 'default') return state;
  if (BOT === 'poor') {
    // Below average: every other season the plan clashes with the coach.
    if ((state.season?.year || 1) % 2 === 0) return state;
    const coachId = coachStyle(state.coaches.coach);
    const worst = Object.keys(PHILOSOPHIES).sort((a, b) => styleDistance(PHILOSOPHIES[b].t, coachId) - styleDistance(PHILOSOPHIES[a].t, coachId))[0];
    return { ...state, tactics: { ...PHILOSOPHIES[worst].t } };
  }
  if (BOT === 'bad') {
    const ids = Object.keys(PHILOSOPHIES);
    return { ...state, tactics: { ...PHILOSOPHIES[ids[(state.season?.year * 7 + state.club.id.length) % ids.length]].t } };
  }
  if (BOT === 'great') {
    const A = userAttrs(state);
    const coachId = coachStyle(state.coaches.coach);
    // Green if at all possible: close to the coach (distance ≤ 2) and the most suitable for the squad,
    // also trying the coach's preset with each switch flipped.
    const options = [];
    for (const id of Object.keys(PHILOSOPHIES)) {
      const base = PHILOSOPHIES[id].t;
      options.push(base);
      for (const sw of ['offsideTrap', 'setPieces', 'counter']) options.push({ ...base, [sw]: !base[sw] });
      for (const ch of [['attack', 'wings', 'centre'], ['buildUp', 'short', 'long']]) options.push({ ...base, [ch[0]]: base[ch[0]] === ch[1] ? ch[2] : ch[1] });
    }
    const score = (t) => { const d = styleDistance(t, coachId); return (d <= 2 ? 100 : 0) + suitability(t, A) - d * 5; };
    const best = options.sort((a, b) => score(b) - score(a))[0];
    return { ...state, tactics: { ...best } };
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
    let pack = s.coins >= PACKS.elite.price + reserve && process.env.ELITE !== '0' ? 'elite' : s.coins >= PACKS.gold.price + reserve ? 'gold' : s.coins >= PACKS.silver.price + reserve ? 'silver' : null;
    if (BOT === 'poor') pack = s.coins >= 700 ? 'bronze' : null;
    if (BOT === 'bad') pack = null;
    if (!pack) break;
    s = buyPack(s, pack, seed + i);
    stats.packs[pack] = (stats.packs[pack] || 0) + 1;
    if (stats.curRow) stats.curRow.bought[pack] = (stats.curRow.bought[pack] || 0) + 1 / CAREERS;
    for (const c of s.pendingOpen?.cards || []) stats.pulls[c.rarity] = (stats.pulls[c.rarity] || 0) + 1;
    s = decide(s);
  }
  return s;
}

// Management cards: the market (transfer cards only) is open all year, club cards come in
// club packs, and every card played uses one of the season's card plays. Buy what helps
// (signings first), then a club pack or two from spare money, and play everything usable.
const MARKET_ORDER = ['worldSigning', 'nationalSigning', 'veteranSigning', 'personalTrainer', 'careerExtension'];
const AREA_ORDER = ['stadium', 'training', 'sponsor', 'hospitality', 'merch', 'store', 'spa', 'gym', 'academy', 'analytics'];
const tier = (r) => ['common', 'uncommon', 'rare', 'epic', 'legend'].indexOf(r);

// Which of the pack's cards to keep. great: the best value for the club; average: the highest
// rarity, infrastructure first; poor: the first one.
function pickIndex(state, cards) {
  if (BOT === 'poor' || BOT === 'bad') return 0;
  const score = (c) => {
    const def = OFFSEASON_CARDS[c.type];
    const playable = canUseOffseason({ ...state, pendingPick: null, cardPlays: 0 }, c).ok;
    if (BOT !== 'great') return tier(c.rarity) * 10 + (def.facility && playable ? 15 : 0);
    if (def.facility) return playable ? 60 + (c.rarity === 'legend' ? 30 : 0) - AREA_ORDER.indexOf(def.facility) * 2 + tier(c.rarity) : 0;
    return 15 + tier(c.rarity) * 8 + (['highSeason', 'sponsorNight', 'analystReport'].includes(c.type) ? 6 : 0);
  };
  return cards.map((c, i) => [score(c), i]).sort((a, b) => b[0] - a[0])[0][1];
}

function manage(state, seed, { summer }) {
  let s = decide(state);
  if (BOT === 'bad' || !s.market) return s;
  if (BOT === 'poor' && !summer) return s;
  const order = BOT === 'poor' ? MARKET_ORDER.slice(0, 3) : MARKET_ORDER;
  const offers = [...s.market.offers].filter((o) => !o.sold).sort((a, b) => {
    const ia = order.indexOf(a.type); const ib = order.indexOf(b.type);
    return (ia < 0 ? 50 : ia) - (ib < 0 ? 50 : ib);
  });
  // In-season, only spare money: packs come first for a sensible player.
  const reserve = summer ? 400 : 1500;
  const play = (item) => {
    if (!canUseOffseason(s, item).ok) return;
    const best = [...s.squad].sort((a, b) => overall(b) - overall(a))[0];
    const oldest = [...s.squad].filter((c) => c.matchesLeft != null).sort((a, b) => a.matchesLeft - b.matchesLeft)[0];
    const target = { playerId: item.type === 'careerExtension' ? oldest?.id : best.id, position: 'FWD', formation: s.coaches.coach.formation === '2-3-1' ? '2-2-2' : '2-3-1' };
    const r = useOffseasonCard(s, item.uid, target, seed++);
    s = decide(r.state);
  };
  // Cards already owned (season rewards, earlier picks) first, then buy and play straight away.
  for (const item of [...s.inventory.offseason, ...(s.inventory.club || [])]) play(item);
  for (const o of offers) {
    if (!cardPlaysLeft(s)) break;
    if (!order.includes(o.type)) continue;
    if (s.coins - o.price < reserve || !canUseOffseason(s, o).ok) continue;
    s = buyMarketCard(s, o.uid);
    play(o);
  }
  // Club packs from what's left: Gold when rich, Silver otherwise (poor bots: Bronze).
  for (let i = 0; i < (summer ? 3 : 2) && cardPlaysLeft(s) > 1; i += 1) {
    let pack = s.coins >= CLUB_PACKS.clubGold.price + reserve * 2 ? 'clubGold' : s.coins >= CLUB_PACKS.clubSilver.price + reserve ? 'clubSilver'
      : summer && s.coins >= CLUB_PACKS.clubBronze.price + reserve ? 'clubBronze' : null;
    if (BOT === 'poor') pack = s.coins >= CLUB_PACKS.clubBronze.price + reserve ? 'clubBronze' : null;
    if (!pack) break;
    s = buyClubPack(s, pack, seed++);
    if (!s.pendingPick) break;
    stats.clubPacks[pack] = (stats.clubPacks[pack] || 0) + 1;
    const idx = pickIndex(s, s.pendingPick.cards);
    const kept = s.pendingPick.cards[idx];
    stats.clubPicks[OFFSEASON_CARDS[kept.type].kind] = (stats.clubPicks[OFFSEASON_CARDS[kept.type].kind] || 0) + 1;
    s = pickClubCard(s, idx);
    play(s.inventory.club.find((c) => c.uid === kept.uid));
  }
  return seeMarket(s);
}
const offseason = (state, seed) => seasonDeal(manage(state, seed, { summer: true }), seed + 5);

// The season deal: average and below take the first card; great scores the hand for its club
// and redraws once when the hand is weak and money is spare.
const SEASON_SCORE = {
  fortressSeason: 9, underdogMentality: 4, preseasonCamp: 5, shootingDrills: 8, indomitableSpirit: 5, scoutingNetwork: 5,
  tacticalContinuity: 4, fitnessProgram: 4, cupRun: 5, continentalNights: 6, sportsScience: 6, goldenGeneration: 7,
  marketingTour: 3, bargainHunter: 5, highVisibility: 6, sponsorsFavourite: 3, packedHouse: 4,
};
const RARITY_SCORE = { common: 1, uncommon: 1.3, rare: 1.7, epic: 2.2, legend: 3 };
function seasonDeal(state, seed) {
  let s = state;
  if (!s.seasonDeal || BOT !== 'great') return s;
  const score = (o) => (SEASON_SCORE[o.type] || 3) * RARITY_SCORE[o.rarity];
  const best = () => [...seasonDealOptions(s)].sort((a, b) => score(b) - score(a))[0];
  if (score(best()) < 9 && redrawCost(s) !== null && s.coins > redrawCost(s) + 1500) { s = redrawSeasonCards(s, seed); stats.redraws += 1; }
  const pick = best();
  if (pick.type === 'goldenGeneration' && s.pendingOpen) return s;
  return decide(pickSeasonCard(s, pick.key, seed + 1));
}

// Business choices (v2.3): the summer deals (kit, sponsor, TV) and ticket prices.
//   average / poor / bad: never choose: the defaults at kick-off (keep the kit line, renew the
//            sponsor, the first TV offer); Normal tickets
//   great:   the best expected value for each deal (kit: provider and design; sponsor: wins
//            expected from the squad's edge, the renewal card counted at half its shop value;
//            TV: the games it expects, international ones if qualified); High tickets while the
//            fans are happy (Low when they turn)
// DEALS=default makes the great bot take the defaults too.
function divisionGap(state) {
  const div = state.world.divisions[state.club.divisionId].filter((id) => id !== state.club.id).map((id) => state.world.clubs[id].strength);
  return userStrength(state) - div.reduce((a, b) => a + b, 0) / div.length;
}
const CARD_VALUE = { bronze: 100, silver: 300, gold: 1000, common: 80, uncommon: 150, rare: 300, epic: 600, legend: 1200 };
function business(state) {
  let s = state;
  if (BOT === 'great' && process.env.DEALS !== 'default') {
    if (!dealSigned(s, 'kit') && dealOffers(s, 'kit').length) {
      const fee = designFee(s);
      const opts = dealOffers(s, 'kit').flatMap((o) => [
        { o, design: 'keep', ev: kitSales(s, o, { designF: keepFactor(s) }).revenue },
        { o, design: 'new', ev: kitSales(s, o, { designF: newDesignExpected }).revenue - fee },
      ]).filter((x) => x.design === 'keep' || s.coins >= fee);
      const best = opts.sort((a, b) => b.ev - a.ev)[0];
      s = signKit(s, best.o.id, best.design).state;
    }
    const g = expectedGames(s, { winRate: Math.max(0.25, Math.min(0.8, 0.45 + 0.03 * divisionGap(s))) });
    if (!dealSigned(s, 'sponsor') && dealOffers(s, 'sponsor').length) {
      const card = (o) => (o.card ? CARD_VALUE[o.card.kind === 'pack' ? o.card.pack : o.card.rarity] || 0 : 0);
      const best = [...dealOffers(s, 'sponsor')].sort((a, b) => sponsorEV(b, g) + card(b) / 2 - (sponsorEV(a, g) + card(a) / 2))[0];
      s = signSponsorDeal(s, best.id).state;
    }
    if (!dealSigned(s, 'tv') && dealOffers(s, 'tv').length) {
      const best = [...dealOffers(s, 'tv')].sort((a, b) => tvEV(b, g) - tvEV(a, g))[0];
      s = signTv(s, best.id).state;
    }
  }
  return tickets(s);
}
function tickets(state) {
  if (BOT !== 'great' || process.env.TICKETS === 'off') return state;
  const fans = state.gm?.confidence?.fans ?? 55;
  return setTicketPrice(state, fans >= 60 ? 'high' : fans < 40 ? 'low' : 'normal');
}

function chooseOffer(state) {
  const looks = process.env.NO_LOOK !== '1' && (BOT !== 'poor' || state.season.year % 2 === 0);
  if (looks) state = lookForOffers(state, 4242 + state.season.year);
  const offers = state.gm.offers;
  if (!offers.length) return state;
  // The most prestigious club that wants you (the giants first).
  const best = [...offers].sort((a, b) => b.required - a.required)[0];
  const better = best.required >= requiredReputation(state.world, state.club.id) + 5 || DIVISION_BY_ID[state.world.clubs[best.clubId].divisionId].level < state.club.level;
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
  // What the ticket choice earned against Normal prices on the same match.
  const plain = matchRewards({ ...state, ticketPrice: 'normal' }, m, side, game);
  const row = stats.bySeason[(state.season.year - 1) % SEASONS];
  row.choice += (rewards.total - plain.total) / CAREERS;
  // v2.3 gate (crowd × price per fan) against the v2.2 per-level gate on the same home game.
  if (homeFirst && !game.neutral) {
    const gate = businessIncome(state, { competition: game.competition }).find((i) => i.area === 'stadium');
    const m = LEVEL_MULTIPLIER[state.club.level] || 1;
    row.gate += gate.coins / CAREERS;
    row.oldGate += Math.round(Math.round(STADIUM_INCOME[state.facilities.stadium] * m * (TICKET_PRICES[state.ticketPrice] || TICKET_PRICES.normal).gate) * 0.8) / CAREERS;
    row.crowd += gate.crowd.attendance; row.cap += gate.crowd.capacity; row.homeGames += 1;
  }
  return applyMatch(state, m, side, opp, rewards, seed, game).state;
}

// ---------------------------------------------------------------------------
// Run careers

const stats = {
  packs: {}, pulls: {}, goals: 0, matches: 0, byComp: {}, clubPacks: {}, clubPicks: {},
  upsets: { underdog: { n: 0, w: 0, d: 0 }, favourite: { n: 0, w: 0, d: 0 } },
  bySeason: Array.from({ length: SEASONS }, () => ({ level: [], pos: [], coinsIn: [], strengthGap: [], rep: [], areas: [], plays: [], retired: 0, trophies: 0, continental: 0, cats: {}, spent: {}, verdicts: {}, choice: 0, gate: 0, oldGate: 0, crowd: 0, cap: 0, homeGames: 0, sq: { rare: [], epic: [], legend: [] }, top7: [], bought: {}, topClub: 0 })),
  redraws: 0, traits: {},
  firstD2: [], firstD1: [], firstContinental: [], topClub: [], sacked: 0, moves: 0,
  worldNamed: [], contWinners: {}, cardSeasons: [],
};

const t0 = Date.now();
for (let c = 0; c < CAREERS; c += 1) {
  const offer = starterOffers(1000 + c)[c % 3];
  // A random GM style and card (TRAIT=none: no GM card, as in careers from before v2.2).
  const style = GM_STYLE_IDS[(c * 7 + 3) % GM_STYLE_IDS.length];
  const trait = process.env.TRAIT === 'none' ? null : process.env.TRAIT ? { id: process.env.TRAIT, rarity: process.env.TRAIT_RARITY || 'rare' } : drawGmTrait(style, 777 + c * 13);
  if (trait) stats.traits[`${trait.id}/${trait.rarity}`] = (stats.traits[`${trait.id}/${trait.rarity}`] || 0) + 1;
  let s = bestLineup(newClubState(5000 + c * 17, { clubId: offer.clubId, gmName: 'Bot', style, trait }));
  let seed = 10000 * (c + 1);
  const firstSeen = new Map();
  const reached = { d2: null, d1: null, cont: null, top: null };
  for (let y = 0; y < SEASONS; y += 1) {
    const row = stats.bySeason[y];
    stats.curRow = row;
    const hof = s.hallOfFame.length;
    s = decide(s);
    s = shop(s, seed++, stats);
    for (const card of s.squad) if (POOL_BY_ID[card.id] && !firstSeen.has(card.id)) firstSeen.set(card.id, y);
    let guard = 0;
    while (s.phase === 'season' && guard < 70) {
      s = playNext(s, seed++, stats);
      s = tickets(decide(s));
      if (s.phase === 'season' && s.market?.fresh && !process.env.NO_MANAGE) s = manage(s, seed * 7 + 13, { summer: false }); // own seed: keeps match seeds comparable
      if (guard % 6 === 5) s = shop(s, seed++, stats);
      guard += 1;
    }
    const sum = seasonSummary(s);
    row.level.push(s.club.level);
    // Squad quality: how many Rare / Epic / Legend cards the user owns at season end.
    for (const r of ['rare', 'epic', 'legend']) row.sq[r].push(s.squad.filter((c) => c.rarity === r).length);
    row.top7.push(userStrength(s));
    if (TOP_CLUBS.includes(s.club.id)) row.topClub += 1;
    row.areas.push(AREA_IDS.reduce((t, k) => t + (s.facilities[k] || 0), 0));
    row.plays.push(s.cardPlays || 0);
    row.pos.push(sum.position);
    row.coinsIn.push(Object.values(s.finance?.income || {}).reduce((a, b) => a + b, 0));
    for (const [k, v] of Object.entries(s.finance?.income || {})) row.cats[k] = (row.cats[k] || 0) + v / CAREERS;
    for (const [k, v] of Object.entries(s.finance?.spent || {})) row.spent[k] = (row.spent[k] || 0) + v / CAREERS;
    const div = s.world.divisions[s.club.divisionId].filter((id) => id !== s.club.id).map((id) => s.world.clubs[id].strength);
    row.strengthGap.push(userStrength(s) - div.reduce((a, b) => a + b, 0) / div.length);
    row.trophies += (s.season.userTrophies || []).length;
    if (CONTINENTS.some((k) => [s.season.comps.continental[k], s.season.comps.continental2?.[k]].some((t) => t?.entrants.includes(s.club.id)))) {
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
    s = business(decide(s));
    s = startNextSeason(s, seed++);
    if (s.phase !== 'season') { s = decide(s); s = startNextSeason(s, seed++); }
  }
  if (process.env.DUMP_STATE) (await import('node:fs')).writeFileSync(process.env.DUMP_STATE, JSON.stringify(s));
  stats.firstD2.push(reached.d2);
  stats.firstD1.push(reached.d1);
  stats.firstContinental.push(reached.cont);
  stats.topClub.push(reached.top);
  stats.worldNamed.push(Object.values(s.world.clubs).reduce((a, cl) => a + cl.keyPlayers.length, 0) / Object.keys(s.world.clubs).length);
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
console.log('Squad at season end (avg cards): Rare / Epic / Legend · strength of the 7 · careers at a giant');
stats.bySeason.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}   R ${f1(avg(r.sq.rare))}  E ${f1(avg(r.sq.epic))}  L ${f1(avg(r.sq.legend))}  · ${f1(avg(r.top7))} · ${r.topClub}/${CAREERS}  · packs ${Object.entries(r.bought).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}`));
console.log(`Club area levels (sum of all 10 areas, end of season): ${stats.bySeason.map((r) => f1(avg(r.areas))).join(' · ')}`);
console.log(`Card plays used per season (summer + season): ${stats.bySeason.map((r) => f1(avg(r.plays))).join(' · ')}`);
for (const i of [0, Math.floor(SEASONS / 2), SEASONS - 1]) {
  const cats = stats.bySeason[i].cats;
  console.log(`Income season ${i + 1}: ${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v)}`).join(' · ')}`);
  console.log(`  spent: ${Object.entries(stats.bySeason[i].spent).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v)}`).join(' · ')}`);
}
console.log(`Club packs bought: ${JSON.stringify(stats.clubPacks)} · kept: ${JSON.stringify(stats.clubPicks)}`);
console.log(`Ticket choice vs Normal (coins a season): ${stats.bySeason.map((r) => `${Math.round(r.choice)} (${Math.round((100 * r.choice) / Math.max(1, avg(r.coinsIn)))}%)`).join(' · ')}`);
const DEAL_LINES = ['Sponsor', 'Kit deal', 'TV', 'Merchandise'];
console.log(`Deal lines a season (${DEAL_LINES.join(' + ')}): ${stats.bySeason.map((r) => Math.round(DEAL_LINES.reduce((t, k) => t + (r.cats[k] || 0), 0) - (r.spent['Kit design'] || 0))).join(' · ')} (kit design fees taken off)`);
console.log(`Income S1–S${SEASONS} (sum of season averages): ${Math.round(stats.bySeason.reduce((t, r) => t + avg(r.coinsIn), 0))}`);
console.log(`Gate (v2.3 crowd × price) vs v2.2 per-level gate, same home games: ${stats.bySeason.map((r) => `${Math.round(r.gate)}/${Math.round(r.oldGate)} (${Math.round((100 * r.gate) / Math.max(1, r.oldGate))}%)`).join(' · ')}`);
console.log(`Average crowd / capacity: ${stats.bySeason.map((r) => `${Math.round(r.crowd / Math.max(1, r.homeGames))}/${Math.round(r.cap / Math.max(1, r.homeGames))}`).join(' · ')}`);
console.log(`Board verdicts: ${['exceeded', 'met', 'missed'].map((v) => `${v} ${stats.bySeason.reduce((a, r) => a + (r.verdicts[v] || 0), 0)}`).join(' · ')}`);
console.log(`\nReached a level-2 club: ${reachedPct(stats.firstD2)} · level-1 club: ${reachedPct(stats.firstD1)} · continental: ${reachedPct(stats.firstContinental)} · top club: ${reachedPct(stats.topClub)}`);
console.log(`Moves: ${stats.moves} · sackings: ${stats.sacked} · season-deal redraws: ${stats.redraws}`);
console.log(`GM cards: ${Object.entries(stats.traits).map(([k, n]) => `${k}${n > 1 ? ` ×${n}` : ''}`).join(', ') || 'none'}`);
const total = Object.values(stats.pulls).reduce((a, b) => a + b, 0);
console.log(`Packs bought: ${JSON.stringify(stats.packs)} · pulls: ${['common', 'uncommon', 'rare', 'epic', 'legend'].map((r) => `${r} ${((100 * (stats.pulls[r] || 0)) / Math.max(1, total)).toFixed(0)}%`).join(' ')}`);
console.log(`Matches: ${stats.matches} (${JSON.stringify(stats.byComp)}) · goals/match ${f1(stats.goals / stats.matches)}`);
const u = stats.upsets;
console.log(`As underdog (4+ weaker): won ${f1((100 * u.underdog.w) / Math.max(1, u.underdog.n))}% drew ${f1((100 * u.underdog.d) / Math.max(1, u.underdog.n))}% of ${u.underdog.n} · as favourite: won ${f1((100 * u.favourite.w) / Math.max(1, u.favourite.n))}% of ${u.favourite.n}`);
console.log(`User cards lasted ${f1(avg(stats.cardSeasons))} seasons on average before retiring (${stats.cardSeasons.length} retirements)`);
console.log(`World named cards per club after ${SEASONS} seasons: ${f1(avg(stats.worldNamed))}`);
const top = Object.entries(stats.contWinners).sort((a, b) => b[1] - a[1]).slice(0, 6);
console.log(`Most continental titles: ${top.map(([id, n]) => `${id} ${n}`).join(', ')} (of ${CAREERS * SEASONS * CONTINENTS.length})`);
