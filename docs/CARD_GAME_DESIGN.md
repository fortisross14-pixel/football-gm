# Football Cards — Game Design Document (v1.6)

> Replaces the old management-sim design (`GAME_DESIGN_DOCUMENT.md`), which is kept for reference only.
> Language: English. Platform: web (React + Vite), mobile-first.

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
| L1 | Big 4 Division 1 | 78–86 | ×1.75 |
| L2 | Big 4 Division 2; Major Division 1; strongest single-division leagues (e.g. Turkey, Saudi Arabia, Mexico) | 70–78 | ×1.5 |
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
| Off-season | **Transfer Market** opens: play transfer cards (extend careers, evolve the stadium, sign players), play 1 season event, shop |
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
| **Off-season: Transfer Market** | Off-season market offer, rewards | Played in the off-season, then gone (§4.6) | Unlimited |
| **Off-season: Infrastructure** | Off-season market offer | Raises a facility at your current club by 1 level, then gone (§4.5) | Unlimited |
| **Off-season: Season events** | Off-season market offer (3 random) | Played in the off-season, lasts 1 season, then gone (§4.7) | Unlimited (1 played per season) |

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

### 4.5 Facilities (built with off-season cards)

Facility levels (0–5) **belong to the club**, not to you. If you leave, the levels stay behind. They're raised with the Club cards in the Transfer Market (§4.6). The card's **rarity sets the highest level it can build**:

| Rarity | Common | Uncommon | Rare | Epic | Legend |
|---|---|---|---|---|---|
| Builds | +1, up to level 2 | +1, up to level 3 | +1, up to level 4 | +1, up to level 5 | +2 levels |

| Facility | Effect at levels 0 / 1 / 2 / 3 / 4 / 5 |
|---|---|
| **Stadium** | Home-game income 30 / 45 / 60 / 80 / 100 / 125 × division multiplier |
| **Merchandise** | Squad popularity × 0.5 / 1 / 1.5 / 2 / 2.5 / 3 × 0.3 coins per match |
| **Training ground** | Cohesion +4 / 6 / 8 / 10 / 12 / 14 per match, and a max bonus of 4 / 5 / 6 / 7 / 8 / 10% all stats |
| **Youth academy** | Academy fill-ins rated 48 / 50 / 52 / 54 / 56 / 58, and better Youth Intake players |

Clubs start with levels that match their size. The demo club starts at stadium 1, merchandise 0, training 1, academy 0.

**Cohesion (0–100):** goes up after every match by the Training ground amount. Each new starter compared with the last match costs −10 (Tactical Continuity sets a floor). The bonus is cohesion% × the Training ground's max bonus.

### 4.6 Off-season cards and the Transfer Market

When the season ends, the **Transfer Market** opens with 9 off-season cards for sale. Every off-season card has a **rarity** that sets how strong it is, and **lower rarities appear more often** (Common 45%, Uncommon 28%, Rare 17%, Epic 8%, Legend 2%). You also get 1 random off-season card as a season reward.

There are **27 card types** in three groups:
- **Transfer:** squad moves. You can play as many as you like.
- **Club:** facilities and deals. You can play as many as you like.
- **Season event:** lasts the whole next season. Only **1 per season**.

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
| 🏟 **Stadium Evolution** | Club | Stadium +1 level, up to level 2. More income per home game. | Stadium +2 levels (max 5). More income per home game. | 250 → 2000 |
| 👕 **Merchandise Expansion** | Club | Merchandise +1 level, up to level 2. Popular players sell more shirts. | Merchandise +2 levels (max 5). | 220 → 1760 |
| 🏋 **Training Ground** | Club | Training ground +1 level, up to level 2. Faster, stronger cohesion. | Training ground +2 levels (max 5). | 250 → 2000 |
| 🏫 **Youth Academy** | Club | Youth academy +1 level, up to level 2. More and better academy players each off-season. | Youth academy +2 levels (max 5). | 250 → 2000 |
| 🤝 **Shirt Sponsor** | Club | +10 coins for every match next season. | +90 coins for every match next season. | 100 → 800 |
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

### 4.7 Season events

The season events are the "Season event" rows in the table above. Their effect lasts the whole next season, and a new one can be picked each off-season.

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
- **Named cards are Uncommon or better.** The rest of the 10-card squad is generic Common players with surname-only names. Their quality depends on the division, but they are always Common.
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

### 5.5 Tactics

Set on the Squad screen; AI clubs have a style (big clubs press and pass, smaller ones sit deeper and go direct), shown in the pre-match scouting.

| Instruction | Options and trade-offs |
|---|---|
| Pressing | Low block (−15% stamina drain, rivals +5% control) · Mid · High press (rivals −10% control, better chances, +35% stamina drain) |
| Passing | Short (+8% control, better chances, fewer shots) · Mixed · Direct (+10% shots, −8% control, worse chances unless forwards have PHY 78+) |
| Defensive line | Deep (rivals' chances worse, you shoot less) · Normal · High (rivals shoot less, but balls in behind are dangerous, worse with slow defenders; +5% drain) |

Counters: high press beats short passing; direct play beats the press and a high line; short passing picks a deep block apart. Synergies: a high press needs stamina (Fitness Guru coach, Second Wind, Fresh Legs, high-PHY squad). Each choice moves results by a few percent, never more than squad quality (`node scripts/tactics-check.mjs`).

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
| League win / draw / loss | 60 / 25 / 10 × division multiplier |
| Cup win / draw / loss | 80 / 25 / 10 × division multiplier |
| Continental win / draw / loss | 100 / 40 / 20 |
| Club World Cup win / draw / loss | 150 / 60 / 30 |
| Bonuses | Clean sheet +20, 3+ goals +20 (× multiplier) |
| Home game | Stadium income (§4.5) |
| Merchandise (every match) | Squad popularity × merchandise multiplier × 0.3 |
| League prizes (1st → 8th) | 600 / 350 / 250 / 180 / 120 / 90 / 60 / 30 × multiplier |
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

**Free packs** as rewards:

| Achievement | Reward |
|---|---|
| Promotion | Silver |
| Cup winner | Silver |
| Continental runner-up | 1,000 coins |
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

### 7.6 Starting a career

- A rookie GM starts with reputation **10** and picks from **3 offers from L3 clubs**.
- That club's squad is your starting squad, and you also get a free **Starter Pack** (3 players, 1 guaranteed Rare).
- **Stretch goal:** a "Sandbox" mode where you start at any club.

---

## 8. Stats and history (kept forever)

**Implemented (v1.6):** at every season end the whole world is archived (about 27 KB per season): for every league its final table (points, goals, clean sheets, W/D/L), top 8 scorers, Golden Boot, MVP (goals plus a bonus for the club's finish) and Golden Glove (best defence, named keeper where known); every cup and continental final (winner and runner-up) and the Club World Cup. All-time player records (league goals, MVPs, Golden Boots, Golden Gloves, best season, goals per club) fold in season by season. Your squad keeps all-time and current-season stats (apps, goals, assists, MOTM, clean sheets, average rating), and your career log keeps every season's club, finish, record, trophies and leaders. Screens: League → History (by season, records by league/country/world, my career, last summer), club pages, World (managers, clubs, records, Hall of Fame).

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

1. **Home:** next fixture, coins, board objective, quick "Play" button, latest news and achievements.
2. **Squad:** pitch view with 7 starters, 3 bench, head coach and assistant. Drag to swap. Cohesion meter.
3. **My cards:** players, coaches, inventory (boosts, off-season cards, unopened packs), card album with completion %, Hall of Fame.
4. **Shop:** packs and boosts all season. Pack opening with a rarity reveal and Keep/Discard.
5. **Transfer Market (off-season):** transfer cards, infrastructure, season events, and signing cards.
6. **Match:** pitch, commentary, decision drawer with subs, mentality and boosts. Penalty shootout view.
7. **Competitions:** league table, fixtures, top scorers, cup bracket, continental groups and bracket, Club World Cup.
8. **Career:** reputation, board objective, job offers, "take 2 cards" picker, GM history.
9. **History:** club timeline, trophy cabinet, Hall of Fame, world records, past winners.
10. **Club:** facility levels and income breakdown.

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
4. **Division size:** 8 clubs, 14 league matches.
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
