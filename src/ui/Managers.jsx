import React, { useMemo, useState } from 'react';
import Sheet from './Sheet.jsx';
import { Crest } from './Art.jsx';
import { Segmented } from './Home.jsx';
import { listManagers } from '../state/storage.js';
import { MANAGER_SORTS, rankManagers, managerScore, winPct, played } from '../state/managers.js';
import { GmCard, GmTraitTag, GmFlag } from './GmCard.jsx';
import { yearLabel } from '../engine/years.js';

const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || 'th'}`;
const wdl = (r) => `${r.w}-${r.d}-${r.l}`;
const pct = (r) => (played(r) ? `${winPct(r).toFixed(1)}%` : '—');
const years = (from, to) => (to == null ? `${yearLabel(from)}–now` : from === to ? `${yearLabel(from)}` : `${yearLabel(from)}–${yearLabel(to)}`);
const status = (m) => (m.status === 'active' ? `Slot ${m.slot}` : 'Retired');

// Main menu: every manager you have ever created, ranked, with a career page for each.
export default function ManagersSheet({ onClose }) {
  const all = useMemo(listManagers, []);
  const [sort, setSort] = useState('score');
  const [openId, setOpenId] = useState(null);
  const ranked = rankManagers(all, sort);
  const open = all.find((m) => m.id === openId);

  if (open) {
    return (
      <Sheet title="Manager" onClose={onClose}>
        <ManagerDetail m={open} rank={rankManagers(all, 'score').indexOf(open) + 1} total={all.length} onBack={() => setOpenId(null)} />
      </Sheet>
    );
  }
  return (
    <Sheet title="Managers" onClose={onClose}>
      {all.length === 0 ? (
        <p className="hint">Every career you start is recorded here, even after you delete its slot. Start a career to get on the board.</p>
      ) : (
        <div className="managers">
          <p className="hint">All your careers, past and present. Tap a manager for their career.</p>
          <Segmented
            small
            label="Sort"
            value={sort}
            options={MANAGER_SORTS.map((s) => ({ id: s.id, label: s.label }))}
            onChange={setSort}
          />
          <div className="scroll-x">
            <table className="table table--history table--managers">
              <thead>
                <tr>
                  <th>#</th><th className="table__club">Manager</th><th title="Score">Pts</th><th title="Trophies">🏆</th>
                  <th>Win %</th><th>W-D-L</th><th title="Best reputation">Rep</th><th>Seasons</th><th className="table__club">Status</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((m, i) => (
                  <tr key={m.id} className={`is-tap${m.status === 'active' ? ' is-user' : ''}`} onClick={() => setOpenId(m.id)}>
                    <td>{i + 1}</td>
                    <td className="table__club">
                      <button type="button" className="mgr-link" onClick={(e) => { e.stopPropagation(); setOpenId(m.id); }}>
                        <Crest colors={m.club.colors} short={m.club.short} size={18} />
                        <span><GmFlag nation={m.nation} /><b>{m.gmName}</b> <em>{m.club.short}</em><br /><GmTraitTag trait={m.gmTrait} /></span>
                      </button>
                    </td>
                    <td><b>{managerScore(m)}</b></td>
                    <td>{m.trophyCount}</td>
                    <td>{pct(m.record)}</td>
                    <td>{wdl(m.record)}</td>
                    <td>{m.bestReputation}</td>
                    <td>{m.seasonsPlayed}</td>
                    <td className="table__club">{status(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">Score = 10 per league title + 8 per cup + 0.4 × win % (full weight from 30 matches) + 0.5 × best reputation + 1.5 per season − 4 per sacking. League matches only.</p>
        </div>
      )}
    </Sheet>
  );
}

function ManagerDetail({ m, rank, total, onBack }) {
  const finished = m.seasons.filter((s) => !s.live);
  return (
    <div className="managers">
      <div className="club-head">
        <Crest colors={m.club.colors} short={m.club.short} size={48} />
        <div>
          <b><GmFlag nation={m.nation} />{m.gmName}</b>
          <span>{m.status === 'active' ? `${m.club.name} · ${yearLabel(m.season)} · slot ${m.slot}` : `Retired · last at ${m.club.name}`}</span>
        </div>
        <button type="button" className="btn btn--small btn--ghost" onClick={onBack}>Back</button>
      </div>

      <div className="stat-tiles">
        <div><span>Rank</span><b>#{rank}</b><small>of {total} · {managerScore(m)} pts</small></div>
        <div><span>Trophies</span><b>{m.trophyCount}</b><small>{m.leagueTitles} league · {m.cups} cups</small></div>
        <div><span>Win %</span><b>{pct(m.record)}</b><small>{wdl(m.record)} · {m.record.gf}-{m.record.ga}</small></div>
        <div><span>Reputation</span><b>{m.reputation}</b><small>best {m.bestReputation}</small></div>
        <div><span>Seasons</span><b>{m.seasonsPlayed}</b><small>{m.clubs.length} club{m.clubs.length === 1 ? '' : 's'}</small></div>
        <div><span>Best finish</span><b>{m.best ? ordinal(m.best.pos) : '—'}</b><small>{m.best ? `${m.best.div} · ${yearLabel(m.best.year)}` : 'no season finished'}</small></div>
      </div>
      <div className="gm-panel"><GmCard trait={m.gmTrait || null} small /></div>
      {m.sackedSeasons.length > 0 && <p className="hint hint--warn">Sacked {m.sackedSeasons.length}× (season {m.sackedSeasons.join(', ')}).</p>}

      <section>
        <h2 className="section-title">Clubs managed</h2>
        <div className="scroll-x">
          <table className="table table--history">
            <thead><tr><th>Years</th><th className="table__club">Club</th><th>Seasons</th><th>W-D-L</th><th>Win %</th><th title="Trophies">🏆</th><th className="table__club">Best</th></tr></thead>
            <tbody>
              {m.clubs.map((c, i) => (
                <tr key={`${c.clubId}-${c.from}`} className={i === m.clubs.length - 1 && m.status === 'active' ? 'is-user' : ''}>
                  <td>{years(c.from, c.to)}</td>
                  <td className="table__club"><span className="club-inline">{c.colors && <Crest colors={c.colors} short={c.short} size={16} />} <span>{c.name}</span></span></td>
                  <td>{c.seasons}</td>
                  <td>{wdl(c.record)}</td>
                  <td>{pct(c.record)}</td>
                  <td>{c.trophies}</td>
                  <td className="table__club">{c.best ? `${ordinal(c.best.pos)} · ${c.best.div}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="section-title">Trophies</h2>
        {m.trophies.length ? (
          <ul className="champions">
            {m.trophies.map((t, i) => <li key={`${t.season}-${t.competition}-${i}`}><span>{yearLabel(t.season)} · {t.club}</span><b>{t.league ? '🏆' : '🥇'} {t.competition}</b></li>)}
          </ul>
        ) : <p className="hint">No trophies yet.</p>}
      </section>

      {m.seasons.length > 0 && (
        <section>
          <h2 className="section-title">Season by season</h2>
          <div className="scroll-x">
            <table className="table table--history">
              <thead><tr><th>Season</th><th className="table__club">Club</th><th className="table__club">League</th><th>Pos</th><th>W-D-L</th><th>GF-GA</th><th /></tr></thead>
              <tbody>
                {m.seasons.map((s) => (
                  <tr key={s.year} className={s.pos === 1 ? 'is-top' : ''}>
                    <td>{yearLabel(s.year)}</td>
                    <td className="table__club">{s.club}</td>
                    <td className="table__club">{s.div}</td>
                    <td><b>{s.live ? 'Now' : s.pos}</b></td>
                    <td>{wdl(s.rec)}</td>
                    <td>{s.rec.gf}-{s.rec.ga}</td>
                    <td>{s.trophies.length ? `${'🏆'.repeat(s.pos === 1 ? 1 : 0)}${'🥇'.repeat(s.trophies.length - (s.pos === 1 ? 1 : 0))}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {finished.length === 0 && <p className="hint">The first season is still under way.</p>}
        </section>
      )}
    </div>
  );
}
