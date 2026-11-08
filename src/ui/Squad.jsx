import React, { useState } from 'react';
import { FORMATIONS, slotFit, teamOverall, autoArrange } from '../engine/cards.js';
import { MiniCard, PlayerCard, CoachCard } from './Card.jsx';
import Sheet from './Sheet.jsx';
import { TACTICS, DEFAULT_TACTICS } from '../engine/match.js';
import { COACH_PASSIVES } from '../data/coachPassives.js';

export default function Squad({ state, setState }) {
  const [selected, setSelected] = useState(null); // { zone: 'slot' | 'bench', index }
  const [viewing, setViewing] = useState(null);
  const formation = state.coaches.coach.formation;
  const slots = FORMATIONS[formation];
  const byId = (id) => state.squad.find((c) => c.id === id);
  const starters = state.lineup.map(byId);
  const colors = state.club.colors;

  const idAt = (sel) => (sel.zone === 'slot' ? state.lineup[sel.index] : state.bench[sel.index]);

  const tap = (zone, index) => {
    const target = { zone, index };
    if (!selected) return setSelected(target);
    if (selected.zone === zone && selected.index === index) return setSelected(null);
    setState((s) => {
      const lineup = [...s.lineup];
      const bench = [...s.bench];
      const get = (sel) => (sel.zone === 'slot' ? lineup[sel.index] : bench[sel.index]);
      const set = (sel, id) => { if (sel.zone === 'slot') lineup[sel.index] = id; else bench[sel.index] = id; };
      const a = get(selected);
      const b = get(target);
      set(selected, b);
      set(target, a);
      return { ...s, lineup, bench };
    });
    setSelected(null);
  };

  const swapCoaches = () => {
    setState((s) => {
      const coaches = { coach: { ...s.coaches.assistant, role: 'coach' }, assistant: { ...s.coaches.coach, role: 'assistant' } };
      const cards = s.lineup.map((id) => s.squad.find((c) => c.id === id));
      return { ...s, coaches, lineup: autoArrange(cards, coaches.coach.formation) };
    });
    setSelected(null);
  };

  const selectedCard = selected ? byId(idAt(selected)) : null;

  return (
    <div className="screen screen--squad">
      <div className="squad__pitch">
      <div className="squad-head">
        <div>
          <h2 className="section-title">Starting 7</h2>
          <p className="hint">{selected ? 'Tap another card to swap them.' : 'Tap a card, then another to swap.'}</p>
        </div>
        <div className="squad-head__ovr"><b>{teamOverall(starters)}</b><span>{formation}</span></div>
      </div>

      <div className="pitch pitch--squad">
        <PitchLines />
        {slots.map((slot, i) => {
          const card = starters[i];
          const fit = slotFit(card.pos, slot.pos);
          return (
            <div key={i} className="pitch__slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              <MiniCard
                card={card}
                selected={selected?.zone === 'slot' && selected.index === i}
                warn={fit < 1 ? `${slot.pos} −${Math.round((1 - fit) * 100)}%` : null}
                onClick={() => tap('slot', i)}
              />
            </div>
          );
        })}
      </div>

      <h3 className="sub-title">Bench</h3>
      <div className="bench">
        {state.bench.map((id, i) => (
          <MiniCard key={id} card={byId(id)} selected={selected?.zone === 'bench' && selected.index === i} onClick={() => tap('bench', i)} />
        ))}
      </div>

      {selectedCard && (
        <div className="selection-bar">
          <span><b>{selectedCard.name}</b> selected</span>
          <button type="button" className="btn btn--small" onClick={() => setViewing(selectedCard)}>View card</button>
        </div>
      )}

      </div>

      <div className="squad__side">
      <Tactics state={state} setState={setState} starters={starters} />

      <h3 className="sub-title">Coaching staff</h3>
      <div className="coaches">
        <CoachCard coach={state.coaches.coach} role="coach" />
        <CoachCard coach={state.coaches.assistant} role="assistant" />
      </div>
      <button type="button" className="btn btn--ghost btn--block" onClick={swapCoaches}>
        Swap head coach and assistant
      </button>
      <p className="hint">The head coach sets the formation. The assistant adds their passive at half strength.</p>
      </div>

      {viewing && (
        <Sheet title="Player card" onClose={() => setViewing(null)}>
          <div className="sheet-card">
            <PlayerCard card={viewing} colors={colors} stats={state.playerStats[viewing.id] || { apps: 0, goals: 0, assists: 0, motm: 0 }} />
          </div>
        </Sheet>
      )}
    </div>
  );
}

// Team instructions. Small, readable trade-offs that interact with cards and coaches.
function Tactics({ state, setState, starters }) {
  const t = { ...DEFAULT_TACTICS, ...(state.tactics || {}) };
  const set = (key, value) => setState((s) => ({ ...s, tactics: { ...DEFAULT_TACTICS, ...(s.tactics || {}), [key]: value } }));
  const avg = (pos) => {
    const list = starters.filter((c) => c?.pos === pos);
    return list.length ? Math.round(list.reduce((a, c) => a + c.phy, 0) / list.length) : null;
  };
  const notes = [];
  const fit = [state.coaches.coach?.passive, state.coaches.assistant?.passive].includes('fitnessGuru');
  if (t.press === 'high') notes.push(fit ? `✓ ${COACH_PASSIVES.fitnessGuru.name} on the staff keeps the press going.` : '⚠ High press drains stamina: bring Second Wind, a fitness coach or a Fresh Legs skill.');
  if (t.passing === 'direct') notes.push(avg('FWD') >= 78 ? `✓ Your forwards are strong (PHY ${avg('FWD')}): long balls stick.` : `⚠ Forwards PHY ${avg('FWD') ?? '—'}: direct play needs 78+.`);
  if (t.line === 'high') notes.push(avg('DEF') < 70 ? `⚠ Defenders PHY ${avg('DEF')}: slow for a high line.` : `✓ Defenders PHY ${avg('DEF')}: quick enough for a high line.`);
  return (
    <section className="tactics">
      <h3 className="sub-title">Tactics</h3>
      {Object.entries(TACTICS).map(([key, def]) => (
        <div key={key} className="tactics__row">
          <span className="tactics__label">{def.label}</span>
          <div className="segmented__opts">
            {Object.entries(def.options).map(([id, o]) => (
              <button key={id} type="button" className={t[key] === id ? 'is-on' : ''} onClick={() => set(key, id)}>{o.name}</button>
            ))}
          </div>
          <p className="hint">{def.options[t[key]].text}</p>
        </div>
      ))}
      {notes.map((n) => <p key={n} className={`hint ${n.startsWith('✓') ? 'hint--accent' : 'hint--warn'}`}>{n}</p>)}
      <p className="hint">Counters: high press beats short passing, direct play beats the press and a high line, short passing picks apart a deep block. Check the rival's style before kick-off.</p>
    </section>
  );
}

export function PitchLines() {
  return (
    <svg className="pitch__lines" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
      <rect x="3" y="3" width="94" height="134" rx="1.5" />
      <line x1="3" y1="70" x2="97" y2="70" />
      <circle cx="50" cy="70" r="11" />
      <rect x="27" y="3" width="46" height="18" />
      <rect x="27" y="119" width="46" height="18" />
      <rect x="40" y="3" width="20" height="7" />
      <rect x="40" y="130" width="20" height="7" />
    </svg>
  );
}
