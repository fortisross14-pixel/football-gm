import React, { useEffect, useState } from 'react';
import { createMatch } from './engine/match.js';
import { randomSeed } from './engine/rng.js';
import { clubById, aiTeamFor } from './engine/season.js';
import {
  newClubState, loadClubState, saveClubState, clearClubState, buildUserTeam, matchRewards, applyMatch,
  buyPack, buyBoost, openOwnedPack, keepPending, mergePending, discardPending, closeSeason, buyMarketCard,
  startNextSeason, useOffseasonCard, POOL_BY_ID, nextUserGame, acceptOffer,
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
import ClubInfo from './ui/ClubInfo.jsx';
import Career from './ui/Career.jsx';

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

  const fixture = nextUserGame(state);
  const opponent = fixture ? clubById(state.world, fixture.opponentId) : null;

  const kickoff = () => {
    const seed = randomSeed();
    // The competition's home side goes first, so scores line up with the fixture.
    const userHomeSide = fixture.homeId === state.club.id;
    const user = buildUserTeam(state, loadout, userHomeSide && !fixture.neutral);
    const ai = aiTeamFor(state.world, opponent.id, POOL_BY_ID, seed);
    const [home, away] = userHomeSide ? [user, ai] : [ai, user];
    const match = createMatch({ home, away, seed, context: { competition: fixture.competition, knockout: fixture.knockout, neutral: fixture.neutral } });
    setLive({ match, userSide: userHomeSide ? 0 : 1, game: fixture });
    setScreen('match');
  };

  const finish = (match) => {
    const { userSide, game } = live;
    const rewards = matchRewards(state, match, userSide, game);
    const applied = applyMatch(state, match, userSide, opponent, rewards, randomSeed(), game);
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

  const isTab = TABS.some((t) => t.id === screen) || screen === 'club' || screen === 'career';

  return (
    <div className={`app${isTab ? ' app--tabs' : ''}`}>
      {screen !== 'match' && (
        <header className="topbar">
          <button type="button" className="topbar__crest" onClick={() => setScreen('club')} aria-label="Club details">
            <Crest colors={state.club.colors} short={state.club.short} size={30} />
          </button>
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
        {screen === 'club' && <ClubInfo state={state} onBack={() => setScreen('home')} />}
        {screen === 'career' && (
          <Career
            state={state}
            onBack={() => setScreen('home')}
            onAccept={(clubId, keys) => {
              setState((s) => acceptOffer(s, clubId, keys, randomSeed()));
              setToast({ text: 'New club, new challenge. Your squad is ready.', tone: 'good' });
              setScreen('home');
            }}
          />
        )}
        {screen === 'prematch' && fixture && (
          <PreMatch
            state={state}
            opponent={opponent}
            setup={{ home: fixture.isHome || (fixture.neutral && fixture.homeId === state.club.id), label: fixture.label, competition: fixture.competition }}
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
