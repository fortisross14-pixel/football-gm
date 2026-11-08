import React from 'react';
import { BOOSTS, BOOST_IDS } from '../data/boosts.js';
import { BASE_BOOST_SLOTS } from '../engine/match.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { teamOverall } from '../engine/cards.js';
import { seasonMods } from '../state/club.js';
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
  const available = (id) => (state.inventory.boosts[id] || 0) - loadout.filter((x) => x === id).length;
  const add = (id) => {
    if (loadout.length >= slots || available(id) <= 0) return;
    setLoadout([...loadout, id]);
  };
  const removeAt = (i) => setLoadout(loadout.filter((_, j) => j !== i));
  const home = setup.home;
  const us = { colors: state.club.colors, short: state.club.short, name: state.club.name, ovr: teamOverall(starters) };
  const them = { colors: opponent.colors, short: opponent.short, name: opponent.name, ovr: Math.round(opponent.strength ?? opponent.rating) };
  const [left, right] = home ? [us, them] : [them, us];
  const owned = BOOST_IDS.filter((id) => (state.inventory.boosts[id] || 0) > 0);

  return (
    <div className="screen">
      <div className="matchup">
        <TeamBlock team={left} />
        <div className="matchup__vs">
          <span>VS</span>
          <small>{setup.label}</small>
        </div>
        <TeamBlock team={right} />
      </div>

      <Bonuses state={state} competition={setup.competition} />

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
        {owned.length === 0 && <p className="hint">You have no boosts left. Buy more in the shop.</p>}
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

function Bonuses({ state, competition }) {
  const m = seasonMods(state);
  const chips = [];
  if (m.all) chips.push(`Cohesion & form +${(m.all * 100).toFixed(1)}%`);
  if (m.home) chips.push(`Home +${Math.round(m.home * 100)}%`);
  if (m.comeback) chips.push(`When losing from 60' +${Math.round(m.comeback * 100)}%`);
  if (m.underdog) chips.push(`Vs stronger teams +${Math.round(m.underdog * 100)}%`);
  if (m.finishing) chips.push(`Finishing +${Math.round(m.finishing * 100)}%`);
  if (m.drain) chips.push(`Stamina drain −${Math.round(m.drain * 100)}%`);
  if (m.cup && competition === 'cup') chips.push(`Cup +${Math.round(m.cup * 100)}%`);
  if (m.continental && (competition === 'continental' || competition === 'cwc')) chips.push(`Continental +${Math.round(m.continental * 100)}%`);
  if (!chips.length) return null;
  return (
    <div className="bonus-row" aria-label="Active bonuses">
      {chips.map((c) => <span key={c} className="chip chip--soft">{c}</span>)}
    </div>
  );
}
