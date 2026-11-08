// Screenshots the main screens and the pack-opening sequence at phone size.
// Usage: (serve the build on :4173) node scripts/visual-check.cjs <outDir> [saveJson]
// With a save file, it is loaded into slot 1 first. REDUCE_MOTION=1 turns the in-game setting on.
const { chromium, devices } = require('playwright');
const fs = require('fs');

(async () => {
  const out = process.argv[2] || 'visual-check';
  const savePath = process.argv[3];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const save = savePath ? fs.readFileSync(savePath, 'utf8') : null;
  await ctx.addInitScript(([s, reduce]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    if (s) {
      const st = JSON.parse(s);
      localStorage.setItem('football-cards-v3-slot-1', s);
      localStorage.setItem('football-cards-v3-slots', JSON.stringify({ 1: { gmName: st.gmName, club: st.club.name, short: st.club.short, colors: st.club.colors, division: st.club.division, season: st.season.year, reputation: st.gm.reputation, trophies: 0, updated: Date.now() } }));
    }
    localStorage.setItem('football-cards-settings', JSON.stringify({ speed: 'normal', autoplay: false, reduceMotion: !!reduce, tips: false }));
  }, [save, !!process.env.REDUCE_MOTION]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name, full = false) => page.screenshot({ path: `${out}/${name}.png`, fullPage: full });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(600);
  await shot('01-menu');
  if (save) await page.click('.slot__main');
  else {
    await page.click('text=New career');
    await page.click('.offer--pick >> nth=0');
    await page.click('text=/^Sign with/');
  }
  await page.waitForTimeout(500);
  await shot('02-home', true);

  // Pack opening: open the first unopened pack from Cards → Items.
  await page.click('.tabbar button:nth-child(3)');
  await page.click('.segmented__opts button:nth-child(2)');
  await page.click('.pack-btn');
  await page.waitForTimeout(400);
  await shot('03-pack-sealed');
  await page.click('.sealed', { force: true });
  await page.waitForTimeout(150);
  await shot('04-pack-shake');
  await page.waitForTimeout(1100);
  await shot('05-fan-facedown');
  await page.click('text=Reveal all', { force: true });
  await page.waitForTimeout(420);
  await shot('06-fan-flipping');
  await page.waitForTimeout(900);
  await shot('07-fan-revealed');
  await page.click('text=Continue', { force: true });
  await page.waitForTimeout(500);
  await shot('08-decide');
  for (let i = 0; i < 6 && await page.locator('.opening').count(); i += 1) {
    await page.click('text=/^Discard/').catch(() => {});
    await page.waitForTimeout(300);
  }

  for (const [i, name] of [[2, 'squad'], [4, 'shop'], [5, 'league']]) {
    await page.click(`.tabbar button:nth-child(${i})`);
    await page.waitForTimeout(400);
    await shot(`09-${name}`, true);
  }
  await page.click('.tabbar button:nth-child(1)');
  await page.click('text=/^Play/');
  await page.click('text=Kick off');
  await page.waitForTimeout(300);
  await page.click('text=/Skip/');
  await page.waitForTimeout(400);
  await page.click('text=See result');
  await page.waitForTimeout(500);
  await shot('10-result');
  await page.waitForTimeout(900);
  await shot('11-result-settled', true);

  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})();
