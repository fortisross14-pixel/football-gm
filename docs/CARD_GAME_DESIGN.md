# Football Cards — Game Design Document (v1.0 draft)

> Replaces the old management-sim design (`GAME_DESIGN_DOCUMENT.md`), which is kept for reference only.
> Language: English. Platform: web (React + Vite), mobile-first.

---

## 1. Pitch

A **7v7 football card game**. You run one real club and build its squad from collectible cards: players, coaches, a GM, and the boosts, upgrades and events that shape a season. Win matches, earn coins, open packs, climb through divisions, and win your continent.

**Design pillars**
1. **Simple to read:** a card has a handful of numbers. A match takes about 2 minutes.
2. **Rewarding:** every match pays out, every pack is a decision, every trophy is remembered.
3. **Meaningful choices:** only 10 player slots, cards that retire, consumables that cost money.
4. **A living world:** real clubs, real players, promotion and relegation, continental nights, and a permanent history.

---

## 2. Core loop

```
Play match ─► earn coins (result + gate + merch)
     ▲                 │
     │                 ▼
 set lineup ◄── buy packs / boosts / infrastructure
     ▲                 │
     │                 ▼
 season ends ─► prizes, promotion/relegation, retirements, play 1 event card
```

- **Per match:** pick the lineup, choose up to 3 boosts to bring, play, collect rewards.
- **Per season:** about 14 league matches plus up to 6 continental matches. Ends with prizes, promotion and relegation, and an offseason event.
- **Long term:** build a dynasty, replace retiring stars, fill the trophy cabinet and the Hall of Fame.

---

## 3. The world

### 3.1 Leagues

Every division has **8 clubs** and plays a double round-robin: **14 matchdays**.

| Group | Countries | Divisions | Clubs |
|---|---|---|---|
| Big 4 | England, Spain, Italy, Germany | 3 each | 96 |
| Major | France, Portugal, Netherlands, Argentina, Brazil | 2 each | 80 |
| Single-division | 4 named European countries, Europe Other, Mexico, USA, Colombia, South America Other, Japan, Asia Other, Nigeria, Egypt, Saudi Arabia, Africa Other, APAC Other | 1 each | 128 |
| **Total** | | **38 divisions** | **304 clubs** |

- Division names are generic ("England — Division 1"), not real competition brands.
- "Other" leagues mix clubs from several countries (for example, South America Other = Uruguay, Chile, Paraguay, Ecuador, Peru).
- **Promotion/relegation:** 1 up and 1 down between adjacent divisions in the same country. Single-division leagues have none.

### 3.2 Strength levels (AI difficulty and reward multiplier)

| Level | Divisions | AI team OVR | Reward multiplier |
|---|---|---|---|
| L1 | Big 4 Division 1 | 78–86 | ×3.0 |
| L2 | Big 4 Division 2; Major Division 1; strongest single-division leagues (e.g. Saudi Arabia, Mexico) | 70–78 | ×2.0 |
| L3 | Big 4 Division 3; Major Division 2; other single-division leagues | 60–70 | ×1.0 |

**Strategy hook:** a small single-division league is easy to win and its champion goes straight to the continental tournament, but it pays less. A Big 4 Division 3 club pays the same but has to climb two divisions before it can reach Europe's top table.

### 3.3 Continental tournaments

Clubs qualify through **last season's** league results. For season 1, the seeded "previous champions" come from the data files.

**Europe (8 teams)**
- Direct: champions of England, Spain, Italy and Germany (4).
- Qualifying round: the other 8 European champions (France, Portugal, Netherlands, the 4 European countries and Europe Other) play 4 single-match ties. The 4 winners go through.

**Americas (8 teams)**
- Champions of Argentina, Brazil, Mexico, USA, Colombia and South America Other (6), plus the runners-up of Argentina and Brazil (2).

**Africa–APAC (8 teams)**
- Champions of Japan, Asia Other, Nigeria, Egypt, Saudi Arabia, Africa Other and APAC Other (7), plus the best runner-up by points (1).

**Format (all three):** 2 groups of 4 (single round-robin, 3 matches) → semi-finals → final. That's up to 5 matches, plus 1 for European qualifiers.

**Stretch goal:** a "World Club Final" mini-tournament between the 3 continental champions after the season.

### 3.4 Season calendar

| Week | Event |
|---|---|
| Pre-season | Play 1 event card, shop |
| MD 1–2 | League |
| — | Europe qualifying round |
| MD 3–4 | League · Continental group game 1 |
| MD 5–6 | League · Continental group game 2 |
| MD 7–8 | League · Continental group game 3 |
| MD 9–11 | League · Continental semi-final |
| MD 12–14 | League |
| Final week | Continental finals, season prizes, promotion/relegation, retirements |

All AI-vs-AI matches are simulated instantly from team ratings.

---

## 4. Cards

### 4.1 Card families and ownership rules

| Family | How you get it | What happens when used | Ownership limit |
|---|---|---|---|
| **Players** | Player packs | Plays matches until it retires | **10** (7 starters + 3 bench) |
| **Coaches** | Staff packs | Head coach and assistant | **2** |
| **GM** | Staff packs | Club-wide economy passive | **1** |
| **In-game boosts** | Shop | Used during a match, then gone | Unlimited |
| **Infrastructure** | Shop | Raises a facility by 1 level, then gone | Unlimited |
| **Events** | Shop (offseason rotating offer) | Played in the offseason, lasts 1 season, then gone | Unlimited (1 played per season) |

**Pack opening:** for each player or staff card you choose **Keep** or **Discard**. Keeping one when your slots are full means releasing an owned card. Discarded or released cards give quick-sell coins.

### 4.2 Player cards

```
┌────────────────────────┐
│ EPIC            MID  81│
│      [silhouette in    │
│       club colours]    │
│   PEDRI                │
│   ATT 82  DEF 74  PHY 79│
│   Trait: Playmaker     │
│   Matches left: 142    │
└────────────────────────┘
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
  - Big Game: +10% in continental matches.
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

**Retirement:** a retiring card moves to the club's **Hall of Fame** with its full career stats. Its slot is filled by a generic Academy player until you add a new card.

### 4.3 Coach and assistant

- **Head coach:** sets the **formation** (2-3-1, 3-2-1, 2-2-2, 3-1-2) and one **passive** (e.g. "Counter-Attack Master": +20% chance quality when trailing; "Motivator": +10% stats in the second half).
- **Assistant:** gives its own passive at **50% strength**. When the head coach leaves, the assistant can be promoted.
- Coaches also have matches left, around 300–400 for long careers.

### 4.4 GM

One passive for the whole club. Examples:
- **Commercial Mind:** +20% merch income.
- **Scout:** better pack odds.
- **Negotiator:** shop prices −10%.
- **Tactician:** +1 boost slot per match.

### 4.5 In-game boosts (consumable)

You bring up to **3 boosts** per match (4 with some GMs). You can play them at any decision point (see §5).

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

### 4.6 Infrastructure (consumable → permanent level)

Each card raises the facility by 1 level, up to level 5. Price goes up with each level.

| Facility | Effect per level | Price L1→L5 |
|---|---|---|
| **Stadium Expansion** | Base home-game income: 40 / 70 / 110 / 160 / 230 / 320 (L0–L5) × division multiplier | 300 / 700 / 1500 / 3000 / 6000 |
| **Merchandise Expansion** | Merch multiplier ×0.5 / 1 / 1.5 / 2 / 2.5 / 3 on squad popularity | 250 / 600 / 1300 / 2600 / 5000 |
| **Training Ground** | Cohesion gain per match +2 / 3 / 4 / 5 / 6 / 7, max cohesion bonus 4 / 5 / 6 / 7 / 8 / 10% | 300 / 700 / 1500 / 3000 / 6000 |
| *(optional)* Youth Academy | Generic replacements get better (OVR cap 55 → 64), and Golden Generation is stronger | 400 / 900 / 1800 / 3500 / 7000 |

**Cohesion (0–100):** goes up each match with an unchanged starting 7. Each new starter costs −10. At 100 cohesion the team gets the full bonus from the Training Ground level. This is the price of swapping cards constantly.

### 4.7 Events (offseason, one season long)

| Event | Effect | Price |
|---|---|---|
| Golden Generation | Your academy produces 2 Rare-or-better youth players (fictional names, 180+ matches) | 1500 |
| Fortress Season | Home bonus goes from +5% to +12% all season | 800 |
| Indomitable Spirit | When losing after 70': +15% all stats | 900 |
| Marketing Tour | Merch income ×1.5 this season | 700 |
| Scouting Network | Better pack odds this season | 1000 |
| Fountain of Youth | +40 matches to one player | 600 |
| Tactical Continuity | Cohesion can't drop below 60 this season | 700 |
| Continental Nights | +10% stats in continental matches | 900 |

The shop offers **3 random events** each offseason. You play **1** per season (2 with some GMs). Unused events stay in your inventory.

---

## 5. The match

### 5.1 Structure

- 90 minutes in **6 segments of 15'**.
- **Decision points:** before kickoff and at every segment break. **Fast mode** skips straight through when you don't act, which suits phone play.
- **Free actions:** substitutions (max 3, from the bench), mentality (Defensive / Balanced / Attacking).
- **Paid actions:** boosts you brought into the match.

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

**Currency:** coins. There are **no wages and no running costs**. Everything you spend is a choice.

### 6.1 Income (× division multiplier)

| Source | Amount |
|---|---|
| Win / draw / loss | 100 / 40 / 15 |
| Bonuses | Clean sheet +20, 3+ goals +20 |
| Home game | Stadium income (§4.6) |
| Merch (every matchday) | Sum of squad popularity × merch multiplier × 2 |
| League prizes | Champion 1000, 2nd 600, promotion 500 |
| Continental | Qualifying 300, each win 300, final 1000, champion 3000 (not multiplied) |

Rough check: a Level 3 club earns **about 1,800–2,500 coins per season** at the start. That's around 4 Silver packs, or a mix of infrastructure and boosts. Exact numbers get tuned in a balancing pass.

### 6.2 Packs

| Pack | Price | Cards | Guarantee | Odds (C / R / E / L) |
|---|---|---|---|---|
| Bronze | 150 | 3 players | — | 80 / 18 / 2 / 0 |
| Silver | 500 | 3 players | 1 Rare or better | 55 / 35 / 9 / 1 |
| Gold | 1500 | 3 players | 1 Epic or better | 25 / 45 / 25 / 5 |
| Elite | 4000 | 3 players | 1 Epic or better, 25% Legendary | 10 / 35 / 35 / 20 |
| Staff | 600 | 2 coaches/GMs | 1 Rare or better | 40 / 40 / 17 / 3 |

**Free packs** as rewards: promotion = Silver, league title = Gold, continental title = Elite.

---

## 7. Stats and history (kept forever)

**Per player card:** appearances, goals, assists, clean sheets (GK/DEF), man of the match awards, average rating, trophies. Broken down per season and over the whole career.

**Per club (all 304):** each season's position, W/D/L, goals for and against, trophies, continental runs.

**Per competition:** champion and runner-up by season, top scorer, best player, biggest win, records.

**Your club:**
- Trophy cabinet and season-by-season timeline.
- **Hall of Fame:** retired cards with their career numbers.
- Records: most goals in a season, longest unbeaten run, biggest comeback.

**AI teams** are a team rating plus **3 named key players**. Their goals go to those players, so league top-scorer tables mix your cards and AI stars. When you own a player's card, that player is removed from AI rosters and replaced by a generic name, so nobody scores for two clubs.

---

## 8. Starting a career

1. **Pick any club** in any division. The club decides your division, stadium name, colours, AI difficulty and rewards. It does **not** decide your squad.
2. You start with **10 Academy players**, a Common coach, a Common GM, **500 coins** and a **free Starter Pack** (5 players, 1 guaranteed Rare from your club's real squad).
3. Starting in a Level 1 division is effectively hard mode. The UI recommends a Level 3 club.

---

## 9. Screens (mobile-first)

1. **Home:** next fixture, coins, quick "Play" button, latest news and achievements.
2. **Squad:** pitch view with 7 starters, 3 bench, coach, assistant and GM. Drag to swap. Cohesion meter.
3. **Inventory:** boosts, infrastructure and events, each with a "Use" button.
4. **Shop:** packs, boosts, infrastructure, event offers. Pack opening with a rarity reveal and Keep/Discard.
5. **Match:** pitch, commentary, decision drawer with subs, mentality and boosts.
6. **Competitions:** league table, fixtures, top scorers, continental bracket.
7. **History:** club timeline, trophy cabinet, Hall of Fame, world records, past winners.
8. **Club:** facility levels and income breakdown.

**Visual direction**
- Dark pitch-green UI with bright rarity frames: grey, blue, purple, gold.
- Big type and cards as the main element.
- No real photos or crests. Players are stylised silhouettes in club colours, and crests are generated shapes with club colours and initials.

---

## 10. Data and real names

- All world data lives in editable JSON files: `data/leagues.json`, `data/clubs.json`, `data/cards/players-*.json`, `data/cards/staff.json`.
- Real club names and real player names are used for a **personal/non-commercial** build.
- **Caveat:** publishing or making money from real player names needs licences (player unions/FIFPRO, clubs' trademarks). Keeping all names in data files lets us swap in a fictional data pack without code changes.
- Rosters are a snapshot. Real-world transfers will make them go stale, and they need a periodic data refresh.
- Launch content: 304 clubs (name, country, colours, rating, 3 key players), about **400 player cards**, about **40 coaches**, about **20 GMs**.

---

## 11. Tech plan

- **Fresh game code** in this repo. The old management-sim screens and engine (sponsors, merch, tickets, transfers) don't carry over. Keep the React + Vite setup and adapt `storage.js` for save slots.
- **Modules:** `engine/match.js` (segment sim), `engine/season.js` (fixtures, AI sim, promotion/relegation, continental draws), `engine/economy.js`, `engine/packs.js`, `engine/stats.js`, `state/` (save/load), `ui/`.
- The game logic is pure functions with seeded randomness, so balance can be tested headlessly by simulating thousands of seasons in a script.

### Milestones

| # | Milestone | Done when |
|---|---|---|
| M1 | Core match + squad | You can play a 7v7 match with cards, subs, boosts and commentary |
| M2 | One league season | 8-team league, fixtures, table, coins, Bronze/Silver packs, Keep/Discard |
| M3 | Full world | 38 divisions, AI simulation, promotion/relegation, retirements |
| M4 | Continental | 3 tournaments, Europe qualifying, season calendar |
| M5 | All card families | Infrastructure, events, staff packs, cohesion, popularity/merch |
| M6 | History and stats | Full stat tracking, Hall of Fame, records |
| M7 | Data and polish | Real data pass, visuals, animations, balance sweep |

---

## 12. Open questions

1. **Which 4 European countries** get their own league? Suggestion: Belgium, Turkey, Scotland, Austria.
2. **Asia Other vs APAC Other:** suggestion is Asia Other = Korea, China, Qatar, UAE and APAC Other = Australia, New Zealand, Southeast Asia.
3. **Coach/GM careers:** should they retire on a match count like players, or last a fixed number of seasons?
4. **Domestic cup:** add a short knockout cup per country for more matches and rewards, or keep the calendar lean?
5. **Division size:** 8 clubs keeps seasons short (14 matches). 10 clubs gives 18 matches and makes cards' match counts run out faster.
