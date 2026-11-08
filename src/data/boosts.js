// In-game boost cards. `when` describes when a boost can be played,
// `target: 'player'` means the user picks one of their on-pitch players.

export const BOOSTS = {
  goldenChance: {
    rarity: 'epic',
    name: 'Golden Chance',
    text: 'Pick a player: a big chance for them in the next 15\'.',
    price: 80,
    target: 'player',
    icon: '★',
  },
  secondWind: {
    rarity: 'uncommon',
    name: 'Second Wind',
    text: 'Restore 40% stamina to the whole team.',
    price: 60,
    icon: '⚡',
  },
  ironWall: {
    rarity: 'common',
    name: 'Iron Wall',
    text: '+25% team DEF for the next 15\'.',
    price: 50,
    icon: '🛡',
  },
  allOutAttack: {
    rarity: 'common',
    name: 'All-Out Attack',
    text: '+30% ATT, −20% DEF for the next 15\'.',
    price: 50,
    icon: '⚔',
  },
  captainsSpeech: {
    rarity: 'rare',
    name: 'Captain\'s Speech',
    text: 'Only when losing: +10% all stats for the rest of the match.',
    price: 100,
    when: 'losing',
    icon: '📣',
  },
  setPiece: {
    rarity: 'common',
    name: 'Set-Piece Special',
    text: 'One extra set-piece chance in the next 15\'.',
    price: 40,
    icon: '⚑',
  },
  superSub: {
    rarity: 'uncommon',
    name: 'Super Sub',
    text: 'Your next substitute comes on with +15% stats.',
    price: 70,
    icon: '⇄',
  },
  gameManagement: {
    rarity: 'rare',
    name: 'Game Management',
    text: 'Only when leading at 75\': opponent chances −40% in the last 15\'.',
    price: 60,
    when: 'leadingLast',
    icon: '⏱',
  },
};

BOOSTS.twelfthMan = {
  name: 'Twelfth Man',
  rarity: 'legend',
  text: '+15% all stats for the next 30\'.',
  price: 160,
  icon: '🏟',
};

export const BOOST_IDS = Object.keys(BOOSTS);

// Boosts are not bought one by one: they come in sealed packs, or one free
// card after every match in which you played at least one boost.
const BOOST_WEIGHTS = { common: 50, uncommon: 30, rare: 14, epic: 5, legend: 1 };

export const BOOST_PACKS = {
  boostBasic: { name: 'Boost Pack', price: 120, count: 3, shift: 0, text: '3 random boosts' },
  boostPremium: { name: 'Premium Boosts', price: 380, count: 4, shift: 2, guarantee: 'rare', text: '4 boosts, at least 1 Rare or better' },
};

const ORDER = ['common', 'uncommon', 'rare', 'epic', 'legend'];

// rng: object with next(). shift > 0 moves weight from Common toward higher rarities.
export function drawBoost(rng, shift = 0, minRarity = 'common') {
  const min = ORDER.indexOf(minRarity);
  const ids = BOOST_IDS.filter((id) => ORDER.indexOf(BOOSTS[id].rarity) >= min);
  const w = (id) => {
    const i = ORDER.indexOf(BOOSTS[id].rarity);
    return BOOST_WEIGHTS[BOOSTS[id].rarity] * (1 + shift * i * 0.5) / (i === 0 ? 1 + shift : 1);
  };
  const total = ids.reduce((s, id) => s + w(id), 0);
  let r = rng.next() * total;
  for (const id of ids) { r -= w(id); if (r <= 0) return id; }
  return ids[ids.length - 1];
}

export function openBoostPack(rng, packId) {
  const pack = BOOST_PACKS[packId];
  const got = Array.from({ length: pack.count }, () => drawBoost(rng, pack.shift));
  if (pack.guarantee && !got.some((id) => ORDER.indexOf(BOOSTS[id].rarity) >= ORDER.indexOf(pack.guarantee))) {
    got[got.length - 1] = drawBoost(rng, pack.shift, pack.guarantee);
  }
  return got;
}
