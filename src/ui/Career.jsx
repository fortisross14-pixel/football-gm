import React, { useState } from 'react';
import { RARITIES } from '../engine/cards.js';
import { carryOptions, jobSecurity, SACK_LINE, LOOK_COST } from '../state/club.js';
import { standings } from '../engine/season.js';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';
import { Segmented } from './Home.jsx';
import { MyCareer } from './History.jsx';
import { opinions, ownerLine, fanLine, unreadCount } from '../state/chronicle.js';
import Sheet from './Sheet.jsx';
import { GmCard, GmFlag } from './GmCard.jsx';
import { nationOf } from '../data/nations.js';
import { yearLabel } from '../engine/years.js';

const VERDICT = { met: 'Objective met', exceeded: 'Objective exceeded', missed: 'Objective missed' };

export default function Career({ state, onAccept, onBack, onLook, onRead }) {
  const gm = state.gm;
  const [picking, setPicking] = useState(null); // offer being accepted
  const unread = unreadCount(state);
  const [tab, setTab] = useState(state.phase === 'offseason' && gm.offers.length ? 'offers' : unread ? 'inbox' : 'overview');
  const op = opinions(state);
  const pos = standings(state.season, state.club.divisionId).findIndex((r) => r.id === state.club.id) + 1;
  const review = gm.review;

  return (
    <div className="screen">
      <div className="club-head">
        <div className="rep-ring" style={{ '--rep': `${gm.reputation}%` }}><b>{gm.reputation}</b></div>
        <div>
          <b>GM career</b>
          <span>Reputation {gm.reputation}/100 · {repLabel(gm.reputation)}</span>
        </div>
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>
      <Segmented
        label="Career"
        value={tab}
        options={[
          { id: 'inbox', label: `Inbox${unread ? ` · ${unread}` : ''}` },
          { id: 'overview', label: 'Overview' },
          { id: 'offers', label: state.phase === 'offseason' ? `Offers${gm.offers.length ? ` · ${gm.offers.length}` : ''}` : 'Offers' },
          { id: 'history', label: 'History' },
        ]}
        onChange={setTab}
      />

      {tab === 'inbox' && <Inbox state={state} onRead={onRead} />}

      {tab === 'overview' && (<>
      <section className="panel">
        <h2 className="section-title">Your GM card</h2>
        <div className="gm-panel">
          <GmCard trait={gm.trait} small />
          <p className="hint">
            {state.gmName || 'You'}{gm.nation ? <> · <GmFlag nation={gm.nation} />{nationOf(gm.nation)?.name}</> : null}.{' '}
            {gm.trait ? 'Dealt when your career began: it stays with you at every club.' : 'This career started before GM cards existed, so it has none. New careers are dealt one.'}
          </p>
        </div>
      </section>
      <section className="opinions">
        <div className="opinion">
          <span className="opinion__who">Owners · {op.owners.value}</span>
          <p>{ownerLine(op.owners)}</p>
        </div>
        <div className="opinion">
          <span className="opinion__who">Fans · {op.fans.value}</span>
          <p>{fanLine(op.fans)}</p>
        </div>
      </section>
      <section className="panel contract">
        <h2 className="section-title">Contract</h2>
        <p className="objective"><b>{state.club.name}</b><span>{gm.contract ? `${yearLabel(gm.contract.from)} to ${yearLabel(gm.contract.until)}${gm.contract.until <= state.season.year ? ' · expires this season' : ''}` : 'Rolling contract'}</span></p>
        <p className="hint">At the end of a contract the owners renew it if job security is 35 or more. Otherwise you leave, with three offers to choose from.</p>
      </section>
      <p className="hint">Reputation decides which clubs want you: small clubs from 0, second-tier clubs from about 30, top divisions from about 60, and the world's biggest clubs from 85.</p>

      {gm.sacked && (
        <section className="panel sacked">
          <b>You've been sacked.</b>
          <p className="hint">{gm.securityEnd < SACK_LINE ? `Job security ended the season at ${gm.securityEnd}, under ${SACK_LINE}.` : 'Two missed objectives in a row with the owners already unhappy.'} Three clubs still want you{state.club.level === 1 ? ', one level lower' : ''}. Pick one to carry on; you can take 2 cards with you.</p>
        </section>
      )}

      <Confidence state={state} />

      {state.phase === 'season' && gm.objective && (
        <section className="panel">
          <h2 className="section-title">Board objective</h2>
          <p className="objective"><b>{gm.objective.text}</b><span className={pos <= gm.objective.target ? 'is-up' : 'is-down'}>Currently {pos}{['th', 'st', 'nd', 'rd'][pos] || 'th'}</span></p>
          <p className="hint">You're only sacked if job security ends a season under {SACK_LINE}, or you miss the objective twice in a row while security is low. Beat it, win trophies and get promoted to raise your reputation.</p>
        </section>
      )}

      {review && state.phase !== 'season' && (
        <section className="panel">
          <h2 className="section-title">{yearLabel(review.season)} review</h2>
          <p className="objective"><b>{review.objective.text}</b><span className={review.verdict === 'missed' ? 'is-down' : 'is-up'}>{VERDICT[review.verdict]} · finished {review.position}{['th', 'st', 'nd', 'rd'][review.position] || 'th'}</span></p>
          <ul className="champions">
            {review.items.map((i) => <li key={i.label}><span>{i.label}</span><b className={i.value >= 0 ? 'is-up' : 'is-down'}>{i.value >= 0 ? '+' : ''}{i.value}</b></li>)}
          </ul>
          <p className="hint">Reputation {review.before} → <b>{review.after}</b></p>
        </section>
      )}

      </>)}

      {tab === 'offers' && (state.phase !== 'offseason' ? <p className="hint">Clubs only call in the summer. When the season ends, come back here to look for offers (you can do it once each summer).</p> : (
        <section>
          <h2 className="section-title">Job offers</h2>
          {!gm.sacked && (
            gm.searched
              ? <p className="hint">You've already sounded out other clubs this summer.</p>
              : (
                <div className="look-offers">
                  <button type="button" className="btn btn--primary" onClick={onLook}>Look for offers</button>
                  <p className="hint">Your agent calls around: 2–3 offers that match your reputation ({gm.reputation}). The owners notice: −{LOOK_COST} owners' confidence.</p>
                </div>
              )
          )}
          {gm.offers.length === 0 ? <p className="hint">{gm.searched ? 'Nobody bit this time. Keep winning.' : 'No club has called yet.'}</p> : (
            <div className="offers">
              {gm.offers.map((o) => {
                const club = state.world.clubs[o.clubId];
                return (
                  <div key={o.clubId} className="offer">
                    <Crest colors={club.colors} short={club.short} size={40} id={o.clubId} />
                    <div className="offer__body">
                      <ClubLink id={o.clubId}><b>{o.name}</b></ClubLink>
                      <span>{o.division} · strength {Math.round(club.strength)} · {club.keyPlayers.length} named players</span>
                    </div>
                    <button type="button" className="btn btn--small btn--primary" disabled={!!state.pendingOpen} onClick={() => setPicking(o)}>Accept</button>
                  </div>
                );
              })}
            </div>
          )}
          {!gm.sacked && gm.offers.length > 0 && <p className="hint">Or stay where you are: just start the next season.</p>}
        </section>
      ))}

      {tab === 'history' && (<>
      <section>
        <h2 className="section-title">Clubs managed</h2>
        <ul className="champions">
          {gm.career.map((c, i) => (
            <li key={i}><span><ClubLink id={c.clubId}>{c.name}</ClubLink></span><b>{yearLabel(c.from)}{c.to ? `–${yearLabel(c.to)}` : ' – now'}</b></li>
          ))}
        </ul>
      </section>
      <MyCareer state={state} />
      </>)}

      {picking && <CarrySheet state={state} offer={picking} onClose={() => setPicking(null)} onConfirm={(keys) => { onAccept(picking.clubId, keys); setPicking(null); }} />}
    </div>
  );
}

function CarrySheet({ state, offer, onClose, onConfirm }) {
  const [chosen, setChosen] = useState([]);
  const opts = carryOptions(state);
  const toggle = (key) => setChosen((c) => (c.includes(key) ? c.filter((k) => k !== key) : c.length < 2 ? [...c, key] : c));
  return (
    <Sheet title={`Move to ${offer.name}`} onClose={onClose}>
      <p className="hint">Choose up to 2 cards to take with you. Everything else (other players, coaches, coins, packs, items and facilities) stays at {state.club.name}.</p>
      <div className="carry-list">
        {opts.map((o) => (
          <button key={o.key} type="button" className={`carry${chosen.includes(o.key) ? ' is-selected' : ''}${o.rarity ? ` r-${o.rarity}` : ''}`} onClick={() => toggle(o.key)}>
            <span className="carry__kind">{o.kind}</span>
            <span className="carry__label">{o.label}</span>
            {o.rarity && <span className="carry__rarity">{RARITIES[o.rarity]?.label}</span>}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={() => onConfirm(chosen)}>
        Sign with {offer.name} · taking {chosen.length}/2
      </button>
    </Sheet>
  );
}

function repLabel(r) {
  if (r >= 85) return 'World-class';
  if (r >= 60) return 'Top-flight';
  if (r >= 30) return 'Established';
  if (r >= 15) return 'Promising';
  return 'Rookie';
}

// Owners judge results against the objective; fans want wins, goals and trophies.
export function Confidence({ state, compact }) {
  const c = state.gm?.confidence;
  if (!c) return null;
  const sec = jobSecurity(state);
  const tone = (v) => (v < SACK_LINE ? 'is-bad' : v < 50 ? 'is-warn' : 'is-good');
  const mood = sec < SACK_LINE ? 'Your job is in danger' : sec < 45 ? 'The owners are getting nervous' : sec < 70 ? 'Stable' : 'The owners love you';
  return (
    <section className={`confidence${compact ? ' confidence--compact' : ''}`}>
      {!compact && <h2 className="section-title">Owners & fans</h2>}
      <div className="confidence__bars">
        {[['Owners', c.board], ['Fans', c.fans], ['Job security', sec]].map(([label, v]) => (
          <div key={label} className={`meter ${tone(v)}`}>
            <span>{label}</span>
            <div className="bar"><i style={{ width: `${v}%` }} /><em style={{ left: `${SACK_LINE}%` }} /></div>
            <b>{Math.round(v)}</b>
          </div>
        ))}
      </div>
      {!compact && <p className="hint">{mood}. Security mixes owners (65%) and fans (35%). Wins, goals and cup runs lift them; defeats and missing the target drop them.</p>}
    </section>
  );
}

const KIND_ICON = { title: '🏆', board: '🏢', fans: '📣', squad: '✍', club: '🏗', career: '💼', match: '🔥', award: '🏅' };

// News from the club, newest first.
function Inbox({ state, onRead }) {
  const list = state.inbox || [];
  const [open, setOpen] = useState(null);
  if (!list.length) return <p className="hint">No messages yet. News about titles, the owners, the fans, signings and building works arrives here.</p>;
  return (
    <>
      {list.some((m) => !m.read) && <button type="button" className="link-btn" onClick={() => onRead?.(null)}>Mark all as read</button>}
      <ul className="inbox">
        {list.map((m) => (
          <li key={m.id} className={`inbox__item is-${m.kind}${m.read ? '' : ' is-unread'}${open === m.id ? ' is-open' : ''}`}>
            <button type="button" onClick={() => { setOpen(open === m.id ? null : m.id); if (!m.read) onRead?.(m.id); }}>
              <span className="inbox__icon" aria-hidden="true">{KIND_ICON[m.kind] || '✉'}</span>
              <span className="inbox__title">{m.title}</span>
              <span className="inbox__when">{yearLabel(m.year)}{m.md ? ` · MD ${m.md}` : ''}</span>
            </button>
            {open === m.id && m.body && <p className="inbox__body">{m.body}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
