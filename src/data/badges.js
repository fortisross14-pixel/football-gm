// Real club badges, loaded at runtime from public GitHub logo collections (nothing is bundled).
// badgeUrls() returns candidate URLs in order; <Crest> tries each and falls back to the
// generated shield when none loads. `node scripts/check-badges.mjs` prints coverage.
//
// Sources:
//   SVG  github.com/JoseArroyave/football-logos   logos/<country>/<Club_Name>.svg (most clubs)
//   PNG  github.com/leoratzlaff/football-badges  logos/<country>/<club-slug>.png (Europe only)
// File names were matched against each repo's file listing and checked by eye (v1.9 additions
// against shallow clones of both repos). Clubs without a verified file use the drawn crest.

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
    alaves: 'Deportivo_Alavés', levante: 'Levante', oviedo: 'Oviedo', elche: 'Elche', cadiz: 'Cádiz_CF', 'las-palmas': 'Las_Palmas',
  },
  england: {
    arsenal: 'Arsenal', liverpool: 'Liverpool_FC', 'man-city': 'Manchester_City', chelsea: 'Chelsea',
    newcastle: 'Newcastle_United', 'aston-villa': 'Aston_Villa', tottenham: 'Tottenham',
    'man-united': 'Manchester_United', 'crystal-palace': 'Crystal_Palace', brighton: 'Brighton',
    'nottm-forest': 'Nottingham_Forest', bournemouth: 'Bournemouth', brentford: 'Brentford',
    fulham: 'Fulham', everton: 'Everton', 'west-ham': 'West_Ham', leeds: 'Leeds_United',
    sunderland: 'Sunderland', wolves: 'Wolverhampton_Wanderers', burnley: 'Burnley', leicester: 'Leicester',
    southampton: 'Southampton', ipswich: 'Ipswich', middlesbrough: 'Middlesbrough',
    blackburn: 'Blackburn_Rovers', derby: 'Derby_County', 'sheffield-wednesday': 'Sheffield_Wednesday', 'west-brom': 'West_Bromwich_Albion', stoke: 'Stoke_City', norwich: 'Norwich_City',
  },
  italy: {
    inter: 'Inter', napoli: 'Napoli', juventus: 'Juventus', milan: 'Milan', atalanta: 'Atalanta',
    roma: 'AS_Roma', como: 'Como_1907', bologna: 'Bologna', lazio: 'Lazio', fiorentina: 'Fiorentina',
    torino: 'Torino', udinese: 'Udinese', genoa: 'Genoa', sassuolo: 'Sassuolo', parma: 'Parma',
    cagliari: 'Cagliari', palermo: 'Palermo', monza: 'AC_Monza', lecce: 'Lecce', venezia: 'Venezia',
    verona: 'Hellas_Verona', cremonese: 'Cremonese', sampdoria: 'Sampdoria', pisa: 'Pisa',
    brescia: 'Brescia', vicenza: 'Vicenza', empoli: 'Empoli', bari: 'Bari', perugia: 'Perugia', chievo: 'AC_ChievoVerona',
  },
  germany: {
    bayern: 'Bayern_Munich', dortmund: 'Borussia_Dortmund', leverkusen: 'Bayer_Leverkusen',
    leipzig: 'RB_Leipzig', stuttgart: 'VfB_Stuttgart', frankfurt: 'Eintracht_Frankfurt',
    hoffenheim: 'Hoffenheim', freiburg: 'Freiburg', wolfsburg: 'Wolfsburg', mainz: 'Mainz_05',
    gladbach: 'Borussia_Mönchengladbach', 'union-berlin': 'Union_Berlin', 'werder-bremen': 'Werder_Bremen',
    koln: 'Cologne', hamburg: 'Hamburger_SV', augsburg: 'Augsburg', heidenheim: 'FC_Heidenheim',
    'st-pauli': 'St_Pauli', schalke: 'Schalke_04', hertha: 'Hertha_BSC', hannover: 'Hannover_96',
    kaiserslautern: 'FC_Kaiserslautern', darmstadt: 'SV_Darmstadt_98', karlsruhe: 'Karlsruher_SC',
    nurnberg: 'FC_Nürnberg', 'munich-1860': 'TSV_1860_München', 'fortuna-dusseldorf': 'Fortuna_Düsseldorf', bochum: 'VfL_Bochum', 'dynamo-dresden': 'Dynamo_Dresden', braunschweig: 'Eintracht_Braunschweig',
  },
  france: {
    psg: 'Paris_Saint-Germain_(PSG)', marseille: 'Marseille', monaco: 'AS_Monaco', lille: 'Lille',
    lyon: 'Olympique_Lyonnais', strasbourg: 'RC_Strasbourg_Alsace', lens: 'RC_Lens', nice: 'Nice',
    rennes: 'Rennes', toulouse: 'Toulouse', brest: 'Brest', 'paris-fc': 'Paris_FC', nantes: 'Nantes',
    auxerre: 'Auxerre', lorient: 'Lorient_FC', 'le-havre': 'Le_Havre_AC',
    'saint-etienne': 'AS_Saint-Étienne', bordeaux: 'Bordeaux', montpellier: 'Montpellier', sochaux: 'FC_Sochaux-Montbéliard',
  },
  portugal: {
    'sporting-cp': 'Sporting_CP', benfica: 'Benfica', porto: 'FC_Porto', braga: 'SC_Braga',
    'vitoria-sc': 'Vitória_de_Guimarães', famalicao: 'Famalicao', 'gil-vicente': 'Gil_Vicente',
    'santa-clara': 'Santa_Clara', moreirense: 'Moreirense', estoril: 'Estoril', 'casa-pia': 'Casa_Pia_AC',
    'rio-ave': 'Rio_Ave', arouca: 'Arouca', alverca: 'Alverca', 'estrela-amadora': 'Estrela_da_Amadora',
    'cd-nacional': 'Nacional_da_Madeira',
    boavista: 'Boavista', maritimo: 'Marítimo', belenenses: 'Os_Belenenses', 'vitoria-setubal': 'Vitória_de_Setúbal',
  },
  netherlands: {
    psv: 'PSV_Eindhoven', feyenoord: 'Feyenoord', ajax: 'Ajax', az: 'AZ_Alkmaar', twente: 'Twente',
    utrecht: 'FC_Utrecht', nec: 'N.E.C._Nijmegen', 'go-ahead-eagles': 'Go_Ahead_Eagles',
    heerenveen: 'sc_Heerenveen', 'sparta-rotterdam': 'Sparta_Rotterdam', groningen: 'FC_Groningen',
    'fortuna-sittard': 'Fortuna_Sittard', 'pec-zwolle': 'PEC_Zwolle', 'nac-breda': 'NAC_Breda',
    heracles: 'Heracles_Almelo', excelsior: 'Excelsior_Rotterdam',
    vitesse: 'Vitesse', 'ado-den-haag': 'ADO_Den_Haag', volendam: 'Volendam', 'willem-ii': 'Willem_II',
  },
  turkey: {
    galatasaray: 'Galatasaray', fenerbahce: 'Fenerbahçe', besiktas: 'Beşiktaş', trabzonspor: 'Trabzonspor',
    basaksehir: 'Başakşehir', goztepe: 'Göztepe_Izmir', samsunspor: 'Samsunspor', alanyaspor: 'Alanyaspor',
    bursaspor: 'Bursaspor', konyaspor: 'Konyaspor',
  },
  scotland: {
    celtic: 'Celtic', rangers: 'Rangers', hearts: 'Hearts', aberdeen: 'Aberdeen', hibernian: 'Hibernian',
    motherwell: 'Motherwell', 'dundee-united': 'Dundee_United', 'st-mirren': 'St._Mirren',
    kilmarnock: 'Kilmarnock', 'dundee-fc': 'Dundee',
  },
  austria: {
    'red-bull-salzburg': 'Salzburg', 'sturm-graz': 'Sturm_Graz', 'rapid-wien': 'Rapid_Vienna',
    'austria-wien': 'Austria_Wien', lask: 'LASK', 'wolfsberger-ac': 'Wolfsberg', 'tsv-hartberg': 'Hartberg',
    'scr-altach': 'Altach',
    'wacker-innsbruck': 'FC_Wacker_Innsbruck', 'grazer-ak': 'Grazer_AK',
  },
  greece: {
    olympiacos: 'Olympiacos', paok: 'PAOK', 'aek-athens': 'AEK_Athens', panathinaikos: 'Panathinaikos',
    aris: 'Aris_Thessaloniki', 'ofi-crete': 'OFI', levadiakos: 'Levadiakos', atromitos: 'Atromitos',
    panionios: 'Panionios', iraklis: 'Iraklis_Thessaloniki',
  },
  belgium: {
    'club-brugge': 'Club_Brugge',
    anderlecht: 'RSC_Anderlecht', 'standard-liege': 'Standard_Liège', genk: 'KRC_Genk', 'union-sg': 'Union_Saint-Gilloise', gent: 'KAA_Gent', antwerp: 'Royal_Antwerp_FC', mechelen: 'KV_Mechelen', 'sint-truiden': 'Sint-Truidense_VV', 'zulte-waregem': 'Zulte_Waregem',
  },
  ukraine: {
    'shakhtar-donetsk': 'Shakhtar',
    'dynamo-kyiv': 'Dynamo_Kyiv',
  },
  denmark: {
    'fc-copenhagen': 'F.C._Copenhagen',
    brondby: 'Brøndby_IF', midtjylland: 'FC_Midtjylland', agf: 'AGF', aab: 'AaB', nordsjaelland: 'FC_Nordsjælland', ob: 'OB', esbjerg: 'Esbjerg', lyngby: 'Lyngby',
  },
  norway: {
    'bodo-glimt': 'BodøGlimt',
  },
  serbia: {
    'red-star-belgrade': 'Crvena_Zvezda',
  },
  'czech-republic': {
    'slavia-prague': 'SK_Slavia_Praha',
    'sparta-prague': 'AC_Sparta_Praha',
  },
  croatia: {
    'dinamo-zagreb': 'GNK_Dinamo_Zagreb',
  },
  switzerland: {
    'fc-basel': 'Basel',
    'young-boys': 'Young_Boys', grasshoppers: 'Grasshoppers', 'fc-zurich': 'Zürich', servette: 'Servette', lugano: 'Lugano', 'st-gallen': 'St._Gallen', 'fc-sion': 'Sion', xamax: 'Xamax', luzern: 'Luzern',
  },
  argentina: {
    'river-plate': 'River_Plate', 'boca-juniors': 'Boca_Juniors', 'racing-club': 'Racing',
    estudiantes: 'Estudiantes_de_La_Plata', 'velez-sarsfield': 'Vélez_Sarsfield',
    'rosario-central': 'Rosario_Central', lanus: 'Lanús', 'argentinos-juniors': 'Argeninos_Juniors',
    independiente: 'Independiente', talleres: 'Talleres', 'san-lorenzo': 'San_Lorenzo_de_Almagro',
    huracan: 'CA_Huracán', platense: 'Platense', belgrano: 'Belgrano', 'union-santa-fe': 'Union',
    'newells-old-boys': 'Newell\'s_Old_Boys',
    'gimnasia-lp': 'Gimnasia_LP', banfield: 'Banfield', colon: 'Club_Atlético_Colón', 'ferro-carril-oeste': 'Ferro_Carril_Oeste',
  },
  brazil: {
    flamengo: 'Flamengo', palmeiras: 'Palmeiras', cruzeiro: 'Cruzeiro', botafogo: 'Botafogo_FR',
    fluminense: 'Fluminense', bahia: 'Bahia', 'sao-paulo': 'São_Paulo', corinthians: 'Corinthians',
    'atletico-mineiro': 'Atlético_Mineiro', internacional: 'Internacional', gremio: 'Grêmio',
    'vasco-da-gama': 'Vasco_da_Gama', santos: 'Santos_FC', mirassol: 'Mirassol',
    'red-bull-bragantino': 'RB_Bragantino', fortaleza: 'Fortaleza',
    'athletico-pr': 'Athletico_Paranaense', 'sport-recife': 'Sport_Recife', guarani: 'Guarani', 'vitoria-ba': 'Vitória',
  },
  mexico: {
    toluca: 'Toluca', 'america-mex': 'Club_America', 'cruz-azul': 'Cruz_Azul', 'tigres-uanl': 'Tigres_UANL',
    monterrey: 'Monterrey', pachuca: 'Pachuca', guadalajara: 'CD_Guadalajara', 'pumas-unam': 'UNAM_Pumas',
    'santos-laguna': 'Santos_Laguna', leon: 'Club_Leon', atlas: 'Atlas', necaxa: 'Necaxa', tijuana: 'Club_Tijuana', puebla: 'Puebla', queretaro: 'Queretaro_FC', atlante: 'Atlante_FC', 'atletico-morelia': 'Club_Atlético_Morelia', 'toros-neza': 'Toros_Neza', veracruz: 'CD_Veracruz', 'atletico-san-luis': 'Atletico_de_San_Luis',
  },
  usa: {
    'vancouver-whitecaps': 'Vancouver_Whitecaps_FC', 'toronto-fc': 'Toronto_FC', 'cf-montreal': 'CF_Montréal',
    'inter-miami': 'Inter_Miami_CF', lafc: 'Los_Angeles_Football_Club',
    'philadelphia-union': 'Philadelphia_Union', 'fc-cincinnati': 'FC_Cincinnati',
    'san-diego-fc': 'San_Diego_Football_Club', 'columbus-crew': 'Columbus_Crew',
    'seattle-sounders': 'Seattle_Sounders_FC', 'nashville-sc': 'Nashville_SC',
    'la-galaxy': 'Los_Angeles_Galaxy', 'dc-united': 'DC_United',
  },
  colombia: {
    'atletico-nacional': 'Atlético_Nacional', 'junior-col': 'Atlético_Junior', millonarios: 'Millonarios',
    'america-cali': 'América_de_Cali', 'santa-fe-col': 'Independiente_Santa_Fe',
    'deportes-tolima': 'Deportes_Tolima', 'independiente-medellin': 'Independiente_Medellín',
    'once-caldas': 'Once_Caldas',
    'deportivo-cali': 'Deportivo_Cali', envigado: 'Envigado',
  },
  ecuador: {
    'ldu-quito': 'Liga_de_Quito', 'independiente-del-valle': 'Independiente_del_Valle',
    'barcelona-sc': 'Barcelona_SC',
  },
  uruguay: {
    penarol: 'Peñarol', 'nacional-uru': 'Nacional',
  },
  chile: {
    'colo-colo': 'Colo_Colo', 'universidad-de-chile': 'Universidad_de_Chile',
    'universidad-catolica': 'Universidad_Católica', cobreloa: 'Cobreloa', palestino: 'Palestino', 'santiago-wanderers': 'Santiago_Wanderers', 'union-espanola': 'Unión_Española', ohiggins: 'O\'Higgins', 'audax-italiano': 'Audax_Italiano', 'everton-chi': 'Everton_de_Viña_del_Mar',
  },
  paraguay: {
    libertad: 'Libertad', 'cerro-porteno': 'Cerro_Porteño',
    olimpia: 'Olimpia',
  },
  japan: {
    'kashima-antlers': 'Kashima_Antlers', 'kashiwa-reysol': 'Kashiwa_Reysol', 'kyoto-sanga': 'Kyoto_Sanga',
    'sanfrecce-hiroshima': 'Sanfrecce_Hiroshima', 'vissel-kobe': 'Vissel_Kobe',
    'machida-zelvia': 'Machida_Zelvia', 'urawa-reds': 'Urawa_Reds', 'kawasaki-frontale': 'Kawasaki_Frontale',
    'gamba-osaka': 'Gamba_Osaka', 'yokohama-f-marinos': 'Yokohama_F._Marinos', 'cerezo-osaka': 'Cerezo_Osaka', 'nagoya-grampus': 'Nagoya_Grampus', 'fc-tokyo': 'FC_Tokyo', 'jubilo-iwata': 'Jubilo_Iwata', 'shimizu-s-pulse': 'Shimizu_S-Pulse', 'tokyo-verdy': 'Tokyo_Verdy', 'jef-united': 'JEF_United_Chiba', 'consadole-sapporo': 'Hokkaido_Consadole_Sapporo', 'albirex-niigata': 'Albirex_Niigata', 'sagan-tosu': 'Sagan_Tosu',
  },
  qatar: {
    'al-sadd': 'Al_Sadd', 'al-duhail': 'Al_Duhail', 'al-gharafa': 'Al_Gharafa',
  },
  uae: {
    'al-ain': 'Al_Ain_FC', 'shabab-al-ahli': 'Shabab_Al_Ahli_Dubai_FC', sharjah: 'Sharjah_FC',
  },
  iran: {
    persepolis: 'Persepolis', tractor: 'Tractor',
    esteghlal: 'Esteghlal',
  },
  'south-korea': {
    'fc-seoul': 'FC_Seoul',
    'ulsan-hd': 'Ulsan_HD_FC', 'jeonbuk-hyundai': 'Jeonbuk', 'pohang-steelers': 'Pohang_Steelers',
  },
  china: {
    'shandong-taishan': 'Shandong_Taishan',
    'shanghai-port': 'Shanghai_Port', 'shanghai-shenhua': 'Shanghai_Shenhua',
    'chengdu-rongcheng': 'Chengdu_Rongcheng',
  },
  australia: {
    'melbourne-city': 'Melbourne_City_FC',
    'sydney-fc': 'Sydney_FC',
    'melbourne-victory': 'Melbourne_Victory_FC', 'western-sydney': 'Western_Sydney_Wanderers_FC', 'brisbane-roar': 'Brisbane_Roar_FC',
    'adelaide-united': 'Adelaide_United_FC', 'central-coast': 'Central_Coast_Mariners_FC',
  },
  'new-zealand': {
    'auckland-city': 'Auckland_City_FC', 'auckland-fc': 'Auckland_FC', 'wellington-phoenix': 'Wellington_Phoenix_FC',
  },
  'costa-rica': {
    saprissa: 'Deportivo_Saprissa', alajuelense: 'Liga_Deportiva_Alajuelense', herediano: 'Club_Sport_Herediano',
  },
  guatemala: {
    'municipal-gua': 'CSD_Municipal',
  },
  canada: {
    'forge-fc': 'Forge',
  },
  thailand: {
    'buriram-united': 'Buriram_United',
  },
  'saudi-arabia': {
    'al-hilal': 'Al_Hilal', 'al-nassr': 'Al_Nassr', 'al-ittihad': 'Al_Ittihad', 'al-ahli-sau': 'Al_Ahli',
    'al-qadsiah': 'Al_Qadsiah', 'al-ettifaq': 'Al_Ettifaq', 'al-shabab-sau': 'Al_Shabab',
    'al-taawoun': 'Al_Taawoun',
    'al-fateh': 'Al_Fateh', 'al-fayha': 'Al_Fayha',
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
    ismaily: 'Ismaily_SC', 'ghazl-el-mahalla': 'Ghazl_El_Mahalla',
  },
  'south-africa': {
    'mamelodi-sundowns': 'Mamelodi_Sundowns', 'orlando-pirates': 'Orlando_Pirates',
    'kaizer-chiefs': 'Kaizer_Chiefs',
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
  hungary: {
    ferencvaros: 'Ferencváros',
  },
  sweden: {
    'malmo-ff': 'Malmö',
  },
  poland: {
    'legia-warsaw': 'Legia_Warszawa',
  },
  peru: {
    universitario: 'Universitario_de_Deportes', 'alianza-lima': 'Alianza_Lima',
  },
  uzbekistan: {
    pakhtakor: 'Pakhtakor',
  },
};

export const PNG_BADGES = {
  spain: {
    'real-madrid': 'real-madrid', barcelona: 'fc-barcelona', atletico: 'atletico-de-madrid',
    athletic: 'athletic-bilbao', villarreal: 'villarreal-cf', betis: 'real-betis-balompie',
    'real-sociedad': 'real-sociedad', celta: 'celta-de-vigo', sevilla: 'sevilla-fc', valencia: 'valencia-cf',
    osasuna: 'ca-osasuna', rayo: 'rayo-vallecano', girona: 'girona-fc', mallorca: 'rcd-mallorca',
    getafe: 'getafe-cf', espanyol: 'rcd-espanyol-barcelona',
    alaves: 'deportivo-alaves', levante: 'levante-ud', oviedo: 'real-oviedo', elche: 'elche-cf',
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
    volendam: 'fc-volendam',
  },
  turkiye: {
    galatasaray: 'galatasaray', fenerbahce: 'fenerbahce', besiktas: 'besiktas-jk',
    trabzonspor: 'trabzonspor', basaksehir: 'basaksehir-fk', goztepe: 'goztepe', samsunspor: 'samsunspor',
    alanyaspor: 'alanyaspor',
    konyaspor: 'konyaspor',
  },
  scotland: {
    celtic: 'celtic-fc', rangers: 'rangers-fc', hearts: 'heart-of-midlothian-fc', aberdeen: 'aberdeen-fc',
    hibernian: 'hibernian-fc', motherwell: 'motherwell-fc', 'dundee-united': 'dundee-united-fc',
    'st-mirren': 'st-mirren-fc',
    kilmarnock: 'kilmarnock-fc', 'dundee-fc': 'dundee-fc',
  },
  austria: {
    'red-bull-salzburg': 'red-bull-salzburg', 'sturm-graz': 'sk-sturm-graz', 'rapid-wien': 'rapid-vienna',
    'austria-wien': 'austria-vienna', lask: 'lask', 'wolfsberger-ac': 'wolfsberger-ac',
    'tsv-hartberg': 'tsv-hartberg', 'scr-altach': 'scr-altach',
    'grazer-ak': 'grazer-ak-1902',
  },
  greece: {
    olympiacos: 'olympiacos-piraeus', paok: 'paok-thessaloniki', 'aek-athens': 'aek-athens',
    panathinaikos: 'panathinaikos-fc', aris: 'aris-thessaloniki', 'ofi-crete': 'ofi-crete-fc',
    levadiakos: 'apo-levadiakos', atromitos: 'atromitos-athens',
  },
  belgium: {
    'club-brugge': 'club-brugge-kv',
    anderlecht: 'rsc-anderlecht', 'standard-liege': 'standard-liege', genk: 'krc-genk', 'union-sg': 'union-saint-gilloise', gent: 'kaa-gent', antwerp: 'royal-antwerp-fc', mechelen: 'kv-mechelen', 'sint-truiden': 'sint-truidense-vv', 'zulte-waregem': 'zulte-waregem',
  },
  ukraine: {
    'shakhtar-donetsk': 'shakhtar-donetsk',
    'dynamo-kyiv': 'dynamo-kyiv',
  },
  denmark: {
    'fc-copenhagen': 'fc-copenhagen',
    brondby: 'brondby-if', midtjylland: 'fc-midtjylland', agf: 'aarhus-gf', nordsjaelland: 'fc-nordsjaelland', ob: 'odense-boldklub', vejle: 'vejle-boldklub',
  },
  norway: {
    'bodo-glimt': 'fk-bodglimt',
  },
  serbia: {
    'red-star-belgrade': 'red-star-belgrade',
  },
  'czech-republic': {
    'slavia-prague': 'sk-slavia-prague',
    'sparta-prague': 'ac-sparta-prague',
  },
  croatia: {
    'dinamo-zagreb': 'gnk-dinamo-zagreb',
  },
  switzerland: {
    'fc-basel': 'fc-basel-1893',
    'young-boys': 'bsc-young-boys', 'fc-zurich': 'fc-zurich', servette: 'servette-fc', lugano: 'fc-lugano', 'st-gallen': 'fc-st-gallen-1879', 'fc-sion': 'fc-sion', luzern: 'fc-luzern',
  },
  sweden: {
    'malmo-ff': 'malmo-ff',
  },
  poland: {
    'legia-warsaw': 'legia-warszawa',
  },
};

// Division country → source folder, for clubs without an entry above (file name guessed from the club name).
const COUNTRY_FOLDER = {
  Spain: 'spain', England: 'england', Italy: 'italy', Germany: 'germany', France: 'france', Portugal: 'portugal',
  Netherlands: 'netherlands', Argentina: 'argentina', Brazil: 'brazil', Turkey: 'turkey', Scotland: 'scotland',
  Austria: 'austria', Greece: 'greece', Mexico: 'mexico', USA: 'usa', Colombia: 'colombia', Japan: 'japan',
  'Saudi Arabia': 'saudi-arabia', Nigeria: 'nigeria', Egypt: 'egypt',
  Belgium: 'belgium', Switzerland: 'switzerland', Denmark: 'denmark', Chile: 'chile',
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
