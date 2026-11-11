import React, { useMemo, useState } from 'react';
import { PlayerCard, CoachCard, OffseasonCard, PackArt, BoostCard, MiniCard } from './Card.jsx';
import { Segmented } from './Home.jsx';
import Sheet from './Sheet.jsx';
import { RARITIES, POSITIONS, TRAITS, FORMATIONS, overall } from '../engine/cards.js';
import { BOOST_IDS } from '../data/boosts.js';
import { OFFSEASON_CARDS, TIERS, cardValue, cardText } from '../data/offseason.js';
import { FACILITY_LABEL } from '../data/facilities.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { PLAYER_POOL, COACH_POOL } from '../data/pool.js';
import { canUseOffseason, cardPlays, clubEffects, SQUAD_SIZE } from '../state/club.js';
import { PlayerLink, ProfileButton } from './nav.jsx';
import SeasonDeal from './SeasonDeal.jsx';

// Cards → Owned: Players (squad, coaches, player packs, transfer cards), Club (club packs,
// club cards, active effects, match boosts), Season (the season card) and the Album.
export default function Collection({ state, onOpenPack, onOpenClubPack, onUseCard, onPickSeason, onRedrawSeason, initialSection }) {
  const [tab, setTab] = useState(initialSection || (state.seasonDeal ? 'season' : 'players'));
  const [viewing, setViewing] = useState(null);
  const [using, setUsing] = useState(null);
  const inv = state.inventory;
  const transfer = inv.offseason.filter((i) => OFFSEASON_CARDS[i.type]?.group === 'transfer');
  const events = inv.offseason.filter((i) => OFFSEASON_CARDS[i.type]?.group === 'event');
  const club = inv.club || [];
  const clubPacks = inv.clubPacks || [];
  const busy = !!state.pendingOpen || !!state.pendingPick;
  const footer = (item) => {
    const check = canUseOffseason(state, item);
    if (check.ok) return OFFSEASON_CARDS[item.type].facility ? 'Build ›' : 'Play ›';
    return OFFSEASON_CARDS[item.type].summerOnly && state.phase !== 'offseason' ? 'Summer only' : 'Locked';
  };
  const cardGrid = (items) => (
    <div className="ocard-grid">
      {items.map((item) => <OffseasonCard key={item.uid} item={item} onClick={() => setUsing(item)} footer={footer(item)} />)}
    </div>
  );
  const count = (n) => (n ? ` · ${n}` : '');

  return (
    <div className="screen">
      <Segmented
        small
        label="Cards"
        value={tab}
        options={[
          { id: 'players', label: `Players${count(inv.packs.length + transfer.length)}` },
          { id: 'club', label: `Club${count(clubPacks.length + club.length)}` },
          { id: 'season', label: state.seasonDeal ? 'Season · pick' : `Season${count(events.length + (state.seasonCard ? 1 : 0))}` },
          { id: 'album', label: 'Album' },
        ]}
        onChange={setTab}
      />

      {tab === 'players' && (
        <>
          <h3 className="sub-title">Players · {state.squad.length}/{SQUAD_SIZE}</h3>
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

          <h3 className="sub-title">Unopened player packs</h3>
          {inv.packs.length === 0 ? <p className="hint">None. Packs come from the shop and from season rewards.</p> : (
            <div className="pack-strip">
              {inv.packs.map((id, i) => (
                <button key={`${id}-${i}`} type="button" className="pack-btn" disabled={busy} onClick={() => onOpenPack(i)}>
                  <PackArt packId={id} small />
                  <span>Open</span>
                </button>
              ))}
            </div>
          )}

          <h3 className="sub-title">Transfer cards</h3>
          <CardPlays state={state} />
          {transfer.length === 0 ? <p className="hint">None yet. Buy them in Shop → Player → Transfer Market, open all year.</p> : (
            <>
              <p className="hint">Tap a card to play it, any time of the year.</p>
              {cardGrid(transfer)}
            </>
          )}
        </>
      )}

      {tab === 'club' && (
        <>
          <h3 className="sub-title">Unopened club packs</h3>
          {clubPacks.length === 0 ? <p className="hint">None. Club packs are in Shop → Club.</p> : (
            <div className="pack-strip">
              {clubPacks.map((id, i) => (
                <button key={`${id}-${i}`} type="button" className="pack-btn" disabled={busy} onClick={() => onOpenClubPack(i)}>
                  <PackArt packId={id} small />
                  <span>Open</span>
                </button>
              ))}
            </div>
          )}

          <ActiveEffects state={state} />

          <h3 className="sub-title">Club cards</h3>
          <CardPlays state={state} />
          {club.length === 0 ? <p className="hint">None yet. Club packs in Shop → Club bring infrastructure and temporary club cards.</p> : (
            <>
              {club.some((i) => OFFSEASON_CARDS[i.type].kind === 'area') && (
                <>
                  <p className="hint"><b>Infrastructure</b> · raises one club area for good.</p>
                  {cardGrid(club.filter((i) => OFFSEASON_CARDS[i.type].kind === 'area'))}
                </>
              )}
              {club.some((i) => OFFSEASON_CARDS[i.type].kind !== 'area') && (
                <>
                  <p className="hint"><b>Temporary</b> · lasts a few games, or pays off at once.</p>
                  {cardGrid(club.filter((i) => OFFSEASON_CARDS[i.type].kind !== 'area'))}
                </>
              )}
            </>
          )}

          <h3 className="sub-title">Match boosts</h3>
          {BOOST_IDS.some((id) => inv.boosts[id] > 0) ? (
            <div className="boost-grid">
              {BOOST_IDS.filter((id) => inv.boosts[id] > 0).map((id) => <BoostCard key={id} id={id} count={inv.boosts[id]} rarity />)}
            </div>
          ) : <p className="hint">None. Boost packs are in Shop → Club.</p>}
        </>
      )}

      {tab === 'season' && state.seasonDeal && <SeasonDeal state={state} onPick={onPickSeason} onRedraw={onRedrawSeason} />}
      {tab === 'season' && !state.seasonDeal && <SeasonCards state={state} events={events} cardGrid={cardGrid} />}

      {tab === 'album' && <Album state={state} />}

      {viewing && (
        <Sheet title="Player card" onClose={() => setViewing(null)}>
          <div className="sheet-card">
            <PlayerCard card={viewing} colors={state.club.colors} stats={state.playerStats[viewing.id] || { apps: 0, goals: 0, assists: 0, motm: 0 }} />
          </div>
          <ProfileButton id={viewing.id} name={viewing.name} onDone={() => setViewing(null)} />
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

// Temporary club cards in play, with the games they have left.
export function ActiveEffects({ state }) {
  const effects = clubEffects(state);
  if (!effects.length) return null;
  return (
    <>
      <h3 className="sub-title">Active effects</h3>
      <ul className="effects">
        {effects.map((e) => (
          <li key={e.id} className={`r-${e.rarity || 'common'}`}>
            <span className="effects__icon" aria-hidden="true">{e.icon}</span>
            <span className="effects__body"><b>{e.name}</b><span>{e.text}</span></span>
            <span className="effects__left">{e.gamesLeft}<small>{e.homeOnly ? (e.gamesLeft === 1 ? 'home game' : 'home games') : (e.gamesLeft === 1 ? 'match' : 'matches')}</small></span>
          </li>
        ))}
      </ul>
    </>
  );
}

// The season card (drawn at the end of each season) and season events from older saves.
function SeasonCards({ state, events, cardGrid }) {
  const sc = state.seasonCard;
  const ev = state.activeEvent;
  return (
    <>
      <h3 className="sub-title">This season's card</h3>
      {sc ? (
        <div className="panel season-card">
          <b>{sc.icon ? `${sc.icon} ` : ''}{sc.name || OFFSEASON_CARDS[sc.type]?.name || 'Season card'}</b>
          <span>{sc.text || (OFFSEASON_CARDS[sc.type] && sc.rarity ? cardText(sc.type, sc.rarity) : '')}</span>
        </div>
      ) : ev ? (
        <div className="panel season-card">
          <b>{OFFSEASON_CARDS[ev.type].icon} {OFFSEASON_CARDS[ev.type].name} · {RARITIES[ev.rarity].label}</b>
          <span>{cardText(ev.type, ev.rarity)}</span>
        </div>
      ) : (
        <p className="hint">At the end of each season you draw a season card. It shows here.</p>
      )}
      {events.length > 0 && (
        <>
          <h3 className="sub-title">Season events</h3>
          <p className="hint">One season event per season: played mid-season it lasts until the season ends.</p>
          {cardGrid(events)}
        </>
      )}
    </>
  );
}

// "Card plays this season: 3 / 9", with one pip per play.
export function CardPlays({ state }) {
  const { used, limit } = cardPlays(state);
  return (
    <div className="plays-line" aria-label={`Card plays: ${used} of ${limit} used`}>
      <span>Card plays {state.phase === 'offseason' ? 'for next season' : 'this season'}</span>
      <span className="plays-line__pips" aria-hidden="true">{Array.from({ length: limit }, (_, i) => <i key={i} className={i < used ? 'on' : ''} />)}</span>
      <b>{used} / {limit}</b>
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
          onClick={() => onUse({ playerId, position, trait, formation, passive, coachRole })}
        >
          {OFFSEASON_CARDS[item.type].scope || item.type === 'veteranSigning' ? 'Sign someone' : def.facility ? `Build: ${FACILITY_LABEL[def.facility]} +${item.rarity === 'legend' ? 2 : 1}` : 'Play card'}
        </button>
      </div>
    </Sheet>
  );
}

// Players and coaches who retired at your clubs.
export function HallOfFame({ state }) {
  if (!state.hallOfFame.length) return <p className="hint">Players and coaches who retire with your club are honoured here.</p>;
  return (
    <ul className="hof">
      {[...state.hallOfFame].reverse().map((h, i) => (
        <li key={i} className={`r-${h.card.rarity}`}>
          <b>{h.card.pos ? <PlayerLink id={h.card.id} name={h.card.name} /> : h.card.name}</b>
          <span>{RARITIES[h.card.rarity]?.label} · {h.card.pos || 'Coach'} · retired in season {h.season ?? 1}</span>
          {h.stats && <span>{h.stats.apps} apps · {h.stats.goals} goals · {h.stats.assists} assists · {h.stats.motm} MOTM{h.stats.cs ? ` · ${h.stats.cs} clean sheets` : ''}</span>}
        </li>
      ))}
    </ul>
  );
}
