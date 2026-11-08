import React from 'react';
import { Crest } from './Art.jsx';
import { Table } from './League.jsx';
import { teamOverall, RARITIES } from '../engine/cards.js';
import { clubById, standings } from '../engine/season.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { effectiveCohesion, seasonSummary, FACILITY_LABEL, academyInfo, nextUserGame } from '../state/club.js';
import { PACKS } from '../engine/packs.js';

export default function Home({ state, onPlay, onCloseSeason, onStartSeason, goTo }) {
  const { season, phase } = state;
  return (
    <div className="screen">
      {phase === 'season' && <NextMatch state={state} onPlay={onPlay} />}
      {phase === 'seasonEnd' && <SeasonEnd state={state} onClose={onCloseSeason} />}
      {phase === 'offseason' && <Offseason state={state} goTo={goTo} onStart={onStartSeason} />}

      <StatusRow state={state} goTo={goTo} />
      <div className="cta-row cta-row--tight">
        <button type="button" className="btn btn--ghost" onClick={() => goTo('club')}>Club ›</button>
        <button type="button" className="btn btn--ghost" onClick={() => goTo('career')}>Career ›</button>
      </div>

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

    </div>
  );
}

function NextMatch({ state, onPlay }) {
  const { season } = state;
  const game = nextUserGame(state);
  if (!game) return null;
  const opp = clubById(state.world, game.opponentId);
  const starters = state.lineup.map((id) => state.squad.find((c) => c.id === id));
  const pos = standings(season, state.club.divisionId).findIndex((r) => r.id === state.club.id) + 1;
  const us = { name: state.club.name, short: state.club.short, colors: state.club.colors, ovr: teamOverall(starters) };
  const them = { name: opp.name, short: opp.short, colors: opp.colors, ovr: Math.round(opp.strength) };
  const userFirst = game.homeId === state.club.id;
  const [left, right] = userFirst ? [us, them] : [them, us];
  const venue = game.neutral ? 'Neutral' : game.isHome ? 'Home' : 'Away';
  const cupGame = game.competition !== 'league';
  return (
    <section className={`next-match${cupGame ? ` next-match--${game.competition}` : ''}`}>
      <div className="next-match__meta">
        <span>Season {season.year} · {game.label}</span>
        {season.matchday > 0 && !cupGame && <span>You're {ordinal(pos)}</span>}
      </div>
      {state.gm?.objective && (
        <div className={`objective-bar${season.matchday > 0 && pos > state.gm.objective.target ? ' is-behind' : ''}`}>
          <span>Board: {state.gm.objective.text}</span>
          <span>Rep {state.gm.reputation}</span>
        </div>
      )}
      <div className="matchup matchup--hero">
        <Side team={left} />
        <div className="matchup__vs"><span>VS</span><small>{venue}{game.knockout ? ' · KO' : ''}</small></div>
        <Side team={right} />
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={onPlay} disabled={!!state.pendingOpen}>
        {cupGame ? `Play: ${game.label.split(' · ')[1] || game.label}` : `Play matchday ${season.matchday + 1}`}
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
  const { position, prize, packs, promoted, relegated, upper, lower } = seasonSummary(state);
  return (
    <section className={`season-end${position === 1 ? ' is-champion' : ''}`}>
      <span className="season-end__label">Season {state.season.year} complete</span>
      <b className="season-end__pos">{position === 1 ? '🏆 Champions!' : `${ordinal(position)} place`}</b>
      {(state.season.userTrophies || []).length > 0 && (
        <p className="promo is-up">🏆 Also won: {state.season.userTrophies.join(', ')}</p>
      )}
      <ul className="season-end__rewards">
        <li><span>Prize money</span><b>◎ {prize}</b></li>
        {packs.map((p, i) => <li key={i}><span>Reward pack</span><b>{PACKS[p].name}</b></li>)}
        <li><span>Off-season card</span><b>1 random</b></li>
      </ul>
      {promoted && <p className="promo is-up">▲ Promoted to {upper.name}! Bigger crowds, bigger prizes (×{upper.level === 1 ? 3 : 2} rewards) and tougher rivals.</p>}
      {relegated && <p className="promo is-down">▼ Relegated to {lower.name}. Time to rebuild.</p>}
      <button type="button" className="btn btn--primary btn--block" onClick={onClose}>Collect & open the Transfer Market</button>
    </section>
  );
}

function Offseason({ state, goTo, onStart }) {
  const ev = state.activeEvent;
  const move = state.lastSeason?.userMove?.clubId === state.club.id ? state.lastSeason.userMove : null;
  return (
    <section className="offseason">
      <span className="season-end__label">Off-season · next: {state.club.division}</span>
      {state.gm?.sacked && <p className="promo is-down">You've been sacked. Choose a new club to continue.</p>}
      {state.gm?.review && (
        <button type="button" className="career-link" onClick={() => goTo('career')}>
          <span>{state.gm.review.verdict === 'missed' ? '✗' : '✓'} Board review: {state.gm.review.verdict} · reputation {state.gm.review.before} → {state.gm.review.after}</span>
          <b>{state.gm.offers.length ? `${state.gm.offers.length} job offer${state.gm.offers.length > 1 ? 's' : ''} ›` : 'Career ›'}</b>
        </button>
      )}
      {move && <p className={`promo ${move.type === 'promoted' ? 'is-up' : 'is-down'}`}>{move.type === 'promoted' ? '▲ Promoted' : '▼ Relegated'} to {state.club.division}</p>}
      <b className="offseason__title">Transfer Market is open</b>
      <p className="hint">Buy off-season cards, then play them from Cards → Items: sign players, extend careers, upgrade the club and pick a season event.</p>
      <div className="offseason__facilities">
        {Object.entries(state.facilities).map(([k, lvl]) => (
          <span key={k}><b>L{lvl}</b>{FACILITY_LABEL[k]}</span>
        ))}
      </div>
      <p className="hint">Youth academy L{state.facilities.academy}: {academyInfo(state.facilities.academy).count} player(s) a year, up to {RARITIES[academyInfo(state.facilities.academy).best].label}. Club legends come first.</p>
      {ev ? (
        <p className="hint hint--accent">Next season's event: {OFFSEASON_CARDS[ev.type].name} ({RARITIES[ev.rarity].label}): {cardText(ev.type, ev.rarity)}</p>
      ) : <p className="hint">No season event picked yet.</p>}
      <div className="cta-row">
        <button type="button" className="btn btn--ghost" onClick={() => goTo('shop')}>Market</button>
        <button type="button" className="btn btn--ghost" onClick={() => goTo('cards')}>My cards</button>
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={onStart} disabled={!!state.pendingOpen || state.gm?.sacked}>
        {state.gm?.sacked ? 'Take a new job first' : `Start season ${state.season.year + 1}`}
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
