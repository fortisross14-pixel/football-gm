# Football Cards

A 7v7 football card game. You are the club's GM: collect player and coach cards, win matches, earn coins and climb from small leagues to the Club World Cup.

- **Design:** [`docs/CARD_GAME_DESIGN.md`](docs/CARD_GAME_DESIGN.md)
- **Old management-sim docs:** `docs/legacy/` (the old code lives in git history on `main`)

## Play it on your phone

1. In the GitHub repository: **Settings → Pages → Source: GitHub Actions** (one-time).
2. Merge to `main`: the `Deploy Vite site to GitHub Pages` workflow (`.github/workflows/deploy.yml`) tests, builds and publishes the game.
3. Open the Pages link on your phone, then **Add to Home Screen** (Safari share menu, or Chrome's ⋮ menu → Install app). It runs full-screen and works offline.

Careers are saved on the device. Use **Back up** in the main menu to move a career between devices (download the file or copy the text, then **Restore** on the other device).

## Run it

```bash
npm install
npm run dev        # play in the browser
npm test           # engine tests
npm run balance    # simulate thousands of matches and print goal/win rates
npm run build      # static build in dist/
```

## What's playable

- **World:** 38 divisions and 304 real clubs across Europe, the Americas, Asia and Africa. Every division plays each matchday, and clubs go up and down between tiers at season end. Browse any league's table, fixtures and scorers.
- **Season:** you start in Spain · Division 3 with Racing Santander. Win the league to go up (and earn bigger rewards), finish last to go down.
- **Competitions:** domestic cups, the European / Americas / Africa–APAC Cups (qualify through your league) and the Club World Cup, all interleaved with league matchdays. Trophies pay prize money and reward packs.
- **Matches:** 6 blocks of 15 minutes with live commentary, subs, mentality, boosts (up to 3 per match) and **skills**: elite players and coaches each carry one, and you can fire 2 per match. Penalties in knockout games.
- **Tactics:** pressing, passing and defensive line, with counters (high press beats short passing, direct beats a high line…) and synergies with cards and coaches. Rivals' styles and skills are shown before kick-off.
- **Shop:** Bronze, Silver, Gold, Elite and Coach packs (odds shown), plus sealed boost packs. Play a boost in a match and you get a free random boost card afterwards.
- **Pack opening:**
  - Cards reveal one by one.
  - For each card you choose Keep (pick who it replaces in your 10), Merge a duplicate (+1★, +2 stats, +30 matches) or Discard for coins.
- **Cards tab:** Owned (squad, items, album) and Shop (packs, boosts, Transfer Market).
- **League tab:** every league by name, with table, fixtures, scorers, cups and **History**: champion, runner-up, top scorer, MVP and Golden Glove for every season, records by league, country or world, and your career season by season. Tap any club for its page (Overview, Squad, History with managers and transfers, Stats, Honours), any player for his profile (Overview, History club by club and season by season, Stats by competition) and any manager for his page.
- **World tab:** manager rankings (you against 300 AI managers), power ranking and most decorated clubs, world records, Hall of Fame.
- **Season end:** prize money, reward packs and a free management card.
- **Transfer Market, open all year:** 33 management card types (random signings, youth, club-area upgrades, sponsors, season events…), each with a rarity that sets its strength. 9 offers each summer, 6 new ones every 4 league matchdays. Play cards from Cards → Items any time, up to **8 card plays a season** (+1 at Analytics level 3 and 5).
- **Card wear:** players and coaches lose a match each time they play and retire at 0.

- **Main menu:** 3 save slots, new career (pick your name and one of three small-club job offers), back up / restore, settings (match speed, auto-play, reduced motion, tips).
- **GM career:** reputation, board objectives, owners and fans confidence, job offers, moving clubs with 2 cards, getting sacked (3 offers, a level lower if a top-flight club fires you).
- **Club management:** ten club areas, levels 0–5, each raised by its own card. Business: stadium, hospitality, club store, merchandise, sponsorship (income every match). Sports: training fields, gym, spa & recovery, youth academy, analytics. Plus income per match, finances, popularity and the trophy cabinet.

Progress is saved in the browser, automatically.

## Code map

| Path | What it is |
|---|---|
| `src/engine/match.js` | Match engine (pure functions, seeded randomness) |
| `src/engine/cards.js` | Rarities, traits, formations, overall rating |
| `src/engine/aiTeam.js` | Builds AI squads from a club rating + key players |
| `src/state/club.js` | Your club: rewards, packs, keep/merge/discard, season end, Transfer Market, saving |
| `src/engine/season.js` | Fixtures, table, scorers, simulating other games |
| `src/engine/competitions.js` | Cups, continental tournaments, Club World Cup, season calendar |
| `src/engine/transfers.js` | History pools, academies, AI signings, retirements |
| `src/engine/packs.js` | Pack odds, guarantees, duplicates |
| `src/engine/history.js` | Season archive, all-time records, club histories |
| `src/engine/careers.js` | Career log: every player's and manager's seasons, moves between clubs, club records |
| `src/engine/gms.js` | AI managers: reputation, sackings, rankings |
| `src/engine/career.js` | Board objective, reputation, owners/fans confidence, job offers |
| `src/data/skills.js` | Intrinsic skills for Rare+ players and coaches |
| `scripts/tactics-check.mjs` | Simulates every tactic against a neutral side |
| `scripts/smoke.cjs` | Clicks through every screen with a save and reports errors |
| `src/data/pool.js` | Original card pool (112 players, 16 coaches) |
| `src/data/world/` | World structure and the 4 region files (clubs + their named players) |
| `scripts/check-world.mjs` | Validates the world data |
| `scripts/check-nations.mjs` | Every named player/coach has a known nation (`src/data/nations.js`: code → name + flag) |
| `src/state/managers.js` | Managers book: every career you have played, ranked (main menu → Managers) |
| `src/data/offseason.js` | The 33 management card types (Transfer Market) |
| `src/data/facilities.js` | The ten club areas: levels, effects, card plays per season |
| `src/data/` | Demo club, league clubs, boosts, coach passives |
| `src/ui/` | React screens and card components |
