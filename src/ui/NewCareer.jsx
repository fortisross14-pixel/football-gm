import React, { useMemo, useState } from 'react';
import { Crest } from './Art.jsx';
import { starterOffers } from '../state/club.js';
import { randomSeed } from '../engine/rng.js';
import { NATIONS } from '../data/nations.js';
import { GM_STYLES, GM_STYLE_IDS, GM_TRAITS, drawGmTrait } from '../engine/gmTraits.js';
import { GmCardReveal } from './GmCard.jsx';

const NATION_LIST = Object.entries(NATIONS).sort((a, b) => a[1].name.localeCompare(b[1].name));

// A rookie GM, in three steps:
//   profile → name, country of origin and a GM style
//   card    → the GM card for that style is dealt (random card, random rarity) and revealed
//   club    → pick one of three small clubs that offer a first job
export default function NewCareer({ onStart, onCancel }) {
  const [step, setStep] = useState('profile');
  const [name, setName] = useState('');
  const [nation, setNation] = useState('ENG');
  const [style, setStyle] = useState(null);
  const [trait, setTrait] = useState(null);
  const [seed, setSeed] = useState(randomSeed);
  const offers = useMemo(() => starterOffers(seed), [seed]);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const deal = () => {
    setTrait(drawGmTrait(style, randomSeed()));
    setRevealed(false);
    setStep('card');
  };

  if (step === 'card' && trait) {
    return (
      <div className="menu new-career">
        <h1>Your GM card</h1>
        <p className="hint">A {GM_STYLES[style].name.toLowerCase()} GM. This card stays with you for the whole career, at every club.</p>
        <div className="gm-reveal-stage">
          <GmCardReveal trait={trait} onDone={() => setRevealed(true)} />
        </div>
        <button type="button" className="btn btn--primary btn--block" disabled={!revealed} onClick={() => setStep('club')}>
          {revealed ? `${GM_TRAITS[trait.id].name}: see the job offers` : 'Tap the card'}
        </button>
      </div>
    );
  }

  if (step === 'club') {
    return (
      <div className="menu new-career">
        <button type="button" className="link-btn new-career__back" onClick={() => setStep('card')}>‹ Back</button>
        <h1>Job offers</h1>
        <p className="hint">You're a rookie GM. Three small clubs have offered you a first job. Win, build a reputation and the bigger clubs will call.</p>
        <div className="offers">
          {offers.map((o) => (
            <button key={o.clubId} type="button" className={`offer offer--pick${pick === o.clubId ? ' is-selected' : ''}`} onClick={() => setPick(o.clubId)}>
              <Crest colors={o.colors} short={o.short} size={44} id={o.clubId} />
              <span className="offer__body">
                <b>{o.name}</b>
                <span>{o.division} · {o.legends} club legends in its history</span>
              </span>
              <span className="offer__tick" aria-hidden="true">{pick === o.clubId ? '✓' : ''}</span>
            </button>
          ))}
        </div>
        <button type="button" className="link-btn" onClick={() => { setSeed(randomSeed()); setPick(null); }}>Show other offers</button>
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!pick}
          onClick={() => onStart({ clubId: pick, gmName: name.trim() || 'Rookie GM', nation, style, trait })}
        >
          {pick ? `Sign with ${offers.find((o) => o.clubId === pick).name}` : 'Pick a club'}
        </button>
      </div>
    );
  }

  return (
    <div className="menu new-career">
      <button type="button" className="link-btn new-career__back" onClick={onCancel}>‹ Back</button>
      <h1>New career</h1>
      <p className="hint">Who are you? Pick a name, where you're from and the kind of GM you are.</p>

      <label className="field">
        <span>Your name</span>
        <input value={name} maxLength={24} placeholder="e.g. Alex Ferreira" onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="field">
        <span>Country of origin</span>
        <span className="field__select">
          <select value={nation} onChange={(e) => setNation(e.target.value)}>
            {NATION_LIST.map(([code, n]) => <option key={code} value={code}>{n.flag} {n.name}</option>)}
          </select>
        </span>
      </label>

      <h2 className="section-title">GM style</h2>
      <div className="gm-styles" role="radiogroup" aria-label="GM style">
        {GM_STYLE_IDS.map((id) => {
          const st = GM_STYLES[id];
          return (
            <button key={id} type="button" role="radio" aria-checked={style === id} className={`gm-style${style === id ? ' is-selected' : ''}`} onClick={() => setStyle(id)}>
              <span className="gm-style__icon" aria-hidden="true">{st.icon}</span>
              <span className="gm-style__body">
                <b>{st.name}</b>
                <span>{st.text}</span>
                <small>{st.cards.map((c) => GM_TRAITS[c].name).join(' · ')}</small>
              </span>
            </button>
          );
        })}
      </div>
      <p className="hint">You're dealt one card of your style at random. Its rarity (Common to Epic) sets how strong it is.</p>

      <button type="button" className="btn btn--primary btn--block" disabled={!style} onClick={deal}>
        {style ? 'Deal my GM card' : 'Pick a style'}
      </button>
    </div>
  );
}
