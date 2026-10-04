import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const output = new URL('../../runtime/build/graphics-tests/', import.meta.url);
const archive = new URL('../../runtime/.cache/patched/gl4es/lib/libGL.a', import.meta.url);
const probes = {wireframe: 'WIREFRAME_PASS', 'combine-defaults': 'COMBINE_DEFAULTS_PASS'};
const mime = {html: 'text/html', js: 'application/javascript', wasm: 'application/wasm'};
const timeoutMilliseconds = 30000;
const server = createServer(async (request, response) => {
  if (request.url === '/favicon.ico') { response.writeHead(204).end(); return; }
  const match = /^\/(wireframe|combine-defaults)\.(html|js|wasm)$/.exec(request.url);
  if (!match) { response.writeHead(404).end('Unknown probe artifact'); return; }
  try {
    const data = await readFile(new URL(match[1] + '.' + match[2], output));
    response.writeHead(200, {'Content-Type': mime[match[2]]}).end(data);
  } catch (error) {
    console.error(error);
    response.writeHead(500).end(String(error));
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
let browser;
try {
  browser = await puppeteer.launch({
    headless: true, executablePath: process.env.BROWSER_EXECUTABLE,
    args: ['--enable-unsafe-swiftshader']
  });
  const report = {
    date: new Date().toISOString(), browser: await browser.version(),
    archive_sha256: createHash('sha256').update(await readFile(archive)).digest('hex'),
    tests: {}
  };
  for (const [probe, marker] of Object.entries(probes)) {
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1200, deviceScaleFactor: 1});
    const errors = [];
    page.on('console', message => {
      console.log(`[${probe}:${message.type()}] ${message.text()}`);
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', error => { errors.push(error.message); console.error(error); });
    page.on('requestfailed', request => { errors.push(request.url()); console.error(request.failure()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/${probe}.html`);
    await page.waitForFunction(() => window.probeExit !== undefined || window.probeAbort !== undefined,
      {timeout: timeoutMilliseconds});
    const state = await page.evaluate(() => ({
      exit: window.probeExit, abort: window.probeAbort,
      output: document.querySelector('#output').textContent
    }));
    await page.screenshot({path: fileURLToPath(new URL(probe + '-current.png', output))});
    assert.equal(state.abort, undefined, 'Runtime aborted');
    assert.equal(state.exit, 0, state.output);
    assert.ok(state.output.includes(marker), state.output);
    assert.ok(!state.output.includes('_FAIL'), state.output);
    assert.deepEqual(errors, [], 'Browser reported errors');
    report.tests[probe] = state;
    await page.close();
  }
  await writeFile(new URL('results.json', output), JSON.stringify(report, null, 2) + '\n');
  console.log('GRAPHICS_REGRESSIONS_PASS', JSON.stringify(report));
} finally {
  if (browser) await browser.close();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
