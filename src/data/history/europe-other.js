// Real-life champions of the other European top flights in our world.
// Same format as europe-leagues.js. Where a league's early years are not listed, `from` and `note` say so.

const GS = 'galatasaray'; const FB = 'fenerbahce'; const BJK = 'besiktas'; const TS = 'trabzonspor';
const AND = 'anderlecht'; const CLB = 'club-brugge'; const STD = 'standard-liege'; const GNK = 'genk'; const MEC = 'mechelen';
const GC = 'grasshoppers'; const BAS = 'fc-basel'; const YB = 'young-boys'; const ZUR = 'fc-zurich'; const SER = 'servette'; const SIO = 'fc-sion';
const FCK = 'fc-copenhagen'; const BRO = 'brondby'; const AAB = 'aab'; const FCM = 'midtjylland';
const CEL = 'celtic'; const RAN = 'rangers'; const HEA = 'hearts'; const HIB = 'hibernian'; const ABE = 'aberdeen';
const SAL = 'red-bull-salzburg'; const AW = 'austria-wien'; const RAP = 'rapid-wien'; const STU = 'sturm-graz'; const WAC = 'wacker-innsbruck';
const OLY = 'olympiacos'; const PAO = 'panathinaikos'; const AEK = 'aek-athens'; const PAOK = 'paok';
const _ = null;
const x = (id, n) => Array(n).fill(id);

export const HISTORY = {
  'L:tur-1': {
    name: 'Süper Lig', from: 1959,
    w: [FB,
      /* 1960 */ BJK, FB, GS, GS, FB, FB, BJK, BJK, FB, GS,
      /* 1970 */ FB, GS, GS, GS, FB, FB, TS, TS, FB, TS,
      /* 1980 */ TS, TS, BJK, FB, TS, FB, BJK, GS, GS, FB,
      /* 1990 */ BJK, BJK, BJK, GS, GS, BJK, FB, GS, GS, GS,
      /* 2000 */ GS, FB, GS, BJK, FB, FB, GS, FB, GS, BJK,
      /* 2010 */ 'bursaspor', FB, GS, GS, FB, GS, BJK, BJK, GS, GS,
      /* 2020 */ 'basaksehir', BJK, TS, GS, GS, GS, GS],
  },
  'L:bel-1': {
    name: 'Belgian champions', from: 1947, note: 'From 1946–47 (earlier titles not listed).',
    w: [AND, MEC, AND,
      /* 1950 */ AND, AND, 'FC Liégeois', 'FC Liégeois', AND, AND, AND, 'antwerp', STD, AND,
      /* 1960 */ 'Lierse', STD, AND, STD, AND, AND, AND, AND, AND, STD,
      /* 1970 */ STD, STD, AND, CLB, AND, 'RWD Molenbeek', CLB, CLB, CLB, 'Beveren',
      /* 1980 */ CLB, AND, STD, STD, 'Beveren', AND, AND, AND, CLB, MEC,
      /* 1990 */ CLB, AND, CLB, AND, AND, AND, CLB, 'Lierse', CLB, GNK,
      /* 2000 */ AND, AND, GNK, CLB, AND, CLB, AND, AND, STD, STD,
      /* 2010 */ AND, GNK, AND, AND, AND, 'gent', CLB, AND, CLB, GNK,
      /* 2020 */ CLB, CLB, CLB, 'antwerp', CLB, 'union-sg', CLB],
  },
  'L:sui-1': {
    name: 'Swiss champions', from: 1990, note: 'From 1989–90 (earlier titles not listed).',
    w: [GC, GC, SIO, 'FC Aarau', SER, GC, GC, SIO, GC, SER,
      /* 2000 */ 'st-gallen', GC, BAS, GC, BAS, BAS, ZUR, ZUR, BAS, ZUR,
      /* 2010 */ ...x(BAS, 8), YB, YB,
      /* 2020 */ YB, YB, ZUR, YB, YB, BAS, 'FC Thun'],
  },
  'L:den-1': {
    name: 'Danish Superliga', from: 1991, note: 'Superliga era, from 1991.',
    w: [BRO, 'lyngby', FCK, 'Silkeborg', AAB, BRO, BRO, BRO, AAB,
      /* 2000 */ 'Herfølge', FCK, BRO, FCK, FCK, BRO, FCK, FCK, AAB, FCK,
      /* 2010 */ FCK, FCK, 'nordsjaelland', FCK, AAB, FCM, FCK, FCK, FCM, FCK,
      /* 2020 */ FCM, BRO, FCK, FCK, FCM, FCK, 'agf'],
  },
  'L:sco-1': {
    name: 'Scottish champions', from: 1891, note: '1891 title shared.',
    w: [['Dumbarton', RAN], 'Dumbarton', CEL, CEL, HEA, CEL, HEA, CEL, RAN,
      /* 1900 */ RAN, RAN, RAN, HIB, 'Third Lanark', CEL, CEL, CEL, CEL, CEL,
      /* 1910 */ CEL, RAN, RAN, RAN, CEL, CEL, CEL, CEL, RAN, CEL,
      /* 1920 */ RAN, RAN, CEL, RAN, RAN, RAN, CEL, RAN, RAN, RAN,
      /* 1930 */ RAN, RAN, 'motherwell', RAN, RAN, RAN, CEL, RAN, CEL, RAN,
      /* 1940 */ _, _, _, _, _, _, _, RAN, HIB, RAN,
      /* 1950 */ RAN, HIB, HIB, RAN, CEL, ABE, RAN, RAN, HEA, RAN,
      /* 1960 */ HEA, RAN, 'dundee-fc', RAN, RAN, 'kilmarnock', CEL, CEL, CEL, CEL,
      /* 1970 */ CEL, CEL, CEL, CEL, CEL, RAN, RAN, CEL, RAN, CEL,
      /* 1980 */ ABE, CEL, CEL, 'dundee-united', ABE, ABE, CEL, RAN, CEL, RAN,
      /* 1990 */ RAN, RAN, RAN, RAN, RAN, RAN, RAN, RAN, CEL, RAN,
      /* 2000 */ RAN, CEL, CEL, RAN, CEL, RAN, CEL, CEL, CEL, RAN,
      /* 2010 */ RAN, RAN, ...x(CEL, 8),
      /* 2020 */ CEL, RAN, CEL, CEL, CEL, CEL, CEL],
  },
  'L:aut-1': {
    name: 'Austrian champions', from: 1990, note: 'From 1989–90 (earlier titles not listed). Austria Salzburg counted for Red Bull Salzburg, FC Tirol for Wacker Innsbruck.',
    w: [WAC, AW, AW, AW, SAL, SAL, RAP, SAL, STU, STU,
      /* 2000 */ WAC, WAC, WAC, AW, 'grazer-ak', RAP, AW, SAL, RAP, SAL,
      /* 2010 */ SAL, STU, SAL, AW, ...x(SAL, 6),
      /* 2020 */ SAL, SAL, SAL, SAL, STU, STU, 'lask'],
  },
  'L:gre-1': {
    name: 'Greek champions', from: 1960, note: 'Alpha Ethniki era, from 1959–60.',
    w: [PAO, PAO, PAO, AEK, PAO, PAO, OLY, OLY, AEK, PAO,
      /* 1970 */ PAO, AEK, PAO, OLY, OLY, OLY, PAOK, PAO, AEK, AEK,
      /* 1980 */ OLY, OLY, OLY, OLY, PAO, PAOK, PAO, OLY, 'AEL Larissa', AEK,
      /* 1990 */ PAO, PAO, AEK, AEK, AEK, PAO, PAO, OLY, OLY, OLY,
      /* 2000 */ OLY, OLY, OLY, OLY, PAO, OLY, OLY, OLY, OLY, OLY,
      /* 2010 */ PAO, ...x(OLY, 7), AEK, PAOK,
      /* 2020 */ OLY, OLY, OLY, AEK, PAOK, OLY, AEK],
  },
};
