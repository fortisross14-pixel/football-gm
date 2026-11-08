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

## Milestone 1: what's playable

- **Squad screen:** 7 starters on a pitch, 3 on the bench, head coach and assistant. Tap two cards to swap them, tap "View card" for the full card.
- **Friendly matches** against 3 opponents (Normal / Hard / Very hard), as League or Cup (knockout, with penalties), home or away.
- **Boosts:** bring up to 3 into a match and play them at any break (Golden Chance, Second Wind, Captain's Speech…).
- **The match:** 6 blocks of 15 minutes with live commentary, stamina rings, subs and mentality. Auto-play is available.
- **After the match:** coins, man of the match, player ratings. Cards lose 1 match each time they play and retire at 0.

Progress is saved in the browser.

## Code map

| Path | What it is |
|---|---|
| `src/engine/match.js` | Match engine (pure functions, seeded randomness) |
| `src/engine/cards.js` | Rarities, traits, formations, overall rating |
| `src/engine/aiTeam.js` | Builds AI squads from a club rating + key players |
| `src/state/club.js` | Your club's state, rewards, retirements, saving |
| `src/data/` | Demo club, opponents, boosts, coach passives |
| `src/ui/` | React screens and card components |
