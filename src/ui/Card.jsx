import React from 'react';
import { overall, RARITIES, TRAITS } from '../engine/cards.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { BOOSTS } from '../data/boosts.js';
import { Silhouette } from './Art.jsx';

const MAX_MATCHES = 200;

export function PlayerCard({ card, colors, stats, size = 'full', onClick, selected, badge }) {
  const ovr = overall(card);
  const trait = card.trait ? TRAITS[card.trait] : null;
  const rarity = RARITIES[card.rarity];
  const left = card.matchesLeft;
  return (
    <button
      type="button"
      className={`pcard pcard--${size} r-${card.rarity}${selected ? ' is-selected' : ''}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="pcard__inner">
        <div className="pcard__top">
          <div className="pcard__ovr">
            <span className="num">{ovr}</span>
            <span className="pos">{card.pos}</span>
          </div>
          <span className="pcard__rarity">{rarity.label}</span>
        </div>
        <div className="pcard__art">
          <Silhouette colors={colors} pos={card.pos} />
        </div>
        <div className="pcard__name">{card.name}</div>
        <div className="pcard__stats">
          <Stat label="ATT" value={card.att} />
          <Stat label="DEF" value={card.def} />
          <Stat label="PHY" value={card.phy} />
        </div>
        {trait && (
          <div className="pcard__trait" title={trait.text}>
            <b>{trait.name}</b>
            {size === 'full' && <span>{trait.text}</span>}
          </div>
        )}
        <div className="pcard__matches">
          {left === null || left === undefined ? (
            <span className="muted">Academy · no retirement</span>
          ) : (
            <>
              <div className="bar"><i style={{ width: `${Math.min(100, (left / MAX_MATCHES) * 100)}%` }} /></div>
              <span>{left} matches left</span>
            </>
          )}
        </div>
        {stats && size === 'full' && (
          <div className="pcard__career">
            <span><b>{stats.apps}</b> apps</span>
            <span><b>{stats.goals}</b> goals</span>
            <span><b>{stats.assists}</b> assists</span>
            <span><b>{stats.motm}</b> MOTM</span>
          </div>
        )}
      </div>
      {badge}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__v">{value}</span>
      <span className="stat__l">{label}</span>
    </div>
  );
}

export function MiniCard({ card, onClick, selected, warn, dim }) {
  const ovr = overall(card);
  const last = card.name.split(' ').slice(-1)[0];
  return (
    <button
      type="button"
      className={`mini r-${card.rarity}${selected ? ' is-selected' : ''}${dim ? ' is-dim' : ''}`}
      onClick={onClick}
    >
      <span className="mini__ovr">{ovr}</span>
      <span className="mini__pos">{card.pos}</span>
      <span className="mini__name">{card.name.length <= 9 ? card.name : last}</span>
      {warn && <span className="mini__warn" title="Out of position">{warn}</span>}
    </button>
  );
}

export function CoachCard({ coach, role, onClick }) {
  const passive = COACH_PASSIVES[coach.passive];
  const strength = role === 'assistant' ? ' (50%)' : '';
  return (
    <button type="button" className={`ccard r-${coach.rarity}`} onClick={onClick} disabled={!onClick}>
      <div className="ccard__role">{role === 'assistant' ? 'Assistant' : 'Head coach'}</div>
      <div className="ccard__name">{coach.name}</div>
      <div className="ccard__row">
        {role !== 'assistant' && <span className="chip">{coach.formation}</span>}
        <span className="chip chip--soft" title={passive.text}>{passive.name}{strength}</span>
      </div>
      <div className="ccard__text">{passive.text}</div>
      <div className="ccard__left">{coach.matchesLeft} matches left</div>
    </button>
  );
}

export function BoostCard({ id, count, onClick, active, disabled, compact, reason }) {
  const boost = BOOSTS[id];
  return (
    <button
      type="button"
      className={`bcard${active ? ' is-active' : ''}${compact ? ' bcard--compact' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={reason || boost.text}
    >
      <span className="bcard__icon" aria-hidden="true">{boost.icon}</span>
      <span className="bcard__name">{boost.name}</span>
      {!compact && <span className="bcard__text">{boost.text}</span>}
      {count !== undefined && <span className="bcard__count">×{count}</span>}
    </button>
  );
}
