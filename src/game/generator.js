import { firstNames, lastNames, positions, styles } from '../data/names.js';
import { hashString } from '../data/clubs.js';

export function rng(seed) {
  let t = seed + 0x6D2B79F5;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }

export function generatePlayers(club, count = 24) {
  const r = rng(hashString(`${club.name}-players`));
  return Array.from({ length: count }, (_, i) => {
    const base = Math.round(42 + club.sporting * 0.36 + (r() * 18 - 9));
    const age = 18 + Math.floor(r() * 17);
    const potentialBoost = Math.max(0, Math.round((27 - age) * r() * 1.2));
    return {
      id:`p-${club.id}-${i}`,
      name:`${pick(firstNames,r)} ${pick(lastNames,r)}`,
      pos: positions[i % positions.length],
      age,
      overall: Math.max(45, Math.min(88, base)),
      potential: Math.max(48, Math.min(92, base + potentialBoost)),
      salary: Math.round((35000 + base * base * 30) / 1000) * 1000,
      value: Math.round((120000 + Math.pow(base - 35, 2) * 13500) / 10000) * 10000,
      morale: 58 + Math.floor(r() * 32),
      contract: 1 + Math.floor(r() * 4),
    };
  });
}

export function generateMarket(club, count = 36) {
  const r = rng(hashString(`${club.name}-market`));
  return Array.from({ length: count }, (_, i) => {
    const overall = 49 + Math.floor(r() * 31);
    const age = 18 + Math.floor(r() * 16);
    return {
      id:`m-${i}-${Math.floor(r()*1e7)}`,
      name:`${pick(firstNames,r)} ${pick(lastNames,r)}`,
      pos: pick(positions,r), age, overall,
      potential: Math.min(92, overall + Math.max(0, Math.floor((28-age) * r()))),
      value: Math.round((150000 + Math.pow(overall - 38, 2) * 16000) / 50000) * 50000,
      salary: Math.round((45000 + overall * overall * 34) / 5000) * 5000,
      club: r() > .32 ? `Club ${String.fromCharCode(65 + (i % 18))}` : 'Libre',
      star: overall >= club.sporting + 18,
    };
  });
}

export function generateStaff(club, role, count = 5) {
  const r = rng(hashString(`${club.name}-${role}`));
  return Array.from({ length: count }, (_, i) => ({
    id:`s-${role}-${i}`,
    name:`${pick(firstNames,r)} ${pick(lastNames,r)}`,
    role,
    rating: 45 + Math.floor(r() * 41),
    salary: Math.round((28000 + r() * 260000) / 1000) * 1000,
    style: role === 'Entrenador' ? pick(styles,r) : null,
    trait: pick(['Metódico','Negociador','Innovador','Formador','Carismático','Analítico'],r),
  }));
}

export function generateSponsorOffers(club, skill = 4) {
  const r = rng(hashString(`${club.name}-sponsors-${skill}`));
  const brands = ['Orbe Telecom','Costa Norte Seguros','Turia Mobility','Nexo Bank','Brava Foods','Iberia Solar','Marea Hotels','Cobalto Tech','Alma Retail','Aurea Logistics'];
  return Array.from({ length: 5 }, (_, i) => {
    const quality = .72 + r() * .65;
    const annual = Math.round((club.localFans * 3.8 + club.globalFans * .16 + club.prestige * 8500) * quality / 10000) * 10000;
    return {
      id:`sp-${i}`,
      brand: brands[(i + hashString(club.name)) % brands.length],
      type: i === 0 ? 'Camiseta principal' : i === 1 ? 'Manga' : i === 2 ? 'Estadio' : 'Partner oficial',
      annual,
      years: 1 + Math.floor(r() * 3),
      bonusWin: Math.round(annual * (.015 + r()*.02) / 1000) * 1000,
      fit: 48 + Math.floor(r() * 50),
    };
  });
}
