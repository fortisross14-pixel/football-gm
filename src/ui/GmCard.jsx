import React, { useEffect, useState } from 'react';
import { RARITIES } from '../engine/cards.js';
import { GM_TRAITS, GM_STYLES, traitText } from '../engine/gmTraits.js';
import { nationOf } from '../data/nations.js';
import { sfx, haptic, reducedMotion } from './motion.js';

// The GM card (engine/gmTraits.js): permanent for the career. trait null = older career, no card.
export function GmCard({ trait, small = false }) {
  const def = trait ? GM_TRAITS[trait.id] : null;
  if (!def) {
    return (
      <div className={`ocard gmcard r-academy${small ? ' gmcard--small' : ''}`}>
        <div className="ocard__top"><span>GM card</span><span>—</span></div>
        <span className="ocard__icon" aria-hidden="true">🗂</span>
        <span className="ocard__name">No card</span>
        <span className="ocard__text">{traitText(null)}</span>
      </div>
    );
  }
  return (
    <div className={`ocard gmcard r-${trait.rarity}${small ? ' gmcard--small' : ''}`}>
      <div className="ocard__top"><span>{GM_STYLES[def.style].name} GM</span><span>{RARITIES[trait.rarity].label}</span></div>
      <span className="ocard__icon" aria-hidden="true">{def.icon}</span>
      <span className="ocard__name">{def.name}</span>
      <span className="ocard__text">{traitText(trait)}</span>
    </div>
  );
}

// One line for lists: icon, name and rarity.
export function GmTraitTag({ trait }) {
  const def = trait ? GM_TRAITS[trait.id] : null;
  if (!def) return <span className="gm-tag is-none">No GM card</span>;
  return <span className={`gm-tag r-${trait.rarity}`} title={traitText(trait)}>{def.icon} {def.name} · {RARITIES[trait.rarity].label}</span>;
}

export function GmFlag({ nation }) {
  const n = nationOf(nation);
  return n ? <span className="gm-flag" title={n.name}>{n.flag}</span> : null;
}

// The reveal: the card is dealt face down, then flips (tap to flip at once).
export function GmCardReveal({ trait, onDone }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => flip(), reducedMotion() ? 0 : 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trait?.id, trait?.rarity]);
  const flip = () => {
    if (flipped) return;
    sfx(['rare', 'epic'].includes(trait.rarity) ? 'reveal-big' : 'reveal');
    if (trait.rarity === 'epic') haptic(35);
    setFlipped(true);
    onDone?.();
  };
  const big = ['rare', 'epic'].includes(trait.rarity);
  return (
    <button type="button" className={`gm-reveal r-${trait.rarity}${flipped ? ' is-flipped' : ''}${big ? ' is-glowing' : ''}`} onClick={flip} aria-label={flipped ? GM_TRAITS[trait.id].name : 'Face-down GM card: tap to flip'}>
      <span className="gm-reveal__inner">
        <span className="gm-reveal__back"><span>GM</span></span>
        <span className="gm-reveal__front"><GmCard trait={trait} /></span>
      </span>
    </button>
  );
}
