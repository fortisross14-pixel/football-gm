// The club chronicle: what the owners and fans think (a sentence, not just a number),
// your contract, and the inbox where news arrives (titles, reactions, signings, works…).

import { DIVISION_BY_ID } from '../data/world/structure.js';
import { CONTINENT_NAME } from '../engine/competitions.js';
import { standings } from '../engine/season.js';
import { PHILOSOPHIES, clubIdentity, styleDistance } from '../data/philosophies.js';
import { normalizeTactics } from '../engine/tactics.js';
import { rivalsOf } from '../data/rivals.js';

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const INBOX_MAX = 80;

// ---------------------------------------------------------------------------
// Inbox

// kind: 'title' | 'board' | 'fans' | 'squad' | 'club' | 'career' | 'match' | 'award'
export function pushInbox(state, kind, title, body = '') {
  const msg = { id: `${state.season?.year ?? 0}-${(state.inbox?.length || 0)}-${Date.now() % 100000}`, year: state.season?.year ?? 1, md: state.season?.matchday ?? 0, kind, title, body, read: false };
  state.inbox = [msg, ...(state.inbox || [])].slice(0, INBOX_MAX);
  return state;
}
export const unreadCount = (state) => (state.inbox || []).filter((m) => !m.read).length;
export function markRead(state, id = null) {
  return { ...state, inbox: (state.inbox || []).map((m) => (id === null || m.id === id ? { ...m, read: true } : m)) };
}

// ---------------------------------------------------------------------------
// Opinions

const OWNER_MOODS = [
  [85, 'The owners are delighted with you'], [70, 'The owners are very happy with you'], [55, 'The owners are satisfied'],
  [40, 'The owners are getting impatient'], [25, 'The owners are unhappy'], [0, 'The owners want a change'],
];
const FAN_MOODS = [
  [85, "The fans see you as the perfect coach and never want you to leave"], [70, 'The fans love you'], [55, 'The fans are behind you'],
  [40, 'The fans are restless'], [25, 'The fans are turning against you'], [0, 'The fans want you gone'],
];
const moodOf = (list, v) => list.find(([min]) => v >= min)[1];

function leaguePos(state) {
  const table = standings(state.season, state.club.divisionId);
  return table.findIndex((r) => r.id === state.club.id) + 1;
}

// The single biggest reason behind the owners' view.
function ownerReason(state) {
  const div = DIVISION_BY_ID[state.club.divisionId];
  const pos = leaguePos(state);
  const obj = state.gm?.objective;
  const played = state.season?.matchday > 0;
  const comps = state.season?.comps;
  const reasons = [];
  if (state.season?.userTrophies?.length) reasons.push([10, `above all for winning the ${state.season.userTrophies.at(-1)}`]);
  for (const [k, c] of Object.entries(comps?.continental || {})) {
    if (c.entrants?.includes(state.club.id) && !c.winner && played) reasons.push([6, `especially for the run in the ${CONTINENT_NAME[k]}`]);
  }
  if (played && obj) {
    if (pos <= obj.target) reasons.push([pos === 1 ? 8 : 5, `especially for your ${ordinal(pos)} place in ${div.name}`]);
    else reasons.push([7, `worried about ${ordinal(pos)} place in ${div.name} when they asked you to ${obj.text.toLowerCase()}`]);
  }
  const identity = clubIdentity(state.world.clubs[state.club.id]);
  const dist = styleDistance(normalizeTactics(state.tactics), identity);
  if (dist > 3.5) reasons.push([4, `and they don't like the football: this club plays ${PHILOSOPHIES[identity].name.toLowerCase()}`]);
  else if (dist <= 2) reasons.push([2, `and they like that you play ${PHILOSOPHIES[identity].name.toLowerCase()}, the club's way`]);
  if (!reasons.length) return state.gm?.newJob ? 'they are giving their new manager time' : 'the season has barely started';
  return reasons.sort((a, b) => b[0] - a[0])[0][1];
}

function fanReason(state) {
  const recent = (state.history || []).slice(0, 5);
  const form = recent.map((h) => h.outcome).join('-');
  const derby = (state.history || []).slice(0, 8).find((h) => h.derby);
  const goals = recent.reduce((n, h) => n + h.score[0], 0);
  const reasons = [];
  if (state.season?.userTrophies?.length) reasons.push([10, `after lifting the ${state.season.userTrophies.at(-1)}`]);
  if (derby) reasons.push([8, derby.outcome === 'W' ? `after beating ${derby.opponent} in the derby` : derby.outcome === 'L' ? `still hurting from the derby defeat to ${derby.opponent}` : `after the derby draw with ${derby.opponent}`]);
  if (recent.length >= 3) {
    const w = recent.filter((h) => h.outcome === 'W').length;
    if (w >= 4) reasons.push([7, `riding a run of ${form}`]);
    else if (w <= 1) reasons.push([7, `after a run of ${form}`]);
    else reasons.push([3, `with recent form ${form}`]);
  }
  if (recent.length >= 3 && goals >= recent.length * 2.2) reasons.push([5, `loving the goals: ${goals} in the last ${recent.length}`]);
  if (!reasons.length) {
    const rivals = rivalsOf(state.club.id).map((id) => state.world.clubs[id]?.short).filter(Boolean);
    return rivals.length ? `and they're already counting the days to the derby against ${rivals[0]}` : 'and they are waiting to see what you can do';
  }
  return reasons.sort((a, b) => b[0] - a[0])[0][1];
}

export function opinions(state) {
  const c = state.gm?.confidence || { board: 60, fans: 55 };
  return {
    owners: { value: Math.round(c.board), mood: moodOf(OWNER_MOODS, c.board), reason: ownerReason(state) },
    fans: { value: Math.round(c.fans), mood: moodOf(FAN_MOODS, c.fans), reason: fanReason(state) },
  };
}
export const ownerLine = (o) => `${o.mood}, ${o.reason}.`;
export const fanLine = (o) => `${o.mood}, ${o.reason}.`;

// Messages when a meter crosses into a different mood band.
// At most one message per meter every MOOD_GAP matches, so the inbox doesn't flood.
const MOOD_GAP = 4;
export function moodNews(before, after, state) {
  if (!before || !after) return;
  const band = (list, v) => list.findIndex(([min]) => v >= min);
  const o = opinions(state);
  const tick = (state.season?.year || 1) * 100 + (state.season?.matchday || 0);
  const last = state.gm.moodNewsAt || {};
  const ok = (k) => !last[k] || tick - last[k] >= MOOD_GAP;
  state.gm.moodNewsAt = last;
  if (band(OWNER_MOODS, before.board) !== band(OWNER_MOODS, after.board) && ok('board')) {
    last.board = tick;
    pushInbox(state, 'board', after.board > before.board ? 'The owners are warming to you' : 'A worried call from the boardroom', ownerLine(o.owners));
  }
  if (band(FAN_MOODS, before.fans) !== band(FAN_MOODS, after.fans) && ok('fans')) {
    last.fans = tick;
    pushInbox(state, 'fans', after.fans > before.fans ? 'The stands are singing your name' : 'Grumbling in the stands', fanLine(o.fans));
  }
}

// ---------------------------------------------------------------------------
// Contract

export const CONTRACT_YEARS = { 1: 3, 2: 2, 3: 2 };
export function newContract(year, level) {
  return { from: year, until: year + (CONTRACT_YEARS[level] || 2) - 1 };
}
