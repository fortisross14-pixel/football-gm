import React, { useState } from 'react';
import { FORMATIONS } from '../engine/cards.js';
import { teamAttrs, ATTR_KEYS, ATTR_LABEL, ATTR_NAME } from '../engine/attributes.js';
import {
  SLIDERS, CHOICES, SWITCHES, MENTALITIES, DEFAULT_TACTICS, normalizeTactics, styleAdvice, suitability,
} from '../engine/tactics.js';
import {
  PHILOSOPHIES, PHILOSOPHY_IDS, coachStyle, clubIdentity, styleDistance, tacticsDistance, fitLabel, fitBonus, nearestPhilosophy,
} from '../data/philosophies.js';
import { adviceCover, coachDistanceCut } from '../engine/gmTraits.js';

// Squad numbers for the current starting 7.
export function userAttrs(state) {
  const slots = FORMATIONS[state.coaches.coach.formation];
  return teamAttrs(slots.map((s, i) => ({ card: state.squad.find((c) => c.id === state.lineup[i]), pos: s.pos, x: s.x })).filter((e) => e.card));
}

const pct = (v) => `${v > 0 ? '+' : ''}${Math.round(v * 1000) / 10}%`;

export default function Tactics({ state, setState }) {
  const t = normalizeTactics(state.tactics);
  const A = userAttrs(state);
  const coach = state.coaches.coach;
  const cStyle = coachStyle(coach);
  const cut = coachDistanceCut(state.gm?.trait); // Coach Tamer GM card
  const cDist = Math.max(0, styleDistance(t, cStyle) - cut);
  const identity = clubIdentity(state.world.clubs[state.club.id] || state.club);
  const iDist = styleDistance(t, identity);
  const cover = { cover: adviceCover(state.gm?.trait) }; // Tactics Connoisseur GM card
  const advice = styleAdvice(t, A, cover);
  const suit = suitability(t, A, cover);
  const custom = state.customStyles || [];
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  const set = (patch) => setState((s) => ({ ...s, tactics: { ...normalizeTactics(s.tactics), ...patch } }));
  const load = (tactics) => setState((s) => ({ ...s, tactics: { ...DEFAULT_TACTICS, ...tactics } }));
  const save = () => {
    const n = name.trim() || `My style ${custom.length + 1}`;
    setState((s) => ({ ...s, customStyles: [...(s.customStyles || []).filter((c) => c.name !== n), { name: n, t: normalizeTactics(s.tactics) }].slice(-8) }));
    setNaming(false);
    setName('');
  };
  const removeCustom = (n) => setState((s) => ({ ...s, customStyles: (s.customStyles || []).filter((c) => c.name !== n) }));
  const active = PHILOSOPHY_IDS.find((id) => styleDistance(t, id) === 0);
  const activeCustom = custom.find((c) => tacticsDistance(t, c.t) === 0);

  return (
    <div className="tactics2">
      <section className="tactics2__summary">
        <div className="attr-strip" aria-label="Squad numbers (starting 7, outfield)">
          {ATTR_KEYS.map((k) => (
            <div key={k} className={`attr-strip__item${A[k] >= 72 ? ' is-high' : A[k] < 60 ? ' is-low' : ''}`} title={ATTR_NAME[k]}>
              <span>{ATTR_LABEL[k]}</span>
              <b>{Math.round(A[k])}</b>
            </div>
          ))}
          <div className="attr-strip__item" title="Wide attackers vs central attackers (Passing + Shooting)">
            <span>Wide / centre</span>
            <b>{A.wide === null ? '—' : Math.round(A.wide)} / {A.central === null ? '—' : Math.round(A.central)}</b>
          </div>
        </div>
        <div className="fit-tiles">
          <div className={`fit-tile ${cDist <= 2 ? 'is-good' : cDist > 3.5 ? 'is-bad' : ''}`}>
            <span>Coach · {coach.name}</span>
            <b>{PHILOSOPHIES[cStyle].name}</b>
            <small>{fitLabel(cDist)} · team {pct(fitBonus(cDist, coach.rarity))}{cut ? ` · Coach Tamer −${cut}` : ''}</small>
          </div>
          <div className={`fit-tile ${iDist <= 2 ? 'is-good' : iDist > 3.5 ? 'is-bad' : ''}`}>
            <span>Owners want</span>
            <b>{PHILOSOPHIES[identity].name}</b>
            <small>{iDist <= 2 ? 'They like what they see' : iDist > 3.5 ? 'Not our football: confidence drops' : 'Close enough'}</small>
          </div>
          <div className={`fit-tile ${suit >= 70 ? 'is-good' : suit < 40 ? 'is-bad' : ''}`}>
            <span>Squad suits it</span>
            <b>{suit}%</b>
            <small>{advice.filter((a) => a.tone === 'bad').length} warning{advice.filter((a) => a.tone === 'bad').length === 1 ? '' : 's'}{advice.some((a) => a.tone === 'covered') ? ` · ${advice.filter((a) => a.tone === 'covered').length} covered` : ''}</small>
          </div>
        </div>
      </section>

      <section>
        <h3 className="sub-title">Style</h3>
        <div className="chip-row style-chips">
          {PHILOSOPHY_IDS.map((id) => (
            <button key={id} type="button" className={`chip-btn${active === id ? ' is-on' : ''}${id === cStyle ? ' is-coach' : ''}${id === identity ? ' is-club' : ''}`} onClick={() => load(PHILOSOPHIES[id].t)} title={PHILOSOPHIES[id].text}>
              {PHILOSOPHIES[id].name}
            </button>
          ))}
          {custom.map((c) => (
            <span key={c.name} className={`chip-btn chip-btn--custom${activeCustom === c ? ' is-on' : ''}`}>
              <button type="button" className="xlink" onClick={() => load(c.t)}>{c.name}</button>
              <button type="button" className="chip-x" aria-label={`Delete ${c.name}`} onClick={() => removeCustom(c.name)}>×</button>
            </span>
          ))}
        </div>
        <p className="hint">
          {active ? PHILOSOPHIES[active].text : activeCustom ? `Your style: ${activeCustom.name}.` : `Custom settings, closest to ${PHILOSOPHIES[nearestPhilosophy(t)].name}.`}
          {' '}Coach's style is marked ◆, the club's ★. Load one, then adjust anything below.
        </p>
        {naming ? (
          <div className="save-style">
            <input id="style-name" className="input" value={name} maxLength={24} placeholder="Name this style" onChange={(e) => setName(e.target.value)} />
            <button type="button" className="btn btn--small btn--primary" onClick={save}>Save</button>
            <button type="button" className="btn btn--small btn--ghost" onClick={() => setNaming(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn btn--small btn--ghost" onClick={() => setNaming(true)}>Save as my style</button>
        )}
      </section>

      <section className="tactics2__grid">
        <div>
          <h3 className="sub-title">Sliders</h3>
          {Object.entries(SLIDERS).map(([key, def]) => (
            <div key={key} className="slider5">
              <div className="slider5__head"><span>{def.label}</span><small>{def.text}</small></div>
              <div className="slider5__track" role="radiogroup" aria-label={def.label}>
                <span className="slider5__end">{def.low}</span>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={t[key] === v} className={`slider5__dot${t[key] === v ? ' is-on' : ''}${v <= t[key] ? ' is-fill' : ''}`} onClick={() => set({ [key]: v })}>{v}</button>
                ))}
                <span className="slider5__end">{def.high}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="sub-title">Choices</h3>
          {Object.entries(CHOICES).map(([key, def]) => (
            <div key={key} className="tactics__row">
              <span className="tactics__label">{def.label}</span>
              <div className="segmented__opts">
                {[def.a, def.b].map((v) => <button key={v} type="button" className={t[key] === v ? 'is-on' : ''} onClick={() => set({ [key]: v })}>{def.names[v]}</button>)}
              </div>
              <p className="hint">{def.text}</p>
            </div>
          ))}
          <div className="tactics__row">
            <span className="tactics__label">Kick-off mentality</span>
            <div className="segmented__opts">
              {Object.entries(MENTALITIES).map(([v, label]) => <button key={v} type="button" className={t.approach === v ? 'is-on' : ''} onClick={() => set({ approach: v })}>{label}</button>)}
            </div>
            <p className="hint">Attack: more chances at both ends. Defend: fewer. You can change it during the match.</p>
          </div>
          <h3 className="sub-title">Switches</h3>
          {Object.entries(SWITCHES).map(([key, def]) => (
            <label key={key} className={`switch${t[key] ? ' is-on' : ''}`}>
              <input type="checkbox" checked={!!t[key]} onChange={(e) => set({ [key]: e.target.checked })} />
              <span className="switch__track" aria-hidden="true"><i /></span>
              <span className="switch__body"><b>{def.label}</b><small>{def.text}</small></span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="sub-title">What your squad says</h3>
        {advice.length ? (
          <ul className="advice">
            {advice.map((a) => (
              <li key={a.text} className={`advice__item is-${a.tone}`}>
                {a.tone === 'good' ? '✓' : a.tone === 'covered' ? '○' : '⚠'} {a.text}{a.note && <> <em>({a.note})</em></>}
              </li>
            ))}
          </ul>
        ) : <p className="hint">Balanced settings: nothing here leans on a particular strength.</p>}
        <p className="hint">Rival styles counter each other: pressing hurts short build-up, long balls skip the press, counter-attacks punish high lines, patient passing breaks deep blocks. Check the rival's style before kick-off.</p>
      </section>
    </div>
  );
}
