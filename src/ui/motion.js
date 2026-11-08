// Motion helpers shared by screens. Durations mirror the CSS tokens in styles.css.
export const MOTION = { instant: 80, quick: 160, move: 240, impact: 320, reveal: 450, ceremony: 2400 };

// Sound hook: every animation recipe names its cue here, so audio can be added later.
export function sfx(name) {
  void name;
}

export function reducedMotion() {
  try {
    return document.documentElement.classList.contains('reduce-motion')
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // not supported
  }
}
