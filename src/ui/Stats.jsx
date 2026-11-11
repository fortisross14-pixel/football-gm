import React, { useMemo, useState } from 'react';
import { playerBoard, coachBoard, emptyBook } from '../engine/statsbook.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { CONTINENT_NAME } from '../engine/competitions.js';
import { Segmented } from './Home.jsx';
import { Crest } from './Art.jsx';
import { ClubLink, PlayerLink, ManagerLink, useSticky } from './nav.jsx';
import { yearLabel } from '../engine/years.js';

// Live stats: any moment, any competition, players and coaches.
const COUNTRIES = [...new Map(DIVISIONS.filter((d) => d.tier === 1).map((d) => [d.code, d])).values()];

function compFilter(scope) {
  if (scope === 'all') return () => true;
  if (scope === 'leagues') return (c) => c.startsWith('L:');
  if (scope === 'top') return (c) => c.startsWith('L:') && DIVISION_BY_ID[c.slice(2)]?.level === 1;
  if (scope === 'cups') return (c) => c.startsWith('C:');
  if (scope === 'intl') return (c) => c.startsWith('K:') || c === 'W';
  return (c) => c === scope; // a single competition key
}

const PLAYER_KEYS = [
  { id: 'goals', label: 'Top scorers', col: 'Goals', fmt: (p) => p.goals },
  { id: 'rating', label: 'Best rated', col: 'Avg', fmt: (p) => p.rating.toFixed(2) },
  { id: 'motm', label: 'Most MVPs', col: 'MOTM', fmt: (p) => p.motm },
  { id: 'cs', label: 'Clean sheets', col: 'CS', fmt: (p) => p.cs },
  { id: 'apps', label: 'Most games', col: 'Apps', fmt: (p) => p.apps },
];
const COLS = PLAYER_KEYS;
const COACH_KEYS = [
  { id: 'wins', label: 'Most wins', col: 'W' },
  { id: 'pct', label: 'Best win %', col: 'Win %' },
  { id: 'titles', label: 'Titles', col: 'Titles' },
];

export default function Stats({ state, initialScope = 'all', memoKey = 'stats' }) {
  const stats = state.stats || { season: emptyBook(), all: emptyBook() };
  // Fresh season with no games yet: open on last season instead of an empty board.
  const [period, setPeriod] = useSticky(`${memoKey}.period`, Object.keys(stats.season.players).length ? 'season' : stats.lastSeason ? 'last' : 'all');
  const [scope, setScope] = useSticky(`${memoKey}.scope`, initialScope);
  const [who, setWho] = useSticky(`${memoKey}.who`, 'players');
  const [key, setKey] = useSticky(`${memoKey}.key`, 'goals');
  const [ckey, setCkey] = useSticky(`${memoKey}.ckey`, 'wins');
  const book = period === 'season' ? stats.season : period === 'last' ? (stats.lastSeason || emptyBook()) : stats.all;
  const filter = compFilter(scope);
  const rows = useMemo(() => playerBoard(book, { filter, key, minApps: period === 'all' ? 15 : 5, limit: 25 }), [book, scope, key, period]);
  const crows = useMemo(() => coachBoard(book, { filter, key: ckey, minGames: period === 'all' ? 20 : 6, limit: 25 }), [book, scope, ckey, period]);
  const leagueOpts = DIVISIONS.filter((d) => d.level === 1 || d.id === state.club.divisionId);
  const k = PLAYER_KEYS.find((x) => x.id === key);
  const ck = COACH_KEYS.find((x) => x.id === ckey);
  const club = (id) => state.world.clubs[id];

  return (
    <div className="stats">
      <div className="stats__filters">
        <Segmented small label="Period" value={period} options={[{ id: 'season', label: yearLabel(stats.year || state.season.year) }, { id: 'last', label: 'Last season', disabled: !stats.lastSeason }, { id: 'all', label: 'All-time' }]} onChange={setPeriod} />
        <label className="select">
          <span>Competition</span>
          <select id="stats-scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">All competitions</option>
            <option value="leagues">All leagues</option>
            <option value="top">Top-flight leagues</option>
            <optgroup label="One league">
              {leagueOpts.map((d) => <option key={d.id} value={`L:${d.id}`}>{d.name}{d.id === state.club.divisionId ? ' (yours)' : ''}</option>)}
            </optgroup>
            <option value="cups">All domestic cups</option>
            <optgroup label="One cup">
              {COUNTRIES.map((d) => <option key={d.code} value={`C:${d.code}`}>{d.country} Cup</option>)}
            </optgroup>
            <option value="intl">Continental + Club World Cup</option>
            {Object.entries(CONTINENT_NAME).map(([c, n]) => <option key={c} value={`K:${c}`}>{n}</option>)}
            <option value="W">Club World Cup</option>
          </select>
        </label>
        <Segmented small label="Show" value={who} options={[{ id: 'players', label: 'Players' }, { id: 'coaches', label: 'Coaches' }]} onChange={setWho} />
      </div>

      {who === 'players' ? (
        <>
          <div className="chip-row">
            {PLAYER_KEYS.map((x) => <button key={x.id} type="button" className={`chip-btn${key === x.id ? ' is-on' : ''}`} onClick={() => setKey(x.id)}>{x.label}</button>)}
          </div>
          {rows.length ? (
            <div className="scroll-x">
              <table className="table table--history">
                <thead><tr><th>#</th><th className="table__club">Player</th><th className="is-key">{k.col}</th><th className="table__club">Club</th><th>Pos</th>{COLS.filter((c) => c.id !== key).map((c) => <th key={c.id}>{c.col}</th>)}</tr></thead>
                <tbody>
                  {rows.map((p, i) => (
                    <tr key={p.id} className={p.clubId === state.club.id ? 'is-user' : ''}>
                      <td>{i + 1}</td>
                      <td className="table__club"><b><PlayerLink id={p.id} name={p.name} /></b></td>
                      <td className="is-key">{k.fmt(p)}</td>
                      <td className="table__club">{club(p.clubId) ? <ClubLink id={p.clubId} className="club-inline"><Crest colors={club(p.clubId).colors} short={club(p.clubId).short} id={p.clubId} size={16} /> <span>{club(p.clubId).short}</span></ClubLink> : '—'}</td>
                      <td>{p.pos}</td>
                      {COLS.filter((c) => c.id !== key).map((c) => <td key={c.id}>{c.fmt(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="hint">No {k.label.toLowerCase()} yet for this selection.</p>}
          <p className="hint">Every game in the world counts as it's played. Your players' numbers come from the real matches; other clubs' named players are tracked from their results. {key === 'rating' ? 'Best rated needs a few games played.' : ''}</p>
        </>
      ) : (
        <>
          <div className="chip-row">
            {COACH_KEYS.map((x) => <button key={x.id} type="button" className={`chip-btn${ckey === x.id ? ' is-on' : ''}`} onClick={() => setCkey(x.id)}>{x.label}</button>)}
          </div>
          {crows.length ? (
            <div className="scroll-x">
              <table className="table table--history">
                <thead><tr><th>#</th><th className="table__club">Coach</th><th className="table__club">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Win %</th><th>Titles</th></tr></thead>
                <tbody>
                  {crows.map((c, i) => (
                    <tr key={c.key} className={c.isUser ? 'is-user' : ''}>
                      <td>{i + 1}</td>
                      <td className="table__club"><b><ManagerLink mkey={c.key}>{c.name}{c.isUser ? ' (your coach)' : ''}</ManagerLink></b></td>
                      <td className="table__club">{club(c.clubId) ? <ClubLink id={c.clubId}>{club(c.clubId).short}</ClubLink> : '—'}</td>
                      <td>{c.played}</td>
                      <td className={ckey === 'wins' ? 'is-key' : ''}>{c.wins}</td><td>{c.draws}</td><td>{c.losses}</td>
                      <td className={ckey === 'pct' ? 'is-key' : ''}>{c.pct.toFixed(0)}%</td>
                      <td className={ckey === 'titles' ? 'is-key' : ''}>{c.titles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="hint">No {ck.label.toLowerCase()} yet for this selection.</p>}
          <p className="hint">Titles count league titles and cup wins, added when a trophy is decided at season end.</p>
        </>
      )}
    </div>
  );
}
