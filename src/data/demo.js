// Starting club, coaches and boosts, plus three test opponents used by the balance script.

export const USER_CLUB = {
  id: 'racing',
  name: 'Racing Santander',
  short: 'RAC',
  division: 'Spain · Division 3',
  level: 3,
  colors: { primary: '#0f8a4f', secondary: '#ffffff', away: '#101820' },
};

export const USER_COACHES = {
  coach: { id: 'k-delafuente', name: 'Luis de la Fuente', role: 'coach', rarity: 'rare', formation: '2-3-1', passive: 'motivator', matchesLeft: 184 },
  assistant: { id: 'k-ferrer', name: 'Tomás Ferrer', role: 'assistant', rarity: 'common', formation: '2-2-2', passive: 'fitnessGuru', matchesLeft: 193 },
};

export const START_INVENTORY = {
  goldenChance: 2,
  secondWind: 2,
  ironWall: 1,
  allOutAttack: 1,
  captainsSpeech: 1,
  setPiece: 2,
  superSub: 1,
  gameManagement: 1,
};

export const OPPONENTS = [
  {
    id: 'sporting',
    name: 'Sporting Gijón',
    short: 'SPO',
    division: 'Spain · Division 3',
    difficulty: 'Normal',
    level: 3,
    rating: 66,
    formation: '3-2-1',
    colors: { primary: '#d71920', secondary: '#ffffff', away: '#1b2b4b' },
    coach: { name: 'Head coach', passive: 'ironDiscipline' },
    keyPlayers: [],
  },
  {
    id: 'betis',
    name: 'Real Betis',
    short: 'BET',
    division: 'Spain · Division 2',
    difficulty: 'Hard',
    level: 2,
    rating: 72,
    formation: '2-3-1',
    colors: { primary: '#0f9a4a', secondary: '#ffffff', away: '#1d2a5c' },
    coach: { name: 'Head coach', passive: 'attackMinded' },
    keyPlayers: [
      { id: 'betis-isco', name: 'Isco', pos: 'MID', rarity: 'rare', att: 79, def: 62, phy: 64, trait: 'playmaker' },
    ],
  },
  {
    id: 'realmadrid',
    name: 'Real Madrid',
    short: 'RMA',
    division: 'Spain · Division 1',
    difficulty: 'Very hard',
    level: 1,
    rating: 80,
    formation: '2-2-2',
    colors: { primary: '#f4f4f4', secondary: '#c9a227', away: '#2a2a72' },
    coach: { name: 'Head coach', passive: 'motivator' },
    keyPlayers: [
      { id: 'rma-courtois', name: 'Thibaut Courtois', pos: 'GK', rarity: 'epic', att: 25, def: 84, phy: 70, trait: 'shotStopper' },
      { id: 'rma-bellingham', name: 'Jude Bellingham', pos: 'MID', rarity: 'legend', att: 88, def: 76, phy: 85, trait: 'bigGame' },
      { id: 'rma-mbappe', name: 'Kylian Mbappé', pos: 'FWD', rarity: 'legend', att: 93, def: 38, phy: 84, trait: 'poacher' },
    ],
  },
];

export const LEVEL_MULTIPLIER = { 1: 1.75, 2: 1.5, 3: 1 };
