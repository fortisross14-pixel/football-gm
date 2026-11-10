import React, { createContext, useContext, useState } from 'react';

// UI choices (sub-tabs, filters) that survive leaving a screen and coming Back to it.
// The tab bar clears them, so a tab opens fresh. token: a new value starts over (e.g. a league link).
const sticky = new Map();
export const resetSticky = () => sticky.clear();
export function useSticky(key, initial, token = null) {
  const [v, setV] = useState(() => {
    const s = sticky.get(key);
    return s && s.token === token ? s.v : (typeof initial === 'function' ? initial() : initial);
  });
  const set = (x) => setV((prev) => {
    const nv = typeof x === 'function' ? x(prev) : x;
    sticky.set(key, { v: nv, token });
    return nv;
  });
  return [v, set];
}

// Links between screens: any club name opens that club's page, any league name
// opens its table, any competition name its screen, any player or manager name their page.
export const NavContext = createContext({ openClub: () => {}, openLeague: () => {}, openComp: () => {}, openPlayer: () => {}, openManager: () => {} });
export const useNav = () => useContext(NavContext);

export function ClubLink({ id, children, className = '' }) {
  const { openClub } = useNav();
  if (!id) return <span className={className}>{children}</span>;
  return (
    <button type="button" className={`xlink ${className}`} onClick={(e) => { e.stopPropagation(); openClub(id); }}>
      {children}
    </button>
  );
}

export function LeagueLink({ divId, tab = 'table', children, className = '' }) {
  const { openLeague } = useNav();
  return (
    <button type="button" className={`xlink ${className}`} onClick={(e) => { e.stopPropagation(); openLeague(divId, tab); }}>
      {children}
    </button>
  );
}

// A player's name: opens his profile (career, history, stats). name is a fallback for players
// outside the card pool. Without an id it is plain text.
export function PlayerLink({ id, name, children, className = '' }) {
  const { openPlayer } = useNav();
  if (!id) return <span className={className}>{children ?? name}</span>;
  return (
    <button type="button" className={`xlink ${className}`} onClick={(e) => { e.stopPropagation(); openPlayer(id, name); }}>
      {children ?? name}
    </button>
  );
}

// A manager's name (stats-book key: 'clubId|Name' or 'you').
export function ManagerLink({ mkey, children, className = '' }) {
  const { openManager } = useNav();
  if (!mkey) return <span className={className}>{children}</span>;
  return (
    <button type="button" className={`xlink ${className}`} onClick={(e) => { e.stopPropagation(); openManager(mkey); }}>
      {children}
    </button>
  );
}

// Opens a player's profile from a card sheet (closes the sheet first).
export function ProfileButton({ id, name, onDone }) {
  const { openPlayer } = useNav();
  return (
    <button type="button" className="btn btn--ghost btn--block" onClick={() => { onDone?.(); openPlayer(id, name); }}>
      Profile · career, history, stats
    </button>
  );
}

export const managerKey = (clubId, name, userClubId = null) => (clubId === userClubId ? 'you' : `${clubId}|${name}`);

// Any competition: { type: 'league' | 'cup' | 'cont' | 'cwc', id }.
export function CompLink({ comp, tab, children, className = '' }) {
  const { openComp } = useNav();
  if (!comp) return <span className={className}>{children}</span>;
  return (
    <button type="button" className={`xlink ${className}`} onClick={(e) => { e.stopPropagation(); openComp(comp, tab); }}>
      {children}
    </button>
  );
}
