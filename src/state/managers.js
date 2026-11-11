// The managers book: one entry per career you have ever started, kept apart from the save
// slots so it survives deleting or overwriting a slot. Pure helpers; storage.js reads and writes it.
import { DIVISION_BY_ID } from '../data/world/structure.js';

const EMPTY = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
const addRec = (a, b) => ({ w: a.w + (b?.w || 0), d: a.d + (b?.d || 0), l: a.l + (b?.l || 0), gf: a.gf + (b?.gf || 0), ga: a.ga + (b?.ga || 0) });
export const played = (r) => (r ? r.w + r.d + r.l : 0);
export const winPct = (r) => (played(r) ? Math.round((r.w / played(r)) * 1000) / 10 : 0);

const slug = (s) => String(s || 'gm').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'gm';
export const makeCareerId = (slot, gmName, created) => `c${slot}-${slug(gmName)}-${created.toString(36)}`;

function clubName(state, clubId) {
  return state.world?.clubs?.[clubId]?.name || (state.gm?.career || []).find((c) => c.clubId === clubId)?.name || clubId;
}
function clubShort(state, clubId) {
  return state.world?.clubs?.[clubId]?.short || (clubId === state.club?.id ? state.club.short : '');
}
function clubColors(state, clubId) {
  return state.world?.clubs?.[clubId]?.colors || (clubId === state.club?.id ? state.club.colors : null);
}

// Builds the book entry for a career from its save. `prev` is the earlier entry (keeps best reputation, sackings, created).
export function managerEntry(state, { id, slot, prev = null, now = Date.now() }) {
  const log = state.careerLog || [];
  const year = state.season?.year ?? 1;
  // After the season closes, the season's record and cups are already in careerLog until next season starts.
  const closed = log.some((s) => s.year === year);
  const seasons = log.map((s) => {
    const div = DIVISION_BY_ID[s.divId];
    return {
      year: s.year, clubId: s.clubId, club: clubName(state, s.clubId), short: clubShort(state, s.clubId),
      div: div?.name || s.divId, level: div?.level ?? 9, pos: s.position, rec: { ...EMPTY, ...s.record }, trophies: [...(s.trophies || [])],
    };
  });
  const current = closed ? null : {
    year, clubId: state.club.id, club: state.club.name, short: state.club.short,
    div: state.club.division, level: state.club.level ?? DIVISION_BY_ID[state.club.divisionId]?.level ?? 9,
    pos: null, rec: { ...EMPTY, ...state.record }, trophies: [...(state.season?.userTrophies || [])], live: true,
  };
  const all = current ? [...seasons, current] : seasons;
  const record = all.reduce((r, s) => addRec(r, s.rec), { ...EMPTY });
  const trophies = all.flatMap((s) => s.trophies.map((t) => ({ season: s.year, competition: t, club: s.club, league: s.pos === 1 && t === s.div })));
  const leagueTitles = seasons.filter((s) => s.pos === 1).length;

  // Clubs managed, with the record and trophies earned at each.
  const clubs = (state.gm?.career || [{ clubId: state.club.id, name: state.club.name, from: 1, to: null }]).map((c) => {
    const here = all.filter((s) => s.clubId === c.clubId && s.year >= c.from && (c.to == null || s.year <= c.to));
    const top = here.filter((s) => s.pos).sort((a, b) => a.level - b.level || a.pos - b.pos)[0];
    return {
      clubId: c.clubId, name: c.name, short: clubShort(state, c.clubId), colors: clubColors(state, c.clubId), from: c.from, to: c.to,
      seasons: here.filter((s) => !s.live).length, record: here.reduce((r, s) => addRec(r, s.rec), { ...EMPTY }),
      trophies: here.reduce((n, s) => n + s.trophies.length, 0),
      best: top ? { year: top.year, div: top.div, pos: top.pos } : null,
    };
  });
  const best = seasons.filter((s) => s.pos).sort((a, b) => a.level - b.level || a.pos - b.pos)[0] || null;

  const rep = state.gm?.reputation ?? 0;
  const sacked = new Set(prev?.sackedSeasons || []);
  if (state.gm?.review?.sacked) sacked.add(state.gm.review.season);
  if (state.gm?.sacked && state.gm?.review) sacked.add(state.gm.review.season);

  return {
    id,
    slot,
    status: 'active',
    gmName: state.gmName || 'GM',
    nation: state.gm?.nation ?? null,
    gmTrait: state.gm?.trait ?? null, // the GM card ({ id, rarity }); null for careers from before GM cards
    created: prev?.created ?? now,
    updated: now,
    retiredAt: null,
    club: { id: state.club.id, name: state.club.name, short: state.club.short, colors: state.club.colors, division: state.club.division, level: state.club.level ?? null },
    season: year,
    seasonsPlayed: seasons.length,
    record,
    winPct: winPct(record),
    trophyCount: trophies.length,
    leagueTitles,
    cups: trophies.length - leagueTitles,
    trophies,
    clubs,
    reputation: rep,
    bestReputation: Math.max(rep, prev?.bestReputation ?? 0),
    sackedSeasons: [...sacked].sort((a, b) => a - b),
    best: best ? { year: best.year, club: best.club, div: best.div, level: best.level, pos: best.pos } : null,
    seasons: all,
  };
}

// Ranking score: silverware first, then how you won, how far your name carries, and longevity.
// Win % counts in full from 30 league matches, so a 1-0 debut doesn't top the table.
export function managerScore(m) {
  const sample = Math.min(1, played(m.record) / 30);
  return Math.round(10 * (m.leagueTitles || 0) + 8 * (m.cups || 0) + 0.4 * (m.winPct || 0) * sample + 0.5 * (m.bestReputation || 0) + 1.5 * (m.seasonsPlayed || 0) - 4 * (m.sackedSeasons?.length || 0));
}

export const MANAGER_SORTS = [
  { id: 'score', label: 'Score', value: managerScore },
  { id: 'trophies', label: 'Trophies', value: (m) => m.trophyCount * 1000 + m.leagueTitles },
  { id: 'win', label: 'Win %', value: (m) => (played(m.record) ? m.winPct * 1000 + played(m.record) : -1) },
  { id: 'rep', label: 'Reputation', value: (m) => m.bestReputation * 1000 + m.reputation },
  { id: 'seasons', label: 'Seasons', value: (m) => m.seasonsPlayed * 1000 + played(m.record) },
];

export function rankManagers(list, sortId = 'score') {
  const sort = MANAGER_SORTS.find((s) => s.id === sortId) || MANAGER_SORTS[0];
  return [...list].sort((a, b) => sort.value(b) - sort.value(a) || managerScore(b) - managerScore(a) || b.updated - a.updated);
}
