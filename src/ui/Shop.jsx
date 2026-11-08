import React, { useState } from 'react';
import { PACKS, PACK_IDS, packOdds } from '../engine/packs.js';
import { BOOSTS, BOOST_IDS } from '../data/boosts.js';
import { TIERS, cardValue } from '../data/offseason.js';
import { RARITIES } from '../engine/cards.js';
import { PackArt, BoostCard, OffseasonCard } from './Card.jsx';
import { Segmented } from './Home.jsx';

export default function Shop({ state, onBuyPack, onBuyBoost, onBuyOffer }) {
  const off = state.phase === 'offseason';
  const [tab, setTab] = useState(off ? 'market' : 'packs');
  const shift = state.activeEvent?.type === 'scoutingNetwork' ? cardValue('scoutingNetwork', state.activeEvent.rarity) : 0;

  return (
    <div className="screen">
      <Segmented
        small
        label="Shop"
        value={tab}
        options={[
          { id: 'packs', label: 'Packs' },
          { id: 'boosts', label: 'Boosts' },
          { id: 'market', label: off ? 'Market ●' : 'Market' },
        ]}
        onChange={setTab}
      />

      {tab === 'packs' && (
        <div className="pack-list">
          {PACK_IDS.map((id) => {
            const pack = PACKS[id];
            const odds = packOdds(id, shift);
            const total = odds.reduce((a, b) => a + b, 0);
            return (
              <div key={id} className="pack-row">
                <PackArt packId={id} />
                <div className="pack-row__body">
                  <b>{pack.name}</b>
                  <span className="hint">{pack.guarantee !== null ? `At least 1 ${RARITIES[TIERS[pack.guarantee]].label} or better` : 'No guarantee'}</span>
                  <div className="odds" aria-label="Rarity odds">
                    {odds.map((o, i) => (o > 0 ? (
                      <span key={i} className={`odds__seg r-${TIERS[i]}`} style={{ flex: o }} title={`${RARITIES[TIERS[i]].label} ${((o / total) * 100).toFixed(1)}%`} />
                    ) : null))}
                  </div>
                  <div className="odds__legend">
                    {odds.map((o, i) => (o > 0 ? <span key={i} className={`r-${TIERS[i]}`}>{RARITIES[TIERS[i]].label[0]} {Math.round((o / total) * 100)}%</span> : null))}
                  </div>
                  <button type="button" className="btn btn--primary btn--small" disabled={state.coins < pack.price || !!state.pendingOpen} onClick={() => onBuyPack(id)}>
                    ◎ {pack.price}
                  </button>
                </div>
              </div>
            );
          })}
          {shift > 0 && <p className="hint hint--accent">Scouting Network is active: better odds on every pack this season.</p>}
        </div>
      )}

      {tab === 'boosts' && (
        <div className="boost-grid">
          {BOOST_IDS.map((id) => (
            <div key={id} className="buy-tile">
              <BoostCard id={id} count={state.inventory.boosts[id] || 0} />
              <button type="button" className="btn btn--small btn--block" disabled={state.coins < BOOSTS[id].price} onClick={() => onBuyBoost(id)}>
                Buy · ◎ {BOOSTS[id].price}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'market' && (
        off ? (
          <>
            <p className="hint">Off-season cards. Lower rarities appear more often. Buy them here, then play them from <b>Cards → Items</b> before the new season.</p>
            <div className="ocard-grid">
              {state.market.offers.map((o) => (
                <OffseasonCard
                  key={o.uid}
                  item={o}
                  disabled={o.sold || state.coins < o.price}
                  onClick={() => onBuyOffer(o.uid)}
                  footer={o.sold ? 'Bought' : `◎ ${o.price}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="panel locked">
            <b>Closed during the season</b>
            <p className="hint">The Transfer Market opens when the season ends. It sells off-season cards: transfers, poaching, stadium upgrades and season events.</p>
          </div>
        )
      )}
    </div>
  );
}
