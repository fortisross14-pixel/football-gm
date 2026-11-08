import React, { useEffect, useState } from 'react';
import { PlayerCard, CoachCard, MiniCard } from './Card.jsx';
import { overall, RARITIES } from '../engine/cards.js';
import { pendingCard, duplicateOf, canMerge, isCoach } from '../state/club.js';

// Full-screen flow for every new card: reveal, then Keep / Merge / Discard.
export default function PackOpening({ state, onKeep, onMerge, onDiscard, onDiscardCommons, reduceMotion }) {
  const p = state.pendingOpen;
  const card = pendingCard(state);
  const [revealed, setRevealed] = useState(false);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    setRevealed(false);
    setChoosing(false);
    const t = setTimeout(() => setRevealed(true), reduceMotion ? 0 : 650);
    return () => clearTimeout(t);
  }, [p?.index, p?.source]);

  if (!card) return null;
  const dup = duplicateOf(state, card);
  const coach = isCoach(card);
  const big = ['epic', 'legend'].includes(card.rarity);
  const sell = RARITIES[card.rarity]?.quickSell || 0;
  const colors = state.club.colors;
  let commonsLeft = 0;
  for (let i = p.index; i < p.cards.length && ['common', 'academy'].includes(p.cards[i].rarity); i += 1) commonsLeft += 1;

  return (
    <div className="opening" role="dialog" aria-label="New card">
      <div className="opening__head">
        <span>{p.source}</span>
        <span>Card {p.index + 1} of {p.cards.length}</span>
      </div>

      <div className={`opening__stage${revealed ? ' is-revealed' : ''}${big ? ` is-${card.rarity}` : ''}`}>
        {!revealed ? (
          <button type="button" className={`card-back r-${card.rarity}`} onClick={() => setRevealed(true)} aria-label="Reveal card"><span>?</span></button>
        ) : coach ? (
          <div className="reveal"><CoachCard coach={card} role="new" /></div>
        ) : (
          <div className="reveal"><PlayerCard card={card} colors={colors} /></div>
        )}
      </div>

      {revealed && !choosing && (
        <div className="opening__actions">
          {dup ? (
            <>
              <p className="hint">You already own {card.name}{dup.stars ? ` (${'★'.repeat(dup.stars)})` : ''}.</p>
              <button type="button" className="btn btn--primary btn--block" disabled={!canMerge(state, card)} onClick={onMerge}>
                {canMerge(state, card) ? 'Merge: +1★, +2 all stats, +30 matches' : 'Already at max stars'}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--block" onClick={() => setChoosing(true)}>
              Keep {coach ? 'coach' : 'player'}
            </button>
          )}
          <button type="button" className="btn btn--ghost btn--block" onClick={onDiscard}>
            Discard · +{sell} coins
          </button>
          {commonsLeft > 1 && (
            <button type="button" className="link-btn" onClick={onDiscardCommons}>Quick-sell all {commonsLeft} Commons in a row</button>
          )}
        </div>
      )}

      {revealed && choosing && (
        <div className="opening__actions">
          {coach ? (
            <>
              <p className="hint">Pick who {card.name} replaces. The old coach is released for coins.</p>
              <div className="coaches">
                <CoachCard coach={state.coaches.coach} role="coach" onClick={() => onKeep({ role: 'coach' })} />
                <CoachCard coach={state.coaches.assistant} role="assistant" onClick={() => onKeep({ role: 'assistant' })} />
              </div>
            </>
          ) : (
            <ReleasePicker state={state} card={card} onPick={(id) => onKeep({ replaceId: id })} />
          )}
          <button type="button" className="link-btn" onClick={() => setChoosing(false)}>Back</button>
        </div>
      )}
    </div>
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
