import React, { useState } from 'react';
import Collection from './Collection.jsx';
import Shop from './Shop.jsx';
import { Segmented } from './Home.jsx';

// Cards: what you own (players, club, season, album) and the shop (player and club sections).
export default function CardsHub({ state, initial = 'owned', collectionProps, shopProps }) {
  const [view, setView] = useState(initial);
  const inv = state.inventory;
  const invCount = inv.packs.length + inv.offseason.length + (inv.club || []).length + (inv.clubPacks || []).length;
  return (
    <div className="hub">
      <div className="hub__switch">
        <Segmented
          label="Cards"
          value={view}
          options={[
            { id: 'owned', label: `Owned${invCount ? ` · ${invCount}` : ''}` },
            { id: 'shop', label: state.market?.fresh ? 'Shop · New cards' : 'Shop' },
          ]}
          onChange={setView}
        />
      </div>
      {view === 'owned' ? <Collection state={state} {...collectionProps} /> : <Shop state={state} {...shopProps} />}
    </div>
  );
}
