// Headless balance check: simulates many matches and prints key rates.
// Usage: node scripts/balance.mjs [matches]
import { simulateMatch } from '../src/engine/match.js';
import { buildAiTeam } from '../src/engine/aiTeam.js';
import { OPPONENTS, USER_CLUB, USER_SQUAD, USER_LINEUP, USER_BENCH, USER_COACHES } from '../src/data/demo.js';

const N = Number(process.argv[2]) || 4000;

const club = (id, rating, formation) => ({ id, name: id, short: id.slice(0, 3).toUpperCase(), colors: {}, rating, formation, keyPlayers: [] });

const user = {
  ...USER_CLUB,
  formation: USER_COACHES.coach.formation,
  players: USER_SQUAD,
  lineup: USER_LINEUP,
  bench: USER_BENCH,
  coach: USER_COACHES.coach,
  assistant: USER_COACHES.assistant,
  loadout: [],
};

function run(label, makeHome, makeAway, knockout = false) {
  let saved = 0, goals = 0, home = 0, draw = 0, away = 0, comebacks = 0, trailing75 = 0, shootouts = 0, high = 0;
  for (let i = 0; i < N; i += 1) {
    const s = simulateMatch({ home: makeHome(i), away: makeAway(i), context: { knockout }, seed: 1000 + i * 7919 });
    const [h, a] = s.score;
    goals += h + a;
    if (h + a >= 6) high += 1;
    if (s.result.winner === 0) home += 1; else if (s.result.winner === 1) away += 1; else draw += 1;
    if (s.shootout) shootouts += 1;
    const at60 = s.segmentSummaries[3].score;
    for (const side of [0, 1]) {
      if (at60[side] < at60[1 - side]) {
        trailing75 += 1;
        if (s.result.winner === side) comebacks += 1;
        if (s.score[side] >= s.score[1 - side]) saved += 1;
      }
    }
  }
  const pct = (v) => `${((v / N) * 100).toFixed(1)}%`;
  console.log(`${label.padEnd(34)} goals/match ${(goals / N).toFixed(2)} | H ${pct(home)} D ${pct(draw)} A ${pct(away)} | 6+ goals ${pct(high)} | trailing at 60': win ${((comebacks / Math.max(1, trailing75)) * 100).toFixed(1)}% / not lose ${((saved / Math.max(1, trailing75)) * 100).toFixed(1)}%${knockout ? ` | shootouts ${pct(shootouts)}` : ''}`);
}

for (const formation of ['2-3-1', '3-2-1', '2-2-2']) {
  run(`Equal 70 v 70 (${formation})`, (i) => buildAiTeam(club('h', 70, formation), i), (i) => buildAiTeam(club('a', 70, '2-3-1'), i + 1));
}
run('Strong 76 v weak 64', (i) => buildAiTeam(club('h', 76, '2-3-1'), i), (i) => buildAiTeam(club('a', 64, '2-3-1'), i + 1));
run('Weak 64 v strong 76', (i) => buildAiTeam(club('h', 64, '2-3-1'), i), (i) => buildAiTeam(club('a', 76, '2-3-1'), i + 1));
run('Equal 70 v 70 knockout', (i) => buildAiTeam(club('h', 70, '2-3-1'), i), (i) => buildAiTeam(club('a', 70, '2-3-1'), i + 1), true);
for (const opp of OPPONENTS) {
  run(`Demo squad v ${opp.name}`, () => ({ ...user, isAI: true }), (i) => buildAiTeam(opp, i));
}
