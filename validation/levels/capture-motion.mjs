import puppeteer from 'puppeteer';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const requestedScenes = process.argv.slice(2);
const scenes = requestedScenes.length ? requestedScenes : ['Lv1','Lv2','Lv3','Lv4','Lv5','Lv6','Lv7','Lv8','Lv9','Lv10','Lv1A','Lv2A'];
const url = process.env.RHG_TEST_URL || 'http://127.0.0.1:8765/build/';
const settleMilliseconds = 1000;
const pressMilliseconds = 100;
const coastMilliseconds = 300;
const hashes = {};
for (const artifact of ['player.js', 'player.wasm']) {
  hashes[artifact] = createHash('sha256').update(await readFile(`build/runtime/${artifact}`)).digest('hex');
}
for (const scene of scenes) {
  const browser = await puppeteer.launch({headless:true, executablePath:process.env.BROWSER_EXECUTABLE});
  const page = await browser.newPage();
  await page.setViewport({width:1920,height:1180,deviceScaleFactor:1});
  const logs = [];
  const errors = [];
  page.on('console', message => {const line = `[${message.type()}] ${message.text()}`; logs.push(line); console.log(scene, line);});
  page.on('pageerror', error => {errors.push(error.stack); console.error(scene, error.stack);});
  page.on('requestfailed', request => {const error = `${request.url()} ${JSON.stringify(request.failure())}`; errors.push(error); console.error(scene, error);});
  const report = {scene, url, date:new Date().toISOString(), hashes, pressMilliseconds, coastMilliseconds, frames:[]};
  try {
    await page.goto(url + '?scene=' + encodeURIComponent(scene), {timeout:120000});
    await page.waitForFunction(() => window.runtimeReady, {timeout:120000});
    await page.click('#start');
    await page.waitForFunction(() => window.assetsReady, {timeout:120000});
    if (!await page.evaluate(() => Boolean(window.gameStarted))) await page.click('#start');
    await page.waitForFunction(() => window.gameStarted, {timeout:120000});
    await page.evaluate(() => {
      window.testKeyEvents = [];
      for (const type of ['keydown','keyup']) document.addEventListener(type, event => window.testKeyEvents.push({type, code:event.code, time:performance.now()}));
    });
    await new Promise(resolve => setTimeout(resolve, settleMilliseconds));
    for (const stage of ['initial','animated','up','right']) {
      if (stage === 'animated') await new Promise(resolve => setTimeout(resolve, settleMilliseconds));
      if (stage === 'up' || stage === 'right') {
        await page.keyboard.press(stage === 'up' ? 'ArrowUp' : 'ArrowRight', {delay:pressMilliseconds});
        await new Promise(resolve => setTimeout(resolve, coastMilliseconds));
      }
      const path = `validation/levels/${scene}-browser-motion-${stage}.png`;
      const frame = await page.screenshot({path});
      report.frames.push({stage,path,sha256:createHash('sha256').update(frame).digest('hex')});
    }
    report.state = await page.evaluate(() => ({status:document.querySelector('#status').textContent, canvas:{width:Module.canvas.width,height:Module.canvas.height}, keyEvents:window.testKeyEvents}));
    report.errors = errors;
    console.log('MOTION RESULT', JSON.stringify(report));
    await writeFile(`validation/levels/${scene}-browser-motion.json`, JSON.stringify(report,null,2)+'\n');
    await writeFile(`.claude_logs/${scene}-browser-motion.log`, logs.join('\n')+'\n');
  } finally {await browser.close();}
}
