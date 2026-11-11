// Real-life champions in the Americas: leagues, cups and super cups of the countries in our world.
// Same format as europe-leagues.js. Calendar-year leagues use the calendar year; years with
// Apertura/Clausura (or Metropolitano/Nacional) tournaments list every champion of that year.

const RIV = 'river-plate'; const BOC = 'boca-juniors'; const IND = 'independiente'; const RAC = 'racing-club'; const SLO = 'san-lorenzo';
const EST = 'estudiantes'; const VEL = 'velez-sarsfield'; const ROS = 'rosario-central'; const NOB = 'newells-old-boys';
const HUR = 'huracan'; const FER = 'ferro-carril-oeste'; const ARJ = 'argentinos-juniors'; const LAN = 'lanus';

const PAL = 'palmeiras'; const SAN = 'santos'; const FLA = 'flamengo'; const COR = 'corinthians'; const SPF = 'sao-paulo';
const CRU = 'cruzeiro'; const FLU = 'fluminense'; const VAS = 'vasco-da-gama'; const INT = 'internacional'; const GRE = 'gremio';
const BOT = 'botafogo'; const CAM = 'atletico-mineiro'; const CAP = 'athletico-pr';

const AME = 'america-mex'; const GDL = 'guadalajara'; const TOL = 'toluca'; const CAZ = 'cruz-azul'; const TIG = 'tigres-uanl';
const UNAM = 'pumas-unam'; const LEO = 'leon'; const PAC = 'pachuca'; const MTY = 'monterrey'; const SNT = 'santos-laguna'; const VER = 'veracruz';

const DCU = 'dc-united'; const LAG = 'la-galaxy'; const CLB = 'columbus-crew'; const SEA = 'seattle-sounders'; const LAFC = 'lafc';
const SKC = 'Sporting Kansas City'; const CHF = 'Chicago Fire'; const HOU = 'Houston Dynamo';

const NAC = 'atletico-nacional'; const MIL = 'millonarios'; const AMC = 'america-cali'; const SFE = 'santa-fe-col'; const CAL = 'deportivo-cali';
const JUN = 'junior-col'; const MED = 'independiente-medellin'; const TOLC = 'deportes-tolima'; const ONC = 'once-caldas';

const COL = 'colo-colo'; const UCH = 'universidad-de-chile'; const UC = 'universidad-catolica'; const COB = 'cobreloa';
const UES = 'union-espanola'; const AUD = 'audax-italiano'; const EVT = 'everton-chi'; const SW = 'santiago-wanderers';
const PALC = 'palestino'; const MAG = 'Magallanes'; const HUA = 'Huachipato';
const _ = null;

export const HISTORY = {
  'L:arg-1': {
    name: 'Argentine champions', from: 1931, note: 'Professional era, from 1931 (amateur titles not listed).',
    w: [BOC, RIV, SLO, BOC, BOC, [RIV, SLO], RIV, IND, IND,
      /* 1940 */ BOC, RIV, RIV, BOC, BOC, RIV, SLO, RIV, IND, RAC,
      /* 1950 */ RAC, RAC, RIV, RIV, BOC, RIV, RIV, RIV, RAC, SLO,
      /* 1960 */ IND, RAC, BOC, IND, BOC, BOC, RAC, [EST, IND], [SLO, VEL], ['Chacarita Juniors', BOC],
      /* 1970 */ [IND, BOC], [IND, ROS], [SLO, SLO], [HUR, ROS], [NOB, SLO], [RIV, RIV], [BOC, BOC], [RIV, IND], ['Quilmes', IND], [RIV, RIV],
      /* 1980 */ [RIV, ROS], [BOC, RIV], [EST, FER], [IND, EST], [ARJ, FER], ARJ, RIV, ROS, NOB, IND,
      /* 1990 */ RIV, [NOB, RIV], [NOB, BOC], [VEL, RIV], [IND, RIV], [SLO, VEL], [VEL, RIV], [RIV, RIV], [VEL, BOC], [BOC, RIV],
      /* 2000 */ [RIV, BOC], [SLO, RAC], [RIV, IND], [RIV, BOC], [RIV, NOB], [VEL, BOC], [BOC, EST], [SLO, LAN], [RIV, BOC], [VEL, 'banfield'],
      /* 2010 */ [ARJ, EST], [VEL, BOC], ['Arsenal de Sarandí', VEL], [NOB, VEL, SLO], [RIV, RAC], BOC, LAN, BOC, BOC, RAC,
      /* 2020 */ BOC, [BOC, RIV], BOC, RIV, VEL, ['platense', EST], 'belgrano'],
  },
  'C:ARG': {
    name: 'Copa Argentina', from: 2012, note: 'Modern Copa Argentina, from 2011–12.',
    w: [BOC, 'Arsenal de Sarandí', HUR, BOC, RIV, RIV, ROS, RIV,
      /* 2020 */ _, BOC, 'Patronato', EST, 'Central Córdoba', 'Independiente Rivadavia'],
  },
  'L:bra-1': {
    name: 'Brazilian champions', from: 1959, note: 'Taça Brasil and Robertão (1959–70) included, as the CBF counts them.',
    w: ['bahia',
      /* 1960 */ PAL, SAN, SAN, SAN, SAN, SAN, CRU, [PAL, PAL], [BOT, SAN], PAL,
      /* 1970 */ FLU, CAM, PAL, PAL, VAS, INT, INT, SPF, 'guarani', INT,
      /* 1980 */ FLA, GRE, FLA, FLA, FLU, 'Coritiba', SPF, 'sport-recife', 'bahia', VAS,
      /* 1990 */ COR, SPF, FLA, PAL, PAL, BOT, GRE, VAS, COR, COR,
      /* 2000 */ VAS, CAP, SAN, CRU, SAN, COR, SPF, SPF, SPF, FLA,
      /* 2010 */ FLU, COR, FLU, CRU, CRU, COR, PAL, COR, PAL, FLA,
      /* 2020 */ FLA, CAM, PAL, PAL, BOT, FLA],
  },
  'C:BRA': {
    name: 'Copa do Brasil', from: 1989,
    w: [GRE,
      /* 1990 */ FLA, 'Criciúma', INT, CRU, GRE, COR, CRU, GRE, PAL, 'Juventude',
      /* 2000 */ CRU, GRE, COR, CRU, 'Santo André', 'Paulista', FLA, FLU, 'sport-recife', COR,
      /* 2010 */ SAN, VAS, PAL, FLA, CAM, PAL, GRE, CRU, CRU, CAP,
      /* 2020 */ PAL, CAM, FLA, SPF, FLA, COR],
  },
  'S:BRA': {
    name: 'Supercopa do Brasil', from: 2020, note: 'Modern edition, from 2020 (also played in 1990 and 1991).',
    w: [FLA, FLA, CAM, PAL, SPF, FLA],
  },
  'L:mex-1': {
    name: 'Mexican champions', from: 1944, note: 'Professional era, from 1943–44. Short tournaments (Invierno/Verano, Apertura/Clausura) since 1996.',
    w: ['Asturias', 'Real Club España', VER, 'atlante', LEO, LEO,
      /* 1950 */ VER, 'atlas', LEO, 'Tampico', 'Marte', 'Zacatepec', LEO, GDL, 'Zacatepec', GDL,
      /* 1960 */ GDL, GDL, GDL, 'Oro', GDL, GDL, AME, TOL, TOL, CAZ,
      /* 1970 */ [GDL, CAZ], AME, CAZ, CAZ, CAZ, TOL, AME, UNAM, TIG, CAZ,
      /* 1980 */ CAZ, UNAM, TIG, 'puebla', AME, [AME, AME], MTY, GDL, AME, AME,
      /* 1990 */ 'puebla', UNAM, LEO, 'atlante', 'Tecos', 'necaxa', ['necaxa', SNT], [GDL, CAZ], [TOL, 'necaxa'], [TOL, PAC],
      /* 2000 */ [TOL, 'atletico-morelia'], [SNT, PAC], [AME, TOL], [MTY, PAC], [UNAM, UNAM], [AME, TOL], [PAC, GDL], [PAC, 'atlante'], [SNT, TOL], [UNAM, MTY],
      /* 2010 */ [TOL, MTY], [UNAM, TIG], [SNT, 'tijuana'], [AME, LEO], [LEO, AME], [SNT, TIG], [PAC, TIG], [GDL, TIG], [SNT, AME], [TIG, MTY],
      /* 2020 */ LEO, [CAZ, 'atlas'], ['atlas', PAC], [TIG, AME], [AME, AME], [TOL, TOL], CAZ],
  },
  'L:usa-1': {
    name: 'MLS Cup', from: 1996,
    w: [DCU, DCU, CHF, DCU,
      /* 2000 */ SKC, 'San Jose Earthquakes', LAG, 'San Jose Earthquakes', DCU, LAG, HOU, HOU, CLB, 'Real Salt Lake',
      /* 2010 */ 'Colorado Rapids', LAG, LAG, SKC, LAG, 'Portland Timbers', SEA, 'Toronto FC', 'Atlanta United', SEA,
      /* 2020 */ CLB, 'New York City FC', LAFC, CLB, LAG, 'inter-miami'],
  },
  'C:USA': {
    name: 'U.S. Open Cup', from: 1996, note: 'MLS era, from 1996.',
    w: [DCU, 'FC Dallas', CHF, 'Rochester Rhinos',
      /* 2000 */ CHF, LAG, CLB, CHF, SKC, LAG, CHF, 'New England Revolution', DCU, SEA,
      /* 2010 */ SEA, SEA, SKC, DCU, SEA, SKC, 'FC Dallas', SKC, HOU, 'Atlanta United',
      /* 2020 */ _, _, 'Orlando City', HOU, LAFC, 'nashville-sc'],
  },
  'L:col-1': {
    name: 'Colombian champions', from: 1948, note: 'Apertura and Finalización tournaments since 2002.',
    w: [SFE, MIL,
      /* 1950 */ ONC, MIL, MIL, MIL, NAC, MED, 'Atlético Quindío', MED, SFE, MIL,
      /* 1960 */ SFE, MIL, MIL, MIL, MIL, CAL, SFE, CAL, 'Unión Magdalena', CAL,
      /* 1970 */ CAL, SFE, MIL, NAC, CAL, SFE, NAC, JUN, MIL, AMC,
      /* 1980 */ JUN, NAC, AMC, AMC, AMC, AMC, AMC, MIL, MIL, _,
      /* 1990 */ AMC, NAC, AMC, JUN, NAC, JUN, CAL, AMC, CAL, NAC,
      /* 2000 */ AMC, AMC, [AMC, MED], [ONC, TOLC], [MED, JUN], [NAC, CAL], ['Deportes Pasto', 'Cúcuta Deportivo'], [NAC, NAC], ['Boyacá Chicó', AMC], [ONC, MED],
      /* 2010 */ [JUN, ONC], [NAC, JUN], [SFE, MIL], [NAC, NAC], [NAC, SFE], [CAL, NAC], [MED, SFE], [NAC, MIL], [TOLC, JUN], [JUN, AMC],
      /* 2020 */ AMC, [TOLC, CAL], [NAC, 'Deportivo Pereira'], [MIL, JUN], ['Atlético Bucaramanga', NAC], [SFE, JUN], JUN],
  },
  'C:COL': {
    name: 'Copa Colombia', from: 2008, note: 'Modern Copa Colombia, from 2008.',
    w: ['La Equidad', SFE,
      /* 2010 */ CAL, MIL, NAC, NAC, TOLC, JUN, NAC, JUN, NAC, MED,
      /* 2020 */ MED, NAC, MIL, NAC, NAC, NAC],
  },
  'L:chi-1': {
    name: 'Chilean champions', from: 1933,
    w: [MAG, MAG, MAG, AUD, COL, MAG, COL,
      /* 1940 */ UCH, COL, 'Santiago Morning', UES, COL, 'Green Cross', AUD, COL, AUD, UC,
      /* 1950 */ EVT, UES, EVT, COL, UC, PALC, COL, AUD, SW, UCH,
      /* 1960 */ COL, UC, UCH, COL, UCH, UCH, UC, UCH, SW, UCH,
      /* 1970 */ COL, 'Unión San Felipe', COL, UES, HUA, UES, EVT, UES, PALC, COL,
      /* 1980 */ COB, COL, COB, COL, UC, COB, COL, UC, COB, COL,
      /* 1990 */ COL, COL, COB, COL, UCH, UCH, COL, [UC, COL], COL, UCH,
      /* 2000 */ UCH, SW, [UC, COL], [COB, COB], [UCH, COB], [UES, UC], [COL, COL], [COL, COL], [EVT, COL], [UCH, COL],
      /* 2010 */ UC, [UCH, UCH], [UCH, HUA], [UES, 'ohiggins'], [COL, UCH], ['Cobresal', COL], [UC, UC], [UCH, COL], UC, UC,
      /* 2020 */ UC, UC, COL, HUA, COL, 'Coquimbo Unido'],
  },
};
