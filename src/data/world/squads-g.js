// History pools for the v2.3 confederation clubs: North America Other (Costa Rica, Honduras,
// Guatemala, Canada), the new Oceania league and two East Asian clubs that replaced
// Melbourne City and Sydney FC in East Asia Other.
// x = retired player (card shows him at his peak), n = active player. See data/cardgen.js.
import { card, pools } from '../cardgen.js';

const x = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { id });
const n = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { now: true, id });

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
  herediano: [
    x('Yendrick Ruiz', 'FWD', 64, 'CRC', 'poacher'), n('Keysher Fuller', 'DEF', 66, 'CRC'), n('Leonel Moreira', 'GK', 64, 'CRC', 'shotStopper'),
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
  'toronto-fc': [
    x('Sebastian Giovinco', 'FWD', 74, 'ITA', 'clutch'), x('Michael Bradley', 'MID', 70, 'USA', 'leader'), x('Jozy Altidore', 'FWD', 68, 'USA'),
    n('Jonathan Osorio', 'MID', 66, 'CAN'), n('Federico Bernardeschi', 'MID', 72, 'ITA'),
  ],
  'cf-montreal': [
    x('Ignacio Piatti', 'MID', 70, 'ARG', 'playmaker'), x('Patrice Bernier', 'MID', 64, 'CAN', 'leader'), x('Evan Bush', 'GK', 64, 'USA'),
    n('Samuel Piette', 'MID', 64, 'CAN', 'engine'),
  ],
  'forge-fc': [
    n('Kyle Bekker', 'MID', 64, 'CAN', 'playmaker'), n('Triston Henry', 'GK', 62, 'CAN'), n('Terran Campbell', 'FWD', 62, 'CAN'),
  ],

  // ---- Oceania ----
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
