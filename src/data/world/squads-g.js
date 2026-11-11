// History pools for the v2.3/v2.4 confederation clubs: North America Other (Costa Rica, Honduras,
// Guatemala, Canada, Panama, Jamaica), the A-League, Oceania Other and two East Asian clubs that
// replaced Melbourne City and Sydney FC in East Asia Other.
// x = retired player (card shows him at his peak), n = active player. See data/cardgen.js.
// f = an invented player (fictional: true) for clubs whose real squads we don't know well
// (Panama, Jamaica and the Pacific island clubs): plausible names, tier-3 ratings.
import { card, pools } from '../cardgen.js';

const x = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { id });
const n = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { now: true, id });
const f = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { fictional: true, id });

export const { SQUADS, PLAYERS } = pools({
  // ---- North America Other ----
  saprissa: [
    x('Hernán Medford', 'FWD', 68, 'CRC', 'clutch'), x('Walter Centeno', 'MID', 68, 'CRC', 'playmaker'), x('Álvaro Saborío', 'FWD', 68, 'CRC', 'poacher'),
    x('Christian Bolaños', 'MID', 66, 'CRC'),
  ],
  alajuelense: [
    x('Wílmer López', 'MID', 68, 'CRC', 'playmaker'), x('Bryan Ruiz', 'MID', 70, 'CRC', 'clutch'), x('Mauricio Montero', 'DEF', 66, 'CRC', 'leader'),
    x('Óscar Ramírez', 'MID', 66, 'CRC'), x('Patrick Pemberton', 'GK', 64, 'CRC'),
  ],
  'olimpia-hon': [
    x('Wilson Palacios', 'MID', 68, 'HON', 'engine'), x('Maynor Figueroa', 'DEF', 68, 'HON', 'wall'), x('Noel Valladares', 'GK', 66, 'HON', 'shotStopper'),
    n('Jorge Benguché', 'FWD', 64, 'HON'),
  ],
  motagua: [
    x('Amado Guevara', 'MID', 70, 'HON', 'playmaker'), x('Emilio Izaguirre', 'DEF', 66, 'HON'), n('Rubilio Castillo', 'FWD', 64, 'HON', 'poacher'),
  ],
  'municipal-gua': [
    x('Carlos Ruiz', 'FWD', 70, 'GUA', 'poacher', 'p-carlos-ruiz-gua'), x('Juan Carlos Plata', 'FWD', 66, 'GUA'), x('Guillermo Ramírez', 'MID', 66, 'GUA'),
    x('Marco Pappa', 'MID', 66, 'GUA'),
  ],
  'vancouver-whitecaps': [
    n('Ryan Gauld', 'MID', 70, 'SCO', 'playmaker'), n('Brian White', 'FWD', 68, 'USA', 'poacher'), n('Yohei Takaoka', 'GK', 66, 'JPN'),
    n('Alphonso Davies', 'DEF', 74, 'CAN', 'engine'),
  ],

  tauro: [
    f('Rolando Cedeño', 'FWD', 65, 'PAN', 'poacher'), f('Aníbal Quintero', 'MID', 64, 'PAN', 'playmaker'), f('Edwin Batista', 'DEF', 63, 'PAN'),
    f('Jaime Ortega', 'GK', 63, 'PAN'),
  ],
  'plaza-amador': [
    f('Luis Ábrego', 'FWD', 64, 'PAN'), f('Ricardo Bósquez', 'MID', 63, 'PAN', 'engine'), f('Omar Villarreal', 'DEF', 63, 'PAN', 'leader'),
  ],
  cavalier: [
    f('Shamar Whyte', 'FWD', 64, 'JAM', 'poacher'), f('Kemoy Grant', 'MID', 63, 'JAM'), f('Dane Barrett', 'DEF', 63, 'JAM', 'wall'),
  ],
  'harbour-view': [
    x('Ricardo Gardner', 'DEF', 66, 'JAM', 'engine'), f('Tevin Brissett', 'FWD', 63, 'JAM'), f('Jermaine Lawes', 'MID', 62, 'JAM'),
  ],

  // ---- Oceania: Auckland City (Oceania Other), then the A-League ----
  'auckland-city': [
    x('Ivan Vicelich', 'DEF', 66, 'NZL', 'leader'), n('Emiliano Tade', 'FWD', 64, 'ARG', 'poacher'), n('Ryan De Vries', 'FWD', 62, 'NZL'),
    n('Ángel Berlanga', 'MID', 62, 'ESP'), n('Conor Tracey', 'GK', 62, 'NZL'),
  ],
  'wellington-phoenix': [
    x('Shane Smeltz', 'FWD', 66, 'NZL', 'poacher'), n('Roy Krishna', 'FWD', 68, 'FIJ', 'clutch'), x('Ulises Dávila', 'MID', 66, 'MEX', 'playmaker'),
    x('Glen Moss', 'GK', 64, 'NZL'), x('Andrew Durante', 'DEF', 64, 'NZL', 'leader'),
  ],
  'auckland-fc': [
    n('Guillermo May', 'FWD', 62, 'URU'), n('Alex Paulsen', 'GK', 64, 'NZL'), n('Louis Verstraete', 'MID', 62, 'BEL'), n('Jesse Randall', 'FWD', 62, 'NZL'),
  ],
  'melbourne-victory': [
    x('Archie Thompson', 'FWD', 68, 'AUS', 'poacher'), x('Kevin Muscat', 'DEF', 68, 'AUS', 'leader'), x('Besart Berisha', 'FWD', 68, 'ALB', 'poacher'),
    x('Mark Milligan', 'MID', 66, 'AUS'), n('Lawrence Thomas', 'GK', 62, 'AUS'),
  ],
  'western-sydney': [
    x('Mark Bridge', 'FWD', 64, 'AUS'), x('Ante Covic', 'GK', 66, 'AUS', 'shotStopper'), x('Nikolai Topor-Stanley', 'DEF', 64, 'AUS'),
    x('Youssouf Hersi', 'FWD', 62, 'NED'),
  ],
  'brisbane-roar': [
    x('Thomas Broich', 'MID', 70, 'GER', 'playmaker'), x('Matt McKay', 'MID', 66, 'AUS', 'engine'), x('Henrique', 'FWD', 66, 'BRA', null, 'p-henrique-roar'),
    x('Ivan Franjić', 'DEF', 64, 'AUS'), x('Michael Theo', 'GK', 64, 'AUS'),
  ],
  'adelaide-united': [
    x('Marcelo Carrusca', 'MID', 66, 'ARG', 'playmaker'), x('Bruce Djite', 'FWD', 64, 'AUS'), x('Eugene Galeković', 'GK', 66, 'AUS', 'shotStopper'),
    x('Isaías', 'MID', 64, 'ESP', null, 'p-isaias-adelaide'), n('Craig Goodwin', 'FWD', 66, 'AUS'),
  ],
  'central-coast': [
    x('Mile Jedinak', 'MID', 66, 'AUS', 'leader'), n('Mathew Ryan', 'GK', 72, 'AUS', 'shotStopper'), x('John Hutchinson', 'MID', 64, 'MLT'),
    x('Matt Simon', 'FWD', 62, 'AUS'), x('Danny Vukovic', 'GK', 64, 'AUS'),
  ],

  'macarthur-fc': [
    x('Adam Federici', 'GK', 66, 'AUS', 'shotStopper'), x('Tommy Oar', 'MID', 64, 'AUS'), x('Craig Noone', 'MID', 64, 'ENG'),
    x('Matt Derbyshire', 'FWD', 64, 'ENG', 'poacher'), n('Al Hassan Toure', 'FWD', 64, 'AUS'),
  ],

  // ---- Oceania Other (New Zealand and the Pacific islands) ----
  'christchurch-united': [
    f('Callum Hartley', 'MID', 63, 'NZL', 'playmaker'), f('Josh Tarawhiti', 'FWD', 63, 'NZL'), f('Sam Brightwell', 'DEF', 62, 'NZL'),
  ],
  'ba-fc': [
    f('Sakiusa Vatuvei', 'FWD', 64, 'FIJ', 'poacher'), f('Ilisoni Raikadroka', 'MID', 63, 'FIJ'), f('Josefa Naivalu', 'GK', 62, 'FIJ'),
  ],
  'rewa-fc': [
    f('Tevita Ravuama', 'DEF', 63, 'FIJ', 'leader'), f('Malakai Tuidraki', 'FWD', 63, 'FIJ'), f('Ravinesh Kumar', 'MID', 62, 'FIJ'),
  ],
  'hekari-united': [
    f('Nigel Kauwa', 'FWD', 63, 'PNG'), f('Joseph Waninga', 'MID', 62, 'PNG'), f('Gideon Tamate', 'DEF', 62, 'PNG'),
    f('Peter Ovia', 'GK', 62, 'PNG'),
  ],
  'as-pirae': [
    f('Teva Manutahi', 'FWD', 64, 'TAH', 'clutch'), f('Heimana Tetuanui', 'MID', 63, 'TAH'), f('Raimana Faatau', 'DEF', 62, 'TAH'),
  ],
  'as-venus': [
    f('Hiro Tehaamoana', 'MID', 63, 'TAH', 'engine'), f('Manu Rotui', 'FWD', 62, 'TAH'), f('Vaitea Mahinui', 'GK', 62, 'TAH'),
  ],
  'hienghene-sport': [
    f('Jérémy Wahnyamalla', 'FWD', 64, 'NCL', 'poacher'), f('Kévin Waheo', 'MID', 63, 'NCL'), f('Pierre Ixeco', 'DEF', 62, 'NCL', 'wall'),
  ],
  'solomon-warriors': [
    f('Jonah Ramo', 'FWD', 63, 'SOL'), f('Clement Sau', 'MID', 62, 'SOL'), f('Moses Kakai', 'DEF', 62, 'SOL'),
  ],
  'galaxy-fc': [
    f('Lionel Malas', 'FWD', 63, 'VAN'), f('Tony Tari', 'MID', 62, 'VAN'), f('Eric Natuman', 'DEF', 62, 'VAN'),
  ],

  // ---- East Asia Other ----
  'fc-seoul': [
    x('Park Chu-young', 'FWD', 68, 'KOR', 'poacher'), x('Dejan Damjanović', 'FWD', 68, 'MNE', 'poacher'), n('Jesse Lingard', 'MID', 70, 'ENG', 'clutch'),
    x('Osmar', 'DEF', 66, 'ESP', 'wall', 'p-osmar-seoul'),
  ],
  'shandong-taishan': [
    x('Marouane Fellaini', 'MID', 70, 'BEL', 'engine'), x('Graziano Pellè', 'FWD', 70, 'ITA', 'poacher'), x('Li Xiaopeng', 'MID', 64, 'CHN'),
    n('Wang Dalei', 'GK', 64, 'CHN'),
  ],
});
