import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SEGMENTS, playSegment, aiDecide, setMentality, substitute, canSubstitute, playBoost, canPlayBoost, runShootout, onPitch,
} from '../engine/match.js';
import { BOOSTS } from '../data/boosts.js';
import { overall, slotFit } from '../engine/cards.js';
import { Crest, kitColors, isLight } from './Art.jsx';
import { BoostCard } from './Card.jsx';
import { Segmented } from './Home.jsx';
import { PitchLines } from './Squad.jsx';
import Sheet from './Sheet.jsx';

const REVEAL_MS = 2600;

export default function Match({ initial, userSide, onFinish }) {
  const [match, setMatch] = useState(initial);
  const [shownEvents, setShownEvents] = useState(initial.events.length);
  const [clock, setClock] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const [auto, setAuto] = useState(false);
  const [subsOpen, setSubsOpen] = useState(false);
  const [targeting, setTargeting] = useState(null); // boost id waiting for a player pick
  const [flash, setFlash] = useState(null);
  const [kicksShown, setKicksShown] = useState(0);
  const timers = useRef([]);

  const user = match.teams[userSide];
  const opp = match.teams[1 - userSide];
  const kits = [
    kitColors(match.teams[0], match.teams[1], false),
    kitColors(match.teams[1], match.teams[0], true),
  ];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const visibleEvents = match.events.slice(0, shownEvents);
  const shownScore = useMemo(() => {
    const s = [0, 0];
    for (const e of visibleEvents) if (e.type === 'goal') s[e.side] += 1;
    return s;
  }, [visibleEvents]);

  const segment = match.segment;
  const finished = match.phase === 'fulltime';
  const penalties = match.phase === 'penalties';
  const live = match.phase === 'live' && !revealing;

  const after = (ms, fn) => timers.current.push(setTimeout(fn, ms));

  const play = () => {
    if (match.phase !== 'live' || revealing) return;
    setTargeting(null);
    const startMinute = match.segment * 15;
    let next = aiDecide(match, 1 - userSide);
    // AI decisions (e.g. their subs) appear in the feed straight away.
    const decided = next.events.length;
    next = playSegment(next);
    setMatch(next);
    setShownEvents(decided);
    setRevealing(true);
    const fresh = next.events.slice(decided);
    const step = REVEAL_MS / 15;
    for (let m = 1; m <= 15; m += 1) after(step * m, () => setClock(startMinute + m));
    fresh.forEach((ev, i) => {
      const at = Math.max(0, (ev.minute - startMinute) * step);
      after(at, () => {
        setShownEvents(decided + i + 1);
        if (ev.type === 'goal') {
          setFlash({ side: ev.side, playerId: ev.playerId, key: `${ev.minute}-${i}` });
          after(1400, () => setFlash(null));
        }
      });
    });
    after(REVEAL_MS + 150, () => {
      setShownEvents(next.events.length);
      setRevealing(false);
    });
  };

  // Auto mode: keep playing segments until a decision is needed or the match ends.
  useEffect(() => {
    if (!auto || revealing || subsOpen || targeting || match.phase !== 'live') return undefined;
    const t = setTimeout(play, 700);
    return () => clearTimeout(t);
  });

  const startShootout = () => {
    const next = runShootout(match);
    setMatch(next);
    setShownEvents(next.events.length);
    next.shootout.kicks.forEach((_, i) => after(900 * (i + 1), () => setKicksShown(i + 1)));
  };

  const shootoutDone = match.shootout && kicksShown >= match.shootout.kicks.length;
  const canLeave = finished && !revealing && (!match.shootout || shootoutDone);

  const onBoost = (id) => {
    if (BOOSTS[id].target === 'player') {
      setTargeting(targeting === id ? null : id);
      return;
    }
    setMatch((m) => playBoost(m, userSide, id));
    setShownEvents((n) => n + 1);
  };

  const onPickPlayer = (playerId) => {
    if (!targeting) return;
    if (!canPlayBoost(match, userSide, targeting, playerId).ok) return;
    setMatch((m) => playBoost(m, userSide, targeting, playerId));
    setShownEvents((n) => n + 1);
    setTargeting(null);
  };

  const control = match.segmentSummaries.length ? match.segmentSummaries[match.segmentSummaries.length - 1].control : [0.5, 0.5];
  const minuteLabel = finished ? (match.shootout ? 'FT · Pens' : 'Full time')
    : penalties ? 'Penalties'
      : revealing ? `${clock}'`
        : segment === 0 ? 'Kick-off' : segment === 3 ? 'Half time' : `${segment * 15}'`;

  const nextLabel = segment === 0 ? 'Kick off' : `Play ${segment * 15}–${segment * 15 + 15}'`;

  return (
    <div className="screen screen--match">
      <div className="scoreboard">
        <ScoreTeam team={match.teams[0]} colors={kits[0]} />
        <div className="scoreboard__mid">
          <div className="scoreboard__score">
            <span className={flash?.side === 0 ? 'pop' : ''}>{shownScore[0]}</span>
            <i>–</i>
            <span className={flash?.side === 1 ? 'pop' : ''}>{shownScore[1]}</span>
          </div>
          <div className="scoreboard__clock">{minuteLabel}</div>
          {match.shootout && (
            <div className="scoreboard__pens">
              ({match.shootout.kicks.slice(0, kicksShown).filter((k) => k.side === 0 && k.scored).length}–
              {match.shootout.kicks.slice(0, kicksShown).filter((k) => k.side === 1 && k.scored).length} pens)
            </div>
          )}
        </div>
        <ScoreTeam team={match.teams[1]} colors={kits[1]} right />
      </div>

      <div className="momentum" aria-label="Midfield control last 15 minutes">
        <i style={{ width: `${control[0] * 100}%`, background: kits[0].primary }} />
        <i style={{ width: `${control[1] * 100}%`, background: kits[1].primary }} />
      </div>
      <div className="segments">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span key={i} className={i < segment ? 'done' : i === segment && revealing ? 'now' : ''} />
        ))}
      </div>

      <MatchPitch
        match={match}
        userSide={userSide}
        kits={kits}
        flash={flash}
        targeting={!!targeting}
        onPick={onPickPlayer}
      />
      {flash && (
        <div className="goal-banner" key={flash.key} style={{ background: kits[flash.side].primary, color: isLight(kits[flash.side].primary) ? '#111' : '#fff' }}>
          GOAL · {match.teams[flash.side].short}
        </div>
      )}

      {match.shootout && <Shootout match={match} shown={kicksShown} kits={kits} />}

      <Feed events={visibleEvents} teams={match.teams} kits={kits} />

      <div className="dock">
        {targeting && (
          <div className="dock__note">Tap one of your players on the pitch for {BOOSTS[targeting].name}. <button type="button" className="link-btn" onClick={() => setTargeting(null)}>Cancel</button></div>
        )}
        {match.phase === 'live' && (
          <>
            <div className="dock__row">
              <Segmented
                small
                label="Mentality"
                value={user.mentality}
                options={[
                  { id: 'defensive', label: 'Defend', disabled: !live },
                  { id: 'balanced', label: 'Balanced', disabled: !live },
                  { id: 'attacking', label: 'Attack', disabled: !live },
                ]}
                onChange={(v) => setMatch((m) => setMentality(m, userSide, v))}
              />
              <button type="button" className="btn btn--small" disabled={!live || user.subsLeft === 0 || segment === 0} onClick={() => setSubsOpen(true)}>
                Subs · {user.subsLeft}
              </button>
            </div>
            {user.loadout.length > 0 && (
              <div className="dock__boosts">
                {user.loadout.map((id, i) => {
                  const check = canPlayBoost(match, userSide, id, BOOSTS[id].target === 'player' ? user.slots[6].playerId : undefined);
                  return (
                    <BoostCard
                      key={`${id}-${i}`}
                      id={id}
                      compact
                      active={targeting === id}
                      disabled={!live || !check.ok}
                      reason={check.ok ? BOOSTS[id].text : check.reason}
                      onClick={() => onBoost(id)}
                    />
                  );
                })}
              </div>
            )}
            <div className="dock__row">
              <label className="auto">
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
                <span>Auto-play</span>
              </label>
              <button type="button" className="btn btn--primary btn--grow" disabled={!live} onClick={play}>
                {revealing ? `${clock}'…` : nextLabel}
              </button>
            </div>
          </>
        )}
        {penalties && !revealing && (
          <button type="button" className="btn btn--primary btn--block" onClick={startShootout}>Penalty shootout</button>
        )}
        {canLeave && (
          <button type="button" className="btn btn--primary btn--block" onClick={() => onFinish(match)}>See result ›</button>
        )}
      </div>

      {subsOpen && (
        <SubsSheet
          match={match}
          side={userSide}
          onClose={() => setSubsOpen(false)}
          onSub={(outId, inId) => {
            setMatch((m) => substitute(m, userSide, outId, inId));
            setShownEvents((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function ScoreTeam({ team, colors, right }) {
  return (
    <div className={`scoreboard__team${right ? ' is-right' : ''}`}>
      <Crest colors={team.colors} short={team.short} size={34} />
      <span className="scoreboard__name">{team.short}</span>
      <span className="kit-dot" style={{ background: colors.primary }} />
    </div>
  );
}

function MatchPitch({ match, userSide, kits, flash, targeting, onPick }) {
  return (
    <div className={`pitch pitch--match${targeting ? ' is-targeting' : ''}`}>
      <PitchLines />
      {[0, 1].map((side) => {
        const team = match.teams[side];
        const mine = side === userSide;
        return onPitch(team).map(({ slot, p }) => {
          // User attacks upward; the opponent is mirrored into the top half.
          // Rows are spread over 60–95% of each half so tokens don't overlap.
          const x = mine ? slot.x : 100 - slot.x;
          const depth = 60 + ((slot.y - 22) / 68) * 34;
          const y = mine ? depth : 100 - depth;
          const colors = kits[side];
          const isGk = slot.pos === 'GK';
          const bg = isGk ? '#1e1e1e' : colors.primary;
          const fg = isLight(bg) ? '#111' : '#fff';
          const scoring = flash && flash.side === side && flash.playerId === p.card.id;
          const fit = slotFit(p.card.pos, slot.pos);
          return (
            <button
              type="button"
              key={`${side}-${p.card.id}`}
              className={`token${mine ? ' token--mine' : ''}${scoring ? ' is-scoring' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, '--kit': bg, '--fg': fg, '--sta': `${p.stamina}%`, '--trim': colors.secondary }}
              onClick={mine ? () => onPick(p.card.id) : undefined}
              disabled={!mine}
              title={`${p.card.name} · ${overall(p.card)} · stamina ${Math.round(p.stamina)}%${fit < 1 ? ' · out of position' : ''}`}
            >
              <span className="token__disc">{overall(p.card)}</span>
              <span className="token__name">{shortName(p.card.name)}</span>
            </button>
          );
        });
      })}
    </div>
  );
}

const shortName = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 ? parts.slice(-1)[0] : name;
};

function Feed({ events, teams, kits }) {
  const list = [...events].reverse();
  return (
    <ol className="feed" aria-live="polite">
      {list.length === 0 && <li className="feed__empty">The players are out. Make your choices and kick off.</li>}
      {list.map((e, i) => (
        <li key={list.length - i} className={`feed__item feed__item--${e.type}${e.outcome ? ` is-${e.outcome}` : ''}`}>
          <span className="feed__min">{e.minute}'</span>
          {e.side !== null && e.side !== undefined && <span className="feed__dot" style={{ background: kits[e.side].primary }} />}
          <span className="feed__text">{e.text}</span>
        </li>
      ))}
    </ol>
  );
}

function Shootout({ match, shown, kits }) {
  const kicks = match.shootout.kicks.slice(0, shown);
  return (
    <div className="shootout">
      {[0, 1].map((side) => (
        <div key={side} className="shootout__row">
          <span className="shootout__team">{match.teams[side].short}</span>
          <div className="shootout__kicks">
            {kicks.filter((k) => k.side === side).map((k, i) => (
              <span key={i} className={`kick ${k.scored ? 'is-in' : 'is-out'}`} title={`${k.name} ${k.scored ? 'scores' : 'misses'}`}
                style={k.scored ? { background: kits[side].primary } : undefined}>{k.scored ? '●' : '✕'}</span>
            ))}
          </div>
        </div>
      ))}
      {shown > 0 && (
        <p className="shootout__last">
          {kicks[kicks.length - 1].name} {kicks[kicks.length - 1].scored ? 'scores!' : 'misses!'}
        </p>
      )}
    </div>
  );
}

function SubsSheet({ match, side, onClose, onSub }) {
  const team = match.teams[side];
  const [outId, setOutId] = useState(null);
  const field = onPitch(team);
  return (
    <Sheet title={`Substitutions · ${team.subsLeft} left`} onClose={onClose}>
      <p className="hint">{outId ? 'Now pick who comes on.' : 'Pick a player to take off. Stamina shown in the bar.'}</p>
      {team.superSubPending && <p className="hint hint--accent">Super Sub ready: your next substitute gets +15% stats.</p>}
      <div className="sub-list">
        {field.map(({ slot, p }) => (
          <button key={p.card.id} type="button" className={`sub-row${outId === p.card.id ? ' is-selected' : ''}`} onClick={() => setOutId(p.card.id)}>
            <span className="sub-row__pos">{slot.pos}</span>
            <span className="sub-row__name">{p.card.name}</span>
            <span className="sub-row__sta"><i style={{ width: `${p.stamina}%` }} /></span>
            <span className="sub-row__ovr">{overall(p.card)}</span>
          </button>
        ))}
      </div>
      <h4 className="sub-title">Bench</h4>
      <div className="sub-list">
        {team.bench.length === 0 && <p className="hint">Nobody left on the bench.</p>}
        {team.bench.map((id) => {
          const p = team.players[id];
          const slot = field.find((f) => f.p.card.id === outId)?.slot;
          const ok = outId && canSubstitute(match, side, outId, id).ok;
          const fit = slot ? slotFit(p.card.pos, slot.pos) : 1;
          return (
            <button key={id} type="button" className="sub-row" disabled={!ok}
              onClick={() => { onSub(outId, id); setOutId(null); onClose(); }}>
              <span className="sub-row__pos">{p.card.pos}</span>
              <span className="sub-row__name">{p.card.name}{fit < 1 ? <em> · out of position</em> : null}</span>
              <span className="sub-row__sta"><i style={{ width: '100%' }} /></span>
              <span className="sub-row__ovr">{overall(p.card)}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
