import React, { useEffect, useState } from 'react';
import { PlayerCard } from './Card.jsx';
import { Crest, kitColors } from './Art.jsx';

export default function Result({ match, userSide, rewards, retired, coinsAfter, onDone }) {
  const { result } = match;
  const won = result.winner === userSide;
  const drew = result.winner === null;
  const headline = won ? 'Victory' : drew ? 'Draw' : 'Defeat';
  const motmTeam = match.teams[result.motm.side];
  const motm = motmTeam.players[result.motm.playerId];
  const user = match.teams[userSide];
  const kits = [kitColors(match.teams[0], match.teams[1], false), kitColors(match.teams[1], match.teams[0], true)];
  const coins = useCountUp(rewards.total);

  const goals = (side) => match.events.filter((e) => e.type === 'goal' && e.side === side);
  const appeared = Object.values(user.players).filter((p) => p.enteredAt !== null).sort((a, b) => b.rating - a.rating);

  return (
    <div className="screen">
      <div className={`result-hero result-hero--${won ? 'win' : drew ? 'draw' : 'loss'}`}>
        <span className="result-hero__label">{headline}</span>
        <div className="result-hero__score">
          <Crest colors={match.teams[0].colors} short={match.teams[0].short} size={40} />
          <b>{result.score[0]}–{result.score[1]}</b>
          <Crest colors={match.teams[1].colors} short={match.teams[1].short} size={40} />
        </div>
        {result.shootout && <span className="result-hero__pens">{result.shootout[0]}–{result.shootout[1]} on penalties</span>}
        <div className="scorers">
          {[0, 1].map((side) => (
            <ul key={side} className={side ? 'is-right' : ''}>
              {goals(side).map((g, i) => (
                <li key={i}>{match.teams[side].players[g.playerId].card.name} {g.minute}'</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="panel rewards">
        <h2 className="section-title">Rewards</h2>
        <ul>
          {rewards.items.map((r) => (
            <li key={r.label}><span>{r.label}</span><b>+{r.coins}</b></li>
          ))}
        </ul>
        <div className="rewards__total">
          <span>Total</span>
          <b className="coins">◎ {coins}</b>
        </div>
        <p className="hint">Balance: ◎ {coinsAfter}. Coins buy packs and boosts from milestone 2.</p>
      </section>

      <section>
        <h2 className="section-title">Man of the match</h2>
        <div className="motm">
          <PlayerCard card={motm.card} colors={kits[result.motm.side]} size="medium" />
          <div className="motm__info">
            <b>{motm.card.name}</b>
            <span>{motmTeam.name}</span>
            <span className="rating">{motm.rating.toFixed(1)}</span>
            <span>{plural(motm.goals, 'goal')} · {plural(motm.assists, 'assist')}{motm.saves ? ` · ${plural(motm.saves, 'save')}` : ''}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Your players</h2>
        <ul className="ratings">
          {appeared.map((p) => (
            <li key={p.card.id}>
              <span className={`rating rating--${p.rating >= 7.5 ? 'hi' : p.rating < 6 ? 'lo' : 'mid'}`}>{p.rating.toFixed(1)}</span>
              <span className="ratings__name">{p.card.name}</span>
              <span className="ratings__line">
                {p.goals > 0 && `⚽ ${p.goals} `}{p.assists > 0 && `🅰 ${p.assists} `}{p.minutes < 90 ? `${p.minutes}'` : ''}
              </span>
              <span className="ratings__left">{p.card.matchesLeft == null ? '—' : `${Math.max(0, p.card.matchesLeft - 1)} left`}</span>
            </li>
          ))}
        </ul>
        {user.boostsUsed.length > 0 && <p className="hint">Boosts used: {user.boostsUsed.length}. They're gone from your inventory.</p>}
      </section>

      {retired.length > 0 && (
        <section className="panel retired">
          <h2 className="section-title">Retirement</h2>
          {retired.map((c) => (
            <p key={c.id}><b>{c.name}</b> played their last match and joins the Hall of Fame. An Academy player takes the spot.</p>
          ))}
        </section>
      )}

      <div className="cta-row cta-row--sticky">
        <button type="button" className="btn btn--primary btn--block" onClick={onDone}>Back to club</button>
      </div>
    </div>
  );
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function useCountUp(target) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 900);
      setV(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
