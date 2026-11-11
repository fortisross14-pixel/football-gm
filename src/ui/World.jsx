import React, { useMemo, useState } from 'react';
import { gmRanking } from '../engine/gms.js';
import { playerLeaders } from '../engine/history.js';
import { titleRanking } from '../engine/titles.js';
import { DIVISION_BY_ID, TOP_CLUBS } from '../data/world/structure.js';
import { POOL_BY_ID } from '../state/club.js';
import { Segmented } from './Home.jsx';
import { Crest } from './Art.jsx';
import { ClubLink, LeagueLink, PlayerLink, ManagerLink, useSticky } from './nav.jsx';
import { Records } from './History.jsx';
import { HallOfFame } from './Collection.jsx';
import Stats from './Stats.jsx';
import Awards from './Awards.jsx';
import { yearLabel, FIRST_YEAR } from '../engine/years.js';

const nameOf = (id) => POOL_BY_ID[id]?.name;

// The wider world: managers' rankings, the strongest clubs, all-time records and legends.
export default function World({ state }) {
  const [view, setView] = useSticky('world.view', 'stats');
  return (
    <div className="screen">
      <Segmented
        small
        label="World"
        value={view}
        options={[{ id: 'stats', label: 'Stats' }, { id: 'awards', label: 'Awards' }, { id: 'gms', label: 'Managers' }, { id: 'clubs', label: 'Clubs' }, { id: 'hof', label: 'Hall of Fame' }]}
        onChange={setView}
      />
      {view === 'gms' && <Managers state={state} />}
      {view === 'clubs' && <Clubs state={state} />}
      {view === 'stats' && <Stats state={state} memoKey="world" />}
      {view === 'awards' && <Awards state={state} />}
      {view === 'records' && (state.archive?.length
        ? <Records state={state} archive={state.archive} divId={state.club.divisionId} initialScope="world" />
        : <p className="hint">Season-by-season records (titles, best seasons) start after your first season. For live numbers, open Stats.</p>)}
      {view === 'hof' && <Legends state={state} />}
    </div>
  );
}

function Managers({ state }) {
  const [scope, setScope] = useState('all');
  const log = state.careerLog || [];
  const you = {
    name: `${state.gmName || 'You'} (you)`, rep: state.gm?.reputation ?? 0, clubId: state.club.id, isUser: true,
    titles: log.filter((s) => s.position === 1).length, cups: log.reduce((n, s) => n + s.trophies.length, 0) - log.filter((s) => s.position === 1).length,
    intl: 0, seasons: log.length, level: state.club.level,
  };
  const all = useMemo(() => gmRanking(state.world, you), [state.world, state.gm, log.length]);
  const list = scope === 'all' ? all : all.filter((g) => g.level === Number(scope));
  const yourRank = all.findIndex((g) => g.isUser) + 1;
  const shown = list.slice(0, 30);
  const former = (state.world.formerGms || []).filter((g) => g.titles > 0).slice(0, 10);
  return (
    <>
      <div className="stat-tiles">
        <div><span>Your rank</span><b>#{yourRank}</b><small>of {all.length} managers</small></div>
        <div><span>Reputation</span><b>{you.rep}</b><small>out of 100</small></div>
        <div><span>League titles</span><b>{you.titles}</b><small>{you.seasons} seasons</small></div>
      </div>
      <Segmented small label="Level" value={scope} options={[{ id: 'all', label: 'All' }, { id: '1', label: 'Level 1' }, { id: '2', label: 'Level 2' }, { id: '3', label: 'Level 3' }]} onChange={setScope} />
      <div className="scroll-x">
        <table className="table table--history">
          <thead><tr><th>#</th><th className="table__club">Manager</th><th className="table__club">Club</th><th>Rep</th><th title="League titles">🏆</th><th title="Cups and continental">🥇</th><th>Seasons</th></tr></thead>
          <tbody>
            {shown.map((g) => {
              const club = state.world.clubs[g.clubId];
              return (
                <tr key={`${g.clubId}-${g.name}`} className={g.isUser ? 'is-user' : ''}>
                  <td>{all.indexOf(g) + 1}</td>
                  <td className="table__club"><b><ManagerLink mkey={g.isUser ? 'you' : `${g.clubId}|${g.name}`}>{g.name}</ManagerLink></b></td>
                  <td className="table__club"><ClubLink id={g.clubId} className="club-inline"><Crest colors={club.colors} short={club.short} size={16} id={g.clubId} /> <span>{club.short}</span></ClubLink></td>
                  <td><b>{g.rep}</b></td>
                  <td>{g.titles}</td>
                  <td>{(g.cups || 0) + (g.intl || 0)}</td>
                  <td>{g.seasons}</td>
                </tr>
              );
            })}
            {!shown.some((g) => g.isUser) && (
              <tr className="is-user"><td>{yourRank}</td><td className="table__club"><b><ManagerLink mkey="you">{you.name}</ManagerLink></b></td><td className="table__club">{state.club.short}</td><td><b>{you.rep}</b></td><td>{you.titles}</td><td>{you.cups}</td><td>{you.seasons}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="hint">Managers gain reputation by finishing above what their squad should achieve and by winning trophies. Badly missing expectations gets them sacked.</p>
      {former.length > 0 && (
        <section>
          <h3 className="sub-title">Former managers with titles</h3>
          <ul className="champions">
            {former.map((g, i) => <li key={i}><span><ManagerLink mkey={`${g.clubId}|${g.name}`}>{g.name}</ManagerLink> · {state.world.clubs[g.clubId]?.short} until {yearLabel(g.until)}</span><b>{g.titles} 🏆</b></li>)}
          </ul>
        </section>
      )}
    </>
  );
}

const TITLE_FILTERS = [{ id: 'all', label: 'All' }, { id: 'league', label: 'League' }, { id: 'cup', label: 'Cup' }, { id: 'continental', label: 'Continental' }];

function Clubs({ state }) {
  const [filter, setFilter] = useSticky('world.titles', 'all');
  const power = useMemo(() => Object.values(state.world.clubs).sort((a, b) => b.strength - a.strength).slice(0, 25), [state.world]);
  const titles = useMemo(() => titleRanking(state.archive || [], filter, new Set(Object.keys(state.world.clubs))).slice(0, 30), [state.archive, filter, state.world]);
  const you = state.club.id;
  return (
    <>
      <section>
        <h3 className="sub-title">Most decorated</h3>
        <Segmented small label="Titles" value={filter} options={TITLE_FILTERS} onChange={setFilter} />
        <div className="scroll-x">
          <table className="table table--history table--narrow">
            <thead><tr><th>#</th><th className="table__club">Club</th><th title="Titles">Total</th><th title="League titles">🏆</th><th title="Domestic cups">🥇</th><th title="Continental cups">🌍</th><th title="Club World Cups">🌐</th></tr></thead>
            <tbody>
              {titles.map((r, i) => {
                const c = state.world.clubs[r.id];
                return (
                  <tr key={r.id} className={r.id === you ? 'is-user' : ''}>
                    <td>{i + 1}</td>
                    <td className="table__club"><ClubLink id={r.id} className="club-inline"><Crest colors={c.colors} short={c.short} size={16} id={r.id} /> <span>{c.name}</span></ClubLink></td>
                    <td><b>{r.total}</b></td><td>{r.league}</td><td>{r.cup}</td><td>{r.continental}</td><td>{r.world}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="hint">Real-life titles up to 2026 plus every title won in the game since {FIRST_YEAR}. All counts super cups too; Continental adds the Club World Cup. Only the top flight counts as a league title.</p>
      </section>
      <section>
        <h3 className="sub-title">Power ranking</h3>
        <ol className="scorer-list">
          {power.map((c, i) => (
            <li key={c.id} className={c.id === you ? 'is-user' : ''}>
              <span className="scorer-list__pos">{i + 1}</span>
              <Crest colors={c.colors} short={c.short} size={20} id={c.id} />
              <span className="scorer-list__name"><ClubLink id={c.id}>{c.name}</ClubLink><em> · <LeagueLink divId={c.divisionId}>{DIVISION_BY_ID[c.divisionId].name}</LeagueLink>{TOP_CLUBS.includes(c.id) ? ' · giant' : ''}</em></span>
              <b>{Math.round(c.strength)}</b>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function Legends({ state }) {
  const greats = useMemo(() => playerLeaders(state.records, 'goals', nameOf, 15), [state.records]);
  return (
    <>
      <section>
        <h3 className="sub-title">Your Hall of Fame</h3>
        <HallOfFame state={state} />
      </section>
      {greats.length > 0 && (
        <section>
          <h3 className="sub-title">World legends · league goals</h3>
          <ol className="scorer-list">
            {greats.map((p, i) => (
              <li key={p.id}>
                <span className="scorer-list__pos">{i + 1}</span>
                <span className="scorer-list__name"><PlayerLink id={p.id} name={p.name} /><em> · {Object.keys(p.clubs).map((id) => state.world.clubs[id]?.short).filter(Boolean).join(', ')}{p.mvp ? ` · ${p.mvp}× MVP` : ''}{p.boots ? ` · ${p.boots}× Golden Boot` : ''}</em></span>
                <b>{p.goals}</b>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
