import React from 'react';
import { playerBoard, emptyBook } from '../engine/statsbook.js';
import { Crest } from './Art.jsx';
import { ClubLink } from './nav.jsx';

const BOARDS = [
  { key: 'goals', title: 'Top scorers', val: (p) => p.goals },
  { key: 'rating', title: 'Best rated', val: (p) => p.rating.toFixed(2) },
  { key: 'motm', title: 'Most MVPs', val: (p) => p.motm },
  { key: 'cs', title: 'Clean sheets', val: (p) => p.cs },
];

// Four quick leaderboards for one competition this season (full tables in World → Stats).
export default function CompStats({ state, comp }) {
  const book = state.stats?.season || emptyBook();
  const filter = (c) => c === comp;
  const lists = BOARDS.map((b) => ({ ...b, rows: playerBoard(book, { filter, key: b.key, minApps: 3, limit: 5 }) }));
  if (lists.every((l) => !l.rows.length)) return <p className="hint">No games played in this competition yet this season. Full tables for any competition and season are in World → Stats.</p>;
  return (
    <div className="comp-stats">
      {lists.map((l) => (
        <section key={l.key} className="comp-stats__board">
          <h3 className="sub-title">{l.title}</h3>
          {l.rows.length ? (
            <ol className="scorer-list">
              {l.rows.map((p, i) => {
                const club = state.world.clubs[p.clubId];
                return (
                  <li key={p.id} className={p.clubId === state.club.id ? 'is-user' : ''}>
                    <span className="scorer-list__pos">{i + 1}</span>
                    {club && <Crest colors={club.colors} short={club.short} id={p.clubId} size={20} />}
                    <span className="scorer-list__name">{p.name}<em> · {club ? <ClubLink id={p.clubId}>{club.short}</ClubLink> : ''} · {p.apps} apps</em></span>
                    <b>{l.val(p)}</b>
                  </li>
                );
              })}
            </ol>
          ) : <p className="hint">Nobody yet.</p>}
        </section>
      ))}
      <p className="hint">This season only. Other seasons, all-time and coaches: World → Stats.</p>
    </div>
  );
}
