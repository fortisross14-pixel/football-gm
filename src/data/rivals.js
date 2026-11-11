// Historical rivalries. A club can belong to more than one group (Barcelona: Madrid and Espanyol).
// Derbies pay double revenue and move the fans twice as much (owners a little more).

export const RIVAL_GROUPS = [
  // Spain
  { name: 'El Clásico / Madrid derby', clubs: ['real-madrid', 'barcelona', 'atletico'] },
  { name: 'Derbi sevillano', clubs: ['betis', 'sevilla'] },
  { name: 'Derbi vasco', clubs: ['athletic', 'real-sociedad'] },
  { name: 'Derbi barceloní', clubs: ['barcelona', 'espanyol'] },
  { name: 'Derbi de la Comunitat', clubs: ['valencia', 'villarreal'] },
  { name: 'Derbi asturiano', clubs: ['sporting', 'racing'] },
  { name: 'Derbi gallego', clubs: ['celta', 'depor'] },
  { name: 'Derbi madrileño del sur', clubs: ['rayo', 'getafe'] },
  { name: 'Derbi andaluz oriental', clubs: ['granada', 'almeria', 'malaga'] },
  // England
  { name: 'North-West giants', clubs: ['man-city', 'man-united', 'liverpool'] },
  { name: 'London derby', clubs: ['arsenal', 'tottenham', 'chelsea'] },
  { name: 'Merseyside derby', clubs: ['liverpool', 'everton'] },
  { name: 'Tyne–Wear derby', clubs: ['newcastle', 'sunderland'] },
  { name: 'West London / East London', clubs: ['west-ham', 'fulham', 'brentford'] },
  { name: 'Midlands derby', clubs: ['aston-villa', 'wolves', 'nottm-forest', 'leicester'] },
  { name: 'South Coast derby', clubs: ['southampton', 'brighton', 'bournemouth', 'crystal-palace'] },
  { name: 'Roses', clubs: ['leeds', 'man-united'] },
  // Italy
  { name: "Derby d'Italia / Madonnina", clubs: ['juventus', 'inter', 'milan'] },
  { name: 'Derby della Capitale', clubs: ['roma', 'lazio'] },
  { name: 'Derby della Lanterna', clubs: ['genoa', 'sampdoria'] },
  { name: 'Derby della Mole', clubs: ['juventus', 'torino'] },
  { name: 'Sud contro Nord', clubs: ['napoli', 'juventus'] },
  { name: "Derby dell'Appennino", clubs: ['fiorentina', 'bologna'] },
  // Germany
  { name: 'Der Klassiker', clubs: ['bayern', 'dortmund'] },
  { name: 'Revierderby', clubs: ['dortmund', 'schalke'] },
  { name: 'Nordderby', clubs: ['hamburg', 'werder-bremen', 'st-pauli'] },
  { name: 'Rheinderby', clubs: ['koln', 'gladbach'] },
  { name: 'Berlin derby', clubs: ['hertha', 'union-berlin'] },
  { name: 'Südwest derby', clubs: ['stuttgart', 'karlsruhe', 'kaiserslautern'] },
  // France
  { name: 'Le Classique', clubs: ['psg', 'marseille'] },
  { name: 'Derby du Rhône / Nord', clubs: ['lyon', 'lens', 'lille'] },
  { name: 'Derby de la Côte', clubs: ['monaco', 'nice'] },
  { name: 'Derby breton', clubs: ['rennes', 'nantes', 'brest', 'lorient'] },
  // Portugal, Netherlands
  { name: 'O Clássico / Derby de Lisboa', clubs: ['benfica', 'porto', 'sporting-cp'] },
  { name: 'Derby do Minho', clubs: ['braga', 'vitoria-sc'] },
  { name: 'De Klassieker', clubs: ['ajax', 'feyenoord', 'psv'] },
  { name: 'Derby of the East', clubs: ['twente', 'heracles', 'go-ahead-eagles', 'pec-zwolle'] },
  // Turkey, Scotland, Austria, Greece, rest of Europe
  { name: 'Kıtalararası derbi', clubs: ['galatasaray', 'fenerbahce', 'besiktas'] },
  { name: 'Old Firm', clubs: ['celtic', 'rangers'] },
  { name: 'Edinburgh derby', clubs: ['hearts', 'hibernian'] },
  { name: 'Wiener derby', clubs: ['rapid-wien', 'austria-wien'] },
  { name: 'Salzburg–Graz', clubs: ['red-bull-salzburg', 'sturm-graz'] },
  { name: 'Derby of the eternal enemies', clubs: ['olympiacos', 'panathinaikos', 'aek-athens'] },
  { name: 'Derby of the North', clubs: ['paok', 'aris'] },
  // South America
  { name: 'Superclásico', clubs: ['river-plate', 'boca-juniors'] },
  { name: 'Clásico de Avellaneda', clubs: ['racing-club', 'independiente'] },
  { name: 'Clásico rosarino', clubs: ['rosario-central', 'newells-old-boys'] },
  { name: 'Clásico platense / San Lorenzo–Huracán', clubs: ['san-lorenzo', 'huracan'] },
  { name: 'Fla-Flu', clubs: ['flamengo', 'fluminense', 'vasco-da-gama', 'botafogo'] },
  { name: 'Clássicos paulistas', clubs: ['corinthians', 'palmeiras', 'sao-paulo', 'santos'] },
  { name: 'Gre-Nal', clubs: ['gremio', 'internacional'] },
  { name: 'Clássico mineiro', clubs: ['cruzeiro', 'atletico-mineiro'] },
  { name: 'Clásico paisa', clubs: ['atletico-nacional', 'independiente-medellin'] },
  { name: 'Clásico capitalino', clubs: ['millonarios', 'santa-fe-col'] },
  { name: 'Clásico vallecaucano', clubs: ['america-cali', 'deportes-tolima'] },
  { name: 'Clásico uruguayo', clubs: ['penarol', 'nacional-uru'] },
  { name: 'Superclásico chileno', clubs: ['colo-colo', 'universidad-de-chile'] },
  { name: 'Superclásico paraguayo', clubs: ['libertad', 'cerro-porteno'] },
  { name: 'Clásico ecuatoriano', clubs: ['ldu-quito', 'independiente-del-valle'] },
  // North America
  { name: 'Clásico Nacional', clubs: ['america-mex', 'guadalajara'] },
  { name: 'Clásico capitalino (MEX)', clubs: ['america-mex', 'cruz-azul', 'pumas-unam'] },
  { name: 'Clásico regiomontano', clubs: ['tigres-uanl', 'monterrey'] },
  { name: 'Hidalgo–Toluca', clubs: ['pachuca', 'toluca'] },
  { name: 'MLS rivals', clubs: ['inter-miami', 'lafc', 'seattle-sounders'] },
  { name: 'Hell is Real', clubs: ['fc-cincinnati', 'columbus-crew'] },
  { name: 'Clásico nacional (CRC)', clubs: ['saprissa', 'alajuelense'] },
  { name: 'Clásico capitalino (HON)', clubs: ['olimpia-hon', 'motagua'] },
  { name: 'Clásico panameño', clubs: ['tauro', 'plaza-amador'] },
  { name: 'Kingston derby', clubs: ['harbour-view', 'cavalier'] },
  // Oceania
  { name: 'Sydney derby', clubs: ['sydney-fc', 'western-sydney'] },
  { name: 'Melbourne derby', clubs: ['melbourne-city', 'melbourne-victory'] },
  { name: 'Auckland derby', clubs: ['auckland-city', 'auckland-fc'] },
  { name: 'New Zealand rivals', clubs: ['auckland-city', 'christchurch-united'] },
  { name: 'Tahiti derby', clubs: ['as-pirae', 'as-venus'] },
  { name: 'Fiji derby', clubs: ['ba-fc', 'rewa-fc'] },
  // Asia, Africa
  { name: 'Riyadh derby / Clásico', clubs: ['al-hilal', 'al-nassr', 'al-ittihad'] },
  { name: 'Jeddah derby', clubs: ['al-ittihad', 'al-ahli-sau'] },
  { name: 'Cairo derby', clubs: ['al-ahly', 'zamalek'] },
  { name: 'Nigerian classic', clubs: ['enyimba', 'kano-pillars', 'shooting-stars'] },
  { name: 'Soweto derby', clubs: ['orlando-pirates', 'mamelodi-sundowns'] },
  { name: 'Casablanca derby', clubs: ['wydad', 'raja-casablanca'] },
  { name: 'J1 Classic', clubs: ['urawa-reds', 'kashima-antlers'] },
  { name: 'Kanagawa / Kansai rivals', clubs: ['kawasaki-frontale', 'vissel-kobe', 'kyoto-sanga'] },
  { name: 'Shanghai derby', clubs: ['shanghai-port', 'shanghai-shenhua'] },
  { name: 'Hyundai derby', clubs: ['ulsan-hd', 'jeonbuk-hyundai'] },
  { name: 'Doha derby', clubs: ['al-sadd', 'al-duhail', 'al-gharafa'] },
  { name: 'Tehran derby', clubs: ['persepolis', 'esteghlal'] },
  // Added with the v1.9 clubs and leagues
  { name: 'Derbi vasco (Alavés)', clubs: ['alaves', 'athletic', 'real-sociedad'] },
  { name: 'Derbi valenciano', clubs: ['levante', 'valencia'] },
  { name: 'East Midlands derby', clubs: ['derby', 'nottm-forest'] },
  { name: 'Black Country derby', clubs: ['west-brom', 'wolves'] },
  { name: 'East Anglian derby', clubs: ['norwich', 'ipswich'] },
  { name: 'East Lancashire derby', clubs: ['blackburn', 'burnley'] },
  { name: 'Munich derby', clubs: ['bayern', 'munich-1860'] },
  { name: 'Rhine derby', clubs: ['fortuna-dusseldorf', 'koln'] },
  { name: 'Ruhr derby (Bochum)', clubs: ['bochum', 'schalke', 'dortmund'] },
  { name: 'Derby du Rhône', clubs: ['lyon', 'saint-etienne'] },
  { name: 'Derby de la Garonne', clubs: ['bordeaux', 'toulouse'] },
  { name: 'Derby della Toscana', clubs: ['empoli', 'fiorentina'] },
  { name: 'Derby di Verona', clubs: ['chievo', 'verona'] },
  { name: 'Derby da Invicta', clubs: ['boavista', 'porto'] },
  { name: 'Lisbon derby (Belenenses)', clubs: ['belenenses', 'sporting-cp', 'benfica'] },
  { name: 'Dundee derby', clubs: ['dundee-fc', 'dundee-united'] },
  { name: 'Styrian derby', clubs: ['grazer-ak', 'sturm-graz'] },
  { name: 'Thessaloniki derby', clubs: ['iraklis', 'paok', 'aris'] },
  { name: 'Le Clasico', clubs: ['anderlecht', 'standard-liege'] },
  { name: 'De Topper', clubs: ['club-brugge', 'anderlecht'] },
  { name: 'Limburg derby', clubs: ['genk', 'sint-truiden'] },
  { name: 'Zürich derby', clubs: ['fc-zurich', 'grasshoppers'] },
  { name: 'Der Klassiker', clubs: ['fc-basel', 'young-boys'] },
  { name: 'New Firm', clubs: ['fc-copenhagen', 'brondby'] },
  { name: 'Prague derby', clubs: ['sparta-prague', 'slavia-prague'] },
  { name: 'Klasychne derby', clubs: ['dynamo-kyiv', 'shakhtar-donetsk'] },
  { name: 'Clásico platense', clubs: ['gimnasia-lp', 'estudiantes'] },
  { name: 'Clásico santafesino', clubs: ['colon', 'union-santa-fe'] },
  { name: 'Ba-Vi', clubs: ['bahia', 'vitoria-ba'] },
  { name: 'Clásico tapatío', clubs: ['guadalajara', 'atlas'] },
  { name: 'El Tráfico', clubs: ['la-galaxy', 'lafc'] },
  { name: 'Clásico vallecaucano', clubs: ['deportivo-cali', 'america-cali'] },
  { name: 'Clásico universitario', clubs: ['universidad-de-chile', 'universidad-catolica'] },
  { name: 'Clásico porteño', clubs: ['santiago-wanderers', 'everton-chi'] },
  { name: 'Clásico del fútbol peruano', clubs: ['universitario', 'alianza-lima'] },
  { name: 'Superclásico paraguayo', clubs: ['olimpia', 'cerro-porteno'] },
  { name: 'Osaka derby', clubs: ['gamba-osaka', 'cerezo-osaka'] },
  { name: 'Tokyo derby', clubs: ['fc-tokyo', 'tokyo-verdy'] },
  { name: 'Shizuoka derby', clubs: ['jubilo-iwata', 'shimizu-s-pulse'] },
  { name: 'Kanagawa derby', clubs: ['yokohama-f-marinos', 'kawasaki-frontale'] },
  { name: 'Soweto derby', clubs: ['kaizer-chiefs', 'orlando-pirates'] },
];

const BY_CLUB = {};
for (const g of RIVAL_GROUPS) {
  for (const id of g.clubs) {
    BY_CLUB[id] = BY_CLUB[id] || { rivals: new Set(), names: [] };
    for (const other of g.clubs) if (other !== id) BY_CLUB[id].rivals.add(other);
    BY_CLUB[id].names.push(g.name);
  }
}

export const rivalsOf = (clubId) => [...(BY_CLUB[clubId]?.rivals || [])];
export const isDerby = (a, b) => !!BY_CLUB[a]?.rivals.has(b);
export function derbyName(a, b) {
  const g = RIVAL_GROUPS.find((x) => x.clubs.includes(a) && x.clubs.includes(b));
  return g ? g.name : null;
}
