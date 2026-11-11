import React from 'react';
import { RARITIES } from '../engine/cards.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { LEVEL_MULTIPLIER } from '../data/demo.js';
import { AREAS, AREA_GROUPS, areaEffect, TICKET_PRICES, TICKET_IDS, SPONSOR_DEALS } from '../data/facilities.js';
import { PHILOSOPHIES, clubIdentity } from '../data/philosophies.js';
import {
  effectiveCohesion, squadPopularity, cardPopularity, academyInfo, seasonMods, businessIncome,
  constructionOf, constructionList, constructionProgress, ticketOf, activeSponsor, sponsorOffers, sponsorTerms,
} from '../state/club.js';
import { opinions, ownerLine, fanLine } from '../state/chronicle.js';
import { Crest } from './Art.jsx';
import { clubVars } from './clubTheme.js';
import { CardPlays } from './Collection.jsx';
import { Segmented } from './Home.jsx';
import { useSticky } from './nav.jsx';

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
  { id: 'finance', label: 'Finance' },
  { id: 'effects', label: 'Effects' },
  { id: 'trophies', label: 'Trophies' },
];

// The Club tab: who the club is, its ten areas and building works, money, effects in play, trophies.
export default function Club({ state, onMarket, onTicket, onSignSponsor }) {
  const offers = state.phase === 'offseason' && sponsorOffers(state).length > 0 && !state.sponsorOffers?.signed;
  // Summer with sponsor offers waiting: open on Finance, where they are signed.
  const [tab, setTab] = useSticky('club-tab', offers ? 'finance' : 'overview');
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
      {tab === 'finance' && <Finance state={state} onTicket={onTicket} onSignSponsor={onSignSponsor} />}
      {tab === 'effects' && <Effects state={state} />}
      {tab === 'trophies' && <Trophies state={state} />}
    </div>
  );
}

// ---------------------------------------------------------------------------

function perMatch(state) {
  const biz = businessIncome(state);
  return { home: biz.reduce((t, x) => t + x.coins, 0), away: biz.filter((x) => !x.homeOnly).reduce((t, x) => t + x.coins, 0), win: activeSponsor(state).perWin };
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
  const sp = activeSponsor(state);
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
          <li><span>Sponsor</span><b>{sp.brand} · {SPONSOR_DEALS[sp.type]?.label}</b></li>
          <li><span>Ticket prices</span><b>{ticketOf(state).label}</b></li>
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
        <p className="hint">Each area is raised by its own infrastructure card, from club packs (Shop → Club). Playing one starts building works: 2 + the new level league matchdays (summer works are ready for matchday 1). One project per area at a time. Card rarity sets the highest level: Common up to 2, Uncommon 3, Rare 4, Epic 5, Legend +2 levels.</p>
        {works.length === 0 ? <p className="hint">No works under way.</p> : (
          <ul className="works">
            {works.map((p) => (
              <li key={p.id}>
                <b><span aria-hidden="true">{AREAS[p.area].icon}</span> {AREAS[p.area].label} L{p.from} → L{p.to}</b>
                <Progress project={p} />
              </li>
            ))}
          </ul>
        )}
        {onMarket && <button type="button" className="btn btn--ghost btn--small" onClick={onMarket}>Club packs ›</button>}
      </section>

      {AREA_GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="section-title">{g.label}</h2>
          <div className="facilities">
            {g.ids.map((k) => {
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

function dealPay(t) {
  return [t.perMatch && `◎ ${t.perMatch} a match`, t.perWin && `◎ ${t.perWin} a win`, t.perTrophy && `◎ ${t.perTrophy} a trophy or promotion`].filter(Boolean).join(' · ');
}

function Sponsor({ state, onSignSponsor }) {
  const sp = activeSponsor(state);
  const offers = state.phase === 'offseason' ? sponsorOffers(state) : [];
  const signed = state.sponsorOffers?.signed;
  return (
    <section className="panel">
      <h2 className="section-title">Sponsor</h2>
      {offers.length > 0 ? (
        <>
          <p className="hint">Three offers for season {state.sponsorOffers.year}. Their size grows with the Sponsorship area and the division. Pick the one that fits your season{signed ? '' : ': if you don\'t choose by the first matchday, the club signs the steady one'}.</p>
          <div className="deals">
            {offers.map((o) => {
              const d = SPONSOR_DEALS[o.type];
              const on = signed === o.type;
              return (
                <button key={o.type} type="button" className={`deal${on ? ' is-on' : ''}`} onClick={() => onSignSponsor?.(o.type)} disabled={on} aria-pressed={on}>
                  <span className="deal__kind"><span aria-hidden="true">{d.icon}</span> {d.label}</span>
                  <b>{o.brand}</b>
                  <span className="deal__pay">{dealPay(sponsorTerms(state, o.type))}</span>
                  <span className="deal__text">{d.text}</span>
                  <span className="deal__cta">{on ? '✓ Signed' : signed ? 'Switch to this one' : 'Sign'}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="deal-now"><span aria-hidden="true">{SPONSOR_DEALS[sp.type]?.icon}</span> <b>{sp.brand}</b> · {SPONSOR_DEALS[sp.type]?.label} contract</p>
          <p className="hint">{dealPay(sp)}. {SPONSOR_DEALS[sp.type]?.text} New offers arrive every summer.</p>
        </>
      )}
    </section>
  );
}

function Finance({ state, onTicket, onSignSponsor }) {
  const fin = state.finance || { income: {}, spent: {} };
  const income = Object.entries(fin.income).sort((a, b) => b[1] - a[1]);
  const spent = Object.entries(fin.spent).sort((a, b) => b[1] - a[1]);
  const totalIn = sum(fin.income);
  const totalOut = sum(fin.spent);
  const max = Math.max(1, ...income.map(([, v]) => v), ...spent.map(([, v]) => v));
  const biz = businessIncome(state);
  const bizMax = Math.max(1, ...biz.map((x) => x.coins), biz.find((x) => x.perWin)?.perWin || 0);
  const ticket = ticketOf(state);
  const history = [...(state.financeHistory || [])].reverse();
  return (
    <>
      <Sponsor state={state} onSignSponsor={onSignSponsor} />

      <section className="panel">
        <h2 className="section-title">Ticket prices</h2>
        <Segmented
          label="Tickets"
          small
          value={state.ticketPrice || 'normal'}
          options={TICKET_IDS.map((id) => ({ id, label: TICKET_PRICES[id].label }))}
          onChange={(id) => onTicket?.(id)}
        />
        <p className="hint">{ticket.text}. Fans now: {Math.round(state.gm?.confidence?.fans ?? 55)}.</p>
      </section>

      <section className="panel">
        <h2 className="section-title">Income per match</h2>
        <p className="hint">From the business areas and the sponsor at today's levels, on top of results and prizes.</p>
        <ul className="money">
          {biz.filter((it) => it.coins > 0).map((it) => <MoneyRow key={it.label} label={`${AREAS[it.area]?.label || it.label}${it.homeOnly ? ' (home)' : ''}`} value={it.coins} max={bizMax} kind="in" />)}
          {biz.filter((it) => it.perWin).map((it) => <MoneyRow key="win" label="Sponsor (a win)" value={it.perWin} max={bizMax} kind="in" />)}
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
            {ev && (
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
