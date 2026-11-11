import React, { useMemo } from 'react';
import { DIVISIONS, DIVISION_BY_ID, CONTINENT_LABEL } from '../data/world/structure.js';
import { CONTINENTS, CONTINENT_NAME } from '../engine/competitions.js';
import { standings } from '../engine/season.js';
import { nextUserGame } from '../state/club.js';
import { Crest } from './Art.jsx';
import { CompLink, ClubLink } from './nav.jsx';
import { DomesticCup, Continental, ClubWorldCup } from './Cups.jsx';
import CompStats from './CompStats.jsx';
import CompHistory from './CompHistory.jsx';
import { Segmented } from './Home.jsx';
import League from './League.jsx';
import { yearLabel } from '../engine/years.js';

// A competition reference: { type: 'league' | 'cup' | 'cont' | 'cwc', id }.
export const compName = (c) => {
  if (!c) return '';
  if (c.type === 'league') return DIVISION_BY_ID[c.id]?.name || c.id;
  if (c.type === 'cup') return `${DIVISIONS.find((d) => d.code === c.id)?.country || c.id} Cup`;
  if (c.type === 'cont') return CONTINENT_NAME[c.id];
  return 'Club World Cup';
};
export const compOfGame = (state, game) => {
  if (!game) return null;
  if (game.competition === 'league') return { type: 'league', id: state.club.divisionId };
  if (game.competition === 'cup') return { type: 'cup', id: DIVISION_BY_ID[state.club.divisionId].code };
  if (game.competition === 'continental') return { type: 'cont', id: DIVISION_BY_ID[state.club.divisionId].continent };
  return { type: 'cwc', id: 'cwc' };
};

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const COUNTRIES = [...new Map(DIVISIONS.map((d) => [d.code, d])).values()];

// The Competitions tab: your competitions first, then every league and cup in the world.
export default function Competitions({ state }) {
  const comps = state.season.comps;
  const me = state.club.id;
  const div = DIVISION_BY_ID[state.club.divisionId];
  const pos = standings(state.season, div.id).findIndex((r) => r.id === me) + 1;
  const cup = comps.cups[div.code];
  const cupStatus = !cup ? null : cup.winner === me ? 'Winners 🏆' : cup.winner ? `Won by ${state.world.clubs[cup.winner]?.short}` : cup.rounds.length && !cup.rounds.at(-1).some((g) => g.home === me || g.away === me) && cup.rounds.some((r) => r.some((g) => (g.home === me || g.away === me) && g.winner && g.winner !== me)) ? 'Knocked out' : `In the draw · ${cup.size} clubs`;
  const mine = [
    { c: { type: 'league', id: div.id }, sub: `${div.country} · ${pos ? `you're ${ordinal(pos)}` : 'starts soon'}` },
    cup && { c: { type: 'cup', id: div.code }, sub: cupStatus },
    ...CONTINENTS.filter((k) => comps.continental[k].entrants.includes(me)).map((k) => ({ c: { type: 'cont', id: k }, sub: comps.continental[k].winner ? `Won by ${state.world.clubs[comps.continental[k].winner]?.short}` : 'You qualified' })),
    comps.cwc?.clubs?.includes(me) && { c: { type: 'cwc', id: 'cwc' }, sub: 'You qualified' },
  ].filter(Boolean);
  const next = nextUserGame(state);
  const byContinent = useMemo(() => Object.keys(CONTINENT_LABEL).map((k) => ({ k, countries: COUNTRIES.filter((d) => d.continent === k) })), []);

  return (
    <div className="screen comps-hub">
      <section>
        <h2 className="section-title">Your competitions · {yearLabel(state.season.year)}</h2>
        <div className="comp-cards">
          {mine.map(({ c, sub }) => (
            <CompLink key={`${c.type}-${c.id}`} comp={c} className={`comp-card comp-card--${c.type}`}>
              <span className="comp-card__type">{{ league: 'League', cup: 'Domestic cup', cont: 'Continental', cwc: 'World' }[c.type]}</span>
              <b>{compName(c)}</b>
              <small>{sub}</small>
            </CompLink>
          ))}
        </div>
        {next && <p className="hint">Next: {next.label} vs <ClubLink id={next.opponentId}>{state.world.clubs[next.opponentId]?.name}</ClubLink></p>}
      </section>

      {state.history?.length > 0 && (
        <section>
          <h2 className="section-title">Your results</h2>
          <ul className="results">
            {state.history.slice(0, 8).map((h, i) => (
              <li key={i}>
                <span className={`res res--${h.outcome}`}>{h.outcome}</span>
                <span className="results__opp">{h.venue === 'H' ? 'vs' : '@'} <ClubLink id={h.opponentId}>{h.opponent}</ClubLink>{h.derby ? ' 🔥' : ''}</span>
                <span className="results__comp">{h.comp ? <CompLink comp={h.comp}>{h.competition}</CompLink> : h.competition}</span>
                <b>{h.score[0]}–{h.score[1]}</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="section-title">International</h2>
        <div className="chip-row">
          {CONTINENTS.map((k) => <CompLink key={k} comp={{ type: 'cont', id: k }} className="chip-btn">{CONTINENT_NAME[k]}</CompLink>)}
          <CompLink comp={{ type: 'cwc', id: 'cwc' }} className="chip-btn">Club World Cup</CompLink>
        </div>
      </section>

      {byContinent.map(({ k, countries }) => (
        <section key={k}>
          <h2 className="section-title">{CONTINENT_LABEL[k]}</h2>
          <div className="league-grid">
            {countries.map((d) => (
              <div key={d.code} className="league-grid__country">
                <span className="league-grid__name">{d.country}</span>
                <div className="chip-row">
                  {DIVISIONS.filter((x) => x.code === d.code).map((x) => (
                    <CompLink key={x.id} comp={{ type: 'league', id: x.id }} className={`chip-btn${x.id === div.id ? ' is-on' : ''}`}>{x.name}</CompLink>
                  ))}
                  {comps.cups[d.code] && <CompLink comp={{ type: 'cup', id: d.code }} className="chip-btn chip-btn--cup">{d.country} Cup</CompLink>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// One competition, with its own tabs.
export function Competition({ state, comp, tab: initialTab, onBack }) {
  if (comp.type === 'league') return <League state={state} nav={{ divId: comp.id, tab: initialTab }} onBack={onBack} />;
  return <CupScreen state={state} comp={comp} initialTab={initialTab} onBack={onBack} />;
}

function CupScreen({ state, comp, initialTab, onBack }) {
  const [tab, setTab] = React.useState(initialTab || 'draw');
  const comps = state.season.comps;
  const statsKey = comp.type === 'cup' ? `C:${comp.id}` : comp.type === 'cont' ? `K:${comp.id}` : 'W';
  return (
    <div className="screen comp-screen">
      <div className="comp-head">
        <div>
          <span className="comp-head__type">{{ cup: 'Domestic cup', cont: 'Continental', cwc: 'Club World Cup' }[comp.type]} · {yearLabel(state.season.year)}</span>
          <b className="comp-head__name">{compName(comp)}</b>
        </div>
        {onBack && <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>}
      </div>
      <Segmented small label="View" value={tab} options={[{ id: 'draw', label: comp.type === 'cup' ? 'Draw' : 'Groups & knockouts' }, { id: 'stats', label: 'Stats' }, { id: 'history', label: 'History' }]} onChange={setTab} />
      {tab === 'draw' && (
        comp.type === 'cup' ? (comps.cups[comp.id] ? <DomesticCup state={state} cup={comps.cups[comp.id]} /> : <p className="hint">No cup in this country.</p>)
          : comp.type === 'cont' ? <Continental state={state} c={comps.continental[comp.id]} name={CONTINENT_NAME[comp.id]} />
            : <ClubWorldCup state={state} cwc={comps.cwc} />
      )}
      {tab === 'stats' && <CompStats state={state} comp={statsKey} />}
      {tab === 'history' && <CompHistory state={state} gameKey={statsKey} />}
    </div>
  );
}
