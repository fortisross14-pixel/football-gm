import React, { useMemo } from 'react';
import { aiTeamFor, standings, topScorers } from '../engine/season.js';
import { clubHistory, recordRow } from '../engine/history.js';
import { DIVISION_BY_ID, CONTINENT_LABEL } from '../data/world/structure.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';
import { overall, RARITIES } from '../engine/cards.js';
import { skillOf } from '../data/skills.js';
import { POOL_BY_ID } from '../state/club.js';
import { Crest } from './Art.jsx';
import { Flag } from './Card.jsx';
import { LeagueLink } from './nav.jsx';

const nameOf = (id) => POOL_BY_ID[id]?.name;
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const TROPHY_ICON = { league: '🏆', cup: '🥇', continental: '🌍', cwc: '🌐' };

// Any club's page: squad, coach, honours, season-by-season record and all-time scorers.
export default function Team({ state, clubId, onBack, onCurse }) {
  const club = state.world.clubs[clubId];
  const isUser = clubId === state.club.id;
  const div = DIVISION_BY_ID[club.divisionId];
  const table = standings(state.season, club.divisionId);
  const pos = table.findIndex((r) => r.id === clubId) + 1;
  const row = table[pos - 1];
  const hist = useMemo(() => clubHistory(state.archive || [], clubId), [state.archive, clubId]);

  const squad = useMemo(() => {
    if (isUser) {
      const lineup = state.lineup.map((id) => state.squad.find((c) => c.id === id));
      const bench = state.squad.filter((c) => !state.lineup.includes(c.id));
      return { lineup, bench, formation: state.coaches.coach.formation };
    }
    const t = aiTeamFor(state.world, clubId, POOL_BY_ID, 1);
    const by = Object.fromEntries(t.players.map((p) => [p.id, p]));
    return { lineup: t.lineup.map((id) => by[id]), bench: t.bench.map((id) => by[id]), formation: t.formation };
  }, [state, clubId, isUser]);

  const scorersNow = topScorers(state.season, club.divisionId, 60).filter((s) => s.clubId === clubId).slice(0, 3);
  const allTime = useMemo(() => Object.entries(state.records?.players || {})
    .filter(([, p]) => p.c?.[clubId])
    .map(([id, p]) => ({ ...recordRow(id, p, nameOf), here: p.c[clubId] }))
    .sort((a, b) => b.here - a.here)
    .slice(0, 8), [state.records, clubId]);
  const vs = (state.history || []).filter((h) => h.opponent === club.name);
  const vsRec = { W: 0, D: 0, L: 0 };
  for (const h of vs) vsRec[h.outcome] += 1;
  const passive = COACH_PASSIVES[isUser ? state.coaches.coach.passive : club.passive];
  const named = squad.lineup.concat(squad.bench).filter((c) => c && !c.generic && c.rarity !== 'academy');
  const h = hist.honours;
  const totalHonours = h.league + h.cup + h.continental + h.cwc;

  return (
    <div className="screen team-page">
      <div className="club-head">
        <Crest colors={club.colors} short={club.short} size={56} />
        <div>
          <b>{club.name}</b>
          <span><LeagueLink divId={club.divisionId}>{div.name}</LeagueLink> · {div.country} · Level {div.level}</span>
        </div>
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>

      <div className="stat-tiles">
        <div><span>Position</span><b>{row?.p ? ordinal(pos) : '—'}</b><small>{row ? `${row.pts} pts · ${row.w}-${row.d}-${row.l}` : ''}</small></div>
        <div><span>Strength</span><b>{Math.round(isUser ? squadOvr(squad.lineup) : club.strength)}</b><small>{squad.formation}</small></div>
        <div><span>Honours</span><b>{totalHonours}</b><small>{hist.seasons.length} seasons on record</small></div>
      </div>
      {isUser && <p className="hint hint--accent">This is your club.</p>}
      {!isUser && vs.length > 0 && <p className="hint">Your recent record against them: {vsRec.W}W {vsRec.D}D {vsRec.L}L</p>}

      <section>
        <h2 className="section-title">Squad</h2>
        <ul className="squad-list">
          {[...squad.lineup, ...squad.bench].filter(Boolean).map((c, i) => {
            const sk = skillOf(c);
            return (
              <li key={c.id} className={`r-${c.rarity}${i >= squad.lineup.length ? ' is-bench' : ''}`}>
                <span className="squad-list__pos">{c.pos}</span>
                <span className="squad-list__ovr">{overall(c)}</span>
                <span className="squad-list__name"><Flag card={c} className="squad-list__flag" />{c.name}{c.generic ? '' : <em> · {RARITIES[c.rarity].label}</em>}</span>
                {sk && <span className="squad-list__skill" title={sk.desc}>{sk.icon} {sk.name}</span>}
                {i === squad.lineup.length && <span className="squad-list__tag">Bench</span>}
              </li>
            );
          })}
        </ul>
        <p className="hint">{named.length} named card{named.length === 1 ? '' : 's'}{passive ? ` · Coach: ${passive.name} (${passive.text})` : ''}</p>
      </section>

      {scorersNow.length > 0 && (
        <section>
          <h2 className="section-title">This season's scorers</h2>
          <ul className="champions">{scorersNow.map((s) => <li key={s.id}><span>{s.name}</span><b>{s.goals}</b></li>)}</ul>
        </section>
      )}

      <section>
        <h2 className="section-title">Honours</h2>
        <div className="honours">
          <div><b>{h.league}</b><span>League titles</span></div>
          <div><b>{h.cup}</b><span>Domestic cups</span></div>
          <div><b>{h.continental}</b><span>{CONTINENT_LABEL[div.continent]} cups</span></div>
          <div><b>{h.cwc}</b><span>Club World Cups</span></div>
          <div><b>{h.runnerUp}</b><span>League runner-up</span></div>
        </div>
      </section>

      {hist.seasons.length > 0 && (
        <section>
          <h2 className="section-title">Season by season</h2>
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>Season</th><th className="table__club">League</th><th>Pos</th><th>Pts</th><th>W-D-L</th><th>GF-GA</th><th className="table__club">Top scorer</th><th /></tr></thead>
              <tbody>
                {hist.seasons.map((s) => (
                  <tr key={s.year} className={s.pos === 1 ? 'is-top' : ''}>
                    <td>{s.year}</td>
                    <td className="table__club"><LeagueLink divId={s.divId}>{DIVISION_BY_ID[s.divId].name}</LeagueLink></td>
                    <td><b>{s.pos}</b></td>
                    <td>{s.pts}</td>
                    <td>{s.w}-{s.d}-{s.l}</td>
                    <td>{s.gf}-{s.ga}</td>
                    <td className="table__club">{s.scorer ? `${s.scorer.name || nameOf(s.scorer.id) || '?'} (${s.scorer.goals})` : '—'}</td>
                    <td>{s.trophies.map((t) => TROPHY_ICON[t]).join(' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {allTime.length > 0 && (
        <section>
          <h2 className="section-title">All-time league scorers for {club.short}</h2>
          <ol className="scorer-list">
            {allTime.map((p, i) => (
              <li key={p.id}>
                <span className="scorer-list__pos">{i + 1}</span>
                <span className="scorer-list__name">{p.name}{p.mvp ? <em> · {p.mvp}× MVP</em> : null}</span>
                <b>{p.here}</b>
              </li>
            ))}
          </ol>
        </section>
      )}
      {!isUser && onCurse && (
        <section className="house-rule">
          <label className={`switch${club.cursed ? ' is-on' : ''}`}>
            <input type="checkbox" checked={!!club.cursed} onChange={() => onCurse(clubId)} />
            <span className="switch__track" aria-hidden="true"><i /></span>
            <span className="switch__body"><b>Curse this club (house rule)</b><small>Its Rare, Epic and Legend players leave every summer and it loses at least half its games.</small></span>
          </label>
        </section>
      )}
      {hist.seasons.length === 0 && <p className="hint">History builds up season by season: titles, finishes and scorers appear here after each season ends.</p>}
    </div>
  );
}

function squadOvr(lineup) {
  const list = lineup.filter(Boolean);
  return list.reduce((s, c) => s + overall(c), 0) / Math.max(1, list.length);
}

// Menu → House rules: personal tweaks to the world.
export function HouseRules({ state, onToggle }) {
  const cursed = state.houseRules?.cursed || [];
  const barca = state.world.clubs.barcelona;
  return (
    <div className="house-rules">
      {barca && state.club.id !== 'barcelona' && (
        <label className={`switch${cursed.includes('barcelona') ? ' is-on' : ''}`}>
          <input type="checkbox" checked={cursed.includes('barcelona')} onChange={() => onToggle('barcelona')} />
          <span className="switch__track" aria-hidden="true"><i /></span>
          <span className="switch__body"><b>Barcelona curse</b><small>Barcelona lose their stars every summer and lose at least half their games.</small></span>
        </label>
      )}
      {cursed.filter((id) => id !== 'barcelona').map((id) => (
        <label key={id} className="switch is-on">
          <input type="checkbox" checked onChange={() => onToggle(id)} />
          <span className="switch__track" aria-hidden="true"><i /></span>
          <span className="switch__body"><b>{state.world.clubs[id]?.name} curse</b><small>Tap to lift it.</small></span>
        </label>
      ))}
      <p className="hint">You can curse any other club from its club page.</p>
    </div>
  );
}
