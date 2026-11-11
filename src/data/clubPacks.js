// Club packs: the only way to get club cards (data/offseason.js, group 'club').
// Bronze gives 1 card; Silver and Gold show 3 and you keep 1. Gold is Rare or better and
// leans on infrastructure (permanent area upgrades): almost life-changing.
//
// odds: per card, Common → Legend. permanent: chance each card is an infrastructure card
// (if one can still raise an area at that rarity; otherwise it's a temporary card).
import { AREA_CARD_IDS, TEMP_CARD_IDS, TIERS } from './offseason.js';

export const CLUB_PACKS = {
  clubBronze: { name: 'Bronze Club Pack', short: 'Bronze', price: 200, show: 1, odds: [55, 33, 10, 2, 0], permanent: 0.6, text: '1 club card, mostly Common or Uncommon' },
  clubSilver: { name: 'Silver Club Pack', short: 'Silver', price: 600, show: 3, odds: [25, 42, 24, 8, 1], permanent: 0.6, text: 'See 3 club cards, keep 1' },
  clubGold: { name: 'Gold Club Pack', short: 'Gold', price: 1800, show: 3, odds: [0, 0, 60, 31, 9], permanent: 0.75, text: 'See 3 Rare or better, keep 1. Mostly infrastructure' },
};
export const CLUB_PACK_IDS = Object.keys(CLUB_PACKS);

function rollTier(rng, odds) {
  const total = odds.reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (let i = 0; i < odds.length; i += 1) {
    roll -= odds[i];
    if (roll < 0) return i;
  }
  return odds.findIndex((o) => o > 0);
}

// The cards a club pack shows: [{ type, rarity }], all different types.
// canRaise(type, rarity): whether an area card could still be played at the club.
export function drawClubCards(rng, packId, canRaise = () => true) {
  const pack = CLUB_PACKS[packId];
  const cards = [];
  const used = new Set();
  for (let i = 0; i < pack.show; i += 1) {
    const rarity = TIERS[rollTier(rng, pack.odds)];
    const areas = AREA_CARD_IDS.filter((id) => !used.has(id) && canRaise(id, rarity));
    const temps = TEMP_CARD_IDS.filter((id) => !used.has(id));
    const type = areas.length && rng.next() < pack.permanent ? rng.pick(areas) : rng.pick(temps);
    used.add(type);
    cards.push({ type, rarity });
  }
  return cards;
}
