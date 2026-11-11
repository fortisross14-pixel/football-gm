// Clicks through every tab and sub-tab with a saved game and reports page errors.
// Usage: (serve the build on :4173, or set SMOKE_PORT) node scripts/smoke.cjs <save.json> [outDir] [width]
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const save = fs.readFileSync(process.argv[2], 'utf8');
  const out = process.argv[3] || 'smoke';
  const width = Number(process.argv[4]) || 390;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height: width > 600 ? 900 : 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((s) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const st = JSON.parse(s);
    st.pendingOpen = null;
    st.pendingPick = null;
    localStorage.setItem(`football-cards-v${st.version}-slot-1`, JSON.stringify(st));
    localStorage.setItem(`football-cards-v${st.version}-slots`, JSON.stringify({ 1: { gmName: st.gmName, club: st.club.name, short: st.club.short, colors: st.club.colors, division: st.club.division, season: st.season.year, reputation: st.gm.reputation, trophies: 0, updated: Date.now() } }));
    localStorage.setItem('football-cards-settings', JSON.stringify({ speed: 'instant', autoplay: false, reduceMotion: true, tips: false }));
  }, save);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name) => page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  const step = async (name, fn) => { try { await fn(); await page.waitForTimeout(250); await shot(name); } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); } };

  await page.goto(`http://localhost:${process.env.SMOKE_PORT || process.env.PORT || 4173}/`);
  await page.waitForTimeout(500);
  await page.click('.slot__main');
  await page.waitForTimeout(400);
  await step('home', async () => {});
  await step('squad', () => page.click('.tabbar button:nth-child(2)'));
  await step('tactics', () => page.click('.screen--squad-wrap .segmented__opts button:nth-child(2)'));
  await step('tactics-catenaccio', () => page.click('text=Catenaccio'));
  await step('cards-owned', () => page.click('.tabbar button:nth-child(4)'));
  await step('cards-shop', () => page.click('.hub__switch .segmented__opts button:nth-child(2)'));
  await step('cards-shop-market-buy', () => page.click('.ocard:not([disabled]) >> nth=0'));
  await step('cards-shop-club', () => page.click('.screen .segmented__opts button:nth-child(2)'));
  // Club pack: buy a Silver, open it, reveal the 3 cards, pick one.
  await step('club-pack-sealed', () => page.click('.pack-row:has-text("Silver Club Pack") .btn--primary'));
  await step('club-pack-fan', () => page.click('.opening .sealed'));
  await step('club-pack-revealed', () => page.click('.opening button:has-text("Reveal all")'));
  await step('club-pack-picked', () => page.click('.opening .flip--club >> nth=1'));
  await step('club-pack-kept', () => page.click('.opening .btn--primary:has-text("Keep")'));
  await step('cards-club', () => page.click('.hub__switch .segmented__opts button:nth-child(1)').then(() => page.click('.screen .segmented__opts button:nth-child(2)')));
  await step('cards-club-use', () => page.click('.ocard-grid .ocard >> nth=0'));
  await step('cards-club-used', () => page.click('.use-card .btn--primary:not([disabled])', { timeout: 2000 }).catch(() => page.keyboard.press('Escape')));
  await step('cards-season', () => page.click('.screen .segmented__opts button:nth-child(3)'));
  await step('cards-players', () => page.click('.screen .segmented__opts button:nth-child(1)'));
  await step('cards-items-use', () => page.click('.ocard-grid .ocard >> nth=0'));
  await step('cards-items-used', () => page.click('.use-card .btn--primary:not([disabled])', { timeout: 2000 }).catch(() => page.keyboard.press('Escape')));
  // A played signing card opens the new-card overlay: decide on everything before moving on.
  for (let i = 0; i < 12 && await page.locator('.opening').count(); i += 1) {
    if (await page.locator('.opening .link-btn:has-text("Skip")').count()) await page.click('.opening .link-btn:has-text("Skip")', { force: true });
    await page.waitForTimeout(150);
    const discard = page.locator('.opening button:has-text("Discard")');
    if (await discard.count()) await discard.first().click({ force: true });
    await page.waitForTimeout(150);
  }
  await step('club-management', () => page.click('.topbar__crest'));
  // The Club tab and its sub-tabs.
  await step('club-overview', () => page.click('.tabbar button:nth-child(3)').then(() => page.click('.screen--club > .segmented button:nth-child(1)')));
  await step('club-infra', () => page.click('.screen--club > .segmented button:nth-child(2)'));
  await step('club-fans', () => page.click('.screen--club > .segmented button:nth-child(3)'));
  await step('club-finance', () => page.click('.screen--club > .segmented button:nth-child(4)'));
  await step('club-finance-high', () => page.click('.screen--club .panel .segmented button:has-text("High")'));
  await step('club-effects', () => page.click('.screen--club > .segmented button:nth-child(5)'));
  await step('club-trophies', () => page.click('.screen--club > .segmented button:nth-child(6)'));
  // Building works from a club-area card, when the save has one.
  await step('club-build-card', async () => {
    await page.click('.tabbar button:nth-child(4)');
    await page.click('.screen .segmented__opts button:nth-child(2)');
    const card = page.locator('.ocard-grid .ocard:has-text("Stadium")');
    if (!(await card.count())) return;
    await card.first().click();
    await page.click('.use-card .btn--primary:not([disabled])', { timeout: 2000 }).catch(() => page.keyboard.press('Escape'));
  });
  await step('club-build-started', () => page.click('.tabbar button:nth-child(3)').then(() => page.click('.screen--club > .segmented button:nth-child(2)')));
  await step('league', () => page.click('.tabbar button:nth-child(5)'));
  await step('competitions', async () => {});
  await step('comp-cup', () => page.click('.comp-card--cup'));
  await step('comp-cup-history', () => page.click('.comp-screen .segmented__opts button:nth-child(3)'));
  await step('comp-league', () => page.click('.tabbar button:nth-child(5)').then(() => page.click('.comp-card--league')));
  await step('league-history', () => page.click('.league__controls >> text=History'));
  await step('team', () => page.click('.tabbar button:nth-child(5)').then(() => page.click('.comp-card--league')).then(() => page.click('.table .xlink >> nth=0')));
  await step('team-squad', () => page.click('.team-page > .segmented >> text=Squad'));
  await step('team-history', () => page.click('.team-page > .segmented >> text=History'));
  await step('team-stats', () => page.click('.team-page > .segmented >> text=Stats'));
  await step('team-honours', () => page.click('.team-page > .segmented >> text=Honours'));
  await step('team-player', () => page.click('.team-page > .segmented >> text=Squad').then(() => page.click('.table--squad .xlink >> nth=0')));
  await step('team-back', () => page.click('.club-head .btn--ghost'));
  await step('world', () => page.click('.tabbar button:nth-child(6)'));
  await step('player', () => page.click('.stats .table .xlink >> nth=0'));
  await step('player-history', () => page.click('.profile > .segmented >> text=History'));
  await step('player-stats', () => page.click('.profile > .segmented >> text=Stats'));
  await step('player-club', () => page.click('.profile > .segmented >> text=Overview').then(() => page.click('.profile__facts .xlink >> nth=0')));
  await step('player-back', () => page.click('.club-head .btn--ghost').then(() => page.click('.club-head .btn--ghost')));
  await step('manager', () => page.click('.stats .segmented__opts >> text=Coaches').then(() => page.click('.stats .table .xlink >> nth=0')));
  await step('manager-history', () => page.click('.profile > .segmented >> text=History'));
  await step('manager-stats', () => page.click('.profile > .segmented >> text=Stats'));
  await step('manager-back', () => page.click('.club-head .btn--ghost'));
  await step('world-managers', () => page.click('.screen > .segmented >> text=Managers').then(() => page.click('.table .xlink >> nth=0')));
  await step('world', () => page.click('.tabbar button:nth-child(6)'));
  await step('world-stats-coaches', () => page.click('.stats .segmented__opts >> text=Coaches'));
  await step('world-awards', () => page.click('.screen > .segmented .segmented__opts button:nth-child(2), .screen .segmented__opts button:nth-child(2) >> nth=0'));
  await step('world-clubs', () => page.click('.screen .segmented__opts button:nth-child(2)'));
  await step('world-records', () => page.click('.screen .segmented__opts button:nth-child(3)'));
  await step('world-hof', () => page.click('.screen .segmented__opts button:nth-child(4)'));
  await step('career', () => page.click('.topbar__menu').then(() => page.click('text=Career')));
  await step('prematch', () => page.click('.tabbar button:nth-child(1)').then(() => page.click('.next-match .btn--primary')));
  await step('match', () => page.click('text=Kick off'));
  await step('match-played', async () => { for (let i = 0; i < 4; i += 1) { await page.click('.dock .btn--primary.btn--grow'); await page.waitForTimeout(150); } });
  await step('match-skill', () => page.click('.skill >> nth=0'));
  console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no errors');
  await browser.close();
})();
