import React, { useMemo, useState } from 'react';
import { PlayerCard, CoachCard, OffseasonCard, PackArt, BoostCard, MiniCard } from './Card.jsx';
import { Segmented } from './Home.jsx';
import Sheet from './Sheet.jsx';
import { RARITIES, POSITIONS, TRAITS, FORMATIONS, overall } from '../engine/cards.js';
import { BOOST_IDS } from '../data/boosts.js';
import { OFFSEASON_CARDS, TIERS, cardValue } from '../data/offseason.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { PLAYER_POOL, COACH_POOL } from '../data/pool.js';
import { canUseOffseason, poachTargets, poachChance } from '../state/club.js';

export default function Collection({ state, onOpenPack, onUseCard }) {
  const [tab, setTab] = useState('squad');
  const [viewing, setViewing] = useState(null);
  const [using, setUsing] = useState(null);
  const inv = state.inventory;
  const invCount = inv.packs.length + inv.offseason.length;

  return (
    <div className="screen">
      <Segmented
        small
        label="Cards"
        value={tab}
        options={[
          { id: 'squad', label: 'Squad' },
          { id: 'inventory', label: `Items${invCount ? ` (${invCount})` : ''}` },
          { id: 'album', label: 'Album' },
          { id: 'hof', label: 'Hall of Fame' },
        ]}
        onChange={setTab}
      />

      {tab === 'squad' && (
        <>
          <h3 className="sub-title">Players · {state.squad.length}/10</h3>
          <div className="card-grid">
            {[...state.squad].sort((a, b) => overall(b) - overall(a)).map((c) => (
              <PlayerCard key={c.id} card={c} colors={state.club.colors} size="medium" onClick={() => setViewing(c)} />
            ))}
          </div>
          <h3 className="sub-title">Coaches · 2/2</h3>
          <div className="coaches">
            <CoachCard coach={state.coaches.coach} role="coach" />
            <CoachCard coach={state.coaches.assistant} role="assistant" />
          </div>
        </>
      )}

      {tab === 'inventory' && (
        <>
          <h3 className="sub-title">Unopened packs</h3>
          {inv.packs.length === 0 ? <p className="hint">None. Packs come from the shop and from season rewards.</p> : (
            <div className="pack-strip">
              {inv.packs.map((id, i) => (
                <button key={`${id}-${i}`} type="button" className="pack-btn" disabled={!!state.pendingOpen} onClick={() => onOpenPack(i)}>
                  <PackArt packId={id} small />
                  <span>Open</span>
                </button>
              ))}
            </div>
          )}

          <h3 className="sub-title">Off-season cards</h3>
          {state.phase === 'offseason' && <p className="hint">Tap a card to use it. You can play one season event per season.</p>}
          {state.phase !== 'offseason' && inv.offseason.length > 0 && <p className="hint">These can be played once the season ends.</p>}
          {state.activeEvent && (
            <p className="hint hint--accent">Season event active: {OFFSEASON_CARDS[state.activeEvent.type].name} ({RARITIES[state.activeEvent.rarity].label}).</p>
          )}
          {inv.offseason.length === 0 ? <p className="hint">None yet. Buy them in the Transfer Market after the season.</p> : (
            <div className="ocard-grid">
              {inv.offseason.map((item) => {
                const check = canUseOffseason(state, item);
                return (
                  <OffseasonCard key={item.uid} item={item} onClick={() => setUsing(item)} footer={check.ok ? 'Use ›' : 'Locked'} />
                );
              })}
            </div>
          )}

          <h3 className="sub-title">Boosts</h3>
          <div className="boost-grid">
            {BOOST_IDS.filter((id) => inv.boosts[id] > 0).map((id) => <BoostCard key={id} id={id} count={inv.boosts[id]} />)}
          </div>
        </>
      )}

      {tab === 'album' && <Album state={state} />}

      {tab === 'hof' && (
        state.hallOfFame.length === 0 ? <p className="hint">Players and coaches who retire with your club are honoured here.</p> : (
          <ul className="hof">
            {state.hallOfFame.map((h, i) => (
              <li key={i} className={`r-${h.card.rarity}`}>
                <b>{h.card.name}</b>
                <span>{RARITIES[h.card.rarity]?.label} · {h.card.pos || 'Coach'} · retired in season {h.season ?? 1}</span>
                {h.stats && <span>{h.stats.apps} apps · {h.stats.goals} goals · {h.stats.assists} assists · {h.stats.motm} MOTM</span>}
              </li>
            ))}
          </ul>
        )
      )}

      {viewing && (
        <Sheet title="Player card" onClose={() => setViewing(null)}>
          <div className="sheet-card">
            <PlayerCard card={viewing} colors={state.club.colors} stats={state.playerStats[viewing.id] || { apps: 0, goals: 0, assists: 0, motm: 0 }} />
          </div>
        </Sheet>
      )}
      {using && (
        <UseCardSheet
          state={state}
          item={using}
          onClose={() => setUsing(null)}
          onUse={(target) => { onUseCard(using.uid, target); setUsing(null); }}
        />
      )}
    </div>
  );
}

function Album({ state }) {
  const owned = new Set(state.album);
  const all = [...PLAYER_POOL, ...COACH_POOL];
  const [filter, setFilter] = useState('all');
  const byTier = TIERS.map((t) => {
    const cards = all.filter((c) => c.rarity === t);
    return { t, total: cards.length, have: cards.filter((c) => owned.has(c.id)).length };
  });
  const shown = useMemo(
    () => all.filter((c) => filter === 'all' || c.rarity === filter).sort((a, b) => TIERS.indexOf(b.rarity) - TIERS.indexOf(a.rarity) || a.name.localeCompare(b.name)),
    [filter],
  );
  const pct = Math.round((owned.size / all.length) * 100);
  return (
    <>
      <div className="panel album-head">
        <div><b>{owned.size}</b> / {all.length} cards collected · {pct}%</div>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        <div className="album-tiers">
          {byTier.map((r) => (
            <button key={r.t} type="button" className={`r-${r.t}${filter === r.t ? ' is-on' : ''}`} onClick={() => setFilter(filter === r.t ? 'all' : r.t)}>
              <b>{r.have}/{r.total}</b>
              <span>{RARITIES[r.t].label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="album-grid">
        {shown.map((c) => (
          <div key={c.id} className={`album-card r-${c.rarity}${owned.has(c.id) ? ' is-owned' : ''}`} title={owned.has(c.id) ? c.name : 'Not collected yet'}>
            <span className="album-card__ovr">{c.role ? c.formation : overall(c)}</span>
            <span className="album-card__pos">{c.role ? 'COACH' : c.pos}</span>
            <span className="album-card__name">{owned.has(c.id) ? c.name : '? ? ?'}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function UseCardSheet({ state, item, onClose, onUse }) {
  const def = OFFSEASON_CARDS[item.type];
  const check = canUseOffseason(state, item);
  const v = cardValue(item.type, item.rarity);
  const [playerId, setPlayerId] = useState(null);
  const [position, setPosition] = useState(null);
  const [trait, setTrait] = useState(null);
  const [formation, setFormation] = useState(null);
  const [passive, setPassive] = useState(null);
  const [coachRole, setCoachRole] = useState(null);
  const [poachId, setPoachId] = useState(null);

  const players = state.squad;
  const pickPlayers = (filter = () => true) => (
    <div className="pick-row">
      {players.filter(filter).map((c) => (
        <MiniCard key={c.id} card={c} selected={playerId === c.id} onClick={() => { setPlayerId(c.id); setCoachRole(null); }} />
      ))}
    </div>
  );
  const positions = (exclude) => (
    <Segmented small value={position} options={POSITIONS.filter((p) => p !== exclude).map((p) => ({ id: p, label: p }))} onChange={setPosition} />
  );

  let body = null;
  let ready = check.ok;
  switch (def.target) {
    case 'person':
      body = (
        <>
          {pickPlayers((c) => c.matchesLeft != null)}
          <div className="coaches">
            {['coach', 'assistant'].filter((r) => state.coaches[r]?.matchesLeft != null).map((r) => (
              <CoachCard key={r} coach={state.coaches[r]} role={r} selected={coachRole === r} onClick={() => { setCoachRole(r); setPlayerId(null); }} />
            ))}
          </div>
        </>
      );
      ready = ready && (playerId || coachRole);
      break;
    case 'player':
      body = pickPlayers();
      ready = ready && playerId;
      break;
    case 'playerPosition': {
      const pl = players.find((c) => c.id === playerId);
      body = (<>{pickPlayers()}{pl && positions(pl.pos)}</>);
      ready = ready && playerId && position;
      break;
    }
    case 'playerTrait': {
      const pl = players.find((c) => c.id === playerId);
      body = (
        <>
          {pickPlayers()}
          {v ? (
            <div className="chip-row">
              {Object.entries(TRAITS).filter(([k]) => k !== 'shotStopper' || pl?.pos === 'GK').map(([k, t]) => (
                <button key={k} type="button" className={`chip-btn${trait === k ? ' is-on' : ''}`} onClick={() => setTrait(k)} title={t.text}>{t.name}</button>
              ))}
            </div>
          ) : <p className="hint">The trait is random.</p>}
        </>
      );
      ready = ready && playerId && (!v || trait);
      break;
    }
    case 'position':
      body = positions();
      ready = ready && position;
      break;
    case 'formation':
      body = (
        <>
          <Segmented small value={formation} options={Object.keys(FORMATIONS).map((f) => ({ id: f, label: f, disabled: f === state.coaches.coach?.formation }))} onChange={setFormation} />
          {v ? (
            <div className="chip-row">
              {Object.entries(COACH_PASSIVES).map(([k, p]) => (
                <button key={k} type="button" className={`chip-btn${passive === k ? ' is-on' : ''}`} onClick={() => setPassive(k)} title={p.text}>{p.name}</button>
              ))}
            </div>
          ) : null}
        </>
      );
      ready = ready && formation;
      break;
    case 'poach': {
      const tried = state.market?.poachTried || [];
      body = (
        <div className="sub-list">
          {poachTargets(state).map(({ club, card }) => (
            <button key={card.id} type="button" className={`sub-row poach-row${poachId === card.id ? ' is-selected' : ''}`} disabled={tried.includes(card.id)} onClick={() => setPoachId(card.id)}>
              <span className={`sub-row__pos r-${card.rarity}`}>{card.pos}</span>
              <span className="sub-row__name">{card.name}<em> · {club.short} · {RARITIES[card.rarity].label}</em></span>
              <span className="poach-row__chance">{tried.includes(card.id) ? 'Tried' : `${poachChance(card, item.rarity)}%`}</span>
              <span className="sub-row__ovr">{overall(card)}</span>
            </button>
          ))}
        </div>
      );
      ready = ready && poachId;
      break;
    }
    default:
      body = null;
  }

  return (
    <Sheet title={def.name} onClose={onClose}>
      <div className="use-card">
        <OffseasonCard item={item} />
        {!check.ok && <p className="hint hint--warn">{check.reason}</p>}
        {check.ok && body}
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!ready}
          onClick={() => onUse({ playerId, position, trait, formation, passive, coachRole, poachId })}
        >
          {item.type === 'poach' ? 'Make the approach' : 'Use card'}
        </button>
      </div>
    </Sheet>
  );
}
