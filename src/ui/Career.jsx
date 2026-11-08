import React, { useState } from 'react';
import { RARITIES } from '../engine/cards.js';
import { carryOptions, jobSecurity, SACK_LINE } from '../state/club.js';
import { standings } from '../engine/season.js';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';
import Sheet from './Sheet.jsx';

const VERDICT = { met: 'Objective met', exceeded: 'Objective exceeded', missed: 'Objective missed' };

export default function Career({ state, onAccept, onBack }) {
  const gm = state.gm;
  const [picking, setPicking] = useState(null); // offer being accepted
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
      <p className="hint">Reputation decides which clubs want you: small clubs from 0, second-tier clubs from about 30, top divisions from about 60, and the world's biggest clubs from 85.</p>

      {gm.sacked && (
        <section className="panel sacked">
          <b>You've been sacked.</b>
          <p className="hint">{gm.missedInRow >= 2 ? 'Two missed objectives in a row.' : `Job security ended the season at ${gm.securityEnd}, under ${SACK_LINE}.`} Three clubs still want you{state.club.level === 1 ? ', one level lower' : ''}. Pick one to carry on; you can take 2 cards with you.</p>
        </section>
      )}

      <Confidence state={state} />

      {state.phase === 'season' && gm.objective && (
        <section className="panel">
          <h2 className="section-title">Board objective</h2>
          <p className="objective"><b>{gm.objective.text}</b><span className={pos <= gm.objective.target ? 'is-up' : 'is-down'}>Currently {pos}{['th', 'st', 'nd', 'rd'][pos] || 'th'}</span></p>
          <p className="hint">Miss it two seasons in a row, or end a season with job security under {SACK_LINE}, and you are sacked. Beat it, win trophies and get promoted to raise your reputation.</p>
        </section>
      )}

      {review && state.phase !== 'season' && (
        <section className="panel">
          <h2 className="section-title">Season {review.season} review</h2>
          <p className="objective"><b>{review.objective.text}</b><span className={review.verdict === 'missed' ? 'is-down' : 'is-up'}>{VERDICT[review.verdict]} · finished {review.position}{['th', 'st', 'nd', 'rd'][review.position] || 'th'}</span></p>
          <ul className="champions">
            {review.items.map((i) => <li key={i.label}><span>{i.label}</span><b className={i.value >= 0 ? 'is-up' : 'is-down'}>{i.value >= 0 ? '+' : ''}{i.value}</b></li>)}
          </ul>
          <p className="hint">Reputation {review.before} → <b>{review.after}</b></p>
        </section>
      )}

      {state.phase === 'offseason' && (
        <section>
          <h2 className="section-title">Job offers</h2>
          {gm.offers.length === 0 ? <p className="hint">No offers this summer. Keep winning.</p> : (
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
      )}

      <section>
        <h2 className="section-title">Clubs managed</h2>
        <ul className="champions">
          {gm.career.map((c, i) => (
            <li key={i}><span>{c.name}</span><b>Season {c.from}{c.to ? `–${c.to}` : ' – now'}</b></li>
          ))}
        </ul>
      </section>

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
