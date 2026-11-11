import React from 'react';
import { STADIUM_PARTS, PART_IDS, partEffect, TICKET_PRICES } from '../data/facilities.js';
import { OFFSEASON_CARDS } from '../data/offseason.js';
import { stadiumOf, starsOf, matchdayOf } from '../state/stadium.js';
import { fansOf, happinessLine, formatFans } from '../state/fans.js';
import { constructionOf, constructionProgress } from '../state/business.js';

const n = (v) => Math.round(v).toLocaleString('en');

// Star rating with half stars, for screen readers as "3.5 of 5 stars".
export function Stars({ value, size = 18 }) {
  return (
    <span className="stars" role="img" aria-label={`${value} of 5 stars`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={value >= i ? 'on' : value >= i - 0.5 ? 'half' : ''} aria-hidden="true">★</i>
      ))}
    </span>
  );
}

// A drawn stadium: stands grow with capacity, floodlight towers with lighting, the screen
// appears with the scoreboard part, the pitch gets greener, roads and parking with access.
function StadiumArt({ parts, color }) {
  const seats = parts.seats || 0;
  const tiers = 1 + Math.floor(seats / 2); // 1–3 rings of stands
  const lights = parts.lighting || 0;
  const pitch = ['#7a8a4a', '#6f9a43', '#4f9a3a', '#3b9a3a', '#2f9e44', '#22a447'][parts.pitch || 0];
  const towers = lights === 0 ? [] : lights < 3 ? [[18, 18], [182, 82]] : [[18, 18], [182, 18], [18, 82], [182, 82]];
  return (
    <svg className="stadium-art" viewBox="0 0 200 100" role="img" aria-label="Your stadium">
      {(parts.access || 0) > 0 && <rect x="0" y="92" width="200" height="8" fill="var(--grey)" />}
      {Array.from({ length: Math.min(5, parts.access || 0) * 3 }, (_, i) => (
        <rect key={i} x={6 + i * 13} y="94" width="8" height="4" rx="1" fill={['#c33', '#36c', '#fc3', '#ddd'][i % 4]} />
      ))}
      {Array.from({ length: tiers }, (_, i) => {
        const pad = 8 + (tiers - 1 - i) * 7;
        return <rect key={i} x={pad} y={pad * 0.55 + 4} width={200 - pad * 2} height={92 - pad * 1.1 - 4} rx={18 - i * 3} fill={color} opacity={0.55 + i * 0.15} stroke="var(--ink)" strokeWidth="1" />;
      })}
      <rect x="44" y="26" width="112" height="48" rx="3" fill={pitch} stroke="#fff" strokeWidth="1" />
      <line x1="100" y1="26" x2="100" y2="74" stroke="#fff" strokeWidth="1" />
      <circle cx="100" cy="50" r="7" fill="none" stroke="#fff" strokeWidth="1" />
      {(parts.screens || 0) > 0 && <rect x="84" y="6" width={20 + parts.screens * 3} height="9" fill="var(--ink)" stroke="var(--yellow)" strokeWidth="1" />}
      {towers.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y + 10} stroke="var(--ink)" strokeWidth="1.5" />
          <rect x={x - 4} y={y - 4} width="8" height="4" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
}

function PartRow({ state, id }) {
  const s = stadiumOf(state);
  const lvl = s.parts[id] || 0;
  const p = constructionOf(state, 'stadium', id);
  const def = STADIUM_PARTS[id];
  return (
    <li className={`part${p ? ' part--building' : ''}`}>
      <span className="part__icon" aria-hidden="true">{def.icon}</span>
      <span className="part__body">
        <b>{def.label}</b>
        <span>{partEffect(id, lvl, { size: s.size })}{p ? ` → L${p.to}: ${partEffect(id, p.to, { size: s.size })}` : lvl < 5 ? '' : ' · max'}</span>
        {p && <span className="part__build"><i style={{ width: `${Math.round(constructionProgress(p) * 100)}%` }} /></span>}
        <small>Card: {OFFSEASON_CARDS[def.card].name}{p ? ` · building, ${p.summer ? 'ready for matchday 1' : `${p.left} matchday${p.left > 1 ? 's' : ''} left`}` : ''}</small>
      </span>
      <span className="facility__dots" aria-label={`Level ${lvl} of 5${p ? `, building level ${p.to}` : ''}`}>
        {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= lvl ? 'on' : p && i <= p.to ? 'soon' : ''} />)}
      </span>
    </li>
  );
}

// Club → Infrastructure: the stadium card.
export function StadiumCard({ state }) {
  const s = stadiumOf(state);
  const stars = starsOf(state);
  const day = matchdayOf(state);
  const name = state.world?.clubs?.[state.club.id]?.stadium || 'Stadium';
  return (
    <section className="panel stadium">
      <div className="stadium__head">
        <div>
          <h2 className="section-title">{name}</h2>
          <Stars value={stars} size={20} />
        </div>
        <div className="stadium__cap"><b>{n(day.capacity)}</b><span>seats</span></div>
      </div>
      <StadiumArt parts={s.parts} color={state.club.colors?.[0] || 'var(--blue)'} />
      <p className="hint">
        {stars} stars from six parts plus hospitality (capacity counts double). More stars, more coins per fan; five stars needs everything at level 5.
        {' '}Next home game: {n(day.demand)} want tickets, {day.soldOut ? <b>sold out</b> : `${n(day.attendance)} come (${Math.round(day.fill * 100)}%)`}.
      </p>
      <ul className="parts">
        {PART_IDS.map((id) => <PartRow key={id} state={state} id={id} />)}
      </ul>
      <p className="hint">Stadium Evolution cards build the weakest part; the part cards (New Stand, Floodlights…) build their own. One project per part at a time.</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Club → Fans

const trendText = (v) => (v === 0 ? 'no change this season' : `${v > 0 ? '+' : ''}${v}% this season`);

export function FansPanel({ state }) {
  const f = fansOf(state);
  const day = matchdayOf(state);
  const ticket = TICKET_PRICES[state.ticketPrice] || TICKET_PRICES.normal;
  const recent = f.games.slice(0, 9);
  const maxCap = Math.max(1, ...recent.map((g) => g.capacity));
  const h = f.happiness;
  return (
    <>
      <section className="panel">
        <h2 className="section-title">Fan base</h2>
        <div className="money-totals money-totals--two">
          <div><span>Local fans</span><b>{formatFans(f.local)}</b><small className={f.trend.local >= 0 ? 'is-up' : 'is-down'}>{trendText(f.trend.local)}</small></div>
          <div><span>Worldwide</span><b>{formatFans(f.global)}</b><small className={f.trend.global >= 0 ? 'is-up' : 'is-down'}>{trendText(f.trend.global)}</small></div>
        </div>
        <p className="hint">Local fans buy the tickets: more of them, more demand at the gate. Fans worldwide watch on TV and buy shirts abroad.</p>
      </section>

      <section className="panel">
        <h2 className="section-title">Happiness</h2>
        <div className="happy" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(h)} aria-label="Fan happiness">
          <i style={{ width: `${Math.max(2, Math.min(100, h))}%` }} className={h >= 55 ? 'is-good' : h >= 40 ? 'is-mid' : 'is-bad'} />
          <b>{Math.round(h)}</b>
        </div>
        <p className="happy__line">{happinessLine(h)}.</p>
        <p className="hint">Happiness is the fans' confidence in you (35% of job security). Happy fans buy more tickets: demand ×{(0.6 + (0.4 * h) / 55).toFixed(2)} right now.</p>
      </section>

      <section className="panel">
        <h2 className="section-title">Attendance</h2>
        <p className="hint">
          Tickets {ticket.label.toLowerCase()} · next home game {n(day.demand)} want tickets for {n(day.capacity)} seats{day.soldOut ? ': sold out' : ''}.
          {f.soldOutRun > 1 ? ` ${f.soldOutRun} sell-outs in a row.` : ''}
        </p>
        {recent.length === 0 ? <p className="hint">Home crowds show up here after each home game.</p> : (
          <ul className="crowd">
            {recent.map((g, i) => (
              <li key={i}>
                <span className="crowd__who">{g.md || ''} · {g.opponent}</span>
                <span className="crowd__bar"><i style={{ width: `${(g.capacity / maxCap) * 100}%` }}><em style={{ width: `${(g.attendance / g.capacity) * 100}%` }} className={g.soldOut ? 'is-full' : ''} /></i></span>
                <b>{n(g.attendance)}{g.soldOut ? ' ✓' : ''}</b>
              </li>
            ))}
          </ul>
        )}
        {f.history.length > 0 && (
          <table className="table fin-history">
            <thead><tr><th>Season</th><th className="num">Crowd</th><th className="num">Full</th><th className="num">Local</th><th className="num">World</th></tr></thead>
            <tbody>
              {[...f.history].reverse().map((e) => (
                <tr key={e.year}>
                  <td>{e.year}</td>
                  <td className="num">{n(e.avgAttendance)}</td>
                  <td className="num">{e.soldOut}/{e.homeGames}</td>
                  <td className="num">{formatFans(e.local)} <small className={e.localChange >= 0 ? 'is-up' : 'is-down'}>{e.localChange >= 0 ? '+' : ''}{e.localChange}%</small></td>
                  <td className="num">{formatFans(e.global)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">What moves them</h2>
        <ul className="champions">
          <li><span>Wins, derbies, trophies, promotion</span><b className="is-up">More fans, happier</b></li>
          <li><span>Stars on the pitch (popularity)</span><b className="is-up">More fans worldwide</b></li>
          <li><span>Defeats, relegation, a missed objective</span><b className="is-down">Fewer, unhappier</b></li>
          <li><span>High prices after a draw or defeat</span><b className="is-down">Happiness −0.8 / −1.5</b></li>
          <li><span>Low prices · big screens</span><b className="is-up">Happiness up every home game</b></li>
          <li><span>Fan cards: Local Event, Social Media, Fan Day, Stadium Tour, International Tour</span><b className="is-up">Club packs</b></li>
        </ul>
      </section>
    </>
  );
}
