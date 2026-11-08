// English commentary lines. Each builder takes names and an rng.

const last = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 && !name.includes('Jr') ? parts.slice(1).join(' ') : name;
};

export const short = last;

export const lines = {
  goal: [
    (s, a, t) => `GOAL! ${s} finishes it off${a ? ` after a lovely ball from ${a}` : ''}!`,
    (s, a, t) => `GOAL for ${t}! ${s} buries it${a ? `, ${a} with the assist` : ''}.`,
    (s, a, t) => `${s} scores! ${a ? `${a} picked them out perfectly.` : 'What a strike.'}`,
    (s, a, t) => `It's in! ${s} makes no mistake${a ? ` from ${a}'s pass` : ''}.`,
  ],
  goldenGoal: [
    (s, a, t) => `GOAL! The Golden Chance falls to ${s}, and they take it!`,
  ],
  setPieceGoal: [
    (s, a, t) => `GOAL from the set piece! ${s} rises highest and heads it in!`,
  ],
  save: [
    (s, gk) => `${s} lets fly, but ${gk} gets down to save.`,
    (s, gk) => `Big save! ${gk} denies ${s} from close range.`,
    (s, gk) => `${s} forces ${gk} into a smart stop.`,
  ],
  miss: [
    (s) => `${s} drags the shot just wide.`,
    (s) => `${s} goes for goal but it sails over the bar.`,
    (s) => `Chance! ${s} can't keep it on target.`,
  ],
  post: [
    (s) => `Off the post! ${s} was inches away.`,
    (s) => `${s} hits the woodwork!`,
  ],
  block: [
    (s) => `${s} shoots, blocked by a brave defender.`,
    (s) => `${s}'s effort is charged down.`,
  ],
  control: [
    (t) => `${t} are dominating possession in midfield.`,
    (t) => `${t} keep the ball well and probe for an opening.`,
    (t) => `Patient build-up from ${t}.`,
  ],
  quiet: [
    () => 'A scrappy spell with few chances for either side.',
    () => 'Both teams cancel each other out in midfield.',
  ],
};

export function pickLine(rng, kind, ...args) {
  return rng.pick(lines[kind])(...args);
}
