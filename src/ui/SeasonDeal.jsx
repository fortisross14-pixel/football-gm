import React from 'react';
import { RARITIES } from '../engine/cards.js';
import { OFFSEASON_CARDS, cardText } from '../data/offseason.js';
import { seasonDealOptions, redrawCost, canPickSeasonCard } from '../state/club.js';
import { OffseasonCard } from './Card.jsx';

// End of season: 3 season cards, pick 1 for next season (redraws cost coins).
// Used on Home (off-season block) and in Cards → Season.
export default function SeasonDeal({ state, onPick, onRedraw }) {
  if (!state.seasonDeal) return <ActiveSeasonCard state={state} />;
  const options = seasonDealOptions(state);
  const cost = redrawCost(state);
  return (
    <section className="season-deal" aria-label="Season card deal">
      <b className="offseason__title">Pick next season's card</b>
      <p className="hint">One of these is active all next season. Rarity sets how strong it is.</p>
      <div className="season-deal__hand">
        {options.map((o, i) => {
          const check = canPickSeasonCard(state, o.key);
          return (
            <div key={`${o.key}-${o.type}-${o.rarity}`} className="season-deal__card" style={{ '--i': i }}>
              {o.owned && <span className="season-deal__owned">Yours from the market · free</span>}
              <OffseasonCard
                item={o}
                onClick={check.ok ? () => onPick(o.key) : undefined}
                disabled={!check.ok}
                footer={check.ok ? 'Pick' : check.reason}
              />
            </div>
          );
        })}
      </div>
      <div className="season-deal__actions">
        <button type="button" className="btn btn--ghost btn--small" disabled={cost === null || state.coins < cost} onClick={onRedraw}>
          {cost === null ? 'No redraws left this summer' : `Redraw 3 · ◎ ${cost}`}
        </button>
        <span className="hint">Redraws: ◎ 200, then 400, then 800 each summer. Not picked by kick-off? The first card is played.</span>
      </div>
    </section>
  );
}

// The card in play this season (or next, once picked).
export function ActiveSeasonCard({ state }) {
  const c = state.seasonCard || state.activeEvent;
  if (!c || !OFFSEASON_CARDS[c.type]) return <p className="hint">No season card in play. You're dealt 3 at the end of every season.</p>;
  return (
    <p className="hint hint--accent">
      {state.phase === 'offseason' ? "Next season's card" : 'Season card'}: {OFFSEASON_CARDS[c.type].icon} {OFFSEASON_CARDS[c.type].name} ({RARITIES[c.rarity].label}): {cardText(c.type, c.rarity)}
    </p>
  );
}
