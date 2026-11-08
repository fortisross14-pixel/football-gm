// Playing philosophies. Every coach has one, every club has an identity its
// owners expect. Your team instructions (press, passing, line, approach) should
// match your coach's philosophy; the owners judge you on the club's identity.

const T = (press, tempo, line, attack, buildUp, offsideTrap, setPieces, counter, approach) => ({ press, tempo, line, attack, buildUp, offsideTrap, setPieces, counter, approach });

export const PHILOSOPHIES = {
  tikiTaka: { name: 'Tiki-taka', text: 'Keep the ball, press to win it back, squeeze high.', t: T(5, 2, 5, 'centre', 'short', true, false, false, 'balanced') },
  totalFootball: { name: 'Total football', text: 'Everyone attacks, everyone presses.', t: T(5, 4, 5, 'wings', 'short', true, false, false, 'attacking') },
  gegenpress: { name: 'Gegenpress', text: 'Win it back in seconds and go vertical.', t: T(5, 5, 4, 'centre', 'short', false, false, true, 'attacking') },
  controlled: { name: 'Controlled possession', text: 'Patient build-up, no risks.', t: T(3, 2, 3, 'wings', 'short', false, false, false, 'balanced') },
  pragmatic: { name: 'Pragmatic', text: 'Whatever wins the game.', t: T(3, 3, 3, 'wings', 'short', false, true, false, 'balanced') },
  routeOne: { name: 'Route one', text: 'Long balls to strong forwards, set pieces, all-out attack.', t: T(3, 4, 3, 'wings', 'long', false, true, false, 'attacking') },
  counter: { name: 'Counter-attack', text: 'Sit deep, break fast.', t: T(2, 5, 2, 'wings', 'long', false, false, true, 'balanced') },
  catenaccio: { name: 'Catenaccio', text: 'Lock the door, win 1–0.', t: T(1, 2, 1, 'centre', 'long', false, true, true, 'cautious') },
};
export const PHILOSOPHY_IDS = Object.keys(PHILOSOPHIES);

const APPROACH = ['cautious', 'balanced', 'attacking'];
// 0 = identical. Each slider step 0.5, each different choice 1, each switch 0.5, each mentality step 1.
export function tacticsDistance(a, b) {
  let d = 0;
  for (const k of ['press', 'tempo', 'line']) d += Math.abs((a[k] ?? 3) - (b[k] ?? 3)) * 0.5;
  for (const k of ['attack', 'buildUp']) d += a[k] === b[k] ? 0 : 1;
  for (const k of ['offsideTrap', 'setPieces', 'counter']) d += !!a[k] === !!b[k] ? 0 : 0.5;
  d += Math.abs(APPROACH.indexOf(a.approach || 'balanced') - APPROACH.indexOf(b.approach || 'balanced'));
  return d;
}
export function styleDistance(tactics, philosophyId) {
  const p = PHILOSOPHIES[philosophyId]?.t;
  return p ? tacticsDistance(tactics, p) : 4;
}

// The preset closest to a set of instructions.
export function nearestPhilosophy(tactics) {
  return PHILOSOPHY_IDS.reduce((best, id) => (styleDistance(tactics, id) < styleDistance(tactics, best) ? id : best), PHILOSOPHY_IDS[0]);
}

// Team-wide bonus (fraction) for playing your coach's way. Better coaches get more out of it.
const FIT = [0.025, 0.02, 0.012, 0.005, -0.005, -0.015, -0.025, -0.035, -0.045, -0.055, -0.06];
const COACH_SKILL = { academy: 0.5, common: 0.6, uncommon: 0.8, rare: 1, epic: 1.2, legend: 1.4 };
export function fitBonus(distance, rarity = 'common') {
  const base = FIT[Math.min(10, Math.round(distance))];
  // Penalties hit everyone in full; bonuses grow with the coach's quality.
  return base > 0 ? base * (COACH_SKILL[rarity] ?? 0.6) : base;
}

export function fitLabel(distance) {
  if (distance <= 0.5) return 'Perfect fit';
  if (distance <= 2) return 'Good fit';
  if (distance <= 3.5) return 'Loose fit';
  return 'Clash';
}

// Known coaches; the rest follow their passive.
const COACH_STYLE = {
  'k-pep-guardiola': 'tikiTaka', 'k-carlo-ancelotti': 'pragmatic', 'k-luis-enrique': 'totalFootball', 'k-xabi-alonso': 'controlled',
  'k-diego-simeone': 'catenaccio', 'k-arne-slot': 'controlled', 'k-mikel-arteta': 'controlled', 'k-hansi-flick': 'gegenpress',
  'k-vincent-kompany': 'totalFootball', 'k-luciano-spalletti': 'controlled', 'k-mauricio-pochettino': 'gegenpress', 'k-thomas-tuchel': 'pragmatic',
  'k-simone-inzaghi': 'counter', 'k-jesse-marsch': 'gegenpress', 'k-hajime-moriyasu': 'counter', 'k-walid-regragui': 'catenaccio',
};
const BY_PASSIVE = {
  tactician: 'controlled', cupSpecialist: 'pragmatic', fitnessGuru: 'gegenpress', ironDiscipline: 'catenaccio',
  attackMinded: 'routeOne', counterMaster: 'counter', motivator: 'pragmatic',
};
export function coachStyle(coach) {
  if (!coach) return 'pragmatic';
  return coach.style || COACH_STYLE[coach.id] || BY_PASSIVE[coach.passive] || 'pragmatic';
}

// What each club's owners and fans expect.
const CLUB_IDENTITY = {
  barcelona: 'tikiTaka', 'man-city': 'tikiTaka', ajax: 'totalFootball', bayern: 'totalFootball', flamengo: 'totalFootball',
  liverpool: 'gegenpress', dortmund: 'gegenpress', 'rb-leipzig': 'gegenpress', leverkusen: 'gegenpress',
  arsenal: 'controlled', milan: 'controlled', napoli: 'controlled', benfica: 'controlled', 'river-plate': 'controlled', 'real-sociedad': 'controlled',
  'real-madrid': 'pragmatic', chelsea: 'pragmatic', psg: 'pragmatic', palmeiras: 'pragmatic',
  atletico: 'catenaccio', inter: 'catenaccio', juventus: 'catenaccio',
  'man-united': 'counter', porto: 'counter', 'boca-juniors': 'counter', sevilla: 'counter',
  galatasaray: 'routeOne', 'athletic-club': 'routeOne', 'stoke-city': 'routeOne',
};
const OTHERS = ['pragmatic', 'counter', 'controlled', 'routeOne', 'gegenpress', 'catenaccio', 'pragmatic', 'counter'];
export function clubIdentity(club) {
  if (!club) return 'pragmatic';
  if (CLUB_IDENTITY[club.id]) return CLUB_IDENTITY[club.id];
  let h = 0;
  for (const ch of String(club.id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return OTHERS[h % OTHERS.length];
}
