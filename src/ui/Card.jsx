import React from 'react';
import { overall, RARITIES, TRAITS } from '../engine/cards.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { BOOSTS } from '../data/boosts.js';
import { OFFSEASON_CARDS, GROUP_LABEL, cardText } from '../data/offseason.js';
import { PACKS } from '../engine/packs.js';
import { skillOf } from '../data/skills.js';
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
          <div className="pcard__tags">
            <span className="pcard__rarity">{rarity.label}</span>
            {card.stars > 0 && <span className="stars">{'★'.repeat(card.stars)}</span>}
            {card.youth && <span className="pcard__youth">Youth</span>}
            {card.classic && <span className="pcard__youth pcard__classic">Classic</span>}
          </div>
        </div>
        <div className="pcard__art">
          <Silhouette colors={colors} pos={card.pos} seed={card.id} />
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
        {skillOf(card) && (
          <div className="pcard__skill" title={skillOf(card).desc}>
            <b>{skillOf(card).icon} {skillOf(card).name}</b>
            {size === 'full' && <span>{skillOf(card).desc}</span>}
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
        {size === 'full' && !card.generic && (card.fame > 0 || RARITIES[card.rarity]?.popularity > 0) && (
          <div className="pcard__pop">Popularity {Math.round(((RARITIES[card.rarity]?.popularity || 0) * (1 + 0.25 * (card.stars || 0)) + (card.fame || 0)) * 10) / 10} ★</div>
        )}
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
      {card.stars > 0 && <span className="mini__stars">{'★'.repeat(card.stars)}</span>}
      {skillOf(card) && <span className="mini__skill" title={skillOf(card).name} aria-hidden="true">{skillOf(card).icon}</span>}
      {warn && <span className="mini__warn" title="Out of position">{warn}</span>}
    </button>
  );
}

export function CoachCard({ coach, role, onClick, selected }) {
  const passive = COACH_PASSIVES[coach.passive] || { name: 'No passive', text: 'A stand-in until you sign a coach.' };
  const strength = role === 'assistant' ? ' (50%)' : '';
  return (
    <button type="button" className={`ccard r-${coach.rarity}${selected ? ' is-selected' : ''}`} onClick={onClick} disabled={!onClick}>
      <div className="ccard__role">{role === 'assistant' ? 'Assistant' : role === 'new' ? 'Coach card' : 'Head coach'} · {RARITIES[coach.rarity]?.label}{coach.stars ? ` ${'★'.repeat(coach.stars)}` : ''}</div>
      <div className="ccard__name">{coach.name}</div>
      <div className="ccard__row">
        {role !== 'assistant' && <span className="chip">{coach.formation}</span>}
        <span className="chip chip--soft" title={passive.text}>{passive.name}{strength}</span>
      </div>
      <div className="ccard__text">{passive.text}</div>
      {skillOf(coach) && <div className="ccard__skill"><b>{skillOf(coach).icon} {skillOf(coach).name}</b><span>{skillOf(coach).desc}</span></div>}
      <div className="ccard__left">{coach.matchesLeft == null ? 'No retirement' : `${coach.matchesLeft} matches left`}</div>
    </button>
  );
}

export function BoostCard({ id, count, onClick, active, disabled, compact, reason, rarity }) {
  const boost = BOOSTS[id];
  return (
    <button
      type="button"
      className={`bcard r-${boost.rarity}${active ? ' is-active' : ''}${compact ? ' bcard--compact' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={reason || boost.text}
    >
      <span className="bcard__icon" aria-hidden="true">{boost.icon}</span>
      <span className="bcard__name">{boost.name}</span>
      {rarity && !compact && <span className="bcard__rarity">{RARITIES[boost.rarity].label}</span>}
      {!compact && <span className="bcard__text">{boost.text}</span>}
      {count !== undefined && <span className="bcard__count">×{count}</span>}
    </button>
  );
}

export function OffseasonCard({ item, onClick, footer, disabled, selected }) {
  const def = OFFSEASON_CARDS[item.type];
  return (
    <button type="button" className={`ocard r-${item.rarity}${selected ? ' is-selected' : ''}`} onClick={onClick} disabled={disabled}>
      <div className="ocard__top">
        <span className="ocard__group">{GROUP_LABEL[def.group]}</span>
        <span className="ocard__rarity">{RARITIES[item.rarity].label}</span>
      </div>
      <span className="ocard__icon" aria-hidden="true">{def.icon}</span>
      <span className="ocard__name">{def.name}</span>
      <span className="ocard__text">{cardText(item.type, item.rarity)}</span>
      {footer && <span className="ocard__footer">{footer}</span>}
    </button>
  );
}

export function PackArt({ packId, small, big }) {
  const pack = PACKS[packId];
  return (
    <div className={`pack pack--${packId}${small ? ' pack--small' : ''}${big ? ' pack--big' : ''}`}>
      <span className="pack__shine" />
      <span className="pack__name">{pack.name.replace(' Pack', '')}</span>
      <span className="pack__count">{pack.count} {pack.kind === 'coach' ? 'coaches' : 'players'}</span>
    </div>
  );
}
