import React, { useMemo, useState } from 'react';
import { emptyBook } from '../engine/statsbook.js';
import { managerSeasons } from '../engine/careers.js';
import { DIVISION_BY_ID } from '../data/world/structure.js';
import { Crest } from './Art.jsx';
import { clubVars } from './clubTheme.js';
import { ClubLink, LeagueLink } from './nav.jsx';
import { Segmented } from './Home.jsx';
import { compName, compOrder, TROPHY_ICON } from './names.js';

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const pct = (w, p) => (p ? `${Math.round((w / p) * 100)}%` : '—');
const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'history', label: 'History' }, { id: 'stats', label: 'Stats' }];

// Who a stats-book key is: you, a current AI manager or a former one.
export function resolveManager(state, key) {
  if (key === 'you') {
    const log = state.careerLog || [];
    return {
      name: state.gmName || 'You', clubId: state.club.id, isUser: true, current: true, rep: state.gm?.reputation ?? 0,
      titles: log.filter((s) => s.position === 1).length, cups: log.reduce((n, s) => n + s.trophies.length, 0) - log.filter((s) => s.position === 1).length,
      seasons: log.length, best: log.length ? Math.min(...log.map((s) => s.position)) : null, history: log.map((s) => ({ year: s.year, clubId: s.clubId, divId: s.divId, pos: s.position })),
    };
  }
  const [clubId, ...rest] = key.split('|');
  const name = rest.join('|');
  const gm = state.world.gms?.[clubId];
  if (gm && gm.name === name) return { ...gm, cups: (gm.cups || 0) + (gm.intl || 0), clubId, current: true };
  const former = (state.world.formerGms || []).find((g) => g.clubId === clubId && g.name === name);
  if (former) return { ...former, cups: (former.cups || 0) + (former.intl || 0), clubId, current: false };
  return { name, clubId, current: false, rep: null, titles: 0, cups: 0, seasons: 0, best: null, history: [] };
}

// A manager's page: Overview, History by season, Stats by competition.
export default function Manager({ state, mkey, tab: tabProp, onTab, onBack }) {
  const [tabLocal, setTabLocal] = useState('overview');
  const tab = tabProp || tabLocal;
  const setTab = onTab || setTabLocal;
  const m = useMemo(() => resolveManager(state, mkey), [state, mkey]);
  const seasons = useMemo(() => {
    const rows = managerSeasons(state, mkey);
    // Older saves: seasons from the manager's own record, without the W-D-L.
    for (const h of m.history || []) if (!rows.some((r) => r.year === h.year)) rows.push({ year: h.year, clubId: h.clubId, divId: h.divId, pos: h.pos, p: null, trophies: [] });
    for (const r of rows) if (!r.pos) r.pos = (m.history || []).find((h) => h.year === r.year)?.pos || null;
    return rows.sort((a, b) => b.year - a.year);
  }, [state, mkey, m]);
  const club = state.world.clubs[m.clubId];
  const tot = seasons.reduce((t, s) => ({ p: t.p + (s.p || 0), w: t.w + (s.w || 0), d: t.d + (s.d || 0), l: t.l + (s.l || 0), tr: t.tr + s.trophies.length }), { p: 0, w: 0, d: 0, l: 0, tr: 0 });
  return (
    <div className="screen team-page profile">
      <div className="club-head" style={clubVars(club || { colors: ['#1b1f29', '#ffd400'] })}>
        {club && <Crest colors={club.colors} short={club.short} size={56} id={club.id} />}
        <div>
          <b>{m.name}</b>
          <span>Manager · {club ? (m.current ? club.name : `formerly ${club.name}${m.until ? ` (until S${m.until})` : ''}`) : ''}</span>
        </div>
        <i className="club-stripes" aria-hidden="true" />
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>
      <Segmented small label="Manager" value={tab} options={TABS} onChange={setTab} />
      {tab === 'overview' && (
        <>
          <div className="stat-tiles">
            <div><span>Reputation</span><b>{m.rep ?? '—'}</b><small>out of 100</small></div>
            <div><span>League titles</span><b>{m.titles || 0}</b><small>{m.cups || 0} cups</small></div>
            <div><span>Seasons</span><b>{m.seasons || seasons.filter((s) => !s.live).length}</b><small>best {m.best ? ordinal(m.best) : '—'}</small></div>
            <div><span>Win %</span><b>{pct(tot.w, tot.p)}</b><small>{tot.w}-{tot.d}-{tot.l}</small></div>
            <div><span>Trophies</span><b>{tot.tr}</b><small>on record</small></div>
            <div><span>Club</span><b className="profile__tile-club">{club?.short || '—'}</b><small>{m.current ? 'in charge' : 'former club'}</small></div>
          </div>
          {seasons.some((s) => s.trophies.length) && (
            <section>
              <h2 className="section-title">Trophies</h2>
              <ul className="champions">
                {seasons.flatMap((s) => s.trophies.map((x, i) => <li key={`${s.year}-${i}`}><span>S{s.year} · {state.world.clubs[s.clubId]?.short}</span><b>{TROPHY_ICON[x.kind]} {x.label}</b></li>))}
              </ul>
            </section>
          )}
          {club && <p className="hint">{m.current ? 'In charge of ' : 'Last managed '}<ClubLink id={club.id}>{club.name}</ClubLink> · <LeagueLink divId={club.divisionId}>{DIVISION_BY_ID[club.divisionId].name}</LeagueLink>.{m.isUser ? ' This is you.' : ' AI managers gain reputation by beating what their squad should achieve and get sacked when they badly miss it.'}</p>}
        </>
      )}
      {tab === 'history' && (seasons.length ? (
        <div className="scroll-x">
          <table className="table table--history">
            <thead><tr><th>Season</th><th className="table__club">Club</th><th className="table__club">League</th><th>Pos</th><th>P</th><th>W-D-L</th><th>Win %</th><th className="table__club">Trophies</th></tr></thead>
            <tbody>
              {seasons.map((s) => {
                const c = state.world.clubs[s.clubId];
                return (
                  <tr key={s.year} className={s.live ? 'is-user' : s.pos === 1 ? 'is-top' : ''}>
                    <td>{s.year}</td>
                    <td className="table__club">{c ? <ClubLink id={s.clubId} className="club-inline"><Crest colors={c.colors} short={c.short} size={16} id={s.clubId} /> <span>{c.short}</span></ClubLink> : '—'}</td>
                    <td className="table__club">{s.divId ? <LeagueLink divId={s.divId}>{DIVISION_BY_ID[s.divId]?.name}</LeagueLink> : '—'}</td>
                    <td><b>{s.live ? 'Now' : s.pos || '—'}</b></td>
                    <td>{s.p ?? '—'}</td>
                    <td>{s.p == null ? '—' : `${s.w}-${s.d}-${s.l}`}</td>
                    <td>{s.p == null ? '—' : pct(s.w, s.p)}</td>
                    <td className="table__club">{s.trophies.length ? s.trophies.map((x) => `${TROPHY_ICON[x.kind]} ${x.label}`).join(', ') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <p className="hint">No seasons on record yet.</p>)}
      {tab === 'stats' && <Stats state={state} mkey={mkey} />}
    </div>
  );
}

function Stats({ state, mkey }) {
  const stats = state.stats || { season: emptyBook(), all: emptyBook() };
  const has = (b) => !!b?.coaches?.[mkey];
  const [period, setPeriod] = useState(has(stats.season) ? 'season' : has(stats.lastSeason) ? 'last' : 'all');
  const book = period === 'season' ? stats.season : period === 'last' ? stats.lastSeason : stats.all;
  const row = book?.coaches?.[mkey];
  const rows = row ? Object.entries(row.s).sort(([a], [b]) => compOrder(a) - compOrder(b)) : [];
  const t = rows.reduce((x, [, r]) => x.map((v, i) => v + r[i]), [0, 0, 0, 0]);
  return (
    <>
      <Segmented small label="Period" value={period} options={[{ id: 'season', label: `Season ${stats.year || state.season.year}` }, { id: 'last', label: 'Last season', disabled: !stats.lastSeason }, { id: 'all', label: 'All-time' }]} onChange={setPeriod} />
      {rows.length ? (
        <div className="scroll-x">
          <table className="table table--history table--fit">
            <thead><tr><th className="table__club">Competition</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Win %</th></tr></thead>
            <tbody>
              {rows.map(([comp, r]) => <tr key={comp}><td className="table__club">{compName(comp)}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{pct(r[1], r[0])}</td></tr>)}
              {rows.length > 1 && <tr className="is-top"><td className="table__club"><b>Total</b></td><td><b>{t[0]}</b></td><td>{t[1]}</td><td>{t[2]}</td><td>{t[3]}</td><td>{pct(t[1], t[0])}</td></tr>}
            </tbody>
          </table>
        </div>
      ) : <p className="hint">No games for this period.</p>}
      {row?.t > 0 && <p className="hint">Titles in this period: {row.t}.</p>}
    </>
  );
}
