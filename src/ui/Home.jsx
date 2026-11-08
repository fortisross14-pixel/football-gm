import React from 'react';
import { Crest } from './Art.jsx';
import { Table } from './League.jsx';
import { teamOverall, RARITIES } from '../engine/cards.js';
import { userFixture, clubById, standings } from '../engine/season.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { effectiveCohesion, seasonSummary, FACILITY_LABEL } from '../state/club.js';
import { PACKS } from '../engine/packs.js';

export default function Home({ state, onPlay, onCloseSeason, onStartSeason, goTo, onReset }) {
  const { season, phase } = state;
  return (
    <div className="screen">
      {phase === 'season' && <NextMatch state={state} onPlay={onPlay} />}
      {phase === 'seasonEnd' && <SeasonEnd state={state} onClose={onCloseSeason} />}
      {phase === 'offseason' && <Offseason state={state} goTo={goTo} onStart={onStartSeason} />}

      <StatusRow state={state} goTo={goTo} />

      <section>
        <div className="section-row">
          <h2 className="section-title">Table</h2>
          <button type="button" className="link-btn" onClick={() => goTo('league')}>Full table ›</button>
        </div>
        <Table state={state} compact />
      </section>

      {state.history.length > 0 && (
        <section>
          <h2 className="section-title">Recent results</h2>
          <ul className="results">
            {state.history.slice(0, 5).map((h, i) => (
              <li key={i}>
                <span className={`res res--${h.outcome}`}>{h.outcome}</span>
                <span className="results__opp">{h.venue === 'H' ? 'vs' : '@'} {h.opponent}</span>
                <span className="results__comp">{h.competition}</span>
                <b>{h.score[0]}–{h.score[1]}</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      {season.year > 1 || season.matchday > 0 ? (
        <button type="button" className="link-btn" onClick={onReset}>Start a new game</button>
      ) : null}
    </div>
  );
}

function NextMatch({ state, onPlay }) {
  const { season } = state;
  const fx = userFixture(season, state.club.id);
  if (!fx) return null;
  const opp = clubById(season, fx.opponentId);
  const starters = state.lineup.map((id) => state.squad.find((c) => c.id === id));
  const pos = standings(season).findIndex((r) => r.id === state.club.id) + 1;
  const us = { name: state.club.name, short: state.club.short, colors: state.club.colors, ovr: teamOverall(starters) };
  const them = { name: opp.name, short: opp.short, colors: opp.colors, ovr: opp.rating };
  const [left, right] = fx.isHome ? [us, them] : [them, us];
  return (
    <section className="next-match">
      <div className="next-match__meta">
        <span>Season {season.year} · Matchday {season.matchday + 1}/14</span>
        {season.matchday > 0 && <span>You're {ordinal(pos)}</span>}
      </div>
      <div className="matchup matchup--hero">
        <Side team={left} />
        <div className="matchup__vs"><span>VS</span><small>{fx.isHome ? 'Home' : 'Away'}</small></div>
        <Side team={right} />
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={onPlay} disabled={!!state.pendingOpen}>
        Play matchday {season.matchday + 1}
      </button>
    </section>
  );
}

function Side({ team }) {
  return (
    <div className="matchup__team">
      <Crest colors={team.colors} short={team.short} size={46} />
      <b>{team.name}</b>
      <span>{team.ovr} OVR</span>
    </div>
  );
}

function SeasonEnd({ state, onClose }) {
  const { position, prize, packs } = seasonSummary(state);
  return (
    <section className={`season-end${position === 1 ? ' is-champion' : ''}`}>
      <span className="season-end__label">Season {state.season.year} complete</span>
      <b className="season-end__pos">{position === 1 ? '🏆 Champions!' : `${ordinal(position)} place`}</b>
      <ul className="season-end__rewards">
        <li><span>Prize money</span><b>◎ {prize}</b></li>
        {packs.map((p, i) => <li key={i}><span>Reward pack</span><b>{PACKS[p].name}</b></li>)}
        <li><span>Off-season card</span><b>1 random</b></li>
      </ul>
      {position === 1 && <p className="hint">Promotion to Division 2 arrives with the full world in the next milestone.</p>}
      <button type="button" className="btn btn--primary btn--block" onClick={onClose}>Collect & open the Transfer Market</button>
    </section>
  );
}

function Offseason({ state, goTo, onStart }) {
  const ev = state.activeEvent;
  return (
    <section className="offseason">
      <span className="season-end__label">Off-season</span>
      <b className="offseason__title">Transfer Market is open</b>
      <p className="hint">Buy off-season cards, then play them from Cards → Items: extend careers, poach rivals' players, upgrade the club and pick a season event.</p>
      <div className="offseason__facilities">
        {Object.entries(state.facilities).map(([k, lvl]) => (
          <span key={k}><b>L{lvl}</b>{FACILITY_LABEL[k]}</span>
        ))}
      </div>
      {ev ? (
        <p className="hint hint--accent">Next season's event: {OFFSEASON_CARDS[ev.type].name} ({RARITIES[ev.rarity].label}): {cardText(ev.type, ev.rarity)}</p>
      ) : <p className="hint">No season event picked yet.</p>}
      <div className="cta-row">
        <button type="button" className="btn btn--ghost" onClick={() => goTo('shop')}>Market</button>
        <button type="button" className="btn btn--ghost" onClick={() => goTo('cards')}>My cards</button>
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={onStart} disabled={!!state.pendingOpen}>
        Start season {state.season.year + 1}
      </button>
    </section>
  );
}

function StatusRow({ state, goTo }) {
  const packs = state.inventory.packs.length;
  return (
    <div className="status-row">
      <div className="status">
        <span>Cohesion</span>
        <b>{effectiveCohesion(state)}%</b>
        <div className="bar"><i style={{ width: `${effectiveCohesion(state)}%` }} /></div>
      </div>
      <div className="status">
        <span>Record</span>
        <b>{state.record.w}-{state.record.d}-{state.record.l}</b>
        <small>{state.record.gf}–{state.record.ga} goals</small>
      </div>
      <button type="button" className={`status${packs ? ' status--alert' : ''}`} onClick={() => goTo('cards')}>
        <span>Packs</span>
        <b>{packs}</b>
        <small>{packs ? 'Tap to open' : 'Buy in shop'}</small>
      </button>
    </div>
  );
}

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;

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
