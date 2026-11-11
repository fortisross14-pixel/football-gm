import React, { useEffect, useState } from 'react';
import { RARITIES } from '../engine/cards.js';
import { PACKS } from '../engine/packs.js';
import { OFFSEASON_CARDS } from '../data/offseason.js';
import { OFFSEASON_STEPS, KIT_TIERS, SPONSOR_KINDS, TV_KINDS, PATTERN_LABEL } from '../data/deals.js';
import { MATCHDAYS } from '../engine/season.js';
import {
  dealOffers, dealSigned, dealsPending, offseasonStatus, kitSales, designFee, keepFactor, newDesignExpected, expectedGames, sponsorEV, tvEV, ceoMeeting,
} from '../state/club.js';
import { opinions } from '../state/chronicle.js';
import Jersey from './Jersey.jsx';
import SeasonDeal from './SeasonDeal.jsx';
import { Segmented } from './Home.jsx';

const coins = (v) => `◎ ${Math.round(v).toLocaleString()}`;
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const big = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e4 ? `${Math.round(v / 1000)}k` : v.toLocaleString());

// The off-season, one step at a time (Home → Off-season). Every step can be revisited; the
// deals not signed by kick-off take their defaults.
export default function OffseasonFlow({ state, onSeen, onSignKit, onSignSponsor, onSignTv, onPickSeason, onRedrawSeason, onStart, onBack, goTo }) {
  const status = offseasonStatus(state);
  const [step, setStep] = useState(() => OFFSEASON_STEPS.find((s) => !status[s.id])?.id || 'summary');
  useEffect(() => { onSeen?.(step); window.scrollTo(0, 0); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const i = OFFSEASON_STEPS.findIndex((s) => s.id === step);
  const go = (d) => setStep(OFFSEASON_STEPS[Math.max(0, Math.min(OFFSEASON_STEPS.length - 1, i + d))].id);
  return (
    <div className="screen screen--summer">
      <div className="summer-head">
        <button type="button" className="link-btn" onClick={onBack}>‹ Home</button>
        <span className="season-end__label">Off-season · season {state.season.year + 1}</span>
      </div>
      <ol className="stepper" aria-label="Off-season steps">
        {OFFSEASON_STEPS.map((s, k) => (
          <li key={s.id}>
            <button type="button" className={`stepper__step${s.id === step ? ' is-on' : ''}${status[s.id] ? ' is-done' : ''}`} onClick={() => setStep(s.id)} aria-current={s.id === step ? 'step' : undefined}>
              <span className="stepper__n" aria-hidden="true">{status[s.id] ? '✓' : k + 1}</span>
              <span className="stepper__label">{s.short}</span>
            </button>
          </li>
        ))}
      </ol>
      <h1 className="summer-title"><span>{i + 1}</span> {OFFSEASON_STEPS[i].label}</h1>

      {step === 'summary' && <Summary state={state} />}
      {step === 'card' && <div className="offseason"><SeasonDeal state={state} onPick={onPickSeason} onRedraw={onRedrawSeason} /></div>}
      {step === 'kit' && <Kit state={state} onSign={onSignKit} />}
      {step === 'sponsor' && <Sponsor state={state} onSign={onSignSponsor} />}
      {step === 'tv' && <Tv state={state} onSign={onSignTv} />}
      {step === 'ceo' && <Ceo state={state} onStart={onStart} goTo={goTo} />}

      <div className="summer-nav">
        <button type="button" className="btn btn--ghost" onClick={() => go(-1)} disabled={i === 0}>‹ Back</button>
        {i < OFFSEASON_STEPS.length - 1
          ? <button type="button" className="btn btn--primary" onClick={() => go(1)}>Next: {OFFSEASON_STEPS[i + 1].short} ›</button>
          : <button type="button" className="btn btn--ghost" onClick={onBack}>Home ›</button>}
      </div>
      <p className="hint summer-foot">The Transfer Market, your cards and any job offers stay open all summer: <button type="button" className="link-btn" onClick={() => goTo('shop')}>Market</button> · <button type="button" className="link-btn" onClick={() => goTo('cards')}>Cards</button> · <button type="button" className="link-btn" onClick={() => goTo('career')}>Career</button></p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ① Season review

function FanRow({ label, before, after }) {
  const pct = before ? Math.round((100 * (after - before)) / before) : null;
  return (
    <li>
      <span>{label}</span>
      <b>{big(after)}{pct !== null && <small className={pct >= 0 ? 'is-up' : 'is-down'}> {pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}%</small>}</b>
    </li>
  );
}

function Summary({ state }) {
  const r = state.seasonReview;
  if (!r) return <p className="hint">No season review this summer.</p>;
  const { w, d, l, gf, ga } = r.record;
  const before = r.fans.before || r.fans.after;
  return (
    <>
      <section className={`season-end${r.position === 1 ? ' is-champion' : ''}`}>
        <span className="season-end__label">Season {r.year} · {r.club} · {r.division}</span>
        <b className="season-end__pos">{r.position === 1 ? '🏆 Champions' : `${ordinal(r.position)} place`}</b>
        {r.promoted && <p className="promo is-up">▲ Promoted</p>}
        {r.relegated && <p className="promo is-down">▼ Relegated</p>}
        <div className="review-stats">
          <div><span>Won</span><b>{w}</b></div>
          <div><span>Drawn</span><b>{d}</b></div>
          <div><span>Lost</span><b>{l}</b></div>
          <div><span>Goals</span><b>{gf}–{ga}</b></div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Titles</h2>
        {r.titles.length ? <ul className="trophies">{r.titles.map((t) => <li key={t}><span className="trophies__cup">🏆</span><b>{t}</b><span>Season {r.year}</span></li>)}</ul> : <p className="hint">No silverware this season.</p>}
      </section>

      <section className="panel">
        <h2 className="section-title">Best player</h2>
        {r.best ? <p className="review-best"><b>{r.best.name}</b><span>{r.best.why}</span></p> : <p className="hint">Nobody stood out.</p>}
        <ul className="champions">
          {r.leaders?.goals && <li><span>Top scorer</span><b>{r.leaders.goals.name} · {r.leaders.goals.value}</b></li>}
          {r.leaders?.assists && <li><span>Assists</span><b>{r.leaders.assists.name} · {r.leaders.assists.value}</b></li>}
          {r.awards.map((a) => <li key={a.k}><span>Yearly award</span><b>🏅 {a.name}</b></li>)}
        </ul>
      </section>

      <section className="panel">
        <h2 className="section-title">Revenue</h2>
        <div className="money-totals money-totals--two">
          <div><span>Season {r.year}</span><b className="is-up">{coins(r.revenue)}</b></div>
          <div><span>Season before</span><b>{r.lastRevenue === null ? '—' : coins(r.lastRevenue)}</b>{r.lastRevenue ? <small className={r.revenue >= r.lastRevenue ? 'is-up' : 'is-down'}>{r.revenue >= r.lastRevenue ? '+' : ''}{Math.round((100 * (r.revenue - r.lastRevenue)) / r.lastRevenue)}%</small> : null}</div>
        </div>
        <ul className="champions">{r.income.map(([k, v]) => <li key={k}><span>{k}</span><b>{coins(v)}</b></li>)}</ul>
        {r.kit && <p className="hint">{r.kit.brand} sold {r.kit.shirts.toLocaleString()} of your shirts: ◎ {r.kit.revenue} for the club.</p>}
      </section>

      <section className="panel">
        <h2 className="section-title">Fan base</h2>
        <ul className="champions">
          <FanRow label="Local fans" before={before.local} after={r.fans.after.local} />
          <FanRow label="Global fans" before={before.global} after={r.fans.after.global} />
          <li><span>Mood</span><b>{r.fans.after.happiness} / 100</b></li>
        </ul>
        <p className="hint">More fans sell more shirts and bring bigger sponsor and TV offers.</p>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// ③ Jersey

function Kit({ state, onSign }) {
  const offers = dealOffers(state, 'kit');
  const signed = dealSigned(state, 'kit');
  const [pick, setPick] = useState(offers[0]?.id);
  const [design, setDesign] = useState('keep');
  const fee = designFee(state);
  if (signed || !offers.length) return <KitReveal state={state} />;
  const offer = offers.find((o) => o.id === pick) || offers[0];
  const factor = design === 'new' ? newDesignExpected : keepFactor(state);
  return (
    <>
      <section className="panel kit-pick">
        <Jersey colors={state.club.colors} pattern={design === 'new' ? offer.newPattern : state.kit?.pattern} sponsor={state.sponsor?.brand} maker={offer.brand} size={150} />
        <div>
          <p className="hint">Every summer your kit maker renews or you change. A bigger maker sells the shirt in more places but pays a smaller base. The club gets the base plus a share of the shirt sales, paid over the {MATCHDAYS} league matchdays.</p>
          <Segmented
            label="Design"
            small
            value={design}
            onChange={setDesign}
            options={[
              { id: 'keep', label: `Keep the ${PATTERN_LABEL[state.kit?.pattern] || 'line'}` },
              { id: 'new', label: `New design · ◎ ${fee}`, disabled: state.coins < fee },
            ]}
          />
          <p className="hint">{design === 'new' ? `A new ${PATTERN_LABEL[offer.newPattern].toLowerCase()} design: usually a boost in its first season (0.9–1.45×), but it can flop.` : `Worn ${(state.kit?.age ?? 0) + 2} seasons: ${Math.round(keepFactor(state) * 100)}% of new-shirt sales. Fans like a new shirt now and then.`}</p>
        </div>
      </section>
      <div className="deals">
        {offers.map((o) => {
          const t = KIT_TIERS[o.tier];
          const exp = kitSales(state, o, { designF: factor });
          return (
            <button key={o.id} type="button" className={`deal${o.id === offer.id ? ' is-on' : ''}`} onClick={() => setPick(o.id)} aria-pressed={o.id === offer.id}>
              <span className="deal__kind"><span aria-hidden="true">{t.icon}</span> {t.label}{o.renewal ? ' · your maker' : ''}</span>
              <b>{o.brand}</b>
              <span className="deal__pay">◎ {o.base} base + {Math.round(o.pct * 100)}% of sales</span>
              <span className="deal__text">{t.text} Expected: about {big(exp.shirts)} shirts, ◎ {exp.revenue - (design === 'new' ? fee : 0)} for the club{design === 'new' ? ' after the design fee' : ''}.</span>
              <span className="deal__cta">{o.id === offer.id ? 'Selected' : 'Select'}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={() => onSign(offer.id, design)}>Sign with {offer.brand}{design === 'new' ? ' · new design' : ''}</button>
      <p className="hint">Not signed by kick-off: you renew with {offers[0].brand} and keep the line.</p>
    </>
  );
}

function KitReveal({ state }) {
  const k = state.kit;
  if (!k) return null;
  return (
    <section className="panel kit-reveal">
      <Jersey colors={state.club.colors} pattern={k.pattern} sponsor={state.sponsor?.brand} maker={k.brand} size={170} />
      <div className="kit-reveal__numbers">
        <span className="deal__kind">{KIT_TIERS[k.tier]?.label} · {k.brand} · {PATTERN_LABEL[k.pattern]}{k.newDesign ? ' (new)' : ''}</span>
        <div className="reveal-row" style={{ '--i': 0 }}><span>Shirts sold this season</span><b>{k.shirts.toLocaleString()}</b></div>
        <div className="reveal-row" style={{ '--i': 1 }}><span>Shop takings (not club money)</span><b>◎ {k.sales.toLocaleString()}</b></div>
        <div className="reveal-row" style={{ '--i': 2 }}><span>Base</span><b>◎ {k.base}</b></div>
        <div className="reveal-row" style={{ '--i': 3 }}><span>Your share ({Math.round(k.pct * 100)}%)</span><b>◎ {k.share}</b></div>
        <div className="reveal-row reveal-row--total" style={{ '--i': 4 }}><span>Club revenue</span><b>◎ {k.revenue}</b></div>
        <p className="hint">Paid in {MATCHDAYS} league-matchday instalments{k.newDesign ? `; the new design sells ${Math.round(k.designF * 100)}% of a normal shirt` : ''}.</p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ④ Sponsor

const cardName = (c) => (c?.kind === 'pack' ? PACKS[c.pack]?.name : c?.kind === 'club' ? `${RARITIES[c.rarity].label} ${OFFSEASON_CARDS[c.type]?.name}` : null);

function Sponsor({ state, onSign }) {
  const offers = dealOffers(state, 'sponsor');
  const signed = dealSigned(state, 'sponsor');
  const g = expectedGames(state);
  if (!offers.length) return <SponsorNow state={state} />;
  return (
    <>
      <p className="hint">Your sponsor offers to renew, with coins for every win and a card for staying. Two new brands offer a signing bonus instead (paid on matchday 1) and coins for every win, no card. Offers grow with your fans, last season's results and the Sponsorship area.</p>
      <div className="deals">
        {offers.map((o) => {
          const k = SPONSOR_KINDS[o.kind];
          const on = signed === o.id;
          return (
            <button key={o.id} type="button" className={`deal${on ? ' is-on' : ''}`} onClick={() => onSign(o.id)} disabled={!!signed} aria-pressed={on}>
              <span className="deal__kind"><span aria-hidden="true">{k.icon}</span> {o.kind === 'renewal' ? 'Renewal · your sponsor' : `New · ${k.label}`}</span>
              <b>{o.brand}</b>
              <span className="deal__pay">{[o.bonus && `◎ ${o.bonus} signing bonus`, `◎ ${o.perWin} a win`].filter(Boolean).join(' + ')}</span>
              {o.card && <span className="deal__card">🎁 {cardName(o.card)}</span>}
              <span className="deal__text">{k.text} About {coins(sponsorEV(o, g))} at {g.wins} wins.</span>
              <span className="deal__cta">{on ? '✓ Signed' : signed ? '—' : o.kind === 'renewal' ? 'Renew' : 'Switch'}</span>
            </button>
          );
        })}
      </div>
      {!signed && <p className="hint">Not signed by kick-off: the club renews with {offers[0].brand}.</p>}
    </>
  );
}

export function SponsorNow({ state }) {
  const sp = state.sponsor;
  if (!sp) return <p className="hint">No sponsor.</p>;
  return (
    <p className="deal-now"><span aria-hidden="true">{SPONSOR_KINDS[sp.kind]?.icon || '🤝'}</span> <b>{sp.brand}</b> · ◎ {sp.perWin} a win{sp.bonus ? ` · ◎ ${sp.bonus} signing bonus` : ''}</p>
  );
}

// ---------------------------------------------------------------------------
// ⑤ TV

function Tv({ state, onSign }) {
  const offers = dealOffers(state, 'tv');
  const signed = dealSigned(state, 'tv');
  const g = expectedGames(state);
  if (!offers.length) return <p className="hint">TV: {state.tv?.brand}.</p>;
  return (
    <>
      <p className="hint">Three channels want your games. Each pays a fixed fee (over the {MATCHDAYS} league matchdays) plus coins for every game of one kind, whatever the result. {g.qualified ? 'You play in a continental cup next season.' : 'You are not in a continental cup next season.'}</p>
      <div className="deals">
        {offers.map((o) => {
          const k = TV_KINDS[o.kind];
          const on = signed === o.id;
          const n = o.kind === 'game' ? g.games : o.kind === 'home' ? g.home : g.intl;
          return (
            <button key={o.id} type="button" className={`deal${on ? ' is-on' : ''}`} onClick={() => onSign(o.id)} disabled={!!signed} aria-pressed={on}>
              <span className="deal__kind"><span aria-hidden="true">{k.icon}</span> {k.label}</span>
              <b>{o.brand}</b>
              <span className="deal__pay">◎ {o.fee} + ◎ {o.per} {k.unit}</span>
              <span className="deal__text">{k.text} About {coins(tvEV(o, g))} with {n} game{n === 1 ? '' : 's'}.</span>
              <span className="deal__cta">{on ? '✓ Signed' : signed ? '—' : 'Sign'}</span>
            </button>
          );
        })}
      </div>
      {!signed && <p className="hint">Not signed by kick-off: the club takes {offers[0].brand}.</p>}
    </>
  );
}

// ---------------------------------------------------------------------------
// ⑥ CEO meeting

function Ceo({ state, onStart }) {
  const m = ceoMeeting(state);
  const op = state.gm ? opinions(state) : null;
  const pending = dealsPending(state);
  const label = { kit: 'jersey', sponsor: 'sponsor', tv: 'TV' };
  return (
    <>
      <section className={`panel ceo ceo--${m.mood.replace(' ', '-')}`}>
        <div className="ceo__head">
          <span className="ceo__face" aria-hidden="true">{m.board >= 65 ? '😊' : m.board >= 45 ? '😐' : '😠'}</span>
          <div>
            <b>The CEO</b>
            <span>Owners {m.board} / 100 · {m.mood}</span>
          </div>
        </div>
        {m.lines.map((l) => <p key={l} className="ceo__line">“{l}”</p>)}
        {op && <p className="hint">{op.owners.mood}.</p>}
      </section>
      <section className="panel">
        <h2 className="section-title">What he expects</h2>
        <p className="ceo__objective">🎯 {m.objective.text}</p>
        {m.expect.map((l) => <p key={l} className="ceo__line">“{l}”</p>)}
        <p className="hint">The objective is set from today's squad; it's fixed when the season starts.</p>
      </section>
      {pending.length > 0 && <p className="hint hint--warn">Still open: {pending.map((k) => label[k]).join(', ')}. The defaults apply at kick-off.</p>}
      <button type="button" className="btn btn--primary btn--block" onClick={onStart} disabled={!!state.pendingOpen || state.gm?.sacked}>
        {state.gm?.sacked ? 'Take a new job first' : `Start season ${state.season.year + 1}`}
      </button>
    </>
  );
}
