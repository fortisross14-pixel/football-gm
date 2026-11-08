// The five numbers on every player card: Passing, Shooting, Defense, Physical, Set pieces.
// DEF and PHY are stored; PAS, SHO and SET are derived from the card (position, attack
// rating, trait, a fixed per-card variation) so they stay consistent forever, with
// real-world specialists lifted where everybody knows them.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
// Three independent small offsets in [-span, span] from one card id.
const jitter = (id, k, span) => ((hash(`${id}:${k}`) % (2 * span + 1)) - span);

const SET_PIECE = [
  'David Beckham', 'Juninho Pernambucano', 'Andrea Pirlo', 'Roberto Carlos', 'Ronald Koeman', 'Siniša Mihajlović', 'Sinisa Mihajlovic',
  'Rogério Ceni', 'Gheorghe Hagi', 'Zico', 'Michel Platini', 'Lionel Messi', 'Cristiano Ronaldo', 'Alessandro Del Piero', 'Francesco Totti',
  'Hakan Çalhanoğlu', 'James Ward-Prowse', 'Kevin De Bruyne', 'Trent Alexander-Arnold', 'Ronaldinho', 'Rivaldo', 'Juan Román Riquelme',
  'Zinedine Zidane', 'Gareth Bale', 'Xabi Alonso', 'Toni Kroos', 'Dimitri Payet', 'Miralem Pjanić', 'Marcelinho Carioca', 'Rivelino',
  'Roberto Baggio', 'Gianfranco Zola', 'Matt Le Tissier', 'Shunsuke Nakamura', 'Keisuke Honda', 'Didi', 'Nelinho', 'Marcos Assunção',
];
const PLAYMAKERS = [
  'Xavi', 'Xavi Hernández', 'Andrés Iniesta', 'Andrea Pirlo', 'Toni Kroos', 'Luka Modrić', 'Juan Román Riquelme', 'Zinedine Zidane',
  'Kevin De Bruyne', 'Paul Scholes', 'Michael Laudrup', 'Mesut Özil', 'Sergio Busquets', 'Carlos Valderrama', 'Gheorghe Hagi', 'Zico',
  'Ronaldinho', 'Lionel Messi', 'Johan Cruyff', 'Pedri', 'Martin Ødegaard', 'Bernardo Silva', 'David Silva', 'Xabi Alonso', 'Pablo Aimar',
  'Rui Costa', 'Dejan Savićević', 'Michael Ballack', 'Frank Rijkaard', 'Guti', 'Santi Cazorla', 'Isco', 'Juan Mata', 'Cesc Fàbregas',
];
const SET_SET = new Set(SET_PIECE);
const PM_SET = new Set(PLAYMAKERS);

export const ATTR_KEYS = ['pas', 'sho', 'def', 'phy', 'set'];
export const ATTR_LABEL = { pas: 'PAS', sho: 'SHO', def: 'DEF', phy: 'PHY', set: 'SET' };
export const ATTR_NAME = { pas: 'Passing', sho: 'Shooting', def: 'Defense', phy: 'Physical', set: 'Set pieces' };

export function attrs(card) {
  if (!card) return { pas: 50, sho: 50, def: 50, phy: 50, set: 50 };
  const id = card.baseId || card.id || card.name || '';
  const { att = 50, def = 50, phy = 50, pos = 'MID' } = card;
  let pas;
  let sho;
  let set;
  switch (pos) {
    case 'GK':
      pas = 0.45 * def + 0.3 * phy + jitter(id, 'p', 5);
      sho = att + jitter(id, 's', 3);
      set = 28 + jitter(id, 't', 6);
      break;
    case 'DEF':
      pas = 0.55 * att + 0.35 * def + jitter(id, 'p', 6);
      sho = att - 4 + jitter(id, 's', 4);
      set = 0.6 * att + 18 + jitter(id, 't', 8);
      break;
    case 'FWD':
      pas = att - 10 + jitter(id, 'p', 6);
      sho = att + 2 + jitter(id, 's', 3);
      set = att - 14 + jitter(id, 't', 9);
      break;
    default:
      pas = att + 2 + jitter(id, 'p', 5);
      sho = att - 6 + jitter(id, 's', 5);
      set = att - 8 + jitter(id, 't', 9);
  }
  if (card.trait === 'playmaker') pas += 7;
  if (card.trait === 'poacher') sho += 5;
  if (card.trait === 'clutch') set += 6;
  if (PM_SET.has(card.name)) pas = Math.max(pas, att + 6, 86);
  if (SET_SET.has(card.name)) set = Math.max(set, 86 + jitter(id, 'x', 4));
  const stars = card.stars || 0;
  return {
    pas: clamp(pas + stars, 20, 95),
    sho: clamp(sho + stars, 15, 95),
    def: clamp(def, 15, 95),
    phy: clamp(phy, 25, 95),
    set: clamp(set + stars, 15, 95),
  };
}

// Team averages over the starters (outfield only), plus wide vs central attackers.
export function teamAttrs(entries) {
  const out = entries.filter((e) => e.pos !== 'GK');
  const avg = (key, list = out) => (list.length ? list.reduce((s, e) => s + attrs(e.card)[key], 0) / list.length : 60);
  const wide = out.filter((e) => e.x !== undefined && (e.x < 35 || e.x > 65));
  const central = out.filter((e) => e.x !== undefined && e.x >= 35 && e.x <= 65 && e.pos !== 'DEF');
  const threat = (list) => (list.length ? list.reduce((s, e) => { const a = attrs(e.card); return s + (a.pas + a.sho) / 2; }, 0) / list.length : null);
  const defs = out.filter((e) => e.pos === 'DEF');
  const fwds = out.filter((e) => e.pos === 'FWD');
  return {
    pas: avg('pas'), sho: avg('sho'), def: avg('def'), phy: avg('phy'),
    set: out.length ? Math.max(...out.map((e) => attrs(e.card).set)) * 0.6 + avg('set') * 0.4 : 50, // your best taker matters most
    wide: threat(wide), central: threat(central),
    defPhy: defs.length ? avg('phy', defs) : avg('phy'), defDef: defs.length ? avg('def', defs) : avg('def'),
    fwdPhy: fwds.length ? avg('phy', fwds) : avg('phy'),
  };
}
