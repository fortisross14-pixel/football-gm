import React, { useMemo, useState } from 'react';
import { Crest } from './Art.jsx';
import { starterOffers } from '../state/club.js';
import { randomSeed } from '../engine/rng.js';

// A rookie GM: enter a name, then pick one of three small clubs that offer a first job.
export default function NewCareer({ onStart, onCancel }) {
  const [name, setName] = useState('');
  const [seed, setSeed] = useState(randomSeed);
  const offers = useMemo(() => starterOffers(seed), [seed]);
  const [pick, setPick] = useState(null);

  return (
    <div className="menu new-career">
      <button type="button" className="link-btn new-career__back" onClick={onCancel}>‹ Back</button>
      <h1>New career</h1>
      <p className="hint">You're a rookie GM. Three small clubs have offered you a first job. Win, build a reputation and the bigger clubs will call.</p>

      <label className="field">
        <span>Your name</span>
        <input value={name} maxLength={24} placeholder="e.g. Alex Ferreira" onChange={(e) => setName(e.target.value)} />
      </label>

      <h2 className="section-title">Job offers</h2>
      <div className="offers">
        {offers.map((o) => (
          <button key={o.clubId} type="button" className={`offer offer--pick${pick === o.clubId ? ' is-selected' : ''}`} onClick={() => setPick(o.clubId)}>
            <Crest colors={o.colors} short={o.short} size={44} />
            <span className="offer__body">
              <b>{o.name}</b>
              <span>{o.division} · {o.legends} club legends in its history</span>
            </span>
            <span className="offer__tick" aria-hidden="true">{pick === o.clubId ? '✓' : ''}</span>
          </button>
        ))}
      </div>
      <button type="button" className="link-btn" onClick={() => { setSeed(randomSeed()); setPick(null); }}>Show other offers</button>

      <button type="button" className="btn btn--primary btn--block" disabled={!pick} onClick={() => onStart({ clubId: pick, gmName: name.trim() || 'Rookie GM' })}>
        {pick ? `Sign with ${offers.find((o) => o.clubId === pick).name}` : 'Pick a club'}
      </button>
    </div>
  );
}
