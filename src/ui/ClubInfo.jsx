import React from 'react';
import { RARITIES } from '../engine/cards.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { LEVEL_MULTIPLIER } from '../data/demo.js';
import { AREAS, AREA_GROUPS, areaEffect } from '../data/facilities.js';
import { effectiveCohesion, squadPopularity, cardPopularity, academyInfo, seasonMods, businessIncome } from '../state/club.js';
import { Crest } from './Art.jsx';
import { clubVars } from './clubTheme.js';
import { CardPlays } from './Collection.jsx';

const effect = (state, id, level) => {
  const a = id === 'academy' ? academyInfo(level) : null;
  return areaEffect(id, level, { m: LEVEL_MULTIPLIER[state.club.level] || 1, academy: a && { count: a.count, best: RARITIES[a.best].label } });
};

// Club management: the ten club areas (Business and Sports), card plays, income and trophies.
export default function ClubInfo({ state, onBack, onMarket }) {
  const fin = state.finance || { income: {}, spent: {} };
  const income = Object.entries(fin.income).sort((a, b) => b[1] - a[1]);
  const spent = Object.entries(fin.spent).sort((a, b) => b[1] - a[1]);
  const totalIn = income.reduce((s, [, v]) => s + v, 0);
  const totalOut = spent.reduce((s, [, v]) => s + v, 0);
  const max = Math.max(1, ...income.map(([, v]) => v), ...spent.map(([, v]) => v));
  const popular = [...state.squad].sort((a, b) => cardPopularity(b) - cardPopularity(a)).slice(0, 3);
  const mods = seasonMods(state);
  const ev = state.activeEvent;
  const biz = businessIncome(state);
  const bizMax = Math.max(1, ...biz.map((x) => x.coins));
  const bizSeason = ['Gate', 'Hospitality', 'Store', 'Merchandise', 'Sponsor'].reduce((t, k) => t + (fin.income[k] || 0), 0);

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
        <h2 className="section-title">Club management</h2>
        <CardPlays state={state} />
        <p className="hint">Each area is raised by its own infrastructure card, from club packs (Shop → Club). Card rarity sets the highest level it can build: Common up to 2, Uncommon 3, Rare 4, Epic 5, Legend +2 levels.</p>
        {onMarket && <button type="button" className="btn btn--ghost btn--small" onClick={onMarket}>Club packs ›</button>}
      </section>

      {AREA_GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="section-title">{g.label}</h2>
          <div className="facilities">
            {g.ids.map((k) => {
              const lvl = state.facilities?.[k] || 0;
              return (
                <div key={k} className="facility">
                  <div className="facility__head">
                    <b><span aria-hidden="true">{AREAS[k].icon}</span> {AREAS[k].label}</b>
                    <span className="facility__dots" aria-label={`Level ${lvl} of 5`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= lvl ? 'on' : ''} />)}</span>
                  </div>
                  <span className="facility__now">L{lvl}: {effect(state, k, lvl)}</span>
                  {lvl < 5 ? <span className="facility__next">Next, L{lvl + 1}: {effect(state, k, lvl + 1)}</span> : <span className="facility__next">Max level</span>}
                  <span className="facility__card">Card: {OFFSEASON_CARDS[AREAS[k].card].name}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="panel">
        <h2 className="section-title">Income per match</h2>
        <p className="hint">From the business areas at today's levels, on top of results and prizes.</p>
        <ul className="money">
          {biz.filter((it) => it.coins > 0).map((it) => <MoneyRow key={it.label} label={`${AREAS[it.area]?.label || it.label}${it.homeOnly ? ' (home)' : ''}`} value={it.coins} max={bizMax} kind="in" />)}
        </ul>
        <div className="money-totals">
          <div><span>Home game</span><b className="is-up">◎ {biz.reduce((t, x) => t + x.coins, 0)}</b></div>
          <div><span>Away game</span><b className="is-up">◎ {biz.filter((x) => !x.homeOnly).reduce((t, x) => t + x.coins, 0)}</b></div>
          <div><span>This season</span><b>◎ {bizSeason}</b></div>
        </div>
      </section>

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
        ) : <p className="hint">None this season. Play one from Cards → Items: in the summer it lasts all season, mid-season until the season ends.</p>}
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
