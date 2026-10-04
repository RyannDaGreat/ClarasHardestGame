import puppeteer from 'puppeteer';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const url=process.argv[2] || 'http://localhost:8765/build/';
const output=process.argv[3] || 'validation/output/cache-restart';
await mkdir(output,{recursive:true});
const options={headless:true,userDataDir:resolve(output,'profile')};
let browser=await puppeteer.launch(options);
const results={url};
try {
  let page=await browser.newPage();
  await page.setViewport({width:1440,height:1100,deviceScaleFactor:1});
  await page.goto(url,{timeout:180000});
  await page.waitForFunction(()=>window.assetsReady,{timeout:300000});
  results.first=await page.evaluate(()=>({...cacheStats}));
  const manifest=await page.evaluate(async()=>(await fetch('assets/assets.json')).json());
  const urls=new Set([...manifest.game.chunks,...manifest.files].map(file=>new URL('assets/'+file.url,url).href));
  await page.screenshot({path:output+'/live-ready.png'});
  console.log('Live automatic preparation passed:',results.first);
  await browser.close();
  browser=await puppeteer.launch(options);
  page=await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  const blocked=[];
  page.on('request',request=>{
    if(urls.has(request.url())){blocked.push(request.url());request.abort();}
    else request.continue();
  });
  await page.goto(url,{timeout:180000});
  await page.waitForFunction(()=>window.assetsReady,{timeout:300000});
  results.reopened=await page.evaluate(()=>({...cacheStats}));
  assert.equal(blocked.length,0);
  assert.equal(results.reopened.downloads,0);
  assert.equal(results.reopened.hits,manifest.game.chunks.length+manifest.files.length);
  await page.click('#start');
  await page.waitForFunction(()=>window.gameStarted,{timeout:120000});
  await page.keyboard.press('Digit1',{delay:100});
  await new Promise(resolve=>setTimeout(resolve,1500));
  results.started=await page.evaluate(()=>({game:window.gameStarted,audio:AL.currentCtx.audioCtx.state,overlayHidden:document.querySelector('#overlay').hidden}));
  assert.equal(results.started.audio,'running');
  assert.equal(results.started.overlayHidden,true);
  results.pass=true;
  console.log('PASS: live cache survives full browser restart; zero game downloads; single Play starts game/audio.',results.reopened);
} finally {
  await writeFile(output+'/results.json',JSON.stringify(results,null,2)+'\n');
  await browser.close();
}
