// The live stats book: every game in the world, as it is played.
// Two books with the same shape: `season` (reset every summer) and `all` (forever).
//   players[id] = { n: name, c: last club, p: pos, s: { [comp]: [apps, goals, motm, cleanSheets, ratingSum] } }
//   coaches[key] = { n: name, c: club, s: { [comp]: [played, won, drawn, lost] }, t: titles }
// comp keys (engine/competitions.js): 'L:<divisionId>' league, 'C:<code>' domestic cup, 'S:<code>' super cup,
// 'K:<conf>' continental, 'K2:<conf>' second continental trophy, 'KS:<conf>' continental super cup, 'W' Club World Cup.
// AI games are quick-simmed: their named players get appearances, goals and a rating
// derived from the result; your games use the real match data.

const APPS = 0; const GOALS = 1; const MOTM = 2; const CS = 3; const RSUM = 4;

export const emptyBook = () => ({ players: {}, coaches: {} });
export const newStats = (year = 1) => ({ year, season: emptyBook(), all: emptyBook() });

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function addPlayer(book, comp, e) {
  const row = book.players[e.id] || (book.players[e.id] = { n: e.name, c: e.clubId, p: e.pos, s: {} });
  row.c = e.clubId;
  const t = row.s[comp] || (row.s[comp] = [0, 0, 0, 0, 0]);
  t[APPS] += 1;
  t[GOALS] += e.goals || 0;
  t[MOTM] += e.motm ? 1 : 0;
  t[CS] += e.cs ? 1 : 0;
  t[RSUM] = Math.round((t[RSUM] + e.rating) * 10) / 10;
}

function addCoach(book, comp, key, name, clubId, res) {
  const row = book.coaches[key] || (book.coaches[key] = { n: name, c: clubId, s: {}, t: 0 });
  row.c = clubId;
  row.n = name;
  const t = row.s[comp] || (row.s[comp] = [0, 0, 0, 0]);
  t[0] += 1;
  t[res === 'W' ? 1 : res === 'D' ? 2 : 3] += 1;
}

export const coachKey = (world, clubId, userClubId) => (clubId === userClubId ? 'you' : `${clubId}|${world.gms?.[clubId]?.name || 'Manager'}`);

// A quick-simmed game. goals: [{ side, playerId, name }] as season.quickResult returns them.
// detail: optional real player lines for one side ({ side, lines: [{ id, name, pos, goals, rating, cs }] }).
// Balancing sims switch the book off (globalThis.FOOTBALL_NO_STATS): it never changes results.
export function recordGame(stats, { world, poolById, comp, homeId, awayId, score, goals = [], detail = null, userClubId = null, userName = 'You' }) {
  if (!stats || globalThis.FOOTBALL_NO_STATS) return;
  const entries = [];
  [homeId, awayId].forEach((clubId, side) => {
    const own = score[side];
    const against = score[1 - side];
    const res = own > against ? 'W' : own === against ? 'D' : 'L';
    if (detail && detail.side === side) {
      for (const l of detail.lines) entries.push({ ...l, clubId });
    } else {
      const club = world.clubs[clubId];
      for (const pid of club?.keyPlayers || []) {
        const card = poolById[pid];
        if (!card) continue;
        const g = goals.filter((x) => x.side === side && x.playerId === pid).length;
        const ovr = (card.att * 0.4 + card.def * 0.35 + card.phy * 0.25);
        const noise = ((hash(`${pid}:${homeId}:${awayId}:${score.join('-')}`) % 61) - 30) / 100;
        const cs = card.pos === 'GK' && against === 0;
        const rating = 6.3 + g * 1.0 + (res === 'W' ? 0.4 : res === 'L' ? -0.3 : 0) + (ovr - 70) / 25 + noise
          + (cs ? 0.7 : 0) + (card.pos === 'DEF' && against === 0 ? 0.3 : 0) - (card.pos === 'GK' ? against * 0.25 : 0);
        entries.push({ id: pid, name: card.name, pos: card.pos, clubId, goals: g, cs, rating: Math.max(3, Math.min(10, Math.round(rating * 10) / 10)) });
      }
    }
    const key = coachKey(world, clubId, userClubId);
    const name = clubId === userClubId ? userName : (world.gms?.[clubId]?.name || 'Manager');
    for (const book of [stats.season, stats.all]) addCoach(book, comp, key, name, clubId, res);
  });
  // Your games carry the real man of the match; otherwise the best named player, if he stood out
  // (unnamed squad players play too, so a 6.9 doesn't win it).
  if (!entries.some((e) => e.motm)) {
    const best = entries.reduce((b, e) => (!b || e.rating > b.rating ? e : b), null);
    if (best && (best.rating >= 7.6 || detail)) best.motm = !detail;
  }
  for (const e of entries) for (const book of [stats.season, stats.all]) addPlayer(book, comp, e);
}

// A coach won a trophy (league title, cup, continental, Club World Cup).
export function recordTitle(stats, key, name, clubId) {
  if (!stats) return;
  for (const book of [stats.season, stats.all]) {
    const row = book.coaches[key] || (book.coaches[key] = { n: name, c: clubId, s: {}, t: 0 });
    row.t = (row.t || 0) + 1;
  }
}

// Leaderboards. filter(compKey) chooses competitions; key: goals | rating | motm | cs | apps.
export function playerBoard(book, { filter = () => true, key = 'goals', minApps = 5, limit = 20 } = {}) {
  const out = [];
  for (const [id, row] of Object.entries(book.players)) {
    let a = 0; let g = 0; let m = 0; let c = 0; let r = 0;
    for (const [comp, t] of Object.entries(row.s)) {
      if (!filter(comp)) continue;
      a += t[APPS]; g += t[GOALS]; m += t[MOTM]; c += t[CS]; r += t[RSUM];
    }
    if (!a) continue;
    out.push({ id, name: row.n, clubId: row.c, pos: row.p, apps: a, goals: g, motm: m, cs: c, rating: r / a });
  }
  const list = key === 'rating' ? out.filter((p) => p.apps >= minApps) : key === 'cs' ? out.filter((p) => p.pos === 'GK') : out;
  return list.sort((x, y) => (y[key] - x[key]) || (y.apps - x.apps)).slice(0, limit).filter((p) => key === 'rating' || p[key] > 0);
}

export function coachBoard(book, { filter = () => true, key = 'wins', minGames = 10, limit = 20 } = {}) {
  const out = [];
  for (const [k, row] of Object.entries(book.coaches)) {
    let p = 0; let w = 0; let d = 0; let l = 0;
    for (const [comp, t] of Object.entries(row.s)) {
      if (!filter(comp)) continue;
      p += t[0]; w += t[1]; d += t[2]; l += t[3];
    }
    if (!p && !row.t) continue;
    out.push({ key: k, name: row.n, clubId: row.c, played: p, wins: w, draws: d, losses: l, pct: p ? (w / p) * 100 : 0, titles: row.t || 0, isUser: k === 'you' });
  }
  const list = key === 'pct' ? out.filter((c) => c.played >= minGames) : out;
  return list.sort((x, y) => (y[key] - x[key]) || (y.wins - x.wins)).slice(0, limit);
}
