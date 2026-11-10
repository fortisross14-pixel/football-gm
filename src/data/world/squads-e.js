// History pools for the European clubs added in v1.9: two more clubs in every division,
// the new Belgian, Swiss and Danish leagues, and the refilled Europe Other.
// x = retired player (card shows him at his peak), n = active player. See data/cardgen.js.
import { card, pools } from '../cardgen.js';

const x = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { id });
const n = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { now: true, id });

export const { SQUADS, PLAYERS } = pools({
  // ---- Spain ----
  alaves: [
    x('Javi Moreno', 'FWD', 74, 'ESP', 'poacher'), x('Jordi Cruyff', 'MID', 70, 'NED'), x('Cosmin Contra', 'DEF', 72, 'ROU'),
    x('Iván Alonso', 'FWD', 68, 'URU'), x('Hermes Desio', 'MID', 67, 'ARG', 'engine'), x('Martín Herrera', 'GK', 68, 'ARG'),
    x('Delfí Geli', 'DEF', 67, 'ESP'), x('Manu García', 'MID', 66, 'ESP', 'leader'),
  ],
  levante: [
    n('José Luis Morales', 'FWD', 71, 'ESP', 'clutch'), n('Roger Martí', 'FWD', 67, 'ESP', 'poacher'), x('Sergio Ballesteros', 'DEF', 69, 'ESP', 'leader'),
    n('Rubén Vezo', 'DEF', 66, 'POR'), n('Aitor Fernández', 'GK', 68, 'ESP'), n('José Campaña', 'MID', 68, 'ESP', 'playmaker'),
    x('Felipe Caicedo', 'FWD', 67, 'ECU'), x('Pedro López', 'DEF', 64, 'ESP'),
  ],
  oviedo: [
    x('Viktor Onopko', 'DEF', 74, 'RUS', 'leader'), x('Slaviša Jokanović', 'MID', 70, 'SRB'), x('Carlos Muñoz', 'FWD', 70, 'ESP', 'poacher'),
    x('Esteban Suárez', 'GK', 67, 'ESP'),
  ],
  elche: [
    x('Nino', 'FWD', 67, 'ESP', 'poacher'), n('Lucas Boyé', 'FWD', 68, 'ARG'), n('Edgar Badia', 'GK', 67, 'ESP'),
    n('Fidel Chaves', 'MID', 66, 'ESP'), x('Marcelo Trobbiani', 'MID', 70, 'ARG', 'playmaker'),
  ],
  cadiz: [
    x('Mágico González', 'FWD', 78, 'SLV', 'clutch'), x('Juan José Jiménez', 'DEF', 64, 'ESP'), n('Salvi Sánchez', 'MID', 64, 'ESP'),
    n('Álex Fernández', 'MID', 65, 'ESP'), n('Choco Lozano', 'FWD', 66, 'HON'),
  ],
  'las-palmas': [
    x('Germán Dévora', 'MID', 72, 'ESP', 'playmaker'), x('Tonono', 'DEF', 70, 'ESP', 'leader'), x('Juan Guedes', 'MID', 68, 'ESP'),
    n('Jonathan Viera', 'MID', 68, 'ESP'), n('Kirian Rodríguez', 'MID', 65, 'ESP'),
  ],

  // ---- England ----
  blackburn: [
    x('Chris Sutton', 'FWD', 76, 'ENG', 'poacher'), x('Tim Sherwood', 'MID', 72, 'ENG', 'leader'), x('Colin Hendry', 'DEF', 75, 'SCO', 'wall'),
    x('Tim Flowers', 'GK', 74, 'ENG'), x('Graeme Le Saux', 'DEF', 73, 'ENG'), x('Stuart Ripley', 'MID', 67, 'ENG'),
    x('Brad Friedel', 'GK', 73, 'USA', 'shotStopper'), x('Damien Duff', 'MID', 73, 'IRL'), x('Ronnie Clayton', 'MID', 70, 'ENG'),
  ],
  derby: [
    x('Steve Bloomer', 'FWD', 78, 'ENG', 'poacher'), x('Kevin Hector', 'FWD', 72, 'ENG'), x('Roy McFarland', 'DEF', 75, 'ENG', 'leader'),
    x('Colin Todd', 'DEF', 74, 'ENG'), x('Archie Gemmill', 'MID', 73, 'SCO', 'engine'), x('Igor Štimac', 'DEF', 70, 'CRO'),
    x('Paulo Wanchope', 'FWD', 69, 'CRC'), x('Alan Hinton', 'MID', 67, 'ENG'), x('Raich Carter', 'FWD', 75, 'ENG', 'playmaker'),
  ],
  'sheffield-wednesday': [
    x('Derek Dooley', 'FWD', 70, 'ENG', 'poacher'), x('David Hirst', 'FWD', 71, 'ENG'),
    x('Des Walker', 'DEF', 72, 'ENG'), x('Ron Springett', 'GK', 70, 'ENG'),
  ],
  'west-brom': [
    x('Tony Brown', 'FWD', 72, 'ENG'), x('Cyrille Regis', 'FWD', 73, 'ENG'), x('Laurie Cunningham', 'MID', 74, 'ENG'),
    x('Jeff Astle', 'FWD', 71, 'ENG', 'poacher'), x('John Wile', 'DEF', 68, 'ENG', 'leader'),
  ],
  stoke: [
    x('Stanley Matthews', 'FWD', 80, 'ENG', 'playmaker'), x('Ryan Shawcross', 'DEF', 67, 'ENG', 'leader'), x('Rory Delap', 'MID', 64, 'IRL'),
    x('Ricardo Fuller', 'FWD', 65, 'JAM'), n('Asmir Begović', 'GK', 68, 'BIH'),
  ],
  norwich: [
    n('Teemu Pukki', 'FWD', 68, 'FIN', 'poacher'), x('Darren Huckerby', 'FWD', 66, 'ENG'), x('Grant Holt', 'FWD', 65, 'ENG'),
    x('Kevin Keelan', 'GK', 66, 'ENG'), x('Wes Hoolahan', 'MID', 67, 'IRL', 'playmaker'),
  ],

  // ---- Italy ----
  brescia: [
    x('Andrea Caracciolo', 'FWD', 70, 'ITA', 'poacher'), x('Dario Hübner', 'FWD', 72, 'ITA', 'poacher'), x('Luca Toni', 'FWD', 76, 'ITA'),
    x('Daniele Adani', 'DEF', 68, 'ITA'), 'p-sandro-tonali', x('Luca Castellazzi', 'GK', 65, 'ITA'), x('Matuzalém', 'MID', 68, 'BRA'),
  ],
  vicenza: [
    x('Paolo Rossi', 'FWD', 82, 'ITA', 'poacher'), x('Pasquale Luiso', 'FWD', 68, 'ITA'), x('Lamberto Zauli', 'MID', 67, 'ITA'),
    x('Marcelo Otero', 'FWD', 67, 'URU'), x('Gustavo Méndez', 'DEF', 67, 'URU'), x('Gabriele Ambrosetti', 'MID', 66, 'ITA'),
    x('Pierluigi Brivio', 'GK', 65, 'ITA'), x('Luís Vinício', 'FWD', 74, 'BRA'),
  ],
  empoli: [
    x('Francesco Tavano', 'FWD', 67, 'ITA'), x('Massimo Maccarone', 'FWD', 68, 'ITA', 'poacher'), n('Riccardo Saponara', 'MID', 66, 'ITA'),
    n('Daniele Rugani', 'DEF', 69, 'ITA'), n('Piotr Zieliński', 'MID', 76, 'POL', 'playmaker'),
  ],
  bari: [
    x('Antonio Cassano', 'FWD', 76, 'ITA', 'clutch'), x('Igor Protti', 'FWD', 70, 'ITA', 'poacher'), x('Phil Masinga', 'FWD', 66, 'RSA'),
    x('Jean-François Gillet', 'GK', 68, 'BEL'), x('Andrea Ranocchia', 'DEF', 68, 'ITA'),
  ],
  perugia: [
    x('Hidetoshi Nakata', 'MID', 75, 'JPN', 'playmaker'), x('Fabrizio Ravanelli', 'FWD', 74, 'ITA'), x('Marco Materazzi', 'DEF', 74, 'ITA', 'wall'),
    x('Ahn Jung-hwan', 'FWD', 68, 'KOR'), x('Renato Curi', 'MID', 66, 'ITA'),
  ],
  chievo: [
    x('Sergio Pellissier', 'FWD', 68, 'ITA', 'leader'), x('Bernardo Corradi', 'FWD', 66, 'ITA'), x('Simone Perrotta', 'MID', 70, 'ITA', 'engine'),
    x('Stefano Sorrentino', 'GK', 67, 'ITA'), x('Eriberto', 'MID', 64, 'BRA'),
  ],

  // ---- Germany ----
  nurnberg: [
    x('Max Morlock', 'FWD', 80, 'GER', 'poacher'), x('Andreas Köpke', 'GK', 76, 'GER', 'shotStopper'), x('Marek Mintál', 'FWD', 70, 'SVK'),
    x('Dieter Eckstein', 'FWD', 69, 'GER'), x('Heinz Strehl', 'FWD', 71, 'GER'), x('Javier Pinola', 'DEF', 66, 'ARG'),
    x('Raphael Schäfer', 'GK', 65, 'GER'), x('Stefan Reuter', 'DEF', 74, 'GER'),
  ],
  'munich-1860': [
    x('Rudi Brunnenmeier', 'FWD', 74, 'GER', 'poacher'), x('Petar Radenković', 'GK', 72, 'SRB'), x('Thomas Häßler', 'MID', 77, 'GER', 'playmaker'),
    x('Martin Max', 'FWD', 70, 'GER'), x('Abedi Pelé', 'MID', 75, 'GHA'), x('Peter Grosser', 'MID', 68, 'GER'),
    x('Benjamin Lauth', 'FWD', 66, 'GER'), x('Bernd Patzke', 'DEF', 67, 'GER'),
  ],
  'fortuna-dusseldorf': [
    x('Klaus Allofs', 'FWD', 75, 'GER', 'poacher'), x('Thomas Allofs', 'FWD', 69, 'GER'), x('Gerd Zewe', 'MID', 68, 'GER'),
    x('Toni Turek', 'GK', 70, 'GER'), x('Rudi Bommer', 'MID', 67, 'GER'),
  ],
  bochum: [
    x('Michael Lameck', 'MID', 67, 'GER', 'engine'), x('Hermann Gerland', 'DEF', 65, 'GER'), x('Yıldıray Baştürk', 'MID', 71, 'TUR', 'playmaker'),
    x('Vahid Hashemian', 'FWD', 67, 'IRN'), x('Rein van Duijnhoven', 'GK', 65, 'NED'),
  ],
  'dynamo-dresden': [
    x('Hans-Jürgen Kreische', 'FWD', 70, 'GER', 'poacher'), x('Hans-Jürgen Dörner', 'DEF', 72, 'GER', 'leader'), x('Torsten Gütschow', 'FWD', 67, 'GER'),
    x('Bernd Jakubowski', 'GK', 65, 'GER'),
  ],
  braunschweig: [
    x('Lothar Ulsaß', 'FWD', 68, 'GER'), x('Bernd Franke', 'GK', 68, 'GER'), x('Ronald Worm', 'FWD', 66, 'GER'),
    x('Danilo Popivoda', 'FWD', 66, 'SRB'), x('Domi Kumbela', 'FWD', 63, 'COD'),
  ],

  // ---- France ----
  'saint-etienne': [
    x('Dominique Rocheteau', 'FWD', 76, 'FRA'), x('Hervé Revelli', 'FWD', 74, 'FRA', 'poacher'), x('Salif Keïta', 'FWD', 75, 'MLI'),
    x('Jean-Michel Larqué', 'MID', 72, 'FRA', 'leader'), x('Ivan Ćurković', 'GK', 74, 'SRB', 'shotStopper'), x('Robert Herbin', 'DEF', 70, 'FRA'),
    x('Rachid Mekhloufi', 'FWD', 73, 'ALG'), x('Loïc Perrin', 'DEF', 67, 'FRA'),
  ],
  bordeaux: [
    x('Alain Giresse', 'MID', 80, 'FRA', 'playmaker'), x('Jean Tigana', 'MID', 78, 'FRA', 'engine'), x('Marius Trésor', 'DEF', 76, 'FRA', 'leader'),
    x('Bixente Lizarazu', 'DEF', 75, 'FRA'), x('Christophe Dugarry', 'FWD', 70, 'FRA'), x('Marouane Chamakh', 'FWD', 68, 'MAR'),
    x('Ulrich Ramé', 'GK', 67, 'FRA'), x('Yoann Gourcuff', 'MID', 72, 'FRA'),
  ],
  montpellier: [
    x('Laurent Blanc', 'DEF', 76, 'FRA', 'leader'), x('Younès Belhanda', 'MID', 67, 'MAR'), x('Roger Milla', 'FWD', 72, 'CMR', 'clutch'),
    n('Rémy Cabella', 'MID', 66, 'FRA'), x('Laurent Pionnier', 'GK', 64, 'FRA'),
  ],
  sochaux: [
    x('Bernard Genghini', 'MID', 70, 'FRA'), x('Yannick Stopyra', 'FWD', 68, 'FRA'), x('Benoît Pedretti', 'MID', 67, 'FRA'),
    x('Joël Bats', 'GK', 70, 'FRA'), x('Stéphane Paille', 'FWD', 66, 'FRA'),
  ],

  // ---- Portugal ----
  boavista: [
    x('Ricardo', 'GK', 72, 'POR', 'shotStopper', 'p-ricardo-gk'), x('Erwin Sánchez', 'MID', 70, 'BOL', 'playmaker'), x('Petit', 'MID', 67, 'POR', 'engine'),
    x('Jimmy Floyd Hasselbaink', 'FWD', 75, 'NED', 'poacher'), x('Elpídio Silva', 'FWD', 66, 'BRA'),
  ],
  maritimo: [
    n('Moussa Marega', 'FWD', 70, 'MLI'), x('Danny', 'MID', 70, 'POR', null, 'p-danny-gomes'), x('Pepe', 'DEF', 75, 'POR', 'wall'),
    x('Edgar Costa', 'MID', 64, 'POR'), x('Baba Diawara', 'FWD', 65, 'SEN'),
  ],
  belenenses: [
    x('Matateu', 'FWD', 74, 'POR', 'poacher'), x('José Pereira', 'GK', 68, 'POR'), x('Vicente Lucas', 'DEF', 68, 'POR'),
    x('Artur Quaresma', 'FWD', 66, 'POR'),
  ],
  'vitoria-setubal': [
    x('Jacinto João', 'MID', 68, 'POR'), x('Vítor Baptista', 'FWD', 67, 'POR'), x('Albert Meyong', 'FWD', 64, 'CMR'),
  ],

  // ---- Netherlands ----
  vitesse: [
    x('Theo Bos', 'DEF', 66, 'NED', 'leader'), x('Nicky Hofs', 'MID', 66, 'NED'), x('Wilfried Bony', 'FWD', 72, 'CIV', 'poacher'),
    x('Martin Laamers', 'MID', 65, 'NED'), x('Raimond van der Gouw', 'GK', 66, 'NED'),
  ],
  'ado-den-haag': [
    x('Aad Mansveld', 'DEF', 68, 'NED', 'leader'), x('Dick Advocaat', 'MID', 64, 'NED'), x('Lex Schoenmaker', 'FWD', 66, 'NED'),
    x('Dmitri Bulykin', 'FWD', 66, 'RUS'), x('Martin Jol', 'MID', 66, 'NED'),
  ],
  volendam: [
    x('Wim Jonk', 'MID', 70, 'NED'), x('Kees Kwakman', 'MID', 64, 'NED'), x('Jack Tuyp', 'FWD', 64, 'NED', 'poacher'),
  ],
  'willem-ii': [
    x('Jaap Stam', 'DEF', 78, 'NED', 'wall'), x('Marc Overmars', 'FWD', 74, 'NED'), x('Frank van der Struijk', 'DEF', 63, 'NED'),
  ],

  // ---- Turkey ----
  bursaspor: [
    x('Volkan Şen', 'FWD', 68, 'TUR'), x('Sercan Yıldırım', 'FWD', 66, 'TUR'), x('Ozan İpek', 'MID', 66, 'TUR'),
    x('Pablo Batalla', 'MID', 68, 'ARG', 'playmaker'), x('Ömer Erdoğan', 'DEF', 66, 'TUR', 'leader'),
  ],
  konyaspor: [
    x('Ömer Ali Şahiner', 'MID', 66, 'TUR', 'leader'), n('Serkan Kırıntılı', 'GK', 66, 'TUR'), n('Riad Bajić', 'FWD', 66, 'BIH'),
    n('Amir Hadžiahmetović', 'MID', 64, 'BIH'), x('Ali Turan', 'DEF', 64, 'TUR'),
  ],

  // ---- Scotland ----
  kilmarnock: [
    x('Kris Boyd', 'FWD', 67, 'SCO', 'poacher'), x('Frank Beattie', 'DEF', 66, 'SCO', 'leader'), x('Tommy McLean', 'MID', 66, 'SCO'),
    x('Steven Naismith', 'FWD', 66, 'SCO'), x('Ray Montgomerie', 'DEF', 63, 'SCO'),
  ],
  'dundee-fc': [
    x('Alan Gilzean', 'FWD', 72, 'SCO', 'poacher'), x('Ian Ure', 'DEF', 66, 'SCO'), x('Bert Slater', 'GK', 64, 'SCO'),
    x('Claudio Caniggia', 'FWD', 74, 'ARG'), x('Alan Cousin', 'FWD', 64, 'SCO'),
  ],

  // ---- Austria ----
  'wacker-innsbruck': [
    x('Bruno Pezzey', 'DEF', 76, 'AUT', 'leader'), x('Friedl Koncilia', 'GK', 72, 'AUT'), x('Kurt Jara', 'MID', 70, 'AUT'),
    x('Radosław Gilewicz', 'FWD', 66, 'POL'),
  ],
  'grazer-ak': [
    x('Roland Kollmann', 'FWD', 66, 'AUT', 'poacher'), x('Mario Tokić', 'DEF', 65, 'CRO'), x('René Aufhauser', 'MID', 65, 'AUT'),
    x('Franz Almer', 'GK', 64, 'AUT'),
  ],

  // ---- Greece ----
  panionios: [
    x('Takis Fyssas', 'DEF', 68, 'GRE'), x('Kostas Mitroglou', 'FWD', 70, 'GRE', 'poacher'), x('Nikos Spyropoulos', 'DEF', 64, 'GRE'),
  ],
  iraklis: [
    x('Vasilis Hatzipanagis', 'MID', 76, 'GRE', 'playmaker'), x('Savvas Kofidis', 'MID', 66, 'GRE'), x('Michalis Konstantinou', 'FWD', 68, 'CYP', 'poacher'),
  ],

  // ---- Belgium ----
  anderlecht: [
    x('Paul Van Himst', 'FWD', 82, 'BEL', 'clutch'), x('Enzo Scifo', 'MID', 80, 'BEL', 'playmaker'), x('Jef Mermans', 'FWD', 74, 'BEL', 'poacher'),
    x('Rob Rensenbrink', 'FWD', 81, 'NED'), x('Pär Zetterberg', 'MID', 74, 'SWE', 'playmaker'), x('Jan Mulder', 'FWD', 72, 'NED'),
    x('Filip De Wilde', 'GK', 70, 'BEL'), x('Jean Dockx', 'MID', 70, 'BEL', 'engine'),
  ],
  'standard-liege': [
    x('Eric Gerets', 'DEF', 78, 'BEL', 'leader'), x('Wilfried Van Moer', 'MID', 75, 'BEL'), n('Axel Witsel', 'MID', 76, 'BEL', 'engine'),
    x('Steven Defour', 'MID', 70, 'BEL'), x('Dieumerci Mbokani', 'FWD', 70, 'COD', 'poacher'), x('Jean Nicolay', 'GK', 70, 'BEL'),
    x('Sergio Conceição', 'MID', 72, 'POR'),
  ],
  genk: [
    x('Wesley Sonck', 'FWD', 70, 'BEL', 'poacher'), x('Jelle Vossen', 'FWD', 68, 'BEL'), x('Thomas Buffel', 'MID', 68, 'BEL'),
    n('Leandro Trossard', 'FWD', 74, 'BEL'), 'p-thibaut-courtois',
  ],
  'union-sg': [
    n('Kevin Mac Allister', 'DEF', 68, 'ARG'), n('Victor Boniface', 'FWD', 74, 'NGA'), n('Teddy Teuma', 'MID', 70, 'MLT', 'playmaker'),
    n('Anthony Moris', 'GK', 68, 'LUX'), n('Dante Vanzeir', 'FWD', 68, 'BEL'),
  ],
  gent: [
    x('Sven Kums', 'MID', 68, 'BEL', 'playmaker'), x('Laurent Depoitre', 'FWD', 66, 'BEL'), x('Danijel Milićević', 'MID', 68, 'BIH'),
    n('Matz Sels', 'GK', 70, 'BEL'), x('Moses Simon', 'FWD', 70, 'NGA'),
  ],
  antwerp: [
    x('Toby Alderweireld', 'DEF', 74, 'BEL', 'wall'), x('Radja Nainggolan', 'MID', 74, 'BEL', 'engine'), n('Vincent Janssen', 'FWD', 68, 'NED'),
    n('Jean Butez', 'GK', 66, 'FRA'), n('Arthur Vermeeren', 'MID', 70, 'BEL'),
  ],
  mechelen: [
    x('Michel Preud\'homme', 'GK', 80, 'BEL', 'shotStopper'), x('Erwin Koeman', 'MID', 72, 'NED'), x('Piet den Boer', 'FWD', 68, 'NED', 'poacher'),
    x('Graeme Rutjes', 'DEF', 68, 'NED'), x('Eli Ohana', 'FWD', 70, 'ISR'), x('Marc Emmers', 'MID', 66, 'BEL'),
  ],
  'sint-truiden': [
    n('Daichi Kamada', 'MID', 72, 'JPN'), n('Takehiro Tomiyasu', 'DEF', 70, 'JPN'), 'p-zion-suzuki',
    n('Daiki Hashioka', 'DEF', 66, 'JPN'), x('Shinji Okazaki', 'FWD', 70, 'JPN', 'engine'),
  ],
  'zulte-waregem': [
    n('Thorgan Hazard', 'MID', 72, 'BEL'), x('Mbaye Leye', 'FWD', 66, 'SEN'), x('Sammy Bossut', 'GK', 65, 'BEL'),
    x('Franck Berrier', 'MID', 64, 'FRA'), x('Junior Malanda', 'MID', 64, 'BEL'),
  ],

  // ---- Switzerland ----
  'young-boys': [
    x('Guillaume Hoarau', 'FWD', 70, 'FRA', 'poacher'), n('Jean-Pierre Nsame', 'FWD', 70, 'CMR'), x('Christoph Spycher', 'DEF', 66, 'SUI', 'leader'),
    x('Marco Wölfli', 'GK', 66, 'SUI'), x('Seydou Doumbia', 'FWD', 70, 'CIV'),
  ],
  grasshoppers: [
    x('Kubilay Türkyılmaz', 'FWD', 72, 'SUI', 'poacher'), x('Ciriaco Sforza', 'MID', 72, 'SUI', 'playmaker'), x('Alain Sutter', 'MID', 68, 'SUI'),
    x('Richard Núñez', 'FWD', 66, 'URU'), x('Heinz Hermann', 'MID', 70, 'SUI', 'engine'),
  ],
  'fc-zurich': [
    x('Köbi Kuhn', 'MID', 72, 'SUI', 'playmaker'), x('Fritz Künzli', 'FWD', 70, 'SUI', 'poacher'), x('Alhassane Keita', 'FWD', 66, 'GUI'),
    x('Yassine Chikhaoui', 'MID', 66, 'TUN'), n('Admir Mehmedi', 'FWD', 66, 'SUI'),
  ],
  servette: [
    x('Umberto Barberis', 'MID', 70, 'SUI', 'playmaker'), x('Lucien Favre', 'MID', 68, 'SUI'), x('Martin Chivers', 'FWD', 70, 'ENG'),
  ],
  lugano: [
    x('Ottmar Hitzfeld', 'FWD', 66, 'GER'), n('Renato Steffen', 'FWD', 67, 'SUI'), n('Mattia Bottani', 'MID', 64, 'SUI'),
    n('Žan Celar', 'FWD', 63, 'SVN'),
  ],
  'st-gallen': [
    x('Charles Amoah', 'FWD', 67, 'GHA', 'poacher'), x('Jörg Stiel', 'GK', 66, 'SUI'), x('Marc Zellweger', 'DEF', 63, 'SUI'),
    x('Tranquillo Barnetta', 'MID', 68, 'SUI'),
  ],
  'fc-sion': [
    x('Alain Geiger', 'DEF', 70, 'SUI', 'leader'), x('Gelson Fernandes', 'MID', 66, 'SUI', 'engine'), x('Andris Vaņins', 'GK', 64, 'LVA'),
    x('Mario Balotelli', 'FWD', 72, 'ITA', 'clutch'),
  ],
  xamax: [
    x('Don Givens', 'FWD', 68, 'IRL'), x('Joël Corminboeuf', 'GK', 65, 'SUI'), x('Uli Stielike', 'MID', 76, 'GER', 'leader'),
    x('Beat Sutter', 'FWD', 64, 'SUI'),
  ],
  luzern: [
    x('Christian Schwegler', 'DEF', 64, 'SUI'), x('David Zibung', 'GK', 64, 'SUI'), n('Ardon Jashari', 'MID', 68, 'SUI'),
    x('Hakan Yakin', 'MID', 70, 'SUI', 'playmaker'),
  ],

  // ---- Denmark ----
  brondby: [
    x('Daniel Agger', 'DEF', 75, 'DEN', 'wall'), x('Ebbe Sand', 'FWD', 72, 'DEN', 'poacher'), x('Kim Vilfort', 'MID', 70, 'DEN'),
    x('John Jensen', 'MID', 68, 'DEN', 'engine'), x('Lars Olsen', 'DEF', 70, 'DEN', 'leader'), x('Bent Christensen', 'FWD', 68, 'DEN'),
    x('Mogens Krogh', 'GK', 66, 'DEN'),
  ],
  midtjylland: [
    n('Pione Sisto', 'FWD', 68, 'DEN'), n('Erik Sviatchenko', 'DEF', 66, 'DEN'), x('Simon Kjær', 'DEF', 76, 'DEN', 'leader'),
    x('Jakob Poulsen', 'MID', 66, 'DEN'), n('Jonas Lössl', 'GK', 66, 'DEN'),
  ],
  agf: [
    x('Henning Munk Jensen', 'DEF', 70, 'DEN', 'leader'), x('Aage Rou Jensen', 'FWD', 68, 'DEN'), x('Stig Tøfting', 'MID', 66, 'DEN', 'engine'),
    x('Peter Graulund', 'FWD', 64, 'DEN'),
  ],
  aab: [
    x('Jimmy Nielsen', 'GK', 66, 'DEN'), x('Thomas Augustinussen', 'MID', 64, 'DEN'), x('Rasmus Würtz', 'MID', 64, 'DEN'),
    x('Jesper Grønkjær', 'FWD', 72, 'DEN'), x('Erik Bo Andersen', 'FWD', 66, 'DEN', 'poacher'),
  ],
  nordsjaelland: [
    n('Simon Adingra', 'FWD', 70, 'CIV'), n('Ernest Nuamah', 'FWD', 68, 'GHA'), n('Andreas Skov Olsen', 'FWD', 70, 'DEN'),
    n('Kamaldeen Sulemana', 'FWD', 68, 'GHA'),
  ],
  ob: [
    x('Thomas Helveg', 'DEF', 70, 'DEN'), x('Lars Høgh', 'GK', 68, 'DEN', 'shotStopper'), 
    x('Ulrik Laursen', 'DEF', 64, 'DEN'),
  ],
  vejle: [
    x('Ulrik le Fevre', 'FWD', 70, 'DEN'), x('Steen Thychosen', 'FWD', 66, 'DEN', 'poacher'), x('Tommy Troelsen', 'MID', 66, 'DEN'),
    x('John Sivebæk', 'DEF', 68, 'DEN'),
  ],
  lyngby: [
    x('Henrik Larsen', 'MID', 70, 'DEN', 'clutch'), x('Alfreð Finnbogason', 'FWD', 68, 'ISL', 'poacher'), n('Andri Lucas Guðjohnsen', 'FWD', 68, 'ISL'),
    n('Sævar Atli Magnússon', 'FWD', 64, 'ISL'),
  ],
  esbjerg: [
    n('Martin Braithwaite', 'FWD', 70, 'DEN'), x('Ole Kjær', 'GK', 66, 'DEN'), x('Jerry Lucena', 'DEF', 63, 'PHI'),
  ],

  // ---- Europe Other (refill) ----
  'dynamo-kyiv': [
    x('Oleh Blokhin', 'FWD', 84, 'UKR', 'poacher'), x('Igor Belanov', 'FWD', 78, 'UKR', 'clutch'), x('Serhiy Rebrov', 'FWD', 76, 'UKR'),
    x('Oleksandr Shovkovskyi', 'GK', 74, 'UKR', 'shotStopper'), x('Anatoliy Demyanenko', 'DEF', 74, 'UKR', 'leader'), x('Oleksandr Zavarov', 'MID', 75, 'UKR', 'playmaker'),
  ],
  ferencvaros: [
    x('Flórián Albert', 'FWD', 82, 'HUN', 'clutch'), x('Tibor Nyilasi', 'MID', 76, 'HUN', 'playmaker'), x('Zoltán Gera', 'MID', 70, 'HUN'),
    x('Dezső Novák', 'DEF', 70, 'HUN'), n('Dénes Dibusz', 'GK', 68, 'HUN'),
  ],
  'malmo-ff': [
    x('Bo Larsson', 'MID', 74, 'SWE', 'leader'), x('Krister Kristensson', 'DEF', 70, 'SWE'), x('Jan Möller', 'GK', 70, 'SWE'),
    x('Markus Rosenberg', 'FWD', 68, 'SWE'), x('Patrik Andersson', 'DEF', 74, 'SWE', 'wall'),
  ],
  'legia-warsaw': [
    x('Kazimierz Deyna', 'MID', 82, 'POL', 'playmaker'), x('Lucjan Brychczy', 'FWD', 74, 'POL', 'poacher'), x('Jacek Kazimierski', 'GK', 68, 'POL'),
    x('Miroslav Radović', 'FWD', 68, 'SRB'), x('Artur Boruc', 'GK', 70, 'POL'),
  ],
  'sparta-prague': [
    x('Ivan Hašek', 'MID', 72, 'CZE', 'leader'), x('Horst Siegl', 'FWD', 68, 'CZE', 'poacher'), x('Jiří Novotný', 'DEF', 66, 'CZE'),
    x('Libor Sionko', 'MID', 66, 'CZE'), x('Jaromír Blažek', 'GK', 66, 'CZE'),
  ],
});
