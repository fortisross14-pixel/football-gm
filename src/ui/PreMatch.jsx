import React from 'react';
import { BOOSTS, BOOST_IDS } from '../data/boosts.js';
import { BASE_BOOST_SLOTS } from '../engine/match.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { teamOverall } from '../engine/cards.js';
import { BoostCard } from './Card.jsx';
import { Crest } from './Art.jsx';

export function boostSlotsFor(coaches) {
  const v = COACH_PASSIVES.tactician.value;
  const extra = (coaches.coach?.passive === 'tactician' ? v : 0) + (coaches.assistant?.passive === 'tactician' ? v * 0.5 : 0);
  return BASE_BOOST_SLOTS + Math.floor(extra);
}

export default function PreMatch({ state, opponent, setup, loadout, setLoadout, onStart, onBack }) {
  const slots = boostSlotsFor(state.coaches);
  const starters = state.lineup.map((id) => state.squad.find((c) => c.id === id));
  const available = (id) => (state.inventory[id] || 0) - loadout.filter((x) => x === id).length;
  const add = (id) => {
    if (loadout.length >= slots || available(id) <= 0) return;
    setLoadout([...loadout, id]);
  };
  const removeAt = (i) => setLoadout(loadout.filter((_, j) => j !== i));
  const home = setup.home;
  const us = { colors: state.club.colors, short: state.club.short, name: state.club.name, ovr: teamOverall(starters) };
  const them = { colors: opponent.colors, short: opponent.short, name: opponent.name, ovr: opponent.rating };
  const [left, right] = home ? [us, them] : [them, us];
  const owned = BOOST_IDS.filter((id) => (state.inventory[id] || 0) > 0);

  return (
    <div className="screen">
      <div className="matchup">
        <TeamBlock team={left} />
        <div className="matchup__vs">
          <span>VS</span>
          <small>{setup.knockout ? 'Cup · knockout' : 'League'}</small>
        </div>
        <TeamBlock team={right} />
      </div>

      <h2 className="section-title">Bring boosts</h2>
      <p className="hint">Pick up to {slots}. You can play them at any break during the match. Unused boosts go back to your inventory.</p>

      <div className="loadout">
        {Array.from({ length: slots }).map((_, i) => (
          <div key={i} className="loadout__slot">
            {loadout[i] ? (
              <BoostCard id={loadout[i]} compact onClick={() => removeAt(i)} active />
            ) : (
              <span className="loadout__empty">Empty</span>
            )}
          </div>
        ))}
      </div>

      <div className="boost-grid">
        {owned.length === 0 && <p className="hint">You have no boosts left.</p>}
        {owned.map((id) => (
          <BoostCard
            key={id}
            id={id}
            count={available(id)}
            disabled={available(id) <= 0 || loadout.length >= slots}
            onClick={() => add(id)}
          />
        ))}
      </div>

      <div className="cta-row cta-row--sticky">
        <button type="button" className="btn btn--ghost" onClick={onBack}>Back</button>
        <button type="button" className="btn btn--primary" onClick={onStart}>Kick off</button>
      </div>
    </div>
  );
}

function TeamBlock({ team }) {
  return (
    <div className="matchup__team">
      <Crest colors={team.colors} short={team.short} size={46} />
      <b>{team.name}</b>
      <span>{team.ovr} OVR</span>
    </div>
  );
}

export { BOOSTS };
