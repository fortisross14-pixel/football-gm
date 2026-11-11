// Real-life domestic cups and super cups: Spain, England, Italy, Germany, France, Portugal, Netherlands.
// Same format as europe-leagues.js. Super cups are listed by the year the match was played.

const RM = 'real-madrid'; const BAR = 'barcelona'; const ATM = 'atletico'; const ATH = 'athletic'; const VAL = 'valencia';
const SEV = 'sevilla'; const RSO = 'real-sociedad'; const BET = 'betis'; const DEP = 'depor'; const ZAR = 'zaragoza'; const ESY = 'espanyol';
const RU = 'Real Unión';

const ARS = 'arsenal'; const LIV = 'liverpool'; const MUN = 'man-united'; const MCI = 'man-city'; const CHE = 'chelsea';
const EVE = 'everton'; const AVL = 'aston-villa'; const NEW = 'newcastle'; const TOT = 'tottenham'; const BLB = 'blackburn';
const WBA = 'west-brom'; const WOL = 'wolves'; const SHU = 'Sheffield United'; const WAN = 'Wanderers'; const BOL = 'Bolton Wanderers';
const WHU = 'west-ham'; const SHW = 'sheffield-wednesday';

const JUV = 'juventus'; const INT = 'inter'; const MIL = 'milan'; const TOR = 'torino'; const ROM = 'roma'; const NAP = 'napoli';
const LAZ = 'lazio'; const FIO = 'fiorentina'; const SAM = 'sampdoria'; const PAR = 'parma'; const BGN = 'bologna';

const BAY = 'bayern'; const BVB = 'dortmund'; const NUR = 'nurnberg'; const S04 = 'schalke'; const HSV = 'hamburg'; const VFB = 'stuttgart';
const BMG = 'gladbach'; const SVW = 'werder-bremen'; const FCK = 'kaiserslautern'; const KOE = 'koln'; const SGE = 'frankfurt';
const F95 = 'fortuna-dusseldorf'; const M60 = 'munich-1860'; const B04 = 'leverkusen'; const RBL = 'leipzig'; const WOB = 'wolfsburg';

const PSG = 'psg'; const OM = 'marseille'; const STE = 'saint-etienne'; const NAN = 'nantes'; const MON = 'monaco'; const LYO = 'lyon';
const BOR = 'bordeaux'; const NIC = 'nice'; const LIL = 'lille'; const REI = 'Stade de Reims'; const SOC = 'sochaux'; const SET = 'FC Sète';
const RAC = 'Racing Paris'; const RS = 'Red Star'; const STR = 'strasbourg'; const AUX = 'auxerre'; const MTP = 'montpellier';

const BEN = 'benfica'; const POR = 'porto'; const SCP = 'sporting-cp'; const BOA = 'boavista'; const BEL = 'belenenses';
const VSE = 'vitoria-setubal'; const BRA = 'braga';
const AJA = 'ajax'; const PSV = 'psv'; const FEY = 'feyenoord'; const AZ = 'az'; const TWE = 'twente'; const UTR = 'utrecht';
const SPA = 'sparta-rotterdam'; const ADO = 'ado-den-haag';
const _ = null;

export const HISTORY = {
  'C:ESP': {
    name: 'Copa del Rey', from: 1903,
    w: [ATH, ATH, RM, RM, RM, RM, RSO,
      /* 1910 */ [ATH, BAR], ATH, BAR, [BAR, 'Racing de Irún'], ATH, ATH, ATH, RM, RU, 'Arenas Club',
      /* 1920 */ BAR, ATH, BAR, ATH, RU, BAR, BAR, RU, BAR, ESY,
      /* 1930 */ ATH, ATH, ATH, ATH, RM, SEV, RM, _, _, SEV,
      /* 1940 */ ESY, VAL, BAR, ATH, ATH, ATH, RM, RM, SEV, VAL,
      /* 1950 */ ATH, BAR, BAR, BAR, VAL, ATH, ATH, BAR, ATH, BAR,
      /* 1960 */ ATM, ATM, RM, BAR, ZAR, ATM, ZAR, VAL, BAR, ATH,
      /* 1970 */ RM, BAR, ATM, ATH, RM, RM, ATM, BET, BAR, VAL,
      /* 1980 */ RM, BAR, RM, BAR, ATH, ATM, ZAR, RSO, BAR, RM,
      /* 1990 */ BAR, ATM, ATM, RM, ZAR, DEP, ATM, BAR, BAR, VAL,
      /* 2000 */ ESY, ZAR, DEP, 'mallorca', ZAR, BET, ESY, SEV, VAL, BAR,
      /* 2010 */ SEV, RM, BAR, ATM, RM, BAR, BAR, BAR, BAR, VAL,
      /* 2020 */ RSO, BAR, BET, RM, ATH, BAR, RSO],
  },
  'S:ESP': {
    name: 'Supercopa de España', from: 1982,
    w: [RSO, BAR, ATH, ATM, _, _, RM, RM,
      /* 1990 */ RM, BAR, BAR, RM, BAR, DEP, BAR, RM, 'mallorca', VAL,
      /* 2000 */ DEP, RM, DEP, RM, ZAR, BAR, BAR, SEV, RM, BAR,
      /* 2010 */ BAR, BAR, RM, BAR, ATM, ATH, BAR, RM, BAR, _,
      /* 2020 */ RM, ATH, RM, BAR, RM, BAR, BAR],
  },
  'C:ENG': {
    name: 'FA Cup', from: 1872,
    w: [WAN, WAN, 'Oxford University', 'Royal Engineers', WAN, WAN, WAN, 'Old Etonians',
      /* 1880 */ 'Clapham Rovers', 'Old Carthusians', 'Old Etonians', 'Blackburn Olympic', BLB, BLB, BLB, AVL, WBA, 'Preston North End',
      /* 1890 */ BLB, BLB, WBA, WOL, 'Notts County', AVL, SHW, AVL, 'nottm-forest', SHU,
      /* 1900 */ 'Bury', TOT, SHU, 'Bury', MCI, AVL, EVE, SHW, WOL, MUN,
      /* 1910 */ NEW, 'Bradford City', 'Barnsley', AVL, 'burnley', SHU, _, _, _, _,
      /* 1920 */ AVL, TOT, 'Huddersfield Town', BOL, NEW, SHU, BOL, 'Cardiff City', BLB, BOL,
      /* 1930 */ ARS, WBA, NEW, EVE, MCI, SHW, ARS, 'sunderland', 'Preston North End', 'Portsmouth',
      /* 1940 */ _, _, _, _, _, _, 'derby', 'Charlton Athletic', MUN, WOL,
      /* 1950 */ ARS, NEW, NEW, 'Blackpool', WBA, NEW, MCI, AVL, BOL, 'nottm-forest',
      /* 1960 */ WOL, TOT, TOT, MUN, WHU, LIV, EVE, TOT, WBA, MCI,
      /* 1970 */ CHE, ARS, 'leeds', 'sunderland', LIV, WHU, 'southampton', MUN, 'ipswich', ARS,
      /* 1980 */ WHU, TOT, TOT, MUN, EVE, MUN, LIV, 'Coventry City', 'Wimbledon', LIV,
      /* 1990 */ MUN, TOT, LIV, ARS, MUN, EVE, MUN, CHE, ARS, MUN,
      /* 2000 */ CHE, LIV, ARS, ARS, MUN, ARS, LIV, CHE, 'Portsmouth', CHE,
      /* 2010 */ CHE, MCI, CHE, 'Wigan Athletic', ARS, ARS, MUN, ARS, CHE, MCI,
      /* 2020 */ ARS, 'leicester', LIV, MCI, MUN, 'crystal-palace', MCI],
  },
  'S:ENG': {
    name: 'Community Shield', from: 1974, note: 'From 1974; shared shields list both clubs.',
    w: [LIV, 'derby', LIV, [LIV, MUN], 'nottm-forest', LIV,
      /* 1980 */ LIV, [AVL, TOT], LIV, MUN, EVE, EVE, [EVE, LIV], EVE, LIV, LIV,
      /* 1990 */ [LIV, MUN], [ARS, TOT], 'leeds', MUN, MUN, EVE, MUN, MUN, ARS, ARS,
      /* 2000 */ CHE, LIV, ARS, MUN, ARS, CHE, LIV, MUN, MUN, CHE,
      /* 2010 */ MUN, MUN, MCI, MUN, ARS, ARS, MUN, ARS, MCI, MCI,
      /* 2020 */ ARS, 'leicester', LIV, ARS, MUN, 'crystal-palace'],
  },
  'C:ITA': {
    name: 'Coppa Italia', from: 1922,
    w: ['Vado', _, _, _, _, _, _, _,
      /* 1930 */ _, _, _, _, _, _, TOR, 'genoa', JUV, INT,
      /* 1940 */ FIO, 'venezia', JUV, TOR, _, _, _, _, _, _,
      /* 1950 */ _, _, _, _, _, _, _, _, LAZ, JUV,
      /* 1960 */ JUV, FIO, NAP, 'atalanta', ROM, JUV, FIO, MIL, TOR, ROM,
      /* 1970 */ BGN, TOR, MIL, MIL, BGN, FIO, NAP, MIL, INT, JUV,
      /* 1980 */ ROM, ROM, INT, JUV, ROM, SAM, ROM, NAP, SAM, SAM,
      /* 1990 */ JUV, ROM, PAR, TOR, SAM, JUV, FIO, 'vicenza', LAZ, PAR,
      /* 2000 */ LAZ, FIO, PAR, MIL, LAZ, INT, INT, ROM, ROM, LAZ,
      /* 2010 */ INT, INT, NAP, LAZ, NAP, JUV, JUV, JUV, JUV, LAZ,
      /* 2020 */ NAP, JUV, INT, INT, JUV, BGN, INT],
  },
  'S:ITA': {
    name: 'Supercoppa Italiana', from: 1988, note: 'By edition year (some were played the following January).',
    w: [MIL, INT,
      /* 1990 */ NAP, SAM, MIL, MIL, MIL, JUV, FIO, JUV, LAZ, PAR,
      /* 2000 */ LAZ, ROM, JUV, JUV, MIL, INT, INT, ROM, INT, LAZ,
      /* 2010 */ INT, MIL, JUV, JUV, NAP, JUV, MIL, LAZ, JUV, LAZ,
      /* 2020 */ JUV, INT, INT, INT, MIL, NAP],
  },
  'C:GER': {
    name: 'DFB-Pokal', from: 1935,
    w: [NUR, 'VfB Leipzig', S04, 'rapid-wien', NUR,
      /* 1940 */ 'Dresdner SC', 'Dresdner SC', M60, 'First Vienna', _, _, _, _, _, _,
      /* 1950 */ _, _, _, 'Rot-Weiss Essen', VFB, 'karlsruhe', 'karlsruhe', BAY, VFB, 'Schwarz-Weiß Essen',
      /* 1960 */ BMG, SVW, NUR, HSV, M60, BVB, BAY, BAY, KOE, BAY,
      /* 1970 */ 'Kickers Offenbach', BAY, S04, BMG, SGE, SGE, HSV, KOE, KOE, F95,
      /* 1980 */ F95, SGE, BAY, KOE, BAY, 'Bayer Uerdingen', BAY, HSV, SGE, BVB,
      /* 1990 */ FCK, SVW, 'hannover', B04, SVW, BMG, FCK, VFB, BAY, SVW,
      /* 2000 */ BAY, S04, S04, BAY, SVW, BAY, BAY, NUR, BAY, SVW,
      /* 2010 */ BAY, S04, BVB, BAY, BAY, WOB, BAY, BVB, SGE, BAY,
      /* 2020 */ BAY, BVB, RBL, RBL, B04, VFB, BAY],
  },
  'S:GER': {
    name: 'DFL-Supercup', from: 1987, note: 'Not held 1997–2009.',
    w: [BAY, SVW, BVB,
      /* 1990 */ BAY, FCK, VFB, SVW, SVW, BVB, BVB, _, _, _,
      /* 2000 */ _, _, _, _, _, _, _, _, _, _,
      /* 2010 */ BAY, S04, BAY, BVB, BVB, WOB, BAY, BAY, BAY, BVB,
      /* 2020 */ BAY, BAY, BAY, RBL, B04, BAY],
  },
  'C:FRA': {
    name: 'Coupe de France', from: 1918, note: '1992 not awarded (Furiani disaster).',
    w: ['Olympique de Pantin', 'CASG Paris',
      /* 1920 */ 'CA Paris', RS, RS, RS, OM, 'CASG Paris', OM, OM, RS, MTP,
      /* 1930 */ SET, 'Club Français', 'AS Cannes', 'Excelsior Roubaix', SET, OM, RAC, SOC, OM, RAC,
      /* 1940 */ RAC, BOR, RS, OM, 'ÉF Nancy-Lorraine', RAC, LIL, LIL, LIL, RAC,
      /* 1950 */ REI, STR, NIC, LIL, NIC, LIL, 'CS Sedan', 'Toulouse FC (1937)', REI, 'le-havre',
      /* 1960 */ MON, 'CS Sedan', STE, MON, LYO, 'rennes', STR, LYO, STE, OM,
      /* 1970 */ STE, 'rennes', OM, LYO, STE, STE, OM, STE, 'AS Nancy', NAN,
      /* 1980 */ MON, 'SC Bastia', PSG, PSG, 'FC Metz', MON, BOR, BOR, 'FC Metz', OM,
      /* 1990 */ MTP, MON, _, PSG, AUX, PSG, AUX, NIC, PSG, NAN,
      /* 2000 */ NAN, STR, 'lorient', AUX, PSG, AUX, PSG, SOC, LYO, 'EA Guingamp',
      /* 2010 */ PSG, LIL, LYO, BOR, 'EA Guingamp', PSG, PSG, PSG, PSG, 'rennes',
      /* 2020 */ PSG, PSG, NAN, 'toulouse', PSG, PSG, 'lens'],
  },
  'S:FRA': {
    name: 'Trophée des Champions', from: 1995, note: 'From 1995 (earlier editions not listed).',
    w: [PSG, _, MON, PSG, NAN,
      /* 2000 */ MON, NAN, LYO, LYO, LYO, LYO, LYO, LYO, BOR, BOR,
      /* 2010 */ OM, OM, LYO, PSG, PSG, PSG, PSG, PSG, PSG, PSG,
      /* 2020 */ PSG, LIL, PSG, PSG, PSG, PSG],
  },
  'C:POR': {
    name: 'Taça de Portugal', from: 1939,
    w: ['Académica',
      /* 1940 */ BEN, SCP, BEL, BEN, BEN, SCP, SCP, _, SCP, BEN,
      /* 1950 */ _, BEN, BEN, BEN, SCP, BEN, POR, BEN, POR, BEN,
      /* 1960 */ BEL, 'Leixões', BEN, SCP, BEN, VSE, BRA, VSE, POR, BEN,
      /* 1970 */ BEN, SCP, BEN, SCP, SCP, BOA, BOA, POR, SCP, BOA,
      /* 1980 */ BEN, BEN, SCP, BEN, POR, BEN, BEN, BEN, POR, BEL,
      /* 1990 */ 'estrela-amadora', POR, BOA, BEN, POR, SCP, BEN, BOA, POR, 'Beira-Mar',
      /* 2000 */ POR, POR, SCP, POR, BEN, VSE, POR, SCP, SCP, POR,
      /* 2010 */ POR, POR, 'Académica', 'vitoria-sc', BEN, SCP, BRA, BEN, 'Desportivo das Aves', SCP,
      /* 2020 */ POR, BRA, POR, POR, POR, SCP, 'Torreense'],
  },
  'S:POR': {
    name: 'Supertaça Cândido de Oliveira', from: 1979,
    w: [BOA,
      /* 1980 */ BEN, POR, SCP, POR, POR, BEN, POR, SCP, 'vitoria-sc', BEN,
      /* 1990 */ POR, POR, BOA, POR, POR, SCP, POR, BOA, POR, POR,
      /* 2000 */ SCP, POR, SCP, POR, POR, BEN, POR, SCP, SCP, POR,
      /* 2010 */ POR, POR, POR, POR, BEN, SCP, BEN, BEN, POR, BEN,
      /* 2020 */ POR, SCP, POR, BEN, POR, BEN],
  },
  'C:NED': {
    name: 'KNVB Cup', from: 1957, note: 'From 1957 (earlier editions not listed).',
    w: ["Fortuna '54", SPA, 'VVV-Venlo',
      /* 1960 */ _, AJA, SPA, 'willem-ii', "Fortuna '54", FEY, SPA, AJA, ADO, FEY,
      /* 1970 */ AJA, AJA, AJA, 'nac-breda', PSV, ADO, PSV, TWE, AZ, AJA,
      /* 1980 */ FEY, AZ, AZ, AJA, FEY, UTR, AJA, AJA, PSV, PSV,
      /* 1990 */ PSV, FEY, FEY, AJA, FEY, FEY, PSV, 'Roda JC', AJA, AJA,
      /* 2000 */ 'Roda JC', TWE, AJA, UTR, UTR, PSV, AJA, AJA, FEY, 'heerenveen',
      /* 2010 */ AJA, TWE, PSV, AZ, 'pec-zwolle', 'groningen', FEY, 'vitesse', FEY, AJA,
      /* 2020 */ _, AJA, PSV, PSV, FEY, 'go-ahead-eagles', AZ],
  },
  'S:NED': {
    name: 'Johan Cruyff Shield', from: 1991,
    w: [FEY, PSV, AJA, AJA, AJA, PSV, PSV, PSV, FEY,
      /* 2000 */ PSV, PSV, AJA, PSV, UTR, AJA, AJA, AJA, PSV, AZ,
      /* 2010 */ TWE, TWE, PSV, AJA, 'pec-zwolle', PSV, PSV, FEY, FEY, AJA,
      /* 2020 */ _, PSV, PSV, PSV, FEY, PSV],
  },
};
