// Card rules shared by the engine and the UI.

export const RARITIES = {
  academy: { label: 'Academy', order: 0, popularity: 0, quickSell: 0 },
  common: { label: 'Common', order: 1, popularity: 1, quickSell: 10 },
  rare: { label: 'Rare', order: 2, popularity: 3, quickSell: 40 },
  epic: { label: 'Epic', order: 3, popularity: 8, quickSell: 120 },
  legendary: { label: 'Legendary', order: 4, popularity: 20, quickSell: 400 },
};

export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

export const TRAITS = {
  clutch: { name: 'Clutch', text: '+15% ATT after 75\'' },
  engine: { name: 'Engine', text: 'Stamina drains 50% slower' },
  wall: { name: 'Wall', text: '+10% team DEF while on the pitch' },
  poacher: { name: 'Poacher', text: '+15% finishing' },
  playmaker: { name: 'Playmaker', text: 'Teammates create better chances' },
  leader: { name: 'Leader', text: '+3% team stats while on the pitch' },
  bigGame: { name: 'Big Game', text: '+10% in continental and Club World Cup matches' },
  shotStopper: { name: 'Shot Stopper', text: '+10% saves, +15% in penalty shootouts' },
};

// Formations are written as DEF-MID-FWD; the goalkeeper is implied.
// Slot coordinates are percentages on a vertical pitch, own goal at the bottom.
export const FORMATIONS = {
  '2-3-1': [
    { pos: 'GK', x: 50, y: 90 },
    { pos: 'DEF', x: 30, y: 70 }, { pos: 'DEF', x: 70, y: 70 },
    { pos: 'MID', x: 18, y: 46 }, { pos: 'MID', x: 50, y: 50 }, { pos: 'MID', x: 82, y: 46 },
    { pos: 'FWD', x: 50, y: 22 },
  ],
  '3-2-1': [
    { pos: 'GK', x: 50, y: 90 },
    { pos: 'DEF', x: 20, y: 70 }, { pos: 'DEF', x: 50, y: 73 }, { pos: 'DEF', x: 80, y: 70 },
    { pos: 'MID', x: 32, y: 47 }, { pos: 'MID', x: 68, y: 47 },
    { pos: 'FWD', x: 50, y: 22 },
  ],
  '2-2-2': [
    { pos: 'GK', x: 50, y: 90 },
    { pos: 'DEF', x: 30, y: 70 }, { pos: 'DEF', x: 70, y: 70 },
    { pos: 'MID', x: 30, y: 47 }, { pos: 'MID', x: 70, y: 47 },
    { pos: 'FWD', x: 32, y: 22 }, { pos: 'FWD', x: 68, y: 22 },
  ],
  '3-1-2': [
    { pos: 'GK', x: 50, y: 90 },
    { pos: 'DEF', x: 20, y: 70 }, { pos: 'DEF', x: 50, y: 73 }, { pos: 'DEF', x: 80, y: 70 },
    { pos: 'MID', x: 50, y: 48 },
    { pos: 'FWD', x: 32, y: 22 }, { pos: 'FWD', x: 68, y: 22 },
  ],
};

export function overall(card) {
  const { att, def, phy } = card;
  switch (card.pos) {
    case 'GK': return Math.round(def * 0.85 + phy * 0.15);
    case 'DEF': return Math.round(def * 0.65 + att * 0.15 + phy * 0.2);
    case 'MID': return Math.round(att * 0.4 + def * 0.35 + phy * 0.25);
    default: return Math.round(att * 0.7 + phy * 0.2 + def * 0.1);
  }
}

// How well a card plays in a slot that isn't its natural position.
export function slotFit(cardPos, slotPos) {
  if (cardPos === slotPos) return 1;
  if (cardPos === 'GK' || slotPos === 'GK') return 0.6;
  const order = { DEF: 0, MID: 1, FWD: 2 };
  return Math.abs(order[cardPos] - order[slotPos]) === 1 ? 0.88 : 0.78;
}

export function teamOverall(players) {
  if (!players.length) return 0;
  return Math.round(players.reduce((sum, p) => sum + overall(p), 0) / players.length);
}
