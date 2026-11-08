---
name: visual-check
description: Screenshot Football Cards at phone size and check it against the style and touch rules. Use after any change to src/ui or src/styles.css, before committing UI work.
---

# Visual check

1. `npm run build`, then serve it: `npx vite preview --port 4173 --strictPort` (background).
2. Run `node scripts/visual-check.cjs <outDir>`. It opens the game at iPhone 13 size (Playwright, already installed), starts a career, visits every main screen, opens a pack, plays a match with Skip, and saves full-page screenshots plus a list of console errors.
3. Look at every screenshot. Check:
   - **Nothing overflows sideways**; text never overlaps; the bottom tab bar and dock don't hide content you need.
   - **Touch targets ≥ 44 px** high; primary action is obvious (one green button per screen).
   - **Hierarchy:** big condensed numbers for what matters (score, OVR, coins), muted text for detail.
   - **Rarity colours** only mean rarity (grey, teal, blue, purple, gold).
   - Reduced motion: rerun with `REDUCE_MOTION=1` and confirm nothing animates beyond fades.
4. Fix what's wrong, then rerun once.
