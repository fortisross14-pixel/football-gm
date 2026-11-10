import React from 'react';
import { Crest } from './Art.jsx';
import { clubVars } from './clubTheme.js';
import { Table } from './League.jsx';
import { teamOverall, RARITIES } from '../engine/cards.js';
import { clubById, standings } from '../engine/season.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { effectiveCohesion, cohesionBonus, teamShape, shapeLabel, seasonSummary, FACILITY_LABEL, academyInfo, nextUserGame } from '../state/club.js';
import { PACKS } from '../engine/packs.js';
import { ClubLink, LeagueLink, CompLink } from './nav.jsx';
import { compOfGame } from './Competitions.jsx';
import { Confidence } from './Career.jsx';
import { opinions, ownerLine, fanLine, unreadCount } from '../state/chronicle.js';
import { isDerby, derbyName } from '../data/rivals.js';

export default function Home({ state, onPlay, onCloseSeason, onStartSeason, goTo }) {
  const { season, phase } = state;
  return (
    <div className="screen screen--home">
      <div className="home__main">
      {phase === 'season' && <DerbyAlert state={state} />}
      {phase === 'season' && <NextMatch state={state} onPlay={onPlay} />}
      {phase === 'seasonEnd' && <SeasonEnd state={state} onClose={onCloseSeason} />}
      {phase === 'offseason' && <Offseason state={state} goTo={goTo} onStart={onStartSeason} />}

      <Opinions state={state} goTo={goTo} />
      <StatusRow state={state} goTo={goTo} />
      <div className="cta-row cta-row--tight">
        <button type="button" className="btn btn--ghost" onClick={() => goTo('club')}>Finances &amp; trophies ›</button>
        <button type="button" className={`btn btn--ghost${unreadCount(state) ? ' has-badge' : ''}`} onClick={() => goTo('career')}>Career{unreadCount(state) ? ` · ✉ ${unreadCount(state)}` : ''} ›</button>
      </div>
      </div>

      <div className="home__side">
      <section>
        <div className="section-row">
          <h2 className="section-title"><LeagueLink divId={state.club.divisionId}>{state.club.division}</LeagueLink></h2>
          <LeagueLink divId={state.club.divisionId} className="link-btn">Full table ›</LeagueLink>
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
                <span className="results__opp">{h.venue === 'H' ? 'vs' : '@'} <ClubLink id={h.opponentId}>{h.opponent}</ClubLink>{h.derby ? ' 🔥' : ''}</span>
                <span className="results__comp">{h.comp ? <CompLink comp={h.comp}>{h.competition}</CompLink> : h.competition}</span>
                <b>{h.score[0]}–{h.score[1]}</b>
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
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
  const us = { id: state.club.id, name: state.club.name, short: state.club.short, colors: state.club.colors, ovr: teamOverall(starters) };
  const them = { id: opp.id, name: opp.name, short: opp.short, colors: opp.colors, ovr: Math.round(opp.strength) };
  const userFirst = game.homeId === state.club.id;
  const [left, right] = userFirst ? [us, them] : [them, us];
  const venue = game.neutral ? 'Neutral' : game.isHome ? 'Home' : 'Away';
  const cupGame = game.competition !== 'league';
  return (
    <section className={`next-match${cupGame ? ` next-match--${game.competition}` : ''}`}>
      <div className="next-match__meta">
        <span>Season {season.year} · {cupGame ? <CompLink comp={compOfGame(state, game)}>{game.label}</CompLink> : <><LeagueLink divId={state.club.divisionId}>{state.club.division}</LeagueLink> · {game.label}</>}</span>
        {season.matchday > 0 && !cupGame && <span>You're {ordinal(pos)}</span>}
      </div>
      {state.gm?.objective && (
        <div className={`objective-bar${season.matchday > 0 && pos > state.gm.objective.target ? ' is-behind' : ''}`}>
          <span>Board: {state.gm.objective.text}</span>
          <span>Rep {state.gm.reputation}</span>
        </div>
      )}
      <Confidence state={state} compact />
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
    <div className="matchup__team" style={clubVars(team)}>
      <Crest colors={team.colors} short={team.short} size={46} id={team.id} />
      <ClubLink id={team.id}><b>{team.name}</b></ClubLink>
      <span>{team.ovr} OVR</span>
    </div>
  );
}

function SeasonEnd({ state, onClose }) {
  const { position, prize, packs, promoted, relegated, upper, lower } = seasonSummary(state);
  return (
    <section className={`season-end${position === 1 ? ' is-champion' : ''}`}>
      {(position === 1 || promoted) && <Confetti colors={[state.club.colors.primary, state.club.colors.secondary, '#f2b52f']} />}
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
      {state.awards?.length > 0 && (() => {
        const y = state.awards[state.awards.length - 1];
        return (
          <button type="button" className="career-link" onClick={() => goTo('world')}>
            <span>🏅 Season {y.year} awards · Best Player {y.best?.name || '—'} · Top Scorer {y.scorer?.name || '—'} ({y.scorer?.goals || 0}) · Best GK {y.gk?.name || '—'} · Young {y.young?.name || '—'}</span>
            <b>Awards ›</b>
          </button>
        );
      })()}
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
      <button type="button" className="status" onClick={() => goTo('squad')}>
        <span>Cohesion</span>
        <b>{effectiveCohesion(state)}%</b>
        <div className="bar"><i style={{ width: `${effectiveCohesion(state)}%` }} /></div>
        <small>+{(cohesionBonus(state) * 100).toFixed(1)}% stats</small>
      </button>
      <button type="button" className={`status status--shape is-${shapeLabel(teamShape(state)).toLowerCase()}`} onClick={() => goTo('squad')}>
        <span>Shape</span>
        <b>{teamShape(state)}%</b>
        <div className="bar"><i style={{ width: `${teamShape(state)}%` }} /></div>
        <small>{shapeLabel(teamShape(state))}</small>
      </button>
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

// Club-colour confetti for titles and promotions (a short burst, then it rests).
function Confetti({ colors }) {
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    x: `${(i * 37) % 100}%`, c: colors[i % colors.length], rot: `${(i % 2 ? 1 : -1) * (180 + i * 23)}deg`,
    dur: `${1.6 + (i % 5) * 0.25}s`, delay: `${(i % 7) * 0.08}s`,
  }));
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => <i key={i} style={{ '--x': p.x, '--c': p.c, '--rot': p.rot, '--dur': p.dur, '--delay': p.delay }} />)}
    </div>
  );
}

// Club colours for the broadcast fixture blocks: see clubTheme.js.
export { clubVars };

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

// "NEXT GAME IS A RIVALRY GAME!" — something big is coming.
export function DerbyAlert({ state, compact }) {
  const game = nextUserGame(state);
  if (!game || !isDerby(state.club.id, game.opponentId)) return null;
  const opp = clubById(state.world, game.opponentId);
  const past = (state.history || []).filter((h) => h.opponentId === game.opponentId || h.opponent === opp.name);
  const rec = { W: 0, D: 0, L: 0 };
  for (const h of past) rec[h.outcome] += 1;
  return (
    <section className={`derby-alert${compact ? ' derby-alert--compact' : ''}`} role="status">
      <span className="derby-alert__flash">Rivalry game</span>
      <b className="derby-alert__title">{compact ? `${derbyName(state.club.id, opp.id)}` : 'Next game is a rivalry game!'}</b>
      {!compact && <span className="derby-alert__name">{derbyName(state.club.id, opp.id)} · {state.club.short} vs {opp.short}</span>}
      <span className="derby-alert__meta">Double gate and prize money · fans feel it twice as much{past.length ? ` · your record: ${rec.W}W ${rec.D}D ${rec.L}L` : ''}</span>
    </section>
  );
}

// What the owners and fans think, in a sentence each.
function Opinions({ state, goTo }) {
  if (!state.gm) return null;
  const op = opinions(state);
  return (
    <button type="button" className="opinions opinions--home" onClick={() => goTo('career')}>
      <span className="opinion"><span className="opinion__who">Owners · {op.owners.value}</span><span>{ownerLine(op.owners)}</span></span>
      <span className="opinion"><span className="opinion__who">Fans · {op.fans.value}</span><span>{fanLine(op.fans)}</span></span>
    </button>
  );
}
