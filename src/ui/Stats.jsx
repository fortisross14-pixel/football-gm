import React, { useMemo, useState } from 'react';
import { playerBoard, coachBoard, emptyBook } from '../engine/statsbook.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { CONTINENT_NAME } from '../engine/competitions.js';
import { Segmented } from './Home.jsx';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';

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
  { id: 'goals', label: 'Top scorers', col: 'Goals' },
  { id: 'rating', label: 'Best rated', col: 'Avg' },
  { id: 'motm', label: 'Most MVPs', col: 'MOTM' },
  { id: 'cs', label: 'Clean sheets', col: 'CS' },
  { id: 'apps', label: 'Most games', col: 'Apps' },
];
const COACH_KEYS = [
  { id: 'wins', label: 'Most wins', col: 'W' },
  { id: 'pct', label: 'Best win %', col: 'Win %' },
  { id: 'titles', label: 'Titles', col: 'Titles' },
];

export default function Stats({ state, initialScope = 'all' }) {
  const stats = state.stats || { season: emptyBook(), all: emptyBook() };
  const [period, setPeriod] = useState('season');
  const [scope, setScope] = useState(initialScope);
  const [who, setWho] = useState('players');
  const [key, setKey] = useState('goals');
  const [ckey, setCkey] = useState('wins');
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
        <Segmented small label="Period" value={period} options={[{ id: 'season', label: `Season ${stats.year || state.season.year}` }, { id: 'last', label: 'Last season', disabled: !stats.lastSeason }, { id: 'all', label: 'All-time' }]} onChange={setPeriod} />
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
                <thead><tr><th>#</th><th className="table__club">Player</th><th className="table__club">Club</th><th>Pos</th><th>Apps</th><th>Goals</th><th>MOTM</th><th>CS</th><th>Avg</th></tr></thead>
                <tbody>
                  {rows.map((p, i) => (
                    <tr key={p.id} className={p.clubId === state.club.id ? 'is-user' : ''}>
                      <td>{i + 1}</td>
                      <td className="table__club"><b>{p.name}</b></td>
                      <td className="table__club">{club(p.clubId) ? <ClubLink id={p.clubId} className="club-inline"><Crest colors={club(p.clubId).colors} short={club(p.clubId).short} id={p.clubId} size={16} /> <span>{club(p.clubId).short}</span></ClubLink> : '—'}</td>
                      <td>{p.pos}</td>
                      <td className={key === 'apps' ? 'is-key' : ''}>{p.apps}</td>
                      <td className={key === 'goals' ? 'is-key' : ''}>{p.goals}</td>
                      <td className={key === 'motm' ? 'is-key' : ''}>{p.motm}</td>
                      <td className={key === 'cs' ? 'is-key' : ''}>{p.cs}</td>
                      <td className={key === 'rating' ? 'is-key' : ''}>{p.rating.toFixed(2)}</td>
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
                      <td className="table__club"><b>{c.name}{c.isUser ? ' (you)' : ''}</b></td>
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
