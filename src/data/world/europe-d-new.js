// Leagues added in v1.9: Belgium, Switzerland, Denmark, Chile, Mexico's Liga de Expansión and
// Japan's J2. Club Brugge, FC Basel, FC Copenhagen, Colo-Colo and Universidad de Chile moved here
// from the "Other" divisions. Ratings and stats are game values.

const c = (id, name, short, rating, formation, passive, primary, secondary, away) => ({
  id, name, short, rating, formation, passive, colors: { primary, secondary, away },
});

export const CLUBS = {
  'bel-1': [
    c('club-brugge', 'Club Brugge', 'BRU', 74, '2-3-1', 'tactician', '#0072ce', '#000000', '#ffffff'),
    c('anderlecht', 'Anderlecht', 'AND', 76, '2-3-1', 'tactician', '#5a2a82', '#ffffff', '#ffffff'),
    c('standard-liege', 'Standard Liège', 'STA', 73, '3-2-1', 'motivator', '#e2001a', '#ffffff', '#ffffff'),
    c('genk', 'Genk', 'GNK', 74, '2-3-1', 'fitnessGuru', '#0033a0', '#ffffff', '#ffffff'),
    c('union-sg', 'Union Saint-Gilloise', 'USG', 75, '3-2-1', 'ironDiscipline', '#ffd200', '#0033a0', '#ffffff'),
    c('gent', 'Gent', 'GNT', 73, '2-3-1', 'attackMinded', '#0033a0', '#ffffff', '#ffffff'),
    c('antwerp', 'Royal Antwerp', 'ANT', 73, '3-1-2', 'counterMaster', '#e2001a', '#ffffff', '#ffffff'),
    c('mechelen', 'KV Mechelen', 'KVM', 72, '2-2-2', 'motivator', '#ffd200', '#e2001a', '#ffffff'),
    c('sint-truiden', 'Sint-Truiden', 'STV', 72, '3-2-1', 'counterMaster', '#ffd200', '#0033a0', '#ffffff'),
    c('zulte-waregem', 'Zulte Waregem', 'ZWA', 72, '2-3-1', 'cupSpecialist', '#e2001a', '#ffffff', '#ffffff'),
  ],
  'sui-1': [
    c('fc-basel', 'FC Basel', 'BAS', 67, '2-3-1', 'counterMaster', '#e2001a', '#0033a0', '#ffffff'),
    c('young-boys', 'Young Boys', 'BSC', 70, '2-3-1', 'attackMinded', '#ffd200', '#000000', '#000000'),
    c('grasshoppers', 'Grasshoppers', 'GCZ', 66, '3-2-1', 'tactician', '#0033a0', '#ffffff', '#ffffff'),
    c('fc-zurich', 'FC Zürich', 'FCZ', 67, '2-3-1', 'motivator', '#ffffff', '#0033a0', '#0033a0'),
    c('servette', 'Servette', 'SER', 67, '3-1-2', 'counterMaster', '#8b1e3f', '#ffffff', '#ffffff'),
    c('lugano', 'Lugano', 'LUG', 66, '2-2-2', 'fitnessGuru', '#000000', '#ffffff', '#ffffff'),
    c('st-gallen', 'St. Gallen', 'STG', 65, '3-2-1', 'ironDiscipline', '#00843d', '#ffffff', '#ffffff'),
    c('fc-sion', 'Sion', 'SIO', 65, '2-3-1', 'cupSpecialist', '#ffffff', '#e2001a', '#e2001a'),
    c('xamax', 'Neuchâtel Xamax', 'NEX', 63, '3-2-1', 'motivator', '#e2001a', '#000000', '#ffffff'),
    c('luzern', 'Luzern', 'LUZ', 64, '2-3-1', 'tactician', '#0033a0', '#ffffff', '#ffffff'),
  ],
  'den-1': [
    c('fc-copenhagen', 'FC Copenhagen', 'FCK', 70, '3-2-1', 'motivator', '#ffffff', '#001e62', '#001e62'),
    c('brondby', 'Brøndby', 'BIF', 69, '2-3-1', 'motivator', '#ffd200', '#0033a0', '#0033a0'),
    c('midtjylland', 'Midtjylland', 'FCM', 70, '2-2-2', 'fitnessGuru', '#000000', '#e2001a', '#ffffff'),
    c('agf', 'AGF Aarhus', 'AGF', 65, '3-2-1', 'ironDiscipline', '#ffffff', '#000000', '#000000'),
    c('aab', 'AaB Aalborg', 'AAB', 65, '2-3-1', 'tactician', '#e2001a', '#ffffff', '#ffffff'),
    c('nordsjaelland', 'Nordsjælland', 'FCN', 67, '2-2-2', 'attackMinded', '#e2001a', '#ffd200', '#ffffff'),
    c('ob', 'OB Odense', 'OBO', 64, '3-1-2', 'counterMaster', '#0033a0', '#ffffff', '#ffffff'),
    c('vejle', 'Vejle', 'VBK', 63, '3-2-1', 'motivator', '#e2001a', '#ffffff', '#ffffff'),
    c('esbjerg', 'Esbjerg', 'EFB', 62, '2-3-1', 'counterMaster', '#0033a0', '#ffffff', '#ffffff'),
    c('lyngby', 'Lyngby', 'LBK', 63, '3-2-1', 'fitnessGuru', '#0033a0', '#ffffff', '#ffffff'),
  ],
  'chi-1': [
    c('colo-colo', 'Colo-Colo', 'COL', 67, '2-2-2', 'motivator', '#ffffff', '#000000', '#000000'),
    c('universidad-de-chile', 'Universidad de Chile', 'UCH', 67, '2-3-1', 'attackMinded', '#0033a0', '#d71920', '#ffffff'),
    c('universidad-catolica', 'Universidad Católica', 'UCA', 68, '2-3-1', 'tactician', '#ffffff', '#0033a0', '#0033a0'),
    c('cobreloa', 'Cobreloa', 'CLO', 65, '3-2-1', 'ironDiscipline', '#f47920', '#ffffff', '#ffffff'),
    c('palestino', 'Palestino', 'PAL', 64, '3-1-2', 'motivator', '#00843d', '#ffffff', '#e2001a'),
    c('santiago-wanderers', 'Santiago Wanderers', 'SWA', 63, '2-3-1', 'counterMaster', '#00843d', '#ffffff', '#ffffff'),
    c('union-espanola', 'Unión Española', 'UES', 63, '3-2-1', 'fitnessGuru', '#e2001a', '#ffd200', '#ffffff'),
    c('ohiggins', 'O\'Higgins', 'OHI', 63, '2-2-2', 'attackMinded', '#00a9e0', '#ffffff', '#ffffff'),
    c('audax-italiano', 'Audax Italiano', 'AUD', 62, '2-3-1', 'tactician', '#00843d', '#ffffff', '#ffffff'),
    c('everton-chi', 'Everton (Viña del Mar)', 'EVE', 62, '3-1-2', 'counterMaster', '#0033a0', '#ffd200', '#ffffff'),
  ],
  'mex-2': [
    c('atlas', 'Atlas', 'ATS', 70, '2-3-1', 'motivator', '#e2001a', '#000000', '#ffffff'),
    c('necaxa', 'Necaxa', 'NEC', 68, '3-2-1', 'tactician', '#e2001a', '#ffffff', '#ffffff'),
    c('tijuana', 'Club Tijuana', 'TIJ', 68, '2-2-2', 'attackMinded', '#e2001a', '#000000', '#ffffff'),
    c('puebla', 'Puebla', 'PUE', 66, '3-2-1', 'ironDiscipline', '#ffffff', '#0033a0', '#0033a0'),
    c('queretaro', 'Querétaro', 'QRO', 66, '2-3-1', 'counterMaster', '#0033a0', '#000000', '#ffffff'),
    c('atlante', 'Atlante', 'ATL', 66, '3-1-2', 'motivator', '#0033a0', '#e2001a', '#ffffff'),
    c('atletico-morelia', 'Atlético Morelia', 'MOR', 65, '2-3-1', 'fitnessGuru', '#ffd200', '#e2001a', '#ffffff'),
    c('toros-neza', 'Toros Neza', 'NEZ', 63, '2-2-2', 'attackMinded', '#e2001a', '#ffd200', '#ffffff'),
    c('veracruz', 'Veracruz', 'VER', 63, '3-2-1', 'counterMaster', '#e2001a', '#0033a0', '#ffffff'),
    c('atletico-san-luis', 'Atlético San Luis', 'ASL', 65, '2-3-1', 'tactician', '#e2001a', '#ffffff', '#0033a0'),
  ],
  'jpn-2': [
    c('cerezo-osaka', 'Cerezo Osaka', 'CER', 67, '2-3-1', 'attackMinded', '#e6007e', '#0033a0', '#ffffff'),
    c('nagoya-grampus', 'Nagoya Grampus', 'NAG', 66, '3-2-1', 'ironDiscipline', '#e2001a', '#f47920', '#ffffff'),
    c('fc-tokyo', 'FC Tokyo', 'TOK', 66, '2-3-1', 'tactician', '#0033a0', '#e2001a', '#ffffff'),
    c('jubilo-iwata', 'Júbilo Iwata', 'JUB', 66, '2-3-1', 'tactician', '#6cadd7', '#ffffff', '#ffffff'),
    c('shimizu-s-pulse', 'Shimizu S-Pulse', 'SHI', 65, '3-1-2', 'fitnessGuru', '#f47920', '#ffffff', '#ffffff'),
    c('tokyo-verdy', 'Tokyo Verdy', 'VRD', 64, '2-2-2', 'motivator', '#00843d', '#ffffff', '#ffffff'),
    c('jef-united', 'JEF United Chiba', 'JEF', 63, '3-2-1', 'counterMaster', '#ffd200', '#00843d', '#ffffff'),
    c('consadole-sapporo', 'Consadole Sapporo', 'SAP', 63, '2-3-1', 'attackMinded', '#e2001a', '#000000', '#ffffff'),
    c('albirex-niigata', 'Albirex Niigata', 'ALB', 63, '3-2-1', 'fitnessGuru', '#f47920', '#0033a0', '#ffffff'),
    c('sagan-tosu', 'Sagan Tosu', 'TOS', 62, '3-1-2', 'ironDiscipline', '#6cadd7', '#e6007e', '#ffffff'),
  ],
};

const p = (id, name, pos, rarity, att, def, phy, trait, matchesLeft, nation, clubId) => ({
  id, name, pos, rarity, att, def, phy, trait, matchesLeft, nation, clubId,
});

export const PLAYERS = [
  p('p-hans-vanaken', 'Hans Vanaken', 'MID', 'rare', 80, 68, 72, 'playmaker', 115, 'BEL', 'club-brugge'),
  p('p-youssoufa-moukoko', 'Youssoufa Moukoko', 'FWD', 'rare', 74, 34, 70, null, 175, 'GER', 'fc-copenhagen'),
  p('p-xherdan-shaqiri', 'Xherdan Shaqiri', 'MID', 'rare', 82, 56, 64, 'playmaker', 90, 'SUI', 'fc-basel'),
  p('p-arturo-vidal', 'Arturo Vidal', 'MID', 'rare', 70, 70, 70, 'leader', 70, 'CHI', 'colo-colo'),
  p('p-charles-aranguiz', 'Charles Aránguiz', 'MID', 'rare', 70, 68, 66, null, 75, 'CHI', 'universidad-de-chile'),
];

