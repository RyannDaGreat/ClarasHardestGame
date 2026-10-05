import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';

const names = (process.env.LEVEL_NAMES || 'Pinwheel,Ricochet').split(',');
const origin = `http://127.0.0.1:${server.address().port}/web/`;
// Test-only telemetry wraps the shipped observer and never writes engine state.
const observer =
  (await readFile('web/reforged/play.py', 'utf8')) +
  `
_original_tick = reforged_tick
def reforged_tick():
    result = _original_tick()
    if result is None: return None
    data = json.loads(result)
    scene = GameLogic.getCurrentScene()
    data['mechanics'] = []
    for obj in scene.objects:
        if obj.name.startswith(('OBPw', 'OBRicBall', 'OBHoneyBall', 'OBSY')):
            data['mechanics'].append({'name':obj.name, 'position':list(obj.worldPosition),
                'rotation':[list(row) for row in obj.localOrientation],
                'on':obj['On'] if 'On' in obj else None})
    return json.dumps(data)
`;
const browser = await puppeteer.launch({headless: true}),
  page = await browser.newPage(),
  errors = [];
page.on('pageerror', (error) => {
  console.error(error);
  errors.push(String(error));
});
await page.setRequestInterception(true);
page.on('request', (request) =>
  request.url().endsWith('/reforged/play.py')
    ? request.respond({status: 200, contentType: 'text/plain', body: observer})
    : request.continue(),
);
try {
  await page.setViewport({width: 1680, height: 1100});
  for (const name of names) {
    await page.goto(origin + '?reforged=' + name);
    await page.waitForFunction(() => window.assetsReady, {timeout: 300000});
    await page.click('#start');
    await page.waitForFunction(() => window.reforgedStatus?.ticks >= 30, {
      timeout: 120000,
    });
    await page.click('#canvas');
    const samples = [];
    if (name === 'Switchyard') {
      // Reach all three switches and cross the opened corridor using real keys.
      for (const target of [
        [-58, -80],
        [-58, -64],
        [0, -64],
        [0, -24],
        [-62, -24],
        [-62, 0],
        [-62, 18],
        [62, 18],
        [62, 0],
        [62, 18],
        [0, 18],
        [0, 82],
      ]) {
        for (let step = 0; step < 100; step++) {
          const status = await page.evaluate(() => window.reforgedStatus);
          samples.push(status);
          const position = status.ships[0].position,
            dx = target[0] - position[0],
            dy = target[1] - position[1];
          if (Math.hypot(dx, dy) < 2.5) break;
          const key =
            Math.abs(dx) > Math.abs(dy)
              ? dx > 0
                ? 'KeyD'
                : 'KeyA'
              : dy > 0
                ? 'KeyW'
                : 'KeyS';
          await page.keyboard.down(key);
          await new Promise((resolve) =>
            setTimeout(resolve, Math.hypot(dx, dy) > 10 ? 100 : 30),
          );
          await page.keyboard.up(key);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      await page.waitForFunction(
        () =>
          window.reforgedStatus.mechanics.find((o) => o.name === 'OBSYAField3')
            ?.on === 1,
        {timeout: 10000},
      );
      samples.push(await page.evaluate(() => window.reforgedStatus));
      assert.equal(
        samples[0].mechanics.find((o) => o.name === 'OBSYAField3').on,
        0,
      );
      for (const id of ['OBSYAField3', 'OBSYBField3', 'OBSYCField3'])
        assert.equal(
          samples.at(-1).mechanics.find((o) => o.name === id).on,
          1,
          'Gate must stay open: ' + id,
        );
      console.log('THREE_GATES_OPENED_BY_KEYBOARD', samples.at(-1).won);
    } else {
      for (let sample = 0; sample < 60; sample++) {
        samples.push(await page.evaluate(() => window.reforgedStatus));
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      await writeFile(
        'validation/reforged/expansion/' + name + '-mechanics.json',
        JSON.stringify({name, samples, errors}, null, 2) + '\n',
      );
      if (name === 'Pinwheel') {
        const rotations = samples.map((s) =>
          JSON.stringify(
            s.mechanics
              .filter((o) => o.name.includes('Blade'))
              .map((o) => o.rotation),
          ),
        );
        assert(new Set(rotations).size > 30, 'Rotors must animate');
      }
      if (name === 'Ricochet' || name === 'Honeycomb') {
        for (const ball of samples[0].mechanics) {
          const xs = samples.map(
            (s) => s.mechanics.find((o) => o.name === ball.name).position[0],
          );
          const deltas = xs.slice(1).map((x, index) => x - xs[index]);
          assert(
            deltas.some((d) => d > 1) && deltas.some((d) => d < -1),
            'Ball must reverse: ' + ball.name,
          );
        }
      }
    }
    await (
      await page.$('#canvas')
    ).screenshot({
      path: 'validation/reforged/expansion/' + name + '-mechanics.png',
    });
    await writeFile(
      'validation/reforged/expansion/' + name + '-mechanics.json',
      JSON.stringify(
        {
          name,
          scope:
            'Read-only test telemetry, real keyboard input only; no simulation overrides.',
          samples,
          errors,
        },
        null,
        2,
      ) + '\n',
    );
    console.log('MECHANICS_PASS', name, samples.length);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
