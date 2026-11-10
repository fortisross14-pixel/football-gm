import React, { useMemo, useState } from 'react';
import {
  awardRow, gloveRow, titleTable, playerLeaders, bestSeasons, leagueLeaders, scorerRow,
} from '../engine/history.js';
import { DIVISIONS, DIVISION_BY_ID } from '../data/world/structure.js';
import { CUP_NAME_FOR, CONTINENTAL_NAME } from './names.js';
import { POOL_BY_ID, seasonLeaders } from '../state/club.js';
import { Segmented } from './Home.jsx';
import Stats from './Stats.jsx';
import { Crest } from './Art.jsx';
import { ClubLink, LeagueLink, PlayerLink, useSticky } from './nav.jsx';

const nameOf = (id) => POOL_BY_ID[id]?.name;

// The history book: by season, all-time records, and your own career.
export default function History({ state, divId }) {
  const [view, setView] = useSticky('history.view', 'seasons');
  const archive = state.archive || [];
  return (
    <div className="history">
      <Segmented
        small
        label="History"
        value={view}
        options={[{ id: 'seasons', label: 'By season' }, { id: 'career', label: 'My career' }, { id: 'summer', label: 'Last summer' }]}
        onChange={setView}
      />
      {view === 'seasons' && <Seasons state={state} archive={archive} divId={divId} />}
      {view === 'stats' && <Stats state={state} initialScope={`L:${divId}`} key={divId} memoKey={`league.${divId}`} />}
      {view === 'records' && <Records state={state} archive={archive} divId={divId} />}
      {view === 'career' && <MyCareer state={state} />}
      {view === 'summer' && <LastSummer state={state} />}
    </div>
  );
}

function Empty() {
  return <p className="hint">The history book fills up as seasons end: champions, runners-up, top scorers, MVPs and Golden Gloves for every league and cup.</p>;
}

function ClubName({ state, id, short }) {
  const c = state.world.clubs[id];
  if (!c) return <span>—</span>;
  return (
    <ClubLink id={id} className="club-inline">
      <Crest colors={c.colors} short={c.short} size={16} id={id} /> <span>{short ? c.short : c.name}</span>
    </ClubLink>
  );
}

function Seasons({ state, archive, divId }) {
  const div = DIVISION_BY_ID[divId];
  if (!archive.length) return <Empty />;
  return (
    <div className="season-book">
      <p className="hint">{div.name}, newest first. Tap a club to see its page.</p>
      {[...archive].reverse().map((e) => {
        const lg = e.leagues[divId];
        if (!lg) return null;
        const top = awardRow(lg.top, nameOf);
        const mvp = awardRow(lg.mvp, nameOf);
        const glove = gloveRow(lg.glove, nameOf);
        const cup = div.tier === 1 ? e.cups[div.code] : null;
        const cont = div.tier === 1 && div.level === 1 ? e.continental[div.continent] : null;
        return (
          <article key={e.year} className="season-card">
            <header><b>Season {e.year}</b>{e.cwc?.winner && <span className="muted">Club World Cup: {state.world.clubs[e.cwc.winner]?.name}</span>}</header>
            <dl>
              <dt>🏆 Champion</dt><dd><ClubName state={state} id={lg.table[0][0]} /> <small>{lg.table[0][1]} pts</small></dd>
              <dt>Runner-up</dt><dd><ClubName state={state} id={lg.table[1]?.[0]} /> <small>{lg.table[1]?.[1]} pts</small></dd>
              <dt>Relegated</dt><dd>{DIVISIONS.some((d) => d.code === div.code && d.tier === div.tier + 1) ? <ClubName state={state} id={lg.table.at(-1)[0]} /> : <span className="muted">—</span>}</dd>
              <dt>⚽ Top scorer</dt><dd>{top ? <><PlayerLink id={top.id} name={top.name} /> <small>{state.world.clubs[top.clubId]?.short} · {top.goals}</small></> : '—'}</dd>
              <dt>⭐ MVP</dt><dd>{mvp ? <><PlayerLink id={mvp.id} name={mvp.name} /> <small>{state.world.clubs[mvp.clubId]?.short}</small></> : '—'}</dd>
              <dt>🧤 Golden Glove</dt><dd>{glove ? <>{glove.name ? <PlayerLink id={glove.id} name={glove.name} /> : `${state.world.clubs[glove.clubId]?.short} keeper`} <small>{glove.ga} conceded · {glove.cs} clean sheets</small></> : '—'}</dd>
              {cup && <><dt>🥇 {CUP_NAME_FOR(div.code)}</dt><dd><ClubName state={state} id={cup.winner} />{cup.runnerUp && <small> beat {state.world.clubs[cup.runnerUp]?.short}</small>}</dd></>}
              {cont?.winner && <><dt>🌍 {CONTINENTAL_NAME[div.continent]}</dt><dd><ClubName state={state} id={cont.winner} />{cont.runnerUp && <small> beat {state.world.clubs[cont.runnerUp]?.short}</small>}</dd></>}
            </dl>
          </article>
        );
      })}
    </div>
  );
}

const PLAYER_BOARDS = [
  { key: 'goals', label: 'Most league goals', unit: '' },
  { key: 'mvp', label: 'Most MVP awards', unit: '×' },
  { key: 'boots', label: 'Most Golden Boots', unit: '×' },
  { key: 'gloves', label: 'Most Golden Gloves', unit: '×' },
];

export function Records({ state, archive, divId, initialScope = 'league' }) {
  const div = DIVISION_BY_ID[divId];
  const [scope, setScope] = useState(initialScope);
  const [board, setBoard] = useState('goals');
  const divIds = scope === 'league' ? [divId] : scope === 'country' ? DIVISIONS.filter((d) => d.code === div.code).map((d) => d.id) : null;
  const titles = useMemo(() => titleTable(archive, divIds).slice(0, 10), [archive, scope, divId]);
  const players = useMemo(() => {
    const list = divIds ? leagueLeaders(archive, divIds, nameOf) : playerLeaders(state.records, board, nameOf, 200);
    return list.filter((p) => p[board] > 0).sort((a, b) => b[board] - a[board] || b.goals - a.goals).slice(0, 15);
  }, [archive, state.records, scope, divId, board]);
  const best = useMemo(() => bestSeasons(archive, divIds, 8), [archive, scope, divId]);
  if (!archive.length) return <Empty />;
  const b = PLAYER_BOARDS.find((x) => x.key === board);
  return (
    <div className="records">
      <Segmented
        small
        label="Scope"
        value={scope}
        options={[{ id: 'league', label: div.name }, { id: 'country', label: div.country }, { id: 'world', label: 'World' }]}
        onChange={setScope}
      />
      <section>
        <h3 className="sub-title">Most decorated clubs</h3>
        <div className="scroll-x">
          <table className="table table--history">
            <thead><tr><th>#</th><th className="table__club">Club</th><th title="League titles">🏆</th><th title="Runner-up">2nd</th>{!divIds && <><th title="Cups">🥇</th><th title="Continental">🌍</th><th title="Club World Cup">🌐</th></>}</tr></thead>
            <tbody>
              {titles.map((r, i) => (
                <tr key={r.id} className={r.id === state.club.id ? 'is-user' : ''}>
                  <td>{i + 1}</td>
                  <td className="table__club"><ClubName state={state} id={r.id} /></td>
                  <td><b>{r.league}</b></td><td>{r.runnerUp}</td>
                  {!divIds && <><td>{r.cup}</td><td>{r.continental}</td><td>{r.cwc}</td></>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="sub-title">Players</h3>
        <div className="chip-row">
          {PLAYER_BOARDS.map((x) => <button key={x.key} type="button" className={`chip-btn${board === x.key ? ' is-on' : ''}`} onClick={() => setBoard(x.key)}>{x.label}</button>)}
        </div>
        {players.length ? (
          <ol className="scorer-list">
            {players.map((p, i) => (
              <li key={p.id}>
                <span className="scorer-list__pos">{i + 1}</span>
                <span className="scorer-list__name"><PlayerLink id={p.id} name={p.name} /><em> · {state.world.clubs[p.last]?.short || ''}{board !== 'goals' ? ` · ${p.goals} goals` : ''}</em></span>
                <b>{p[board]}{b.unit}</b>
              </li>
            ))}
          </ol>
        ) : <p className="hint">Nobody yet.</p>}
        {divIds && board === 'goals' && <p className="hint">League scope counts each season's top 8 scorers.</p>}
      </section>
      <section>
        <h3 className="sub-title">Best scoring seasons</h3>
        <ol className="scorer-list">
          {best.map((s, i) => (
            <li key={`${s.id}-${s.year}`}>
              <span className="scorer-list__pos">{i + 1}</span>
              <span className="scorer-list__name"><PlayerLink id={s.id} name={s.name || nameOf(s.id) || '?'} /><em> · {state.world.clubs[s.clubId]?.short} · S{s.year}{divIds ? '' : ` · ${DIVISION_BY_ID[s.divId].name}`}</em></span>
              <b>{s.goals}</b>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

const STAT_BOARDS = [
  { key: 'goals', label: 'Goals' }, { key: 'assists', label: 'Assists' }, { key: 'apps', label: 'Apps' },
  { key: 'motm', label: 'MOTM' }, { key: 'cs', label: 'Clean sheets' }, { key: 'avg', label: 'Avg rating' },
];

export function MyCareer({ state }) {
  const [period, setPeriod] = useState('all');
  const [stat, setStat] = useState('goals');
  const log = state.careerLog || [];
  const book = period === 'all' ? state.playerStats : (state.seasonStats || {});
  const rows = Object.entries(book || {})
    .map(([id, s]) => ({ id, ...s, name: s.name || nameOf(id) || state.squad.find((c) => c.id === id)?.name || '?', avg: s.apps ? s.ratingSum / s.apps : 0 }))
    .filter((r) => (stat === 'avg' ? r.apps >= 5 : (r[stat] || 0) > 0))
    .sort((a, b) => (b[stat] || 0) - (a[stat] || 0) || b.apps - a.apps)
    .slice(0, 15);
  const now = seasonLeaders(state.seasonStats || {});
  const totals = log.reduce((t, s) => ({ w: t.w + s.record.w, d: t.d + s.record.d, l: t.l + s.record.l, tr: t.tr + s.trophies.length }), { w: 0, d: 0, l: 0, tr: 0 });
  return (
    <div className="my-career">
      <div className="stat-tiles">
        <div><span>Seasons</span><b>{log.length}</b><small>as {state.gmName || 'GM'}</small></div>
        <div><span>League record</span><b>{totals.w}-{totals.d}-{totals.l}</b><small>W-D-L</small></div>
        <div><span>Trophies</span><b>{totals.tr}</b><small>all competitions</small></div>
      </div>
      <section>
        <h3 className="sub-title">This season so far</h3>
        <ul className="champions">
          <li><span>Top scorer</span><b>{now.goals ? `${now.goals.name} · ${now.goals.value}` : '—'}</b></li>
          <li><span>Most assists</span><b>{now.assists ? `${now.assists.name} · ${now.assists.value}` : '—'}</b></li>
          <li><span>Most MOTM</span><b>{now.motm ? `${now.motm.name} · ${now.motm.value}` : '—'}</b></li>
          <li><span>Clean sheets</span><b>{now.cs ? `${now.cs.name} · ${now.cs.value}` : '—'}</b></li>
          <li><span>Best average (5+ apps)</span><b>{now.rating ? `${now.rating.name} · ${now.rating.value.toFixed(2)}` : '—'}</b></li>
        </ul>
      </section>
      <section>
        <h3 className="sub-title">Player stats</h3>
        <Segmented small label="Period" value={period} options={[{ id: 'all', label: 'All-time' }, { id: 'season', label: 'This season' }]} onChange={setPeriod} />
        <div className="chip-row">
          {STAT_BOARDS.map((x) => <button key={x.key} type="button" className={`chip-btn${stat === x.key ? ' is-on' : ''}`} onClick={() => setStat(x.key)}>{x.label}</button>)}
        </div>
        {rows.length ? (
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>#</th><th className="table__club">Player</th><th>Pos</th><th>Apps</th><th>G</th><th>A</th><th>MOTM</th><th>CS</th><th>Avg</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={state.squad.some((c) => c.id === r.id) ? 'is-user' : ''}>
                    <td>{i + 1}</td>
                    <td className={`table__club r-${r.rarity || 'common'}`}><span className="dot-r" /> <PlayerLink id={r.id} name={r.name} /></td>
                    <td>{r.pos || ''}</td><td>{r.apps}</td><td>{r.goals}</td><td>{r.assists}</td><td>{r.motm}</td><td>{r.cs || 0}</td><td>{r.avg.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">No stats yet.</p>}
      </section>
      {log.length > 0 && (
        <section>
          <h3 className="sub-title">Season by season</h3>
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>Season</th><th className="table__club">Club</th><th className="table__club">League</th><th>Pos</th><th>W-D-L</th><th>GF-GA</th><th className="table__club">Top scorer</th><th className="table__club">Trophies</th></tr></thead>
              <tbody>
                {[...log].reverse().map((s) => (
                  <tr key={s.year} className={s.position === 1 ? 'is-top' : ''}>
                    <td>{s.year}</td>
                    <td className="table__club"><ClubName state={state} id={s.clubId} short /></td>
                    <td className="table__club"><LeagueLink divId={s.divId}>{DIVISION_BY_ID[s.divId].name}</LeagueLink></td>
                    <td><b>{s.position}</b></td>
                    <td>{s.record.w}-{s.record.d}-{s.record.l}</td>
                    <td>{s.record.gf}-{s.record.ga}</td>
                    <td className="table__club">{s.leaders?.goals ? `${s.leaders.goals.name} (${s.leaders.goals.value})` : '—'}</td>
                    <td className="table__club">{s.trophies.length ? s.trophies.join(', ') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// What changed last summer: promotions, relegations and big signings.
function LastSummer({ state }) {
  const last = state.lastSeason;
  if (!last) return <p className="hint">Promotions, relegations and big signings from around the world appear here after your first season.</p>;
  return (
    <div className="last-season">
      {last.news?.length > 0 && (
        <>
          <h3 className="sub-title">Big moves</h3>
          <ul className="news">
            {last.news.slice(0, 16).map((n) => (
              <li key={`${n.clubId}-${n.cardId}`} className={`r-${n.rarity}`}>
                <b><PlayerLink id={n.cardId} name={n.name} /></b>
                <span>{n.type === 'academy' ? 'comes through the academy at' : 'signs for'} <ClubLink id={n.clubId}>{n.club}</ClubLink></span>
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
              <span className="is-up">▲ <ClubLink id={m.clubId}>{m.name}</ClubLink></span>
              <span className="is-down">▼ <ClubLink id={down?.clubId}>{down?.name}</ClubLink></span>
              <small><LeagueLink divId={m.to}>{m.toName}</LeagueLink></small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { scorerRow };
