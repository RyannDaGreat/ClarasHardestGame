import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';

const origin =
  process.env.SITE_URL || `http://127.0.0.1:${server.address().port}/web/`;
const catalog = JSON.parse(await readFile('web/levels/catalog.json', 'utf8'));
const requested = process.env.LEVEL_NAMES?.split(',');
const entries = requested
  ? catalog.filter((entry) => requested.includes(entry.name))
  : catalog;
if (requested)
  assert.equal(
    entries.length,
    requested.length,
    'Every requested level must be catalogued',
  );
const output = 'validation/reforged/expansion';
await mkdir(output, {recursive: true});
const browser = await puppeteer.launch({headless: true});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => {
  errors.push(String(error));
  console.error(error);
});
try {
  await page.setViewport({width: 1680, height: 1100});
  await page.goto(origin + 'reforged/');
  await page.waitForFunction(() => window.reforgedEditor, {timeout: 60000});
  for (const entry of entries) {
    const level = JSON.parse(
      await readFile('web/reforged/levels/' + entry.name + '.json', 'utf8'),
    );
    await page.evaluate(
      (level) => window.reforgedEditor.validate(level),
      level,
    );
    console.log('EDITOR_VALID', entry.name);
  }
  for (const entry of entries) {
    const errorsBefore = errors.length;
    await page.goto(origin + '?reforged=' + encodeURIComponent(entry.name));
    await page.waitForFunction(
      () =>
        window.assetsReady ||
        document
          .querySelector('#status')
          .textContent.startsWith('Unable to start'),
      {timeout: 300000},
    );
    assert(
      await page.evaluate(() => window.assetsReady),
      'Assets failed: ' + entry.name,
    );
    await page.click('#start');
    await page.waitForFunction(() => window.reforgedStatus?.ticks >= 120, {
      timeout: 120000,
    });
    const before = await page.evaluate(() => ({
      title: document.title,
      status: window.reforgedStatus,
      width: canvas.width,
      height: canvas.height,
    }));
    assert(before.title.startsWith(entry.name));
    assert.equal(before.width, 1920);
    assert.equal(before.height, 1080);
    assert(before.status.ships.length > 0, 'Player absent');
    assert.equal(before.status.won, false, 'Spawn must not start on finish');
    const canvasElement = await page.$('#canvas');
    await canvasElement.screenshot({
      path: output + '/' + entry.name + '-start.png',
    });
    if (!process.env.SITE_URL)
      await canvasElement.screenshot({
        path: 'web/levels/previews/' + entry.name + '.png',
      });
    await canvasElement.click();
    const input = entry.testKey || 'KeyD';
    await page.keyboard.down(input);
    await new Promise((resolve) => setTimeout(resolve, 400));
    await page.keyboard.up(input);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const after = await page.evaluate(() => window.reforgedStatus);
    assert(after.ticks > before.status.ticks, 'Engine did not advance');
    assert(
      Math.hypot(
        ...after.ships[0].position.map(
          (value, axis) => value - before.status.ships[0].position[axis],
        ),
      ) > 0.1,
      'Ship did not move',
    );
    await canvasElement.screenshot({
      path: output + '/' + entry.name + '-motion.png',
    });
    assert.equal(errors.length, errorsBefore, 'Page exceptions');
    const result = {
      name: entry.name,
      origin,
      input,
      before,
      after,
      errors: errors.slice(errorsBefore),
      scope:
        'Editor schema, native startup, brief keyboard input and screenshots; not a completed playthrough.',
    };
    await writeFile(
      output +
        '/' +
        (process.env.SITE_URL ? 'live-' : '') +
        entry.name +
        '.json',
      JSON.stringify(result, null, 2) + '\n',
    );
    console.log('NATIVE_STARTUP_PASS', entry.name, JSON.stringify(after));
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
