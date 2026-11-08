---
name: motion
description: Football Cards' motion system (timing tokens, easing, the dark-pitch neon style, skip and reduced-motion rules) plus recipes for pack opening, card reveals, goals, results, trophies and screen changes. Use before adding or changing any animation, transition or visual effect in src/ui or src/styles.css.
---

# Motion

Football Cards should feel like **match night under floodlights**: a dark pitch, crisp white lines, neon green for "go", rarity colours that glow, and big condensed numbers. Motion is quick, confident and a little celebratory. It shows what happened; it never decides anything.

## Rules (all of them, every time)

1. **Tokens, not magic numbers.** Durations and easings live in CSS custom properties on `:root` in `src/styles.css` (`--t-instant` … `--t-ceremony`, `--ease-out` …). JS reads the same values through `src/ui/motion.js`.

   | Token        | ms          | Use                                               |
   | ------------ | ----------- | ------------------------------------------------- |
   | `instant`    | 80          | Press feedback                                    |
   | `quick`      | 160         | Selection, toggles, small state changes           |
   | `move`       | 240         | Sheets, tabs, a card sliding into place           |
   | `impact`     | 320         | Stamp rings, score pop, coin bump                 |
   | `reveal`     | 450         | Card flip, panel in                               |
   | `ceremony`   | up to 2400  | Pack opening, trophy, promotion (total, skippable) |

   | Easing                                  | Use                         |
   | --------------------------------------- | --------------------------- |
   | `--ease-out` cubic-bezier(.2,.8,.2,1)   | Things arriving             |
   | `--ease-in` cubic-bezier(.6,0,.8,.2)    | Things leaving              |
   | `--ease-in-out` cubic-bezier(.65,0,.35,1) | Things moving across      |
   | `--ease-back` cubic-bezier(.34,1.56,.64,1) | Stamps, badges, stars (small overshoot) |

2. **Input never waits for decoration.** A tap during an animation acts at once or jumps the animation to its end. Every ceremony (pack opening, trophy, season end) can be skipped. Game state is already final when the animation starts.
3. **Reduced motion:** both `prefers-reduced-motion` and the in-game "Reduce motion" setting (`html.reduce-motion`) replace movement with short fades and turn off shakes, trembles and sweeps.
4. **Performance:** animate only `transform` and `opacity` (and `filter` sparingly for glow pulses on one element). No layout properties. Keep particle counts small (≤ 24 DOM nodes per burst) and remove them when done.
5. **Scale juice to importance** (see `game-feel`): a button press gets a squish; a common card gets a flip; a Legend gets tremble + flip + stamp + light sweep + coin-like particles. A goal for you gets banner + score pop + vibration; a goal against gets a quieter banner.
6. **Style vocabulary:** floodlight beams, pitch stripes, chalk lines drawn on, neon edge glows in the rarity colour, foil light sweeps on Epic and Legend cards, confetti in club colours for trophies. No skeuomorphic textures, no bloom fog.
7. **Sound hooks:** every recipe calls `sfx('name')` from `src/ui/motion.js` (a no-op for now) so audio can be added later.

## Recipes

### Pack opening (≈ 1.6 s for 3 cards, skippable)
1. The pack sits centre screen and **breathes** (scale 1 ↔ 1.03, 1.6 s loop) with a slow light sweep. "Tap to open".
2. Tap: the pack **shakes** briefly (±3°, 3 cycles, 300 ms), then **bursts**: it scales up and fades while the cards slide out face down.
3. **Anticipation:** face-down Rare+ cards glow at the edge in their rarity colour; Epic and Legend cards **tremble** (±1.5°, 2 cycles) before flipping.
4. **Flip:** 3D `rotateY` 180° → 0 with `perspective`, both faces `backface-visibility: hidden`, 450 ms, scale 1 → 1.06 → 1.
5. **Land:** a stamp ring in the rarity colour; Epic/Legend add a foil light sweep and a small particle burst.
6. **Badges:** "NEW" for a card never owned (album), "DUPLICATE" when it would merge.
7. "Reveal all" flips everything at once; "Skip" jumps to the end state.

### Goal
Banner slams in (`--ease-back`, 320 ms), scorer token pulses, the score digit pops; your goals also vibrate the phone (60 ms). Opponent goals: banner only, smaller.

### Result
Headline drops in, coins count up (900 ms, ease-out), reward rows stagger in 60 ms apart, man-of-the-match card flips last.

### Trophy / promotion
Gold confetti in club colours (≤ 24 pieces), trophy icon stamps in with `--ease-back`, title text rises 12 px and fades in.

### Screens and sheets
Tab change: content fades/rises 8 px over `move`. Sheets slide up over `move` with `--ease-out`, backdrop fades over `quick`.

Before committing motion work, run `review-animations` and the `visual-check` skill.
