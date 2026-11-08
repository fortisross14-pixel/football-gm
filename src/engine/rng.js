// Small seeded RNG so matches can be replayed and balance-tested headlessly.
// The RNG state is a plain number stored in the match state, which keeps the
// engine pure: every function takes state in and returns new state out.

export function nextRandom(seed) {
  let t = (seed + 0x6d2b79f5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return { value: ((r ^ (r >>> 14)) >>> 0) / 4294967296, seed: t };
}

// Mutable wrapper used inside a single engine step.
export function makeRng(seed) {
  const rng = {
    seed: seed >>> 0,
    next() {
      const out = nextRandom(rng.seed);
      rng.seed = out.seed;
      return out.value;
    },
    int(min, max) {
      return min + Math.floor(rng.next() * (max - min + 1));
    },
    pick(list) {
      return list[Math.floor(rng.next() * list.length)];
    },
    weighted(items, weightOf) {
      const total = items.reduce((sum, item) => sum + Math.max(0, weightOf(item)), 0);
      if (total <= 0) return items[0];
      let roll = rng.next() * total;
      for (const item of items) {
        roll -= Math.max(0, weightOf(item));
        if (roll <= 0) return item;
      }
      return items[items.length - 1];
    },
    poisson(lambda) {
      const limit = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k += 1;
        p *= rng.next();
      } while (p > limit);
      return k - 1;
    },
  };
  return rng;
}

export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}
