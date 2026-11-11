import React from 'react';
import { clubById } from '../engine/season.js';
import { cupRoundNames, groupStandings } from '../engine/competitions.js';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';

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

export function DomesticCup({ state, cup }) {
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

// A one-match super cup: the domestic one (league champion vs cup winner) or the continental one.
export function SuperCup({ state, sc, name, kind }) {
  const text = kind === 'csuper'
    ? 'Last season\'s continental cup winner against the winner of the second continental trophy: one match at a neutral venue, at the start of the season, penalties if level.'
    : 'Last season\'s league champion against the cup winner (the cup runner-up if the champion did the double): one match at a neutral venue before the first league matchday, penalties if level.';
  if (!sc) return <p className="hint">No {name} this season. {text}</p>;
  return (
    <div className="bracket">
      <p className="hint">{text}</p>
      {sc.winner && <p className="promo is-up">🏆 {name} winner: {clubById(state.world, sc.winner).name}</p>}
      <h4 className="sub-title">{sc.winner ? 'Result' : 'The match'} · neutral venue</h4>
      <Tie state={state} game={sc.game} />
    </div>
  );
}

function GroupTable({ state, group, name, through = 2 }) {
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
            <tr key={r.id} className={`${r.id === state.club.id ? 'is-user' : ''}${i < through ? ' is-up' : ''}`}>
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

const ROUNDS = [
  ['prelim', 'Preliminary round'], ['qualifying', 'Qualifying round'],
];

// A continental tournament: preliminary and qualifying rounds, groups, then the knockouts.
export function Continental({ state, c, name }) {
  if (!c) return <p className="hint">Not played this season.</p>;
  const next = c.nGroups === 1 ? 'top 2 play the final' : 'top 2 go through';
  const shape = c.nGroups === 4 ? '4 groups of 4 → quarter-finals → semi-finals → final' : c.nGroups === 2 ? '2 groups of 4 → semi-finals → final' : 'one group of 4 → final';
  return (
    <div className="bracket">
      <p className="hint">{name} · {c.entrants.length} clubs · {c.prelim ? 'preliminary round → ' : ''}{c.qualifying || c.prelim ? 'qualifying → ' : ''}{shape}.</p>
      {c.winner && <p className="promo is-up">🏆 {name} winner: {clubById(state.world, c.winner).name}</p>}
      {ROUNDS.map(([key, title]) => c[key] && (
        <div key={key}>
          <h4 className="sub-title">{title}</h4>
          {c[key].map((g, i) => <Tie key={i} state={state} game={g} />)}
        </div>
      ))}
      {c.prelim && !c.qualifying && <p className="hint">The qualifying round is drawn after the preliminary round.</p>}
      {c.groups ? c.groups.map((g, i) => <GroupTable key={i} state={state} group={g} name={`Group ${'ABCD'[i]} · ${next}`} />) : (
        <p className="hint">Groups are drawn after the qualifying round. Straight in: {c.direct.map((id) => clubById(state.world, id).short).join(', ')}.</p>
      )}
      {c.quarters && (
        <>
          <h4 className="sub-title">Quarter-finals</h4>
          {c.quarters.map((g, i) => <Tie key={i} state={state} game={g} />)}
        </>
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
    </div>
  );
}

export function ClubWorldCup({ state, cwc }) {
  if (!cwc) return <p className="hint">At the end of the season, the six continental champions meet at a neutral venue: two groups of three (each club plays the other two), then the group winners play the final.</p>;
  return (
    <div className="bracket">
      {cwc.winner && <p className="promo is-up">🏆 Club World Cup winner: {clubById(state.world, cwc.winner).name}</p>}
      {cwc.groups.map((g, i) => (
        <div key={i}>
          <GroupTable state={state} group={g} name={`Group ${'AB'[i]} · the winner plays the final`} through={1} />
          {g.fixtures.flat().map((x, j) => <Tie key={j} state={state} game={x} />)}
        </div>
      ))}
      {cwc.final && (
        <>
          <h4 className="sub-title">Final</h4>
          <Tie state={state} game={cwc.final} />
        </>
      )}
    </div>
  );
}
