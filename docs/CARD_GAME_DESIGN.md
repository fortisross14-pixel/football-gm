# Football Cards — Game Design Document (v1.6)

> Replaces the old management-sim design (`GAME_DESIGN_DOCUMENT.md`), which is kept for reference only.
> Language: English. Platform: web (React + Vite), mobile-first.

**Changes in v2.3 (off-season flow, jersey, sponsor and TV deals)**
- **Off-season flow** (§6.5): six steps after the season closes, each revisitable: season review, season card, jersey, sponsor, TV, CEO meeting. The Transfer Market, cards and job offers stay open alongside.
- **Jersey** (kit provider): base coins + a share of the shirt sales; renew or change maker, keep the line or order a new design; the season's shirt sales are revealed on signing. New Club → **Jersey** sub-tab.
- **Sponsor negotiation** replaces Steady / Performance / Glory: the current sponsor's renewal (per win + a card) or one of two new brands (signing bonus + per win, no card).
- **TV rights:** three offers a year, a fixed fee plus coins per game, per home game or per international game. League and cup result money is about 10% lower to make room.
- Merchandise per match is halved (replica shirts are now the kit deal's).

**Changes in v2.2 (Club tab)**
- Season and GM cards stack with these: Packed House adds a % of the ticket-priced gate, Sponsor's Favourite pays on top of the sponsor contract, Money Man takes its % of everything.
- Six tabs: **Home** (was "Club"), Squad, **Club** (new), Cards, Competitions, World.
- **Club tab** (§9): Overview, Infrastructure, Finance, Effects, Trophies.
- **Building works** (§4.5): an infrastructure card no longer raises a level at once; it starts a project.
- **Ticket prices** and a **summer sponsor contract** (§6.3); a season-by-season finance history.

**Changes in v2.2 (GM cards, season cards, card lifespans)**
- **GM creation** (§7.6): name, **country of origin** and a **GM style** (Financial, Tactical, Physical, Cohesion, Personal). You're dealt one **GM card** of that style at random (Common to Epic), permanent for the career (§7.7). Shown in Career, on your manager page and in the main-menu Managers ranking. Older careers show "No card".
- **Season cards** (§4.7): at the end of every season you're dealt **3 season cards** and pick 1; it is next season's active event. Redraw the 3 for 200, then 400, then 800 coins each summer. Season events are no longer sold in the Transfer Market; event cards already in an old save's inventory show up in the deal as free picks.
- **Card lifespans** (§4.8): academy graduates start with their full career; **pack players arrive with 50–90% of their matches left** (shown on the card when the pack opens); signings keep what they had at their old club.

**Changes in v1.9 (club management)**
- **Ten club areas** (§4.5) in two groups: Business (stadium, hospitality, club store, merchandise, sponsorship) and Sports (training fields, gym, spa & recovery, youth academy, analytics). Each has its own Club card; steps are a bit smaller than the old four facilities.
- **Cards any time** (§4.6): the Transfer Market is open all year (9 offers each summer, 6 fresh ones every 5 league matchdays) and management cards are played from Cards → Items whenever you like, within **8 card plays per season** (+1 at Analytics level 3 and 5).
- The Club screen is now **Club management** (§9): areas with level pips, current and next effect, income per match.

**Changes in v1.6**
- **Skills** (§5.4): Rare, Epic and Legend players and coaches carry an intrinsic skill. Up to 2 activations per match, from any mix of players and coaches. Timing is the tactic.
- **Tactics** (§5.5): pressing, passing and defensive line, with counters and synergies with cards.
- **Boosts** have rarities and come in sealed packs; you get one free random boost after every match in which you play at least one (§4.4).
- **Owners and fans** confidence (§7.5): end a season with job security under 30 and you're sacked; you then get exactly 3 offers, a level lower if sacked by a top-flight club.
- **History book** (§8): every league and cup, every season: champion, runner-up, relegated, top scorer, MVP, Golden Glove, cup finals; all-time records; your career season by season; AI managers with rankings.
- Every league has a name, and club and league names link to club pages and tables.
- Tabs: Club, Squad, Cards (Owned / Shop), League, World. Visual style: Live Broadcast.

**Changes in v1.5**
- Club squads come from history pools (any era). Each club has a few named cards and generic Commons for the rest.
- Every off-season brings academies, AI signings, retirements and a free market (§4.8).
- Poach and Free Agent are replaced by random **World Signing** and **National Signing** cards. You don't pick the player.

**Changes in v1.4**
- 25 off-season card types, each with a rarity that sets its strength. Lower rarities show up more often in the Transfer Market.

**Changes in v1.3**
- 5 rarities: **Common, Uncommon, Rare, Epic, Legend**.
- New **off-season cards**: season events plus **Transfer Market** cards (Career Extension, Stadium Evolution, Poach). They can only be played in the off-season.
- Poaching a player from another club succeeds more often the lower the player's rarity.
- Infrastructure cards are now also played in the off-season only.

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
- **Per season:** 18 league matches, up to 5 cup matches, up to 7 continental matches and up to 3 Club World Cup matches.
- **Long term:** build a GM career across clubs, replace retiring stars, fill the trophy cabinet and the Hall of Fame.

---

## 3. The world

### 3.1 Leagues

Every division has **10 clubs** and plays a double round-robin: **18 matchdays** (v1.9; it was 8 clubs and 14 matchdays before).

| Group | Countries | Divisions | Clubs |
|---|---|---|---|
| Big 4 | England, Spain, Italy, Germany | 3 each | 120 |
| Two divisions | France, Portugal, Netherlands, Argentina, Brazil, Mexico (Liga MX + Liga de Expansión), Japan (J1 + J2) | 2 each | 140 |
| Single-division | Turkey, Belgium, Switzerland, Denmark, Scotland, Austria, Greece, Europe Other, USA, Colombia, Chile, South America Other, Asia Other, APAC Other, Saudi Arabia, Nigeria, Egypt, Africa Other | 1 each | 180 |
| **Total** | | **44 divisions** | **440 clubs** |

v1.9 added two real clubs to every existing division, four leagues (**Belgium** Pro League, level 2; **Switzerland** Super League, **Denmark** Superliga and **Chile** Primera División, level 3) and two second divisions (**Mexico** Liga de Expansión, **Japan** J2). Club Brugge, FC Basel, FC Copenhagen, Colo-Colo and Universidad de Chile moved from the "Other" divisions into their new national leagues.

**"Other" divisions** hold real clubs from countries that don't have their own division:

| Division | Clubs |
|---|---|
| Europe Other | Shakhtar Donetsk, Dynamo Kyiv, Bodø/Glimt, Red Star Belgrade, Slavia Prague, Sparta Prague, Dinamo Zagreb, Ferencváros, Malmö FF, Legia Warsaw |
| South America Other | LDU Quito, Independiente del Valle, Barcelona SC, Peñarol, Nacional, Libertad, Cerro Porteño, Olimpia, Universitario, Alianza Lima |
| Asia Other | Qatar, UAE, Iran (Persepolis, Tractor, Esteghlal), Uzbekistan (Pakhtakor) |
| APAC Other | South Korea, China (incl. Guangzhou FC), Australia (Melbourne City, Sydney FC), Thailand |
| Africa Other | South Africa (incl. Kaizer Chiefs), Morocco, Tunisia, Algeria, Sudan, DR Congo (TP Mazembe) |

Every league has a name (LaLiga, Pro League, J2 League…); the "Other" divisions have invented ones.

**Promotion/relegation:** **2 up and 2 down** between adjacent divisions in the same country (the top two of the lower division swap with the bottom two above). Single-division leagues have none.

### 3.2 Strength levels (AI difficulty and reward multiplier)

| Level | Divisions | AI team OVR | Reward multiplier |
|---|---|---|---|
| L1 | Big 4 Division 1 | 78–86 | ×1.75 |
| L2 | Big 4 Division 2; France, Portugal, Netherlands, Argentina, Brazil and Mexico Division 1; Turkey, Belgium, Saudi Arabia | 70–78 | ×1.5 |
| L3 | Big 4 Division 3; the other second divisions (Mexico's Liga de Expansión included); the other single-division leagues; Japan's J1 and J2 (J2 clubs are rated lower) | 60–70 | ×1.0 |

**Strategy hook:** a small single-division league is easy to win and its champion goes straight to the continental tournament, but it pays less. A Big 4 Division 3 club pays the same but has to climb two divisions before it can reach Europe's top table.

### 3.3 Domestic cup

Each cup is a quick **single-match knockout**. One loss and you're out. The bracket is the largest power of two that fits; the **lowest-ranked clubs** (lower division first, then weakest) play a **preliminary round** for the last places.

| Country type | Who plays | Size | Rounds |
|---|---|---|---|
| Single-division leagues (including "Other" divisions) | Division 1 | 10 clubs | Preliminary (4 clubs) → QF → SF → Final (4) |
| Two- and three-division countries | Division 1 + Division 2 | 20 clubs | Preliminary (8 clubs) → R16 → QF → SF → Final (5) |

- Big 4 Division 3 clubs don't play the cup.
- The draw is random, and the lower-division club plays at home. That gives giant-killing chances.

### 3.4 Continental tournaments

Clubs qualify through **last season's** league results. For season 1, the seeded "previous champions" come from club strength.

**Europe (8 teams)**
- Direct: champions of England, Spain, Italy and Germany (4).
- The other 11 European champions play for 4 places: France, Portugal, Netherlands, Turkey and Belgium go to the qualifying round; Scotland, Austria, Greece, Denmark, Switzerland and Europe Other first play a **preliminary round** (3 ties), and its winners join the qualifying round (8 clubs, 4 ties).

**Americas (8 teams)**
- Champions of Argentina, Brazil, Mexico, USA, Colombia, Chile and South America Other (7), plus the better runner-up of Argentina and Brazil (by points).

**Africa–APAC (8 teams)**
- Champions of Japan, Asia Other, APAC Other, Saudi Arabia, Nigeria, Egypt and Africa Other (7), plus the best runner-up by points (1).

**Format (all three):** 2 groups of 4 (single round-robin, 3 matches) → semi-finals → final. That's up to 5 matches, plus up to 2 for European qualifiers.

### 3.5 Club World Cup (every season, at the end)

- The **3 continental champions** of that season.
- Single round-robin (each team plays 2), then the **top 2 play the final**. That's up to 3 matches.
- Played at a neutral venue: no home bonus, and Fortress Season doesn't apply.

### 3.6 Season calendar

| Phase | Events |
|---|---|
| Off-season | **Summer Transfer Market** (9 fresh offers): sign players, upgrade club areas, pick a season event. The market stays open all season, with 6 new offers every 5 league matchdays |
| MD 1–4 | European preliminary round (after MD 2) and qualifying (after MD 3) · Cup preliminary round (after MD 4) |
| MD 5–9 | Continental group game 1 (after MD 5) · Cup R16 (after MD 6) · Group game 2 (after MD 8) · Cup QF (after MD 9) |
| MD 10–14 | Group game 3 (after MD 11) · Cup SF (after MD 12) · Continental SF (after MD 14) |
| MD 15–18 | Cup final (after MD 15) · Continental finals (after MD 18) |
| Club World Cup | 3 continental champions |
| Season end | Prizes, promotion/relegation, retirements, board review, **job offers** |

- At most **33 matches** per season (18 + 5 + 7 + 3), and a typical club plays 20–24.
- All AI-vs-AI matches are simulated instantly from team ratings.

---

## 4. Cards

### 4.1 Card families and ownership rules

| Family | How you get it | What happens when used | Ownership limit |
|---|---|---|---|
| **Players** | Player packs | Plays matches until it retires | **10** (7 starters + 3 bench) |
| **Coaches** | Coach packs | Head coach + assistant, retire like players | **2** |
| **In-game boosts** | Shop | Used during a match, then gone | Unlimited |
| **Management: Transfer** | Transfer Market (all year), season reward | Played any time, then gone (§4.6) | Card plays per season |
| **Club cards: infrastructure** | Club packs (§4.6b), season reward | Raises one club area at your current club, then gone (§4.5) | Card plays per season |
| **Club cards: temporary** | Club packs (§4.6b), season reward | Lasts a few games (or pays off at once), then gone | Card plays per season; one of each running at a time |
| **Management: Season events** | Year-end season card draw (older saves: still in inventory) | Lasts the season (from the summer: all of it; mid-season: until it ends) (§4.7) | 1 active per season, counts as a play |

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
- **Popularity:** rarity × (1 + 0.25 per star) plus fame. Fame grows with goals (+0.15), assists (+0.05), man of the match (+0.4), every trophy (+1.5 for the whole squad) and a league title (+1), capped at 30. Squad popularity drives merchandise income.
- **Duplicates:** keeping a copy of a card you own merges it: +1 star (+2 to every stat, max 3 stars) and +30 matches.

| Rarity | Frame | OVR range | Matches | Base popularity | Quick sell |
|---|---|---|---|---|---|
| Academy (generic) | Plain | 45–54 | Unlimited | 0 | 0 |
| Common | Grey | 55–61 | 150–200 | 1 | 10 |
| Uncommon | Teal | 62–67 | 140–190 | 2 | 20 |
| Rare | Blue | 68–74 | 120–180 | 4 | 40 |
| Epic | Purple | 75–82 | 110–160 | 8 | 90 |
| Legend | Gold | 83–92 | 100–140 | 16 | 250 |

Older stars tend toward the low end of the match range, young players toward the high end.

**Retirement:** a retiring card moves to the **Hall of Fame** with its full career stats. Its slot is filled by a generic Academy player until you add a new card.

### 4.3 Coach cards (head coach + assistant)

- **Head coach:** sets the **formation** (2-3-1, 3-2-1, 2-2-2, 3-1-2) and one **passive**. Examples:
  - Counter-Attack Master: +20% chance quality when trailing.
  - Motivator: +10% stats in the second half.
  - Tactician: +1 boost slot per match.
  - Cup Specialist: +10% in cup matches.
- **Assistant:** gives its own passive at **50% strength**. When the head coach retires, the assistant is promoted automatically if you have no replacement.
- **Retirement:** same rule as players. Both coaches lose 1 match for every match the team plays. Rarity sets the match range (Common 150–200 … Legend 100–140).
- **No coach:** if you have no coach card, a generic coach takes over with a 2-2-2 formation and no passive.

### 4.4 In-game boosts (consumable)

You bring up to **3 boosts** per match (4 with the *Tactician* coach). You can play them at any decision point (see §5).

Boosts are never bought one by one. They come in sealed packs (**Boost Pack** 3 random for 120; **Premium Boosts** 4 with at least one Rare for 380), and after every match in which you played **at least one** boost you get **one** free random boost card (one, however many you played). Draw weights: Common 50, Uncommon 30, Rare 14, Epic 5, Legend 1.

| Boost | Rarity | Effect |
|---|---|---|
| Iron Wall | Common | +25% team DEF for one segment |
| All-Out Attack | Common | +30% ATT, −20% DEF for one segment |
| Set-Piece Special | Common | One free set-piece chance |
| Second Wind | Uncommon | Restore 40% stamina to the whole team |
| Super Sub | Uncommon | The next substitute comes on with +15% stats |
| Captain's Speech | Rare | If losing: +10% all stats for the rest of the match |
| Game Management | Rare | If leading in the last segment: opponent chances −40% |
| Golden Chance | Epic | Pick a player: a big chance for them in the next segment |
| Twelfth Man | Legend | +15% all stats for 30 minutes |

### 4.5 Club areas (facilities)

Ten areas, levels 0–5. They **belong to the club**, not to you: if you leave, the levels stay behind. Each area is raised by **its own infrastructure card** from club packs (§4.6b), and the card's **rarity sets the highest level it can build**:

| Rarity | Common | Uncommon | Rare | Epic | Legend |
|---|---|---|---|---|---|
| Builds | +1, up to level 2 | +1, up to level 3 | +1, up to level 4 | +1, up to level 5 | +2 levels |

Club packs only deal an infrastructure card at a rarity that can still raise that area (v2.2; before, the market priced them by the area's level). All numbers live in `src/data/facilities.js`. Coin amounts are × the division multiplier (0.9 / 1.4 / 1.75 for levels 3 / 2 / 1).

| Group | Area · card | Effect at levels 0 / 1 / 2 / 3 / 4 / 5 |
|---|---|---|
| Business | 🏟 **Stadium** · Stadium Evolution + six part cards (§6.4) | Six parts with their own levels and a 1–5 star rating; the gate is the crowd × the price per fan (§6.4). The Stadium level shown elsewhere is the parts' average |
| Business | 🍽 **Hospitality** · Restaurant & Boxes | 0 / 10 / 18 / 27 / 36 / 46 a home game |
| Business | 🏪 **Club store** · Club Store | 0 / 4 / 7 / 10 / 14 / 18 every match |
| Business | 👕 **Merchandise** · Merchandise Line (kits → lifestyle → global) | Squad popularity × 0.5 / 0.9 / 1.3 / 1.7 / 2.1 / 2.5 × 0.15 every match (0.3 before v2.3), and the same multiplier sells shirts for the kit deal (§6.5) |
| Business | 🤝 **Sponsorship** · Find a Sponsor (local business → global partner) | Sizes the sponsor offers: base 3 / 6 / 11 / 17 / 24 / 32 (§6.5) |
| Sports | 🏋 **Training fields** · Training Fields | Cohesion +4 / 5 / 7 / 8 / 10 / 12 a match; max bonus 4 / 5 / 6 / 7 / 8 / 9% all stats |
| Sports | 💪 **Gym** · Gym Upgrade | Stamina drains 0 / 4 / 8 / 12 / 16 / 20% slower |
| Sports | 🧖 **Spa & recovery** · Spa & Recovery | Team shape +0 / 3 / 6 / 9 / 12 / 15 |
| Sports | 🏫 **Youth academy** · Youth Academy | Academy fill-ins rated 48–58, intake 1–3 players a year up to Uncommon…Legend |
| Sports | 📊 **Analytics** · Analytics Dept. | Pack odds +0 / 1 / 2 / 3 / 4 / 6 points from Common to higher; +1 card play a season at level 3 and level 5 |

**Building works (v2.2).** Playing an infrastructure card starts a project instead of raising the level at once. It takes **2 + the new level** league matchdays (L1 3, L5 7; a Legend card's +2 counts the final level) and finishes after that many league matchdays; works started in the summer, or still open when the season ends, are ready for the first matchday. One project per area at a time (another card for that area waits). An inbox message "🏗 Construction finished: …" arrives when it's done. Changing clubs leaves open works behind.

There are no injuries, so there's no medical area: the gym and spa work on stamina and team shape instead.

Clubs start with levels that match their size (`clubStart`): a small level-3 club has stadium 1 and training 1 and nothing else; a level-1 club about 2–4 in each area; the giants 3–5. Older saves keep their four facilities and get the new areas a little below them (hospitality = stadium − 2, store and sponsorship = merchandise − 2, gym and spa = training − 2, analytics = academy − 2, never below 0).

**Cohesion (0–100):** goes up after every match by the Training fields amount. Each new starter compared with the last match costs −10 (Tactical Continuity sets a floor). The bonus is cohesion% × the Training fields' max bonus.

### 4.6 Management cards and the Transfer Market

The **Transfer Market is open all year** and, since v2.2, sells **transfer cards only** (club cards come in club packs, §4.6b; season events from the year-end season card draw). Each summer it has 5 fresh offers (always at least one signing); during the season it has 3, replaced at the start of the season and every **5 league matchdays** (Home shows a line when there are new offers). Every card has a **rarity** that sets how strong it is, and **lower rarities appear more often** (Common 45%, Uncommon 28%, Rare 17%, Epic 8%, Legend 2%). You also get 1 random card as a season reward: a transfer card or a club card (a Bronze club pack draw), half and half.

**Playing cards.** Cards are played from the Cards tab (Players → transfer cards, Club → club cards, Season → season events) **at any time** (not during a match, not while a pack is open, not between the last match and collecting the season rewards).
- **Card plays per season: 8** (+1 at Analytics level 3, +1 at level 5). Every card played counts, whatever its group. Shown as "Card plays this season: 3 / 8" in Items, the Market and Club management.
- The count **resets when the season ends**: summer plays count towards the season that follows.
- **Season events:** 1 per season. Played in the summer they last all season; played mid-season they apply for the rest of that season. They end when the season ends.
- **Summer only:** Pre-season Camp (it boosts the first matchdays). Everything else, signings included, works mid-season too: a mid-season signing is the winter window.

There are **53 card types** in three groups (v2.3 added the six stadium part cards and five fan cards):
- **Transfer:** squad moves (Transfer Market).
- **Club:** one infrastructure card per club area (§4.5), plus Sports Science, Boost Crate and the temporary club cards (§4.6b). Club packs only.
- **Season event:** one per season (the year-end season card draw).

Effects at Common and Legend (Uncommon, Rare and Epic sit in between):

| Card | Type | Common | Legend | Price (C → L) |
|---|---|---|---|---|
| ⏳ **Career Extension** | Transfer | +10 matches to one player or coach. | +45 matches to one player or coach. | 150 → 1200 |
| 🌍 **World Signing** | Transfer | Sign a random Uncommon player from any country: a free agent or someone at another club. | Sign a random Epic or Legend player from any country: a free agent or someone at another club. | 250 → 2000 |
| 🏳 **National Signing** | Transfer | Sign a random Uncommon player from your club's country: a free agent or someone at another club. | Sign a random Epic or Legend player from your club's country: a free agent or someone at another club. | 220 → 1760 |
| 🌱 **Youth Intake** | Transfer | An academy player of common level in the position you choose: a club legend if one is available. | An academy player of legend level in the position you choose: a club legend if one is available. | 180 → 1440 |
| ✨ **Golden Generation** | Transfer | Your academy produces 2 uncommon players: club legends where possible, from elsewhere if not. | Your academy produces 2 legend players: club legends where possible, from elsewhere if not. | 450 → 3600 |
| 🧓 **Veteran Signing** | Transfer | Sign a random player one rarity above common, with only 20 matches left. | Sign a random player one rarity above legend, with only 50 matches left. | 200 → 1600 |
| 💪 **Personal Trainer** | Transfer | +2 ATT, DEF and PHY to one player. | +7 ATT, DEF and PHY to one player. | 150 → 1200 |
| 🔁 **Position Retraining** | Transfer | Move one player to a new position (−4 to all stats). | Move one player to a new position with no stat loss. | 120 → 960 |
| 🎓 **Trait Coach** | Transfer | Teach one player a random new trait. | Teach one player the trait of your choice. | 150 → 1200 |
| 📋 **Tactical Course** | Transfer | Your head coach learns a new formation of your choice. | Your head coach learns a new formation of your choice and can switch passive. | 150 → 1200 |
| 🏟 **Stadium Evolution** · 🍽 **Restaurant & Boxes** · 🏪 **Club Store** · 👕 **Merchandise Line** · 🤝 **Find a Sponsor** · 🏋 **Training Fields** · 💪 **Gym Upgrade** · 🧖 **Spa & Recovery** · 🏫 **Youth Academy** · 📊 **Analytics Dept.** | Club | Its area +1 level, up to level 2. | Its area +2 levels (max 5). | 140–180 (Common, level 0) → 2,600–3,300 (Legend, level 4) |
| 🧪 **Sports Science** | Club | +8 team shape until the season ends (all next season if played in the summer). | +30 team shape. | 180 → 1440 |
| 📦 **Boost Crate** | Club | 3 random in-game boosts. | 8 random in-game boosts. | 150 → 1200 |
| 🏰 **Fortress Season** | Season event | +4% all stats at home. | +13% all stats at home. | 300 → 2400 |
| 🔥 **Indomitable Spirit** | Season event | When losing from 60': +8% all stats. | When losing from 60': +20% all stats. | 300 → 2400 |
| ✈ **Marketing Tour** | Season event | Merchandise income ×1.25. | Merchandise income ×2.2. | 250 → 2000 |
| 🔭 **Scouting Network** | Season event | Better pack odds all season (3 points moved from Common to higher rarities). | Better pack odds all season (18 points moved from Common to higher rarities). | 350 → 2800 |
| 🧩 **Tactical Continuity** | Season event | Cohesion never drops below 30. | Cohesion never drops below 80. | 250 → 2000 |
| ⛺ **Pre-season Camp** | Season event | +4% all stats in the first 3 matchdays. | +9% all stats in the first 6 matchdays. | 250 → 2000 |
| 🫀 **Fitness Program** | Season event | Stamina drains 10% slower. | Stamina drains 35% slower. | 250 → 2000 |
| 🐺 **Underdog Mentality** | Season event | +5% all stats against higher-rated teams. | +16% all stats against higher-rated teams. | 250 → 2000 |
| 🎯 **Shooting Drills** | Season event | +5% finishing all season. | +18% finishing all season. | 300 → 2400 |
| 🏆 **Cup Run** | Season event | +6% all stats in domestic cup matches, and cup prize money ×1.5. | +17% all stats in domestic cup matches, and cup prize money ×1.5. | 250 → 2000 |
| 🌙 **Continental Nights** | Season event | +6% all stats in continental and Club World Cup matches. | +17% all stats in continental and Club World Cup matches. | 300 → 2400 |

**Signings are random.** You don't choose the player. A signing card sets the rarity and the scope, and the game picks someone at random from everyone who fits. That can be a free agent or a player at another club, who then leaves that club if you keep him.

| Signing card rarity | Common | Uncommon | Rare | Epic | Legend |
|---|---|---|---|---|---|
| Brings a player who is | Uncommon | Uncommon or Rare | Rare | Epic | Epic or Legend |

- **World Signing:** any country.
- **National Signing:** your club's country.
- **Veteran Signing:** one rarity higher, but with only a few matches left.

Any card you gain from an off-season card (signings, Youth Intake, Golden Generation) goes through the same Keep / Merge / Discard screen as a pack.

### 4.6b Club cards and club packs (v2.2)

Club cards are their own family, bought in **Shop → Club** as club packs and kept in **Cards → Club** until you play them (each play counts towards the season's card plays).

| Pack | Price | Shows | You keep | Odds % per card (C / U / R / E / L) | Infrastructure share |
|---|---|---|---|---|---|
| Bronze Club Pack | 200 | 1 | 1 | 55 / 33 / 10 / 2 / 0 | 60% |
| Silver Club Pack | 600 | 3 | 1 | 25 / 42 / 24 / 8 / 1 | 60% |
| Gold Club Pack | 1,800 | 3 (Rare+) | 1 | 0 / 0 / 60 / 31 / 9 | 75% |

The 3 cards of a pack are all different. An infrastructure card is only dealt at a rarity that can still raise its area; when none can, the slot is a temporary card. Opening: sealed pack → 3 cards face down → flip → tap one → Keep. Data: `src/data/clubPacks.js`, cards in `src/data/offseason.js` (group `club`, `kind: 'area' | 'temp'`).

**Temporary club cards** (Common → Legend). Lasting ones go into `state.clubEffects` (`{ id, type, name, icon, text, gamesLeft, kind, value, homeOnly }`), shown under Cards → Club → Active effects and in the Club tab, and count down after each match (home-only ones after home games only). One of each type can run at a time.

| Card | Effect | Common → Legend |
|---|---|---|
| 🎟 **High Season** | Home gate × value for the next N home games | ×1.5 / 1.75 / 2 / 2 / 2.5 for 3 / 3 / 3 / 4 / 5 home games |
| 📈 **Viral Merchandise** | Merchandise income + value for 5 matches | +20 / 30 / 40 / 50 / 60% |
| 🎫 **Ticket Promo** | Home gate + value and fans + f after each of the next 3 home games | +15 / 20 / 25 / 35 / 50%, fans +1 / 1 / 2 / 2 / 3 |
| 🥂 **Sponsor Night** | One-off coins (×1.5 in tier 2, ×2 in tier 1) | 150 / 250 / 400 / 650 / 1,000 |
| 🏕 **Team Building** | Cohesion now | +10 / 15 / 20 / 25 / 30 |
| 🧊 **Recovery Camp** | Team shape for N matches | +6 / 8 / 10 / 12 / 15 for 3 / 3 / 3 / 4 / 5 |
| 📑 **Analyst Report** | Tactics grade one step better (red → grey, grey → green) for N matches | 2 / 3 / 3 / 4 / 5 matches |
| 🎙 **Press Charm** | Owners' confidence now | +3 / 4 / 6 / 8 / 10 |
| 🦸 **Local Hero** | Fans' confidence (happiness) now | +3 / 4 / 6 / 8 / 10 |
| 🎪 **Local Event** (v2.3) | Local fans now | +2 / 3 / 5 / 7 / 10% |
| 📱 **Social Media Campaign** (v2.3) | Fans worldwide now | +3 / 5 / 8 / 12 / 18% |
| 🎉 **Fan Day** (v2.3) | Happiness and local fans now | +2 / 3 / 4 / 5 / 7, local +1 / 1 / 2 / 2 / 3% |
| 🗺 **Stadium Tour** (v2.3) | Coins (×1.5 tier 2, ×2 tier 1) and local fans now | 60 / 100 / 160 / 260 / 400, local +1 / 1 / 2 / 2 / 3% |
| 🌏 **International Tour** (v2.3, summer only) | Fans worldwide and coins now, jet lag after | +6 / 9 / 13 / 18 / 25%, 120 / 200 / 320 / 500 / 800 coins (×1.5 / ×2), −10 / 9 / 8 / 7 / 6 team shape for the first 3 matches |
| 🧪 **Sports Science** | Team shape until the season ends | +8 → +30 |
| 📦 **Boost Crate** | Random in-game boosts | 3 → 8 |

Analyst Report is read by the match engine: `buildUserTeam` sets `gradeUp`, and `teamFit` lifts the grade (and so the team-wide bonus) one step. Temporary effects stay with the club when you move (they're cleared on a new job).

**Older saves (v4):** club-group cards in `inventory.offseason` move to `inventory.club`; season event cards stay in `inventory.offseason` (group `event`) and can still be played from Cards → Season; a market holding club or event offers is restocked with transfer cards.

### 4.7 Season cards (v2.2)

At the end of every season, when the summer opens (after the season rewards are collected), you're **dealt 3 season cards** and **pick 1**. It is the active event for the whole next season (`state.seasonCard`, played through the same `activeEvent` effects as the old event cards). Rarity sets its strength (Common 42%, Uncommon 30%, Rare 18%, Epic 8%, Legend 2%), and the 3 are always different.

- **Redraw** the 3 for coins: ◎ 200, then 400, then 800 (per summer, three at most).
- Not picked by kick-off? The first dealt card is played.
- Picked from Home (off-season block) or Cards → Season; during the season Cards → Season shows the card in play. It moves with you if you change clubs.
- **Old saves:** an event card bought in the market before v2.2 shows up in the deal as a free extra option ("Yours from the market"). Mid-season (no deal open) it can still be played from Items as before.
- Continental Nights is only dealt to a club that qualified for a continental cup.

**The deck** (values Common → Legend):

| Card | Effect |
|---|---|
| 🏰 Fortress Season | +4 / 6 / 8 / 10 / 13% all stats at home |
| 🔥 Indomitable Spirit | when losing from 60': +8 / 10 / 12 / 15 / 20% all stats |
| ✈ Marketing Tour | merchandise income ×1.25 / 1.4 / 1.6 / 1.8 / 2.2 |
| 🔭 Scouting Network | pack odds: 3 / 5 / 8 / 12 / 18 points moved from Common |
| 🧩 Tactical Continuity | cohesion never below 30 / 40 / 50 / 60 / 80 |
| ⛺ Pre-season Camp | +4 / 5 / 6 / 7 / 9% all stats in the first 3 / 3 / 4 / 5 / 6 matchdays |
| 🫀 Fitness Program | stamina drains 10 / 15 / 20 / 25 / 35% slower |
| 🐺 Underdog Mentality | +5 / 7 / 9 / 12 / 16% against higher-rated teams |
| 🎯 Shooting Drills | +5 / 7 / 10 / 13 / 18% finishing |
| 🏆 Cup Run | +6 / 8 / 10 / 13 / 17% in domestic cup matches, cup prize money ×1.5 |
| 🌙 Continental Nights | +6 / 8 / 10 / 13 / 17% in continental and Club World Cup matches |
| 🧪 Sports Science | +8 / 12 / 16 / 22 / 30 team shape all season |
| ✨ Golden Generation | on pick: 2 academy players (Uncommon, Uncommon, Rare, Epic, Legend) |
| 🏷 **Bargain Hunter** (new) | packs 10 / 15 / 20 / 25 / 30% cheaper all season |
| 📡 **High Visibility** (new) | at season end: +1 job offer, from clubs asking up to 4 / 6 / 8 / 10 / 14 more reputation |
| 🤑 **Sponsor's Favourite** (new) | sponsor bonus ◎ 6 / 9 / 12 / 16 / 22 a match (× division multiplier) |
| 🏟 **Packed House** (new) | +25 / 35 / 50 / 65 / 90% home gate income |

The new cards exist only in the deck (group `season`, `src/data/seasonCards.js`), never in the market.

### 4.8 Club squads, history pools and the academy

**Every club has a history pool:** real players from any era who are associated with the club. For example, Real Madrid's pool includes Di Stéfano, Isco, Pirri, Zamorano, Buyo and Míchel Salgado. A player belongs to only one club's pool.

| Club | Pool size | Starting named cards (random from the pool) |
|---|---|---|
| Top clubs (23, e.g. Real Madrid, Bayern, Boca) | 14–20 | 6–7 |
| Other Division 1 clubs | 5–10 | 3–4 |

The pools hold 1,930 cards across 304 clubs, mostly Uncommon and Rare club figures with a few true greats. Over 15 simulated seasons, clubs keep about 3.5–4 named players each, and big clubs stay mostly their own legends.

| Divisions 2 and 3 | 3–5 | 0–2 |

- **Starting legends fit the league:** level-3 divisions start with at most Rare legends, level 2 at most Epic. Your Racing start draws two Uncommon legends. Better ones come later through the academy and signings.
- **AI clubs get a settled-squad bonus (+10%)** to match your cohesion and coaching edges. Measured over 30 seasons with no packs, your first season averages 4th of 8 and about 1,950 coins.
- **Named cards are Uncommon or better.** The rest of the 12-card squad (7 starters, 5 reserves) is generic Common players with surname-only names. Their quality depends on the division, but they are always Common.
- **One card, one club, always.** A card is held by at most one club or by you. If you get a card that an AI club holds (from a pack or a signing), it leaves that club.

**Every off-season, for every club (yours included):**

1. **Wear and retirement:** AI cards lose a season of matches, and retire at 0. A retired player rests for 3 seasons, then can come back through an academy or a signing.
2. **Academy intake:** the club's Youth Academy level sets how many cards and how rare. Golden Generation and Youth Intake add more.

   | Academy level | 0 | 1 | 2 | 3 | 4 | 5 |
   |---|---|---|---|---|---|---|
   | Cards per year | 1 | 1 | 2 | 2 | 3 | 3 |
   | Best rarity | Uncommon | Rare | Rare | Epic | Epic | Legend |

   Cards come from the club's own history pool first, so club legends return. If the pool has nothing suitable, which is often the case for a small club using Golden Generation, the card comes from elsewhere, preferring the club's country. If nothing is free, you get a fictional youngster. Your intake goes through Keep/Discard.
3. **AI signings:** AI clubs sign free players (cards nobody holds) to get back to their usual number of named players. Top clubs also add a star now and then. Real Madrid can sign Lampard, Landon Donovan or Messi if they're free.
4. **Squad caps:** each AI club keeps at most its starting maximum + 1 named cards. The weakest named card is released to the free market.

The League tab's "Last season" view lists the biggest signings and academy graduates.

**Card lifespans (v2.2):**
- **Academy graduates start fresh:** a club legend coming through the academy (intake, Youth Intake, Golden Generation) has his full pool career (`matchesLeft`), whatever an earlier spell left. Generic academy cards (rarity `academy`, the retirement replacements) never retire.
- **Pack players** have been playing somewhere: each arrives with a random **50–90%** of his career left. The pack opening shows "matches · %" on the card and "Career: X of Y matches left" before Keep.
- **Signings** (World / National Signing) keep the matches they had at their old club (or what the world book says for a free agent). Veteran Signing still sets its own short career.

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

Target: **3–4 goals per match on average** (7v7 is high-scoring). Comebacks should be possible but special: without boosts, about 1 in 20 teams losing at 60' go on to win, and more with the right boost at the right time.

### 5.4 Skills

Rare, Epic and Legend cards (players and coaches) carry one intrinsic skill. Epic and Legend always do, Rare about half the time. Skills are not consumed: each card can fire its skill once per match, and **a team can fire 2 skills per match in total**, from any mix (2 players, a player and the coach, coach and assistant…). Using both at 30' leaves nothing for 75'. Strength grows with rarity (Rare / Epic / Legend).

| Skill | Who | When | Effect (Rare / Epic / Legend) |
|---|---|---|---|
| Clutch | FWD, MID | From 75' | +12 / 15 / 20% ATT for that player to the end |
| Clear Chance | FWD, MID | Any time | A clear chance for that player now (quality 0.60 / 0.72 / 0.85) |
| Box Hunter | FWD | Any time | +20 / 25 / 35% finishing for 30' |
| Maestro | MID | Any time | +15 / 20 / 25% midfield control for 30' |
| Killer Pass | MID | Any time | 1 / 1 / 2 extra chances this segment |
| Last Line | DEF | Any time | Rivals create 30 / 40 / 50% fewer chances for 15' |
| Man-Marker | DEF, MID | Any time | +20 / 25 / 30% team DEF for 15' (Legend 30') |
| Wall of Hands | GK | Any time | Rivals convert 30 / 40 / 50% fewer chances for 15' (Legend 30') |
| Keep the Result | Coach | When leading | +35 / 35 / 45% team DEF for 15' (Legend 30') |
| All In | Coach | When not winning | +30 / 35 / 45% ATT, −15% DEF for 15' (Legend 30') |
| Half-Time Talk | Coach | At half time | +10 / 12 / 15% all stats for the second half |
| Pressing Trap | Coach | Any time | Rival control −15 / 20 / 25% for 30' |
| Fresh Legs | Coach | Any time | Everyone on the pitch recovers 25 / 35 / 50 stamina |

The AI uses its skills too: it protects leads late, chases games late and gives half-time talks. The pre-match screen shows both sides' skills.

### 5.5 Tactics (Squad → Tactics)

**Five numbers per player:** Passing, Shooting, Defense, Physical, Set pieces (`src/engine/attributes.js`). DEF and PHY are stored; PAS, SHO and SET come from the card's position, attack rating, trait and a fixed per-card variation, with real-world specialists lifted (Beckham, Pirlo, Juninho… for set pieces; Xavi, Riquelme, Modrić… for passing). The Tactics screen shows the starting 7's averages, and wide vs central attackers.

**Instructions** (`src/engine/tactics.js`), each read against those numbers:

| Kind | Setting | What it does |
|---|---|---|
| Slider 1–5 | Pressing | Higher: rivals lose control, you win the ball high; +20% stamina drain per step. Physical makes it bite. |
| Slider 1–5 | Passing tempo | Faster: more chances, quality follows Passing. Patient: more control, better openings. |
| Slider 1–5 | Defensive line | Higher: rivals shoot less, but balls in behind hurt, more with slow (low Physical) defenders. |
| A/B | Attack through wings / centre | Quality follows the better group (wide vs central attackers). |
| A/B | Build-up short / long balls | Short needs Passing and suffers against a press; long skips the press, needs strong forwards. |
| Switch | Offside trap | Fewer rival chances if defenders read the game (Defense); slow defenders get beaten. |
| Switch | Play for set pieces | Extra dead-ball chances; worth it with a good taker. |
| Switch | Counter-attacks | Big quality boost against high lines, pressing and attacking teams; needs Physical; costs control. |
| 3-way | Kick-off mentality | Defend / Balanced / Attack (also changeable in the match). |

**Philosophies** (`src/data/philosophies.js`): Tiki-taka, Total football, Gegenpress, Controlled possession, Pragmatic, Route one, Counter-attack, Catenaccio. Loading one sets every instruction; you can then adjust and save your own styles (up to 8). They counter each other (`node scripts/tactics-check.mjs` prints the full matrix: every preset averages 1.31–1.46 points a game against the others, with clear winners per matchup).

**Coach fit:** every coach has a philosophy. Distance from it (slider steps 0.5, choices 1, switches 0.5, mentality 1) gives a team-wide bonus from +2.5% (×0.6 Common … ×1.4 Legend coach) down to −6% for a clash.

**Owners:** every club has an identity (Barcelona tiki-taka, Atlético catenaccio, Liverpool gegenpress…). Playing close to it adds owners' confidence each match; a clash costs it. The screen shows coach style, the club's identity and how well the squad suits the instructions, with plain advice ("Fast tempo with Passing 61: too many passes will go astray").

AI clubs play their identity with a coach that fits it. Pre-match scouting shows the rival's style.

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
| League win / draw / loss | 40 / 18 / 7 × division multiplier (45 / 20 / 8 before v2.3's TV deals, 60 / 25 / 10 before v1.9) |
| Cup win / draw / loss | 58 / 18 / 7 × division multiplier (65 / 20 / 8 before v2.3) |
| Continental win / draw / loss | 100 / 40 / 20 |
| Club World Cup win / draw / loss | 150 / 60 / 30 |
| Bonuses | Clean sheet +15, 3+ goals +15 (× multiplier) |
| Home game | Stadium gate + hospitality (§4.5) |
| Every match | Club store (§4.5) |
| Merchandise (every match) | Squad popularity × merchandise multiplier × 0.15 (0.3 before v2.3: shirts are now the kit deal's) |
| Kit deal, sponsor, TV (§6.5) | Kit revenue and the TV fee over the 18 league matchdays; sponsor per win and signing bonus (matchday 1); TV per game / home game / international game |
| League prizes (1st → 10th) | 600 / 380 / 280 / 210 / 160 / 120 / 90 / 60 / 40 / 20 × multiplier |
| Trophy prizes | Cup 400 × multiplier, continental 1,500, Club World Cup 2,500; continental finalist 500; European qualifying 150 |

Measured (career simulator): about 1,000 coins in the first season, 2,000–4,500 in seasons 2–5, and 5,000–7,500 a season once established in a top division.

### 6.2 Packs

| Pack | Price | Cards | Guarantee | Odds % (Common / Uncommon / Rare / Epic / Legend) |
|---|---|---|---|---|
| Bronze | 200 | 3 players | — | 60 / 30 / 9 / 1 / 0 |
| Silver | 600 | 3 players | 1 Rare or better | 30 / 40 / 24 / 5 / 1 |
| Gold | 2000 | 3 players | 1 Rare or better | 5 / 30 / 47 / 15 / 3 |
| Elite | 5000 | 3 players | 1 Epic or better, 25% Legend | 0 / 15 / 40 / 33 / 12 |
| Coach | 700 | 2 coaches | 1 Rare or better | 30 / 35 / 25 / 8 / 2 |

Odds are per card. The guarantee upgrades one card if none of the three meets it.

**Club packs** (Shop → Club): Bronze 200 (1 card), Silver 600 (keep 1 of 3), Gold 1,800 (keep 1 of 3, Rare+). See §4.6b.

**Free packs** as rewards:

| Achievement | Reward |
|---|---|
| Promotion | Silver |
| Cup winner | Silver |
| Continental runner-up | 1,000 coins |
| League title | Gold |
| Continental title | Elite |
| Club World Cup | 2 × Elite |

### 6.3 Ticket prices and sponsor contracts (v2.2)

**Ticket prices** (Club → Finance), changeable any time:

| Price | Per fan | Demand | Hospitality | Happiness after a home game | Home |
|---|---|---|---|---|---|
| Low | −20% | +20% | — | +0.6 | +1% all stats at home |
| Normal | — | — | — | — | — |
| High | +25% | −20% | +25% | win 0 · draw −0.8 · defeat −1.5 | — |

Since v2.3 the price works through ticket demand (§6.4): when demand is above capacity every price sells out, so High is +25% gate at the cost of happiness after every home game you don't win; below capacity, High leaves seats empty (about the same money for less happiness) and Low fills them.

**Sponsor contract.** Replaced in v2.3 by the sponsor negotiation (§6.5).

**Finance history:** every season keeps a compact entry (income by category, spending, closing balance), written when the season closes and brought up to date with the summer's money when the next one starts.

### 6.4 The stadium and the fans (v2.3)

**Stadium parts** (`state.stadium = { size, parts }`, `src/state/stadium.js`, tables in `src/data/facilities.js`). Six parts, levels 0–5, each built by its own club card (or Stadium Evolution, which builds the weakest part its rarity can still raise). Same rarity caps and building works as the other areas; one project per part at a time, so two parts can be built at once.

| Part · card | Effect per level |
|---|---|
| 💺 Capacity · New Stand | seats = stadium size × 0.6 / 0.82 / 1 / 1.12 / 1.22 / 1.32 |
| 🚿 Locker rooms · Locker Room Refit | +0.2% all stats at home |
| 🌱 Pitch · Pitch Renewal | +0.2% all stats at home |
| 🚗 Access & parking · Access & Parking | +4% ticket demand |
| 💡 Floodlights · Floodlights | +2% per fan |
| 📺 Scoreboard & screens · Big Screen | +0.05 happiness after every home game |

**Stars** = 1 + 0.8 × the weighted average level (capacity counts double, hospitality counts once), rounded down to a half star: 1★ with nothing, 5★ only when every part and hospitality are level 5. A small level-3 club starts at 1.5★, the giants at 4.5★. Inbox messages at 4★ and 5★ (and on any star gained).

**Stadium size** is fixed per club (it does not change on promotion): level 3 10,000 × 0.75–1.25 by club size, level 2 18,000, level 1 34,000, the giants 62,000. Capacity: a small level-3 club 6,000–8,000 seats, a giant 82,000 at capacity level 5.

**Fans** (`state.fans`, `src/state/fans.js`). Local fans buy tickets; fans worldwide are for TV and shirt deals (read with `fansOf(state)`). Starting bases by club size within the level: level 3 8k–30k local, level 2 50k–200k, level 1 250k–900k, the giants 2M+; worldwide = local × 2.5 / 5 / 15 (giants × 60, so 120M+).

| Event | Local | Worldwide |
|---|---|---|
| League win / defeat | +0.3% / −0.15% | +0.2% / −0.1% |
| Continental or Club World Cup win | +0.3% | +0.6% |
| Derby win / defeat | +1% / −0.4% extra | +0.3% extra |
| Cup / continental / Club World Cup trophy | +4 / 6 / 6% | +5 / 12 / 20% |
| Promotion · league title · relegation · objective missed (season end) | +6 · +4 · −6 · −2% | +10 · +6 · −8 · −1% |
| Squad popularity (season end) | — | + popularity / 10 % (max 15%) |

**Happiness is the fans' confidence meter** (`gm.confidence.fans`, 0–100). There is one number, not two: results, derbies, trophies, ticket prices, screens and fan cards all move it, and it is what job security already reads (35%), so nothing counts twice. It resets with a new job (new club, new fans) and drifts back towards 50 each summer, as before.

**Ticket demand** = 42 × local fans^0.55 × mood × price × access × derby 1.25 × continental 1.15, with mood = 0.6 + 0.4 × happiness / 55 (0.5–1.4). 8,000 local fans want about 5,900 tickets, 100,000 want 23,600, 2 million 124,000: small clubs fill most of the ground, big ones sell out. **Attendance** = min(capacity, demand).

**Gate** per home game = attendance × price per fan, price per fan = 58 × division multiplier × (0.85 + 0.06 × stars) × floodlights × ticket price / stadium size (× 0.8 per match, as all business income since v1.9). A full ground earns about what the old per-level gate paid. The Finance tab shows demand, capacity, the price per 1,000 fans and the last home crowds; the match result shows "Home gate · 7,110 / 7,800 fans". Club → Fans shows local and worldwide fans with this season's change, the happiness meter with a sentence, the last home crowds, season history and what moves them. Inbox: 100k / 1M local, 1M / 10M / 100M worldwide, 5 / 10 / 20 sell-outs in a row.

### 6.5 The off-season flow and the club's deals (v2.3)

Collecting the season rewards opens the **off-season flow** (also from Home's off-season block). Six steps, in order, each revisitable from the stepper; Home shows the progress:

1. **Season review:** finish, titles, W-D-L and goals, best player (your yearly award winner, else your best-rated regular), revenue against the season before with the top lines, the fan base (local and global, against the start of the season), last season's shirt sales.
2. **Season card:** the season card deal (§4.7).
3. **Jersey**, 4. **Sponsor**, 5. **TV:** next season's deals. Signing is final. Not signed by kick-off: keep the kit maker and the line, renew the sponsor, take the first TV offer.
6. **CEO meeting:** how happy the owners are (board confidence, the objective's verdict, titles, promotion or relegation) and next season's objective (set from today's squad, fixed at kick-off), with a word on the contract.

The Transfer Market, cards and job offers stay available throughout. A new job brings that club's current deals (a local / national / global kit maker for a tier-3 / 2 / 1 club) and fresh offers.

**Fans** (`fansOf(state)`, §6.4) drive the deals, read against the middle of the division's range (local 15k / 100k / 450k at levels 3 / 2 / 1, worldwide × 2.5 / 5 / 15), clamped to 0.8–1.25×, so a giant's fan base counts as 1.25×. **Success** is last season's finish and trophies, 0–1 (`0.75 × (10 − position) / 9 + 0.12 × trophies`; 0.4 for a new career), worth 0.85–1.15×.

**Jersey (kit maker).** Three offers: your maker's renewal (+5% base) and the two other tiers.

| Maker | Reach (shirts) | Share of sales | Base (× kit unit) |
|---|---|---|---|
| 🌍 Global brand | 1.5× | 12% | 0.6 |
| 🏬 National brand | 1.15× | 13% | 1.6 |
| 🧵 Local maker | 0.8× | 15% | 2.5 |

- Kit unit = 8 × division multiplier × merchandise line (0.5 … 2.5). Bases vary ±12% by offer.
- Shirts sold = squad popularity × merchandise line × fans (60% local, 40% global) × success × 1,200 × reach × design × luck (0.9–1.1). Shop takings = shirts ÷ 100 coins (the maker's money, not the club's). **Club revenue = base + share × shop takings**, revealed on signing and paid over the 18 league matchdays.
- **Design:** keep the line (5% fewer shirts for every season it has been worn, down to 0.8×) or order a new design (one of seven patterns; 0.9–1.45× in its first season, so it can flop; costs 0.6 kit units). A popular squad makes the global brand pay; a modest one does better with the local maker's base.

**Sponsor.** Season value SV = Sponsorship base (3 / 6 / 11 / 17 / 24 / 32 at levels 0–5) × division multiplier × 0.8 × 22 games × fans × success. Offers vary ±15%.

| Offer | Signing bonus (matchday 1) | Per win (any competition) | Card |
|---|---|---|---|
| 🤝 Renewal (your sponsor) | — | 0.07 SV | a player pack (Bronze; Silver in tier 1) or an infrastructure card (Common/Uncommon in tier 3, Uncommon/Rare tier 2, Rare/Epic tier 1) |
| 💰 New: signing bonus | 0.55 SV | 0.04 SV | — |
| 📈 New: win bonus | 0.15 SV | 0.075 SV | — |

**TV rights.** T = division multiplier × (45 / 100 / 220 by tier 3 / 2 / 1) × global fans × success. Three channels (±20%), each a fixed fee over the league matchdays plus coins for every game of one kind, whatever the result:

| Offer | Fee | Variable |
|---|---|---|
| 📺 Per game | 0.45 T | 0.55 T ÷ 22 a game |
| 🏟 Per home game | 0.35 T | 0.65 T ÷ 11 a home game (any competition) |
| 🌐 International | 0.6 T | 0.12 T a continental or Club World Cup game |

Every signed deal (and every default) sends an inbox message; the season finances get **Sponsor**, **Kit deal**, **TV** and **Kit design** lines.

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

The objective comes from where your starting 7's strength ranks in the division: 1st–2nd → win the league, 3rd–4th → top 3, 5th–6th → top 6, lower → avoid relegation. Finishing at least 2 places better than the target (or winning the league when it wasn't expected) counts as exceeded.

Each pre-season, the club sets one objective based on its level and squad strength, for example "Avoid relegation", "Top 3", "Win the league", "Reach the continental semi-finals". It's shown on the Home screen with a progress indicator.

### 7.3 Job offers

- At season end you get **0–3 offers** from clubs whose required reputation is at or below yours. There's a small chance of a stretch offer just above it.
- Required reputation: **L3 clubs 0–30, L2 clubs 30–60, L1 clubs 60–100.** Bigger clubs within a level need more.
- **Stretch goal:** a big club approaches you mid-season after a hot streak.
- You can accept an offer or stay where you are.

### 7.4 Switching clubs: "take 2 cards"

When you accept an offer, you choose **any 2 cards** to bring. They can be from any family: a star player, your head coach, an Elite pack you haven't opened, an event, boosts.

**Everything else stays with your old club:** other players, coaches, inventory, coins and facility levels. The old club goes back to AI control.

At the new club you get its **club squad**: the named cards the club holds right now in the world, plus generic Commons to make 10, a coach of the club's level, its facilities and its treasury. Your old club keeps the named cards you leave behind.

| New club level | Squad | Coach | Treasury |
|---|---|---|---|
| L3 | 5 Common, 2 Uncommon, 1 Rare, 2 Academy | Common | 500 |
| L2 | 2 Common, 4 Uncommon, 3 Rare, 1 Epic | Uncommon | 1500 |
| L1 | 2 Uncommon, 4 Rare, 3 Epic, 1 Legend | Rare | 4000 |

Your 2 carried cards replace squad cards of your choice. Cards that move with you keep their matches left, stars and stats.

### 7.5 Owners, fans and getting sacked

- Two meters, 0–100: **Owners** (results against the objective: +2 a win, −3 a defeat, −1.5 a league match spent below target, cup exits) and **Fans** (wins, 3+ goal games, heavy defeats, trophies). The season verdict moves both (exceeded +18/+12, met +8/+4, missed −22/−10; promotion +10/+12). A new season at the same club brings back some patience.
- **Job security** = 65% owners + 35% fans, shown on Home and Career.
- You're sacked if security ends a season **under 30**, or if you **miss the objective 2 seasons in a row**. Reputation drops by 15.
- A sacked GM gets **exactly 3 offers**: from clubs below the old one, and always from a **level lower** if sacked by a top-flight club. You still take 2 cards with you.
- AI managers (one per club) gain and lose reputation by finishing above or below what their squad should achieve, win trophies, and get sacked after big misses. World → Managers ranks everyone, you included.

### 7.5b Looking for a job

Offers rarely arrive on their own (about 1 in 3 good seasons). In the off-season you can **Look for offers** once: 2–3 offers that match your reputation, at a cost of 6 owners' confidence. Clubs pay by size, not just level (`clubStart`): coins and facilities scale from the smallest to the biggest club of a level, and the giants (Real Madrid, Milan, Liverpool…) start with 9,000 coins and level 4–5 facilities.

### 7.6 Starting a career

- **New career** (three steps): your name, your **country of origin** (any nation in `src/data/nations.js`, shown with its flag) and a **GM style**; then your **GM card** is dealt face down and flipped (§7.7); then pick one of three job offers.
- A rookie GM starts with reputation **10** and picks from **3 offers from L3 clubs**, each one of the two weakest clubs in its league, with one club legend and journeymen for the rest. Season 1 is a fight to stay off the bottom.
- That club's squad is your starting squad, and you also get a free **Starter Pack** (3 players, 1 guaranteed Rare).
- **Stretch goal:** a "Sandbox" mode where you start at any club.

### 7.7 The GM card (v2.2)

One permanent card for the whole career (`state.gm.trait = { id, rarity }`), dealt at random from the style you pick: a random card of that style, at a random rarity (Common 45%, Uncommon 30%, Rare 18%, Epic 7%). Effects are modest by design. Code: `src/engine/gmTraits.js` (pure helpers that plug into the existing formulas).

| Style | Card | Common / Uncommon / Rare / Epic |
|---|---|---|
| Financial | 💰 **Money Man** | +5 / 6 / 8 / 10% on all club revenue (a "Money Man bonus" line on every match's income, and season prize money) |
| Financial | 🤝 **Dealmaker** | packs (player, coach, boost) and Transfer Market cards 10 / 12 / 14 / 15% cheaper |
| Tactical | 🧠 **Tactics Connoisseur** | 1 / 1 / 2 / 2 red tactics warnings turn grey ("covered by your Tactics Connoisseur card"): they count a third of a strength in the squad-suitability score, so the tactics grade improves |
| Tactical | 👁 **Game Reader** | skills you fire are 10 / 15 / 20% stronger; Epic: +1 skill per match (3 instead of 2) instead |
| Physical | 🏃 **Fitness Freak** | +6 / 8 / 10 / 12 team shape |
| Physical | 🛡 **Iron Squad** | stamina drains 5 / 7 / 9 / 12% slower |
| Cohesion | 📣 **Dressing-room Leader** | +2 / 3 / 3 / 4 cohesion per match |
| Cohesion | 🔗 **Continuity** | lineup changes cost 30 / 40 / 50 / 60% less cohesion |
| Personal | 🥂 **CEO's Friend** | owners' confidence gains ×1.2 / 1.25 / 1.3 / 1.4, losses ×0.8 / 0.75 / 0.7 / 0.6 |
| Personal | 🧣 **Fan Favourite** | the same for the fans |
| Personal | 🦁 **Coach Tamer** | coach-fit distance −1 / −1 / −2 / −2 (a clash can become a loose fit, a red grade grey) |
| Personal | 📺 **Media Darling** | reputation gains +10 / 12 / 15 / 20%, and +1 job offer whenever clubs call |

Careers from before v2.2 have no card: Career says so, and everything plays as before.

---

## 8. Stats and history (kept forever)

**Implemented (v1.6):** at every season end the whole world is archived (about 27 KB per season): for every league its final table (points, goals, clean sheets, W/D/L), top 8 scorers, Golden Boot, MVP (goals plus a bonus for the club's finish) and Golden Glove (best defence, named keeper where known); every cup and continental final (winner and runner-up) and the Club World Cup. All-time player records (league goals, MVPs, Golden Boots, Golden Gloves, best season, goals per club) fold in season by season. Your squad keeps all-time and current-season stats (apps, goals, assists, MOTM, clean sheets, average rating), and your career log keeps every season's club, finish, record, trophies and leaders. Screens: League → History (by season, records by league/country/world, my career, last summer), club pages, World (managers, clubs, records, Hall of Fame).

**Careers:** at every season end, before the stats book's season page resets, every player who played (every named card in the world plus all of your players) gets one line in `state.careers[id]`: `[year, club, apps, avgRating×10, goals, motm, cleanSheets, awardsMask]` (club 0 = same club as the line before, trailing zeros dropped; the mask covers Best Player, Top Scorer, Best GK, Best Young, and every league's Golden Boot, MVP and Golden Glove). Managers get `state.coachCareers[key] = [year, club, W, D, L, titles]` and every club an all-time record per competition (`state.clubRecords`). Every move of a named card is logged in `state.moves[id] = [year, from, to, type]` (academy, AI signing, your pack/signing, carried by you to a new job, released, retired). Division, league finish and team trophies come from the archive. About 35 KB raw per season for the whole world. Old saves start the log at their next season end (last season is backfilled from the stats book).

Every player name opens a **player page** (Overview: card, attributes, status, popularity, awards; History: clubs, moves, season by season with awards and trophies; Stats: this/last season and all-time by competition, career totals). Club pages have tabs (Overview, Squad, History with managers and signings/departures, Stats, Honours) and every manager name opens a **manager page** (Overview, History, Stats). Back returns to where you were.

The original plan, kept for reference:

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

1. **Home:** next fixture, coins, board objective, quick "Play" button, latest news and achievements. In the summer: the off-season flow's progress and its button (§6.5).
2. **Squad:** pitch view with 7 starters, 3 bench, head coach and assistant. Drag to swap. Cohesion meter.
3. **My cards:** players, coaches, inventory (boosts, off-season cards, unopened packs), card album with completion %, Hall of Fame.
4. **Shop:** packs and boosts all season. Pack opening with a rarity reveal and Keep/Discard.
5. **Transfer Market (Cards → Shop → Market, open all year):** transfer cards, club-area cards, season events and signing cards, with the season's card plays.
6. **Match:** pitch, commentary, decision drawer with subs, mentality and boosts. Penalty shootout view.
7. **Competitions:** league table, fixtures, top scorers, cup bracket, continental groups and bracket, Club World Cup.
8. **Career:** reputation, board objective, job offers, "take 2 cards" picker, GM history.
9. **History:** club timeline, trophy cabinet, Hall of Fame, world records, past winners.
10. **Club (tab, v2.2):** Overview (owners' philosophy, owners and fans, objective, contract, budget, income per match, this vs last season); Infrastructure (card plays, building works with progress bars, the ten areas with level pips, current and next effect); Finance (the kit, sponsor and TV deals, ticket prices, income per match by source, season money in and out, season-by-season history); Jersey (v2.3: the shirt in club colours with its design, maker and sponsor; the deal; this season's shirt sales and last season's); Effects (season event and temporary club cards with matches left, squad cohesion and popularity); Trophies.

**Visual direction**
- Dark pitch-green UI with bright rarity frames: grey, teal, blue, purple, gold.
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
| M2 | Reward loop + one season | Shop, all packs, pack opening with Keep/Discard, duplicates, "My cards", album, an 8-team league season, and an off-season Transfer Market (Career Extension, Stadium Evolution, Poach) |
| M3 | Full world | 38 divisions, card pool, AI simulation, promotion/relegation |
| M4 | Competitions | Domestic cups, 3 continental tournaments with Europe qualifying, Club World Cup, full calendar |
| M5 | Remaining card families | Other infrastructure, season events, cohesion, popularity/merch |
| M6 | GM career | Reputation, board objectives, offers, "take 2 cards", sacking |
| M7 | History and stats | Full stat tracking, Hall of Fame, records |
| M8 | Data and polish | Real data pass, visuals, animations, balance sweep |

---

## 12. Confirmed decisions

1. **Coins when switching clubs:** they stay with the old club. The 2 cards are everything you take.
2. **Cup format:** single-match knockout (3 or 4 rounds).
3. **Sacking:** miss the board objective 2 seasons in a row and you're fired.
4. **Division size:** 10 clubs, 18 league matches (8 and 14 until v1.9).
5. **Starting career:** a rookie GM picks from 3 offers from L3 clubs. Sandbox mode is a later stretch goal.
6. **Asia Other / APAC Other:** West and Central Asia / East Asia and Oceania.
7. **Rarities:** Common, Uncommon, Rare, Epic, Legend.
8. **Transfer Market:** off-season cards, not a weekly store. Signings are random: the card sets rarity and scope, not the player.

---

## 13. Progress

| Milestone | Status |
|---|---|
| M1 Core match + squad | **Done:** playable demo (see `README.md`), engine tests and balance script |
| M2 Reward loop + one season | **Done:** shop, 5 pack types, pack opening with Keep/Merge/Discard, "My cards" (squad, items, album, Hall of Fame), 8-club league season with table/fixtures/scorers, season prizes, off-season Transfer Market with 25 card types, cohesion, facilities, card pool of 112 players + 16 coaches |
| M3 Full world | **Done:** 38 divisions and 304 real clubs, 475 player cards (most tagged to their real club), the whole world plays every matchday (fast sim calibrated against the full engine), promotion/relegation with rating drift, world browser in the League tab |
| M4 Competitions | **Done:** domestic cups (16 or 8 clubs, lower division at home, penalties), European Cup with qualifying round, Americas and Africa–APAC Cups (2 groups of 4 → semis → neutral final), Club World Cup (3-team mini-league + final), all on one season calendar; qualification from last season's tables (season 1: by club strength); trophies with prize money and reward packs; Cups view in the League tab |
| M5 Club systems | **Done:** Club screen (facilities with current and next-level effects, season finances, popularity, cohesion, season event, trophy cabinet), popularity that grows with goals, man-of-the-match awards and trophies, season events called out in match commentary, active bonuses shown before kick-off, Cup Run and Continental Nights events |
| M6 GM career | **Done:** reputation 0–100, board objective each season (from your squad's strength vs the division), season review with reputation changes, job offers by required reputation, take-2-cards move (old club keeps your legends), sacking after 2 missed objectives, Career screen |
| Polish (GUI/UX) | **Done:** main menu with 3 save slots, new-career flow (name + 3 small-club offers), back up / restore saves (file or text), settings (match speed normal/fast/instant, auto-play, reduced motion, tips), one-time tips per screen, skip-to-full-time, quick-sell Commons and tap-to-reveal in pack opening, varied player portraits, installable app (manifest, offline cache, icons) and a GitHub Pages deploy workflow |
| Balance | **Done:** see §14 |
| Depth wave | **Done:** skills, tactics, boost rarities and packs, owners/fans confidence, AI managers, history book and records, league names, links to club pages, Cards hub, World tab, Live Broadcast style, wide layout for tablet and laptop |

**Measured economy (M2, 60 simulated seasons with the demo squad):** average finish 3.6th of 8, about 2,200 coins per season (around 4 Silver packs).

**Measured balance (M1, `npm run balance`):**
- About 3.1–3.5 goals per match between equal teams.
- Home team wins about 46%, draws about 27%.
- All four formations are viable.
- A team losing at 60' wins about 5% of the time and avoids defeat about 22% of the time. That's before boosts like Captain's Speech, which the player controls.

---

## 14. Balance

Tuned with `npm run career-sim`, a bot that plays whole careers the way a sensible player would: it picks its best 7, buys Silver or Gold packs and keeps upgrades, uses the Transfer Market and academy, and takes better job offers.

**Match engine:** strength gaps matter but don't decide everything. Equal teams: about 3.4 goals per game, home win 42%, draw 27%. A 12-point stronger side wins 73% at home and 62% away. In careers, a 4+ point favourite wins about 70%, and a 4+ point underdog about 25–30%. The fast AI-vs-AI simulation is calibrated to the same curve.

**AI edge:** AI squads get a settled-squad bonus (+10% in level-3 divisions, +14% level 2, +18% level 1) to match your cohesion and coaching, and to keep higher divisions tough. The board objective takes this into account.

**Reputation:** gains count ×0.6 in level-3 divisions, ×0.8 in level 2 and in full in level 1, and shrink as reputation rises (× (1 − reputation/140)). Losses count in full.

| Target | Measured (8 careers × 12 seasons) |
|---|---|
| First season: mid-table without luck | Average finish 4.4 of 8 |
| First promotion or move up within 2–5 seasons | Level-2 club by season 6 (median) for every career |
| Division 1 within about 5–8 seasons | 7 of 8 careers, median season 7 |
| A top club (reputation 85+) is a long-term goal | 2 of 8 careers by season 12 |
| Sackings are rare but real | About 4% of seasons |
| Packs: a few per season, not dozens | About 4–6 a season |
| Cards matter for several seasons | Kept cards last about 4.8 seasons before retiring |
| The world stays alive | Clubs keep about 3.6 named players each; continental titles spread across many clubs |

**Re-measured after v1.6** (8 bot careers × 12 seasons, `node scripts/career-sim.mjs 8 12`; season 1 also checked with 40 careers): season-1 average finish about 3.9; level-2 club by season 6 (median), level-1 by season 8; about 8% of seasons end in a sacking; favourites win about 67%; 4.0 goals per match (skills add chances). AI club styles were tuned so small clubs' tactics don't cost them points, and the AI settled edge is now 20/16/12% by level.


**Skill profiles (v1.7)**, `BOT=great|average|poor|bad node scripts/career-sim.mjs 16 14`, starting at one of the weakest bottom-tier clubs:

| Bot | Season 1 finish | Level-1 club (median) | Reputation for a giant (~85) | Sacked |
|---|---|---|---|---|
| Great (green tactics) | 1.4 | season 4 | season 5–6 | 1% of seasons |
| Average (coach's style) | 6.0, then 2.8 | season 7 | season 8 | 4% |
| Poor (clashes every other season) | 5.6 | season 7 (13/16) | season 14+ | 12% |
| Bad (random style, never improves the squad) | 7.1 | never | never | 40% |

Tactics grade (`node scripts/grade-check.mjs`, user-like squad vs equal AI, rival rating gap −4 / 0 / +4 / +8): green wins 80 / 72 / 57 / 45%; grey 64 / 52 / 40 / 32%; red 37 / 27 / 18 / 13% (losing 52% against equals). Team-wide bonus: green +15% (×coach quality), grey +7%, red −8%; AI settled edge 8 / 6 / 4% by level.


**Club management (v1.9)**, `BOT=… node scripts/career-sim.mjs 16 10`, same seeds before and after. The bot buys management cards in the summer (reserve 400 coins) and mid-season only from spare money (reserve 1,500, packs come first), signings first, then club areas (business before sports), then one event.

| Bot | Level-2 club (median) | Level-1 club | Top club | Sacked | Income season 1 / 6 / 10 | Area levels (of 50) by season 5 / 10 | Card plays used |
|---|---|---|---|---|---|---|---|
| Average, before | season 4 (16/16) | 14/16, season 8 | 9/16, season 9 | 13 | 912 / 3,987 / 7,189 | — | — |
| Average, after | season 4 (15/16) | 15/16, season 8 | 11/16, season 10 | 16 | 916 / 3,093 / 7,458 | 8 / 22 | 4–6 of 8 |
| Great, before → after | season 2 → 2 | season 4 → 4 | season 7 → 7 | 1 → 1 | 1,356 / 6,237 / 11,046 → 1,359 / 6,161 / 9,696 | 12 / 38 | 6–7 |
| Poor, before → after | season 4 → 6 | 10/16 s6 → 12/16 s8 | 7/16 → 7/16 | 31 → 30 | 996 / 3,583 / 4,539 → 995 / 2,934 / 4,446 | 5 / 11 | ~3 |

Business income (gate, hospitality, store, merchandise, sponsor) at season 10 is about 2,900 a season for the average bot against 2,570 for gate + merchandise before: a little more, for far more cards. Nobody comes close to maxing all ten areas in 10 seasons.

### Cohesion and shape (v1.8)

Two team meters, shown on Home and Squad → Starting 7.

- **Cohesion** (0–100): +4 to +12 per match (training fields), −10 for each starter changed from the last match. Worth up to +4% to +9% to all stats (training fields). Tactical Continuity sets a floor.
- **Shape** (0–100, Fresh ≥ 85 · OK ≥ 65 · Tired ≥ 45 · Exhausted): from **time on the field**. Each player's load is his share of the minutes over about the last 8 matches (moving average; subs count for their minutes). Loads above 65% wear the team down (goalkeepers at 30%). Shape sets kick-off stamina (75% + a quarter of shape) and, under 65, costs up to −7% stats. No injuries, no per-player tiredness. AI clubs don't track it.
- Measured with 12-card squads (v1.9, `LOAD_FREE` 0.55, `LOAD_COST` 15; it was 0.65 / 20 with 10 cards): the same 7 every match settles at about 57 (Tired, −1.6%); rotating one player a match stays about 81 (OK), two a match about 87 (Fresh).
- **Sports Science** (club card): +8 / 12 / 16 / 22 / 30 shape by rarity until the season ends (all next season if played in the summer), even without rotating. The **Spa & recovery** area adds +3 per level permanently, and the **Gym** slows stamina drain by 4% per level.

### World v1.9: 10-club divisions, 12-card squads

44 divisions × 10 clubs, 18 league matchdays, 2 up / 2 down, cup and European preliminary rounds, squads of 12 (5 reserves, still 3 subs). To keep a season's economy and card careers where they were:

- **Per-match pay** cut by about a quarter: league 45 / 20 / 8, cup 65 / 20 / 8, bonuses 15 (× multiplier); business income (gate, hospitality, store, merchandise, sponsor) × 0.8 per match. League prizes cover 10 places.
- **Card wear:** every 5th appearance is free (4 of 5 cost a match), for players and coaches. AI cards still lose 14 matches a season.
- **Confidence:** each match moves owners and fans 0.8× as much (18 games, not 14).
- **Board objectives** for 10 clubs: win the league / top 3 / top 6 / avoid relegation (8th or better).
- **Transfer Market** refreshes every 5 league matchdays (three times a season, as before).

`BOT=… node scripts/career-sim.mjs 16 14`, before (8-club world, before the club-management merge) → after:

| Bot | Season 1 finish | Level-1 club (median) | Sacked | Cards last | Income S1 / S8 / S14 |
|---|---|---|---|---|---|
| Great | 5.6 of 8 → 6.7 of 10 | season 5 → 5 (16/16) | 8% → 2% | 2.6 → 2.8 seasons | 856 / 8,892 / 11,774 → 981 / 7,455 / 13,284 |
| Average | 6.8 of 8 → 9.4 of 10 | season 6 → 7 (16/16) | 9% → 8% | 2.9 → 2.9 | 753 / 5,788 / 9,857 → 780 / 6,335 / 9,701 |
| Poor | 7.0 of 8 → 9.0 of 10 | season 11 (13/16) → 9 (9/16) | 26% → 18% | 3.4 → 3.0 | 816 / 2,899 / 3,908 → 960 / 4,316 / 5,133 |
| Bad | 7.9 of 8 → 9.6 of 10 | 1/16 → 2/16 (season 14) | 51% → 31% | 2.9 → 3.1 | 745 / 1,326 / 1,284 → 730 / 1,139 / 1,022 |

`scripts/grade-check.mjs` and `scripts/balance.mjs` give the same numbers as before (the match engine didn't change).


**After the world expansion (v2.0)**, 12 careers × 12 seasons (`BOT=… node scripts/career-sim.mjs 12 12`), tactics advice relative to the squad's own level, rookies start with 1 club legend and journeymen at the division's filler rating:

| Bot | Season-1 finish (of 10) | Level-1 club (median) | Top club (median) | Sacked |
|---|---|---|---|---|
| Great | 3.0 | season 4 | season 7 (12/12) | 1 of 144 seasons |
| Average | 5.4 | season 5 | season 8 (12/12) | 1 of 144 |
| Poor | 9.0 | season 9 (7/12) | 3/12 by season 12 | 27 of 144 |

### Three tiers (v2.1)

- **Tier 1 (level 1):** the top flights of Spain, England, Italy, Germany, France, Portugal, the Netherlands, Argentina and Brazil.
- **Tier 2 (level 2):** second divisions of the big four, plus Turkey, Belgium, Mexico (Liga MX) and Saudi Arabia.
- **Tier 3 (level 3):** third divisions of the big four, second divisions elsewhere, and every other league.
- You always start at one of the weakest clubs of a tier-3 league, and job offers never skip a tier (from tier 3 the best is tier 2).
- AI settled edge by level: 9 / 11 / 8%. Reputation gains are weighted 1 / 0.75 / 0.6 by level; tier-1 clubs ask 66–88 (giants 85+), tier 2 32–62.

Measured (`BOT=… node scripts/career-sim.mjs 16 8`):

| Bot | S1 | S2 | S3 | Tier-1 club (median) | Giant (median) | Sacked |
|---|---|---|---|---|---|---|
| Great | 5.8 | 2.6 | 1.4 | season 5 (16/16) | season 9 (15/16) | 0 of 128 seasons |
| Average | 6.2 | 3.6 | 1.7 | season 7 (16/16) | season 9 (9/16) | 4 of 128 |
| Poor | 9.4 | 6.9 | 7.8 | season 7 (6/16) | 2/16 | 36 of 128 |

### Club cards and club packs (v2.2)

Club-area cards left the Transfer Market for club packs (§4.6b), and the market sells transfer cards only. The career-sim bot buys up to 3 club packs each summer and 2 mid-season from spare money (Gold when it has 1,800 + twice the reserve, else Silver, Bronze in summer; poor bots Bronze only). It keeps the best card of 3 (great: value for the club, infrastructure first; average: highest rarity, infrastructure preferred; poor: the first card) and plays it straight away. Season events now come from the year-end season card draw, so the bot gets a stand-in free random event each summer (`SEASON_DRAW=0` turns it off).

`BOT=… node scripts/career-sim.mjs 12 6`, same seeds, before → after:

| Bot | Income S1–S6 (sum) | Income S6 | Area levels S3 / S6 (of 50) | Tier-2 club (median) | Tier-1 club | Sacked |
|---|---|---|---|---|---|---|
| Average | 14,793 → 14,782 | 4,059 → 4,400 | 6.9 / 10.5 → 4.0 / 9.1 | season 4 → 4 | 9/12 s5 → 9/12 s5 | 3 → 2 |
| Great | 20,644 → 20,851 | 6,038 → 6,360 | 7.4 / 15.9 → 5.4 / 13.7 | season 4 → 4 | 12/12 s5 → 12/12 s5 | 0 → 0 |
| Poor | 9,767 → 9,076 | 3,095 → 2,274 | 3.2 / 9.7 → 6.3 / 7.7 | 3/12 s7 → 1/12 s7 | 2/12 → 0/12 | 22 → 17 |

The bot keeps about 1–1.5 club packs a season (average: 40 Bronze, 31 Silver, 6 Gold over 12 × 6 seasons; 60% of kept cards infrastructure). Poor bots (Bronze only, few careers reaching a higher tier) are noisy at 12 careers.

### GM cards and season cards (v2.2)

`node scripts/career-sim.mjs` gives each bot career a GM style and a random GM card (`TRAIT=none` for none, `TRAIT=<id> TRAIT_RARITY=<rarity>` to force one); the great bot scores the season deal and redraws a weak hand when it has spare coins, the others take the first card (the auto-pick at kick-off).

Before the club-card merge, 16 careers × 8 seasons, v2.1 → v2.2 (season deal, pack wear, random GM card): average S1/S2/S3 finish 6.2 / 3.6 / 1.7 → 6.1 / 3.2 / 1.6, tier-1 club 16/16 (median season 7 → 5), giant 9/16 → 11/16 (median season 9), sacked 4 → 1 of 128; great 5.8 / 2.6 / 1.4 → 5.8 / 2.1 / 1.4, giant 15/16 → 14/16. Most of the gain is the free season card every summer (the old market event had to be bought).

After merging club cards (12 × 6, `BOT=average`): dev with its stand-in summer event draw → v2.2 with no GM card → v2.2 with a random GM card: reputation after season 6 is 58 → 58 → 61, tier-1 club 9/12 → 7/12 → 9/12 (median season 5), top club 2/12 → 3/12 → 4/12. A GM card is worth about +3 reputation over 6 seasons on average. The strongest single card measured is an Epic Tactics Connoisseur for a bot that plays its coach's preset regardless of the squad (season-1 finish 6.3 → 5.5, reputation 69 → 71 at season 6 before the merge, with covered warnings worth a third of a strength); Coach Tamer does nothing for a bot that already plays its coach's style.
