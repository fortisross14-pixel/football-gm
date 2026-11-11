import React, { useMemo, useState } from 'react';
import { standings, topScorers, clubById, MATCHDAYS, PROMOTION_SPOTS } from '../engine/season.js';
import { DIVISIONS, DIVISION_BY_ID, CONTINENT_LABEL } from '../data/world/structure.js';
import { Crest } from './Art.jsx';
import { Segmented } from './Home.jsx';
import History from './History.jsx';
import CompStats from './CompStats.jsx';
import { ClubLink, PlayerLink, useSticky } from './nav.jsx';
import { yearLabel } from '../engine/years.js';

const COUNTRIES = [...new Map(DIVISIONS.map((d) => [d.code, d])).values()];

export default function League({ state, nav, onBack }) {
  const [divId, setDivId] = useSticky('league.div', nav?.divId || state.club.divisionId, nav?.k ?? null);
  const [tab, setTab] = useSticky('league.tab', nav?.tab || 'table', nav?.k ?? null);
  const [picking, setPicking] = useState(false);
  const div = DIVISION_BY_ID[divId];
  const tiers = DIVISIONS.filter((d) => d.code === div.code);
  const { season } = state;
  const md = Math.min(season.matchday + 1, MATCHDAYS);

  return (
    <div className="screen screen--league">
      <div className="league__controls">
      {onBack && <button type="button" className="link-btn league__back" onClick={onBack}>‹ Competitions</button>}
      <button type="button" className="div-picker" onClick={() => setPicking(!picking)} aria-expanded={picking}>
        <span className="div-picker__label">{div.country} · {CONTINENT_LABEL[div.continent]} · Level {div.level}</span>
        <b>{div.name}</b>
        <span className="div-picker__meta">{yearLabel(season.year)} · {season.done ? 'Finished' : `Matchday ${md}/${MATCHDAYS}`} {picking ? '▴' : '▾'}</span>
      </button>

      {picking && (
        <CountryPicker
          current={div}
          userDiv={state.club.divisionId}
          onPick={(id) => { setDivId(id); setPicking(false); }}
        />
      )}

      {tiers.length > 1 && (
        <Segmented
          small
          label="Division"
          value={divId}
          options={tiers.map((d) => ({ id: d.id, label: `${d.name}${d.id === state.club.divisionId ? ' ★' : ''}` }))}
          onChange={setDivId}
        />
      )}

      <Segmented
        small
        label="View"
        value={tab}
        options={[{ id: 'table', label: 'Table' }, { id: 'fixtures', label: 'Fixtures' }, { id: 'scorers', label: 'Stats' }, { id: 'history', label: 'History' }]}
        onChange={setTab}
      />
      </div>

      <div className="league__body">
      {tab === 'table' && <Table state={state} divId={divId} />}
      {tab === 'fixtures' && <Fixtures key={divId} state={state} divId={divId} />}
      {tab === 'scorers' && <CompStats state={state} comp={`L:${divId}`} />}
      {tab === 'history' && <History state={state} divId={divId} />}
      </div>
    </div>
  );
}

function CountryPicker({ current, userDiv, onPick }) {
  const groups = useMemo(() => Object.keys(CONTINENT_LABEL).map((c) => ({ c, countries: COUNTRIES.filter((d) => d.continent === c) })), []);
  return (
    <div className="country-picker">
      {groups.map(({ c, countries }) => (
        <div key={c}>
          <h4 className="sub-title">{CONTINENT_LABEL[c]}</h4>
          <div className="chip-row">
            {countries.map((d) => {
              const mine = DIVISION_BY_ID[userDiv].code === d.code;
              return (
                <button key={d.code} type="button" className={`chip-btn${current.code === d.code ? ' is-on' : ''}`} onClick={() => onPick(mine ? userDiv : d.id)}>
                  {d.country}{mine ? ' ★' : ''}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Table({ state, divId = state.club.divisionId, compact }) {
  const { season, world } = state;
  const rows = standings(season, divId);
  const visible = compact ? compactRows(rows, state.club.id) : rows;
  const div = DIVISION_BY_ID[divId];
  const hasUp = DIVISIONS.some((d) => d.code === div.code && d.tier === div.tier - 1);
  const hasDown = DIVISIONS.some((d) => d.code === div.code && d.tier === div.tier + 1);
  return (
    <table className={`table${compact ? ' table--compact' : ''}`}>
      <thead>
        <tr><th>#</th><th className="table__club">Club</th><th>P</th>{!compact && <><th>W</th><th>D</th><th>L</th></>}<th>GD</th><th>Pts</th>{!compact && <th className="table__form">Form</th>}</tr>
      </thead>
      <tbody>
        {visible.map((r) => {
          const club = clubById(world, r.id);
          const pos = rows.indexOf(r) + 1;
          const zone = pos <= PROMOTION_SPOTS && hasUp ? ' is-up' : pos > rows.length - PROMOTION_SPOTS && hasDown ? ' is-down' : '';
          return (
            <tr key={r.id} className={`${r.id === state.club.id ? 'is-user' : ''}${pos === 1 ? ' is-top' : ''}${zone}`}>
              <td>{pos}</td>
              <td className="table__club"><ClubLink id={r.id} className="club-inline"><Crest colors={club.colors} short={club.short} size={18} id={r.id} /> <span>{compact ? club.short : club.name}</span></ClubLink></td>
              <td>{r.p}</td>
              {!compact && <><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td></>}
              <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
              <td><b>{r.pts}</b></td>
              {!compact && <td className="table__form">{r.form.map((f, i) => <i key={i} className={`res-dot res-dot--${f}`} />)}</td>}
            </tr>
          );
        })}
      </tbody>
      {!compact && (hasUp || hasDown) && (
        <caption className="table__legend">
          {hasUp && <span className="is-up">▲ Promoted</span>}
          {hasDown && <span className="is-down">▼ Relegated</span>}
        </caption>
      )}
    </table>
  );
}

function compactRows(rows, userId) {
  const i = rows.findIndex((r) => r.id === userId);
  const start = Math.max(0, Math.min(rows.length - 4, i - 1));
  const set = new Set([0, ...rows.slice(start, start + 4).map((r) => rows.indexOf(r))]);
  return rows.filter((_, idx) => set.has(idx));
}

function Fixtures({ state, divId }) {
  const { season, world } = state;
  const fixtures = season.divisions[divId].fixtures;
  const [md, setMd] = useState(Math.min(season.matchday, fixtures.length - 1));
  return (
    <div className="fixtures">
      <div className="md-nav">
        <button type="button" className="icon-btn" disabled={md === 0} onClick={() => setMd(md - 1)} aria-label="Previous matchday">‹</button>
        <b>Matchday {md + 1}</b>
        <button type="button" className="icon-btn" disabled={md === fixtures.length - 1} onClick={() => setMd(md + 1)} aria-label="Next matchday">›</button>
      </div>
      {fixtures[md].map((g, i) => {
        const h = clubById(world, g.home);
        const a = clubById(world, g.away);
        const mine = g.home === state.club.id || g.away === state.club.id;
        return (
          <div key={i} className={`fixture${mine ? ' is-user' : ''}`}>
            <ClubLink id={g.home} className="fixture__team">{h.name}</ClubLink>
            <Crest colors={h.colors} short={h.short} size={20} id={g.home} />
            <b className="fixture__score">{g.score ? `${g.score[0]}–${g.score[1]}` : 'vs'}</b>
            <Crest colors={a.colors} short={a.short} size={20} id={g.away} />
            <ClubLink id={g.away} className="fixture__team is-right">{a.name}</ClubLink>
          </div>
        );
      })}
    </div>
  );
}

function Scorers({ state, divId }) {
  const list = topScorers(state.season, divId);
  if (!list.length) return <p className="hint">No goals yet.</p>;
  return (
    <ol className="scorer-list">
      {list.map((s, i) => {
        const club = clubById(state.world, s.clubId);
        return (
          <li key={s.id} className={s.clubId === state.club.id ? 'is-user' : ''}>
            <span className="scorer-list__pos">{i + 1}</span>
            <Crest colors={club.colors} short={club.short} size={20} id={s.clubId} />
            <span className="scorer-list__name"><PlayerLink id={s.id} name={s.name} /><em> · <ClubLink id={s.clubId}>{club.short}</ClubLink></em></span>
            <b>{s.goals}</b>
          </li>
        );
      })}
    </ol>
  );
}
