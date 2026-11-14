import React, { useMemo, useState } from 'react';
import { POOL_BY_ID } from '../state/club.js';
import {
  nationSelection, cycleCall, lockSelection, clearCalls, appointCoach, nationCoachOptions, intlContext,
  nationRequirement, CALL_STARTERS, CALL_RESERVES, currentEvent,
} from '../state/national.js';
import {
  groupTable, tournamentName, nationName, nationFlag, qualifiedFrom, WORLD_CUP, NATIONS_CUP_NAME, nationTitles, yearPlan, confYear,
} from '../engine/intl.js';
import { NATIONAL_TEAMS, NATION_CODES, INTL_CONFS, INTL_CONF_LABEL, REAL_NATION_TITLES, NATION_REPUTATION } from '../data/nationalTeams.js';
import { overall, teamOverall } from '../engine/cards.js';
import { MiniCard, CoachCard } from './Card.jsx';
import { Segmented, clubVars } from './Home.jsx';
import { ClubLink } from './nav.jsx';
import { yearLabel, seasonYear } from '../engine/years.js';

const PRESTIGE = { 1: 'Elite', 2: 'Major', 3: 'Established', 4: 'Rising', 5: 'Minnow' };

export function NationName({ code, short }) {
  if (!code) return <span>—</span>;
  return <span className="nation-inline"><span aria-hidden="true">{nationFlag(code)}</span> {short ? code : nationName(code)}</span>;
}

function NTie({ game, mine }) {
  const score = game.score ? `${game.score[0]}–${game.score[1]}` : 'vs';
  const you = mine && (game.home === mine || game.away === mine);
  return (
    <div className={`fixture${you ? ' is-user' : ''}`}>
      <span className={`fixture__team${game.winner === game.home ? ' is-winner' : ''}`}><NationName code={game.home} /></span>
      <b className="fixture__score">{score}{game.pens ? <small>{game.pens[0]}–{game.pens[1]} pens</small> : null}</b>
      <span className={`fixture__team is-right${game.winner === game.away ? ' is-winner' : ''}`}><NationName code={game.away} /></span>
    </div>
  );
}

function NGroup({ group, name, mine, through = 2 }) {
  const rows = groupTable(group);
  return (
    <>
      <h4 className="sub-title">{name}</h4>
      <table className="table table--compact">
        <thead><tr><th>#</th><th className="table__club">Nation</th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`${r.id === mine ? 'is-user' : ''}${i < through ? ' is-up' : ''}`}>
              <td>{i + 1}</td>
              <td className="table__club"><NationName code={r.id} /></td>
              <td>{r.p}</td><td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td><td><b>{r.pts}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function Tournament({ t, mine }) {
  const name = tournamentName(t.key);
  return (
    <div className="bracket">
      <p className="hint">{name} · {t.teams.length} nations · {t.groups.length} groups of 4 (top 2 go through) → {t.groups.length === 4 ? 'quarter-finals → ' : ''}semi-finals → final. Neutral venues.</p>
      {t.winner && <p className="promo is-up">🏆 {name} winner: <NationName code={t.winner} /></p>}
      {t.groups.map((g, i) => <NGroup key={i} group={g} name={`Group ${'ABCD'[i]}`} mine={mine} />)}
      {[['quarters', 'Quarter-finals'], ['semis', 'Semi-finals']].map(([k, title]) => t[k] && (
        <div key={k}>
          <h4 className="sub-title">{title}</h4>
          {t[k].map((g, i) => <NTie key={i} game={g} mine={mine} />)}
        </div>
      ))}
      {t.final && (<><h4 className="sub-title">Final</h4><NTie game={t.final} mine={mine} /></>)}
    </div>
  );
}

function Qualifiers({ intl, conf, mine }) {
  const q = intl?.quals?.[conf];
  if (!q) return <p className="hint">No qualifiers for {INTL_CONF_LABEL[conf]} this season: {yearPlan(intl?.year ?? 2027)[conf]}.</p>;
  const target = q.target === 'W' ? WORLD_CUP : NATIONS_CUP_NAME[conf];
  const done = q.groups.every((g) => groupTable(g).every((r) => r.p >= (g.teams.length === 3 ? 4 : 6)));
  const through = done ? qualifiedFrom(q) : [];
  return (
    <div className="bracket">
      <p className="hint">{target} qualifying · {INTL_CONF_LABEL[conf]} · {q.slots} place{q.slots > 1 ? 's' : ''}: group winners first, then the best runners-up (points per game). Home and away, six international windows this season.</p>
      {done && <p className="promo is-up">Qualified: {through.map((code) => `${nationFlag(code)} ${code}`).join(' · ')}</p>}
      {q.groups.map((g, i) => <NGroup key={i} group={g} name={`Group ${'ABCDEFGH'[i]}`} mine={mine} through={q.slots >= q.groups.length * 2 ? 2 : 1} />)}
    </div>
  );
}

// This season for one confederation: its qualifiers, or its tournament (drawn after the club season).
function ConfSeason({ intl, conf, mine }) {
  const t = Object.values(intl?.tournaments || {}).find((x) => x.key === conf || (x.key === 'W' && confYear(conf, intl.year).tour === 'W'));
  if (t) return <Tournament t={t} mine={mine} />;
  if (intl?.quals?.[conf]) return <Qualifiers intl={intl} conf={conf} mine={mine} />;
  const { tour } = confYear(conf, intl?.year ?? 2027);
  const who = tour === 'W' ? 'the 16 qualified nations' : conf === 'europe' ? 'the 8 qualified nations' : `the ${conf === 'africa' ? 12 : 16} strongest nations (no qualifiers)`;
  return <p className="hint">{yearPlan(intl?.year ?? 2027)[conf]} after the club season: {who}. The draw comes when the league ends.</p>;
}

// ---------------------------------------------------------------------------
// Your national team

export function NationalTeam({ state, setState, onBack }) {
  const job = state.nationJob;
  const [tab, setTab] = useState('squad');
  const ctx = useMemo(() => intlContext(state, POOL_BY_ID), [state.world, state.squad, state.season?.year]);
  if (!job) {
    return (
      <div className="screen">
        <p className="hint">You don't manage a national team. Federations call in the summer, by reputation: see Career → National team.</p>
        <button type="button" className="btn btn--ghost" onClick={onBack}>Back</button>
      </div>
    );
  }
  const n = NATIONAL_TEAMS[job.code];
  const sel = nationSelection(state, POOL_BY_ID, ctx);
  const intl = state.season?.intl;
  const ev = currentEvent(state);
  const rec = job.record;
  return (
    <div className="screen nation-screen">
      <div className="club-head" style={clubVars({ colors: n.colors })}>
        <span className="nation-flag" aria-hidden="true">{nationFlag(job.code)}</span>
        <div>
          <b>{nationName(job.code)}</b>
          <span>{PRESTIGE[n.prestige]} · {INTL_CONF_LABEL[n.conf]} · strength {Math.round(ctx.strengths[job.code])} · since {yearLabel(job.since)}</span>
        </div>
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>
      <p className="hint">A second job, free of money: call up anyone with a {nationName(job.code)} passport, wherever he plays, and pick the head coach. Your club cards don't tire in national games.</p>
      <div className="stat-tiles">
        <div><span>Played</span><b>{rec.p}</b><small>{rec.w}W {rec.d}D {rec.l}L</small></div>
        <div><span>Goals</span><b>{rec.gf}–{rec.ga}</b><small>for and against</small></div>
        <div><span>Trophies</span><b>{(job.trophies || []).length}</b><small>{(job.trophies || []).map((x) => x.name).join(', ') || 'none yet'}</small></div>
      </div>
      <Segmented small label="National team" value={tab} options={[{ id: 'squad', label: 'Call-ups' }, { id: 'coach', label: 'Coach' }, { id: 'games', label: 'Games' }, { id: 'comp', label: yearPlan(intl?.year ?? 2027)[n.conf] }]} onChange={setTab} />
      {tab === 'squad' && <CallUps state={state} setState={setState} sel={sel} ev={ev} />}
      {tab === 'coach' && (
        <section>
          <h2 className="section-title">Head coach</h2>
          <p className="hint">The coach sets the formation and the style the team plays (no tactics clash in national games). Change him any time between games.</p>
          <div className="coach-pick">
            {nationCoachOptions(job.code, job.since).map((c) => (
              <CoachCard key={c.id} coach={c} role="coach" selected={job.coach?.id === c.id} onClick={() => setState((s) => appointCoach(s, c.id))} />
            ))}
          </div>
        </section>
      )}
      {tab === 'games' && (
        <section>
          <h2 className="section-title">Results</h2>
          {(job.results || []).length === 0 ? <p className="hint">No games yet. Qualifiers are played in three international windows a season.</p> : (
            <ul className="champions">
              {job.results.map((r, i) => (
                <li key={i}><span>{r.label.split(' · ')[0]} · vs <NationName code={r.opp} /></span><b className={r.outcome === 'W' ? 'is-up' : r.outcome === 'L' ? 'is-down' : ''}>{r.score[0]}–{r.score[1]}{r.pens ? ` (${r.pens[0]}–${r.pens[1]} p)` : ''}</b></li>
              ))}
            </ul>
          )}
          {Object.keys(job.caps || {}).length > 0 && (
            <>
              <h3 className="sub-title">Caps and goals under you</h3>
              <ul className="champions">
                {Object.entries(job.caps).sort((a, b) => b[1].goals - a[1].goals || b[1].apps - a[1].apps).slice(0, 12).map(([id, c]) => <li key={id}><span>{c.name} · {c.pos}</span><b>{c.apps} caps · {c.goals} goals</b></li>)}
              </ul>
            </>
          )}
        </section>
      )}
      {tab === 'comp' && <ConfSeason intl={intl} conf={n.conf} mine={job.code} />}
    </div>
  );
}

function CallUps({ state, setState, sel, ev }) {
  const calls = state.nationJob.calls || {};
  const inSquad = new Set([...sel.lineup, ...sel.bench].map((c) => c.id));
  const starters = new Set(sel.lineup.map((c) => c.id));
  const picked = Object.keys(calls).length;
  const [all, setAll] = useState(false);
  const shown = all ? sel.pool : sel.pool.slice(0, 30);
  return (
    <section>
      <h2 className="section-title">Squad · {sel.formation} · {teamOverall(sel.lineup)} OVR</h2>
      <div className="nation-xi">
        {sel.lineup.map((c) => <MiniCard key={c.id} card={c} selected />)}
      </div>
      <div className="nation-xi nation-xi--bench">
        {sel.bench.map((c) => <MiniCard key={c.id} card={c} dim />)}
      </div>
      {sel.locked ? (
        <p className="promo">Squad set for the {ev.name}: these 12 until it ends. Tap a player to swap him between starter and reserve.</p>
      ) : (
        <p className="hint">{ev ? `Pick your 12 for the ${ev.name}: the squad is set at its first game.` : 'Nothing on for your nation right now.'} Tap a player below: starter → reserve → not called. Places you leave open are filled with the best available. {picked ? `${picked} picked by you.` : 'Right now the coach picks the best 7 and 5 reserves.'}</p>
      )}
      {!sel.locked && <div className="cta-row">
        <button type="button" className="btn btn--small btn--ghost" onClick={() => setState((s) => lockSelection(s, POOL_BY_ID))}>Pick from the best</button>
        <button type="button" className="btn btn--small btn--ghost" onClick={() => setState((s) => clearCalls(s))} disabled={!picked}>Clear my picks</button>
      </div>}
      <div className="scroll-x">
        <table className="table table--history nation-pool">
          <thead><tr><th>OVR</th><th className="table__club">Player</th><th>Call</th></tr></thead>
          <tbody>
            {shown.map((c) => {
              const role = calls[c.id] || (starters.has(c.id) ? 'start*' : inSquad.has(c.id) ? 'bench*' : '');
              const club = c.clubId ? state.world.clubs[c.clubId] : null;
              return (
                <tr key={c.id} className={c.yours ? 'is-user' : ''} onClick={() => setState((s) => cycleCall(s, c.id, POOL_BY_ID))}>
                  <td><b>{overall(c)}</b></td>
                  <td className="table__club nation-pool__who"><b>{c.name}</b><small>{c.pos} · {club ? <ClubLink id={club.id}>{club.short}</ClubLink> : 'abroad'}{c.youth ? ' · academy' : ''}{c.yours ? ' · yours' : ''}</small></td>
                  <td>
                    <button type="button" className={`chip-btn${calls[c.id] ? ' is-on' : ''}`} onClick={(e) => { e.stopPropagation(); setState((s) => cycleCall(s, c.id, POOL_BY_ID)); }}>
                      {role.startsWith('start') ? 'Starter' : role.startsWith('bench') ? 'Reserve' : '—'}{role.endsWith('*') ? ' (auto)' : ''}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sel.pool.length > 30 && !all && <button type="button" className="btn btn--small btn--ghost" onClick={() => setAll(true)}>Show all {sel.pool.length} eligible players</button>}
      <p className="hint">Starters: {CALL_STARTERS}, reserves: {CALL_RESERVES}. "Academy" players come through the nation's club academies: every country's clubs produce players for it.</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Home: your national team's next game

export function NationNext({ state, game, onPlay }) {
  const ctx = useMemo(() => intlContext(state, POOL_BY_ID), [state.world, state.squad, state.season?.year]);
  const sel = nationSelection(state, POOL_BY_ID, ctx);
  const us = game.nation;
  const them = game.opponentNation;
  const [left, right] = game.homeId === `nat-${us}` ? [us, them] : [them, us];
  const ovr = (code) => (code === us ? teamOverall(sel.lineup) : Math.round(ctx.strengths[code]));
  const venue = game.neutral ? 'Neutral' : game.isHome ? 'Home' : 'Away';
  return (
    <section className="next-match next-match--national">
      <div className="next-match__meta"><span>International · {game.label}</span><span>{nationName(us)}</span></div>
      <div className="matchup matchup--hero">
        <NationSide code={left} ovr={ovr(left)} />
        <div className="matchup__vs"><span>VS</span><small>{venue}{game.knockout ? ' · KO' : ''}</small></div>
        <NationSide code={right} ovr={ovr(right)} />
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={onPlay}>Play: {game.label.split(' · ').slice(-1)[0]}</button>
    </section>
  );
}

function NationSide({ code, ovr }) {
  return (
    <div className="matchup__team" style={clubVars({ colors: NATIONAL_TEAMS[code].colors })}>
      <span className="nation-flag nation-flag--big" aria-hidden="true">{nationFlag(code)}</span>
      <b>{nationName(code)}</b>
      <span>{ovr} OVR</span>
    </div>
  );
}

export function NationPreMatch({ state, fixture, onStart, onSim, onBack, onEdit }) {
  const ctx = useMemo(() => intlContext(state, POOL_BY_ID), [state.world, state.squad, state.season?.year]);
  const sel = nationSelection(state, POOL_BY_ID, ctx);
  const us = fixture.nation;
  const them = fixture.opponentNation;
  const [left, right] = fixture.homeId === `nat-${us}` ? [us, them] : [them, us];
  const ovr = (code) => (code === us ? teamOverall(sel.lineup) : Math.round(ctx.strengths[code]));
  const coach = state.nationJob.coach;
  return (
    <div className="screen screen--prematch">
      <div className="prematch__main">
        <div className="matchup">
          <NationSide code={left} ovr={ovr(left)} />
          <div className="matchup__vs"><span>VS</span><small>{fixture.label}</small></div>
          <NationSide code={right} ovr={ovr(right)} />
        </div>
        <section>
          <h2 className="section-title">{nationName(us)} · {sel.formation} · coach {coach?.name}</h2>
          <div className="nation-xi">{sel.lineup.map((c) => <MiniCard key={c.id} card={c} selected />)}</div>
          <div className="nation-xi nation-xi--bench">{sel.bench.map((c) => <MiniCard key={c.id} card={c} dim />)}</div>
          <p className="hint">National games use no boosts and cost your club nothing. Not in the mood? Simulate it.</p>
        </section>
      </div>
      <div className="cta-row cta-row--sticky">
        <button type="button" className="btn btn--ghost" onClick={onBack}>Back</button>
        <button type="button" className="btn btn--ghost" onClick={onEdit}>Call-ups</button>
        <button type="button" className="btn btn--ghost" onClick={onSim}>Simulate</button>
        <button type="button" className="btn btn--primary" onClick={onStart}>Kick off</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Career → National team: your job, offers, past jobs

export function NationalCareer({ state, onAccept, onResign, onManage }) {
  const job = state.nationJob;
  const offers = state.nationOffers || [];
  const rep = state.gm?.reputation ?? 0;
  return (
    <>
      {job ? (
        <section className="panel">
          <h2 className="section-title">Your national team</h2>
          <p><NationName code={job.code} /> · since {yearLabel(job.since)} · {job.record.w}W {job.record.d}D {job.record.l}L</p>
          <div className="cta-row">
            <button type="button" className="btn btn--primary btn--small" onClick={onManage}>Manage</button>
            <button type="button" className="btn btn--ghost btn--small" onClick={onResign}>Resign</button>
          </div>
        </section>
      ) : <p className="hint">You don't manage a national team. It's a second job next to your club: no money, just pride, reputation and the big summer tournaments.</p>}
      <section>
        <h2 className="section-title">Federations calling</h2>
        {offers.length === 0 ? <p className="hint">No offers right now. Federations call every summer, by reputation (yours: {rep}).</p> : (
          <div className="offers">
            {offers.map((code) => (
              <div key={code} className="offer">
                <span className="nation-flag" aria-hidden="true">{nationFlag(code)}</span>
                <div className="offer__body">
                  <b>{nationName(code)}</b>
                  <span>{PRESTIGE[NATIONAL_TEAMS[code].prestige]} · {INTL_CONF_LABEL[NATIONAL_TEAMS[code].conf]}</span>
                </div>
                <button type="button" className="btn btn--small btn--primary" onClick={() => onAccept(code)}>{job ? 'Switch' : 'Accept'}</button>
              </div>
            ))}
          </div>
        )}
        <p className="hint">What federations ask: {Object.entries(NATION_REPUTATION).map(([p, r]) => `${PRESTIGE[p]} ${r}+`).join(' · ')}. Elite: Spain, England, Germany, France, Brazil, Argentina.</p>
      </section>
      {(state.nationPast || []).length > 0 && (
        <section>
          <h2 className="section-title">Past national teams</h2>
          <ul className="champions">
            {state.nationPast.map((p, i) => <li key={i}><span><NationName code={p.code} /> · {yearLabel(p.from)}–{yearLabel(p.to)}</span><b>{p.record.w}W {p.record.d}D {p.record.l}L{p.trophies.length ? ` · ${p.trophies.length} 🏆` : ''}</b></li>)}
          </ul>
        </section>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// World → Nations

export function NationsWorld({ state }) {
  const [view, setView] = useState('now');
  const [conf, setConf] = useState(NATIONAL_TEAMS[state.nationJob?.code]?.conf || 'europe');
  const intl = state.season?.intl;
  const mine = state.nationJob?.code;
  const ctx = useMemo(() => (view === 'ranking' ? intlContext(state, POOL_BY_ID) : null), [view, state.world, state.squad, state.season?.year]);
  const year = seasonYear(state.season?.year ?? 1);
  const plan = yearPlan(year);
  const wc = intl?.tournaments?.W;
  return (
    <>
      <Segmented small label="Nations" value={view} options={[{ id: 'now', label: 'This season' }, { id: 'history', label: 'Winners' }, { id: 'ranking', label: 'Ranking' }]} onChange={setView} />
      {view === 'now' && (
        <>
          <p className="hint">{year}: {INTL_CONFS.map((c) => `${INTL_CONF_LABEL[c]}: ${plan[c]}`).join("; ")}. The cycle: Europe plays qualifiers, the European Championship, World Cup qualifiers, the World Cup; the other regions their continental cup, World Cup qualifiers, the cup again, the World Cup (Europe 7 places, Americas 4, Africa 3, Asia-Pacific 2).</p>
          {wc ? <Tournament t={wc} mine={mine} /> : (
            <>
              <Segmented small label="Confederation" value={conf} options={INTL_CONFS.map((c) => ({ id: c, label: INTL_CONF_LABEL[c] }))} onChange={setConf} />
              <ConfSeason intl={intl} conf={conf} mine={mine} />
            </>
          )}
        </>
      )}
      {view === 'history' && <NationHistory history={intl?.history || []} />}
      {view === 'ranking' && ctx && <NationRanking strengths={ctx.strengths} history={intl?.history || []} mine={mine} />}
    </>
  );
}

function NationHistory({ history }) {
  return (
    <section>
      {history.length === 0 && <p className="hint">Every summer has a tournament: 2027 the Americas, Africa and Asia-Pacific cups, 2028 the European Championship, 2029 the cups again, 2030 the World Cup. Real-life titles are in the Ranking.</p>}
      <ul className="champions">
        {[...history].reverse().map((h, i) => (
          <li key={i}><span>{h.year} · {tournamentName(h.key)}</span><b><NationName code={h.winner} /> <small>beat {h.runnerUp}</small></b></li>
        ))}
      </ul>
    </section>
  );
}

function NationRanking({ strengths, history, mine }) {
  const titles = nationTitles(history, REAL_NATION_TITLES);
  const rows = [...NATION_CODES].sort((a, b) => strengths[b] - strengths[a]);
  return (
    <div className="scroll-x">
      <table className="table table--history">
        <thead><tr><th>#</th><th className="table__club">Nation</th><th>Str</th><th title="World Cups">🌐</th><th title="Continental titles">🏆</th><th>Job needs</th></tr></thead>
        <tbody>
          {rows.map((code, i) => (
            <tr key={code} className={code === mine ? 'is-user' : ''}>
              <td>{i + 1}</td>
              <td className="table__club"><NationName code={code} /></td>
              <td><b>{Math.round(strengths[code])}</b></td>
              <td>{titles[code]?.W || 0}</td>
              <td>{titles[code]?.cont || 0}</td>
              <td>{nationRequirement(code)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">Strength: the best 7 a nation can call up today. Titles: real life (World Cup to 2022, continental to 2024) plus every tournament played in the game.</p>
    </div>
  );
}
