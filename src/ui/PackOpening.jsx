import React, { useEffect, useRef, useState } from 'react';
import { PlayerCard, CoachCard, MiniCard, PackArt, Flag } from './Card.jsx';
import { Silhouette } from './Art.jsx';
import { sfx, haptic } from './motion.js';
import { overall, RARITIES } from '../engine/cards.js';
import { pendingCard, duplicateOf, canMerge, isCoach, POOL_BY_ID } from '../state/club.js';

// Full-screen flow for every new card, in three phases:
//   sealed  → the pack breathes; tap to open (it shakes and bursts)
//   fan     → cards face down, Rare+ glow and Epic/Legend tremble; tap to flip, or Reveal all
//   decide  → one card at a time: Keep / Merge / Discard
// Every phase can be skipped; game state never waits for the animation.
export default function PackOpening({ state, onKeep, onMerge, onDiscard, onDiscardCommons, reduceMotion }) {
  const p = state.pendingOpen;
  const card = pendingCard(state);
  const session = p ? `${p.source}|${p.cards.map((c) => c.id).join(',')}` : '';
  const [phase, setPhase] = useState(p && p.index > 0 ? 'decide' : 'sealed');
  const [bursting, setBursting] = useState(false);
  const [flipped, setFlipped] = useState([]);
  const [choosing, setChoosing] = useState(false);
  const [album] = useState(() => new Set(state.album)); // what counted as "new" when the pack opened
  const timers = useRef([]);
  const later = (ms, fn) => timers.current.push(setTimeout(fn, reduceMotion ? 0 : ms));

  useEffect(() => {
    setPhase(p && p.index > 0 ? 'decide' : 'sealed');
    setFlipped([]);
    setBursting(false);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [session]);
  useEffect(() => { setChoosing(false); }, [p?.index]);

  if (!card) return null;
  const colors = state.club.colors;

  const open = () => {
    if (bursting) return;
    sfx('pack-open');
    haptic(20);
    setBursting(true);
    later(560, () => { setPhase('fan'); setBursting(false); });
  };
  const flip = (i) => {
    if (flipped.includes(i)) return;
    const c = p.cards[i];
    sfx(TIER(c) >= 3 ? 'reveal-big' : 'reveal');
    if (TIER(c) >= 3) haptic(35);
    setFlipped((f) => [...f, i]);
  };
  const revealAll = () => {
    p.cards.forEach((_, i) => later(i * 160, () => flip(i)));
  };
  const allFlipped = flipped.length >= p.cards.length;
  const skip = () => { timers.current.forEach(clearTimeout); setFlipped(p.cards.map((_, i) => i)); setPhase('decide'); };

  if (phase === 'sealed') {
    return (
      <div className="opening opening--sealed" role="dialog" aria-label={p.source}>
        <div className="opening__head"><span>{p.source}</span><button type="button" className="link-btn" onClick={skip}>Skip</button></div>
        <div className="opening__floodlights" aria-hidden="true" />
        <button type="button" className={`sealed${bursting ? ' is-bursting' : ''}`} onClick={open} aria-label="Open">
          {p.packId ? <PackArt packId={p.packId} big /> : <Envelope label={p.source} count={p.cards.length} />}
        </button>
        <p className="opening__cta">{bursting ? '' : 'Tap to open'}</p>
      </div>
    );
  }

  if (phase === 'fan') {
    return (
      <div className="opening opening--fan" role="dialog" aria-label={p.source}>
        <div className="opening__head"><span>{p.source}</span><button type="button" className="link-btn" onClick={skip}>Skip</button></div>
        <div className="opening__floodlights" aria-hidden="true" />
        <div className={`fan fan--${p.cards.length}`}>
          {p.cards.map((c, i) => (
            <FanCard
              key={`${c.id}-${i}`}
              card={c}
              index={i}
              colors={colors}
              flipped={flipped.includes(i)}
              isNew={!!POOL_BY_ID[c.id] && !album.has(c.id)}
              isDup={!!duplicateOf(state, c)}
              onFlip={() => flip(i)}
            />
          ))}
        </div>
        <div className="opening__actions">
          {allFlipped ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setPhase('decide')}>Continue</button>
          ) : (
            <>
              <p className="opening__cta">Tap a card to flip it</p>
              <button type="button" className="btn btn--ghost btn--block" onClick={revealAll}>Reveal all</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const dup = duplicateOf(state, card);
  const coach = isCoach(card);
  const big = ['epic', 'legend'].includes(card.rarity);
  const sell = RARITIES[card.rarity]?.quickSell || 0;
  let commonsLeft = 0;
  for (let i = p.index; i < p.cards.length && ['common', 'academy'].includes(p.cards[i].rarity); i += 1) commonsLeft += 1;

  return (
    <div className="opening" role="dialog" aria-label="New card">
      <div className="opening__head">
        <span>{p.source}</span>
        <span>Card {p.index + 1} of {p.cards.length}</span>
      </div>
      {p.cards.length > 1 && (
        <div className="opening__dots" aria-hidden="true">
          {p.cards.map((c, i) => <i key={i} className={`r-${c.rarity}${i === p.index ? ' is-on' : i < p.index ? ' is-done' : ''}`} />)}
        </div>
      )}

      <div className={`opening__stage is-revealed${big ? ` is-${card.rarity}` : ''}`}>
        <div className="reveal" key={p.index}>
          {coach ? <CoachCard coach={card} role="new" /> : <PlayerCard card={card} colors={colors} />}
        </div>
      </div>

      {!choosing && (
        <div className="opening__actions">
          {dup ? (
            <>
              <p className="hint">You already own {card.name}{dup.stars ? ` (${'★'.repeat(dup.stars)})` : ''}.</p>
              <button type="button" className="btn btn--primary btn--block" disabled={!canMerge(state, card)} onClick={() => { sfx('merge'); onMerge(); }}>
                {canMerge(state, card) ? 'Merge: +1★, +2 all stats, +30 matches' : 'Already at max stars'}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setChoosing(true)}>
              Keep {coach ? 'coach' : 'player'}
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--block" onClick={() => { sfx('discard'); onDiscard(); }}>
            Discard · +{sell} coins
          </button>
          {commonsLeft > 1 && (
            <button type="button" className="link-btn" onClick={onDiscardCommons}>Quick-sell all {commonsLeft} Commons in a row</button>
          )}
        </div>
      )}

      {choosing && (
        <div className="opening__actions">
          {coach ? (
            <>
              <p className="hint">Pick who {card.name} replaces. The old coach is released for coins.</p>
              <div className="coaches">
                <CoachCard coach={state.coaches.coach} role="coach" onClick={() => { sfx('keep'); onKeep({ role: 'coach' }); }} />
                <CoachCard coach={state.coaches.assistant} role="assistant" onClick={() => { sfx('keep'); onKeep({ role: 'assistant' }); }} />
              </div>
            </>
          ) : (
            <ReleasePicker state={state} card={card} onPick={(id) => { sfx('keep'); onKeep({ replaceId: id }); }} />
          )}
          <button type="button" className="link-btn" onClick={() => setChoosing(false)}>Back</button>
        </div>
      )}
    </div>
  );
}

const TIER = (c) => ['academy', 'common', 'uncommon', 'rare', 'epic', 'legend'].indexOf(c.rarity) - 1;

// A face-down card in the fan. Rare+ glow at the edge; Epic and Legend tremble before the flip.
function FanCard({ card, index, colors, flipped, isNew, isDup, onFlip }) {
  const coach = isCoach(card);
  const tier = TIER(card);
  return (
    <button
      type="button"
      className={`flip r-${card.rarity}${flipped ? ' is-flipped' : ''}${tier >= 2 ? ' is-glowing' : ''}${tier >= 3 ? ' is-trembling' : ''}`}
      style={{ '--i': index }}
      onClick={onFlip}
      aria-label={flipped ? card.name : 'Face-down card: tap to flip'}
    >
      <span className="flip__inner">
        <span className="flip__back"><span>FC</span></span>
        <span className="flip__front">
          <span className="flip__ovr">{coach ? card.formation : overall(card)}</span>
          <span className="flip__pos">{coach ? 'COACH' : card.pos}<Flag card={card} className="flip__flag" /></span>
          {!coach && <span className="flip__art"><Silhouette colors={colors} pos={card.pos} seed={card.id} /></span>}
          <span className="flip__name">{card.name}</span>
          <span className="flip__rarity">{RARITIES[card.rarity]?.label}</span>
          {flipped && isNew && <span className="flip__badge">NEW</span>}
          {flipped && isDup && <span className="flip__badge flip__badge--dup">DUPLICATE</span>}
          {flipped && tier >= 2 && <span className="flip__ring" aria-hidden="true" />}
          {flipped && tier >= 3 && <span className="flip__sweep" aria-hidden="true" />}
          {flipped && tier >= 3 && <Burst />}
        </span>
      </span>
    </button>
  );
}

// A small burst of sparks for Epic and Legend reveals.
function Burst() {
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <i key={i} style={{ '--a': `${(360 / 14) * i}deg`, '--d': `${70 + (i % 3) * 22}px` }} />
      ))}
    </span>
  );
}

function Envelope({ label, count }) {
  return (
    <span className="envelope">
      <span className="envelope__flap" />
      <span className="envelope__label">{label}</span>
      <span className="envelope__count">{count} card{count > 1 ? 's' : ''}</span>
    </span>
  );
}

function ReleasePicker({ state, card, onPick }) {
  const newOvr = overall(card);
  const where = (id) => (state.lineup.includes(id) ? 'Starter' : 'Bench');
  const list = [...state.squad].sort((a, b) => (b.pos === card.pos) - (a.pos === card.pos) || overall(a) - overall(b));
  return (
    <>
      <p className="hint">Your squad is full (10). Pick who {card.name} replaces. They take that player's spot.</p>
      <div className="release-list">
        {list.map((c) => {
          const diff = newOvr - overall(c);
          return (
            <button type="button" key={c.id} className="release" onClick={() => onPick(c.id)}>
              <MiniCard card={c} />
              <span className="release__info">
                <b>{c.name}</b>
                <span>{where(c.id)} · {c.matchesLeft == null ? 'Academy' : `${c.matchesLeft} left`}</span>
                <span>Release · +{RARITIES[c.rarity]?.quickSell || 0} coins</span>
              </span>
              <span className={`release__diff ${diff >= 0 ? 'is-up' : 'is-down'}`}>{diff >= 0 ? '+' : ''}{diff}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
