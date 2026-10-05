import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';
const library=JSON.parse(await readFile('web/reforged/library.json'));
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[],logs=[],results=[];
page.on('pageerror',e=>{errors.push(String(e));console.error(e)});page.on('console',m=>{logs.push(m.text());if(/REFORGED|failed|Traceback/.test(m.text()))console.log(m.text())});
try{
 await page.setViewport({width:1920,height:1180});await page.goto(`http://127.0.0.1:${server.address().port}/web/levels/`);
 for(const scene of ['Lv7','Lv8','Lv9','Lv10','Lv1A','Lv2A']){
  const level=JSON.parse(await readFile(`web/reforged/levels/${scene}.json`));let animationCount=0,propertyCount=0;
  for(const ob of level.objects){const meta=library.objects[ob.source];ob.properties=Object.fromEntries(Object.entries(meta.propertyValues).map(([k,v])=>[k,v.value]));propertyCount+=Object.keys(ob.properties).length;if(meta.animation){ob.animation=structuredClone(meta.animation);animationCount++;}}
  await page.evaluate(level=>localStorage.setItem('reforged-play-v1',JSON.stringify(level)),level);
  await page.goto(`http://127.0.0.1:${server.address().port}/web/?reforged=editor`);
  await page.waitForFunction(()=>window.assetsReady,{timeout:300000});await page.click('#start');
  await page.waitForFunction(()=>window.reforgedStatus||/assembly failed|Python.*failed/.test(document.querySelector('#log').textContent),{timeout:120000});
  assert(await page.evaluate(()=>!!window.reforgedStatus),`${scene} native assembly failed`);
  await page.waitForFunction(()=>window.reforgedStatus?.ticks>60,{timeout:15000});
  await page.screenshot({path:`validation/reforged/${scene}-explicit-json.png`});
  const status=await page.evaluate(()=>window.reforgedStatus);results.push({scene,objects:level.objects.length,propertyCount,animationCount,status});console.log('LATE_SCENE_PASS',scene,propertyCount,animationCount);
 }
 assert.deepEqual(errors,[]);await writeFile('validation/reforged/late-scenes.json',JSON.stringify({results,errors},null,2)+'\n');
}finally{await writeFile('.claude_logs/reforged-late-scenes.log',logs.join('\n'));await browser.close();await new Promise(r=>server.close(r));}
