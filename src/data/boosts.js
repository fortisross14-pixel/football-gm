// In-game boost cards. `when` describes when a boost can be played,
// `target: 'player'` means the user picks one of their on-pitch players.

export const BOOSTS = {
  goldenChance: {
    name: 'Golden Chance',
    text: 'Pick a player: a big chance for them in the next 15\'.',
    price: 80,
    target: 'player',
    icon: '★',
  },
  secondWind: {
    name: 'Second Wind',
    text: 'Restore 40% stamina to the whole team.',
    price: 60,
    icon: '⚡',
  },
  ironWall: {
    name: 'Iron Wall',
    text: '+25% team DEF for the next 15\'.',
    price: 50,
    icon: '🛡',
  },
  allOutAttack: {
    name: 'All-Out Attack',
    text: '+30% ATT, −20% DEF for the next 15\'.',
    price: 50,
    icon: '⚔',
  },
  captainsSpeech: {
    name: 'Captain\'s Speech',
    text: 'Only when losing: +10% all stats for the rest of the match.',
    price: 100,
    when: 'losing',
    icon: '📣',
  },
  setPiece: {
    name: 'Set-Piece Special',
    text: 'One extra set-piece chance in the next 15\'.',
    price: 40,
    icon: '⚑',
  },
  superSub: {
    name: 'Super Sub',
    text: 'Your next substitute comes on with +15% stats.',
    price: 70,
    icon: '⇄',
  },
  gameManagement: {
    name: 'Game Management',
    text: 'Only when leading at 75\': opponent chances −40% in the last 15\'.',
    price: 60,
    when: 'leadingLast',
    icon: '⏱',
  },
};

export const BOOST_IDS = Object.keys(BOOSTS);
