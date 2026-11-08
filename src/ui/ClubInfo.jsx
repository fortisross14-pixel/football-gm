import React from 'react';
import { RARITIES } from '../engine/cards.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { effectiveCohesion, squadPopularity, cardPopularity, FACILITY_LABEL, academyInfo, seasonMods } from '../state/club.js';
import { Crest } from './Art.jsx';
import { clubVars } from './clubTheme.js';

const FACILITY_EFFECT = {
  stadium: (l) => `Home gate ${[40, 70, 110, 160, 230, 320][l]} coins × division multiplier`,
  merch: (l) => `Popularity × ${[0.5, 1, 1.5, 2, 2.5, 3][l]} × 2 coins per match`,
  training: (l) => `Cohesion +${[4, 6, 8, 10, 12, 14][l]} per match, up to +${[4, 5, 6, 7, 8, 10][l]}% all stats`,
  academy: (l) => {
    const a = academyInfo(l);
    return `${a.count} academy player${a.count > 1 ? 's' : ''} a year, up to ${RARITIES[a.best].label}`;
  },
};

export default function ClubInfo({ state, onBack }) {
  const fin = state.finance || { income: {}, spent: {} };
  const income = Object.entries(fin.income).sort((a, b) => b[1] - a[1]);
  const spent = Object.entries(fin.spent).sort((a, b) => b[1] - a[1]);
  const totalIn = income.reduce((s, [, v]) => s + v, 0);
  const totalOut = spent.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(1, ...income.map(([, v]) => v), ...spent.map(([, v]) => v));
  const popular = [...state.squad].sort((a, b) => cardPopularity(b) - cardPopularity(a)).slice(0, 3);
  const mods = seasonMods(state);
  const ev = state.activeEvent;

  return (
    <div className="screen">
      <div className="club-head" style={clubVars(state.club)}>
        <Crest colors={state.club.colors} short={state.club.short} size={56} id={state.club.id} />
        <div>
          <b>{state.club.name}</b>
          <span>{state.club.division} · Season {state.season.year}</span>
        </div>
        <i className="club-stripes" aria-hidden="true" />
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>

      <section className="panel">
        <h2 className="section-title">Season finances</h2>
        <div className="money-totals">
          <div><span>In</span><b className="is-up">◎ {totalIn}</b></div>
          <div><span>Out</span><b className="is-down">◎ {totalOut}</b></div>
          <div><span>Balance</span><b>◎ {state.coins}</b></div>
        </div>
        {income.length === 0 && spent.length === 0 && <p className="hint">Nothing yet this season.</p>}
        <ul className="money">
          {income.map(([k, v]) => <MoneyRow key={k} label={k} value={v} max={max} kind="in" />)}
          {spent.map(([k, v]) => <MoneyRow key={k} label={k} value={v} max={max} kind="out" />)}
        </ul>
      </section>

      <section>
        <h2 className="section-title">Facilities</h2>
        <p className="hint">Upgrade them with Club cards from the off-season Transfer Market. Card rarity sets the highest level it can reach.</p>
        <div className="facilities">
          {Object.entries(state.facilities).map(([k, lvl]) => (
            <div key={k} className="facility">
              <div className="facility__head">
                <b>{FACILITY_LABEL[k]}</b>
                <span className="facility__dots">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= lvl ? 'on' : ''} />)}</span>
              </div>
              <span className="facility__now">L{lvl}: {FACILITY_EFFECT[k](lvl)}</span>
              {lvl < 5 && <span className="facility__next">Next, L{lvl + 1}: {FACILITY_EFFECT[k](lvl + 1)}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Squad</h2>
        <div className="money-totals">
          <div><span>Cohesion</span><b>{effectiveCohesion(state)}%</b></div>
          <div><span>Stat bonus</span><b>+{(mods.all * 100).toFixed(1)}%</b></div>
          <div><span>Popularity</span><b>{squadPopularity(state).toFixed(1)}</b></div>
        </div>
        <p className="hint">Cohesion grows every match and drops 10 for each new starter. Popularity grows with goals, man-of-the-match awards and trophies, and sells shirts.</p>
        <ul className="champions">
          {popular.map((c) => <li key={c.id}><span>{c.name}</span><b>{cardPopularity(c)} ★</b></li>)}
        </ul>
      </section>

      <section className="panel">
        <h2 className="section-title">Season event</h2>
        {ev ? (
          <p><b>{OFFSEASON_CARDS[ev.type].name}</b> ({RARITIES[ev.rarity].label}): {cardText(ev.type, ev.rarity)}</p>
        ) : <p className="hint">None this season. Pick one in the off-season.</p>}
      </section>

      <section>
        <h2 className="section-title">Trophy cabinet</h2>
        {state.trophies.filter((t) => t.position === 1).length === 0 ? (
          <p className="hint">Empty, for now. League titles, cups, continental cups and the Club World Cup will live here.</p>
        ) : (
          <ul className="trophies">
            {state.trophies.filter((t) => t.position === 1).map((t, i) => (
              <li key={i}><span className="trophies__cup">🏆</span><b>{t.competition}</b><span>Season {t.season}</span></li>
            ))}
          </ul>
        )}
        <h3 className="sub-title">League finishes</h3>
        <ul className="champions">
          {state.trophies.filter((t) => t.competition.includes('Division') || t.competition.includes('·')).map((t, i) => (
            <li key={i}><span>Season {t.season} · {t.competition}</span><b>{t.position === 1 ? 'Champions' : `${t.position}${['th', 'st', 'nd', 'rd'][t.position] || 'th'}`}</b></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MoneyRow({ label, value, max, kind }) {
  return (
    <li className={`money__row money__row--${kind}`}>
      <span>{label}</span>
      <i style={{ width: `${(value / max) * 100}%` }} />
      <b>{kind === 'out' ? '−' : '+'}{value}</b>
    </li>
  );
}
