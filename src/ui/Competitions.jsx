import React, { useMemo } from 'react';
import { DIVISIONS, DIVISION_BY_ID, CONTINENT_LABEL } from '../data/world/structure.js';
import {
  CONTINENTS, CONTINENT_NAME, CONTINENT2_NAME, CONT_SUPER_NAME, compRefOf, refKey, keyName, superCupName,
} from '../engine/competitions.js';
import { finalsByKey } from '../engine/history.js';
import { standings } from '../engine/season.js';
import { nextUserGame } from '../state/club.js';
import { Crest } from './Art.jsx';
import { CompLink, ClubLink } from './nav.jsx';
import { DomesticCup, Continental, ClubWorldCup, SuperCup } from './Cups.jsx';
import CompStats from './CompStats.jsx';
import { Segmented } from './Home.jsx';
import League from './League.jsx';

// A competition reference: { type: 'league' | 'cup' | 'super' | 'cont' | 'cont2' | 'csuper' | 'cwc', id }.
export const compName = (c) => (c ? keyName(refKey(c)) : '');
export const compOfGame = (state, game) => (game ? compRefOf(game.competition, state.club.divisionId) : null);
const TYPE_LABEL = {
  league: 'League', cup: 'Domestic cup', super: 'Super cup', cont: 'Continental', cont2: 'Continental · tier 2', csuper: 'Continental super cup', cwc: 'World',
};

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const COUNTRIES = [...new Map(DIVISIONS.map((d) => [d.code, d])).values()];
const isIn = (g, me) => g && (g.home === me || g.away === me);

// Where the user stands in a continental tournament.
function tournamentStatus(state, t) {
  const me = state.club.id;
  const short = (id) => state.world.clubs[id]?.short;
  if (t.winner) return t.winner === me ? 'Winners 🏆' : `Won by ${short(t.winner)}`;
  const ko = [...(t.prelim || []), ...(t.qualifying || []), ...(t.quarters || []), ...(t.semis || []), ...(t.final ? [t.final] : [])];
  if (ko.some((g) => isIn(g, me) && g.winner && g.winner !== me)) return 'Knocked out';
  const gi = (t.groups || []).findIndex((g) => g.clubs.includes(me));
  if (gi >= 0) return `Group ${'ABCD'[gi]}`;
  if ((t.prelim || []).some((g) => isIn(g, me))) return 'Preliminary round';
  if ((t.qualifying || []).some((g) => isIn(g, me))) return 'Qualifying round';
  return 'You qualified';
}
function singleStatus(state, sc) {
  const short = (id) => state.world.clubs[id]?.short;
  if (!sc.winner) return `vs ${short(sc.clubs.find((id) => id !== state.club.id))} · one match`;
  return sc.winner === state.club.id ? 'Winners 🏆' : `Won by ${short(sc.winner)}`;
}

// The Competitions tab: your competitions first, then every league and cup in the world.
export default function Competitions({ state }) {
  const comps = state.season.comps;
  const me = state.club.id;
  const div = DIVISION_BY_ID[state.club.divisionId];
  const pos = standings(state.season, div.id).findIndex((r) => r.id === me) + 1;
  const cup = comps.cups[div.code];
  const cupStatus = !cup ? null : cup.winner === me ? 'Winners 🏆' : cup.winner ? `Won by ${state.world.clubs[cup.winner]?.short}` : cup.rounds.length && !cup.rounds.at(-1).some((g) => g.home === me || g.away === me) && cup.rounds.some((r) => r.some((g) => (g.home === me || g.away === me) && g.winner && g.winner !== me)) ? 'Knocked out' : `In the draw · ${cup.size} clubs`;
  const conf = div.continent;
  const sup = comps.supercups?.[div.code];
  const csup = comps.contSuper?.[conf];
  const k1 = comps.continental?.[conf];
  const k2 = comps.continental2?.[conf];
  const mine = [
    { c: { type: 'league', id: div.id }, sub: `${div.country} · ${pos ? `you're ${ordinal(pos)}` : 'starts soon'}` },
    sup?.clubs.includes(me) && { c: { type: 'super', id: div.code }, sub: singleStatus(state, sup) },
    cup && { c: { type: 'cup', id: div.code }, sub: cupStatus },
    csup?.clubs.includes(me) && { c: { type: 'csuper', id: conf }, sub: singleStatus(state, csup) },
    k1?.entrants.includes(me) && { c: { type: 'cont', id: conf }, sub: tournamentStatus(state, k1) },
    k2?.entrants.includes(me) && { c: { type: 'cont2', id: conf }, sub: tournamentStatus(state, k2) },
    comps.cwc?.clubs?.includes(me) && { c: { type: 'cwc', id: 'cwc' }, sub: comps.cwc.winner ? (comps.cwc.winner === me ? 'Winners 🏆' : `Won by ${state.world.clubs[comps.cwc.winner]?.short}`) : 'You qualified' },
  ].filter(Boolean);
  const next = nextUserGame(state);
  const byContinent = useMemo(() => Object.keys(CONTINENT_LABEL).map((k) => ({ k, countries: COUNTRIES.filter((d) => d.continent === k) })), []);

  return (
    <div className="screen comps-hub">
      <section>
        <h2 className="section-title">Your competitions · season {state.season.year}</h2>
        <div className="comp-cards">
          {mine.map(({ c, sub }) => (
            <CompLink key={`${c.type}-${c.id}`} comp={c} className={`comp-card comp-card--${c.type}`}>
              <span className="comp-card__type">{TYPE_LABEL[c.type]}</span>
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
        <div className="league-grid">
          {CONTINENTS.map((k) => (
            <div key={k} className="league-grid__country">
              <span className="league-grid__name">{CONTINENT_LABEL[k]}</span>
              <div className="chip-row">
                <CompLink comp={{ type: 'cont', id: k }} className={`chip-btn${k === conf ? ' is-on' : ''}`}>{CONTINENT_NAME[k]}</CompLink>
                {comps.continental2?.[k] && <CompLink comp={{ type: 'cont2', id: k }} className="chip-btn">{CONTINENT2_NAME[k]}</CompLink>}
                {comps.contSuper?.[k] && <CompLink comp={{ type: 'csuper', id: k }} className="chip-btn chip-btn--cup">{CONT_SUPER_NAME[k]}</CompLink>}
              </div>
            </div>
          ))}
          <div className="league-grid__country">
            <span className="league-grid__name">World</span>
            <div className="chip-row"><CompLink comp={{ type: 'cwc', id: 'cwc' }} className="chip-btn">Club World Cup</CompLink></div>
          </div>
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
                  {comps.supercups?.[d.code] && <CompLink comp={{ type: 'super', id: d.code }} className="chip-btn chip-btn--cup">{superCupName(d.code)}</CompLink>}
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

function CompDraw({ state, comp }) {
  const comps = state.season.comps;
  switch (comp.type) {
    case 'cup': return comps.cups[comp.id] ? <DomesticCup state={state} cup={comps.cups[comp.id]} /> : <p className="hint">No cup in this country.</p>;
    case 'super': return <SuperCup state={state} sc={comps.supercups?.[comp.id]} name={compName(comp)} kind="super" />;
    case 'csuper': return <SuperCup state={state} sc={comps.contSuper?.[comp.id]} name={compName(comp)} kind="csuper" />;
    case 'cont': return <Continental state={state} c={comps.continental[comp.id]} name={CONTINENT_NAME[comp.id]} />;
    case 'cont2': return comps.continental2?.[comp.id] ? <Continental state={state} c={comps.continental2[comp.id]} name={CONTINENT2_NAME[comp.id]} /> : <p className="hint">No second continental trophy in {CONTINENT_LABEL[comp.id]}.</p>;
    default: return <ClubWorldCup state={state} cwc={comps.cwc} />;
  }
}

function CupScreen({ state, comp, initialTab, onBack }) {
  const [tab, setTab] = React.useState(initialTab || 'draw');
  const single = comp.type === 'super' || comp.type === 'csuper';
  const intl = ['cont', 'cont2', 'csuper'].includes(comp.type);
  return (
    <div className="screen comp-screen">
      <div className="comp-head">
        <div>
          <span className="comp-head__type">{comp.type === 'cwc' ? 'Club World Cup' : TYPE_LABEL[comp.type]}{intl ? ` · ${CONTINENT_LABEL[comp.id]}` : ''} · Season {state.season.year}</span>
          <b className="comp-head__name">{compName(comp)}</b>
        </div>
        {onBack && <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>}
      </div>
      <Segmented small label="View" value={tab} options={[{ id: 'draw', label: comp.type === 'cup' ? 'Draw' : single ? 'Match' : 'Groups & knockouts' }, { id: 'stats', label: 'Stats' }, { id: 'history', label: 'History' }]} onChange={setTab} />
      {tab === 'draw' && <CompDraw state={state} comp={comp} />}
      {tab === 'stats' && <CompStats state={state} comp={refKey(comp)} />}
      {tab === 'history' && <CupHistory state={state} comp={comp} />}
    </div>
  );
}

// Winners and runners-up by season, from the history book.
function CupHistory({ state, comp }) {
  const key = refKey(comp);
  const rows = (state.archive || []).map((e) => ({ year: e.year, r: finalsByKey(e)[key] })).filter((x) => x.r?.winner).reverse();
  if (!rows.length) return <p className="hint">Winners appear here after each season.</p>;
  const counts = {};
  for (const x of rows) counts[x.r.winner] = (counts[x.r.winner] || 0) + 1;
  const club = (id) => state.world.clubs[id];
  return (
    <>
      <div className="scroll-x">
        <table className="table table--history">
          <thead><tr><th>Season</th><th className="table__club">Winner</th><th className="table__club">Runner-up</th></tr></thead>
          <tbody>
            {rows.map(({ year, r }) => (
              <tr key={year} className={r.winner === state.club.id ? 'is-user' : ''}>
                <td>{year}</td>
                <td className="table__club">{club(r.winner) && <ClubLink id={r.winner} className="club-inline"><Crest colors={club(r.winner).colors} short={club(r.winner).short} id={r.winner} size={16} /> <span>{club(r.winner).name}</span></ClubLink>}</td>
                <td className="table__club">{r.runnerUp && club(r.runnerUp) ? <ClubLink id={r.runnerUp}>{club(r.runnerUp).name}</ClubLink> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="sub-title">Most titles</h3>
      <ol className="scorer-list">
        {Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, n], i) => (
          <li key={id}><span className="scorer-list__pos">{i + 1}</span><span className="scorer-list__name"><ClubLink id={id}>{club(id)?.name}</ClubLink></span><b>{n}</b></li>
        ))}
      </ol>
    </>
  );
}
