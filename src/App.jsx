import React, { useEffect, useRef, useState } from 'react';
import { createMatch } from './engine/match.js';
import { randomSeed } from './engine/rng.js';
import { clubById, aiTeamFor } from './engine/season.js';
import {
  newClubState, buildUserTeam, matchRewards, applyMatch,
  buyPack, buyBoostPack, openOwnedPack, keepPending, mergePending, discardPending, closeSeason, buyMarketCard,
  startNextSeason, useOffseasonCard, POOL_BY_ID, nextUserGame, acceptOffer, discardCommons, lookForOffers, toggleCurse,
} from './state/club.js';
import { Crest, BadgesContext } from './ui/Art.jsx';
import { clubVars } from './ui/clubTheme.js';
import Home from './ui/Home.jsx';
import Squad from './ui/Squad.jsx';
import PreMatch from './ui/PreMatch.jsx';
import Match from './ui/Match.jsx';
import Result from './ui/Result.jsx';
import League from './ui/League.jsx';
import PackOpening from './ui/PackOpening.jsx';
import ClubInfo from './ui/ClubInfo.jsx';
import Career from './ui/Career.jsx';
import Menu, { SettingsSheet } from './ui/Menu.jsx';
import NewCareer from './ui/NewCareer.jsx';
import Tip from './ui/Tip.jsx';
import Team, { HouseRules } from './ui/Team.jsx';
import World from './ui/World.jsx';
import Player from './ui/Player.jsx';
import Manager from './ui/Manager.jsx';
import CardsHub from './ui/CardsHub.jsx';
import { NavContext, LeagueLink, resetSticky } from './ui/nav.jsx';
import Sheet from './ui/Sheet.jsx';
import { loadSlot, saveSlot, loadSettings, saveSettings } from './state/storage.js';

// One-time hints, shown the first time each screen opens.
const TIPS = {
  home: 'This is your club. Play your next match from here. Your board objective sits under the fixture, so keep an eye on it.',
  squad: 'Tap a card, then another, to swap them. The head coach sets the formation. Set your tactics below: pressing, passing and the defensive line.',
  cards: 'Owned: your players, items and the album. Shop: player packs, boost packs and, after the season, the Transfer Market.',
  league: 'Every league in the world plays each matchday. Tap any club to see its page, and open History for champions, top scorers, MVPs and Golden Gloves by season.',
  world: 'The wider world: manager rankings, the strongest clubs, all-time records and the Hall of Fame.',
  club: 'Facilities, money in and out, and your trophy cabinet. Facilities are upgraded with off-season Club cards.',
  career: 'Your reputation decides which clubs will hire you. Keep the owners and fans happy: if job security ends a season under 30, or you miss the objective twice, you are sacked.',
  opening: 'New card! Keep it (pick who it replaces), merge a duplicate for +1★, or discard it for coins.',
};

const TABS = [
  { id: 'home', label: 'Club', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '◫' },
  { id: 'cards', label: 'Cards', icon: '▤' },
  { id: 'league', label: 'League', icon: '≡' },
  { id: 'world', label: 'World', icon: '◍' },
];

// Root: main menu, new career, or a game in a save slot.
export default function App() {
  const [view, setView] = useState({ name: 'menu' });
  const [settings, setSettingsState] = useState(loadSettings);
  const setSettings = (s) => { setSettingsState(s); saveSettings(s); };
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
  }, [settings.reduceMotion]);

  const badges = settings.realBadges !== false;
  if (view.name === 'menu') {
    return (
      <BadgesContext.Provider value={badges}>
      <Menu
        settings={settings}
        setSettings={setSettings}
        onContinue={(n) => { const st = loadSlot(n); if (st) setView({ name: 'game', slot: n, state: st }); }}
        onNew={(n) => setView({ name: 'new', slot: n })}
        onImport={(n, st) => { saveSlot(n, st); setView({ name: 'game', slot: n, state: st }); }}
      />
      </BadgesContext.Provider>
    );
  }
  if (view.name === 'new') {
    return (
      <NewCareer
        onCancel={() => setView({ name: 'menu' })}
        onStart={(opts) => {
          const st = newClubState(randomSeed(), opts);
          saveSlot(view.slot, st);
          setView({ name: 'game', slot: view.slot, state: st });
        }}
      />
    );
  }
  return (
    <BadgesContext.Provider value={badges}>
      <Game key={view.slot} slot={view.slot} initial={view.state} settings={settings} setSettings={setSettings} onExit={() => setView({ name: 'menu' })} />
    </BadgesContext.Provider>
  );
}

function Game({ slot, initial, settings, setSettings, onExit }) {
  const [state, setState] = useState(initial);
  const [screen, setScreen] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const saveTimer = useRef(null);
  const [loadout, setLoadout] = useState([]);
  const [live, setLive] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [toast, setToast] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [leagueNav, setLeagueNav] = useState(null);
  // Detail pages (club, player, manager) stack up: Back returns to where you came from.
  const [detail, setDetail] = useState({});
  const backStack = useRef([]);
  const openDetail = (name, d) => {
    backStack.current = [...backStack.current, { screen, detail, y: window.scrollY }].slice(-30);
    setDetail(d);
    setScreen(name);
    window.scrollTo(0, 0);
  };
  const goBack = () => {
    const prev = backStack.current.pop();
    if (!prev) { setScreen('home'); return; }
    setDetail(prev.detail);
    setScreen(prev.screen);
    requestAnimationFrame(() => window.scrollTo(0, prev.y || 0));
  };
  const setTab = (tab) => setDetail((d) => ({ ...d, tab }));
  const teamId = screen === 'team' ? detail.teamId : null;
  const nav = {
    openClub: (id, tab) => openDetail('team', { teamId: id, tab }),
    openPlayer: (id, name) => openDetail('player', { playerId: id, name }),
    openManager: (key) => openDetail('manager', { mkey: key }),
    openLeague: (divId, tab = 'table') => { setLeagueNav({ divId, tab, k: Date.now() }); setScreen('league'); },
  };

  // Save shortly after every change (and right away when leaving).
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSlot(slot, state), 1200);
    return () => clearTimeout(saveTimer.current);
  }, [state, slot]);
  const exit = () => { clearTimeout(saveTimer.current); saveSlot(slot, state); onExit(); };
  const seeTip = (id) => setState((s) => ({ ...s, seenTips: [...(s.seenTips || []), id] }));
  const tip = (id) => settings.tips && !(state.seenTips || []).includes(id) ? id : null;
  useEffect(() => { if (!['team', 'player', 'manager'].includes(screen)) window.scrollTo(0, 0); }, [screen]);
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
    setOutcome({ match, userSide, rewards, retired: applied.retired, boostReward: applied.boostReward, coinsAfter: applied.state.coins });
    setLoadout([]);
    setScreen('result');
  };

  const useCard = (itemUid, target) => {
    const r = useOffseasonCard(state, itemUid, target, randomSeed());
    setState(r.state);
    setToast({ text: r.message, tone: r.success === false ? 'bad' : 'good' });
  };

  const isTab = TABS.some((t) => t.id === screen) || ['club', 'career', 'team', 'player', 'manager', 'shop'].includes(screen);

  return (
    <NavContext.Provider value={nav}>
    <div className={`app${isTab ? ' app--tabs' : ''} app--${screen}`}>
      {screen !== 'match' && (
        <header className="topbar" style={clubVars(state.club)}>
          <button type="button" className="topbar__crest" onClick={() => setScreen('club')} aria-label="Club details">
            <Crest colors={state.club.colors} short={state.club.short} size={30} id={state.club.id} />
          </button>
          <div className="topbar__club">
            <b>{state.club.name}</b>
            <span><LeagueLink divId={state.club.divisionId}>{state.club.division}</LeagueLink></span>
          </div>
          <i className="club-stripes" aria-hidden="true" />
          <div className="topbar__coins" aria-label="Coins"><span key={state.coins} className="coin-bump">◎ {state.coins.toLocaleString()}</span></div>
          <button type="button" className="icon-btn topbar__menu" onClick={() => setMenuOpen(true)} aria-label="Menu">☰</button>
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
          />
        )}
        {screen === 'squad' && <Squad state={state} setState={setState} />}
        {(screen === 'cards' || screen === 'shop') && (
          <CardsHub
            key={screen}
            state={state}
            initial={screen === 'shop' ? 'shop' : 'owned'}
            collectionProps={{ onOpenPack: (i) => setState((s) => openOwnedPack(s, i, randomSeed())), onUseCard: useCard }}
            shopProps={{
              onBuyPack: (id) => setState((s) => buyPack(s, id, randomSeed())),
              onBuyBoostPack: (id) => { const r = buyBoostPack(state, id, randomSeed()); setState(r.state); return r.got; },
              onBuyOffer: (uid) => setState((s) => buyMarketCard(s, uid)),
            }}
          />
        )}
        {screen === 'world' && <World state={state} />}
        {screen === 'league' && <League key={leagueNav?.k || 'league'} state={state} nav={leagueNav} />}
        {screen === 'team' && teamId && state.world.clubs[teamId] && <Team key={teamId} state={state} clubId={teamId} tab={detail.tab} onTab={setTab} onBack={goBack} onCurse={(id) => setState((s) => toggleCurse(s, id))} />}
        {screen === 'player' && detail.playerId && <Player key={detail.playerId} state={state} playerId={detail.playerId} fallbackName={detail.name} tab={detail.tab} onTab={setTab} onBack={goBack} />}
        {screen === 'manager' && detail.mkey && <Manager key={detail.mkey} state={state} mkey={detail.mkey} tab={detail.tab} onTab={setTab} onBack={goBack} />}
        {screen === 'club' && <ClubInfo state={state} onBack={() => setScreen('home')} />}
        {screen === 'career' && (
          <Career
            state={state}
            onBack={() => setScreen('home')}
            onLook={() => setState((s) => lookForOffers(s, randomSeed()))}
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
        {screen === 'match' && live && <Match initial={live.match} userSide={live.userSide} onFinish={finish} settings={settings} showTip={tip('match')} onTipSeen={() => seeTip('match')} />}
        {screen === 'result' && outcome && <Result {...outcome} onDone={() => setScreen('home')} />}
      </main>

      {isTab && (
        <nav className="tabbar" aria-label="Main">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={screen === t.id || (t.id === 'cards' && screen === 'shop') ? 'is-on' : ''} onClick={() => { if (t.id === 'league') setLeagueNav(null); backStack.current = []; resetSticky(); setScreen(t.id); }}>
              <span className="tabbar__icon" aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'cards' && (state.inventory.packs.length > 0 || state.phase === 'offseason') && <i className="tabbar__dot" />}
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
          onDiscardCommons={() => setState((s) => discardCommons(s))}
          reduceMotion={settings.reduceMotion}
        />
      )}

      {toast && <div className={`toast toast--${toast.tone}`} role="status">{toast.text}</div>}

      {isTab && tip(screen) && TIPS[screen] && <Tip text={TIPS[screen]} onClose={() => seeTip(screen)} />}
      {state.pendingOpen && screen !== 'match' && tip('opening') && <Tip text={TIPS.opening} onClose={() => seeTip('opening')} top />}

      {menuOpen && (
        <Sheet title="Menu" onClose={() => setMenuOpen(false)}>
          <div className="menu-sheet">
            <p className="hint">{state.gmName} · {state.club.name} · saved automatically in slot {slot}.</p>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => { setMenuOpen(false); setScreen('career'); }}>Career</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => { setMenuOpen(false); setScreen('club'); }}>Club, finances & trophies</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}>Settings</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => { setMenuOpen(false); setRulesOpen(true); }}>House rules</button>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => setState((s) => ({ ...s, seenTips: [] }))}>Show tips again</button>
            <button type="button" className="btn btn--primary btn--block" onClick={exit}>Save & exit to main menu</button>
          </div>
        </Sheet>
      )}
      {rulesOpen && (
        <Sheet title="House rules" onClose={() => setRulesOpen(false)}>
          <HouseRules state={state} onToggle={(id) => setState((s) => toggleCurse(s, id))} />
        </Sheet>
      )}
      {settingsOpen && <SettingsSheet settings={settings} setSettings={setSettings} onClose={() => setSettingsOpen(false)} />}
    </div>
    </NavContext.Provider>
  );
}
