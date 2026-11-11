// Real-life league champions, top five European leagues plus Portugal and the Netherlands.
//
// Format (all history files): competition key → { name, from, w, note? }.
// w[i] is the winner of the season that ended in year from + i:
//   'club-id'  a club of our world (lowercase, hyphens);
//   'Name'     a club outside our world (shown as a name, never counted for a world club);
//   null       not held / not awarded;
//   [a, b]     several titles that year (split seasons, shared titles).
// Seasons are named by the year they end in (2025–26 = 2026); the game's first season is 2027.

const RM = 'real-madrid'; const BAR = 'barcelona'; const ATM = 'atletico'; const ATH = 'athletic';
const VAL = 'valencia'; const SEV = 'sevilla'; const RSO = 'real-sociedad'; const BET = 'betis'; const DEP = 'depor';

const ARS = 'arsenal'; const LIV = 'liverpool'; const MUN = 'man-united'; const MCI = 'man-city'; const CHE = 'chelsea';
const EVE = 'everton'; const AVL = 'aston-villa'; const SUN = 'sunderland'; const NEW = 'newcastle'; const SHW = 'sheffield-wednesday';
const BLB = 'blackburn'; const WOL = 'wolves'; const LEE = 'leeds'; const DER = 'derby'; const BUR = 'burnley'; const TOT = 'tottenham';
const PNE = 'Preston North End'; const HUD = 'Huddersfield Town'; const POM = 'Portsmouth';

const JUV = 'juventus'; const INT = 'inter'; const MIL = 'milan'; const GEN = 'genoa'; const TOR = 'torino'; const BOL = 'bologna';
const ROM = 'roma'; const NAP = 'napoli'; const LAZ = 'lazio'; const FIO = 'fiorentina'; const PV = 'Pro Vercelli';

const BAY = 'bayern'; const BVB = 'dortmund'; const NUR = 'nurnberg'; const S04 = 'schalke'; const HSV = 'hamburg'; const VFB = 'stuttgart';
const BMG = 'gladbach'; const SVW = 'werder-bremen'; const FCK = 'kaiserslautern'; const KOE = 'koln'; const FUE = 'SpVgg Fürth';

const PSG = 'psg'; const OM = 'marseille'; const STE = 'saint-etienne'; const NAN = 'nantes'; const MON = 'monaco'; const LYO = 'lyon';
const BOR = 'bordeaux'; const NIC = 'nice'; const LIL = 'lille'; const REI = 'Stade de Reims'; const SOC = 'sochaux'; const SET = 'FC Sète';

const BEN = 'benfica'; const POR = 'porto'; const SCP = 'sporting-cp';
const AJA = 'ajax'; const PSV = 'psv'; const FEY = 'feyenoord'; const GAE = 'go-ahead-eagles'; const ADO = 'ado-den-haag';
const _ = null;

export const HISTORY = {
  'L:esp-1': {
    name: 'LaLiga', from: 1929,
    w: [BAR, /* 1930 */ ATH, ATH, RM, RM, ATH, BET, ATH, _, _, _,
      /* 1940 */ ATM, ATM, VAL, ATH, VAL, BAR, SEV, VAL, BAR, BAR,
      /* 1950 */ ATM, ATM, BAR, BAR, RM, RM, ATH, RM, RM, BAR,
      /* 1960 */ BAR, RM, RM, RM, RM, RM, ATM, RM, RM, RM,
      /* 1970 */ ATM, VAL, RM, ATM, BAR, RM, RM, ATM, RM, RM,
      /* 1980 */ RM, RSO, RSO, ATH, ATH, BAR, RM, RM, RM, RM,
      /* 1990 */ RM, BAR, BAR, BAR, BAR, RM, ATM, RM, BAR, BAR,
      /* 2000 */ DEP, RM, VAL, RM, VAL, BAR, BAR, RM, RM, BAR,
      /* 2010 */ BAR, BAR, RM, BAR, ATM, BAR, BAR, RM, BAR, BAR,
      /* 2020 */ RM, ATM, RM, BAR, RM, BAR, BAR],
  },
  'L:eng-1': {
    name: 'English champions', from: 1889, note: 'First Division until 1992, Premier League since.',
    w: [PNE, /* 1890 */ PNE, EVE, SUN, SUN, AVL, SUN, AVL, AVL, 'Sheffield United', AVL,
      /* 1900 */ AVL, LIV, SUN, SHW, SHW, NEW, LIV, NEW, MUN, NEW,
      /* 1910 */ AVL, MUN, BLB, SUN, BLB, EVE, _, _, _, _,
      /* 1920 */ 'west-brom', BUR, LIV, LIV, HUD, HUD, HUD, NEW, EVE, SHW,
      /* 1930 */ SHW, ARS, EVE, ARS, ARS, ARS, SUN, MCI, ARS, EVE,
      /* 1940 */ _, _, _, _, _, _, _, LIV, ARS, POM,
      /* 1950 */ POM, TOT, MUN, ARS, WOL, CHE, MUN, MUN, WOL, WOL,
      /* 1960 */ BUR, TOT, 'ipswich', EVE, LIV, MUN, LIV, MUN, MCI, LEE,
      /* 1970 */ EVE, ARS, DER, LIV, LEE, DER, LIV, LIV, 'nottm-forest', LIV,
      /* 1980 */ LIV, AVL, LIV, LIV, LIV, EVE, LIV, EVE, LIV, ARS,
      /* 1990 */ LIV, ARS, LEE, MUN, MUN, BLB, MUN, MUN, ARS, MUN,
      /* 2000 */ MUN, MUN, ARS, MUN, ARS, CHE, CHE, MUN, MUN, MUN,
      /* 2010 */ CHE, MUN, MCI, MUN, MCI, CHE, 'leicester', CHE, MCI, MCI,
      /* 2020 */ LIV, MCI, MCI, MCI, MCI, LIV, ARS],
  },
  'L:ita-1': {
    name: 'Serie A', from: 1898, note: '1927 (Torino) and 2005 (Juventus) revoked; 1922 had two champions.',
    w: [GEN, GEN, /* 1900 */ GEN, MIL, GEN, GEN, GEN, JUV, MIL, MIL, PV, PV,
      /* 1910 */ INT, PV, PV, PV, 'Casale', GEN, _, _, _, _,
      /* 1920 */ INT, PV, [PV, 'Novese'], GEN, GEN, BOL, JUV, _, TOR, BOL,
      /* 1930 */ INT, JUV, JUV, JUV, JUV, JUV, BOL, BOL, INT, BOL,
      /* 1940 */ INT, BOL, ROM, TOR, _, _, TOR, TOR, TOR, TOR,
      /* 1950 */ JUV, MIL, JUV, INT, INT, MIL, FIO, MIL, JUV, MIL,
      /* 1960 */ JUV, JUV, MIL, INT, BOL, INT, INT, JUV, MIL, FIO,
      /* 1970 */ 'cagliari', INT, JUV, JUV, LAZ, JUV, TOR, JUV, JUV, MIL,
      /* 1980 */ INT, JUV, JUV, ROM, JUV, 'verona', JUV, NAP, MIL, INT,
      /* 1990 */ NAP, 'sampdoria', MIL, MIL, MIL, JUV, MIL, JUV, JUV, MIL,
      /* 2000 */ LAZ, ROM, JUV, JUV, MIL, _, INT, INT, INT, INT,
      /* 2010 */ INT, MIL, JUV, JUV, JUV, JUV, JUV, JUV, JUV, JUV,
      /* 2020 */ JUV, INT, MIL, NAP, INT, NAP, INT],
  },
  'L:ger-1': {
    name: 'German champions', from: 1903, note: 'German championship until 1963, Bundesliga since.',
    w: ['VfB Leipzig', _, 'Union 92 Berlin', 'VfB Leipzig', 'Freiburger FC', 'Viktoria Berlin', 'Phönix Karlsruhe',
      /* 1910 */ 'Karlsruher FV', 'Viktoria Berlin', 'Holstein Kiel', 'VfB Leipzig', FUE, _, _, _, _, _,
      /* 1920 */ NUR, NUR, _, HSV, NUR, NUR, FUE, NUR, HSV, FUE,
      /* 1930 */ 'hertha', 'hertha', BAY, 'fortuna-dusseldorf', S04, S04, NUR, S04, 'hannover', S04,
      /* 1940 */ S04, 'rapid-wien', S04, 'Dresdner SC', 'Dresdner SC', _, _, _, NUR, 'VfR Mannheim',
      /* 1950 */ VFB, FCK, VFB, FCK, 'hannover', 'Rot-Weiss Essen', BVB, BVB, S04, 'frankfurt',
      /* 1960 */ HSV, NUR, KOE, BVB, KOE, SVW, 'munich-1860', 'braunschweig', NUR, BAY,
      /* 1970 */ BMG, BMG, BAY, BAY, BAY, BMG, BMG, BMG, KOE, HSV,
      /* 1980 */ BAY, BAY, HSV, HSV, VFB, BAY, BAY, BAY, SVW, BAY,
      /* 1990 */ BAY, FCK, VFB, SVW, BAY, BVB, BVB, BAY, FCK, BAY,
      /* 2000 */ BAY, BAY, BVB, BAY, SVW, BAY, BAY, VFB, BAY, 'wolfsburg',
      /* 2010 */ BAY, BVB, BVB, BAY, BAY, BAY, BAY, BAY, BAY, BAY,
      /* 2020 */ BAY, BAY, BAY, BAY, 'leverkusen', BAY, BAY],
  },
  'L:fra-1': {
    name: 'Ligue 1', from: 1933, note: '1993 title stripped from Marseille.',
    w: ['Olympique Lillois', SET, SOC, 'Racing Paris', OM, SOC, SET,
      /* 1940 */ _, _, _, _, _, _, LIL, 'CO Roubaix-Tourcoing', OM, REI,
      /* 1950 */ BOR, NIC, NIC, REI, LIL, REI, NIC, STE, REI, NIC,
      /* 1960 */ REI, MON, REI, MON, STE, NAN, NAN, STE, STE, STE,
      /* 1970 */ STE, OM, OM, NAN, STE, STE, STE, NAN, MON, 'strasbourg',
      /* 1980 */ NAN, STE, MON, NAN, BOR, BOR, PSG, BOR, MON, OM,
      /* 1990 */ OM, OM, OM, _, PSG, NAN, 'auxerre', MON, 'lens', BOR,
      /* 2000 */ MON, NAN, LYO, LYO, LYO, LYO, LYO, LYO, LYO, BOR,
      /* 2010 */ OM, LIL, 'montpellier', PSG, PSG, PSG, PSG, MON, PSG, PSG,
      /* 2020 */ PSG, LIL, PSG, PSG, PSG, PSG, PSG],
  },
  'L:por-1': {
    name: 'Primeira Liga', from: 1935,
    w: [POR, BEN, BEN, BEN, POR,
      /* 1940 */ POR, SCP, BEN, BEN, SCP, BEN, 'belenenses', SCP, SCP, SCP,
      /* 1950 */ BEN, SCP, SCP, SCP, SCP, BEN, POR, BEN, SCP, POR,
      /* 1960 */ BEN, BEN, SCP, BEN, BEN, BEN, SCP, BEN, BEN, BEN,
      /* 1970 */ SCP, BEN, BEN, BEN, SCP, BEN, BEN, BEN, POR, POR,
      /* 1980 */ SCP, BEN, SCP, BEN, BEN, POR, POR, BEN, POR, BEN,
      /* 1990 */ POR, BEN, POR, POR, BEN, POR, POR, POR, POR, POR,
      /* 2000 */ SCP, 'boavista', SCP, POR, POR, BEN, POR, POR, POR, POR,
      /* 2010 */ BEN, POR, POR, POR, BEN, BEN, BEN, BEN, POR, BEN,
      /* 2020 */ POR, SCP, POR, BEN, SCP, SCP, POR],
  },
  'L:ned-1': {
    name: 'Dutch champions', from: 1917, note: 'From 1917 (earlier titles not listed); 2020 abandoned.',
    w: [GAE, AJA, AJA,
      /* 1920 */ 'Be Quick 1887', 'nac-breda', GAE, 'RCH', FEY, 'HBS Craeyenhout', 'SC Enschede', 'heracles', FEY, PSV,
      /* 1930 */ GAE, AJA, AJA, GAE, AJA, PSV, FEY, AJA, FEY, AJA,
      /* 1940 */ FEY, 'heracles', ADO, ADO, 'De Volewijckers', _, 'HFC Haarlem', AJA, 'BVV', 'SVV',
      /* 1950 */ 'Limburgia', PSV, 'willem-ii', 'RCH', 'EVV Eindhoven', 'willem-ii', 'Rapid JC', AJA, 'DOS', 'sparta-rotterdam',
      /* 1960 */ AJA, FEY, FEY, PSV, 'DWS', FEY, AJA, AJA, AJA, FEY,
      /* 1970 */ AJA, FEY, AJA, AJA, FEY, PSV, PSV, AJA, PSV, AJA,
      /* 1980 */ AJA, 'az', AJA, AJA, FEY, AJA, PSV, PSV, PSV, PSV,
      /* 1990 */ AJA, PSV, PSV, FEY, AJA, AJA, AJA, PSV, AJA, FEY,
      /* 2000 */ PSV, PSV, AJA, PSV, AJA, PSV, PSV, PSV, PSV, 'az',
      /* 2010 */ 'twente', AJA, AJA, AJA, AJA, PSV, PSV, FEY, PSV, AJA,
      /* 2020 */ _, AJA, AJA, FEY, PSV, PSV, PSV],
  },
};
