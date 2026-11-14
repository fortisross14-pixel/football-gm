// National teams (v2.5): the playable nations, their confederation, prestige and kit colours,
// plus which country each club belongs to (for academy players and national call-ups).
//
// Playable = every nation with a league or clubs in the game, plus a few big football nations
// whose players are spread around the world (Uruguay is in through its clubs; Ivory Coast,
// Cameroon, Ghana and Senegal through their players).
//
// Four confederations for national teams: the Americas join South and North America,
// Asia-Pacific joins Asia and Oceania.

// prestige: 1 elite … 5 minnow. Sets the reputation a federation asks for and how good the
// nation's own academy products are.
const N = (code, conf, prestige, primary, secondary, away) => ({ code, conf, prestige, colors: { primary, secondary, away } });

const LIST = [
  // Europe (22)
  N('ESP', 'europe', 1, '#c60b1e', '#ffc400', '#1c2340'), N('ENG', 'europe', 1, '#ffffff', '#1d2b5c', '#c8102e'),
  N('GER', 'europe', 1, '#ffffff', '#111111', '#1c2340'), N('FRA', 'europe', 1, '#1d2b5c', '#ffffff', '#ffffff'),
  N('ITA', 'europe', 2, '#1f5fbf', '#ffffff', '#ffffff'), N('POR', 'europe', 2, '#a6192e', '#046a38', '#ffffff'),
  N('NED', 'europe', 2, '#f36c21', '#ffffff', '#1c2340'), N('BEL', 'europe', 2, '#c8102e', '#111111', '#ffffff'),
  N('CRO', 'europe', 2, '#ffffff', '#d50032', '#1c2340'), N('DEN', 'europe', 3, '#c8102e', '#ffffff', '#ffffff'),
  N('SUI', 'europe', 3, '#d52b1e', '#ffffff', '#ffffff'), N('TUR', 'europe', 3, '#e30a17', '#ffffff', '#ffffff'),
  N('SRB', 'europe', 3, '#c6363c', '#ffffff', '#1c2340'), N('AUT', 'europe', 3, '#ed2939', '#ffffff', '#ffffff'),
  N('SCO', 'europe', 3, '#1d2b5c', '#ffffff', '#ffffff'), N('POL', 'europe', 3, '#ffffff', '#dc143c', '#dc143c'),
  N('SWE', 'europe', 3, '#fecc02', '#006aa7', '#006aa7'), N('UKR', 'europe', 3, '#ffd500', '#005bbb', '#005bbb'),
  N('CZE', 'europe', 4, '#d7141a', '#ffffff', '#ffffff'), N('NOR', 'europe', 4, '#ba0c2f', '#ffffff', '#ffffff'),
  N('GRE', 'europe', 4, '#0d5eaf', '#ffffff', '#ffffff'), N('HUN', 'europe', 4, '#ce2939', '#ffffff', '#477050'),
  // The Americas (16)
  N('BRA', 'americas', 1, '#ffdf00', '#009c3b', '#002776'), N('ARG', 'americas', 1, '#75aadb', '#ffffff', '#1c2340'),
  N('URU', 'americas', 2, '#5cbfeb', '#ffffff', '#111111'), N('COL', 'americas', 3, '#fcd116', '#003893', '#ce1126'),
  N('MEX', 'americas', 3, '#006847', '#ffffff', '#ce1126'), N('USA', 'americas', 3, '#ffffff', '#1d2b5c', '#1d2b5c'),
  N('ECU', 'americas', 4, '#ffdd00', '#034ea2', '#034ea2'), N('CHI', 'americas', 4, '#d52b1e', '#ffffff', '#ffffff'),
  N('PAR', 'americas', 4, '#d52b1e', '#ffffff', '#0038a8'), N('PER', 'americas', 4, '#ffffff', '#d91023', '#d91023'),
  N('CRC', 'americas', 4, '#ce1126', '#002b7f', '#ffffff'), N('CAN', 'americas', 4, '#d80621', '#ffffff', '#ffffff'),
  N('PAN', 'americas', 5, '#da121a', '#ffffff', '#072357'), N('JAM', 'americas', 5, '#fed100', '#009b3a', '#111111'),
  N('HON', 'americas', 5, '#ffffff', '#0073cf', '#0073cf'), N('GUA', 'americas', 5, '#4997d0', '#ffffff', '#ffffff'),
  // Africa (12)
  N('MAR', 'africa', 2, '#c1272d', '#006233', '#ffffff'), N('SEN', 'africa', 3, '#ffffff', '#00853f', '#00853f'),
  N('NGA', 'africa', 3, '#008751', '#ffffff', '#ffffff'), N('EGY', 'africa', 3, '#ce1126', '#ffffff', '#111111'),
  N('CIV', 'africa', 3, '#f77f00', '#ffffff', '#009e60'), N('CMR', 'africa', 3, '#007a5e', '#ce1126', '#fcd116'),
  N('ALG', 'africa', 4, '#ffffff', '#006233', '#006233'), N('GHA', 'africa', 4, '#ffffff', '#111111', '#ce1126'),
  N('TUN', 'africa', 4, '#e70013', '#ffffff', '#ffffff'), N('RSA', 'africa', 4, '#ffb612', '#007a4d', '#007a4d'),
  N('COD', 'africa', 5, '#007fff', '#ce1021', '#f7d618'), N('SDN', 'africa', 5, '#ffffff', '#d21034', '#007229'),
  // Asia-Pacific (17)
  N('JPN', 'apac', 3, '#1d2b8c', '#ffffff', '#ffffff'), N('KOR', 'apac', 3, '#c60c30', '#003478', '#ffffff'),
  N('KSA', 'apac', 4, '#ffffff', '#006c35', '#006c35'), N('IRN', 'apac', 4, '#ffffff', '#da0000', '#da0000'),
  N('AUS', 'apac', 4, '#ffcd00', '#00843d', '#1d2b5c'), N('QAT', 'apac', 5, '#8a1538', '#ffffff', '#ffffff'),
  N('UZB', 'apac', 5, '#ffffff', '#1eb53a', '#0099b5'), N('UAE', 'apac', 5, '#ffffff', '#00732f', '#ce1126'),
  N('CHN', 'apac', 5, '#ee1c25', '#ffff00', '#ffffff'), N('THA', 'apac', 5, '#241d4f', '#ffffff', '#a51931'),
  N('NZL', 'apac', 5, '#ffffff', '#111111', '#111111'), N('FIJ', 'apac', 5, '#ffffff', '#68bfe5', '#111111'),
  N('PNG', 'apac', 5, '#ce1126', '#fcd116', '#111111'), N('TAH', 'apac', 5, '#ffffff', '#ce1126', '#ce1126'),
  N('NCL', 'apac', 5, '#7a9d5c', '#e4002b', '#ffffff'), N('SOL', 'apac', 5, '#0051ba', '#fce300', '#215b33'),
  N('VAN', 'apac', 5, '#d21034', '#111111', '#fdce12'),
];

export const NATIONAL_TEAMS = Object.fromEntries(LIST.map((n) => [n.code, n]));
export const NATION_CODES = LIST.map((n) => n.code);

export const INTL_CONFS = ['europe', 'americas', 'africa', 'apac'];
export const INTL_CONF_LABEL = { europe: 'Europe', americas: 'Americas', africa: 'Africa', apac: 'Asia-Pacific' };
// Club confederation → national-team confederation.
export const INTL_CONF_OF = { europe: 'europe', southamerica: 'americas', northamerica: 'americas', africa: 'africa', asia: 'apac', oceania: 'apac' };

// Reputation a federation asks of its head coach, by prestige. Nobody offers Brazil or Germany to
// a newcomer: the elite ask for a top manager's record.
export const NATION_REPUTATION = { 1: 84, 2: 70, 3: 50, 4: 28, 5: 0 };
// How good the nation's academy products are (OVR of its home-grown call-ups), by prestige.
export const YOUTH_RATING = { 1: 66, 2: 64, 3: 61, 4: 58, 5: 55 };

// Division country code → nation code (where they differ). "Other" leagues are mixed: see CLUB_NATION.
const DIVISION_NATION = { SAU: 'KSA' };
const MIXED = new Set(['EUR', 'SAM', 'NAO', 'ASI', 'APC', 'AFR', 'OCE']);

// Clubs of the mixed leagues (and the New Zealand clubs in the A-League).
export const CLUB_NATION = {
  // European Frontier League
  'shakhtar-donetsk': 'UKR', 'dynamo-kyiv': 'UKR', 'bodo-glimt': 'NOR', 'red-star-belgrade': 'SRB', 'slavia-prague': 'CZE',
  'sparta-prague': 'CZE', 'dinamo-zagreb': 'CRO', ferencvaros: 'HUN', 'malmo-ff': 'SWE', 'legia-warsaw': 'POL',
  // Copa Andina League
  'ldu-quito': 'ECU', 'independiente-del-valle': 'ECU', 'barcelona-sc': 'ECU', penarol: 'URU', 'nacional-uru': 'URU',
  libertad: 'PAR', 'cerro-porteno': 'PAR', olimpia: 'PAR', universitario: 'PER', 'alianza-lima': 'PER',
  // Liga Norte
  saprissa: 'CRC', alajuelense: 'CRC', 'olimpia-hon': 'HON', motagua: 'HON', 'municipal-gua': 'GUA',
  'vancouver-whitecaps': 'CAN', tauro: 'PAN', 'plaza-amador': 'PAN', cavalier: 'JAM', 'harbour-view': 'JAM',
  // Asian Super League
  'al-sadd': 'QAT', 'al-duhail': 'QAT', 'al-gharafa': 'QAT', 'al-ain': 'UAE', 'shabab-al-ahli': 'UAE', sharjah: 'UAE',
  persepolis: 'IRN', tractor: 'IRN', esteghlal: 'IRN', pakhtakor: 'UZB',
  // Pacific Rim League
  'ulsan-hd': 'KOR', 'jeonbuk-hyundai': 'KOR', 'pohang-steelers': 'KOR', 'fc-seoul': 'KOR', 'shanghai-port': 'CHN',
  'shanghai-shenhua': 'CHN', 'chengdu-rongcheng': 'CHN', 'shandong-taishan': 'CHN', 'guangzhou-fc': 'CHN', 'buriram-united': 'THA',
  // Pan-African League
  'mamelodi-sundowns': 'RSA', 'orlando-pirates': 'RSA', 'kaizer-chiefs': 'RSA', esperance: 'TUN', 'rs-berkane': 'MAR',
  wydad: 'MAR', 'raja-casablanca': 'MAR', 'mc-alger': 'ALG', 'al-hilal-omdurman': 'SDN', 'tp-mazembe': 'COD',
  // Oceania Premier League, plus the New Zealand clubs in the A-League
  'auckland-city': 'NZL', 'christchurch-united': 'NZL', 'ba-fc': 'FIJ', 'rewa-fc': 'FIJ', 'hekari-united': 'PNG',
  'as-pirae': 'TAH', 'as-venus': 'TAH', 'hienghene-sport': 'NCL', 'solomon-warriors': 'SOL', 'galaxy-fc': 'VAN',
  'wellington-phoenix': 'NZL', 'auckland-fc': 'NZL',
};

// The country a club belongs to (a nation code), or null when unknown.
export function clubNation(clubId, divisionCode) {
  if (CLUB_NATION[clubId]) return CLUB_NATION[clubId];
  if (!divisionCode || MIXED.has(divisionCode)) return null;
  return DIVISION_NATION[divisionCode] || divisionCode;
}

// Real-life titles up to 2024 (World Cup to 2022). The game's first summer tournament is 2028.
// Continental: European Championship, Copa América (the Americas), Africa Cup of Nations, Asian Cup
// (Asia-Pacific). Only nations in the game are listed.
export const REAL_NATION_TITLES = {
  W: { BRA: 5, GER: 4, ITA: 4, ARG: 3, FRA: 2, URU: 2, ENG: 1, ESP: 1 },
  europe: { ESP: 4, GER: 3, ITA: 2, FRA: 2, NED: 1, DEN: 1, GRE: 1, POR: 1, CZE: 1 },
  americas: { ARG: 16, URU: 15, BRA: 9, PAR: 2, CHI: 2, PER: 2, COL: 1 },
  africa: { EGY: 7, CMR: 5, GHA: 4, NGA: 3, CIV: 3, ALG: 2, COD: 2, TUN: 1, SDN: 1, MAR: 1, RSA: 1, SEN: 1 },
  apac: { JPN: 4, KSA: 3, IRN: 3, QAT: 2, KOR: 2, AUS: 1 },
};
export const LAST_REAL_WORLD_CUP = { year: 2022, winner: 'ARG' };
