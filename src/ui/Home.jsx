import React from 'react';
import { OPPONENTS } from '../data/demo.js';
import { Crest } from './Art.jsx';
import { teamOverall } from '../engine/cards.js';

export default function Home({ state, setup, setSetup, onKickoff, onSquad, onReset }) {
  const { record, history } = state;
  const starters = state.lineup.map((id) => state.squad.find((c) => c.id === id));
  const played = record.w + record.d + record.l;
  return (
    <div className="screen">
      <section className="panel record">
        <div><b>{record.w}</b><span>Won</span></div>
        <div><b>{record.d}</b><span>Drawn</span></div>
        <div><b>{record.l}</b><span>Lost</span></div>
        <div><b>{record.gf}–{record.ga}</b><span>Goals</span></div>
        <div><b>{teamOverall(starters)}</b><span>Team OVR</span></div>
      </section>

      <section>
        <h2 className="section-title">Next match</h2>
        <p className="hint">Friendly test match. Pick an opponent and how it's played.</p>
        <div className="opp-list">
          {OPPONENTS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`opp${setup.opponentId === o.id ? ' is-selected' : ''}`}
              onClick={() => setSetup({ ...setup, opponentId: o.id })}
            >
              <Crest colors={o.colors} short={o.short} size={34} />
              <div className="opp__body">
                <div className="opp__name">{o.name}</div>
                <div className="opp__meta">{o.division} · {o.formation}</div>
              </div>
              <div className="opp__side">
                <span className={`diff diff--${o.level}`}>{o.difficulty}</span>
                <span className="opp__ovr">{o.rating} <small>OVR</small></span>
              </div>
            </button>
          ))}
        </div>

        <div className="toggles">
          <Segmented
            label="Competition"
            value={setup.knockout ? 'cup' : 'league'}
            options={[{ id: 'league', label: 'League' }, { id: 'cup', label: 'Cup · knockout' }]}
            onChange={(v) => setSetup({ ...setup, knockout: v === 'cup' })}
          />
          <Segmented
            label="Venue"
            value={setup.home ? 'home' : 'away'}
            options={[{ id: 'home', label: 'Home' }, { id: 'away', label: 'Away' }]}
            onChange={(v) => setSetup({ ...setup, home: v === 'home' })}
          />
        </div>

        <div className="cta-row">
          <button type="button" className="btn btn--ghost" onClick={onSquad}>Squad</button>
          <button type="button" className="btn btn--primary" onClick={onKickoff}>Choose boosts ›</button>
        </div>
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="section-title">Recent results</h2>
          <ul className="results">
            {history.slice(0, 6).map((h, i) => (
              <li key={i}>
                <span className={`res res--${h.outcome}`}>{h.outcome}</span>
                <span className="results__opp">{h.venue === 'H' ? 'vs' : '@'} {h.opponent}</span>
                <span className="results__comp">{h.competition}</span>
                <b>{h.score[0]}–{h.score[1]}{h.shootout ? ` (${h.shootout[0]}–${h.shootout[1]} p)` : ''}</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      {played > 0 && (
        <button type="button" className="link-btn" onClick={onReset}>Reset demo club</button>
      )}
    </div>
  );
}

export function Segmented({ label, value, options, onChange, small }) {
  return (
    <div className={`segmented${small ? ' segmented--small' : ''}`} role="group" aria-label={label}>
      {label && !small && <span className="segmented__label">{label}</span>}
      <div className="segmented__opts">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={value === o.id ? 'is-on' : ''}
            onClick={() => onChange(o.id)}
            disabled={o.disabled}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
