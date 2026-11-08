# Football Cards — Game Design Document (v1.1 draft)

> Replaces the old management-sim design (`GAME_DESIGN_DOCUMENT.md`), which is kept for reference only.
> Language: English. Platform: web (React + Vite), mobile-first.

**Changes in v1.1**
- "Other" divisions are now the top 8 clubs from countries without their own league.
- Greece replaces Belgium as one of the 4 named European leagues.
- The GM card is removed. **You are the GM:** you get job offers, switch clubs and take 2 cards with you.
- Coaches retire on a match count, like players.
- Added a domestic cup and a season-ending Club World Cup.

---

## 1. Pitch

A **7v7 football card game**. You are the club's GM. You build the squad from collectible cards (players, coaches, boosts, upgrades and events), win matches, earn coins and open packs. Your results earn you job offers from bigger clubs around the world.

**Design pillars**
1. **Simple to read:** a card has a handful of numbers. A match takes about 2 minutes.
2. **Rewarding:** every match pays out, every pack is a decision, every trophy is remembered.
3. **Meaningful choices:** only 10 player slots, cards that retire, consumables that cost money, and only 2 cards that follow you to a new club.
4. **A living world:** real clubs, real players, promotion and relegation, cups, continental nights, and a permanent history.

---

## 2. Core loop

```
Play match ─► earn coins (result + gate + merch)
     ▲                 │
     │                 ▼
 set lineup ◄── buy packs / boosts / infrastructure
     ▲                 │
     │                 ▼
 season ends ─► prizes, promotion/relegation, retirements,
                job offers, play 1 event card
```

- **Per match:** pick the lineup, choose up to 3 boosts to bring, play, collect rewards.
- **Per season:** 14 league matches, up to 4 cup matches, up to 6 continental matches and up to 3 Club World Cup matches.
- **Long term:** build a GM career across clubs, replace retiring stars, fill the trophy cabinet and the Hall of Fame.

---

## 3. The world

### 3.1 Leagues

Every division has **8 clubs** and plays a double round-robin: **14 matchdays**.

| Group | Countries | Divisions | Clubs |
|---|---|---|---|
| Big 4 | England, Spain, Italy, Germany | 3 each | 96 |
| Major | France, Portugal, Netherlands, Argentina, Brazil | 2 each | 80 |
| Single-division | Turkey, Scotland, Austria, Greece, Europe Other, Mexico, USA, Colombia, South America Other, Japan, Asia Other, Saudi Arabia, Nigeria, Egypt, Africa Other, APAC Other | 1 each | 128 |
| **Total** | | **38 divisions** | **304 clubs** |

**"Other" divisions** take the **top 8 clubs from countries that don't have their own division**:

| Division | Pool (examples) |
|---|---|
| Europe Other | Belgium, Switzerland, Denmark, Russia, Ukraine, Czechia, Croatia, Serbia, Norway, Sweden… |
| South America Other | Uruguay, Chile, Paraguay, Ecuador, Peru, Bolivia… |
| Asia Other | West and Central Asia: Qatar, UAE, Iran, Uzbekistan… |
| APAC Other | East Asia and Oceania: South Korea, China, Australia, Thailand… |
| Africa Other | Morocco, Tunisia, Algeria, South Africa… |

The top 8 clubs are picked by rating, so a country can have several clubs or none. Division names are generic ("England — Division 1"), not real competition brands.

**Promotion/relegation:** 1 up and 1 down between adjacent divisions in the same country. Single-division leagues have none.

### 3.2 Strength levels (AI difficulty and reward multiplier)

| Level | Divisions | AI team OVR | Reward multiplier |
|---|---|---|---|
| L1 | Big 4 Division 1 | 78–86 | ×3.0 |
| L2 | Big 4 Division 2; Major Division 1; strongest single-division leagues (e.g. Turkey, Saudi Arabia, Mexico) | 70–78 | ×2.0 |
| L3 | Big 4 Division 3; Major Division 2; other single-division leagues | 60–70 | ×1.0 |

**Strategy hook:** a small single-division league is easy to win and its champion goes straight to the continental tournament, but it pays less. A Big 4 Division 3 club pays the same but has to climb two divisions before it can reach Europe's top table.

### 3.3 Domestic cup

Each cup is a quick **single-match knockout**. One loss and you're out.

| Country type | Who plays | Size | Rounds |
|---|---|---|---|
| Single-division leagues (including "Other" divisions) | Division 1 | 8 clubs | QF → SF → Final (3) |
| Major and Big 4 | Division 1 + Division 2 | 16 clubs | R16 → QF → SF → Final (4) |

- Big 4 Division 3 clubs don't play the cup.
- The draw is random, and the lower-division club plays at home. That gives giant-killing chances.

### 3.4 Continental tournaments

Clubs qualify through **last season's** league results. For season 1, the seeded "previous champions" come from the data files.

**Europe (8 teams)**
- Direct: champions of England, Spain, Italy and Germany (4).
- Qualifying round: the other 8 European champions play 4 single-match ties, and the 4 winners go through. They are France, Portugal, Netherlands, Turkey, Scotland, Austria, Greece and Europe Other.

**Americas (8 teams)**
- Champions of Argentina, Brazil, Mexico, USA, Colombia and South America Other (6), plus the runners-up of Argentina and Brazil (2).

**Africa–APAC (8 teams)**
- Champions of Japan, Asia Other, APAC Other, Saudi Arabia, Nigeria, Egypt and Africa Other (7), plus the best runner-up by points (1).

**Format (all three):** 2 groups of 4 (single round-robin, 3 matches) → semi-finals → final. That's up to 5 matches, plus 1 for European qualifiers.

### 3.5 Club World Cup (every season, at the end)

- The **3 continental champions** of that season.
- Single round-robin (each team plays 2), then the **top 2 play the final**. That's up to 3 matches.
- Played at a neutral venue: no home bonus, and Fortress Season doesn't apply.

### 3.6 Season calendar

| Phase | Events |
|---|---|
| Pre-season | Play 1 event card, shop |
| Weeks 1–2 | League MD 1–2 · Europe qualifying |
| Weeks 3–4 | League MD 3–4 · Continental group game 1 · Cup R16 (16-club cups) |
| Weeks 5–6 | League MD 5–6 · Continental group game 2 · Cup QF |
| Weeks 7–8 | League MD 7–8 · Continental group game 3 |
| Weeks 9–10 | League MD 9–10 · Cup SF · Continental SF |
| Weeks 11–14 | League MD 11–14 · Cup final (after MD 12) |
| Finals week | Continental finals |
| Club World Cup | 3 continental champions |
| Season end | Prizes, promotion/relegation, retirements, board review, **job offers** |

- At most **27 matches** per season (14 + 4 + 6 + 3), and a typical club plays 16–20.
- All AI-vs-AI matches are simulated instantly from team ratings.

---

## 4. Cards

### 4.1 Card families and ownership rules

| Family | How you get it | What happens when used | Ownership limit |
|---|---|---|---|
| **Players** | Player packs | Plays matches until it retires | **10** (7 starters + 3 bench) |
| **Coaches** | Coach packs | Head coach + assistant, retire like players | **2** |
| **In-game boosts** | Shop | Used during a match, then gone | Unlimited |
| **Infrastructure** | Shop | Raises a facility at your current club by 1 level, then gone | Unlimited |
| **Events** | Shop (offseason rotating offer) | Played in the offseason, lasts 1 season, then gone | Unlimited (1 played per season) |

**Pack opening:** for each player or coach card you choose **Keep** or **Discard**. Keeping one when your slots are full means releasing an owned card. Discarded or released cards give quick-sell coins.

### 4.2 Player cards

```
┌─────────────────────────┐
│ EPIC             MID  81│
│      [silhouette in     │
│       club colours]     │
│   PEDRI                 │
│   ATT 82  DEF 74  PHY 79│
│   Trait: Playmaker      │
│   Matches left: 142     │
└─────────────────────────┘
```

- **Position:** GK, DEF, MID or FWD.
- **3 stats:** ATT, DEF, PHY (stamina). OVR is a position-weighted average.
- **1 trait,** for example:
  - Clutch: +15% ATT after 75'.
  - Engine: stamina drains 50% slower.
  - Wall: +10% team DEF.
  - Poacher: +conversion.
  - Playmaker: teammates create more chances.
  - Leader: +cohesion gain.
  - Big Game: +10% in continental and Club World Cup matches.
- **Matches left:** goes down by 1 each match the player takes part in (starts or comes on). Unused bench players don't lose matches, which rewards rotation. At 0 the player **retires**.
- **Popularity:** set by rarity and grows with goals, awards and trophies. It drives merchandise income.
- **Duplicates:** keeping a copy of a card you own merges it: +1 star (+2 to every stat, max 3 stars) and +30 matches.

| Rarity | Frame | OVR range | Matches | Base popularity | Quick sell |
|---|---|---|---|---|---|
| Academy (generic) | Plain | 45–55 | Unlimited | 0 | 0 |
| Common | Grey | 55–64 | 140–200 | 1 | 10 |
| Rare | Blue | 65–73 | 120–180 | 3 | 40 |
| Epic | Purple | 74–82 | 110–160 | 8 | 120 |
| Legendary | Gold | 83–92 | 100–140 | 20 | 400 |

Older stars tend toward the low end of the match range, young players toward the high end.

**Retirement:** a retiring card moves to the **Hall of Fame** with its full career stats. Its slot is filled by a generic Academy player until you add a new card.

### 4.3 Coach cards (head coach + assistant)

- **Head coach:** sets the **formation** (2-3-1, 3-2-1, 2-2-2, 3-1-2) and one **passive**. Examples:
  - Counter-Attack Master: +20% chance quality when trailing.
  - Motivator: +10% stats in the second half.
  - Tactician: +1 boost slot per match.
  - Cup Specialist: +10% in cup matches.
- **Assistant:** gives its own passive at **50% strength**. When the head coach retires, the assistant is promoted automatically if you have no replacement.
- **Retirement:** same rule as players. Both coaches lose 1 match for every match the team plays. Rarity sets the match range (Common 140–200 … Legendary 100–140).
- **No coach:** if you have no coach card, a generic coach takes over with a 2-2-2 formation and no passive.

### 4.4 In-game boosts (consumable)

You bring up to **3 boosts** per match (4 with the *Tactician* coach). You can play them at any decision point (see §5).

| Boost | Effect | Price |
|---|---|---|
| Golden Chance | Pick a player: a big chance for them in the next segment, converted with their ATT | 80 |
| Second Wind | Restore 40% stamina to the whole team | 60 |
| Iron Wall | +25% team DEF for one segment | 50 |
| All-Out Attack | +30% ATT, −20% DEF for one segment | 50 |
| Captain's Speech | If losing: +10% all stats for the rest of the match | 100 |
| Set-Piece Special | One free set-piece chance | 40 |
| Super Sub | The next substitute comes on with +15% stats | 70 |
| Game Management | If leading in the last segment: opponent chances −40% | 60 |

### 4.5 Infrastructure (consumable → permanent level at the club)

Facility levels **belong to the club**, not to you. If you leave, the levels stay behind. Each card raises a facility by 1 level, up to level 5, and gets more expensive per level.

| Facility | Effect per level | Price L1→L5 |
|---|---|---|
| **Stadium Expansion** | Base home-game income: 40 / 70 / 110 / 160 / 230 / 320 (L0–L5) × division multiplier | 300 / 700 / 1500 / 3000 / 6000 |
| **Merchandise Expansion** | Merch multiplier ×0.5 / 1 / 1.5 / 2 / 2.5 / 3 on squad popularity | 250 / 600 / 1300 / 2600 / 5000 |
| **Training Ground** | Cohesion gain per match +2 / 3 / 4 / 5 / 6 / 7, max cohesion bonus 4 / 5 / 6 / 7 / 8 / 10% | 300 / 700 / 1500 / 3000 / 6000 |
| *(optional)* Youth Academy | Generic replacements get better (OVR cap 55 → 64), and Golden Generation is stronger | 400 / 900 / 1800 / 3500 / 7000 |

Clubs start with levels that match their size: L3 clubs around 1/0/1, L2 around 2/2/2, L1 around 4/4/3.

**Cohesion (0–100):** goes up each match with an unchanged starting 7. Each new starter costs −10. At 100 cohesion the team gets the full bonus from the Training Ground level.

### 4.6 Events (offseason, one season long)

| Event | Effect | Price |
|---|---|---|
| Golden Generation | Your academy produces 2 Rare-or-better youth players (fictional names, 180+ matches) | 1500 |
| Fortress Season | Home bonus goes from +5% to +12% all season | 800 |
| Indomitable Spirit | When losing after 70': +15% all stats | 900 |
| Marketing Tour | Merch income ×1.5 this season | 700 |
| Scouting Network | Better pack odds this season | 1000 |
| Fountain of Youth | +40 matches to one player or coach | 600 |
| Tactical Continuity | Cohesion can't drop below 60 this season | 700 |
| Continental Nights | +10% stats in continental and Club World Cup matches | 900 |
| Cup Run | +10% stats in cup matches, and cup prizes ×2 | 600 |

The shop offers **3 random events** each offseason. You play **1** per season. Unused events stay in your inventory.

---

## 5. The match

### 5.1 Structure

- 90 minutes in **6 segments of 15'**.
- **Decision points:** before kickoff and at every segment break. **Fast mode** skips straight through when you don't act, which suits phone play.
- **Free actions:** substitutions (max 3, from the bench), mentality (Defensive / Balanced / Attacking).
- **Paid actions:** boosts you brought into the match.
- **Draws in knockout games** (cup, qualifying, semi-finals, finals) go to a penalty shootout. It's decided by ATT against the GK's DEF, shown kick by kick.

### 5.2 Resolution (per segment)

1. **Midfield control:** MID ratings decide each side's share of chances.
2. **Chances:** about 1.2 per segment in total, split by control, adjusted by mentality.
3. **Chance quality:** your attack (FWD ATT ×1.0 + MID ATT ×0.6 + DEF ATT ×0.2) against their defense (DEF DEF ×1.0 + MID DEF ×0.5).
4. **Finishing:** the shooter is weighted by ATT and position. Conversion is the shooter's ATT against the GK's DEF.
5. **Fatigue:** stamina drains each segment, reduced by PHY. Effective stats = base × (0.75 + 0.25 × stamina%).
6. **Modifiers stack:** home (+5%), cohesion, coach, assistant, traits, active event, boosts.

Target: **3–4 goals per match on average** (7v7 is high-scoring), with roughly 1 in 6 matches won by a team that was losing at 70'.

### 5.3 Presentation

- A top-down 7v7 pitch with player tokens.
- Short commentary lines for each segment ("38' — Pedri threads it through… GOAL!").
- Big scoreline, momentum bar, stamina bars.
- Man of the match at full time, then a reward screen with coins counting up.

---

## 6. Economy

**Currency:** coins, held in the **club's treasury**. There are **no wages and no running costs**. Everything you spend is a choice.

### 6.1 Income

| Source | Amount |
|---|---|
| League win / draw / loss | 100 / 40 / 15 × division multiplier |
| Bonuses | Clean sheet +20, 3+ goals +20 (× multiplier) |
| Home game | Stadium income (§4.5) |
| Merch (every matchday) | Sum of squad popularity × merch multiplier × 2 |
| League prizes | Champion 1000, 2nd 600, promotion 500 (× multiplier) |
| Domestic cup | Each win 150, winner +600 (× multiplier) |
| Continental | Qualifying 300, each win 300, final 1000, champion 3000 |
| Club World Cup | Each win 500, champion 5000 |

Rough check: a Level 3 club earns **about 1,800–2,500 coins per season** at the start. That's around 4 Silver packs, or a mix of infrastructure and boosts. Exact numbers get tuned in a balancing pass.

### 6.2 Packs

| Pack | Price | Cards | Guarantee | Odds (C / R / E / L) |
|---|---|---|---|---|
| Bronze | 150 | 3 players | — | 80 / 18 / 2 / 0 |
| Silver | 500 | 3 players | 1 Rare or better | 55 / 35 / 9 / 1 |
| Gold | 1500 | 3 players | 1 Epic or better | 25 / 45 / 25 / 5 |
| Elite | 4000 | 3 players | 1 Epic or better, 25% Legendary | 10 / 35 / 35 / 20 |
| Coach | 600 | 2 coaches | 1 Rare or better | 40 / 40 / 17 / 3 |

**Free packs** as rewards:

| Achievement | Reward |
|---|---|
| Promotion | Silver |
| Cup winner | Silver |
| League title | Gold |
| Continental title | Elite |
| Club World Cup | 2 × Elite |

---

## 7. GM career (you)

### 7.1 Reputation

Your GM reputation runs from **0 to 100** and decides which clubs want you.

| Season outcome | Reputation change |
|---|---|
| Board objective met / exceeded | +10 / +15 |
| Board objective missed | −10 |
| Promotion | +8 |
| Cup winner | +5 |
| League title | +10 |
| Continental title | +15 |
| Club World Cup | +20 |

### 7.2 Board objective

Each pre-season, the club sets one objective based on its level and squad strength, for example "Avoid relegation", "Top 3", "Win the league", "Reach the continental semi-finals". It's shown on the Home screen with a progress indicator.

### 7.3 Job offers

- At season end you get **0–3 offers** from clubs whose required reputation is at or below yours. There's a small chance of a stretch offer just above it.
- Required reputation: **L3 clubs 0–30, L2 clubs 30–60, L1 clubs 60–100.** Bigger clubs within a level need more.
- **Stretch goal:** a big club approaches you mid-season after a hot streak.
- You can accept an offer or stay where you are.

### 7.4 Switching clubs: "take 2 cards"

When you accept an offer, you choose **any 2 cards** to bring. They can be from any family: a star player, your head coach, an Elite pack you haven't opened, an event, boosts.

**Everything else stays with your old club:** other players, coaches, inventory, coins and facility levels. The old club goes back to AI control.

At the new club you get its **club squad**: 10 cards from that club's real roster at a rarity matching its level, plus a coach and its treasury.

| New club level | Squad | Coach | Treasury |
|---|---|---|---|
| L3 | 7 Common, 1 Rare, 2 Academy | Common | 500 |
| L2 | 5 Common, 4 Rare, 1 Epic | Rare | 1500 |
| L1 | 4 Rare, 5 Epic, 1 Legendary | Epic | 4000 |

Your 2 carried cards replace squad cards of your choice. Cards that move with you keep their matches left, stars and stats.

### 7.5 Getting sacked

- If you **miss the board objective 2 seasons in a row**, you're fired, and reputation drops by 15.
- You must accept one of at least 2 offers from lower clubs. You still take 2 cards with you.

### 7.6 Starting a career

- A rookie GM starts with reputation **10** and picks from **3 offers from L3 clubs**.
- That club's squad is your starting squad, and you also get a free **Starter Pack** (3 players, 1 guaranteed Rare).
- **Stretch goal:** a "Sandbox" mode where you start at any club.

---

## 8. Stats and history (kept forever)

**Per player card:** appearances, goals, assists, clean sheets (GK/DEF), man of the match awards, average rating, trophies. Broken down per season, per club and over the whole career.

**Per coach card:** matches, W/D/L, trophies.

**Per club (all 304):** each season's position, W/D/L, goals for and against, cup run, continental run, trophies.

**Per competition (league, cup, continental, Club World Cup):** champion and runner-up by season, top scorer, best player, biggest win, records.

**GM career:** clubs managed, seasons at each, win %, trophies, reputation over time, board objectives met.

**Your trophy room:**
- Trophy cabinet and season-by-season timeline.
- **Hall of Fame:** retired cards with their career numbers.
- Records: most goals in a season, longest unbeaten run, biggest comeback.

**AI teams** are a team rating plus **3 named key players**. Their goals go to those players, so top-scorer tables mix your cards and AI stars. When you own a player's card, that player is removed from AI rosters and replaced by a generic name, so nobody scores for two clubs.

---

## 9. Screens (mobile-first)

1. **Home:** next fixture, coins, board objective, quick "Play" button, latest news and achievements.
2. **Squad:** pitch view with 7 starters, 3 bench, head coach and assistant. Drag to swap. Cohesion meter.
3. **Inventory:** boosts, infrastructure, events and unopened packs, each with a "Use" button.
4. **Shop:** packs, boosts, infrastructure, event offers. Pack opening with a rarity reveal and Keep/Discard.
5. **Match:** pitch, commentary, decision drawer with subs, mentality and boosts. Penalty shootout view.
6. **Competitions:** league table, fixtures, top scorers, cup bracket, continental groups and bracket, Club World Cup.
7. **Career:** reputation, board objective, job offers, "take 2 cards" picker, GM history.
8. **History:** club timeline, trophy cabinet, Hall of Fame, world records, past winners.
9. **Club:** facility levels and income breakdown.

**Visual direction**
- Dark pitch-green UI with bright rarity frames: grey, blue, purple, gold.
- Big type and cards as the main element.
- No real photos or crests. Players are stylised silhouettes in club colours, and crests are generated shapes with club colours and initials.

---

## 10. Data and real names

- All world data lives in editable JSON files: `data/leagues.json`, `data/clubs.json`, `data/cards/players-*.json`, `data/cards/coaches.json`.
- "Other" divisions are built by taking the top 8 clubs by rating from the pool countries listed in §3.1.
- Real club names, player names and coach names are used for a **personal/non-commercial** build.
- **Caveat:** publishing or making money from real names needs licences (player unions/FIFPRO, clubs' trademarks). Keeping all names in data files lets us swap in a fictional data pack without code changes.
- Rosters are a snapshot. Real-world transfers will make them go stale, and they need a periodic data refresh.
- Launch content: 304 clubs (name, country, colours, rating, 3 key players, a roster to build club squads from), about **500 player cards** and about **50 coaches**.

---

## 11. Tech plan

- **Fresh game code** in this repo. The old management-sim screens and engine (sponsors, merch, tickets, transfers) don't carry over. Keep the React + Vite setup and adapt `storage.js` for save slots.
- **Modules:**
  - `engine/match.js`: segment sim and penalties.
  - `engine/season.js`: fixtures, AI sim, promotion/relegation.
  - `engine/competitions.js`: cups, continental, Club World Cup.
  - `engine/career.js`: reputation, objectives, offers, switching clubs.
  - `engine/economy.js`, `engine/packs.js`, `engine/stats.js`, `state/` (save/load), `ui/`.
- The game logic is pure functions with seeded randomness, so balance can be tested headlessly by simulating thousands of seasons in a script.

### Milestones

| # | Milestone | Done when |
|---|---|---|
| M1 | Core match + squad | You can play a 7v7 match with cards, subs, boosts, commentary and penalties |
| M2 | One league season | 8-team league, fixtures, table, coins, Bronze/Silver packs, Keep/Discard |
| M3 | Full world | 38 divisions, AI simulation, promotion/relegation, retirements |
| M4 | Competitions | Domestic cups, 3 continental tournaments with Europe qualifying, Club World Cup, full calendar |
| M5 | All card families | Coach packs, infrastructure, events, cohesion, popularity/merch |
| M6 | GM career | Reputation, board objectives, offers, "take 2 cards", sacking |
| M7 | History and stats | Full stat tracking, Hall of Fame, records |
| M8 | Data and polish | Real data pass, visuals, animations, balance sweep |

---

## 12. Open questions

1. **Coins when switching clubs:** coins currently stay with the old club's treasury. Should part of them come with you, or is "2 cards" the whole package?
2. **Cup format:** this draft uses single-match knockout (3 or 4 rounds). Is that what "one game" meant, or do you want a round-robin? A 16-club round-robin would be 15 extra matches.
3. **Sacking:** keep the "2 missed objectives in a row" rule, or make jobs safe?
4. **Division size:** 8 clubs (14 league matches) is assumed. Is that confirmed?
