import React, { useEffect, useState } from 'react';
import { OPPONENTS } from './data/demo.js';
import { buildAiTeam } from './engine/aiTeam.js';
import { createMatch } from './engine/match.js';
import { randomSeed } from './engine/rng.js';
import {
  newClubState, loadClubState, saveClubState, clearClubState, buildUserTeam, matchRewards, applyMatch,
} from './state/club.js';
import { Crest } from './ui/Art.jsx';
import Home from './ui/Home.jsx';
import Squad from './ui/Squad.jsx';
import PreMatch from './ui/PreMatch.jsx';
import Match from './ui/Match.jsx';
import Result from './ui/Result.jsx';

export default function App() {
  const [state, setState] = useState(() => loadClubState() || newClubState());
  const [screen, setScreen] = useState('home'); // home | squad | prematch | match | result
  const [setup, setSetup] = useState({ opponentId: OPPONENTS[0].id, knockout: false, home: true });
  const [loadout, setLoadout] = useState([]);
  const [live, setLive] = useState(null); // { match, userSide, opponent }
  const [outcome, setOutcome] = useState(null);

  useEffect(() => { saveClubState(state); }, [state]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const opponent = OPPONENTS.find((o) => o.id === setup.opponentId);

  const kickoff = () => {
    const seed = randomSeed();
    const user = buildUserTeam(state, loadout, setup.home);
    const ai = buildAiTeam(opponent, seed);
    const [home, away] = setup.home ? [user, ai] : [ai, user];
    const match = createMatch({ home, away, seed, context: { knockout: setup.knockout, competition: setup.knockout ? 'cup' : 'league' } });
    setLive({ match, userSide: setup.home ? 0 : 1, opponent });
    setScreen('match');
  };

  const finish = (match) => {
    const { userSide } = live;
    const rewards = matchRewards(state, match, userSide, opponent.level);
    const applied = applyMatch(state, match, userSide, opponent, rewards);
    setState(applied.state);
    setOutcome({ match, userSide, rewards, retired: applied.retired, coinsAfter: applied.state.coins });
    setLoadout([]);
    setScreen('result');
  };

  const reset = () => {
    if (!window.confirm('Reset the demo club? Coins, results and card wear will be lost.')) return;
    clearClubState();
    setState(newClubState());
    setScreen('home');
  };

  const hub = screen === 'home' || screen === 'squad';

  return (
    <div className="app">
      {screen !== 'match' && (
        <header className="topbar">
          <Crest colors={state.club.colors} short={state.club.short} size={30} />
          <div className="topbar__club">
            <b>{state.club.name}</b>
            <span>{state.club.division}</span>
          </div>
          <div className="topbar__coins" aria-label="Coins">◎ {state.coins}</div>
        </header>
      )}

      {hub && (
        <nav className="tabs" aria-label="Main">
          <button type="button" className={screen === 'home' ? 'is-on' : ''} onClick={() => setScreen('home')}>Club</button>
          <button type="button" className={screen === 'squad' ? 'is-on' : ''} onClick={() => setScreen('squad')}>Squad</button>
        </nav>
      )}

      <main>
        {screen === 'home' && (
          <Home state={state} setup={setup} setSetup={setSetup} onKickoff={() => setScreen('prematch')} onSquad={() => setScreen('squad')} onReset={reset} />
        )}
        {screen === 'squad' && <Squad state={state} setState={setState} />}
        {screen === 'prematch' && (
          <PreMatch state={state} opponent={opponent} setup={setup} loadout={loadout} setLoadout={setLoadout} onStart={kickoff} onBack={() => setScreen('home')} />
        )}
        {screen === 'match' && live && <Match initial={live.match} userSide={live.userSide} onFinish={finish} />}
        {screen === 'result' && outcome && <Result {...outcome} onDone={() => setScreen('home')} />}
      </main>
    </div>
  );
}
