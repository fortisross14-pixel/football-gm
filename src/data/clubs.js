export const primera = [
  'Athletic Club','Atlético de Madrid','CA Osasuna','Celta','Deportivo Alavés','Elche CF','FC Barcelona','Getafe CF','Levante UD','Málaga CF','R. Racing Club','Rayo Vallecano','RC Deportivo','RCD Espanyol de Barcelona','Real Betis','Real Madrid','Real Sociedad','Sevilla FC','Valencia CF','Villarreal CF'
];

export const segunda = [
  'AD Ceuta FC','Albacete BP','Burgos CF','Cádiz CF','CD Castellón','CD Eldense','CD Leganés','CD Tenerife','CE Sabadell','Celta Fortuna','Córdoba CF','FC Andorra','Girona FC','Granada CF','R. Sociedad B','RCD Mallorca','Real Oviedo','Real Sporting','Real Valladolid CF','SD Eibar','UD Almería','UD Las Palmas'
];

export const primeraFederacionG1 = [
  'AD Mérida','Arenas Club','Athletic Club B','Barakaldo CF','CD Coria','CD Extremadura','CD Lugo','CD Mirandés','CP Cacereño','CyD Leonesa','Pontevedra CF','Racing Club Ferrol','RC Deportivo Fabril','Real Avilés Industrial','Real Unión Club','SD Ponferradina','UD Logroñés','UD Ourense','Unionistas de Salamanca CF','Zamora CF'
];

export const primeraFederacionG2 = [
  'AD Alcorcón','Águilas FC','Algeciras CF','Antequera CCF','Atlético Madrileño','CD Teruel','CE Europa','CF Rayo Majadahonda','FC Cartagena','Gimnàstic de Tarragona','Hércules de Alicante CF','Juventud de Torremolinos CF','Real Jaén CF','Real Madrid Castilla','Real Murcia CF','Real Zaragoza','SD Huesca','UD Ibiza','UE Sant Andreu','Villarreal CF B'
];

export const promotionPool = [
  'Atlético Astorga FC','Real Madrid C','CD Castellón B','SD Tarazona','Salerm Puente Genil FC','CD Numancia','SD Compostela','UD Melilla','CF Talavera','Torrent CF','CD Toledo','Orihuela CF','UD Barbastro','UCAM Murcia CF','CD Illescas','Real Ávila CF','UD San Sebastián de los Reyes','CD Guijuelo'
];

const prestigeOverrides = {
  'Real Zaragoza': 72, 'Real Murcia CF': 60, 'Hércules de Alicante CF': 59,
  'SD Huesca': 61, 'FC Cartagena': 58, 'SD Ponferradina': 56,
  'Racing Club Ferrol': 57, 'CyD Leonesa': 55, 'CD Lugo': 53,
  'AD Alcorcón': 52, 'UD Ibiza': 50, 'Gimnàstic de Tarragona': 57,
  'Unionistas de Salamanca CF': 48, 'Real Jaén CF': 51,
};

export function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function makeClub(name, tier, group = null) {
  const h = hashString(name);
  const tierBase = tier === 1 ? 76 : tier === 2 ? 61 : tier === 3 ? 44 : 32;
  const prestige = prestigeOverrides[name] ?? Math.min(92, tierBase + (h % 15));
  const bigThird = tier === 3 && prestige >= 58;
  const capacity = tier === 1
    ? 18000 + (h % 42000)
    : tier === 2
      ? 7000 + (h % 25000)
      : bigThird
        ? 12000 + (h % 22000)
        : 1200 + (h % 11000);
  const localFans = tier === 1
    ? Math.round(capacity * (3 + (h % 950) / 100))
    : tier === 2
      ? Math.round(capacity * (2 + (h % 500) / 100))
      : bigThird
        ? Math.round(capacity * (1.8 + (h % 260) / 100))
        : Math.max(900, Math.round(capacity * (0.9 + (h % 220) / 100)));
  const globalFans = tier === 1
    ? localFans * (4 + (h % 25))
    : tier === 2
      ? localFans * (1 + (h % 6))
      : bigThird
        ? localFans * (1 + (h % 3))
        : Math.round(localFans * (0.1 + ((h % 100) / 250)));
  const cash = tier === 1
    ? 18000000 + (h % 75000000)
    : tier === 2
      ? 3500000 + (h % 18000000)
      : bigThird
        ? 1300000 + (h % 7000000)
        : 250000 + (h % 2100000);

  return {
    id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
    name, tier, group, prestige, capacity, localFans: Math.round(localFans), globalFans: Math.round(globalFans), cash,
    brand: 25 + Math.round(prestige * 0.68),
    sporting: 35 + (h % 42),
    commercialMaturity: 15 + (h % 55),
  };
}

export const clubs = [
  ...primera.map((n) => makeClub(n, 1)),
  ...segunda.map((n) => makeClub(n, 2)),
  ...primeraFederacionG1.map((n) => makeClub(n, 3, 'Grupo 1')),
  ...primeraFederacionG2.map((n) => makeClub(n, 3, 'Grupo 2')),
  ...promotionPool.map((n) => makeClub(n, 4)),
];

export const primeraFederacionClubs = clubs.filter((c) => c.tier === 3);
