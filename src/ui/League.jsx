import React, { useState } from 'react';
import { standings, topScorers, clubById } from '../engine/season.js';
import { Crest } from './Art.jsx';
import { Segmented } from './Home.jsx';

export default function League({ state }) {
  const [tab, setTab] = useState('table');
  const { season } = state;
  return (
    <div className="screen">
      <div className="league-head">
        <h2 className="section-title">{state.club.division}</h2>
        <span className="hint">Season {season.year} · Matchday {Math.min(season.matchday + 1, 14)}/14</span>
      </div>
      <Segmented
        small
        label="League"
        value={tab}
        options={[{ id: 'table', label: 'Table' }, { id: 'fixtures', label: 'Fixtures' }, { id: 'scorers', label: 'Scorers' }]}
        onChange={setTab}
      />
      {tab === 'table' && <Table state={state} />}
      {tab === 'fixtures' && <Fixtures state={state} />}
      {tab === 'scorers' && (
        <ol className="scorer-list">
          {topScorers(season).length === 0 && <p className="hint">No goals yet.</p>}
          {topScorers(season).map((s, i) => {
            const club = clubById(season, s.clubId);
            return (
              <li key={s.id} className={club.isUser ? 'is-user' : ''}>
                <span className="scorer-list__pos">{i + 1}</span>
                <Crest colors={club.colors} short={club.short} size={20} />
                <span className="scorer-list__name">{s.name}</span>
                <b>{s.goals}</b>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function Table({ state, compact }) {
  const { season } = state;
  const rows = standings(season);
  const visible = compact ? compactRows(rows, state.club.id) : rows;
  return (
    <table className={`table${compact ? ' table--compact' : ''}`}>
      <thead>
        <tr><th>#</th><th className="table__club">Club</th><th>P</th>{!compact && <><th>W</th><th>D</th><th>L</th></>}<th>GD</th><th>Pts</th>{!compact && <th className="table__form">Form</th>}</tr>
      </thead>
      <tbody>
        {visible.map((r) => {
          const club = clubById(season, r.id);
          const pos = rows.indexOf(r) + 1;
          return (
            <tr key={r.id} className={`${club.isUser ? 'is-user' : ''}${pos === 1 ? ' is-top' : ''}`}>
              <td>{pos}</td>
              <td className="table__club"><Crest colors={club.colors} short={club.short} size={18} /> <span>{compact ? club.short : club.name}</span></td>
              <td>{r.p}</td>
              {!compact && <><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td></>}
              <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
              <td><b>{r.pts}</b></td>
              {!compact && <td className="table__form">{r.form.map((f, i) => <i key={i} className={`res-dot res-dot--${f}`} />)}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function compactRows(rows, userId) {
  const i = rows.findIndex((r) => r.id === userId);
  const start = Math.max(0, Math.min(rows.length - 4, i - 1));
  const set = new Set([0, ...rows.slice(start, start + 4).map((r) => rows.indexOf(r))]);
  return rows.filter((_, idx) => set.has(idx));
}

function Fixtures({ state }) {
  const { season } = state;
  const [md, setMd] = useState(Math.min(season.matchday, season.fixtures.length - 1));
  const games = season.fixtures[md];
  return (
    <div className="fixtures">
      <div className="md-nav">
        <button type="button" className="icon-btn" disabled={md === 0} onClick={() => setMd(md - 1)} aria-label="Previous matchday">‹</button>
        <b>Matchday {md + 1}</b>
        <button type="button" className="icon-btn" disabled={md === season.fixtures.length - 1} onClick={() => setMd(md + 1)} aria-label="Next matchday">›</button>
      </div>
      {games.map((g, i) => {
        const h = clubById(season, g.home);
        const a = clubById(season, g.away);
        return (
          <div key={i} className={`fixture${h.isUser || a.isUser ? ' is-user' : ''}`}>
            <span className="fixture__team">{h.name}</span>
            <Crest colors={h.colors} short={h.short} size={20} />
            <b className="fixture__score">{g.score ? `${g.score[0]}–${g.score[1]}` : 'vs'}</b>
            <Crest colors={a.colors} short={a.short} size={20} />
            <span className="fixture__team is-right">{a.name}</span>
          </div>
        );
      })}
    </div>
  );
}
