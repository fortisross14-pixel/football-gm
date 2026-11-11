import React, { useEffect, useRef, useState } from 'react';
import { PackArt } from './Card.jsx';
import { sfx, haptic } from './motion.js';
import { RARITIES } from '../engine/cards.js';
import { OFFSEASON_CARDS, cardLabel, cardText, TIERS } from '../data/offseason.js';
import { FACILITY_LABEL, STADIUM_PARTS } from '../data/facilities.js';

// Club pack opening, the same studio as player packs:
//   sealed → the pack breathes; tap to open
//   fan    → 3 club cards face down (1 for Bronze); tap to flip, or Reveal all
//   pick   → tap the one you want, then Keep it: it goes to Cards → Club
// Every phase can be skipped; game state never waits for the animation.
export default function ClubPackOpening({ state, onPick, reduceMotion }) {
  const p = state.pendingPick;
  const session = p ? p.cards.map((c) => c.uid).join(',') : '';
  const [phase, setPhase] = useState('sealed');
  const [bursting, setBursting] = useState(false);
  const [flipped, setFlipped] = useState([]);
  const [chosen, setChosen] = useState(null);
  const timers = useRef([]);
  const later = (ms, fn) => timers.current.push(setTimeout(fn, reduceMotion ? 0 : ms));

  useEffect(() => {
    setPhase('sealed');
    setFlipped([]);
    setChosen(null);
    setBursting(false);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [session]);

  if (!p) return null;
  const single = p.cards.length === 1;

  const open = () => {
    if (bursting) return;
    sfx('pack-open');
    haptic(20);
    setBursting(true);
    later(560, () => { setPhase('fan'); setBursting(false); });
  };
  const flip = (i) => {
    const c = p.cards[i];
    sfx(TIERS.indexOf(c.rarity) >= 3 ? 'reveal-big' : 'reveal');
    if (TIERS.indexOf(c.rarity) >= 3) haptic(35);
    setFlipped((f) => (f.includes(i) ? f : [...f, i]));
    if (single) setChosen(0);
  };
  const revealAll = () => p.cards.forEach((_, i) => later(i * 160, () => flip(i)));
  const allFlipped = flipped.length >= p.cards.length;
  const skip = () => { timers.current.forEach(clearTimeout); setFlipped(p.cards.map((_, i) => i)); setPhase('fan'); if (single) setChosen(0); };
  const tap = (i) => {
    if (!flipped.includes(i)) { flip(i); return; }
    if (allFlipped) { sfx('reveal'); setChosen(i); }
  };
  const keep = () => { sfx('keep'); haptic(15); onPick(chosen); };

  if (phase === 'sealed') {
    return (
      <div className="opening opening--sealed" role="dialog" aria-label={p.source}>
        <div className="opening__head"><span>{p.source}</span><button type="button" className="link-btn" onClick={skip}>Skip</button></div>
        <div className="opening__floodlights" aria-hidden="true" />
        <button type="button" className={`sealed${bursting ? ' is-bursting' : ''}`} onClick={open} aria-label="Open">
          <PackArt packId={p.packId} big />
        </button>
        <p className="opening__cta">{bursting ? '' : 'Tap to open'}</p>
      </div>
    );
  }

  const pick = chosen !== null ? p.cards[chosen] : null;
  return (
    <div className="opening opening--fan opening--club" role="dialog" aria-label={p.source}>
      <div className="opening__head"><span>{p.source}</span><span>{single ? '1 club card' : 'Keep 1 of 3'}</span></div>
      <div className="opening__floodlights" aria-hidden="true" />
      <div className={`fan fan--${p.cards.length}`}>
        {p.cards.map((c, i) => (
          <ClubFlip
            key={c.uid}
            card={c}
            index={i}
            flipped={flipped.includes(i)}
            chosen={chosen === i}
            dim={chosen !== null && chosen !== i}
            onTap={() => tap(i)}
          />
        ))}
      </div>
      <div className="opening__actions">
        {!allFlipped ? (
          <>
            <p className="opening__cta">Tap a card to flip it</p>
            <button type="button" className="btn btn--ghost btn--block" onClick={revealAll}>Reveal all</button>
          </>
        ) : pick ? (
          <>
            <p className="hint club-pick__text"><b>{OFFSEASON_CARDS[pick.type].name}</b> · {RARITIES[pick.rarity].label}: {cardText(pick.type, pick.rarity)}</p>
            <button type="button" className="btn btn--primary btn--block" onClick={keep}>
              Keep {OFFSEASON_CARDS[pick.type].name}
            </button>
            {!single && <p className="hint">The other two go back in the deck.</p>}
          </>
        ) : (
          <p className="opening__cta">Pick the one you want to keep</p>
        )}
      </div>
    </div>
  );
}

// A face-down club card. Rare+ glow at the edge; Epic and Legend tremble before the flip.
function ClubFlip({ card, index, flipped, chosen, dim, onTap }) {
  const def = OFFSEASON_CARDS[card.type];
  const tier = TIERS.indexOf(card.rarity);
  return (
    <button
      type="button"
      className={`flip flip--club r-${card.rarity}${flipped ? ' is-flipped' : ''}${tier >= 2 ? ' is-glowing' : ''}${tier >= 3 ? ' is-trembling' : ''}${chosen ? ' is-chosen' : ''}${dim ? ' is-dim' : ''}`}
      style={{ '--i': index }}
      onClick={onTap}
      aria-pressed={flipped ? chosen : undefined}
      aria-label={flipped ? `${def.name}, ${RARITIES[card.rarity].label}` : 'Face-down club card: tap to flip'}
    >
      <span className="flip__inner">
        <span className="flip__back"><span>CLUB</span></span>
        <span className="flip__front">
          <span className="flip__kind">{cardLabel(card.type)}</span>
          <span className="flip__icon" aria-hidden="true">{def.icon}</span>
          <span className="flip__name">{def.name}</span>
          <span className="flip__rarity">{RARITIES[card.rarity].label}</span>
          <span className='flip__blurb'>{def.facility ? `${def.part ? STADIUM_PARTS[def.part].label : def.facility === 'stadium' ? 'Weakest stadium part' : FACILITY_LABEL[def.facility]} ${card.rarity === 'legend' ? '+2 levels' : `+1, up to L${def.values[tier]}`}` : cardText(card.type, card.rarity)}</span>
          {flipped && tier >= 2 && <span className="flip__ring" aria-hidden="true" />}
          {flipped && tier >= 3 && <span className="flip__sweep" aria-hidden="true" />}
        </span>
      </span>
    </button>
  );
}
