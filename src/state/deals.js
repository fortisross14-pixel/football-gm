// The club's commercial deals (v2.3): kit provider, shirt sponsor and TV rights.
//
// Every summer (closeSeason, or a new job) the club gets offers for next season:
//   kit: the current provider's renewal + the two other tiers (global / national / local),
//        each with base coins and a share of the shirt sales; you keep the line or order a
//        new design, and the season's shirt sales are revealed when you sign.
//   sponsor: the current sponsor's renewal (coins per win + a card) and two new brands
//        (a signing bonus + coins per win, no card).
//   tv: three channels, each a fixed fee plus coins per game, per home game or per
//        international game, whatever the result.
// Signing is final. Anything not signed by kick-off gets the default (keep the kit, renew the
// sponsor, the first TV offer). Lump sums are paid during the season: the kit revenue and the
// TV fee in 18 league-matchday instalments, the sponsor's signing bonus on matchday 1.
//
// Functions that end in "Into" mutate a state the caller has already cloned.

import { LEVEL_MULTIPLIER } from '../data/demo.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import { MERCH_MULT } from '../data/facilities.js';
import { RARITIES } from '../engine/cards.js';
import { MATCHDAYS } from '../engine/season.js';
import { makeRng } from '../engine/rng.js';
import { pushInbox } from './chronicle.js';
import { fansOf } from './fans.js';
import {
  SPONSOR_BASE, SEASON_GAMES, SPONSOR_KINDS, SPONSOR_BRANDS, RENEWAL_PACK, RENEWAL_CARD_RARITY,
  KIT_TIERS, KIT_TIER_IDS, KIT_BRANDS, KIT_UNIT, SHIRTS_PER_DEMAND, SHIRT_COINS, NEW_DESIGN, lineFactor, KIT_PATTERNS,
  TV_BASE, TV_KINDS, TV_KIND_IDS, TV_BRANDS,
} from '../data/deals.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const levelOf = (s) => DIVISION_BY_ID[s.club?.divisionId]?.level || 3;
const mult = (s) => LEVEL_MULTIPLIER[levelOf(s)] || 1;
const area = (s, k) => clamp(s.facilities?.[k] || 0, 0, 5);
const popularity = (s) => (s.squad || []).reduce((sum, c) => sum
  + (RARITIES[c.rarity]?.popularity || 0) * (1 + 0.25 * (c.stars || 0)) + (c.fame || 0), 0);
const track = (s, kind, cat, coins) => {
  if (!coins) return;
  s.finance = s.finance || { income: {}, spent: {} };
  s.finance[kind][cat] = (s.finance[kind][cat] || 0) + coins;
};

// International games for the TV deals: both continental cups, the continental super cup and
// the Club World Cup (not the domestic super cup).
export const isInternational = (competition = '') => ['cwc', 'contsuper'].includes(competition) || /continental/i.test(competition);

// ---------------------------------------------------------------------------
// What the club is worth to brands

// Last season's success, 0–1: league finish and trophies (a new career counts as 0.4).
export function successOf(state) {
  const log = state.careerLog || [];
  const last = log[log.length - 1];
  if (!last) return 0.4;
  return clamp((0.75 * (10 - (last.position || 10))) / 9 + 0.12 * (last.trophies || []).length, 0, 1);
}
const successF = (s) => 0.85 + 0.3 * successOf(s);

// Fans against the usual size for the division (clamped, so another fans scale stays sane).
// The middle of each level's range (state/fans.js: L3 8k–30k, L2 50k–200k, L1 250k–900k local;
// worldwide × 2.5 / 5 / 15). Giants (2M+ local) hit the 1.25× cap.
const LOCAL_NORM = { 1: 450000, 2: 100000, 3: 15000 };
const GLOBAL_NORM = { 1: 450000 * 15, 2: 100000 * 5, 3: 15000 * 2.5 };
export function fanFactors(state) {
  const f = fansOf(state);
  const lv = levelOf(state);
  return {
    local: clamp(f.local / LOCAL_NORM[lv], 0.8, 1.25),
    global: clamp(f.global / GLOBAL_NORM[lv], 0.8, 1.25),
  };
}

// A season of sponsorship: the Sponsorship area, division, fans and success.
export function sponsorValue(state) {
  const f = fanFactors(state);
  return SPONSOR_BASE[area(state, 'sponsor')] * mult(state) * 0.8 * SEASON_GAMES * ((f.local + f.global) / 2) * successF(state);
}
// Kit: base unit (division × merchandise line) and shirt demand (popularity, fans, success).
export const kitUnit = (state) => KIT_UNIT * mult(state) * MERCH_MULT[area(state, 'merch')];
export function kitDemand(state) {
  const f = fanFactors(state);
  return popularity(state) * MERCH_MULT[area(state, 'merch')] * (0.6 * f.local + 0.4 * f.global) * successF(state);
}
// TV: division, global fans and success.
export const tvValue = (state) => mult(state) * TV_BASE[levelOf(state)] * fanFactors(state).global * successF(state);

// ---------------------------------------------------------------------------
// Offers

const noise = (rng, k = 0.08) => 1 - k + 2 * k * rng.next();
const pickOther = (rng, list, not) => {
  const pool = list.filter((x) => !not.includes(x));
  return rng.pick(pool.length ? pool : list);
};

export const dealOffers = (state, kind) => state.deals?.[kind]?.offers || [];
export const dealSigned = (state, kind) => state.deals?.[kind]?.signed || null;
export const dealsOpen = (state) => state.phase === 'offseason' && !!state.deals;
// The off-season flow's steps done: the deals once signed, the season card once picked, the
// others once opened (state.offseasonSeen).
export function offseasonStatus(state) {
  const seen = state.offseasonSeen || [];
  return {
    summary: seen.includes('summary'), card: !state.seasonDeal || !!state.seasonCard,
    kit: !!dealSigned(state, 'kit'), sponsor: !!dealSigned(state, 'sponsor'), tv: !!dealSigned(state, 'tv'), ceo: seen.includes('ceo'),
  };
}
export const dealsPending = (state) => (dealsOpen(state) ? ['kit', 'sponsor', 'tv'].filter((k) => !dealSigned(state, k)) : []);

function sponsorOffers(next, rng, clubCard) {
  const sv = sponsorValue(next);
  const lv = levelOf(next);
  const current = next.sponsor?.brand || rng.pick(SPONSOR_BRANDS);
  const used = [current];
  const offer = (kind, brand) => {
    const k = SPONSOR_KINDS[kind];
    const n = noise(rng, 0.15);
    return { id: kind, kind, brand, perWin: Math.max(1, Math.round(sv * k.perWin * n)), bonus: Math.round(sv * k.bonus * n) };
  };
  const renewal = offer('renewal', current);
  const rarity = rng.pick(RENEWAL_CARD_RARITY[lv]);
  const card = rng.next() < 0.5 ? clubCard?.(rng, rarity) : null;
  renewal.card = card ? { kind: 'club', type: card.type, rarity: card.rarity } : { kind: 'pack', pack: RENEWAL_PACK[lv] };
  const a = pickOther(rng, SPONSOR_BRANDS, used); used.push(a);
  const b = pickOther(rng, SPONSOR_BRANDS, used);
  return [renewal, offer('bonus', a), offer('wins', b)];
}

function kitOffers(next, rng) {
  const unit = kitUnit(next);
  const cur = next.kit || { tier: 'local', brand: KIT_BRANDS.local[0], pattern: 'plain' };
  const tiers = [cur.tier, ...KIT_TIER_IDS.filter((t) => t !== cur.tier)];
  return tiers.map((tier, i) => {
    const t = KIT_TIERS[tier];
    const renewal = i === 0;
    const n = noise(rng, 0.12);
    return {
      id: tier, tier, renewal,
      brand: renewal ? cur.brand : rng.pick(KIT_BRANDS[tier]),
      base: Math.max(1, Math.round(unit * t.base * n * (renewal ? 1.05 : 1))),
      pct: Math.round(t.pct * 100) / 100,
      reach: t.reach,
      // Hidden until signing: this year's sales luck and how a new design would land.
      luck: noise(rng, 0.1),
      designRoll: NEW_DESIGN.min + (NEW_DESIGN.max - NEW_DESIGN.min) * rng.next(),
      newPattern: pickOther(rng, KIT_PATTERNS, [cur.pattern]),
    };
  });
}

function tvOffers(next, rng) {
  const t = tvValue(next);
  const used = [];
  return TV_KIND_IDS.map((kind) => {
    const k = TV_KINDS[kind];
    const brand = pickOther(rng, TV_BRANDS, used);
    used.push(brand);
    const n = noise(rng, 0.25);
    return { id: kind, kind, brand, fee: Math.round(t * k.fee * n), per: Math.max(1, Math.round(t * k.per * n)) };
  });
}

// Next season's offers (mutates). clubCard(rng, rarity) → { type, rarity } | null draws the
// sponsor renewal's infrastructure card (state/club.js knows which areas can still be raised).
export function makeDealOffersInto(next, seed = 1, { clubCard } = {}) {
  const rng = makeRng(seed);
  next.deals = {
    year: (next.season?.year ?? 0) + 1,
    kit: { offers: kitOffers(next, rng), signed: null },
    sponsor: { offers: sponsorOffers(next, rng, clubCard), signed: null },
    tv: { offers: tvOffers(next, rng), signed: null },
  };
}

// ---------------------------------------------------------------------------
// Kit: the season's shirt sales

// Shirts, shop takings and the club's revenue for an offer and a design choice.
// With a design factor and luck (the reveal), or without them (the expected figure).
export function kitSales(state, offer, { designF = 1, luck = 1 } = {}) {
  const shirts = Math.max(0, Math.round((kitDemand(state) * SHIRTS_PER_DEMAND * offer.reach * designF * luck) / 10) * 10);
  const sales = Math.round(shirts * SHIRT_COINS);
  const share = Math.round(offer.pct * sales);
  return { shirts, sales, share, revenue: offer.base + share };
}
export const designFee = (state) => Math.round(NEW_DESIGN.fee * kitUnit(state));
// The design factor for keeping the line (worn one more season) or a new design (expected).
export const keepFactor = (state) => lineFactor((state.kit?.age ?? 0) + 1);
export const newDesignExpected = (NEW_DESIGN.min + NEW_DESIGN.max) / 2;

function applyKitInto(next, offer, design, { auto = false } = {}) {
  const fresh = design === 'new';
  const old = next.kit || {};
  const age = fresh ? 0 : (old.age ?? 0) + 1;
  const designF = fresh ? offer.designRoll : lineFactor(age);
  const fee = fresh ? designFee(next) : 0;
  if (fee) { next.coins -= fee; track(next, 'spent', 'Kit design', fee); }
  const r = kitSales(next, offer, { designF, luck: offer.luck });
  const year = next.deals?.year ?? (next.season?.year ?? 0) + 1;
  next.kit = {
    brand: offer.brand, tier: offer.tier, base: offer.base, pct: offer.pct, reach: offer.reach,
    pattern: fresh ? offer.newPattern : (old.pattern || 'plain'), age, newDesign: fresh, designF: Math.round(designF * 100) / 100,
    shirts: r.shirts, sales: r.sales, share: r.share, revenue: r.revenue, year, since: offer.renewal ? (old.since ?? year) : year,
  };
  if (next.deals) next.deals.kit.signed = offer.id;
  const how = fresh ? `a new ${offer.newPattern} design (◎ ${fee})` : 'the same line';
  pushInbox(next, 'club', `👕 Kit deal${auto ? ' renewed' : ' signed'}: ${offer.brand}`,
    `${KIT_TIERS[offer.tier].label}, ${how}. ${r.shirts.toLocaleString()} shirts sold (shop takings ◎ ${r.sales.toLocaleString()}): the club gets ◎ ${offer.base} + ${Math.round(offer.pct * 100)}% = ◎ ${r.revenue}, paid over the ${MATCHDAYS} league matchdays.`);
  return r;
}

// Signs a kit offer with design 'keep' or 'new'. Returns { state, message, success, sales }.
export function signKit(state, id, design = 'keep') {
  const offer = dealOffers(state, 'kit').find((o) => o.id === id);
  if (!dealsOpen(state) || !offer) return { state, message: 'No kit offer like that right now.', success: false };
  if (dealSigned(state, 'kit')) return { state, message: 'The kit deal is already signed.', success: false };
  if (design === 'new' && state.coins < designFee(state)) return { state, message: `A new design costs ◎ ${designFee(state)}.`, success: false };
  const next = structuredClone(state);
  const r = applyKitInto(next, offer, design);
  return { state: next, message: `${offer.brand}: ${r.shirts.toLocaleString()} shirts, ◎ ${r.revenue} for the club.`, success: true, sales: r };
}

// ---------------------------------------------------------------------------
// Sponsor

function applySponsorInto(next, offer, { auto = false } = {}) {
  const year = next.deals?.year ?? (next.season?.year ?? 0) + 1;
  next.sponsor = { brand: offer.brand, kind: offer.kind, perWin: offer.perWin, bonus: offer.bonus, year, card: offer.card || null };
  if (next.deals) next.deals.sponsor.signed = offer.id;
  let gift = '';
  if (offer.card?.kind === 'pack') {
    next.inventory.packs.push(offer.card.pack);
    gift = ` They add a ${offer.card.pack} player pack (Cards → Owned).`;
  } else if (offer.card?.kind === 'club') {
    next.nextUid = (next.nextUid || 1) + 1;
    next.inventory.club = [...(next.inventory.club || []), { uid: `u${next.nextUid}`, type: offer.card.type, rarity: offer.card.rarity }];
    gift = ` They add an infrastructure card (Cards → Club).`;
  }
  const pay = [offer.bonus && `◎ ${offer.bonus} signing bonus on matchday 1`, `◎ ${offer.perWin} for every win`].filter(Boolean).join(' and ');
  pushInbox(next, 'club', `🤝 Sponsor ${offer.kind === 'renewal' ? 'renewed' : 'signed'}: ${offer.brand}`, `Season ${year}: ${pay}.${gift}${auto ? ' (renewed by the club: nothing was chosen).' : ''}`);
}

export function signSponsorDeal(state, id) {
  const offer = dealOffers(state, 'sponsor').find((o) => o.id === id);
  if (!dealsOpen(state) || !offer) return { state, message: 'No sponsor offer like that right now.', success: false };
  if (dealSigned(state, 'sponsor')) return { state, message: 'The sponsor is already signed.', success: false };
  const next = structuredClone(state);
  applySponsorInto(next, offer);
  return { state: next, message: `${offer.brand} ${offer.kind === 'renewal' ? 'renewed' : 'signed'}: ◎ ${offer.perWin} a win.`, success: true };
}

// ---------------------------------------------------------------------------
// TV

function applyTvInto(next, offer, { auto = false } = {}) {
  const year = next.deals?.year ?? (next.season?.year ?? 0) + 1;
  next.tv = { brand: offer.brand, kind: offer.kind, fee: offer.fee, per: offer.per, year };
  if (next.deals) next.deals.tv.signed = offer.id;
  pushInbox(next, 'club', `📺 TV deal signed: ${offer.brand}`, `Season ${year}: ◎ ${offer.fee} fixed (over the league matchdays) + ◎ ${offer.per} ${TV_KINDS[offer.kind].unit}.${auto ? ' (the first offer: nothing was chosen).' : ''}`);
}

export function signTv(state, id) {
  const offer = dealOffers(state, 'tv').find((o) => o.id === id);
  if (!dealsOpen(state) || !offer) return { state, message: 'No TV offer like that right now.', success: false };
  if (dealSigned(state, 'tv')) return { state, message: 'The TV deal is already signed.', success: false };
  const next = structuredClone(state);
  applyTvInto(next, offer);
  return { state: next, message: `${offer.brand}: ◎ ${offer.fee} + ◎ ${offer.per} ${TV_KINDS[offer.kind].unit}.`, success: true };
}

// ---------------------------------------------------------------------------
// Season start and new careers

// Kick-off (mutates): anything not signed takes the default. Returns the defaults applied.
export function settleDealsInto(next) {
  if (!next.deals) return [];
  const done = [];
  if (!dealSigned(next, 'kit') && dealOffers(next, 'kit').length) { applyKitInto(next, dealOffers(next, 'kit')[0], 'keep', { auto: true }); done.push('kit'); }
  if (!dealSigned(next, 'sponsor') && dealOffers(next, 'sponsor').length) { applySponsorInto(next, dealOffers(next, 'sponsor')[0], { auto: true }); done.push('sponsor'); }
  if (!dealSigned(next, 'tv') && dealOffers(next, 'tv').length) { applyTvInto(next, dealOffers(next, 'tv')[0], { auto: true }); done.push('tv'); }
  next.deals = null;
  return done;
}

// A new career or a new job: the club's current kit (local / national / global maker by tier),
// its sponsor and a per-game TV deal.
export function initialDealsInto(next, seed = 1) {
  const rng = makeRng(seed);
  const unit = kitUnit(next);
  const tier = { 1: 'global', 2: 'national', 3: 'local' }[levelOf(next)];
  const kitOffer = { id: tier, tier, renewal: true, brand: rng.pick(KIT_BRANDS[tier]), base: Math.round(unit * KIT_TIERS[tier].base), pct: KIT_TIERS[tier].pct, reach: KIT_TIERS[tier].reach, luck: 1 };
  const r = kitSales(next, kitOffer);
  const year = next.phase === 'offseason' ? (next.season?.year ?? 0) + 1 : (next.season?.year ?? 1);
  next.kit = { brand: kitOffer.brand, tier, base: kitOffer.base, pct: kitOffer.pct, reach: kitOffer.reach, pattern: rng.pick(KIT_PATTERNS), age: 0, newDesign: false, designF: 1, shirts: r.shirts, sales: r.sales, share: r.share, revenue: r.revenue, year, since: year };
  next.sponsor = { brand: rng.pick(SPONSOR_BRANDS), kind: 'renewal', perWin: Math.max(1, Math.round(sponsorValue(next) * SPONSOR_KINDS.renewal.perWin)), bonus: 0, year, card: null };
  const t = tvValue(next);
  next.tv = { brand: rng.pick(TV_BRANDS), kind: 'game', fee: Math.round(t * TV_KINDS.game.fee), per: Math.max(1, Math.round(t * TV_KINDS.game.per)), year };
}

// ---------------------------------------------------------------------------
// Match income

// An instalment of a season sum over the league matchdays (they add up exactly).
const instalment = (total, md) => Math.floor((total * (md + 1)) / MATCHDAYS) - Math.floor((total * md) / MATCHDAYS);

// The deals' income for one match: items { label, coins, cat, deal }.
export function dealMatchItems(state, { won, isHome, competition }) {
  const items = [];
  const league = competition === 'league';
  const md = state.season?.matchday ?? 0;
  const sp = state.sponsor;
  if (sp?.perWin && won) items.push({ label: `Sponsor win bonus · ${sp.brand}`, coins: sp.perWin, cat: 'Sponsor', deal: true });
  if (sp?.bonus && league && md === 0) items.push({ label: `Sponsor signing bonus · ${sp.brand}`, coins: sp.bonus, cat: 'Sponsor', deal: true });
  const kit = state.kit;
  if (kit?.revenue && league && md < MATCHDAYS) items.push({ label: `Kit deal · ${kit.brand}`, coins: instalment(kit.revenue, md), cat: 'Kit deal', deal: true });
  const tv = state.tv;
  if (tv) {
    if (tv.fee && league && md < MATCHDAYS) items.push({ label: `TV rights fee · ${tv.brand}`, coins: instalment(tv.fee, md), cat: 'TV', deal: true });
    const pays = tv.kind === 'game' || (tv.kind === 'home' && isHome) || (tv.kind === 'intl' && isInternational(competition));
    if (pays && tv.per) items.push({ label: `TV ${TV_KINDS[tv.kind]?.unit || 'a game'} · ${tv.brand}`, coins: tv.per, cat: 'TV', deal: true });
  }
  return items.filter((i) => i.coins > 0);
}

// ---------------------------------------------------------------------------
// Expected value (the UI's "about ◎ X a season" and the career-sim bots)

export function expectedGames(state, { winRate = null } = {}) {
  const qualified = JSON.stringify(state.qualification || {}).includes(`"${state.club.id}"`);
  const last = (state.careerLog || []).at(-1);
  const played = last?.record ? last.record.w + last.record.d + last.record.l : 0;
  const rate = winRate ?? (played ? last.record.w / played : 0.45);
  const games = SEASON_GAMES + (qualified ? 6 : 0);
  return { games, home: Math.round(games / 2), intl: qualified ? 6 : 0, wins: Math.round(rate * games), qualified };
}
export const sponsorEV = (offer, g) => offer.bonus + offer.perWin * g.wins;
export function tvEV(offer, g) {
  const n = offer.kind === 'game' ? g.games : offer.kind === 'home' ? g.home : g.intl;
  return offer.fee + offer.per * n;
}
