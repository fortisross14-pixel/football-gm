// Club-coloured headers: background, text and accent stripe for the topbar, club page and
// fixture blocks. Most clubs use their primary colour with white or ink text picked by
// contrast; the clubs below have a hand-set identity (optional `text`, `accent`, and `header`
// when the kit colour itself is too bright for readable text).
//
// Looked up by club id, so saves made before these were added get them too.

export const CLUB_STYLE = {
  // Spain
  'real-madrid': { header: '#ffffff', text: '#3d195b', accent: '#f0b90b' },
  barcelona: { text: '#ffcd00', accent: '#004d98' },
  atletico: { accent: '#272e61' },
  villarreal: { text: '#005187', accent: '#005187' },
  sevilla: { text: '#d6001c', accent: '#d6001c' },
  valencia: { text: '#0b0d12', accent: '#ee7f00' },
  // England
  chelsea: { accent: '#6a9be0' },
  liverpool: { accent: '#f6eb61' },
  arsenal: { header: '#db0007', accent: '#ffffff' },
  'man-city': { text: '#1c2c5b', accent: '#ffffff' },
  'man-united': { accent: '#fbe122' },
  tottenham: { text: '#132257', accent: '#132257' },
  newcastle: { header: '#111111', accent: '#ffffff' },
  'aston-villa': { accent: '#95bfe5' },
  // Italy
  milan: { header: '#d6001c', text: '#ffffff', accent: '#000000' },
  inter: { text: '#ffffff', accent: '#000000' },
  juventus: { header: '#ffffff', text: '#000000', accent: '#000000' },
  napoli: { header: '#0e78bf', text: '#ffffff', accent: '#ffffff' },
  roma: { text: '#f0bc42', accent: '#f0bc42' },
  lazio: { text: '#0b1e3d', accent: '#ffffff' },
  // Germany
  bayern: { accent: '#0066b2' },
  dortmund: { text: '#000000', accent: '#000000' },
  leverkusen: { accent: '#000000' },
  // France, Portugal, Netherlands
  psg: { accent: '#da291c' },
  marseille: { text: '#0070b8', accent: '#2faee0' },
  lyon: { text: '#14387f', accent: '#e2001a' },
  benfica: { accent: '#ffffff' },
  'sporting-cp': { accent: '#ffffff' },
  ajax: { text: '#d2122e', accent: '#d2122e' },
  // Turkey, Scotland
  galatasaray: { accent: '#fdb912' },
  fenerbahce: { text: '#ffed00', accent: '#ffed00' },
  celtic: { accent: '#ffffff' },
  // Americas
  'boca-juniors': { text: '#f9b800', accent: '#f9b800' },
  'river-plate': { header: '#ffffff', text: '#0b0d12', accent: '#e30613' },
  flamengo: { accent: '#000000' },
  'america-mex': { text: '#0b2240', accent: '#0b2240' },
  'inter-miami': { text: '#231f20', accent: '#231f20' },
  penarol: { text: '#000000', accent: '#000000' },
  // Asia, Africa
  'al-nassr': { text: '#1e3a8a', accent: '#1e3a8a' },
  'al-hilal': { accent: '#ffffff' },
  'al-ahly': { accent: '#d4af37' },
};

const INK = '#0b0d12';
const WHITE = '#ffffff';
const YELLOW = '#ffd400';

function rgb(hex) {
  const h = String(hex || '#000').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// WCAG relative luminance and contrast ratio.
export function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const distance = (a, b) => {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

const hex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

// Darkens in small steps until white text reaches 4.5:1.
function deepen(bg) {
  const [r, g, b] = rgb(bg);
  for (let k = 0.96; k > 0.5; k -= 0.03) {
    const next = hex(r * k, g * k, b * k);
    if (contrast(WHITE, next) >= 4.5) return next;
  }
  return INK;
}

// White unless it fails 4.5:1 and ink does better.
export const autoInk = (bg) => (contrast(WHITE, bg) >= 4.5 || contrast(WHITE, bg) >= contrast(INK, bg) ? WHITE : INK);

const themeCache = new Map();

// team: { id, colors } (a club, a match team) or a bare colours object.
export function clubTheme(team) {
  const colors = team?.colors || team || {};
  const id = team?.colors ? team.id : undefined;
  const key = `${id}|${colors.primary}|${colors.secondary}|${colors.text}|${colors.accent}`;
  if (themeCache.has(key)) return themeCache.get(key);
  const style = { ...(CLUB_STYLE[id] || {}), ...(colors.text ? { text: colors.text } : {}), ...(colors.accent ? { accent: colors.accent } : {}) };
  let bg = style.header || colors.primary || INK;
  // Mid-tone kits (many reds) pass 4.5:1 with neither white nor ink: deepen the shade a touch.
  if (!style.text && Math.max(contrast(WHITE, bg), contrast(INK, bg)) < 4.5) bg = deepen(bg);
  const fg = style.text && contrast(style.text, bg) >= 4.5 ? style.text : autoInk(bg);
  let accent = style.accent || colors.secondary || fg;
  // A stripe in (almost) the background colour would vanish: use the text colour instead.
  if (distance(accent, bg) < 70) accent = fg;
  const light = luminance(bg) > 0.6;
  const theme = {
    bg, fg, accent, light, dark: luminance(bg) < 0.03,
    // On yellow kits the yellow coins chip turns ink.
    coinsInk: distance(bg, YELLOW) < 120,
  };
  themeCache.set(key, theme);
  return theme;
}

// CSS custom properties for a club-coloured block.
export function clubVars(team) {
  const t = clubTheme(team);
  return {
    '--club': t.bg,
    '--club-ink': t.fg,
    '--club-accent': t.accent,
    // Light headers get a hairline so they don't melt into the page.
    '--club-edge': t.light ? 'rgba(11, 13, 18, .16)' : 'transparent',
    // A thin light halo keeps dark badges (black crests on black kits) visible.
    '--badge-halo': t.dark ? 'rgba(255, 255, 255, .7)' : 'transparent',
    '--coins-bg': t.coinsInk ? INK : YELLOW,
    '--coins-ink': t.coinsInk ? YELLOW : INK,
  };
}
