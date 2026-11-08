import React, { useMemo, useState } from 'react';
import { standings, topScorers, clubById, MATCHDAYS } from '../engine/season.js';
import { DIVISIONS, DIVISION_BY_ID, CONTINENT_LABEL } from '../data/world/structure.js';
import { Crest } from './Art.jsx';
import { Segmented } from './Home.jsx';
import Cups from './Cups.jsx';

const COUNTRIES = [...new Map(DIVISIONS.map((d) => [d.code, d])).values()];

export default function League({ state }) {
  const [divId, setDivId] = useState(state.club.divisionId);
  const [tab, setTab] = useState('table');
  const [picking, setPicking] = useState(false);
  const div = DIVISION_BY_ID[divId];
  const tiers = DIVISIONS.filter((d) => d.code === div.code);
  const { season } = state;
  const md = Math.min(season.matchday + 1, MATCHDAYS);

  return (
    <div className="screen">
      <button type="button" className="div-picker" onClick={() => setPicking(!picking)} aria-expanded={picking}>
        <span className="div-picker__label">{CONTINENT_LABEL[div.continent]} · Level {div.level}</span>
        <b>{div.name}</b>
        <span className="div-picker__meta">Season {season.year} · {season.done ? 'Finished' : `Matchday ${md}/${MATCHDAYS}`} {picking ? '▴' : '▾'}</span>
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
          options={tiers.map((d) => ({ id: d.id, label: `Div ${d.tier}${d.id === state.club.divisionId ? ' ★' : ''}` }))}
          onChange={setDivId}
        />
      )}

      <Segmented
        small
        label="View"
        value={tab}
        options={[{ id: 'table', label: 'Table' }, { id: 'fixtures', label: 'Fixtures' }, { id: 'scorers', label: 'Scorers' }, { id: 'cups', label: 'Cups' }, { id: 'world', label: 'Past' }]}
        onChange={setTab}
      />

      {tab === 'table' && <Table state={state} divId={divId} />}
      {tab === 'fixtures' && <Fixtures key={divId} state={state} divId={divId} />}
      {tab === 'scorers' && <Scorers state={state} divId={divId} />}
      {tab === 'cups' && <Cups state={state} countryCode={div.code} />}
      {tab === 'world' && <LastSeason state={state} />}
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
          const zone = pos === 1 && hasUp ? ' is-up' : pos === rows.length && hasDown ? ' is-down' : '';
          return (
            <tr key={r.id} className={`${r.id === state.club.id ? 'is-user' : ''}${pos === 1 ? ' is-top' : ''}${zone}`}>
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
            <Crest colors={club.colors} short={club.short} size={20} />
            <span className="scorer-list__name">{s.name}<em> · {club.short}</em></span>
            <b>{s.goals}</b>
          </li>
        );
      })}
    </ol>
  );
}

function LastSeason({ state }) {
  const last = state.lastSeason;
  if (!last) return <p className="hint">Champions, promotions and relegations from around the world appear here after your first season.</p>;
  return (
    <div className="last-season">
      {last.userTrophies?.length > 0 && <p className="promo is-up">🏆 Your trophies: {last.userTrophies.join(', ')}</p>}
      <h3 className="sub-title">Season {last.year} cups</h3>
      <ul className="champions">
        {['europe', 'americas', 'afap'].map((k) => last.continental?.[k] && (
          <li key={k}><span>{{ europe: 'European Cup', americas: 'Americas Cup', afap: 'Africa–APAC Cup' }[k]}</span><b>{last.continental[k]}</b></li>
        ))}
        {last.cwc && <li><span>Club World Cup</span><b>{last.cwc}</b></li>}
        {Object.entries(last.cups || {}).filter(([, w]) => w).map(([code, w]) => (
          <li key={code}><span>{DIVISIONS.find((d) => d.code === code)?.country} Cup</span><b>{w}</b></li>
        ))}
      </ul>
      <h3 className="sub-title">Season {last.year} champions</h3>
      <ul className="champions">
        {DIVISIONS.filter((d) => last.champions[d.id]).map((d) => (
          <li key={d.id}><span>{d.name}</span><b>{last.champions[d.id]}</b></li>
        ))}
      </ul>
      {last.news?.length > 0 && (
        <>
          <h3 className="sub-title">Big moves</h3>
          <ul className="news">
            {last.news.slice(0, 12).map((n) => (
              <li key={`${n.clubId}-${n.cardId}`} className={`r-${n.rarity}`}>
                <b>{n.name}</b>
                <span>{n.type === 'academy' ? 'comes through the academy at' : 'signs for'} {n.club}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <h3 className="sub-title">Promoted and relegated</h3>
      <ul className="moves">
        {last.moves.filter((m) => m.type === 'promoted').map((m) => {
          const down = last.moves.find((x) => x.type === 'relegated' && x.from === m.to);
          return (
            <li key={m.clubId}>
              <span className="is-up">▲ {m.name}</span>
              <span className="is-down">▼ {down?.name}</span>
              <small>{m.toName}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
