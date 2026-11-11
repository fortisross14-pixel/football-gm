import React, { useEffect, useState } from 'react';
import { PACKS, PACK_IDS, packOdds } from '../engine/packs.js';
import { BOOSTS, BOOST_IDS, BOOST_PACKS } from '../data/boosts.js';
import { TIERS, OFFSEASON_CARDS } from '../data/offseason.js';
import { packShift, marketRefreshIn, packPrice, boostPackPrice } from '../state/club.js';
import { CardPlays } from './Collection.jsx';
import { RARITIES } from '../engine/cards.js';
import { PackArt, BoostCard, OffseasonCard } from './Card.jsx';
import { Segmented } from './Home.jsx';

export default function Shop({ state, onBuyPack, onBuyBoostPack, onBuyOffer, onSeeMarket }) {
  const [got, setGot] = useState(null);
  const off = state.phase === 'offseason';
  const fresh = !!state.market?.fresh;
  const [tab, setTab] = useState(off || fresh ? 'market' : 'packs');
  const shift = packShift(state);
  // Looking at the market clears the "new offers" note on Home.
  useEffect(() => { if (tab === 'market' && fresh && onSeeMarket) onSeeMarket(); }, [tab, fresh]);

  return (
    <div className="screen">
      <Segmented
        small
        label="Shop"
        value={tab}
        options={[
          { id: 'packs', label: 'Packs' },
          { id: 'boosts', label: 'Boosts' },
          { id: 'market', label: fresh ? 'Market ●' : 'Market' },
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
                  <button type="button" className="btn btn--primary btn--small" disabled={state.coins < packPrice(state, id) || !!state.pendingOpen} onClick={() => onBuyPack(id)}>
                    ◎ {packPrice(state, id)}{packPrice(state, id) < pack.price && <s className="price-was"> {pack.price}</s>}
                  </button>
                </div>
              </div>
            );
          })}
          {shift > 0 && <p className="hint hint--accent">Better odds on every pack: {shift} points moved from Common to higher rarities (Scouting Network and Analytics).</p>}
        </div>
      )}

      {tab === 'boosts' && (
        <>
          <p className="hint">Boosts come in sealed packs. You also get one free random boost after every match where you play at least one.</p>
          <div className="pack-list">
            {Object.entries(BOOST_PACKS).map(([id, pack]) => (
              <div key={id} className="pack-row">
                <div className={`pack pack--boost pack--${id}`}><span className="pack__shine" /><span className="pack__name">{pack.name}</span><span className="pack__count">{pack.count} boosts</span></div>
                <div className="pack-row__body">
                  <b>{pack.name}</b>
                  <span className="hint">{pack.text}</span>
                  <button type="button" className="btn btn--primary btn--small" disabled={state.coins < boostPackPrice(state, id)} onClick={() => setGot(onBuyBoostPack(id))}>◎ {boostPackPrice(state, id)}</button>
                </div>
              </div>
            ))}
          </div>
          {got?.length > 0 && (
            <div className="panel boost-got" key={got.join()}>
              <b>You got</b>
              <div className="boost-grid">{got.map((id, i) => <BoostCard key={i} id={id} compact rarity />)}</div>
            </div>
          )}
          <h2 className="section-title">Your boosts</h2>
          <div className="boost-grid">
            {BOOST_IDS.filter((id) => state.inventory.boosts[id] > 0).map((id) => (
              <BoostCard key={id} id={id} count={state.inventory.boosts[id]} rarity />
            ))}
          </div>
          <details className="odds-note">
            <summary>All boosts and rarities</summary>
            <div className="boost-grid">{BOOST_IDS.map((id) => <BoostCard key={id} id={id} rarity />)}</div>
          </details>
        </>
      )}

      {tab === 'market' && <Market state={state} onBuyOffer={onBuyOffer} />}
    </div>
  );
}

// The Transfer Market, open all year: management cards for the squad, the club and the season.
function Market({ state, onBuyOffer }) {
  const refresh = marketRefreshIn(state);
  const offers = state.market?.offers || [];
  const levelNote = (o) => {
    const def = OFFSEASON_CARDS[o.type];
    if (!def.facility) return '';
    const now = state.facilities[def.facility] || 0;
    const cap = def.values[TIERS.indexOf(o.rarity)];
    if (now >= 5) return ' · max';
    if (o.rarity !== 'legend' && now >= cap) return ` · only to L${cap}`;
    return ` · L${now}→${Math.min(5, now + (o.rarity === 'legend' ? 2 : 1))}`;
  };
  return (
    <>
      <CardPlays state={state} />
      <p className="hint">
        Open all year. Buy cards here, then play them from <b>Cards → Items</b> whenever you like.
        {' '}{state.phase === 'offseason' ? 'Fresh offers again when the season starts.' : refresh !== null && refresh > 0 ? `New offers in ${refresh} league matchday${refresh > 1 ? 's' : ''}.` : ''}
      </p>
      {offers.length === 0 ? <p className="hint">No offers right now.</p> : (
        <div className="ocard-grid">
          {offers.map((o) => (
            <OffseasonCard
              key={o.uid}
              item={o}
              disabled={o.sold || state.coins < o.price}
              onClick={() => onBuyOffer(o.uid)}
              footer={o.sold ? 'Bought' : `◎ ${o.price}${levelNote(o)}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
