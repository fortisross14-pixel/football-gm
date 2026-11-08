import React, { createContext, useContext } from 'react';

// Links between screens: any club name opens that club's page, any league name
// opens its table in the League section.
export const NavContext = createContext({ openClub: () => {}, openLeague: () => {} });
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
