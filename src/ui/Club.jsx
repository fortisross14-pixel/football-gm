import React from 'react';
import { RARITIES } from '../engine/cards.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { LEVEL_MULTIPLIER } from '../data/demo.js';
import { AREAS, AREA_GROUPS, areaEffect, TICKET_PRICES, TICKET_IDS } from '../data/facilities.js';
import { KIT_TIERS, TV_KINDS, PATTERN_LABEL } from '../data/deals.js';
import { MATCHDAYS } from '../engine/season.js';
import { PHILOSOPHIES, clubIdentity } from '../data/philosophies.js';
import {
  effectiveCohesion, squadPopularity, cardPopularity, academyInfo, seasonMods, businessIncome,
  constructionOf, constructionList, constructionProgress, ticketOf, dealsPending,
} from '../state/club.js';
import { opinions, ownerLine, fanLine } from '../state/chronicle.js';
import { Crest } from './Art.jsx';
import { clubVars } from './clubTheme.js';
import { CardPlays } from './Collection.jsx';
import { Segmented } from './Home.jsx';
import { useSticky } from './nav.jsx';
import { KitSummary } from './Jersey.jsx';
import { SponsorNow } from './Offseason.jsx';
import { StadiumCard, FansPanel, Stars } from './Stadium.jsx';
import { projectLabel, projectIcon } from '../state/business.js';
import { matchdayOf, starsOf } from '../state/stadium.js';
import { fansOf, formatFans } from '../state/fans.js';

const effect = (state, id, level) => {
  const a = id === 'academy' ? academyInfo(level) : null;
  return areaEffect(id, level, { m: LEVEL_MULTIPLIER[state.club.level] || 1, academy: a && { count: a.count, best: RARITIES[a.best].label } });
};
const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
const coins = (v) => `◎ ${Math.round(v).toLocaleString()}`;
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'infra', label: 'Infrastructure' },
  { id: 'fans', label: 'Fans' },
  { id: 'finance', label: 'Finance' },
  { id: 'jersey', label: 'Jersey' },
  { id: 'effects', label: 'Effects' },
  { id: 'trophies', label: 'Trophies' },
];

// The Club tab: who the club is, its ten areas and building works, money, effects in play, trophies.
export default function Club({ state, onMarket, onTicket, onSummer }) {
  const offers = dealsPending(state).length > 0;
  const [tab, setTab] = useSticky('club-tab', 'overview');
  const works = constructionList(state).length;
  const labels = TABS.map((t) => ({
    ...t,
    label: t.id === 'infra' && works ? `${t.label} · 🏗 ${works}` : t.id === 'finance' && offers ? `${t.label} · New` : t.label,
  }));
  return (
    <div className="screen screen--club">
      <div className="club-head" style={clubVars(state.club)}>
        <Crest colors={state.club.colors} short={state.club.short} size={56} id={state.club.id} />
        <div>
          <b>{state.club.name}</b>
          <span>{state.club.division} · Season {state.season.year}</span>
        </div>
        <i className="club-stripes" aria-hidden="true" />
      </div>
      <Segmented label="Club" small value={tab} options={labels} onChange={setTab} />
      {tab === 'overview' && <Overview state={state} goFinance={() => setTab('finance')} />}
      {tab === 'infra' && <Infrastructure state={state} onMarket={onMarket} />}
      {tab === 'fans' && <FansPanel state={state} />}
      {tab === 'finance' && <Finance state={state} onTicket={onTicket} onSummer={onSummer} />}
      {tab === 'jersey' && <JerseyTab state={state} onSummer={onSummer} />}
      {tab === 'effects' && <Effects state={state} />}
      {tab === 'trophies' && <Trophies state={state} />}
    </div>
  );
}

// ---------------------------------------------------------------------------

function perMatch(state) {
  const biz = businessIncome(state);
  return { home: biz.reduce((t, x) => t + x.coins, 0), away: biz.filter((x) => !x.homeOnly).reduce((t, x) => t + x.coins, 0), win: state.sponsor?.perWin || 0 };
}

function Overview({ state, goFinance }) {
  const club = state.world.clubs[state.club.id];
  const identity = PHILOSOPHIES[clubIdentity(club)];
  const op = state.gm ? opinions(state) : null;
  const contract = state.gm?.contract;
  const left = contract ? contract.until - state.season.year + (state.phase === 'offseason' ? 0 : 1) : null;
  const pm = perMatch(state);
  const now = sum(state.finance?.income);
  const last = state.lastFinance ? sum(state.lastFinance.income) : null;
  return (
    <>
      <section className="panel club-id">
        <h2 className="section-title">Identity</h2>
        <p className="club-id__style"><span>The owners want</span><b>{identity.name}</b></p>
        <p className="hint">{identity.text} Play close to it to keep them happy.</p>
        {op && (
          <div className="opinions">
            <span className="opinion"><span className="opinion__who">Owners · {op.owners.value}</span><span>{ownerLine(op.owners)}</span></span>
            <span className="opinion"><span className="opinion__who">Fans · {op.fans.value}</span><span>{fanLine(op.fans)}</span></span>
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">The job</h2>
        <ul className="champions">
          {state.gm?.objective && <li><span>Board objective</span><b>{state.gm.objective.text}</b></li>}
          {contract && <li><span>Contract</span><b>Until season {contract.until}{left > 0 ? ` · ${left} season${left > 1 ? 's' : ''} left` : ' · last season'}</b></li>}
          <li><span>Sponsor</span><b>{state.sponsor?.brand || '—'}</b></li>
          <li><span>Kit</span><b>{state.kit?.brand || '—'}</b></li>
          <li><span>TV</span><b>{state.tv?.brand || '—'}</b></li>
          <li><span>Ticket prices</span><b>{ticketOf(state).label}</b></li>
          <li><span>Stadium</span><b><Stars value={starsOf(state)} size={14} /> · {matchdayOf(state).capacity.toLocaleString('en')} seats</b></li>
          <li><span>Fans</span><b>{formatFans(fansOf(state).local)} local · {formatFans(fansOf(state).global)} worldwide</b></li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="section-title">Money</h2>
        <div className="money-totals">
          <div><span>Budget</span><b>{coins(state.coins)}</b></div>
          <div><span>Home game</span><b className="is-up">{coins(pm.home)}</b></div>
          <div><span>Away game</span><b className="is-up">{coins(pm.away)}</b></div>
        </div>
        <p className="hint">Business income per match, on top of results and prizes{pm.win ? `, plus ◎ ${pm.win} from the sponsor for every win` : ''}.</p>
        <div className="money-totals money-totals--two">
          <div><span>Revenue this season</span><b>{coins(now)}</b></div>
          <div><span>Last season</span><b>{last === null ? '—' : coins(last)}</b>{last !== null && last > 0 && <small className={now >= last ? 'is-up' : 'is-down'}>{Math.round((100 * now) / last)}% of last season so far</small>}</div>
        </div>
        <button type="button" className="link-btn" onClick={goFinance}>Finances ›</button>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function Progress({ project }) {
  const pct = Math.round(constructionProgress(project) * 100);
  return (
    <span className="build" aria-label={`Building works ${pct}% done`}>
      <span className="build__bar"><i style={{ width: `${pct}%` }} /></span>
      <span className="build__text">{project.summer ? 'Ready for matchday 1' : `${project.left} matchday${project.left > 1 ? 's' : ''} left`}</span>
    </span>
  );
}

function Infrastructure({ state, onMarket }) {
  const works = constructionList(state);
  return (
    <>
      <section className="panel">
        <h2 className="section-title">Building works</h2>
        <CardPlays state={state} />
        <p className="hint">Each area (and each part of the stadium) is raised by its own infrastructure card, from club packs (Shop → Club). Playing one starts building works: 2 + the new level league matchdays (summer works are ready for matchday 1). One project per area or stadium part at a time. Card rarity sets the highest level: Common up to 2, Uncommon 3, Rare 4, Epic 5, Legend +2 levels.</p>
        {works.length === 0 ? <p className="hint">No works under way.</p> : (
          <ul className="works">
            {works.map((p) => (
              <li key={p.id}>
                <b><span aria-hidden="true">{projectIcon(p)}</span> {projectLabel(p)} L{p.from} → L{p.to}</b>
                <Progress project={p} />
              </li>
            ))}
          </ul>
        )}
        {onMarket && <button type="button" className="btn btn--ghost btn--small" onClick={onMarket}>Club packs ›</button>}
      </section>

      <StadiumCard state={state} />

      {AREA_GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="section-title">{g.label}</h2>
          <div className="facilities">
            {g.ids.filter((k) => k !== 'stadium').map((k) => {
              const lvl = state.facilities?.[k] || 0;
              const p = constructionOf(state, k);
              return (
                <div key={k} className={`facility${p ? ' facility--building' : ''}`}>
                  <div className="facility__head">
                    <b><span aria-hidden="true">{AREAS[k].icon}</span> {AREAS[k].label}</b>
                    <span className="facility__dots" aria-label={`Level ${lvl} of 5${p ? `, building level ${p.to}` : ''}`}>
                      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= lvl ? 'on' : p && i <= p.to ? 'soon' : ''} />)}
                    </span>
                  </div>
                  <span className="facility__now">L{lvl}: {effect(state, k, lvl)}</span>
                  {p ? (
                    <>
                      <span className="facility__next">Building L{p.to}: {effect(state, k, p.to)}</span>
                      <Progress project={p} />
                    </>
                  ) : lvl < 5 ? <span className="facility__next">Next, L{lvl + 1}: {effect(state, k, lvl + 1)}</span> : <span className="facility__next">Max level</span>}
                  <span className="facility__card">Card: {OFFSEASON_CARDS[AREAS[k].card].name}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------

// The three deals in force: kit, sponsor and TV (offers are signed in the off-season flow).
function Deals({ state, onSummer }) {
  const { kit, tv } = state;
  const open = dealsPending(state);
  return (
    <section className="panel">
      <h2 className="section-title">Deals · season {kit?.year ?? state.season.year}</h2>
      {state.phase === 'offseason' && state.deals && (
        <button type="button" className="career-link career-link--light" onClick={onSummer}>
          <span>{open.length ? `Offers waiting for next season: ${open.map((k) => ({ kit: 'jersey', sponsor: 'sponsor', tv: 'TV' })[k]).join(', ')}` : `Next season's deals are signed`}</span>
          <b>Off-season ›</b>
        </button>
      )}
      <ul className="champions">
        {kit && <li><span>👕 Kit · {kit.brand}</span><b>◎ {kit.revenue} ({kit.shirts.toLocaleString()} shirts)</b></li>}
        {state.sponsor && <li><span>🤝 Sponsor · {state.sponsor.brand}</span><b>◎ {state.sponsor.perWin} a win{state.sponsor.bonus ? ` + ◎ ${state.sponsor.bonus}` : ''}</b></li>}
        {tv && <li><span>📺 TV · {tv.brand}</span><b>◎ {tv.fee} + ◎ {tv.per} {TV_KINDS[tv.kind]?.unit}</b></li>}
      </ul>
      <p className="hint">Kit revenue and the TV fee are paid over the {MATCHDAYS} league matchdays, the sponsor's signing bonus on matchday 1, the rest game by game.</p>
    </section>
  );
}

function Finance({ state, onTicket, onSummer }) {
  const fin = state.finance || { income: {}, spent: {} };
  const income = Object.entries(fin.income).sort((a, b) => b[1] - a[1]);
  const spent = Object.entries(fin.spent).sort((a, b) => b[1] - a[1]);
  const totalIn = sum(fin.income);
  const totalOut = sum(fin.spent);
  const max = Math.max(1, ...income.map(([, v]) => v), ...spent.map(([, v]) => v));
  const biz = businessIncome(state);
  const per = (total) => Math.round((total || 0) / MATCHDAYS);
  const dealRows = [
    state.kit && { label: 'Kit deal (league game)', value: per(state.kit.revenue) },
    state.tv && { label: 'TV fee (league game)', value: per(state.tv.fee) },
    state.tv && { label: `TV (${TV_KINDS[state.tv.kind]?.unit})`, value: state.tv.per },
    state.sponsor && { label: 'Sponsor (a win)', value: state.sponsor.perWin },
  ].filter((r) => r && r.value > 0);
  const bizMax = Math.max(1, ...biz.map((x) => x.coins), ...dealRows.map((r) => r.value));
  const ticket = ticketOf(state);
  const history = [...(state.financeHistory || [])].reverse();
  return (
    <>
      <Deals state={state} onSummer={onSummer} />

      <section className="panel">
        <h2 className="section-title">Ticket prices</h2>
        <Segmented
          label="Tickets"
          small
          value={state.ticketPrice || 'normal'}
          options={TICKET_IDS.map((id) => ({ id, label: TICKET_PRICES[id].label }))}
          onChange={(id) => onTicket?.(id)}
        />
        <p className="hint">{ticket.text}. Happiness now: {Math.round(state.gm?.confidence?.fans ?? 55)}.</p>
        <Crowd state={state} />
      </section>

      <section className="panel">
        <h2 className="section-title">Income per match</h2>
        <p className="hint">From the business areas at today's levels and the deals, on top of results and prizes.</p>
        <ul className="money">
          {biz.filter((it) => it.coins > 0).map((it) => <MoneyRow key={it.label} label={`${AREAS[it.area]?.label || it.label}${it.homeOnly ? ' (home)' : ''}`} value={it.coins} max={bizMax} kind="in" />)}
          {dealRows.map((r) => <MoneyRow key={r.label} label={r.label} value={r.value} max={bizMax} kind="in" />)}
        </ul>
      </section>

      <section className="panel">
        <h2 className="section-title">Season {state.season.year} money</h2>
        <div className="money-totals">
          <div><span>In</span><b className="is-up">{coins(totalIn)}</b></div>
          <div><span>Out</span><b className="is-down">{coins(totalOut)}</b></div>
          <div><span>Balance</span><b>{coins(state.coins)}</b></div>
        </div>
        {income.length === 0 && spent.length === 0 && <p className="hint">Nothing yet this season.</p>}
        <ul className="money">
          {income.map(([k, v]) => <MoneyRow key={k} label={k} value={v} max={max} kind="in" />)}
          {spent.map(([k, v]) => <MoneyRow key={k} label={k} value={v} max={max} kind="out" />)}
        </ul>
      </section>

      <section className="panel">
        <h2 className="section-title">Season by season</h2>
        {history.length === 0 ? <p className="hint">Each finished season's money in and out shows up here.</p> : (
          <table className="table fin-history">
            <thead><tr><th>Season</th><th>Club</th><th className="num">In</th><th className="num">Out</th><th className="num">Balance</th></tr></thead>
            <tbody>
              {history.map((e) => {
                const top = Object.entries(e.income || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(' · ');
                return (
                  <React.Fragment key={e.year}>
                    <tr>
                      <td>{e.year}</td>
                      <td className="fin-history__club">{e.club}</td>
                      <td className="num is-up">{e.in.toLocaleString()}</td>
                      <td className="num is-down">{e.out.toLocaleString()}</td>
                      <td className="num"><b>{e.balance.toLocaleString()}</b></td>
                    </tr>
                    {top && <tr className="fin-history__detail"><td colSpan={5}>{top}</td></tr>}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

// Ticket demand against capacity for the next home game, and the last home crowds.
function Crowd({ state }) {
  const day = matchdayOf(state);
  const games = fansOf(state).games.slice(0, 5);
  return (
    <>
      <div className="money-totals">
        <div><span>Demand</span><b>{day.demand.toLocaleString('en')}</b></div>
        <div><span>Capacity</span><b>{day.capacity.toLocaleString('en')}</b></div>
        <div><span>Per fan</span><b>◎ {(day.perFan * 1000 * 0.8).toFixed(1)}<small>/1k</small></b></div>
      </div>
      <p className="hint">{day.soldOut ? 'Demand is above capacity: every price sells out, so High earns more, but the fans grumble after every home game you don\'t win.' : 'Demand is below capacity: High prices would leave more seats empty, Low fills them.'}</p>
      {games.length > 0 && (
        <ul className="champions">
          {games.map((g, i) => <li key={i}><span>{g.md} · {g.opponent}</span><b>{g.attendance.toLocaleString('en')} / {g.capacity.toLocaleString('en')}{g.soldOut ? ' · sold out' : ''} · ◎ {g.gate}</b></li>)}
        </ul>
      )}
    </>
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

// ---------------------------------------------------------------------------

// Club → Jersey: the kit this season, the maker, the sponsor on the front, last season's sales.
function JerseyTab({ state, onSummer }) {
  const kit = state.kit;
  const last = state.seasonReview?.kit && state.seasonReview.year < (kit?.year ?? 0) ? state.seasonReview.kit : null;
  return (
    <>
      <section className="panel">
        <h2 className="section-title">Kit · season {kit?.year ?? state.season.year}</h2>
        <KitSummary state={state} />
        <SponsorNow state={state} />
      </section>
      {kit && (
        <section className="panel">
          <h2 className="section-title">Shirt sales</h2>
          <div className="money-totals">
            <div><span>Shirts</span><b>{kit.shirts.toLocaleString()}</b></div>
            <div><span>Shop takings</span><b>◎ {kit.sales.toLocaleString()}</b></div>
            <div><span>Club revenue</span><b className="is-up">◎ {kit.revenue}</b></div>
          </div>
          <p className="hint">{KIT_TIERS[kit.tier]?.label}: ◎ {kit.base} base + {Math.round(kit.pct * 100)}% of ◎ {kit.sales.toLocaleString()} sales = ◎ {kit.revenue}, paid over the {MATCHDAYS} league matchdays. Shop takings are the maker's, not club money.</p>
          {last && <p className="hint">Last season: {last.brand}, {last.shirts.toLocaleString()} shirts, ◎ {last.revenue} for the club.</p>}
        </section>
      )}
      {state.phase === 'offseason' && state.deals && (
        <button type="button" className="btn btn--ghost btn--block" onClick={onSummer}>{state.deals.kit.signed ? 'Off-season plan ›' : 'Choose next season\'s kit ›'}</button>
      )}
      <p className="hint">Each summer: renew your maker or change, keep the line or order a new design ({Object.values(PATTERN_LABEL).join(', ').toLowerCase()}).</p>
    </>
  );
}

function Effects({ state }) {
  const effects = state.clubEffects || [];
  const ev = state.activeEvent;
  const mods = seasonMods(state);
  const popular = [...state.squad].sort((a, b) => cardPopularity(b) - cardPopularity(a)).slice(0, 3);
  const ticket = ticketOf(state);
  return (
    <>
      <section className="panel">
        <h2 className="section-title">Active effects</h2>
        {effects.length === 0 && !ev && !ticket.home ? <p className="hint">Nothing in play right now. Club cards with a temporary effect show up here with the matches they have left.</p> : (
          <ul className="effects">
            {ev && OFFSEASON_CARDS[ev.type] && (
              <li>
                <span className="effects__icon" aria-hidden="true">{OFFSEASON_CARDS[ev.type].icon || '★'}</span>
                <span><b>{OFFSEASON_CARDS[ev.type].name}</b> <small>({RARITIES[ev.rarity].label} season event)</small><br />{cardText(ev.type, ev.rarity)}</span>
                <em>Season</em>
              </li>
            )}
            {effects.map((e) => (
              <li key={e.id}>
                <span className="effects__icon" aria-hidden="true">{e.icon || '★'}</span>
                <span><b>{e.name}</b><br />{e.text}</span>
                <em>{e.gamesLeft != null ? `${e.gamesLeft} match${e.gamesLeft === 1 ? '' : 'es'}` : ''}</em>
              </li>
            ))}
            {ticket.home > 0 && (
              <li>
                <span className="effects__icon" aria-hidden="true">🎟</span>
                <span><b>Low ticket prices</b><br />Full stands: +{Math.round(ticket.home * 100)}% team stats at home.</span>
                <em>While low</em>
              </li>
            )}
          </ul>
        )}
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
    </>
  );
}

function Trophies({ state }) {
  const won = state.trophies.filter((t) => t.position === 1);
  return (
    <section>
      <h2 className="section-title">Trophy cabinet</h2>
      {won.length === 0 ? (
        <p className="hint">Empty, for now. League titles, cups, continental cups and the Club World Cup will live here.</p>
      ) : (
        <ul className="trophies">
          {won.map((t, i) => (
            <li key={i}><span className="trophies__cup">🏆</span><b>{t.competition}</b><span>Season {t.season}</span></li>
          ))}
        </ul>
      )}
      <h3 className="sub-title">League finishes</h3>
      <ul className="champions">
        {state.trophies.filter((t) => t.competition.includes('Division') || t.competition.includes('·')).map((t, i) => (
          <li key={i}><span>Season {t.season} · {t.competition}</span><b>{t.position === 1 ? 'Champions' : ordinal(t.position)}</b></li>
        ))}
      </ul>
    </section>
  );
}
