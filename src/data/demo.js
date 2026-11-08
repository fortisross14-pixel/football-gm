// Milestone 1 demo content: one user club, three opponents and a boost inventory.
// Real names and stats are placeholders until the data pass (milestone 8).

export const USER_CLUB = {
  id: 'racing',
  name: 'Racing Santander',
  short: 'RAC',
  division: 'Spain · Division 3',
  level: 3,
  colors: { primary: '#0f8a4f', secondary: '#ffffff', away: '#101820' },
};

export const USER_SQUAD = [
  { id: 'c-ibarra', name: 'Marco Ibarra', pos: 'GK', rarity: 'uncommon', att: 22, def: 64, phy: 58, trait: null, matchesLeft: 171 },
  { id: 'c-carvajal', name: 'Dani Carvajal', pos: 'DEF', rarity: 'rare', att: 62, def: 72, phy: 66, trait: 'leader', matchesLeft: 104 },
  { id: 'c-cantero', name: 'Luis Cantero', pos: 'DEF', rarity: 'common', att: 44, def: 63, phy: 61, trait: null, matchesLeft: 182 },
  { id: 'c-pedri', name: 'Pedri', pos: 'MID', rarity: 'epic', att: 83, def: 70, phy: 76, trait: 'playmaker', matchesLeft: 158 },
  { id: 'c-saez', name: 'Pablo Sáez', pos: 'MID', rarity: 'common', att: 60, def: 58, phy: 63, trait: 'engine', matchesLeft: 166 },
  { id: 'c-ortega', name: 'Rubén Ortega', pos: 'MID', rarity: 'common', att: 58, def: 61, phy: 60, trait: null, matchesLeft: 149 },
  { id: 'c-aspas', name: 'Iago Aspas', pos: 'FWD', rarity: 'rare', att: 76, def: 34, phy: 60, trait: 'clutch', matchesLeft: 102 },
  { id: 'c-mena', name: 'Hugo Mena', pos: 'GK', rarity: 'academy', att: 18, def: 54, phy: 52, trait: null, matchesLeft: null },
  { id: 'c-gil', name: 'Tomás Gil', pos: 'DEF', rarity: 'common', att: 40, def: 60, phy: 62, trait: 'wall', matchesLeft: 190 },
  { id: 'c-vela', name: 'Andrés Vela', pos: 'FWD', rarity: 'uncommon', att: 65, def: 32, phy: 66, trait: 'poacher', matchesLeft: 176 },
];

export const USER_LINEUP = ['c-ibarra', 'c-carvajal', 'c-cantero', 'c-pedri', 'c-saez', 'c-ortega', 'c-aspas'];
export const USER_BENCH = ['c-mena', 'c-gil', 'c-vela'];

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
      { id: 'rma-courtois', name: 'Thibaut Courtois', pos: 'GK', rarity: 'epic', att: 25, def: 86, phy: 70, trait: 'shotStopper' },
      { id: 'rma-bellingham', name: 'Jude Bellingham', pos: 'MID', rarity: 'legend', att: 88, def: 76, phy: 85, trait: 'bigGame' },
      { id: 'rma-mbappe', name: 'Kylian Mbappé', pos: 'FWD', rarity: 'legend', att: 93, def: 38, phy: 84, trait: 'poacher' },
    ],
  },
];

export const LEVEL_MULTIPLIER = { 1: 3, 2: 2, 3: 1 };
