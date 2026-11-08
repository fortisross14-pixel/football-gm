// Checks the real-badge mapping in src/data/badges.js against the source repos.
//
//   node scripts/check-badges.mjs            repo file listings from the GitHub API
//   node scripts/check-badges.mjs --head     HEAD request to every mapped raw URL instead
//   node scripts/check-badges.mjs --offline  mapping only, no network
//   add --all to print every club (default: only clubs without a working badge)
//
// Prints per club whether a mapped file exists, then coverage by division country.
import { CLUBS_BY_DIVISION } from '../src/data/world/index.js';
import { DIVISION_BY_ID } from '../src/data/world/structure.js';
import { badgeFiles, badgeUrls, SVG_REPO, PNG_REPO } from '../src/data/badges.js';

const args = new Set(process.argv.slice(2));
const mode = args.has('--offline') ? 'offline' : args.has('--head') ? 'head' : 'listing';

async function listing({ owner, repo, branch }) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'football-cards-check-badges' },
  });
  if (!res.ok) throw new Error(`${owner}/${repo}: HTTP ${res.status}`);
  const json = await res.json();
  if (json.truncated) console.warn(`warning: ${owner}/${repo} listing truncated`);
  return new Set(json.tree.map((t) => t.path.normalize('NFC')));
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

let svgFiles = null;
let pngFiles = null;
let effectiveMode = mode;
if (mode === 'listing') {
  try {
    [svgFiles, pngFiles] = await Promise.all([listing(SVG_REPO), listing(PNG_REPO)]);
  } catch (e) {
    console.warn(`Could not read repo listings (${e.message}); falling back to HEAD requests.`);
    effectiveMode = 'head';
  }
}

const clubs = Object.entries(CLUBS_BY_DIVISION).flatMap(([divId, list]) => list.map((c) => ({ ...c, country: DIVISION_BY_ID[divId].country })));
const rows = [];
await Promise.all(clubs.map(async (club) => {
  const { svg, png } = badgeFiles(club.id);
  let svgOk = !!svg;
  let pngOk = !!png;
  if (effectiveMode === 'listing') {
    svgOk = !!svg && svgFiles.has(`logos/${svg[0]}/${svg[1]}.svg`.normalize('NFC'));
    pngOk = !!png && pngFiles.has(`logos/${png[0]}/${png[1]}.png`);
  } else if (effectiveMode === 'head') {
    const urls = badgeUrls(club.id);
    svgOk = !!svg && await headOk(urls.find((u) => u.endsWith('.svg')));
    pngOk = !!png && await headOk(urls.find((u) => u.includes('raw.githubusercontent') && u.endsWith('.png')));
  }
  rows.push({ club, svg, png, svgOk, pngOk, ok: svgOk || pngOk });
}));

const order = new Map(clubs.map((c, i) => [c.id, i]));
rows.sort((a, b) => order.get(a.club.id) - order.get(b.club.id));
const showAll = args.has('--all');
const mark = (mapped, ok) => (!mapped ? '—' : ok ? '✓' : '✗');
for (const r of rows) {
  if (!showAll && r.ok) continue;
  const svg = r.svg ? `${r.svg[0]}/${r.svg[1]}.svg` : '';
  const png = r.png ? `${r.png[0]}/${r.png[1]}.png` : '';
  console.log(`${r.ok ? 'OK ' : 'MISSING'}  ${r.club.country.padEnd(20)} ${r.club.name.padEnd(28)} svg ${mark(r.svg, r.svgOk)} ${svg}  png ${mark(r.png, r.pngOk)} ${png}`);
}

const byCountry = new Map();
for (const r of rows) {
  const c = byCountry.get(r.club.country) || { ok: 0, total: 0 };
  c.total += 1;
  if (r.ok) c.ok += 1;
  byCountry.set(r.club.country, c);
}
console.log(`\nBadge coverage (${effectiveMode === 'offline' ? 'mapped, not checked' : `checked via ${effectiveMode}`}):`);
for (const [country, c] of byCountry) console.log(`  ${country.padEnd(22)} ${String(c.ok).padStart(2)}/${c.total}`);
const ok = rows.filter((r) => r.ok).length;
console.log(`  ${'Total'.padEnd(22)} ${ok}/${rows.length} (${((ok / rows.length) * 100).toFixed(1)}%)`);
console.log(`  SVG ${rows.filter((r) => r.svgOk).length}, PNG ${rows.filter((r) => r.pngOk).length}`);
