const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  let failures = 0;
  for (const config of [
    { name: 'iphone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false }
  ]) {
    const context = await browser.newContext(config);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.screenshot({ path: 'test-results/' + config.name + '-inicio.png', fullPage: true });
    const result = await page.evaluate(() => {
      const dashboard = document.getElementById('dashboard');
      const workspace = document.getElementById('ggWorkspace');
      return {
        title: document.title,
        dashboard: !!dashboard,
        workspace: !!workspace,
        navigationFunction: typeof window.ggView === 'function',
        communityFunction: typeof window.ggRenderCommunity === 'function',
        navButtons: dashboard?.querySelectorAll('.coord-nav button').length || 0
      };
    });
    console.log(config.name, JSON.stringify(result));
    if (!result.dashboard || !result.workspace || !result.navigationFunction || !result.communityFunction) failures++;
    if (result.navigationFunction && result.communityFunction) {
      try {
        await page.evaluate(() => {
          document.getElementById('dashboard')?.classList.add('active');
          window.ggView('club');
          window.ggRenderCommunity('network');
        });
        await page.screenshot({ path: 'test-results/' + config.name + '-comunidad.png', fullPage: true });
        const nav = await page.evaluate(() => ({
          back: document.querySelectorAll('#ggWorkspace > .gg-subscreen-back').length,
          tabs: [...document.querySelectorAll('#ggWorkspace .gg-community-tabs button')].map(x => x.textContent.trim()),
          visible: document.getElementById('dashboard')?.classList.contains('gg-subscreen')
        }));
        console.log(config.name + ' community', JSON.stringify(nav));
        if (nav.back !== 1 || nav.tabs.length !== 3 || !nav.visible) failures++;
        await page.evaluate(() => window.ggView('home'));
        const home = await page.evaluate(() => !document.getElementById('dashboard')?.classList.contains('gg-subscreen'));
        if (!home) failures++;
      } catch (e) { failures++; console.error(config.name + ' interaction:', e.message); }
    }
    if (errors.length) console.warn(config.name + ' page errors:', errors.slice(0, 10));
    await context.close();
  }
  await browser.close();
  if (failures) { console.error('Navigation smoke checks failed:', failures); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exitCode = 1; });
