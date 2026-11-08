// Real club badges, loaded at runtime from public GitHub logo collections (nothing is bundled).
// badgeUrls() returns candidate URLs in order; <Crest> tries each and falls back to the
// generated shield when none loads. `node scripts/check-badges.mjs` prints coverage.
//
// Sources:
//   SVG  github.com/JoseArroyave/football-logos   logos/<country>/<Club_Name>.svg (most clubs)
//   PNG  github.com/leoratzlaff/football-badges  logos/<country>/<club-slug>.png (Europe only)
// File names were matched against each repo's file listing and checked by eye.

export const SVG_REPO = { owner: 'JoseArroyave', repo: 'football-logos', branch: 'main' };
export const PNG_REPO = { owner: 'leoratzlaff', repo: 'football-badges', branch: 'master' };
const SVG_BASE = 'https://raw.githubusercontent.com/JoseArroyave/football-logos/refs/heads/main/logos';
const SVG_CDN = 'https://cdn.jsdelivr.net/gh/JoseArroyave/football-logos@main/logos';
const PNG_CDN = 'https://cdn.jsdelivr.net/gh/leoratzlaff/football-badges@master/logos';
const PNG_BASE = 'https://raw.githubusercontent.com/leoratzlaff/football-badges/master/logos';

// Source folder → { our club id: file name without extension }.
// Clubs in the "Other" regions sit under their real country's folder.
export const SVG_BADGES = {
  spain: {
    'real-madrid': 'Real_Madrid', barcelona: 'Barcelona', atletico: 'Atletico_Madrid',
    athletic: 'Athletic_Club_Bilbao', villarreal: 'Villarreal', betis: 'Real_Betis',
    'real-sociedad': 'Real_Sociedad', celta: 'Celta', sevilla: 'Sevilla', valencia: 'Valencia',
    osasuna: 'Osasuna', rayo: 'Rayo_Vallecano', girona: 'Girona', mallorca: 'Mallorca', getafe: 'Getafe',
    espanyol: 'Espanyol', racing: 'Racing_Santander', sporting: 'Sporting_Gijón',
    depor: 'Deportivo_La_Coruña', zaragoza: 'Real_Zaragoza', malaga: 'Málaga', valladolid: 'Real_Valladolid',
    granada: 'Granada', almeria: 'Almería',
  },
  england: {
    arsenal: 'Arsenal', liverpool: 'Liverpool_FC', 'man-city': 'Manchester_City', chelsea: 'Chelsea',
    newcastle: 'Newcastle_United', 'aston-villa': 'Aston_Villa', tottenham: 'Tottenham',
    'man-united': 'Manchester_United', 'crystal-palace': 'Crystal_Palace', brighton: 'Brighton',
    'nottm-forest': 'Nottingham_Forest', bournemouth: 'Bournemouth', brentford: 'Brentford',
    fulham: 'Fulham', everton: 'Everton', 'west-ham': 'West_Ham', leeds: 'Leeds_United',
    sunderland: 'Sunderland', wolves: 'Wolverhampton_Wanderers', burnley: 'Burnley', leicester: 'Leicester',
    southampton: 'Southampton', ipswich: 'Ipswich', middlesbrough: 'Middlesbrough',
  },
  italy: {
    inter: 'Inter', napoli: 'Napoli', juventus: 'Juventus', milan: 'Milan', atalanta: 'Atalanta',
    roma: 'AS_Roma', como: 'Como_1907', bologna: 'Bologna', lazio: 'Lazio', fiorentina: 'Fiorentina',
    torino: 'Torino', udinese: 'Udinese', genoa: 'Genoa', sassuolo: 'Sassuolo', parma: 'Parma',
    cagliari: 'Cagliari', palermo: 'Palermo', monza: 'AC_Monza', lecce: 'Lecce', venezia: 'Venezia',
    verona: 'Hellas_Verona', cremonese: 'Cremonese', sampdoria: 'Sampdoria', pisa: 'Pisa',
  },
  germany: {
    bayern: 'Bayern_Munich', dortmund: 'Borussia_Dortmund', leverkusen: 'Bayer_Leverkusen',
    leipzig: 'RB_Leipzig', stuttgart: 'VfB_Stuttgart', frankfurt: 'Eintracht_Frankfurt',
    hoffenheim: 'Hoffenheim', freiburg: 'Freiburg', wolfsburg: 'Wolfsburg', mainz: 'Mainz_05',
    gladbach: 'Borussia_Mönchengladbach', 'union-berlin': 'Union_Berlin', 'werder-bremen': 'Werder_Bremen',
    koln: 'Cologne', hamburg: 'Hamburger_SV', augsburg: 'Augsburg', heidenheim: 'FC_Heidenheim',
    'st-pauli': 'St_Pauli', schalke: 'Schalke_04', hertha: 'Hertha_BSC', hannover: 'Hannover_96',
    kaiserslautern: 'FC_Kaiserslautern', darmstadt: 'SV_Darmstadt_98', karlsruhe: 'Karlsruher_SC',
  },
  france: {
    psg: 'Paris_Saint-Germain_(PSG)', marseille: 'Marseille', monaco: 'AS_Monaco', lille: 'Lille',
    lyon: 'Olympique_Lyonnais', strasbourg: 'RC_Strasbourg_Alsace', lens: 'RC_Lens', nice: 'Nice',
    rennes: 'Rennes', toulouse: 'Toulouse', brest: 'Brest', 'paris-fc': 'Paris_FC', nantes: 'Nantes',
    auxerre: 'Auxerre', lorient: 'Lorient_FC', 'le-havre': 'Le_Havre_AC',
  },
  portugal: {
    'sporting-cp': 'Sporting_CP', benfica: 'Benfica', porto: 'FC_Porto', braga: 'SC_Braga',
    'vitoria-sc': 'Vitória_de_Guimarães', famalicao: 'Famalicao', 'gil-vicente': 'Gil_Vicente',
    'santa-clara': 'Santa_Clara', moreirense: 'Moreirense', estoril: 'Estoril', 'casa-pia': 'Casa_Pia_AC',
    'rio-ave': 'Rio_Ave', arouca: 'Arouca', alverca: 'Alverca', 'estrela-amadora': 'Estrela_da_Amadora',
    'cd-nacional': 'Nacional_da_Madeira',
  },
  netherlands: {
    psv: 'PSV_Eindhoven', feyenoord: 'Feyenoord', ajax: 'Ajax', az: 'AZ_Alkmaar', twente: 'Twente',
    utrecht: 'FC_Utrecht', nec: 'N.E.C._Nijmegen', 'go-ahead-eagles': 'Go_Ahead_Eagles',
    heerenveen: 'sc_Heerenveen', 'sparta-rotterdam': 'Sparta_Rotterdam', groningen: 'FC_Groningen',
    'fortuna-sittard': 'Fortuna_Sittard', 'pec-zwolle': 'PEC_Zwolle', 'nac-breda': 'NAC_Breda',
    heracles: 'Heracles_Almelo', excelsior: 'Excelsior_Rotterdam',
  },
  turkey: {
    galatasaray: 'Galatasaray', fenerbahce: 'Fenerbahçe', besiktas: 'Beşiktaş', trabzonspor: 'Trabzonspor',
    basaksehir: 'Başakşehir', goztepe: 'Göztepe_Izmir', samsunspor: 'Samsunspor', alanyaspor: 'Alanyaspor',
  },
  scotland: {
    celtic: 'Celtic', rangers: 'Rangers', hearts: 'Hearts', aberdeen: 'Aberdeen', hibernian: 'Hibernian',
    motherwell: 'Motherwell', 'dundee-united': 'Dundee_United', 'st-mirren': 'St._Mirren',
  },
  austria: {
    'red-bull-salzburg': 'Salzburg', 'sturm-graz': 'Sturm_Graz', 'rapid-wien': 'Rapid_Vienna',
    'austria-wien': 'Austria_Wien', lask: 'LASK', 'wolfsberger-ac': 'Wolfsberg', 'tsv-hartberg': 'Hartberg',
    'scr-altach': 'Altach',
  },
  greece: {
    olympiacos: 'Olympiacos', paok: 'PAOK', 'aek-athens': 'AEK_Athens', panathinaikos: 'Panathinaikos',
    aris: 'Aris_Thessaloniki', 'ofi-crete': 'OFI', levadiakos: 'Levadiakos', atromitos: 'Atromitos',
  },
  belgium: {
    'club-brugge': 'Club_Brugge',
  },
  ukraine: {
    'shakhtar-donetsk': 'Shakhtar',
  },
  denmark: {
    'fc-copenhagen': 'F.C._Copenhagen',
  },
  norway: {
    'bodo-glimt': 'BodøGlimt',
  },
  serbia: {
    'red-star-belgrade': 'Crvena_Zvezda',
  },
  'czech-republic': {
    'slavia-prague': 'SK_Slavia_Praha',
  },
  croatia: {
    'dinamo-zagreb': 'GNK_Dinamo_Zagreb',
  },
  switzerland: {
    'fc-basel': 'Basel',
  },
  argentina: {
    'river-plate': 'River_Plate', 'boca-juniors': 'Boca_Juniors', 'racing-club': 'Racing',
    estudiantes: 'Estudiantes_de_La_Plata', 'velez-sarsfield': 'Vélez_Sarsfield',
    'rosario-central': 'Rosario_Central', lanus: 'Lanús', 'argentinos-juniors': 'Argeninos_Juniors',
    independiente: 'Independiente', talleres: 'Talleres', 'san-lorenzo': 'San_Lorenzo_de_Almagro',
    huracan: 'CA_Huracán', platense: 'Platense', belgrano: 'Belgrano', 'union-santa-fe': 'Union',
    'newells-old-boys': 'Newell\'s_Old_Boys',
  },
  brazil: {
    flamengo: 'Flamengo', palmeiras: 'Palmeiras', cruzeiro: 'Cruzeiro', botafogo: 'Botafogo_FR',
    fluminense: 'Fluminense', bahia: 'Bahia', 'sao-paulo': 'São_Paulo', corinthians: 'Corinthians',
    'atletico-mineiro': 'Atlético_Mineiro', internacional: 'Internacional', gremio: 'Grêmio',
    'vasco-da-gama': 'Vasco_da_Gama', santos: 'Santos_FC', mirassol: 'Mirassol',
    'red-bull-bragantino': 'RB_Bragantino', fortaleza: 'Fortaleza',
  },
  mexico: {
    toluca: 'Toluca', 'america-mex': 'Club_America', 'cruz-azul': 'Cruz_Azul', 'tigres-uanl': 'Tigres_UANL',
    monterrey: 'Monterrey', pachuca: 'Pachuca', guadalajara: 'CD_Guadalajara', 'pumas-unam': 'UNAM_Pumas',
  },
  usa: {
    'inter-miami': 'Inter_Miami_CF', lafc: 'Los_Angeles_Football_Club',
    'philadelphia-union': 'Philadelphia_Union', 'fc-cincinnati': 'FC_Cincinnati',
    'san-diego-fc': 'San_Diego_Football_Club', 'columbus-crew': 'Columbus_Crew',
    'seattle-sounders': 'Seattle_Sounders_FC', 'nashville-sc': 'Nashville_SC',
  },
  colombia: {
    'atletico-nacional': 'Atlético_Nacional', 'junior-col': 'Atlético_Junior', millonarios: 'Millonarios',
    'america-cali': 'América_de_Cali', 'santa-fe-col': 'Independiente_Santa_Fe',
    'deportes-tolima': 'Deportes_Tolima', 'independiente-medellin': 'Independiente_Medellín',
    'once-caldas': 'Once_Caldas',
  },
  ecuador: {
    'ldu-quito': 'Liga_de_Quito', 'independiente-del-valle': 'Independiente_del_Valle',
  },
  uruguay: {
    penarol: 'Peñarol', 'nacional-uru': 'Nacional',
  },
  chile: {
    'colo-colo': 'Colo_Colo', 'universidad-de-chile': 'Universidad_de_Chile',
  },
  paraguay: {
    libertad: 'Libertad', 'cerro-porteno': 'Cerro_Porteño',
  },
  japan: {
    'kashima-antlers': 'Kashima_Antlers', 'kashiwa-reysol': 'Kashiwa_Reysol', 'kyoto-sanga': 'Kyoto_Sanga',
    'sanfrecce-hiroshima': 'Sanfrecce_Hiroshima', 'vissel-kobe': 'Vissel_Kobe',
    'machida-zelvia': 'Machida_Zelvia', 'urawa-reds': 'Urawa_Reds', 'kawasaki-frontale': 'Kawasaki_Frontale',
  },
  qatar: {
    'al-sadd': 'Al_Sadd', 'al-duhail': 'Al_Duhail', 'al-gharafa': 'Al_Gharafa',
  },
  uae: {
    'al-ain': 'Al_Ain_FC', 'shabab-al-ahli': 'Shabab_Al_Ahli_Dubai_FC', sharjah: 'Sharjah_FC',
  },
  iran: {
    persepolis: 'Persepolis', tractor: 'Tractor',
  },
  'south-korea': {
    'ulsan-hd': 'Ulsan_HD_FC', 'jeonbuk-hyundai': 'Jeonbuk', 'pohang-steelers': 'Pohang_Steelers',
  },
  china: {
    'shanghai-port': 'Shanghai_Port', 'shanghai-shenhua': 'Shanghai_Shenhua',
    'chengdu-rongcheng': 'Chengdu_Rongcheng',
  },
  australia: {
    'melbourne-city': 'Melbourne_City_FC',
  },
  thailand: {
    'buriram-united': 'Buriram_United',
  },
  'saudi-arabia': {
    'al-hilal': 'Al_Hilal', 'al-nassr': 'Al_Nassr', 'al-ittihad': 'Al_Ittihad', 'al-ahli-sau': 'Al_Ahli',
    'al-qadsiah': 'Al_Qadsiah', 'al-ettifaq': 'Al_Ettifaq', 'al-shabab-sau': 'Al_Shabab',
    'al-taawoun': 'Al_Taawoun',
  },
  nigeria: {
    'remo-stars': 'Remo_Stars', 'rangers-international': 'Rangers_International', enyimba: 'Enyimba',
    'rivers-united': 'Rivers_United', 'kano-pillars': 'Kano_Pillars', 'shooting-stars': 'Shooting_Stars',
    'plateau-united': 'Plateau_United', 'bendel-insurance': 'Bendel_Insurance',
  },
  egypt: {
    'al-ahly': 'Al_Ahly_SC', pyramids: 'Pyramids_FC', zamalek: 'Zamalek_SC', 'al-masry': 'Al-Masry_SC',
    'ceramica-cleopatra': 'Ceramica_Cleopatra_FC', smouha: 'Smouha_SC', enppi: 'ENPPI_SC',
    'modern-sport': 'Modern_Sport_FC',
  },
  'south-africa': {
    'mamelodi-sundowns': 'Mamelodi_Sundowns', 'orlando-pirates': 'Orlando_Pirates',
  },
  tunisia: {
    esperance: 'Espérance_Sportive_de_Tunis',
  },
  morocco: {
    'rs-berkane': 'RS_Berkane', wydad: 'Wydad_AC', 'raja-casablanca': 'Raja_Casablanca',
  },
  algeria: {
    'mc-alger': 'MC_Alger',
  },
};

export const PNG_BADGES = {
  spain: {
    'real-madrid': 'real-madrid', barcelona: 'fc-barcelona', atletico: 'atletico-de-madrid',
    athletic: 'athletic-bilbao', villarreal: 'villarreal-cf', betis: 'real-betis-balompie',
    'real-sociedad': 'real-sociedad', celta: 'celta-de-vigo', sevilla: 'sevilla-fc', valencia: 'valencia-cf',
    osasuna: 'ca-osasuna', rayo: 'rayo-vallecano', girona: 'girona-fc', mallorca: 'rcd-mallorca',
    getafe: 'getafe-cf', espanyol: 'rcd-espanyol-barcelona',
  },
  england: {
    arsenal: 'arsenal-fc', liverpool: 'liverpool-fc', 'man-city': 'manchester-city', chelsea: 'chelsea-fc',
    newcastle: 'newcastle-united', 'aston-villa': 'aston-villa', tottenham: 'tottenham-hotspur',
    'man-united': 'manchester-united', 'crystal-palace': 'crystal-palace',
    brighton: 'brighton-and-hove-albion', 'nottm-forest': 'nottingham-forest',
    bournemouth: 'afc-bournemouth', brentford: 'brentford-fc', fulham: 'fulham-fc', everton: 'everton-fc',
    'west-ham': 'west-ham-united', leeds: 'leeds-united', sunderland: 'sunderland-afc',
    wolves: 'wolverhampton-wanderers', burnley: 'burnley-fc',
  },
  italy: {
    inter: 'inter-milan', napoli: 'ssc-napoli', juventus: 'juventus-fc', milan: 'ac-milan',
    atalanta: 'atalanta-bc', roma: 'as-roma', como: 'como-1907', bologna: 'bologna-fc-1909',
    lazio: 'ss-lazio', fiorentina: 'acf-fiorentina', torino: 'torino-fc', udinese: 'udinese-calcio',
    genoa: 'genoa-cfc', sassuolo: 'us-sassuolo', parma: 'parma-calcio-1913', cagliari: 'cagliari-calcio',
    lecce: 'us-lecce', verona: 'hellas-verona', cremonese: 'us-cremonese', pisa: 'pisa-sporting-club',
  },
  germany: {
    bayern: 'bayern-munich', dortmund: 'borussia-dortmund', leverkusen: 'bayer-04-leverkusen',
    leipzig: 'rb-leipzig', stuttgart: 'vfb-stuttgart', frankfurt: 'eintracht-frankfurt',
    hoffenheim: 'tsg-1899-hoffenheim', freiburg: 'sc-freiburg', wolfsburg: 'vfl-wolfsburg',
    mainz: '1fsv-mainz-05', gladbach: 'borussia-monchengladbach', 'union-berlin': '1fc-union-berlin',
    'werder-bremen': 'sv-werder-bremen', koln: '1fc-koln', hamburg: 'hamburger-sv', augsburg: 'fc-augsburg',
    heidenheim: '1fc-heidenheim-1846', 'st-pauli': 'fc-st-pauli',
  },
  france: {
    psg: 'paris-saint-germain', marseille: 'olympique-marseille', monaco: 'as-monaco', lille: 'losc-lille',
    lyon: 'olympique-lyon', strasbourg: 'rc-strasbourg-alsace', lens: 'rc-lens', nice: 'ogc-nice',
    rennes: 'stade-rennais-fc', toulouse: 'fc-toulouse', brest: 'stade-brestois-29', 'paris-fc': 'paris-fc',
    nantes: 'fc-nantes', auxerre: 'aj-auxerre', lorient: 'fc-lorient', 'le-havre': 'le-havre-ac',
  },
  portugal: {
    'sporting-cp': 'sporting-cp', benfica: 'sl-benfica', porto: 'fc-porto', braga: 'sc-braga',
    'vitoria-sc': 'vitoria-guimaraes-sc', famalicao: 'fc-famalicao', 'gil-vicente': 'gil-vicente-fc',
    'santa-clara': 'cd-santa-clara', moreirense: 'moreirense-fc', estoril: 'gd-estoril-praia',
    'casa-pia': 'casa-pia-ac', 'rio-ave': 'rio-ave-fc', arouca: 'fc-arouca', alverca: 'fc-alverca',
    'estrela-amadora': 'cf-estrela-amadora', 'cd-nacional': 'cd-nacional',
  },
  netherlands: {
    psv: 'psv-eindhoven', feyenoord: 'feyenoord-rotterdam', ajax: 'ajax-amsterdam', az: 'az-alkmaar',
    twente: 'twente-enschede-fc', utrecht: 'fc-utrecht', nec: 'nec-nijmegen',
    'go-ahead-eagles': 'go-ahead-eagles', heerenveen: 'sc-heerenveen',
    'sparta-rotterdam': 'sparta-rotterdam', groningen: 'fc-groningen', 'fortuna-sittard': 'fortuna-sittard',
    'pec-zwolle': 'pec-zwolle', 'nac-breda': 'nac-breda', heracles: 'heracles-almelo',
    excelsior: 'excelsior-rotterdam',
  },
  turkiye: {
    galatasaray: 'galatasaray', fenerbahce: 'fenerbahce', besiktas: 'besiktas-jk',
    trabzonspor: 'trabzonspor', basaksehir: 'basaksehir-fk', goztepe: 'goztepe', samsunspor: 'samsunspor',
    alanyaspor: 'alanyaspor',
  },
  scotland: {
    celtic: 'celtic-fc', rangers: 'rangers-fc', hearts: 'heart-of-midlothian-fc', aberdeen: 'aberdeen-fc',
    hibernian: 'hibernian-fc', motherwell: 'motherwell-fc', 'dundee-united': 'dundee-united-fc',
    'st-mirren': 'st-mirren-fc',
  },
  austria: {
    'red-bull-salzburg': 'red-bull-salzburg', 'sturm-graz': 'sk-sturm-graz', 'rapid-wien': 'rapid-vienna',
    'austria-wien': 'austria-vienna', lask: 'lask', 'wolfsberger-ac': 'wolfsberger-ac',
    'tsv-hartberg': 'tsv-hartberg', 'scr-altach': 'scr-altach',
  },
  greece: {
    olympiacos: 'olympiacos-piraeus', paok: 'paok-thessaloniki', 'aek-athens': 'aek-athens',
    panathinaikos: 'panathinaikos-fc', aris: 'aris-thessaloniki', 'ofi-crete': 'ofi-crete-fc',
    levadiakos: 'apo-levadiakos', atromitos: 'atromitos-athens',
  },
  belgium: {
    'club-brugge': 'club-brugge-kv',
  },
  ukraine: {
    'shakhtar-donetsk': 'shakhtar-donetsk',
  },
  denmark: {
    'fc-copenhagen': 'fc-copenhagen',
  },
  norway: {
    'bodo-glimt': 'fk-bodglimt',
  },
  serbia: {
    'red-star-belgrade': 'red-star-belgrade',
  },
  'czech-republic': {
    'slavia-prague': 'sk-slavia-prague',
  },
  croatia: {
    'dinamo-zagreb': 'gnk-dinamo-zagreb',
  },
  switzerland: {
    'fc-basel': 'fc-basel-1893',
  },
};

// Division country → source folder, for clubs without an entry above (file name guessed from the club name).
const COUNTRY_FOLDER = {
  Spain: 'spain', England: 'england', Italy: 'italy', Germany: 'germany', France: 'france', Portugal: 'portugal',
  Netherlands: 'netherlands', Argentina: 'argentina', Brazil: 'brazil', Turkey: 'turkey', Scotland: 'scotland',
  Austria: 'austria', Greece: 'greece', Mexico: 'mexico', USA: 'usa', Colombia: 'colombia', Japan: 'japan',
  'Saudi Arabia': 'saudi-arabia', Nigeria: 'nigeria', Egypt: 'egypt',
};

const invert = (byFolder) => {
  const out = {};
  for (const [folder, ids] of Object.entries(byFolder)) for (const [id, file] of Object.entries(ids)) out[id] = [folder, file];
  return out;
};
const SVG_BY_ID = invert(SVG_BADGES);
const PNG_BY_ID = invert(PNG_BADGES);
const path = ([folder, file]) => `${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
const cache = new Map();

// club: a club object ({ id, name }) or a club id. country: the division's country (optional).
// Order: SVG (sharp at any size) → PNG via CDN → PNG raw → SVG via CDN.
export function badgeUrls(club, country) {
  const id = typeof club === 'string' ? club : club?.id;
  if (!id) return [];
  const key = `${id}|${country || ''}`;
  if (cache.has(key)) return cache.get(key);
  const urls = [];
  const svg = SVG_BY_ID[id];
  const png = PNG_BY_ID[id];
  if (svg) urls.push(`${SVG_BASE}/${path(svg)}.svg`);
  if (png) urls.push(`${PNG_CDN}/${path(png)}.png`, `${PNG_BASE}/${path(png)}.png`);
  if (svg) urls.push(`${SVG_CDN}/${path(svg)}.svg`);
  if (!svg && !png && COUNTRY_FOLDER[country] && typeof club === 'object' && club.name) {
    const guess = club.name.replace(/[./]/g, '').replace(/\s+/g, '_');
    urls.push(`${SVG_BASE}/${path([COUNTRY_FOLDER[country], guess])}.svg`);
  }
  cache.set(key, urls);
  return urls;
}

// [folder, file] in each source, or null: used by scripts/check-badges.mjs.
export const badgeFiles = (id) => ({ svg: SVG_BY_ID[id] || null, png: PNG_BY_ID[id] || null });
