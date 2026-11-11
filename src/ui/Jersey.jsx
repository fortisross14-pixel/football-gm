import React, { useId } from 'react';
import { PATTERN_LABEL, KIT_TIERS } from '../data/deals.js';

// The club's shirt, front view: club colours, a design pattern, the sponsor across the chest
// and the maker's name on the left breast.
const SHIRT = 'M38 10 L50 6 Q60 14 70 6 L82 10 L108 26 L98 48 L86 42 L86 112 L34 112 L34 42 L22 48 L12 26 Z';

function luminance(hex = '#000000') {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function Pattern({ pattern, color }) {
  switch (pattern) {
    case 'stripes': return <g fill={color}>{[34, 50, 66, 82, 98].map((x) => <rect key={x} x={x - 4} y="0" width="8" height="120" />)}</g>;
    case 'pinstripe': return <g fill={color}>{[30, 38, 46, 54, 62, 70, 78, 86, 94].map((x) => <rect key={x} x={x} y="0" width="1.6" height="120" />)}</g>;
    case 'hoops': return <g fill={color}>{[30, 54, 78, 102].map((y) => <rect key={y} x="0" y={y} width="120" height="11" />)}</g>;
    case 'sash': return <path d="M20 20 L44 20 L104 120 L80 120 Z" fill={color} />;
    case 'halves': return <rect x="60" y="0" width="60" height="120" fill={color} />;
    case 'chevron': return <path d="M30 34 L60 64 L90 34 L90 50 L60 80 L30 50 Z" fill={color} />;
    default: return null;
  }
}

export default function Jersey({ colors, pattern = 'plain', sponsor, maker, size = 140, label }) {
  const id = useId().replace(/:/g, '');
  const primary = colors?.primary || '#1f3cff';
  const secondary = colors?.secondary || '#ffffff';
  const same = Math.abs(luminance(primary) - luminance(secondary)) < 0.08;
  const trim = same ? (luminance(primary) > 0.5 ? '#0b0d12' : '#ffffff') : secondary;
  const ink = luminance(primary) > 0.55 ? '#0b0d12' : '#ffffff';
  const word = (sponsor || '').toUpperCase();
  const fontSize = Math.max(6, Math.min(11, 54 / Math.max(4, word.length) * 1.6));
  return (
    <svg className="jersey" viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={label || `${PATTERN_LABEL[pattern] || 'Plain'} shirt${sponsor ? ` with ${sponsor} on the front` : ''}`}>
      <defs><clipPath id={`shirt-${id}`}><path d={SHIRT} /></clipPath></defs>
      <path d={SHIRT} fill={primary} />
      <g clipPath={`url(#shirt-${id})`}>
        <Pattern pattern={pattern} color={trim} />
        <rect x="0" y="40" width="22" height="80" fill="rgba(0,0,0,.06)" />
        <rect x="98" y="40" width="22" height="80" fill="rgba(0,0,0,.06)" />
      </g>
      <path d={SHIRT} fill="none" stroke="rgba(11,13,18,.55)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 6 Q60 18 70 6" fill="none" stroke={trim} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M12 26 L22 48 M108 26 L98 48" stroke={trim} strokeWidth="3" />
      {maker && <text x="45" y="30" textAnchor="middle" fontSize="5" fontWeight="800" fill={ink} stroke={primary} strokeWidth="1.2" paintOrder="stroke" letterSpacing=".04em">{maker.split(' ')[0].toUpperCase()}</text>}
      <circle cx="75" cy="28" r="4.5" fill={trim} stroke={ink} strokeWidth="1" />
      {word && (
        <g>
          <text x="60" y="62" textAnchor="middle" fontSize={fontSize} fontWeight="900" fill={ink} stroke={primary} strokeWidth="2" paintOrder="stroke" style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{word}</text>
        </g>
      )}
    </svg>
  );
}

// The kit card used by the Club → Jersey tab and the off-season flow.
export function KitSummary({ state, kit = state.kit, sponsor = state.sponsor?.brand }) {
  if (!kit) return <p className="hint">No kit deal yet.</p>;
  return (
    <div className="kit-now">
      <Jersey colors={state.club.colors} pattern={kit.pattern} sponsor={sponsor} maker={kit.brand} />
      <ul className="champions kit-now__facts">
        <li><span>Maker</span><b>{KIT_TIERS[kit.tier]?.icon} {kit.brand}</b></li>
        <li><span>Design</span><b>{PATTERN_LABEL[kit.pattern] || 'Plain'}{kit.newDesign ? ' · new this season' : kit.age ? ` · worn ${kit.age + 1} seasons` : ''}</b></li>
        <li><span>On the shirt</span><b>{sponsor || '—'}</b></li>
        <li><span>Deal</span><b>◎ {kit.base} + {Math.round(kit.pct * 100)}% of sales</b></li>
      </ul>
    </div>
  );
}
