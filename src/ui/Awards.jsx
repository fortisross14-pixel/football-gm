import React, { useMemo } from 'react';
import { Crest } from './Art.jsx';
import { ClubLink, PlayerLink } from './nav.jsx';
import { yearLabel } from '../engine/years.js';

const AWARDS = [
  { key: 'best', icon: '🏅', label: 'Best Player' },
  { key: 'scorer', icon: '⚽', label: 'Top Scorer' },
  { key: 'gk', icon: '🧤', label: 'Best Goalkeeper' },
  { key: 'young', icon: '🌱', label: 'Best Young Player' },
];

// The yearly awards: winners by season, and who has won the most.
export default function Awards({ state }) {
  const list = state.awards || [];
  const tally = useMemo(() => {
    const t = {};
    for (const y of list) for (const a of AWARDS) {
      const w = y[a.key];
      if (!w) continue;
      const row = t[w.id] || (t[w.id] = { id: w.id, name: w.name, clubId: w.clubId, n: 0, what: [] });
      row.n += 1;
      row.what.push(`${a.label} ${yearLabel(y.year)}`);
    }
    return Object.values(t).sort((a, b) => b.n - a.n).slice(0, 10);
  }, [list]);
  if (!list.length) return <p className="hint">Four awards every season: Best Player, Top Scorer (top-flight league goals), Best Goalkeeper and Best Young Player (cards with more than 100 matches left). Best Player, Goalkeeper and Young Player weigh performance and the titles won. The first winners are named when this season ends.</p>;
  const club = (id) => state.world.clubs[id];
  return (
    <div className="awards">
      {[...list].reverse().map((y) => (
        <article key={y.year} className="awards__year">
          <header><b>{yearLabel(y.year)}</b></header>
          <div className="awards__grid">
            {AWARDS.map((a) => {
              const w = y[a.key];
              return (
                <div key={a.key} className={`award${w && club(w.clubId) && w.clubId === state.club.id ? ' is-user' : ''}`}>
                  <span className="award__label">{a.icon} {a.label}</span>
                  {w ? (
                    <>
                      <b className="award__name"><PlayerLink id={w.id} name={w.name} /></b>
                      <span className="award__club">
                        {club(w.clubId) && <ClubLink id={w.clubId} className="club-inline"><Crest colors={club(w.clubId).colors} short={club(w.clubId).short} id={w.clubId} size={16} /> <span>{club(w.clubId).name}</span></ClubLink>}
                      </span>
                      <small>{a.key === 'scorer' ? `${w.goals} league goals` : `${w.apps} games · avg ${w.rating}${w.goals ? ` · ${w.goals} goals` : ''}${w.titles?.length ? ` · ${w.titles.join(', ')}` : ''}`}</small>
                    </>
                  ) : <span className="muted">Not awarded</span>}
                </div>
              );
            })}
          </div>
        </article>
      ))}
      {tally.length > 0 && (
        <section>
          <h3 className="sub-title">Most awards</h3>
          <ol className="scorer-list">
            {tally.map((t, i) => (
              <li key={t.name + i}>
                <span className="scorer-list__pos">{i + 1}</span>
                <span className="scorer-list__name"><PlayerLink id={t.id} name={t.name} /><em> · {club(t.clubId)?.short} · {t.what.join(', ')}</em></span>
                <b>{t.n}</b>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
