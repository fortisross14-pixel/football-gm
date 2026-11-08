// Generated artwork: club crests and player silhouettes. No real logos or photos.
import React from 'react';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorDistance(a, b) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function isLight(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// Kit colour for a team in a match; the away side switches kit on a clash.
export function kitColors(team, otherTeam, isAway) {
  const c = team.colors;
  if (isAway && otherTeam && colorDistance(c.primary, otherTeam.colors.primary) < 140) {
    return { primary: c.away, secondary: c.primary };
  }
  return { primary: c.primary, secondary: c.secondary };
}

export function Crest({ colors, short, size = 40 }) {
  const id = `crest-${short}-${size}`;
  const text = isLight(colors.primary) ? '#111' : '#fff';
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-label={`${short} crest`} role="img">
      <defs>
        <clipPath id={id}>
          <path d="M20 1 L38 6 V22 C38 34 30 41 20 45 C10 41 2 34 2 22 V6 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="46" fill={colors.primary} />
        <rect x="0" y="30" width="40" height="16" fill={colors.secondary} opacity="0.9" />
        <rect x="17" y="0" width="6" height="46" fill={colors.secondary} opacity="0.35" />
      </g>
      <path d="M20 1 L38 6 V22 C38 34 30 41 20 45 C10 41 2 34 2 22 V6 Z" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
      <text x="20" y="24" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="12" fill={text}>
        {short}
      </text>
    </svg>
  );
}

export function Silhouette({ colors, pos }) {
  const shirt = colors.primary;
  const trim = colors.secondary;
  const gloves = pos === 'GK';
  return (
    <svg viewBox="0 0 100 90" className="silhouette" aria-hidden="true">
      <defs>
        <linearGradient id={`skin-${pos}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c7d3cc" />
          <stop offset="1" stopColor="#97a99f" />
        </linearGradient>
      </defs>
      <rect x="44" y="40" width="12" height="14" rx="4" fill="#8fa198" />
      <path d="M50 10 c-10 0 -16 7 -16 17 c0 11 7 19 16 19 c9 0 16 -8 16 -19 c0 -10 -6 -17 -16 -17z" fill={`url(#skin-${pos})`} />
      <path d="M34 25 c0 -10 7 -16 16 -16 c9 0 16 6 16 16 c-4 -5 -10 -7 -16 -7 c-6 0 -12 2 -16 7z" fill="#2c3833" />
      <path
        d="M14 90 C14 68 26 56 40 52 L50 60 L60 52 C74 56 86 68 86 90 Z"
        fill={gloves ? '#2b2b2b' : shirt}
      />
      <path d="M40 52 L50 60 L60 52 L56 50 L50 55 L44 50 Z" fill={trim} />
      <path d="M14 90 C14 74 20 64 28 58 L30 90 Z" fill={trim} opacity="0.35" />
      <path d="M86 90 C86 74 80 64 72 58 L70 90 Z" fill={trim} opacity="0.35" />
    </svg>
  );
}
