import React, { useMemo, useState } from 'react';
import { competitionHistory } from '../engine/titles.js';
import { FIRST_YEAR } from '../engine/years.js';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';

const SHOWN = 30;

function Winner({ state, id, name }) {
  const c = id && state.world.clubs[id];
  if (!c) return <span className="muted-name">{name || '—'}</span>;
  return (
    <ClubLink id={id} className="club-inline">
      <Crest colors={c.colors} short={c.short} id={id} size={16} /> <span>{c.name}</span>
    </ClubLink>
  );
}

// A competition's winners by year, real life up to 2026 then the game from 2027, and the
// most titles. gameKey: 'L:esp-1', 'C:ESP', 'K:europe', 'W'…
export default function CompHistory({ state, gameKey, mostTitles = true }) {
  const [all, setAll] = useState(false);
  const h = useMemo(() => competitionHistory(state.archive, gameKey), [state.archive, gameKey]);
  const rows = useMemo(() => [
    ...[...h.game].reverse().map((g) => ({ year: g.year, game: true, winners: [{ id: g.winner }], runnerUp: g.runnerUp })),
    ...[...h.real].reverse().map((r) => ({ year: r.year, game: false, winners: r.winners })),
  ], [h]);
  if (!rows.length) return <p className="hint">Winners appear here after each season.</p>;
  const shown = all ? rows : rows.slice(0, SHOWN);
  const firstReal = shown.findIndex((r) => !r.game);
  const me = state.club.id;
  return (
    <div className="comp-history">
      {mostTitles && h.most.length > 0 && (
        <section>
          <h3 className="sub-title">Most titles</h3>
          <ol className="scorer-list">
            {h.most.slice(0, 10).map((m, i) => (
              <li key={m.id || m.name} className={m.id === me ? 'is-user' : ''}>
                <span className="scorer-list__pos">{i + 1}</span>
                <span className="scorer-list__name"><Winner state={state} id={m.id} name={m.name} /><em> · last {m.last}</em></span>
                <b>{m.n}</b>
              </li>
            ))}
          </ol>
        </section>
      )}
      <section>
        <h3 className="sub-title">Winners by year</h3>
        <div className="scroll-x">
          <table className="table table--history table--narrow comp-history__table">
            <thead><tr><th>Year</th><th className="table__club">Winner</th><th className="table__club">Runner-up</th></tr></thead>
            <tbody>
              {shown.map((r, i) => (
                <React.Fragment key={`${r.year}-${r.game}`}>
                  {i === firstReal && (
                    <tr className="comp-history__divider"><td colSpan={3}>{firstReal > 0 ? `▲ In the game since ${FIRST_YEAR} · ▼ Real life` : `Real life · the game starts in ${FIRST_YEAR}`}</td></tr>
                  )}
                  <tr className={`${r.game ? 'is-game' : 'is-real'}${r.winners.some((w) => w.id === me) ? ' is-user' : ''}`}>
                    <td>{r.year}</td>
                    <td className="table__club">
                      {r.winners.map((w, j) => <React.Fragment key={j}>{j > 0 && <span className="muted"> · </span>}<Winner state={state} id={w.id} name={w.name} /></React.Fragment>)}
                    </td>
                    <td className="table__club">{r.runnerUp ? <Winner state={state} id={r.runnerUp} /> : <span className="muted">—</span>}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > SHOWN && (
          <button type="button" className="btn btn--small btn--ghost" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${rows.length} years`}</button>
        )}
        <p className="hint">
          {h.real.length ? `Real-life winners from ${h.real[0].year}${h.note ? ` (${h.note})` : ''}; ` : 'No real-life history for this competition; '}
          in-game winners from {FIRST_YEAR}. Clubs outside the game are shown by name.
        </p>
      </section>
    </div>
  );
}
