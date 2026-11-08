# Football Cards

A 7v7 football card game. You are the club's GM: collect player and coach cards, win matches, earn coins and climb from small leagues to the Club World Cup.

- **Design:** [`docs/CARD_GAME_DESIGN.md`](docs/CARD_GAME_DESIGN.md)
- **Old management-sim docs:** `docs/legacy/` (the old code lives in git history on `main`)

## Run it

```bash
npm install
npm run dev        # play in the browser
npm test           # engine tests
npm run balance    # simulate thousands of matches and print goal/win rates
npm run build      # static build in dist/
```

## What's playable

- **Season:** an 8-club league (14 matchdays) with a table, fixtures and a top-scorer list. You play your own matches, and the other games are simulated.
- **Matches:** 6 blocks of 15 minutes with live commentary, subs, mentality and boosts (up to 3 per match). Penalties in knockout games.
- **Shop:** Bronze, Silver, Gold, Elite and Coach packs (odds shown), plus boosts.
- **Pack opening:**
  - Cards reveal one by one.
  - For each card you choose Keep (pick who it replaces in your 10), Merge a duplicate (+1★, +2 stats, +30 matches) or Discard for coins.
- **Cards tab:** your squad, items (unopened packs, off-season cards, boosts), a card album with completion %, and the Hall of Fame.
- **Season end:** prize money, reward packs and a free off-season card. Then the **Transfer Market** opens with 25 off-season card types (poach rivals' players, free agents, youth, stadium upgrades, season events…), each with a rarity that sets its strength.
- **Card wear:** players and coaches lose a match each time they play and retire at 0.

Progress is saved in the browser.

## Code map

| Path | What it is |
|---|---|
| `src/engine/match.js` | Match engine (pure functions, seeded randomness) |
| `src/engine/cards.js` | Rarities, traits, formations, overall rating |
| `src/engine/aiTeam.js` | Builds AI squads from a club rating + key players |
| `src/state/club.js` | Your club: rewards, packs, keep/merge/discard, season end, Transfer Market, saving |
| `src/engine/season.js` | Fixtures, table, scorers, simulating other games |
| `src/engine/packs.js` | Pack odds, guarantees, duplicates |
| `src/data/pool.js` | Card pool: 112 players, 16 coaches |
| `src/data/offseason.js` | The 25 off-season card types |
| `src/data/` | Demo club, league clubs, boosts, coach passives |
| `src/ui/` | React screens and card components |
