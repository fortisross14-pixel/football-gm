// Real-life champions in Asia and Africa: leagues and cups of the countries in our world.
// Same format as europe-leagues.js.

const KAS = 'kashima-antlers'; const VER = 'tokyo-verdy'; const YFM = 'yokohama-f-marinos'; const JUB = 'jubilo-iwata'; const GAM = 'gamba-osaka';
const URA = 'urawa-reds'; const NAG = 'nagoya-grampus'; const KSW = 'kashiwa-reysol'; const SAN = 'sanfrecce-hiroshima'; const KAW = 'kawasaki-frontale';
const VIS = 'vissel-kobe'; const FLU = 'Yokohama Flügels';
const HIL = 'al-hilal'; const NAS = 'al-nassr'; const ITT = 'al-ittihad'; const SHB = 'al-shabab-sau'; const AHL = 'al-ahli-sau';
const AHY = 'al-ahly'; const ZAM = 'zamalek';
const ENY = 'enyimba'; const KAN = 'kano-pillars'; const RAN = 'rangers-international'; const DOL = 'Dolphins';
const _ = null;

export const HISTORY = {
  'L:jpn-1': {
    name: 'J1 League', from: 1993, note: 'J.League era, from 1993.',
    w: [VER, VER, YFM, KAS, JUB, KAS, JUB,
      /* 2000 */ KAS, KAS, JUB, YFM, YFM, GAM, URA, KAS, KAS, KAS,
      /* 2010 */ NAG, KSW, SAN, SAN, GAM, SAN, KAS, KAW, KAW, YFM,
      /* 2020 */ KAW, KAW, YFM, VIS, VIS, KAS],
  },
  'C:JPN': {
    name: "Emperor's Cup", from: 1993, note: 'From the 1993 edition; listed by edition year (finals are played around New Year).',
    w: [FLU, 'Bellmare Hiratsuka', NAG, VER, KAS, FLU, NAG,
      /* 2000 */ KAS, 'shimizu-s-pulse', 'kyoto-sanga', JUB, VER, URA, URA, KAS, GAM, GAM,
      /* 2010 */ KAS, 'fc-tokyo', KSW, YFM, GAM, GAM, KAS, 'cerezo-osaka', URA, VIS,
      /* 2020 */ KAW, URA, 'Ventforet Kofu', KAW, VIS, 'machida-zelvia'],
  },
  'L:sau-1': {
    name: 'Saudi champions', from: 2000, note: 'From 1999–2000 (earlier titles not listed).',
    w: [ITT, ITT, HIL, ITT, SHB, HIL, SHB, ITT, HIL, ITT,
      /* 2010 */ HIL, HIL, SHB, 'al-fateh', NAS, NAS, AHL, HIL, HIL, NAS,
      /* 2020 */ HIL, HIL, HIL, ITT, HIL, ITT, NAS],
  },
  'L:egy-1': {
    name: 'Egyptian Premier League', from: 2000, note: 'From 1999–2000 (earlier titles not listed); 2012 and 2013 cancelled.',
    w: [AHY, ZAM, 'ismaily', ZAM, ZAM, AHY, AHY, AHY, AHY, AHY,
      /* 2010 */ AHY, AHY, _, _, AHY, ZAM, AHY, AHY, AHY, AHY,
      /* 2020 */ AHY, ZAM, ZAM, AHY, AHY, AHY],
  },
  'L:nga-1': {
    name: 'Nigeria Premier League', from: 2000, note: 'From 2000 (earlier titles not listed); 2020 cancelled, some seasons abridged.',
    w: ['julius-berger', ENY, ENY, ENY, DOL, ENY, 'Ocean Boys', ENY, KAN, 'Bayelsa United',
      /* 2010 */ ENY, DOL, KAN, KAN, KAN, ENY, RAN, 'plateau-united', 'Lobi Stars', ENY,
      /* 2020 */ _, 'Akwa United', 'rivers-united', ENY, RAN, 'remo-stars'],
  },
};
