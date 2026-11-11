// Real-life continental and world club competitions. Same format as europe-leagues.js.
// Keys: K:<conf> tier-1 continental cup, K2:<conf> second continental cup, KS:<conf> continental
// super cup, W = Intercontinental Cup (1960–2004) + FIFA Club World Cup (2000, 2005–) + FIFA Intercontinental Cup (2024–).
// Listed by the year of the final.

const RM = 'real-madrid'; const BAR = 'barcelona'; const ATM = 'atletico'; const SEV = 'sevilla'; const VAL = 'valencia';
const LIV = 'liverpool'; const MUN = 'man-united'; const CHE = 'chelsea'; const MCI = 'man-city'; const TOT = 'tottenham'; const NFO = 'nottm-forest';
const AVL = 'aston-villa';
const MIL = 'milan'; const INT = 'inter'; const JUV = 'juventus'; const PAR = 'parma';
const BAY = 'bayern'; const BVB = 'dortmund'; const HSV = 'hamburg'; const BMG = 'gladbach'; const SGE = 'frankfurt';
const AJA = 'ajax'; const FEY = 'feyenoord'; const PSV = 'psv'; const POR = 'porto'; const BEN = 'benfica'; const PSG = 'psg';
const AND = 'anderlecht'; const GOT = 'IFK Göteborg'; const STE = 'Steaua București'; const RSB = 'red-star-belgrade';

const PEN = 'penarol'; const NUR = 'nacional-uru'; const OLI = 'olimpia'; const IND = 'independiente'; const BOC = 'boca-juniors';
const RIV = 'river-plate'; const EST = 'estudiantes'; const RAC = 'racing-club'; const VEL = 'velez-sarsfield'; const SLO = 'san-lorenzo';
const SAN = 'santos'; const FLA = 'flamengo'; const SPF = 'sao-paulo'; const GRE = 'gremio'; const CRU = 'cruzeiro'; const INTB = 'internacional';
const COR = 'corinthians'; const PAL = 'palmeiras'; const CAM = 'atletico-mineiro'; const CAP = 'athletico-pr'; const FLU = 'fluminense';
const LDU = 'ldu-quito'; const IDV = 'independiente-del-valle'; const NAC = 'atletico-nacional'; const LAN = 'lanus';

const AME = 'america-mex'; const CAZ = 'cruz-azul'; const PAC = 'pachuca'; const MTY = 'monterrey'; const SAP = 'Saprissa';

const AHY = 'al-ahly'; const ZAM = 'zamalek'; const MAZ = 'tp-mazembe'; const EST_T = 'esperance'; const WYD = 'wydad'; const RAJ = 'raja-casablanca';
const ENY = 'enyimba'; const CAN = 'Canon Yaoundé'; const HAF = 'Hafia Conakry'; const SFX = 'CS Sfaxien'; const ESS = 'Étoile du Sahel'; const BRK = 'rs-berkane';

const HIL = 'al-hilal'; const ITT = 'al-ittihad'; const POH = 'pohang-steelers'; const URA = 'urawa-reds'; const ULS = 'ulsan-hd';
const KUW = 'Al-Kuwait'; const QWJ = 'Al-Quwa Al-Jawiya'; const AUC = 'Auckland City';
const _ = null;
const x = (id, n) => Array(n).fill(id);

export const HISTORY = {
  'K:europe': {
    name: 'European Cup / Champions League', from: 1956,
    w: [RM, RM, RM, RM,
      /* 1960 */ RM, BEN, BEN, MIL, INT, INT, RM, 'celtic', MUN, MIL,
      /* 1970 */ FEY, AJA, AJA, AJA, BAY, BAY, BAY, LIV, LIV, NFO,
      /* 1980 */ NFO, LIV, AVL, HSV, LIV, JUV, STE, POR, PSV, MIL,
      /* 1990 */ MIL, RSB, BAR, 'marseille', MIL, AJA, JUV, BVB, RM, MUN,
      /* 2000 */ RM, BAY, RM, MIL, POR, LIV, BAR, MIL, MUN, BAR,
      /* 2010 */ INT, BAR, CHE, BAY, RM, BAR, RM, RM, RM, LIV,
      /* 2020 */ BAY, CHE, RM, MCI, RM, PSG, PSG],
  },
  'K2:europe': {
    name: 'UEFA Cup / Europa League', from: 1972,
    w: [TOT, LIV, FEY, BMG, LIV, JUV, PSV, BMG,
      /* 1980 */ SGE, 'ipswich', GOT, AND, TOT, RM, RM, GOT, 'leverkusen', 'napoli',
      /* 1990 */ JUV, INT, AJA, JUV, INT, PAR, BAY, 'schalke', INT, PAR,
      /* 2000 */ 'galatasaray', LIV, FEY, POR, VAL, 'CSKA Moscow', SEV, SEV, 'Zenit', 'shakhtar-donetsk',
      /* 2010 */ ATM, POR, ATM, CHE, SEV, SEV, SEV, MUN, ATM, CHE,
      /* 2020 */ SEV, 'villarreal', SGE, SEV, 'atalanta', TOT, AVL],
  },
  'KS:europe': {
    name: 'UEFA Super Cup', from: 1973,
    w: [AJA, _, 'dynamo-kyiv', AND, LIV, AND, NFO,
      /* 1980 */ VAL, _, AVL, 'aberdeen', JUV, _, STE, POR, 'mechelen', MIL,
      /* 1990 */ MIL, MUN, BAR, PAR, MIL, AJA, JUV, BAR, CHE, 'lazio',
      /* 2000 */ 'galatasaray', LIV, RM, MIL, VAL, LIV, SEV, MIL, 'Zenit', BAR,
      /* 2010 */ ATM, BAR, ATM, BAY, RM, BAR, RM, RM, ATM, LIV,
      /* 2020 */ BAY, CHE, RM, MCI, RM, PSG],
  },
  W: {
    name: 'Intercontinental Cup / Club World Cup', from: 1960, note: '2000 and 2025 had both a Club World Cup and an Intercontinental final.',
    w: [RM, PEN, SAN, SAN, INT, INT, PEN, RAC, EST, MIL,
      /* 1970 */ FEY, NUR, AJA, IND, ATM, _, BAY, BOC, _, OLI,
      /* 1980 */ NUR, FLA, PEN, GRE, IND, JUV, RIV, POR, NUR, MIL,
      /* 1990 */ MIL, RSB, SPF, SPF, VEL, AJA, JUV, BVB, RM, MUN,
      /* 2000 */ [COR, BOC], BAY, RM, BOC, POR, SPF, INTB, MIL, MUN, BAR,
      /* 2010 */ INT, BAR, COR, BAY, RM, BAR, RM, RM, RM, LIV,
      /* 2020 */ BAY, CHE, RM, MCI, RM, [CHE, PSG]],
  },
  'K:southamerica': {
    name: 'Copa Libertadores', from: 1960,
    w: [PEN, PEN, SAN, SAN, IND, IND, PEN, RAC, EST, EST,
      /* 1970 */ EST, NUR, IND, IND, IND, IND, CRU, BOC, BOC, OLI,
      /* 1980 */ NUR, FLA, PEN, GRE, IND, 'argentinos-juniors', RIV, PEN, NUR, NAC,
      /* 1990 */ OLI, 'colo-colo', SPF, SPF, VEL, GRE, RIV, CRU, 'vasco-da-gama', PAL,
      /* 2000 */ BOC, BOC, OLI, BOC, 'once-caldas', SPF, INTB, BOC, LDU, EST,
      /* 2010 */ INTB, SAN, COR, CAM, SLO, RIV, NAC, GRE, RIV, FLA,
      /* 2020 */ PAL, PAL, FLA, FLU, 'botafogo', FLA],
  },
  'K2:southamerica': {
    name: 'Copa Sudamericana', from: 2002,
    w: [SLO, 'Cienciano', BOC, BOC, PAC, 'Arsenal de Sarandí', INTB, LDU,
      /* 2010 */ IND, 'universidad-de-chile', SPF, LAN, RIV, 'santa-fe-col', 'Chapecoense', IND, CAP, IDV,
      /* 2020 */ 'Defensa y Justicia', CAP, IDV, LDU, RAC, LAN],
  },
  'KS:southamerica': {
    name: 'Recopa Sudamericana', from: 1989, note: 'Not held 1999–2002.',
    w: [NUR,
      /* 1990 */ BOC, OLI, 'colo-colo', SPF, SPF, IND, GRE, VEL, CRU, _,
      /* 2000 */ _, _, _, OLI, 'Cienciano', BOC, BOC, INTB, BOC, LDU,
      /* 2010 */ LDU, INTB, SAN, COR, CAM, RIV, RIV, NAC, GRE, RIV,
      /* 2020 */ FLA, 'Defensa y Justicia', PAL, IDV, FLU, RAC],
  },
  'K:northamerica': {
    name: 'CONCACAF Champions Cup', from: 1990, note: 'From 1990 (earlier editions not listed).',
    w: [AME, 'puebla', AME, SAP, 'Cartaginés', SAP, CAZ, CAZ, 'dc-united', 'necaxa',
      /* 2000 */ 'la-galaxy', _, PAC, 'toluca', 'Alajuelense', SAP, AME, PAC, PAC, 'atlante',
      /* 2010 */ PAC, MTY, MTY, MTY, CAZ, AME, AME, PAC, 'guadalajara', MTY,
      /* 2020 */ 'tigres-uanl', MTY, 'seattle-sounders', 'leon', PAC, CAZ, 'toluca'],
  },
  'K2:northamerica': {
    name: 'Leagues Cup', from: 2019,
    w: [CAZ, _, 'leon', _, 'inter-miami', 'columbus-crew', 'seattle-sounders', 'toluca'],
  },
  'K:africa': {
    name: 'CAF Champions League', from: 1965, note: 'African Cup of Champions Clubs until 1996.',
    w: ['Oryx Douala', 'Stade Abidjan', MAZ, MAZ, 'ismaily',
      /* 1970 */ 'Asante Kotoko', CAN, HAF, 'AS Vita Club', 'CARA Brazzaville', HAF, 'mc-alger', HAF, CAN, 'Union Douala',
      /* 1980 */ CAN, 'JE Tizi Ouzou', AHY, 'Asante Kotoko', ZAM, 'AS FAR', ZAM, AHY, 'Entente Sétif', RAJ,
      /* 1990 */ 'JS Kabylie', 'Club Africain', WYD, ZAM, EST_T, 'orlando-pirates', ZAM, RAJ, 'ASEC Mimosas', RAJ,
      /* 2000 */ 'Hearts of Oak', AHY, ZAM, ENY, ENY, AHY, AHY, ESS, AHY, MAZ,
      /* 2010 */ MAZ, EST_T, AHY, AHY, 'Entente Sétif', MAZ, 'mamelodi-sundowns', WYD, EST_T, EST_T,
      /* 2020 */ AHY, AHY, WYD, AHY, AHY, 'pyramids', 'mamelodi-sundowns'],
  },
  'K2:africa': {
    name: 'CAF Confederation Cup', from: 2004,
    w: ['Hearts of Oak', 'AS FAR', ESS, SFX, SFX, 'Stade Malien',
      /* 2010 */ 'FUS Rabat', 'MAS Fès', 'AC Léopards', SFX, AHY, ESS, MAZ, MAZ, RAJ, ZAM,
      /* 2020 */ BRK, RAJ, BRK, 'USM Alger', ZAM, BRK],
  },
  'K:asia': {
    name: 'AFC Champions League', from: 1985, note: 'From 1985–86 (earlier editions not listed). Listed by the year of the final.',
    w: ['Daewoo Royals', 'Furukawa Electric', 'tokyo-verdy', 'al-sadd', 'Al-Rasheed',
      /* 1990 */ 'Liaoning', 'esteghlal', HIL, 'PAS Tehran', 'Thai Farmers Bank', 'Thai Farmers Bank', 'Ilhwa Chunma', POH, POH, 'jubilo-iwata',
      /* 2000 */ HIL, 'Suwon Samsung Bluewings', 'Suwon Samsung Bluewings', 'al-ain', ITT, ITT, 'jeonbuk-hyundai', URA, 'gamba-osaka', POH,
      /* 2010 */ 'Seongnam', 'al-sadd', ULS, 'guangzhou-fc', 'Western Sydney Wanderers', 'guangzhou-fc', 'jeonbuk-hyundai', URA, 'kashima-antlers', HIL,
      /* 2020 */ ULS, HIL, _, URA, 'al-ain', 'al-ahli-sau', 'al-ahli-sau'],
  },
  'K2:asia': {
    name: 'AFC Cup / Champions League Two', from: 2004, note: 'Listed by the year of the final.',
    w: ['Al-Jaish', 'Al-Faisaly', 'Al-Faisaly', 'Shabab Al-Ordon', 'Al-Muharraq', KUW,
      /* 2010 */ 'Al-Ittihad Aleppo', 'Nasaf', KUW, KUW, 'Al-Qadsia', "Johor Darul Ta'zim", QWJ, QWJ, QWJ, 'Al-Ahed',
      /* 2020 */ _, 'Al-Muharraq', 'Al-Seeb', _, 'Central Coast Mariners', 'sharjah'],
  },
  'K:oceania': {
    name: 'OFC Champions League', from: 2007, note: 'From 2007 (earlier editions not listed); 2020 and 2021 not completed.',
    w: ['Waitakere United', 'Waitakere United', AUC,
      /* 2010 */ 'Hekari United', ...x(AUC, 7), 'Team Wellington', 'Hienghène Sport',
      /* 2020 */ _, _, AUC, AUC, AUC, AUC],
  },
};
