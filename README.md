# Football Cards

A 7v7 football card game. You are the club's GM: collect player and coach cards, win matches, earn coins and climb from small leagues to the Club World Cup.

- **Design:** [`docs/CARD_GAME_DESIGN.md`](docs/CARD_GAME_DESIGN.md)
- **Old management-sim docs:** `docs/legacy/` (the old code lives in git history on `main`)

## Play it on your phone

1. In the GitHub repository: **Settings → Pages → Source: GitHub Actions** (one-time).
2. Merge to `main`: the `Deploy Vite site to GitHub Pages` workflow (`.github/workflows/deploy.yml`) tests, builds and publishes the game.
3. Open the Pages link on your phone, then **Add to Home Screen** (Safari share menu, or Chrome's ⋮ menu → Install app). It runs full-screen and works offline.

Careers are saved on the device (saves from before v2.3's six confederations show as "Older version — can't be continued" and can be deleted). Use **Back up** in the main menu to move a career between devices (download the file or copy the text, then **Restore** on the other device).

## Run it

```bash
npm install
npm run dev        # play in the browser
npm test           # engine tests
npm run balance    # simulate thousands of matches and print goal/win rates
npm run build      # static build in dist/
```

## What's playable

- **World:** 46 divisions of 10 clubs (460 real clubs) in six confederations (Europe, South America, North America, Africa, Asia, Oceania): the Big 4 with three tiers, France, Portugal, the Netherlands, Argentina, Brazil, Mexico and Japan with two, and single leagues from Belgium and Turkey to Chile, Egypt, North America Other (Costa Rica, Honduras, Guatemala, Canada) and Oceania (Australia, New Zealand). 18 matchdays a season; 2 up and 2 down between tiers. Every division plays each matchday. Browse any league's table, fixtures and scorers.
- **Season:** you start in Spain · Division 3 with Racing Santander. Win the league to go up (and earn bigger rewards), finish last to go down.
- **Competitions:** domestic cups, a **super cup** in every country on matchday 0 (league champion vs cup winner; England's Community Shield), a continental cup in each confederation (European, South American, North American, African, Asian, Oceania Cup), a **second continental trophy** for cup winners and the next-placed clubs (European, South American, North American, African, Asian Trophy), **continental super cups** and a six-club Club World Cup, all interleaved with league matchdays. Trophies pay prize money and reward packs. Formats: `docs/CARD_GAME_DESIGN.md` §3.3b–3.7.
- **Matches:** 6 blocks of 15 minutes with live commentary, subs, mentality, boosts (up to 3 per match) and **skills**: elite players and coaches each carry one, and you can fire 2 per match. Penalties in knockout games.
- **Tactics:** pressing, passing and defensive line, with counters (high press beats short passing, direct beats a high line…) and synergies with cards and coaches. Rivals' styles and skills are shown before kick-off.
- **Shop:** two sections. **Player:** Bronze, Silver, Gold, Elite and Coach packs (odds shown) and the Transfer Market. **Club:** club packs (Bronze 200: 1 card; Silver 600: keep 1 of 3; Gold 1,800: keep 1 of 3, Rare or better) and sealed boost packs. Play a boost in a match and you get a free random boost card afterwards.
- **Pack opening:**
  - Cards reveal one by one.
  - For each card you choose Keep (pick who it replaces in your 12), Merge a duplicate (+1★, +2 stats, +30 matches) or Discard for coins.
- **Cards tab:** Owned (Players: squad, coaches, player packs, transfer cards · Club: club packs, club cards, active effects, boosts · Season · Album) and Shop.
- **Club cards:** infrastructure cards raise one club area for good (rarity caps the level); temporary cards last a few games: High Season (home gate ×2), Viral Merchandise, Ticket Promo, Recovery Camp, Analyst Report (tactics grade one step better), or pay off at once: Sponsor Night, Team Building, Press Charm, Local Hero.
- **League tab:** every league by name, with table, fixtures, scorers, cups and **History**: champion, runner-up, top scorer, MVP and Golden Glove for every season, records by league, country or world, and your career season by season. Tap any club for its page (Overview, Squad, History with managers and transfers, Stats, Honours), any player for his profile (Overview, History club by club and season by season, Stats by competition) and any manager for his page.
- **World tab:** manager rankings (you against 400+ AI managers), most decorated clubs (real-life + in-game titles; all / league / cup / continental) and power ranking, world records, Hall of Fame.
- **Real history:** the game starts in **2027** (seasons are shown as years). Club pages list their real-life titles up to 2026 plus the ones won in the game ("Copa Libertadores ×2 (1989, 2016)"), every competition's History shows its real winners by year and then the game's, and the CEO welcomes you at every new club with the objective, the club's story and the football they want.
- **Season end and the off-season flow:** prize money, reward packs and a free management card, then six steps: **season review** (titles, record, best player, revenue, fan base), the **season card deal** (3 season cards, pick 1 for next season, redraw for ◎ 200 / 400 / 800), the **jersey** (renew or change kit maker, keep the line or a new design, then the season's shirt sales are revealed), the **sponsor** (renew for coins per win + a card, or switch for a signing bonus), **TV rights** (a fee plus coins per game, per home game or per international game) and the **CEO meeting** (last season's verdict, next season's objective).
- **Transfer Market, open all year:** transfer cards (random signings, youth, veterans, trainers, retraining…), each with a rarity that sets its strength. 5 offers each summer, 3 new ones every 5 league matchdays. Play cards (transfer and club) from the Cards tab any time, up to **8 card plays a season** (+1 at Analytics level 3 and 5).
- **Card wear:** players and coaches lose a match each time they play and retire at 0. Academy graduates start with their full career, pack players with 50–90% of it, signings with what they had left.

- **Squad:** 12 cards, a starting 7 and 5 reserves (3 subs a match). Rotating keeps the team's shape up.
- **Main menu:** 3 save slots, new career (your name, country and GM style, a GM card reveal, then one of three small-club job offers), back up / restore, settings (match speed, auto-play, reduced motion, tips).
- **GM card:** one permanent card from your GM style (12 cards, Common to Epic): Money Man, Dealmaker, Tactics Connoisseur, Game Reader, Fitness Freak, Iron Squad, Dressing-room Leader, Continuity, CEO's Friend, Fan Favourite, Coach Tamer, Media Darling.
- **GM career:** reputation, board objectives, owners and fans confidence, job offers, moving clubs with 2 cards, getting sacked (3 offers, a level lower if a top-flight club fires you).
- **Stadium and fans (v2.3):** the stadium has six parts (capacity, locker rooms, pitch, access & parking, floodlights, scoreboard & screens) and a 1–5 star rating; capacity is a real number of seats. Home crowds come from local fans × happiness × ticket price, capped by capacity; the gate is the crowd × a price per fan that grows with the stars. Fans (local and worldwide) grow with wins, derbies, trophies, promotion and star players, and with the fan cards (Local Event, Social Media Campaign, Fan Day, Stadium Tour, International Tour).
- **Club tab:** Overview (what the owners want, owners and fans, objective, contract, budget, this vs last season), Infrastructure (the stadium card with its stars, seats and parts, then the other club areas, levels 0–5; an infrastructure card starts **building works** that take 2 + the new level league matchdays, summer works are ready for matchday 1, one project per area), Fans (local and worldwide fans, happiness, attendance), Finance (ticket demand vs capacity, the kit, sponsor and TV deals, income per match by source, season money in/out, **season-by-season history**, **ticket prices** Low / Normal / High), **Jersey** (the shirt, maker, sponsor, shirt sales), Effects (temporary club cards in play) and Trophies.
- **Tabs:** Home, Squad, Club, Cards, Competitions, World.

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
| `src/engine/gmTraits.js` | GM styles and the 12 GM cards: values and the effect helpers |
| `src/data/seasonCards.js` | The season card deck, season-only cards, redraw costs |
| `src/data/skills.js` | Intrinsic skills for Rare+ players and coaches |
| `scripts/tactics-check.mjs` | Simulates every tactic against a neutral side |
| `scripts/smoke.cjs` | Clicks through every screen with a save and reports errors |
| `src/data/pool.js` | Original card pool (112 players, 16 coaches) |
| `src/data/world/` | World structure, the 5 region files (clubs + their named players) and the squads files (history pools; `squads-e/f.js` for the v1.9 clubs, written with `src/data/cardgen.js`) |
| `scripts/check-world.mjs` | Validates the world data |
| `src/data/history/` | Real-life winners by year for every league, cup, super cup and continental competition (to 2026) |
| `src/engine/titles.js` | Real + in-game titles: club honours, competition winners, most decorated |
| `src/engine/years.js` | Season numbers as calendar years (season 1 = 2027) |
| `scripts/check-history.mjs` | Validates the history data (`--counts`, `--club <id>`) |
| `scripts/check-nations.mjs` | Every named player/coach has a known nation (`src/data/nations.js`: code → name + flag) |
| `src/state/managers.js` | Managers book: every career you have played, ranked (main menu → Managers) |
| `src/data/offseason.js` | The 53 management card types: transfer (Transfer Market), club (infrastructure + temporary), season events, plus the season-only cards |
| `src/data/clubPacks.js` | Club packs: prices, odds, pick 1 of 3 |
| `src/data/facilities.js` | The ten club areas: levels, effects, card plays per season, build times, ticket prices |
| `src/state/business.js` | Building works, ticket prices, season finance history |
| `src/state/stadium.js` | Stadium parts, star rating, capacity, ticket demand and the gate |
| `src/state/fans.js` | Local and worldwide fans, growth, crowds, `fansOf(state)` (happiness = the fans' confidence) |
| `src/state/deals.js` | Kit, sponsor and TV deals: offers, signing, kick-off defaults, match income |
| `src/data/deals.js` | Deal numbers, brands, kit patterns, the off-season steps |
| `src/ui/Offseason.jsx` | The off-season flow (six steps) |
| `src/ui/Jersey.jsx` | The shirt drawing and kit summary |
| `src/data/` | Demo club, league clubs, boosts, coach passives |
| `src/ui/` | React screens and card components |
