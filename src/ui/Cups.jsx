import React, { useState } from 'react';
import { clubById } from '../engine/season.js';
import { CONTINENTS, CONTINENT_NAME, cupRoundNames, groupStandings } from '../engine/competitions.js';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';
import CompStats from './CompStats.jsx';
import { Segmented } from './Home.jsx';

export default function Cups({ state, countryCode }) {
  const [view, setView] = useState('domestic');
  const [cont, setCont] = useState('europe');
  const comps = state.season.comps;
  return (
    <div className="cups">
      <Segmented
        small
        label="Competition"
        value={view}
        options={[{ id: 'domestic', label: 'Domestic cup' }, { id: 'continental', label: 'Continental' }, { id: 'cwc', label: 'Club World Cup' }]}
        onChange={setView}
      />
      {view === 'domestic' && <><DomesticCup state={state} cup={comps.cups[countryCode]} /><CompStats state={state} comp={`C:${countryCode}`} /></>}
      {view === 'continental' && (
        <>
          <Segmented small label="Continent" value={cont} options={CONTINENTS.map((k) => ({ id: k, label: CONTINENT_NAME[k].replace(' Cup', '') }))} onChange={setCont} />
          <Continental state={state} c={comps.continental[cont]} name={CONTINENT_NAME[cont]} />
          <CompStats state={state} comp={`K:${cont}`} />
        </>
      )}
      {view === 'cwc' && <><ClubWorldCup state={state} cwc={comps.cwc} /><CompStats state={state} comp="W" /></>}
    </div>
  );
}

function Tie({ state, game, label }) {
  const h = clubById(state.world, game.home);
  const a = clubById(state.world, game.away);
  const mine = game.home === state.club.id || game.away === state.club.id;
  const score = game.score ? `${game.score[0]}–${game.score[1]}` : 'vs';
  return (
    <div className={`fixture${mine ? ' is-user' : ''}`}>
      <ClubLink id={game.home} className={`fixture__team${game.winner === game.home ? ' is-winner' : ''}`}>{h.name}</ClubLink>
      <Crest colors={h.colors} short={h.short} size={20} id={game.home} />
      <b className="fixture__score">{score}{game.pens ? <small>{game.pens[0]}–{game.pens[1]} pens</small> : null}</b>
      <Crest colors={a.colors} short={a.short} size={20} id={game.away} />
      <ClubLink id={game.away} className={`fixture__team is-right${game.winner === game.away ? ' is-winner' : ''}`}>{a.name}</ClubLink>
      {label && <small className="fixture__label">{label}</small>}
    </div>
  );
}

function DomesticCup({ state, cup }) {
  if (!cup) return <p className="hint">This country has no cup.</p>;
  const names = cupRoundNames(cup);
  const inCup = cup.clubs.includes(state.club.id);
  return (
    <div className="bracket">
      <p className="hint">{cup.country} Cup · {cup.size} clubs · single-match knockout, lower-division club at home{cup.prelim ? `; the ${cup.prelim.length} lowest-ranked clubs play a preliminary round` : ''}.{!inCup && cup.clubs.length ? ' Your club isn\'t in it: only divisions 1 and 2 play.' : ''}</p>
      {cup.winner && <p className="promo is-up">🏆 Winner: {clubById(state.world, cup.winner).name}</p>}
      {cup.rounds.length === 0 && <p className="hint">The draw happens before the first round.</p>}
      {cup.rounds.map((games, r) => (
        <div key={r}>
          <h4 className="sub-title">{names[r]}</h4>
          {games.map((g, i) => <Tie key={i} state={state} game={g} />)}
        </div>
      ))}
    </div>
  );
}

function GroupTable({ state, group, name }) {
  const rows = groupStandings(group);
  return (
    <>
    <h4 className="sub-title">{name}</h4>
    <table className="table table--compact">
      <thead><tr><th>#</th><th className="table__club">Club</th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
      <tbody>
        {rows.map((r, i) => {
          const club = clubById(state.world, r.id);
          return (
            <tr key={r.id} className={`${r.id === state.club.id ? 'is-user' : ''}${i < 2 ? ' is-up' : ''}`}>
              <td>{i + 1}</td>
              <td className="table__club"><ClubLink id={r.id} className="club-inline"><Crest colors={club.colors} short={club.short} size={18} id={r.id} /> <span>{club.name}</span></ClubLink></td>
              <td>{r.p}</td><td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td><td><b>{r.pts}</b></td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </>
  );
}

function Continental({ state, c, name }) {
  return (
    <div className="bracket">
      {c.winner && <p className="promo is-up">🏆 {name} winner: {clubById(state.world, c.winner).name}</p>}
      {c.prelim && (
        <>
          <h4 className="sub-title">Preliminary round</h4>
          {c.prelim.map((g, i) => <Tie key={i} state={state} game={g} />)}
        </>
      )}
      {c.qualifying && (
        <>
          <h4 className="sub-title">Qualifying round</h4>
          {c.qualifying.map((g, i) => <Tie key={i} state={state} game={g} />)}
        </>
      )}
      {c.groups ? c.groups.map((g, i) => <GroupTable key={i} state={state} group={g} name={`Group ${'AB'[i]} · top 2 go through`} />) : (
        <p className="hint">Groups are drawn after the qualifying round.</p>
      )}
      {c.semis && (
        <>
          <h4 className="sub-title">Semi-finals</h4>
          {c.semis.map((g, i) => <Tie key={i} state={state} game={g} />)}
        </>
      )}
      {c.final && (
        <>
          <h4 className="sub-title">Final · neutral venue</h4>
          <Tie state={state} game={c.final} />
        </>
      )}
      {!c.prelim && !c.qualifying && !c.groups && <p className="hint">Entrants: {c.entrants.map((id) => clubById(state.world, id).name).join(', ')}</p>}
    </div>
  );
}

function ClubWorldCup({ state, cwc }) {
  if (!cwc) return <p className="hint">At the end of the season, the three continental champions meet at a neutral venue: each plays the other two, then the top two play the final.</p>;
  return (
    <div className="bracket">
      {cwc.winner && <p className="promo is-up">🏆 Club World Cup winner: {clubById(state.world, cwc.winner).name}</p>}
      <GroupTable state={state} group={cwc} name="Mini-league · top 2 play the final" />
      {cwc.fixtures.map((g, i) => <Tie key={i} state={state} game={g} />)}
      {cwc.final && (
        <>
          <h4 className="sub-title">Final</h4>
          <Tie state={state} game={cwc.final} />
        </>
      )}
    </div>
  );
}
