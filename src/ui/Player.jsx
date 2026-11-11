import React, { useMemo, useState } from 'react';
import { RARITIES, TRAITS } from '../engine/cards.js';
import { skillOf } from '../data/skills.js';
import { emptyBook } from '../engine/statsbook.js';
import { playerSeasons, playerMoves, clubSpells, careerTotals, MOVE_LABEL } from '../engine/careers.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import { POOL_BY_ID, cardPopularity } from '../state/club.js';
import { Crest } from './Art.jsx';
import { PlayerCard, Flag, cardNation } from './Card.jsx';
import { clubVars } from './clubTheme.js';
import { ClubLink, LeagueLink } from './nav.jsx';
import { Segmented } from './Home.jsx';
import { compName, compOrder, TROPHY_ICON, trophyNames } from './names.js';
import { yearLabel } from '../engine/years.js';

const NEUTRAL = { colors: ['#1b1f29', '#ffd400'] };

// Where a player is now and the card to show: your squad, an AI club, retired or a free agent.
export function resolvePlayer(state, id, fallbackName) {
  const own = state.squad.find((c) => c.id === id);
  const pool = POOL_BY_ID[id];
  const hof = [...(state.hallOfFame || [])].reverse().find((h) => h.card.id === id);
  const holder = Object.values(state.world.clubs).find((c) => c.id !== state.club.id && c.keyPlayers?.includes(id));
  const resting = state.world.resting?.[id];
  const nameFromBooks = state.careerNames?.[id]?.[0] || state.stats?.all?.players?.[id]?.n || state.playerStats?.[id]?.name;
  if (own) return { card: own, clubId: state.club.id, status: 'yours', label: 'Your squad' };
  if (holder) return { card: { ...pool, matchesLeft: state.world.cardLeft?.[id] ?? pool?.matchesLeft }, clubId: holder.id, status: 'club', label: holder.name };
  if (resting) return { card: hof?.card || pool || null, clubId: null, status: 'retired', label: `Retired · could return in ${resting} season${resting === 1 ? '' : 's'}`, name: nameFromBooks };
  if (hof) return { card: hof.card, clubId: null, status: 'retired', label: `Retired in ${yearLabel(hof.season ?? 1)} (Hall of Fame)` };
  if (pool) return { card: { ...pool }, clubId: null, status: 'free', label: 'Free agent' };
  const lastClub = state.stats?.all?.players?.[id]?.c;
  return { card: null, clubId: null, status: 'gone', label: lastClub ? `Last seen at ${state.world.clubs[lastClub]?.name || lastClub}` : 'No longer at a club', name: nameFromBooks || fallbackName || '?', pos: state.careerNames?.[id]?.[1] || state.stats?.all?.players?.[id]?.p };
}

const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'history', label: 'History' }, { id: 'stats', label: 'Stats' }];
const avg = (v) => (v ? v.toFixed(2) : '—');
const years = (a, b) => (a === b ? `${yearLabel(a)}` : `${yearLabel(a)}–${yearLabel(b)}`);

// A player's full page: Overview, History (clubs, moves, season by season) and Stats.
export default function Player({ state, playerId, fallbackName, tab: tabProp, onTab, onBack }) {
  const [tabLocal, setTabLocal] = useState('overview');
  const tab = tabProp || tabLocal;
  const setTab = onTab || setTabLocal;
  const who = useMemo(() => resolvePlayer(state, playerId, fallbackName), [state, playerId, fallbackName]);
  const seasons = useMemo(() => playerSeasons(state, playerId, trophyNames), [state, playerId]);
  const moves = useMemo(() => playerMoves(state, playerId), [state, playerId]);
  const club = who.clubId ? state.world.clubs[who.clubId] : null;
  const name = who.card?.name || who.name || fallbackName || '?';
  const pos = who.card?.pos || who.pos;
  const nation = cardNation(who.card);
  const theme = club || NEUTRAL;

  return (
    <div className="screen team-page profile">
      <div className="club-head" style={clubVars(theme)}>
        {club ? <Crest colors={club.colors} short={club.short} size={56} id={club.id} /> : <span className="profile__pos-badge">{pos || '—'}</span>}
        <div>
          <b>{name}</b>
          <span>{[pos, nation?.name, club ? club.name : who.label].filter(Boolean).join(' · ')}</span>
        </div>
        <i className="club-stripes" aria-hidden="true" />
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>
      <Segmented small label="Player" value={tab} options={TABS} onChange={setTab} />
      {tab === 'overview' && <Overview state={state} who={who} club={club} seasons={seasons} />}
      {tab === 'history' && <History state={state} seasons={seasons} moves={moves} />}
      {tab === 'stats' && <Stats state={state} id={playerId} seasons={seasons} />}
    </div>
  );
}

function Overview({ state, who, club, seasons }) {
  const card = who.card;
  const t = careerTotals(seasons);
  const awards = seasons.flatMap((s) => s.awards.map((a) => ({ ...a, year: s.year }))).reverse();
  const trophies = seasons.flatMap((s) => s.trophies.map((x) => ({ ...x, year: s.year, clubId: s.clubId }))).reverse();
  const trait = card?.trait ? TRAITS[card.trait] : null;
  const skill = card ? skillOf(card) : null;
  const left = card?.matchesLeft;
  return (
    <>
      <div className="profile__grid">
        {card && (
          <div className="profile__card">
            <PlayerCard card={card} colors={(club || NEUTRAL).colors} stats={who.status === 'yours' ? state.playerStats[card.id] : null} />
          </div>
        )}
        <div className="profile__facts">
          <ul className="champions">
            <li><span>Status</span><b>{club ? <ClubLink id={club.id}>{club.name}</ClubLink> : who.label}</b></li>
            {club && <li><span>League</span><b><LeagueLink divId={club.divisionId}>{DIVISION_BY_ID[club.divisionId].name}</LeagueLink></b></li>}
            {card && <li><span>Nation</span><b><Flag card={card} withName /></b></li>}
            {card && <li><span>Rarity</span><b className={`r-${card.rarity} profile__rarity`}>{RARITIES[card.rarity]?.label}{card.stars ? ` ${'★'.repeat(card.stars)}` : ''}</b></li>}
            {card && <li><span>Matches left</span><b>{left == null ? 'No retirement' : who.status === 'retired' ? '—' : left}</b></li>}
            {card && !card.generic && <li><span>Popularity</span><b>{cardPopularity(card)} ★{card.fame ? ` · fame ${card.fame}` : ''}</b></li>}
            {trait && <li><span>Trait</span><b>{trait.name}</b></li>}
            {skill && <li><span>Skill</span><b>{skill.icon} {skill.name}</b></li>}
          </ul>
          <div className="stat-tiles">
            <div><span>Seasons</span><b>{t.seasons}</b><small>{t.clubs.length} club{t.clubs.length === 1 ? '' : 's'}</small></div>
            <div><span>Games</span><b>{t.apps}</b><small>{t.goals} goals</small></div>
            <div><span>Avg rating</span><b>{avg(t.avg)}</b><small>{t.motm} MOTM{t.cs ? ` · ${t.cs} CS` : ''}</small></div>
          </div>
        </div>
      </div>
      <section>
        <h2 className="section-title">Awards</h2>
        {awards.length ? (
          <div className="chip-row">{awards.map((a, i) => <span key={i} className="chip profile__award">{a.icon} {a.label} · {yearLabel(a.year)}</span>)}</div>
        ) : <p className="hint">No individual awards yet. Best Player, Top Scorer, Best Goalkeeper, Best Young Player and every league's Golden Boot, MVP and Golden Glove count.</p>}
      </section>
      {trophies.length > 0 && (
        <section>
          <h2 className="section-title">Team trophies</h2>
          <ul className="champions">
            {trophies.map((x, i) => <li key={i}><span>{yearLabel(x.year)} · {state.world.clubs[x.clubId]?.short}</span><b>{TROPHY_ICON[x.kind]} {x.label}</b></li>)}
          </ul>
        </section>
      )}
      {!card && <p className="hint">This player has no card any more: his numbers live on in the history book.</p>}
    </>
  );
}

function ClubChip({ state, id }) {
  const c = id && state.world.clubs[id];
  if (!c) return <span className="muted">Free agent</span>;
  return <ClubLink id={id} className="club-inline"><Crest colors={c.colors} short={c.short} size={16} id={id} /> <span>{c.name}</span></ClubLink>;
}

function History({ state, seasons, moves }) {
  const spells = clubSpells(seasons, moves);
  const atClub = (clubId, from, to) => seasons.filter((s) => s.clubId === clubId && s.year >= from && s.year <= to)
    .reduce((t, s) => ({ apps: t.apps + s.apps, goals: t.goals + s.goals }), { apps: 0, goals: 0 });
  if (!seasons.length && !moves.length) return <p className="hint">Nothing on record yet. Every season this player plays is added here when the season ends (and live during the season).</p>;
  return (
    <>
      <section>
        <h2 className="section-title">Clubs</h2>
        <ol className="timeline">
          {spells.map((s, i) => {
            const t = atClub(s.clubId, s.from, s.to);
            const c = state.world.clubs[s.clubId];
            return (
              <li key={`${s.clubId}-${s.from}`} style={c ? { '--rc': c.colors[0] } : undefined} className={i === spells.length - 1 ? 'is-now' : ''}>
                <span className="timeline__years">{years(s.from, s.to)}</span>
                <ClubChip state={state} id={s.clubId} />
                <small>{t.apps} games · {t.goals} goals</small>
              </li>
            );
          })}
        </ol>
      </section>
      {moves.length > 0 && (
        <section>
          <h2 className="section-title">Moves</h2>
          <ul className="champions">
            {[...moves].reverse().map((m, i) => (
              <li key={i}>
                <span>{yearLabel(m.year)} · {MOVE_LABEL[m.type] || m.type}</span>
                <b className="profile__move">{m.from ? state.world.clubs[m.from]?.short : (m.type === 'a' ? 'Academy' : 'Free')} → {m.to ? <ClubLink id={m.to}>{state.world.clubs[m.to]?.short}</ClubLink> : (m.type === 'x' ? 'Retired' : 'Free agent')}</b>
              </li>
            ))}
          </ul>
        </section>
      )}
      {seasons.length > 0 && (
        <section>
          <h2 className="section-title">Season by season</h2>
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>Season</th><th className="table__club">Club</th><th className="table__club">League</th><th title="League finish">Pos</th><th>Apps</th><th>G</th><th>MOTM</th><th>CS</th><th>Avg</th><th className="table__club">Awards & trophies</th></tr></thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.year} className={s.live ? 'is-user' : s.trophies.length ? 'is-top' : ''}>
                    <td>{yearLabel(s.year)}</td>
                    <td className="table__club"><ClubChip state={state} id={s.clubId} /></td>
                    <td className="table__club">{s.divId ? <LeagueLink divId={s.divId}>{DIVISION_BY_ID[s.divId]?.name}</LeagueLink> : '—'}{s.level ? <small className="muted"> · L{s.level}</small> : ''}</td>
                    <td><b>{s.live ? 'Now' : s.pos || '—'}</b></td>
                    <td>{s.apps}</td><td>{s.goals}</td><td>{s.motm}</td><td>{s.cs}</td><td>{avg(s.avg)}</td>
                    <td className="table__club">{[...s.awards.map((a) => a.icon), ...s.trophies.map((x) => TROPHY_ICON[x.kind])].join(' ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Pos is the club's league finish. 🏅 Best Player · ⚽ Top Scorer · 🧤 Best GK · 🌱 Best Young · 👟 Golden Boot · ⭐ MVP · 🥅 Golden Glove · 🏆 league · 🥇 cup · 🛡️ super cup · 🌍 continental cup · 🌎 continental trophy · 🏵️ continental super cup · 🌐 Club World Cup.</p>
        </section>
      )}
    </>
  );
}

// Stats-book rows by competition, plus a total.
export function compRows(row) {
  if (!row) return [];
  return Object.entries(row.s).sort(([a], [b]) => compOrder(a) - compOrder(b) || a.localeCompare(b))
    .map(([comp, t]) => ({ comp, apps: t[0], goals: t[1], motm: t[2], cs: t[3], avg: t[0] ? t[4] / t[0] : 0 }));
}

function Stats({ state, id, seasons }) {
  const stats = state.stats || { season: emptyBook(), all: emptyBook() };
  const has = (b) => !!b?.players?.[id];
  const [period, setPeriod] = useState(has(stats.season) ? 'season' : has(stats.lastSeason) ? 'last' : 'all');
  const book = period === 'season' ? stats.season : period === 'last' ? stats.lastSeason : stats.all;
  const rows = compRows(book?.players?.[id]);
  const total = rows.reduce((t, r) => ({ apps: t.apps + r.apps, goals: t.goals + r.goals, motm: t.motm + r.motm, cs: t.cs + r.cs, rsum: t.rsum + r.avg * r.apps }), { apps: 0, goals: 0, motm: 0, cs: 0, rsum: 0 });
  const t = careerTotals(seasons);
  const mine = state.playerStats?.[id];
  return (
    <>
      <Segmented small label="Period" value={period} options={[{ id: 'season', label: yearLabel(stats.year || state.season.year) }, { id: 'last', label: 'Last season', disabled: !stats.lastSeason }, { id: 'all', label: 'All-time' }]} onChange={setPeriod} />
      {rows.length ? (
        <div className="scroll-x">
          <table className="table table--history table--fit">
            <thead><tr><th className="table__club">Competition</th><th>Apps</th><th>Goals</th><th>MOTM</th><th>CS</th><th>Avg</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.comp}>
                  <td className="table__club">{r.comp.startsWith('L:') ? <LeagueLink divId={r.comp.slice(2)}>{compName(r.comp)}</LeagueLink> : compName(r.comp)}</td>
                  <td>{r.apps}</td><td>{r.goals}</td><td>{r.motm}</td><td>{r.cs}</td><td>{avg(r.avg)}</td>
                </tr>
              ))}
              {rows.length > 1 && <tr className="is-top"><td className="table__club"><b>Total</b></td><td><b>{total.apps}</b></td><td><b>{total.goals}</b></td><td>{total.motm}</td><td>{total.cs}</td><td>{avg(total.apps ? total.rsum / total.apps : 0)}</td></tr>}
            </tbody>
          </table>
        </div>
      ) : <p className="hint">No games for this period.</p>}
      <section>
        <h2 className="section-title">Career totals</h2>
        <div className="stat-tiles">
          <div><span>Games</span><b>{t.apps}</b><small>{t.seasons} season{t.seasons === 1 ? '' : 's'}</small></div>
          <div><span>Goals</span><b>{t.goals}</b><small>{t.apps ? (t.goals / t.apps).toFixed(2) : '0'} per game</small></div>
          <div><span>Avg rating</span><b>{avg(t.avg)}</b><small>{t.motm} MOTM · {t.cs} CS</small></div>
          <div><span>Awards</span><b>{t.awards}</b><small>individual</small></div>
          <div><span>Trophies</span><b>{t.trophies}</b><small>with his clubs</small></div>
          <div><span>Clubs</span><b>{t.clubs.length}</b><small>{t.clubs.map((c) => state.world.clubs[c]?.short).filter(Boolean).join(', ')}</small></div>
        </div>
      </section>
      {mine && (
        <section>
          <h2 className="section-title">With you</h2>
          <ul className="champions">
            <li><span>Games · goals · assists</span><b>{mine.apps} · {mine.goals} · {mine.assists}</b></li>
            <li><span>Man of the match · clean sheets</span><b>{mine.motm} · {mine.cs || 0}</b></li>
            <li><span>Average rating</span><b>{avg(mine.apps ? mine.ratingSum / mine.apps : 0)}</b></li>
          </ul>
        </section>
      )}
      <p className="hint">Every game in the world counts. Your matches use the real ratings; other clubs' named players are tracked from their results.</p>
    </>
  );
}
