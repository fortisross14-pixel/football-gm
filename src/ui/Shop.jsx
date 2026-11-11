import React, { useEffect, useState } from 'react';
import { PACKS, PACK_IDS, packOdds } from '../engine/packs.js';
import { BOOSTS, BOOST_IDS, BOOST_PACKS } from '../data/boosts.js';
import { TIERS } from '../data/offseason.js';
import { CLUB_PACKS, CLUB_PACK_IDS } from '../data/clubPacks.js';
import { packShift, marketRefreshIn } from '../state/club.js';
import { CardPlays } from './Collection.jsx';
import { RARITIES } from '../engine/cards.js';
import { PackArt, BoostCard, OffseasonCard } from './Card.jsx';
import { Segmented } from './Home.jsx';

// The shop has two sections. Player: player and coach packs, and the Transfer Market (transfer
// cards). Club: club packs (infrastructure and temporary club cards) and match-boost packs.
export default function Shop({ state, onBuyPack, onBuyBoostPack, onBuyOffer, onSeeMarket, onBuyClubPack, initialSection }) {
  const [got, setGot] = useState(null);
  const fresh = !!state.market?.fresh;
  const [tab, setTab] = useState(initialSection || 'player');
  const shift = packShift(state);
  // Looking at the Player section (where the market is) clears the "new offers" note on Home.
  useEffect(() => { if (tab === 'player' && fresh && onSeeMarket) onSeeMarket(); }, [tab, fresh]);
  const busy = !!state.pendingOpen || !!state.pendingPick;

  return (
    <div className="screen">
      <Segmented
        small
        label="Shop"
        value={tab}
        options={[
          { id: 'player', label: fresh ? 'Player ●' : 'Player' },
          { id: 'club', label: 'Club' },
        ]}
        onChange={setTab}
      />

      {tab === 'player' && (
        <>
          <h3 className="sub-title">Player &amp; coach packs</h3>
          <div className="pack-list">
            {PACK_IDS.map((id) => {
              const pack = PACKS[id];
              return (
                <div key={id} className="pack-row">
                  <PackArt packId={id} />
                  <div className="pack-row__body">
                    <b>{pack.name}</b>
                    <span className="hint">{pack.guarantee !== null ? `At least 1 ${RARITIES[TIERS[pack.guarantee]].label} or better` : 'No guarantee'}</span>
                    <Odds odds={packOdds(id, shift)} />
                    <button type="button" className="btn btn--primary btn--small" disabled={state.coins < pack.price || busy} onClick={() => onBuyPack(id)}>
                      ◎ {pack.price}
                    </button>
                  </div>
                </div>
              );
            })}
            {shift > 0 && <p className="hint hint--accent">Better odds on every player pack: {shift} points moved from Common to higher rarities (Scouting Network and Analytics).</p>}
          </div>
          <h3 className="sub-title" id="market">Transfer Market</h3>
          <Market state={state} onBuyOffer={onBuyOffer} />
        </>
      )}

      {tab === 'club' && (
        <>
          <h3 className="sub-title">Club packs</h3>
          <p className="hint">Club cards: <b>infrastructure</b> raises one club area for good (rarity sets how high it can build); <b>temporary</b> cards last a few games. Silver and Gold show 3 cards and you keep 1.</p>
          <div className="pack-list">
            {CLUB_PACK_IDS.map((id) => {
              const pack = CLUB_PACKS[id];
              return (
                <div key={id} className="pack-row">
                  <PackArt packId={id} />
                  <div className="pack-row__body">
                    <b>{pack.name}</b>
                    <span className="hint">{pack.text}</span>
                    <Odds odds={pack.odds} />
                    <button type="button" className="btn btn--primary btn--small" disabled={state.coins < pack.price || busy} onClick={() => onBuyClubPack(id)}>
                      ◎ {pack.price}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="sub-title">Match boosts</h3>
          <p className="hint">Boosts come in sealed packs. You also get one free random boost after every match where you play at least one.</p>
          <div className="pack-list">
            {Object.entries(BOOST_PACKS).map(([id, pack]) => (
              <div key={id} className="pack-row">
                <div className={`pack pack--boost pack--${id}`}><span className="pack__shine" /><span className="pack__name">{pack.name}</span><span className="pack__count">{pack.count} boosts</span></div>
                <div className="pack-row__body">
                  <b>{pack.name}</b>
                  <span className="hint">{pack.text}</span>
                  <button type="button" className="btn btn--primary btn--small" disabled={state.coins < pack.price} onClick={() => setGot(onBuyBoostPack(id))}>◎ {pack.price}</button>
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
          <details className="odds-note">
            <summary>All boosts and rarities</summary>
            <div className="boost-grid">{BOOST_IDS.map((id) => <BoostCard key={id} id={id} rarity />)}</div>
          </details>
        </>
      )}
    </div>
  );
}

// Per-card rarity odds: a bar and a legend.
function Odds({ odds }) {
  const total = odds.reduce((a, b) => a + b, 0);
  return (
    <>
      <div className="odds" aria-label="Rarity odds">
        {odds.map((o, i) => (o > 0 ? (
          <span key={i} className={`odds__seg r-${TIERS[i]}`} style={{ flex: o }} title={`${RARITIES[TIERS[i]].label} ${((o / total) * 100).toFixed(1)}%`} />
        ) : null))}
      </div>
      <div className="odds__legend">
        {odds.map((o, i) => (o > 0 ? <span key={i} className={`r-${TIERS[i]}`}>{RARITIES[TIERS[i]].label[0]} {Math.round((o / total) * 100)}%</span> : null))}
      </div>
    </>
  );
}

// The Transfer Market, open all year: transfer cards (signings, youth, training, careers).
function Market({ state, onBuyOffer }) {
  const refresh = marketRefreshIn(state);
  const offers = state.market?.offers || [];
  return (
    <>
      <CardPlays state={state} />
      <p className="hint">
        Open all year. Buy cards here, then play them from <b>Cards → Players</b> whenever you like.
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
              footer={o.sold ? 'Bought' : `◎ ${o.price}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
