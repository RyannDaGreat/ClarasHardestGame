import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
const url = process.argv[2] || 'http://127.0.0.1:8766/build/';
const output = 'validation/output/player-ui';
await mkdir(output, {recursive:true});
const browser = await puppeteer.launch({headless:true, ...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error)));
const ready = () => page.waitForFunction(() => window.assetsReady, {timeout:300000});
const results = {};
try {
  await page.setViewport({width:1440, height:1100, deviceScaleFactor:1});
  await page.setCacheEnabled(false);
  await page.goto(url);
  await page.screenshot({path:output + '/loading.png'});
  await ready();
  results.firstLoad = await page.evaluate(() => ({...cacheStats, started:Boolean(window.gameStarted)}));
  assert(results.firstLoad.downloads > 0);
  assert.equal(results.firstLoad.started, false);
  await page.screenshot({path:output + '/desktop-ready.png'});
  assert.equal(await page.$eval('#start', node => node.disabled), false);
  assert(await page.$eval('a[aria-label="View source on GitHub"]', node => node.href.endsWith('/ClarasHardestGame')));
  const manifest = await page.evaluate(async () => (await fetch('assets/assets.json')).json());
  const assetURLs = new Set([...manifest.game.chunks, ...manifest.files].map(file => new URL('assets/' + file.url, url).href));
  let blocked = [];
  let repairURL = null;
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (assetURLs.has(request.url()) && request.url() !== repairURL) {
      blocked.push(request.url());
      request.abort();
    } else request.continue();
  });
  await page.reload();
  await ready();
  results.cachedLoad = await page.evaluate(() => ({...cacheStats}));
  assert.equal(blocked.length, 0, 'Cached reload must not request any game asset');
  assert.equal(results.cachedLoad.downloads, 0);
  assert(results.cachedLoad.hits > 0);
  repairURL = [...assetURLs][0];
  await page.evaluate(async damagedURL => {
    const name = (await caches.keys()).find(name => name.startsWith('rhg-assets-v1:'));
    await (await caches.open(name)).put(damagedURL, new Response(new Uint8Array([0])));
  }, repairURL);
  await page.reload();
  await ready();
  results.repairedLoad = await page.evaluate(() => ({...cacheStats}));
  assert.equal(results.repairedLoad.downloads, 1);
  assert.equal(blocked.length, 0);
  assert(await page.$eval('#log', node => node.textContent.includes('Cached file failed verification')));
  await page.setViewport({width:390, height:844, deviceScaleFactor:1});
  await page.screenshot({path:output + '/mobile-ready.png'});
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.setViewport({width:1440, height:1100, deviceScaleFactor:1});
  await page.click('#start');
  await page.waitForFunction(() => window.gameStarted);
  assert(await page.$eval('#overlay', node => node.hidden));
  assert(await page.$eval('#canvas', node => document.activeElement === node));
  await page.screenshot({path:output + '/playing.png'});
  await page.click('#fullscreen');
  await page.waitForFunction(() => document.fullscreenElement?.id === 'player');
  await page.click('#fullscreen');
  await page.waitForFunction(() => !document.fullscreenElement);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS: automatic download, verified cache-only reload, corrupt-cache repair, single Play click, responsive layout and fullscreen.');
  // Specific expected storage failure: report the limitation but still prepare playable data.
  page.removeAllListeners('request');
  await page.setRequestInterception(false);
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'caches', {value:{open:async () => {throw new DOMException('Storage denied by test', 'SecurityError');}}});
  });
  await page.reload();
  await ready();
  assert(await page.$eval('#storage-warning', node => !node.hidden && node.textContent.includes('may download again')));
  results.storageDenied = await page.evaluate(() => ({...cacheStats}));
  results.pass = true;
  console.log('PASS: denied browser storage is visibly reported and game remains playable.');
} finally {
  await writeFile(output + '/results.json', JSON.stringify({...results, errors}, null, 2) + '\n');
  await browser.close();
}
