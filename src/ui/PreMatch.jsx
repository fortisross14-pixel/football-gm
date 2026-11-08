import React from 'react';
import { BOOSTS, BOOST_IDS } from '../data/boosts.js';
import { BASE_BOOST_SLOTS, TACTICS } from '../engine/match.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { teamOverall } from '../engine/cards.js';
import { seasonMods } from '../state/club.js';
import { BoostCard } from './Card.jsx';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';
import { clubVars } from './Home.jsx';
import { skillOf, MAX_SKILLS } from '../data/skills.js';
import { aiTeamFor } from '../engine/season.js';
import { POOL_BY_ID } from '../state/club.js';

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
  const us = { id: state.club.id, colors: state.club.colors, short: state.club.short, name: state.club.name, ovr: teamOverall(starters) };
  const them = { id: opponent.id, colors: opponent.colors, short: opponent.short, name: opponent.name, ovr: Math.round(opponent.strength ?? opponent.rating) };
  const [left, right] = home ? [us, them] : [them, us];
  const owned = BOOST_IDS.filter((id) => (state.inventory.boosts[id] || 0) > 0);

  return (
    <div className="screen screen--prematch">
      <div className="prematch__main">
      <div className="matchup">
        <TeamBlock team={left} />
        <div className="matchup__vs">
          <span>VS</span>
          <small>{setup.label}</small>
        </div>
        <TeamBlock team={right} />
      </div>

      <Bonuses state={state} competition={setup.competition} />

      <Scouting state={state} opponent={opponent} starters={starters} />
      </div>

      <div className="prematch__side">
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
    <div className="matchup__team" style={clubVars(team.colors)}>
      <Crest colors={team.colors} short={team.short} size={46} />
      <ClubLink id={team.id}><b>{team.name}</b></ClubLink>
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

// Skills on both sides: yours to plan, theirs to expect. Max 2 per match each.
function Scouting({ state, opponent, starters }) {
  const ai = aiTeamFor(state.world, opponent.id, POOL_BY_ID, 1);
  const byId = Object.fromEntries(ai.players.map((p) => [p.id, p]));
  const list = (cards) => cards.filter(Boolean).map((c) => ({ c, sk: skillOf(c) })).filter((x) => x.sk);
  const mine = [...list(starters), ...list([state.coaches.coach, state.coaches.assistant])];
  const theirs = list(ai.lineup.map((id) => byId[id]));
  const keys = ai.lineup.map((id) => byId[id]).filter((c) => c && !c.generic);
  return (
    <section className="scouting">
      <h2 className="section-title">Skills · {MAX_SKILLS} per match</h2>
      <div className="scouting__cols">
        <div>
          <h3 className="sub-title">Yours</h3>
          {mine.length ? mine.map(({ c, sk }) => <p key={c.id} className="scouting__row" title={sk.desc}><b>{sk.icon} {sk.name}</b> <span>{c.name}</span></p>) : <p className="hint">No skills in this XI. Rare, Epic and Legend cards carry them.</p>}
        </div>
        <div>
          <h3 className="sub-title">{opponent.short}</h3>
          {theirs.length ? theirs.map(({ c, sk }) => <p key={c.id} className="scouting__row" title={sk.desc}><b>{sk.icon} {sk.name}</b> <span>{c.name}</span></p>) : <p className="hint">No skills expected.</p>}
          {keys.length > 0 && <p className="hint">Key players: {keys.map((c) => c.name).join(', ')}</p>}
          <p className="hint">Style: {TACTICS.press.options[ai.tactics.press].name} · {TACTICS.passing.options[ai.tactics.passing].name} passing · {TACTICS.line.options[ai.tactics.line].name} line</p>
        </div>
      </div>
    </section>
  );
}
