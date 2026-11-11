import React, { useMemo, useState } from 'react';
import { aiTeamFor, standings, topScorers } from '../engine/season.js';
import { clubHistory, recordRow } from '../engine/history.js';
import { clubManagers, clubMoves, clubRecord, clubPlayersAllTime, MOVE_LABEL } from '../engine/careers.js';
import { emptyBook } from '../engine/statsbook.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { PHILOSOPHIES, clubIdentity } from '../data/philosophies.js';
import { overall } from '../engine/cards.js';
import { attrs, ATTR_KEYS, ATTR_LABEL } from '../engine/attributes.js';
import { skillOf } from '../data/skills.js';
import { POOL_BY_ID } from '../state/club.js';
import { Crest } from './Art.jsx';
import { Flag } from './Card.jsx';
import { clubVars } from './clubTheme.js';
import { LeagueLink, ClubLink, PlayerLink, ManagerLink } from './nav.jsx';
import { Segmented } from './Home.jsx';
import { rivalsOf, derbyName } from '../data/rivals.js';
import { compName, compOrder, TROPHY_ICON } from './names.js';
import { yearLabel, seasonYear, FIRST_YEAR } from '../engine/years.js';
import { clubTitles, entryWinners, competitionName, yearsText, honoursSummary } from '../engine/titles.js';

const nameOf = (id) => POOL_BY_ID[id]?.name;
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const pct = (w, p) => (p ? `${Math.round((w / p) * 100)}%` : '—');
const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'squad', label: 'Squad' }, { id: 'history', label: 'History' }, { id: 'stats', label: 'Stats' }, { id: 'honours', label: 'Honours' }];

// Any club's page: Overview, Squad, History, Stats and Honours.
export default function Team({ state, clubId, onBack, onCurse, tab: tabProp, onTab }) {
  const [tabLocal, setTabLocal] = useState('overview');
  const tab = tabProp || tabLocal;
  const setTab = onTab || setTabLocal;
  const club = state.world.clubs[clubId];
  const isUser = clubId === state.club.id;
  const div = DIVISION_BY_ID[club.divisionId];
  const hist = useMemo(() => clubHistory(state.archive || [], clubId), [state.archive, clubId]);

  const squad = useMemo(() => {
    if (isUser) {
      const lineup = state.lineup.map((id) => state.squad.find((c) => c.id === id));
      const bench = state.squad.filter((c) => !state.lineup.includes(c.id));
      return { lineup, bench, formation: state.coaches.coach.formation };
    }
    const t = aiTeamFor(state.world, clubId, POOL_BY_ID, 1);
    const by = Object.fromEntries(t.players.map((p) => [p.id, p]));
    return { lineup: t.lineup.map((id) => by[id]), bench: t.bench.map((id) => by[id]), formation: t.formation };
  }, [state, clubId, isUser]);

  return (
    <div className="screen team-page">
      <div className="club-head" style={clubVars(club)}>
        <Crest colors={club.colors} short={club.short} size={56} id={clubId} />
        <div>
          <b>{club.name}</b>
          <span><LeagueLink divId={club.divisionId}>{div.name}</LeagueLink> · {div.country} · Level {div.level}</span>
        </div>
        <i className="club-stripes" aria-hidden="true" />
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>
      <Segmented small label="Club" value={tab} options={TABS} onChange={setTab} />
      {tab === 'overview' && <Overview state={state} club={club} isUser={isUser} squad={squad} hist={hist} onCurse={onCurse} />}
      {tab === 'squad' && <Squad state={state} club={club} isUser={isUser} squad={squad} />}
      {tab === 'history' && <History state={state} club={club} hist={hist} />}
      {tab === 'stats' && <ClubStats state={state} club={club} />}
      {tab === 'honours' && <Honours state={state} club={club} />}
    </div>
  );
}

// "11 league titles, the last in 2017 · 2 European Cups" (real life + in-game).
function historyLineOf(sum) {
  const parts = [];
  const { league, cup, continental } = sum;
  if (league.n) parts.push(`${league.n} league title${league.n > 1 ? 's' : ''}, the last in ${league.last}`);
  if (continental.n) parts.push(`${continental.n} ${continental.name}${continental.n > 1 ? ' titles' : ''}`);
  if (cup.n) parts.push(`${cup.n} ${cup.name}${cup.n > 1 ? 's' : ''}${league.n ? '' : `, the last in ${cup.last}`}`);
  return parts.length ? parts.join(' · ') : 'No major honours yet.';
}

function Overview({ state, club, isUser, squad, hist, onCurse }) {
  const clubId = club.id;
  const div = DIVISION_BY_ID[club.divisionId];
  const table = standings(state.season, club.divisionId);
  const pos = table.findIndex((r) => r.id === clubId) + 1;
  const row = table[pos - 1];
  const scorersNow = topScorers(state.season, club.divisionId, 60).filter((s) => s.clubId === clubId).slice(0, 3);
  const vs = (state.history || []).filter((h) => h.opponent === club.name);
  const vsRec = { W: 0, D: 0, L: 0 };
  for (const h of vs) vsRec[h.outcome] += 1;
  const passive = COACH_PASSIVES[isUser ? state.coaches.coach.passive : club.passive];
  const identity = PHILOSOPHIES[clubIdentity(club)];
  const gm = isUser ? { name: state.gmName || 'You', rep: state.gm?.reputation } : state.world.gms?.[clubId];
  const mkey = isUser ? 'you' : gm && `${clubId}|${gm.name}`;
  const h = hist.honours;
  const now = seasonYear(state.season.year);
  const sum = useMemo(() => honoursSummary(state.archive, clubId, club.divisionId, now + 1), [state.archive, clubId, club.divisionId, now]);
  const majors = sum.titles.filter((t) => t.kind !== 'super');
  const totalHonours = majors.reduce((n, t) => n + t.n, 0);
  const historyLine = historyLineOf(sum);
  return (
    <>
      <div className="stat-tiles">
        <div><span>Position</span><b>{row?.p ? ordinal(pos) : '—'}</b><small>{row ? `${row.pts} pts · ${row.w}-${row.d}-${row.l}` : ''}</small></div>
        <div><span>Strength</span><b>{Math.round(isUser ? squadOvr(squad.lineup) : club.strength)}</b><small>{squad.formation}</small></div>
        <div><span>Honours</span><b>{totalHonours}</b><small>major trophies</small></div>
      </div>
      {isUser && <p className="hint hint--accent">This is your club.</p>}
      {!isUser && vs.length > 0 && <p className="hint">Your recent record against them: {vsRec.W}W {vsRec.D}D {vsRec.L}L</p>}
      <ul className="champions">
        <li><span>Manager</span><b>{gm ? <ManagerLink mkey={mkey}>{gm.name}{isUser ? ' (you)' : ''}</ManagerLink> : '—'}{gm?.rep != null ? <small className="muted"> · rep {gm.rep}</small> : null}</b></li>
        {isUser && <li><span>Head coach card</span><b>{state.coaches.coach.name}</b></li>}
        {passive && <li><span>Coach passive</span><b>{passive.name}</b></li>}
        {identity && <li><span>Identity</span><b>{identity.name}</b></li>}
      </ul>
      {identity && <p className="hint">{identity.text}{passive ? ` Coach: ${passive.text}` : ''}</p>}

      {rivalsOf(clubId).length > 0 && (
        <section className="rivals">
          <h2 className="section-title">Rivals</h2>
          <div className="chip-row">
            {rivalsOf(clubId).map((id) => state.world.clubs[id] && (
              <ClubLink key={id} id={id} className="chip-btn rival-chip">🔥 {state.world.clubs[id].name}</ClubLink>
            ))}
          </div>
          <p className="hint">{[...new Set(rivalsOf(clubId).map((id) => derbyName(clubId, id)))].join(' · ')}</p>
        </section>
      )}

      <section>
        <h2 className="section-title">Honours</h2>
        <p className="club-history-line">{historyLine}</p>
        <div className="honours">
          <div><b>{sum.league.n}</b><span>League titles</span></div>
          <div><b>{sum.cup.n}</b><span>Domestic cups</span></div>
          <div><b>{sum.continental.n + sum.continental2.n}</b><span>Continental cups</span></div>
          <div><b>{sum.world.n}</b><span>Club World Cups</span></div>
          <div><b>{h.runnerUp}</b><span>League runner-up</span></div>
        </div>
        {majors.length > 0 && (
          <ul className="honour-lines">
            {majors.slice(0, 4).map((t) => <li key={t.key}><b>{t.name} ×{t.n}</b> <span>({yearsText([...t.real, ...t.game], 4)})</span></li>)}
          </ul>
        )}
      </section>

      {scorersNow.length > 0 && (
        <section>
          <h2 className="section-title">This season's scorers</h2>
          <ul className="champions">{scorersNow.map((s) => <li key={s.id}><span><PlayerLink id={s.id} name={s.name} /></span><b>{s.goals}</b></li>)}</ul>
        </section>
      )}

      {!isUser && onCurse && (
        <section className="house-rule">
          <label className={`switch${club.cursed ? ' is-on' : ''}`}>
            <input type="checkbox" checked={!!club.cursed} onChange={() => onCurse(clubId)} />
            <span className="switch__track" aria-hidden="true"><i /></span>
            <span className="switch__body"><b>Curse this club (house rule)</b><small>Its Rare, Epic and Legend players leave every summer and it loses at least half its games.</small></span>
          </label>
        </section>
      )}
    </>
  );
}

// Named (and your) players link to their profile.
const linkable = (state, c, isUser) => c && (isUser || (!c.generic && POOL_BY_ID[c.id]));

function Squad({ state, club, isUser, squad }) {
  const book = state.stats?.season || emptyBook();
  const list = [...squad.lineup, ...squad.bench].filter(Boolean);
  const named = list.filter((c) => !c.generic && c.rarity !== 'academy');
  const passive = COACH_PASSIVES[isUser ? state.coaches.coach.passive : club.passive];
  return (
    <>
      <div className="scroll-x">
        <table className="table table--history table--squad">
          <thead><tr><th>Pos</th><th>Ovr</th><th className="table__club">Player</th>{ATTR_KEYS.map((k) => <th key={k}>{ATTR_LABEL[k]}</th>)}<th>Apps</th><th>G</th><th>Avg</th></tr></thead>
          <tbody>
            {list.map((c, i) => {
              const a = attrs(c);
              const sk = skillOf(c);
              const s = book.players[c.id];
              const apps = s ? Object.values(s.s).reduce((n, t) => n + t[0], 0) : 0;
              const goals = s ? Object.values(s.s).reduce((n, t) => n + t[1], 0) : 0;
              const rsum = s ? Object.values(s.s).reduce((n, t) => n + t[4], 0) : 0;
              return (
                <tr key={c.id} className={`r-${c.rarity}${i >= squad.lineup.length ? ' is-bench' : ''}`}>
                  <td>{c.pos}</td>
                  <td><b>{overall(c)}</b></td>
                  <td className="table__club">
                    <span className="dot-r" /> <Flag card={c} className="squad-list__flag" />
                    {linkable(state, c, isUser) ? <PlayerLink id={c.id} name={c.name} /> : c.name}
                    {sk && <span className="squad-list__skill" title={`${sk.name}: ${sk.desc}`}>{sk.icon}</span>}
                    {i === squad.lineup.length && <span className="squad-list__tag">Bench</span>}
                  </td>
                  {ATTR_KEYS.map((k) => <td key={k}>{a[k]}</td>)}
                  <td>{apps || '—'}</td><td>{goals || '—'}</td><td>{apps ? (rsum / apps).toFixed(2) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="hint">{named.length} named card{named.length === 1 ? '' : 's'} (colour = rarity{named.some((c) => skillOf(c)) ? ', icon = skill' : ''}) · formation {squad.formation}{passive ? ` · Coach: ${passive.name} (${passive.text})` : ''}. Season stats from every game this season. Tap a name for the player's profile.</p>
    </>
  );
}

function History({ state, club, hist }) {
  const clubId = club.id;
  const managers = useMemo(() => {
    const list = clubManagers(state, clubId, state.gmName || 'You');
    const gm = clubId === state.club.id ? null : state.world.gms?.[clubId];
    const nowKey = clubId === state.club.id ? 'you' : gm && `${clubId}|${gm.name}`;
    if (gm && !list.some((m) => m.key === nowKey)) list.unshift({ key: nowKey, name: gm.name, from: gm.since, to: gm.since, p: 0, w: 0, d: 0, l: 0, titles: 0 });
    for (const m of list) m.current = m.key === nowKey;
    return list;
  }, [state, clubId]);
  const moves = useMemo(() => clubMoves(state, clubId).filter((m) => POOL_BY_ID[m.id] || state.careerNames?.[m.id]), [state.moves, clubId]);
  const allTime = useMemo(() => Object.entries(state.records?.players || {})
    .filter(([, p]) => p.c?.[clubId])
    .map(([id, p]) => ({ ...recordRow(id, p, nameOf), here: p.c[clubId] }))
    .sort((a, b) => b.here - a.here)
    .slice(0, 8), [state.records, clubId]);
  const moveName = (id) => POOL_BY_ID[id]?.name || state.careerNames?.[id]?.[0] || '?';
  const signings = moves.filter((m) => m.dir === 'in').slice(0, 12);
  const departures = moves.filter((m) => m.dir === 'out').slice(0, 12);
  const rarity = (id) => POOL_BY_ID[id]?.rarity || 'common';
  return (
    <>
      {hist.seasons.length > 0 ? (
        <section>
          <h2 className="section-title">Season by season</h2>
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>Season</th><th className="table__club">League</th><th>Pos</th><th>Pts</th><th>W-D-L</th><th>GF-GA</th><th className="table__club">Top scorer</th><th /></tr></thead>
              <tbody>
                {hist.seasons.map((s) => (
                  <tr key={s.year} className={s.pos === 1 ? 'is-top' : ''}>
                    <td>{yearLabel(s.year)}</td>
                    <td className="table__club"><LeagueLink divId={s.divId}>{DIVISION_BY_ID[s.divId].name}</LeagueLink></td>
                    <td><b>{s.pos}</b></td>
                    <td>{s.pts}</td>
                    <td>{s.w}-{s.d}-{s.l}</td>
                    <td>{s.gf}-{s.ga}</td>
                    <td className="table__club">{s.scorer ? <><PlayerLink id={s.scorer.id} name={s.scorer.name || nameOf(s.scorer.id) || '?'} /> ({s.scorer.goals})</> : '—'}</td>
                    <td>{s.trophies.map((t) => TROPHY_ICON[t]).join(' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : <p className="hint">History builds up season by season: titles, finishes and scorers appear here after each season ends.</p>}

      {managers.length > 0 && (
        <section>
          <h2 className="section-title">Managers</h2>
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>Years</th><th className="table__club">Manager</th><th>P</th><th>W-D-L</th><th>Win %</th><th>Titles</th></tr></thead>
              <tbody>
                {managers.map((m) => (
                  <tr key={m.key} className={m.key === 'you' ? 'is-user' : ''}>
                    <td>{m.current ? `${yearLabel(m.from)}–now` : m.from === m.to ? `${yearLabel(m.from)}` : `${yearLabel(m.from)}–${yearLabel(m.to)}`}</td>
                    <td className="table__club"><ManagerLink mkey={m.key}>{m.name}{m.key === 'you' ? ' (you)' : ''}</ManagerLink></td>
                    <td>{m.p}</td><td>{m.w}-{m.d}-{m.l}</td><td>{pct(m.w, m.p)}</td><td>{m.titles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(signings.length > 0 || departures.length > 0) && (
        <section>
          <h2 className="section-title">Signings and departures</h2>
          <div className="moves-grid">
            <div>
              <h3 className="sub-title">In</h3>
              {signings.length ? (
                <ul className="news">
                  {signings.map((m, i) => (
                    <li key={`${m.id}-${i}`} className={`r-${rarity(m.id)}`}>
                      <b><PlayerLink id={m.id} name={moveName(m.id)} /></b>
                      <span>{yearLabel(m.year)} · {MOVE_LABEL[m.type]}{m.from ? <> from <ClubLink id={m.from}>{state.world.clubs[m.from]?.short}</ClubLink></> : m.type === 's' ? ' (free agent)' : ''}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="hint">None on record.</p>}
            </div>
            <div>
              <h3 className="sub-title">Out</h3>
              {departures.length ? (
                <ul className="news">
                  {departures.map((m, i) => (
                    <li key={`${m.id}-${i}`} className={`r-${rarity(m.id)}`}>
                      <b><PlayerLink id={m.id} name={moveName(m.id)} /></b>
                      <span>{yearLabel(m.year)} · {m.to ? <>{MOVE_LABEL[m.type]} to <ClubLink id={m.to}>{state.world.clubs[m.to]?.short}</ClubLink></> : MOVE_LABEL[m.type]}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="hint">None on record.</p>}
            </div>
          </div>
        </section>
      )}

      {allTime.length > 0 && (
        <section>
          <h2 className="section-title">All-time league scorers for {club.short}</h2>
          <ol className="scorer-list">
            {allTime.map((p, i) => (
              <li key={p.id}>
                <span className="scorer-list__pos">{i + 1}</span>
                <span className="scorer-list__name"><PlayerLink id={p.id} name={p.name} />{p.mvp ? <em> · {p.mvp}× MVP</em> : null}</span>
                <b>{p.here}</b>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

function ClubStats({ state, club }) {
  const clubId = club.id;
  const [period, setPeriod] = useState('season');
  const [sort, setSort] = useState('apps');
  const players = useMemo(() => {
    if (period === 'all') return clubPlayersAllTime(state, clubId).map((p) => ({ ...p, name: POOL_BY_ID[p.id]?.name || state.careerNames?.[p.id]?.[0] || state.stats?.all?.players?.[p.id]?.n || '?', pos: POOL_BY_ID[p.id]?.pos || state.careerNames?.[p.id]?.[1] || '' }));
    return Object.entries(state.stats?.season?.players || {}).filter(([, r]) => r.c === clubId).map(([id, r]) => {
      const t = [0, 0, 0, 0, 0];
      for (const s of Object.values(r.s)) for (let i = 0; i < 5; i += 1) t[i] += s[i];
      return { id, name: r.n, pos: r.p, apps: t[0], goals: t[1], motm: t[2], cs: t[3], avg: t[0] ? t[4] / t[0] : 0 };
    });
  }, [state, clubId, period]);
  const sorted = [...players].sort((a, b) => (b[sort] - a[sort]) || (b.apps - a.apps)).slice(0, 25);
  const rec = useMemo(() => clubRecord(state, clubId), [state, clubId]);
  const recRows = Object.entries(period === 'all' ? rec.all : rec.season).sort(([a], [b]) => compOrder(a) - compOrder(b) || a.localeCompare(b));
  const linkable = (id) => POOL_BY_ID[id] || state.careers?.[id] || clubId === state.club.id;
  return (
    <>
      <Segmented small label="Period" value={period} options={[{ id: 'season', label: yearLabel(state.stats?.year || state.season.year) }, { id: 'all', label: 'All-time' }]} onChange={setPeriod} />
      <section>
        <h2 className="section-title">Record by competition</h2>
        {recRows.length ? (
          <div className="scroll-x">
            <table className="table table--history table--fit">
              <thead><tr><th className="table__club">Competition</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Win %</th></tr></thead>
              <tbody>
                {recRows.map(([comp, r]) => <tr key={comp}><td className="table__club">{comp.startsWith('L:') ? <LeagueLink divId={comp.slice(2)}>{compName(comp)}</LeagueLink> : compName(comp)}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{pct(r[1], r[0])}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">No games for this period yet.</p>}
      </section>
      <section>
        <h2 className="section-title">Players</h2>
        <div className="chip-row">
          {[['apps', 'Games'], ['goals', 'Goals'], ['avg', 'Avg rating'], ['motm', 'MOTM'], ['cs', 'Clean sheets']].map(([k, l]) => <button key={k} type="button" className={`chip-btn${sort === k ? ' is-on' : ''}`} onClick={() => setSort(k)}>{l}</button>)}
        </div>
        {sorted.length ? (
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>#</th><th className="table__club">Player</th><th>Pos</th><th>Apps</th><th>G</th><th>MOTM</th><th>CS</th><th>Avg</th>{period === 'all' && <th>Seasons</th>}</tr></thead>
              <tbody>
                {sorted.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td className="table__club">{linkable(p.id) ? <PlayerLink id={p.id} name={p.name} /> : p.name}</td>
                    <td>{p.pos}</td><td>{p.apps}</td><td>{p.goals}</td><td>{p.motm}</td><td>{p.cs}</td><td>{p.avg.toFixed(2)}</td>
                    {period === 'all' && <td>{p.seasons}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">No player numbers for this period yet.</p>}
        <p className="hint">Named players (and yours) are tracked in every game. All-time adds up every season since the career log began.</p>
      </section>
    </>
  );
}

const HONOUR_ICON = { league: '🏆', cup: '🥇', super: '🎖️', continental: '🌍', world: '🌐' };

// Every trophy the club has won, real life and in-game, by competition.
function Honours({ state, club }) {
  const list = useMemo(() => clubTitles(state.archive, club.id), [state.archive, club.id]);
  const runnerUps = useMemo(() => {
    const map = {};
    for (const e of state.archive || []) {
      for (const [divId, lg] of Object.entries(e.leagues)) if (lg.table[1]?.[0] === club.id) (map[divId] = map[divId] || []).push(e.year);
    }
    return Object.entries(map);
  }, [state.archive, club.id]);
  const finals = useMemo(() => {
    const out = [];
    for (const e of state.archive || []) {
      for (const w of entryWinners(e)) if (w.runnerUp === club.id && !w.key.startsWith('L:')) out.push({ year: e.year, label: `${competitionName(w.key)} final`, winner: w.winner });
    }
    return out.reverse();
  }, [state.archive, club.id]);
  if (!list.length && !finals.length && !runnerUps.length) return <p className="hint">No major honours yet{(state.archive || []).length ? '' : ': the first trophies of the game are decided when this season ends'}.</p>;
  return (
    <>
      <ul className="trophy-list">
        {list.map((t) => (
          <li key={t.key} className={`trophy-list__${t.kind}`}>
            <span className="trophy-list__icon" aria-hidden="true">{HONOUR_ICON[t.kind]}</span>
            <span className="trophy-list__body">
              <b>{t.name}</b>
              <small>
                {t.real.length > 0 && <span>{yearsText(t.real)}</span>}
                {t.game.length > 0 && <span className="trophy-list__game">{t.real.length ? ' · ' : ''}{yearsText(t.game)}</span>}
              </small>
            </span>
            <span className="trophy-list__n">×{t.n}</span>
          </li>
        ))}
        {runnerUps.map(([divId, years]) => (
          <li key={`ru-${divId}`} className="trophy-list__runnerUp">
            <span className="trophy-list__icon" aria-hidden="true">🥈</span>
            <span className="trophy-list__body"><b>{DIVISION_BY_ID[divId]?.name} runner-up</b><small>{years.map(yearLabel).join(', ')}</small></span>
            <span className="trophy-list__n">×{years.length}</span>
          </li>
        ))}
      </ul>
      <p className="hint">Real-life titles up to 2026, then <b className="trophy-list__game">titles won in the game</b> from {FIRST_YEAR}.</p>
      {finals.length > 0 && (
        <section>
          <h2 className="section-title">Lost finals</h2>
          <ul className="champions">{finals.map((f, i) => <li key={i}><span>{yearLabel(f.year)} · {f.label}</span><b>lost to <ClubLink id={f.winner}>{state.world.clubs[f.winner]?.short}</ClubLink></b></li>)}</ul>
        </section>
      )}
    </>
  );
}

function squadOvr(lineup) {
  const list = lineup.filter(Boolean);
  return list.reduce((s, c) => s + overall(c), 0) / Math.max(1, list.length);
}

// Menu → House rules: personal tweaks to the world.
export function HouseRules({ state, onToggle }) {
  const cursed = state.houseRules?.cursed || [];
  const barca = state.world.clubs.barcelona;
  return (
    <div className="house-rules">
      {barca && state.club.id !== 'barcelona' && (
        <label className={`switch${cursed.includes('barcelona') ? ' is-on' : ''}`}>
          <input type="checkbox" checked={cursed.includes('barcelona')} onChange={() => onToggle('barcelona')} />
          <span className="switch__track" aria-hidden="true"><i /></span>
          <span className="switch__body"><b>Barcelona curse</b><small>Barcelona lose their stars every summer and lose at least half their games.</small></span>
        </label>
      )}
      {cursed.filter((id) => id !== 'barcelona').map((id) => (
        <label key={id} className="switch is-on">
          <input type="checkbox" checked onChange={() => onToggle(id)} />
          <span className="switch__track" aria-hidden="true"><i /></span>
          <span className="switch__body"><b>{state.world.clubs[id]?.name} curse</b><small>Tap to lift it.</small></span>
        </label>
      ))}
      <p className="hint">You can curse any other club from its club page.</p>
    </div>
  );
}
