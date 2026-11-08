import React, { useEffect, useState } from 'react';
import { createMatch } from './engine/match.js';
import { randomSeed } from './engine/rng.js';
import { userFixture, clubById, aiTeamFor } from './engine/season.js';
import {
  newClubState, loadClubState, saveClubState, clearClubState, buildUserTeam, matchRewards, applyMatch,
  buyPack, buyBoost, openOwnedPack, keepPending, mergePending, discardPending, closeSeason, buyMarketCard,
  startNextSeason, useOffseasonCard, POOL_BY_ID,
} from './state/club.js';
import { Crest } from './ui/Art.jsx';
import Home from './ui/Home.jsx';
import Squad from './ui/Squad.jsx';
import PreMatch from './ui/PreMatch.jsx';
import Match from './ui/Match.jsx';
import Result from './ui/Result.jsx';
import Shop from './ui/Shop.jsx';
import Collection from './ui/Collection.jsx';
import League from './ui/League.jsx';
import PackOpening from './ui/PackOpening.jsx';

const TABS = [
  { id: 'home', label: 'Club', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '◫' },
  { id: 'cards', label: 'Cards', icon: '▤' },
  { id: 'shop', label: 'Shop', icon: '◎' },
  { id: 'league', label: 'League', icon: '≡' },
];

export default function App() {
  const [state, setState] = useState(() => loadClubState() || newClubState(randomSeed()));
  const [screen, setScreen] = useState('home');
  const [loadout, setLoadout] = useState([]);
  const [live, setLive] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { saveClubState(state); }, [state]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const fixture = state.phase === 'season' ? userFixture(state.season, state.club.id) : null;
  const opponent = fixture ? clubById(state.season, fixture.opponentId) : null;

  const kickoff = () => {
    const seed = randomSeed();
    const user = buildUserTeam(state, loadout, fixture.isHome);
    const ai = aiTeamFor(state.season, opponent.id, POOL_BY_ID, seed);
    const [home, away] = fixture.isHome ? [user, ai] : [ai, user];
    const match = createMatch({ home, away, seed, context: { competition: 'league' } });
    setLive({ match, userSide: fixture.isHome ? 0 : 1 });
    setScreen('match');
  };

  const finish = (match) => {
    const { userSide } = live;
    const rewards = matchRewards(state, match, userSide);
    const applied = applyMatch(state, match, userSide, opponent, rewards, randomSeed());
    setState(applied.state);
    setOutcome({ match, userSide, rewards, retired: applied.retired, coinsAfter: applied.state.coins });
    setLoadout([]);
    setScreen('result');
  };

  const useCard = (itemUid, target) => {
    const r = useOffseasonCard(state, itemUid, target, randomSeed());
    setState(r.state);
    setToast({ text: r.message, tone: r.success === false ? 'bad' : 'good' });
  };

  const reset = () => {
    if (!window.confirm('Start a new game? Your club, cards and coins will be lost.')) return;
    clearClubState();
    setState(newClubState(randomSeed()));
    setScreen('home');
  };

  const isTab = TABS.some((t) => t.id === screen);

  return (
    <div className={`app${isTab ? ' app--tabs' : ''}`}>
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

      <main>
        {screen === 'home' && (
          <Home
            state={state}
            onPlay={() => setScreen('prematch')}
            onCloseSeason={() => setState((s) => closeSeason(s, randomSeed()))}
            onStartSeason={() => setState((s) => startNextSeason(s, randomSeed()))}
            goTo={setScreen}
            onReset={reset}
          />
        )}
        {screen === 'squad' && <Squad state={state} setState={setState} />}
        {screen === 'cards' && (
          <Collection state={state} onOpenPack={(i) => setState((s) => openOwnedPack(s, i, randomSeed()))} onUseCard={useCard} />
        )}
        {screen === 'shop' && (
          <Shop
            state={state}
            onBuyPack={(id) => setState((s) => buyPack(s, id, randomSeed()))}
            onBuyBoost={(id) => setState((s) => buyBoost(s, id))}
            onBuyOffer={(uid) => setState((s) => buyMarketCard(s, uid))}
          />
        )}
        {screen === 'league' && <League state={state} />}
        {screen === 'prematch' && fixture && (
          <PreMatch
            state={state}
            opponent={opponent}
            setup={{ home: fixture.isHome, label: `Matchday ${state.season.matchday + 1}` }}
            loadout={loadout}
            setLoadout={setLoadout}
            onStart={kickoff}
            onBack={() => setScreen('home')}
          />
        )}
        {screen === 'match' && live && <Match initial={live.match} userSide={live.userSide} onFinish={finish} />}
        {screen === 'result' && outcome && <Result {...outcome} onDone={() => setScreen('home')} />}
      </main>

      {isTab && (
        <nav className="tabbar" aria-label="Main">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={screen === t.id ? 'is-on' : ''} onClick={() => setScreen(t.id)}>
              <span className="tabbar__icon" aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'shop' && state.phase === 'offseason' && <i className="tabbar__dot" />}
              {t.id === 'cards' && state.inventory.packs.length > 0 && <i className="tabbar__dot" />}
            </button>
          ))}
        </nav>
      )}

      {state.pendingOpen && screen !== 'match' && (
        <PackOpening
          state={state}
          onKeep={(opts) => setState((s) => keepPending(s, opts))}
          onMerge={() => setState((s) => mergePending(s))}
          onDiscard={() => setState((s) => discardPending(s))}
        />
      )}

      {toast && <div className={`toast toast--${toast.tone}`} role="status">{toast.text}</div>}
    </div>
  );
}
