// History pools for the clubs added in v1.9 outside Europe: two more clubs in every division,
// Chile's league, Mexico's Liga de Expansión, Japan's J2 and the refilled South America Other.
// x = retired player (card shows him at his peak), n = active player. See data/cardgen.js.
import { card, pools } from '../cardgen.js';

const x = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { id });
const n = (name, pos, ovr, nation, trait = null, id = null) => card(name, pos, ovr, nation, trait, { now: true, id });

export const { SQUADS, PLAYERS } = pools({
  // ---- Argentina ----
  'gimnasia-lp': [
    x('Gustavo Barros Schelotto', 'MID', 68, 'ARG'), x('Pedro Troglio', 'MID', 70, 'ARG', 'engine'), x('Lucas Licht', 'DEF', 66, 'ARG'),
    x('Roberto Sosa', 'FWD', 68, 'ARG', 'poacher'), x('Facundo Sava', 'FWD', 66, 'ARG'),
  ],
  banfield: [
    x('Santiago Silva', 'FWD', 70, 'URU', 'poacher'), x('Walter Erviti', 'MID', 68, 'ARG', 'playmaker'), x('Cristian Lucchetti', 'GK', 68, 'ARG'),
    x('Garrafa Sánchez', 'MID', 70, 'ARG', 'clutch'), x('Jesús Dátolo', 'MID', 66, 'ARG'),
  ],
  colon: [
    x('Esteban Fuertes', 'FWD', 68, 'ARG', 'poacher'), x('Pulga Rodríguez', 'FWD', 68, 'ARG', 'clutch'), x('Germán Conti', 'DEF', 64, 'ARG'),
  ],
  'ferro-carril-oeste': [
    x('Héctor Cúper', 'DEF', 66, 'ARG', 'leader'), x('Oscar Garré', 'DEF', 68, 'ARG'), x('Alberto Márcico', 'MID', 70, 'ARG', 'playmaker'),
  ],

  // ---- Brazil ----
  'athletico-pr': [
    x('Kléberson', 'MID', 72, 'BRA', 'engine'), x('Alex Mineiro', 'FWD', 70, 'BRA'), x('Jádson', 'MID', 70, 'BRA', 'playmaker'),
    x('Washington', 'FWD', 72, 'BRA', 'poacher', 'p-washington-cerqueira'), n('Renan Lodi', 'DEF', 70, 'BRA'),
  ],
  'sport-recife': [
    x('Diego Souza', 'MID', 70, 'BRA'), x('Magrão', 'GK', 68, 'BRA'), x('Durval', 'DEF', 66, 'BRA', 'leader'),
    x('Vavá', 'FWD', 76, 'BRA', 'poacher'), x('Carlinhos Bala', 'FWD', 66, 'BRA'),
  ],
  guarani: [
    x('Zenon', 'MID', 72, 'BRA', 'playmaker'), x('Neto', 'MID', 70, 'BRA', 'clutch', 'p-neto-guarani'), x('João Paulo', 'FWD', 68, 'BRA'),
  ],
  'vitoria-ba': [
    x('Dida', 'GK', 78, 'BRA', 'shotStopper'), x('Vampeta', 'MID', 70, 'BRA', 'engine'), x('Bebeto', 'FWD', 80, 'BRA', 'poacher'),
    x('David Luiz', 'DEF', 74, 'BRA'),
  ],

  // ---- Mexico ----
  'santos-laguna': [
    x('Jared Borgetti', 'FWD', 76, 'MEX', 'poacher'), x('Oswaldo Sánchez', 'GK', 72, 'MEX', 'shotStopper'), x('Christian Benítez', 'FWD', 72, 'ECU'),
    x('Oribe Peralta', 'FWD', 72, 'MEX', 'clutch'), x('Matías Vuoso', 'FWD', 68, 'ARG'), x('Darwin Quintero', 'FWD', 68, 'COL'),
  ],
  leon: [
    x('Antonio Carbajal', 'GK', 72, 'MEX', 'leader'), x('Luis Montes', 'MID', 70, 'MEX', 'playmaker'), x('Mauro Boselli', 'FWD', 72, 'ARG', 'poacher'),
    n('Ángel Mena', 'FWD', 68, 'ECU'), n('Elías Hernández', 'MID', 66, 'MEX'),
  ],
  atlas: [
    x('Rafael Márquez', 'DEF', 80, 'MEX', 'leader'), x('Andrés Guardado', 'MID', 74, 'MEX'), x('Pável Pardo', 'MID', 70, 'MEX', 'engine'),
    x('Daniel Osorno', 'MID', 66, 'MEX'),
  ],
  necaxa: [
    x('Álex Aguinaga', 'MID', 74, 'ECU', 'playmaker'), x('Ricardo Peláez', 'FWD', 68, 'MEX'), x('Luis Hernández', 'FWD', 72, 'MEX', 'poacher'),
    x('Nicolás Navarro', 'GK', 66, 'ARG'),
  ],
  tijuana: [
    x('Fernando Arce', 'MID', 66, 'MEX'), x('Joe Corona', 'MID', 64, 'USA'), x('Herculez Gómez', 'FWD', 65, 'USA'),
    x('Duvier Riascos', 'FWD', 66, 'COL'),
  ],
  puebla: [
    x('Jorge Aravena', 'MID', 70, 'CHI', 'clutch'), x('Matías Alustiza', 'FWD', 66, 'ARG'), x('Christian Tabó', 'FWD', 64, 'URU'),
  ],
  queretaro: [
    x('Camilo Sanvezzo', 'FWD', 68, 'BRA', 'poacher'), n('Tiago Volpi', 'GK', 68, 'BRA'), x('Emanuel Villa', 'FWD', 66, 'ARG'),
  ],
  atlante: [
    x('Christian Bermúdez', 'MID', 66, 'MEX'), x('Federico Vilar', 'GK', 67, 'ARG'), x('Giancarlo Maldonado', 'FWD', 66, 'VEN', 'poacher'),
  ],
  'atletico-morelia': [
    x('Rafael Márquez Lugo', 'FWD', 66, 'MEX'), x('Luis Gabriel Rey', 'FWD', 66, 'COL'), x('Moisés Muñoz', 'GK', 66, 'MEX'),
  ],
  'toros-neza': [
    x('Antonio Mohamed', 'FWD', 68, 'ARG', 'clutch'), x('Germán Arangio', 'FWD', 66, 'ARG'), x('Miguel Herrera', 'DEF', 63, 'MEX', 'leader'),
  ],
  veracruz: [
    x('Kalusha Bwalya', 'FWD', 72, 'ZAM', 'playmaker'), x('Jorge Comas', 'FWD', 66, 'ARG', 'poacher'), x('Daniel Villalva', 'FWD', 64, 'ARG'),
  ],
  'atletico-san-luis': [
    x('Nicolás Ibáñez', 'FWD', 66, 'ARG', 'poacher'), n('Germán Berterame', 'FWD', 68, 'MEX'), n('Unai Bilbao', 'DEF', 64, 'ESP'),
  ],

  // ---- USA ----
  'la-galaxy': [
    x('Landon Donovan', 'FWD', 76, 'USA', 'clutch'), x('Cobi Jones', 'MID', 70, 'USA', 'engine'), x('Robbie Keane', 'FWD', 74, 'IRL', 'poacher'),
    x('Kevin Hartman', 'GK', 66, 'USA'), x('Omar Gonzalez', 'DEF', 68, 'USA'), x('Mauricio Cienfuegos', 'MID', 68, 'SLV', 'playmaker'),
  ],
  'dc-united': [
    x('Marco Etcheverry', 'MID', 74, 'BOL', 'playmaker'), x('Jaime Moreno', 'FWD', 72, 'BOL', 'poacher'), x('Eddie Pope', 'DEF', 68, 'USA'),
    x('Ben Olsen', 'MID', 66, 'USA'), x('Christian Gómez', 'MID', 68, 'ARG'),
  ],

  // ---- Colombia ----
  'deportivo-cali': [
    x('Mario Yepes', 'DEF', 76, 'COL', 'leader'), x('Faryd Mondragón', 'GK', 72, 'COL'), x('Bernardo Redín', 'MID', 70, 'COL', 'playmaker'),
    x('Andrés Pérez', 'MID', 64, 'COL'), x('Abel Aguilar', 'MID', 66, 'COL'),
  ],
  envigado: [
    n('James Rodríguez', 'MID', 76, 'COL', 'playmaker'), n('Juan Fernando Quintero', 'MID', 72, 'COL'), x('Fredy Guarín', 'MID', 72, 'COL', 'engine'),
  ],

  // ---- Chile ----
  'universidad-catolica': [
    x('Sergio Livingstone', 'GK', 74, 'CHI', 'shotStopper'), x('Alberto Fouillioux', 'MID', 72, 'CHI', 'playmaker'), n('Gary Medel', 'DEF', 74, 'CHI', 'wall'),
    n('Mauricio Isla', 'DEF', 70, 'CHI'), x('Fabián Estay', 'MID', 68, 'CHI'), x('Milovan Mirošević', 'MID', 66, 'CHI'),
    x('José María Buljubasich', 'GK', 66, 'ARG'),
  ],
  cobreloa: [
    x('Mario Soto', 'DEF', 70, 'CHI', 'leader'), x('Héctor Puebla', 'DEF', 66, 'CHI'), x('Juan Carlos Letelier', 'FWD', 68, 'CHI', 'poacher'),
    x('Víctor Merello', 'MID', 66, 'CHI'), n('Alexis Sánchez', 'FWD', 78, 'CHI', 'clutch'),
  ],
  palestino: [
    x('Oscar Fabbiani', 'FWD', 70, 'ARG', 'poacher'), x('Manuel Rojas', 'MID', 68, 'CHI'), x('Luis Jiménez', 'MID', 68, 'CHI', 'playmaker'),
    x('Roberto Coll', 'MID', 66, 'ARG'),
  ],
  'santiago-wanderers': [
    x('David Pizarro', 'MID', 74, 'CHI', 'playmaker'), x('Reinaldo Navia', 'FWD', 68, 'CHI', 'poacher'), x('Jaime Riveros', 'MID', 66, 'CHI'),
    x('Moisés Villarroel', 'MID', 64, 'CHI', 'engine'), n('Eugenio Mena', 'DEF', 66, 'CHI'),
  ],
  'union-espanola': [
    x('Honorino Landa', 'FWD', 70, 'CHI', 'poacher'), x('Rogelio Farías', 'MID', 66, 'CHI'), x('Juan Machuca', 'DEF', 64, 'CHI'),
  ],
  ohiggins: [
    x('Pablo Calandria', 'FWD', 66, 'ARG', 'poacher'), x('Paulo Garcés', 'GK', 64, 'CHI'), x('Pablo Hernández', 'MID', 66, 'ARG', null, 'p-pablo-hernandez-arg'),
  ],
  'audax-italiano': [
    x('Carlos Villanueva', 'MID', 66, 'CHI', 'playmaker'), n('Fabián Orellana', 'FWD', 68, 'CHI'), n('Felipe Mora', 'FWD', 64, 'CHI'),
  ],
  'everton-chi': [
    x('Eladio Rojas', 'MID', 68, 'CHI', 'engine'), x('Ezequiel Miralles', 'FWD', 66, 'ARG', 'poacher'),
  ],

  // ---- South America Other (refill) ----
  olimpia: [
    x('Raúl Vicente Amarilla', 'FWD', 70, 'PAR', 'poacher'), x('Ever Hugo Almeida', 'GK', 72, 'URU', 'shotStopper'), x('Rogelio Delgado', 'DEF', 68, 'PAR', 'leader'),
    x('Julio César Cáceres', 'DEF', 66, 'PAR'),
  ],
  'barcelona-sc': [
    x('Holger Quiñónez', 'DEF', 66, 'ECU'), n('Damián Díaz', 'MID', 70, 'ARG', 'playmaker'), x('Ismael Blanco', 'FWD', 66, 'ARG'),
    n('Jonatan Álvez', 'FWD', 66, 'URU', 'poacher'), x('Narciso Mina', 'FWD', 66, 'ECU'),
  ],
  universitario: [
    x('Lolo Fernández', 'FWD', 76, 'PER', 'poacher'), x('Héctor Chumpitaz', 'DEF', 74, 'PER', 'leader'), x('José Luis Carranza', 'MID', 68, 'PER'),
    n('Edison Flores', 'MID', 68, 'PER'), n('Alex Valera', 'FWD', 66, 'PER'),
  ],
  'alianza-lima': [
    x('Teófilo Cubillas', 'MID', 82, 'PER', 'playmaker'), x('Hugo Sotil', 'FWD', 72, 'PER'), x('César Cueto', 'MID', 72, 'PER'),
    n('Leao Butrón', 'GK', 66, 'PER'), x('Jefferson Farfán', 'FWD', 74, 'PER'),
  ],

  // ---- Japan ----
  'gamba-osaka': [
    x('Yasuhito Endō', 'MID', 74, 'JPN', 'playmaker'), n('Takashi Usami', 'FWD', 70, 'JPN'), x('Masashi Oguro', 'FWD', 68, 'JPN', 'poacher'),
    x('Junichi Inamoto', 'MID', 70, 'JPN', 'engine'), x('Tsuneyasu Miyamoto', 'DEF', 68, 'JPN', 'leader'), x('Patric', 'FWD', 67, 'BRA', null, 'p-patric-gamba'),
  ],
  'yokohama-f-marinos': [
    x('Shunsuke Nakamura', 'MID', 76, 'JPN', 'playmaker'), x('Yuji Nakazawa', 'DEF', 72, 'JPN', 'wall'), x('Yoshikatsu Kawaguchi', 'GK', 70, 'JPN', 'shotStopper'),
    x('Marcos Júnior', 'FWD', 68, 'BRA'), x('Masami Ihara', 'DEF', 70, 'JPN', 'leader'),
  ],
  'cerezo-osaka': [
    n('Shinji Kagawa', 'MID', 76, 'JPN', 'playmaker'), n('Hiroshi Kiyotake', 'MID', 68, 'JPN'), n('Yoichiro Kakitani', 'FWD', 66, 'JPN'),
    n('Kenyu Sugimoto', 'FWD', 64, 'JPN'),
  ],
  'nagoya-grampus': [
    x('Joshua Kennedy', 'FWD', 68, 'AUS', 'poacher'), x('Seigo Narazaki', 'GK', 70, 'JPN', 'shotStopper'), x('Tulio', 'DEF', 70, 'JPN', 'leader'),
    x('Keiji Tamada', 'FWD', 66, 'JPN'),
  ],
  'fc-tokyo': [
    x('Naohiro Ishikawa', 'MID', 65, 'JPN'), x('Lucas Severino', 'FWD', 67, 'BRA'), x('Amaral', 'MID', 64, 'BRA'),
    n('Shuichi Gonda', 'GK', 66, 'JPN'),
  ],
  'jubilo-iwata': [
    x('Dunga', 'MID', 76, 'BRA', 'leader'), x('Toshiya Fujita', 'MID', 70, 'JPN'), x('Masashi Nakayama', 'FWD', 70, 'JPN', 'poacher'),
    x('Hiroshi Nanami', 'MID', 69, 'JPN', 'playmaker'), x('Salvatore Schillaci', 'FWD', 72, 'ITA', 'clutch'),
  ],
  'shimizu-s-pulse': [
    x('Kenta Hasegawa', 'FWD', 65, 'JPN'), x('Teruyoshi Ito', 'MID', 66, 'JPN'), x('Alessandro Santos', 'DEF', 66, 'JPN'),
    x('Jong Tae-se', 'FWD', 66, 'PRK'),
  ],
  'tokyo-verdy': [
    n('Kazuyoshi Miura', 'FWD', 72, 'JPN', 'clutch'), x('Ruy Ramos', 'MID', 72, 'JPN', 'playmaker'), x('Tsuyoshi Kitazawa', 'MID', 66, 'JPN', 'engine'),
    x('Nobuhiro Takeda', 'FWD', 65, 'JPN'),
  ],
  'jef-united': [
    x('Yasuhiko Okudera', 'MID', 72, 'JPN'), x('Seiichiro Maki', 'FWD', 66, 'JPN'), x('Koki Mizuno', 'MID', 64, 'JPN'),
  ],
  'consadole-sapporo': [
    x('Emerson', 'FWD', 72, 'BRA', 'poacher', 'p-emerson-sheik'), x('Chanathip Songkrasin', 'MID', 68, 'THA', 'playmaker'), x('Jay Bothroyd', 'FWD', 66, 'ENG'),
  ],
  'albirex-niigata': [
    x('Marcio Richardes', 'MID', 66, 'BRA', 'playmaker'), x('Kisho Yano', 'FWD', 64, 'JPN'), n('Masaaki Higashiguchi', 'GK', 68, 'JPN'),
  ],
  'sagan-tosu': [
    x('Yohei Toyoda', 'FWD', 66, 'JPN', 'poacher'), n('Kim Min-hyeok', 'DEF', 64, 'KOR'), x('Kim Min-woo', 'MID', 66, 'KOR'),
  ],

  // ---- Asia, Pacific, Saudi Arabia ----
  esteghlal: [
    x('Farhad Majidi', 'FWD', 68, 'IRN', 'poacher'), x('Nasser Hejazi', 'GK', 72, 'IRN', 'shotStopper'), x('Mansour Pourheidari', 'DEF', 66, 'IRN', 'leader'),
    x('Andranik Teymourian', 'MID', 66, 'IRN', 'engine'), n('Mehdi Rahmati', 'GK', 64, 'IRN'),
  ],
  pakhtakor: [
    x('Server Djeparov', 'MID', 70, 'UZB', 'playmaker'), x('Alexander Geynrikh', 'FWD', 66, 'UZB', 'poacher'), x('Ignatiy Nesterov', 'GK', 66, 'UZB'),
  ],
  'guangzhou-fc': [
    x('Ricardo Goulart', 'MID', 72, 'BRA', 'clutch'), x('Zheng Zhi', 'MID', 68, 'CHN', 'leader'), x('Gao Lin', 'FWD', 66, 'CHN'),
    x('Elkeson', 'FWD', 70, 'BRA', 'poacher'), x('Paulinho', 'MID', 74, 'BRA', 'engine', 'p-paulinho-bra'),
  ],
  'sydney-fc': [
    x('Miloš Ninković', 'MID', 68, 'SRB', 'playmaker'), x('Alex Brosque', 'FWD', 66, 'AUS'), n('Andrew Redmayne', 'GK', 64, 'AUS'),
    x('Adam Le Fondre', 'FWD', 66, 'ENG', 'poacher'), x('Steve Corica', 'MID', 64, 'AUS'),
  ],
  'al-fateh': [
    x('Elton', 'FWD', 68, 'BRA', 'poacher', 'p-elton-arabia'), n('Cristian Tello', 'FWD', 70, 'ESP'), n('Sofiane Bendebka', 'MID', 70, 'ALG', 'engine'),
    n('Mourad Batna', 'FWD', 68, 'MAR'), n('Marwane Saâdane', 'DEF', 68, 'MAR'),
  ],
  'al-fayha': [
    n('Fashion Sakala', 'FWD', 72, 'ZAM', 'poacher'), n('Chris Smalling', 'DEF', 74, 'ENG', 'wall'), n('Henry Onyekuru', 'FWD', 70, 'NGA'),
    n('Orlando Mosquera', 'GK', 70, 'PAN'), n('Gojko Cimirot', 'MID', 70, 'BIH'),
  ],

  // ---- Africa ----
  heartland: [
    x('Nwankwo Kanu', 'FWD', 76, 'NGA', 'clutch'), x('Uche Okechukwu', 'DEF', 70, 'NGA', 'wall'), x('Ikechukwu Ezenwa', 'GK', 64, 'NGA'),
  ],
  'julius-berger': [
    x('Sunday Oliseh', 'MID', 72, 'NGA', 'engine'), x('Emmanuel Amunike', 'FWD', 70, 'NGA'), x('Taribo West', 'DEF', 70, 'NGA', 'wall'),
  ],
  ismaily: [
    x('Ali Abo Greisha', 'FWD', 70, 'EGY', 'poacher'), x('Ahmed Fathy', 'DEF', 68, 'EGY'),
    x('Mohamed Homos', 'MID', 64, 'EGY'), x('Hosni Abd Rabou', 'MID', 68, 'EGY'), x('Ahmed Hegazi', 'DEF', 68, 'EGY'),
    x('Ahmed Hassan', 'MID', 72, 'EGY', 'leader'), x('Abdallah El Said', 'MID', 66, 'EGY'),
  ],
  'ghazl-el-mahalla': [
    x('Ahmed Elmohamady', 'DEF', 66, 'EGY', 'engine'), x('Mohamed Shawky', 'MID', 64, 'EGY'), x('Mohamed Abdel-Shafy', 'DEF', 64, 'EGY'),
  ],
  'tp-mazembe': [
    x('Trésor Mputu', 'FWD', 70, 'COD', 'clutch'), x('Robert Kidiaba', 'GK', 66, 'COD'), x('Rainford Kalaba', 'MID', 66, 'ZAM', 'playmaker'),
    x('Dioko Kaluyituka', 'FWD', 64, 'COD'), x('Mbwana Samatta', 'FWD', 68, 'TAN', 'poacher'),
  ],
  'kaizer-chiefs': [
    x('Doctor Khumalo', 'MID', 70, 'RSA', 'playmaker'), n('Itumeleng Khune', 'GK', 68, 'RSA', 'shotStopper'), x('Siphiwe Tshabalala', 'MID', 66, 'RSA'),
    x('Patrick Ntsoelengoe', 'MID', 68, 'RSA'), x('Reneilwe Letsholonyane', 'MID', 64, 'RSA', 'engine'),
  ],
});
