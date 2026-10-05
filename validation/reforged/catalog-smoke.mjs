import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';
const origin=process.env.SITE_URL||`http://127.0.0.1:${server.address().port}/web/`;
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[],results=[];
page.on('pageerror',e=>{errors.push(String(e));console.error(e);});
try{
 await page.setViewport({width:1680,height:1100});await mkdir('web/levels/previews',{recursive:true});
 const entries=JSON.parse(await readFile('web/levels/catalog.json','utf8'));
 for(const {name} of process.env.SKIP_GAMES ? [] : entries){
  await page.goto(origin+'?reforged='+name);
  await page.waitForFunction(()=>window.assetsReady||document.querySelector('#status').textContent.startsWith('Unable to start'),{timeout:300000});
  assert(await page.evaluate(()=>window.assetsReady),'Download/start failed');await page.click('#start');
  await page.waitForFunction(()=>window.reforgedStatus?.ticks>90,{timeout:120000});
  const status=await page.evaluate(()=>({title:document.title,status:reforgedStatus,width:document.querySelector('#canvas').width,height:document.querySelector('#canvas').height}));
  assert(status.title.startsWith(name));assert.equal(status.width,1920);assert.equal(status.height,1080);results.push(status);
  if(!process.env.SITE_URL)await(await page.$('#canvas')).screenshot({path:'web/levels/previews/'+name+'.png'});
  console.log('PLAYABLE',name,status.status.ticks);
 }
 await page.goto(origin+'levels/');await page.waitForSelector('#bundled .card img');
 const names=await page.$$eval('#bundled .card h3',nodes=>nodes.map(node=>node.textContent));
 assert.deepEqual(names,entries.map(entry=>entry.name));
 await page.evaluate(()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode();})));
 await page.screenshot({path:'validation/reforged/level-browser.png',fullPage:true});
 await page.evaluate(()=>[...document.querySelectorAll('#bundled .card')].find(c=>c.querySelector('h3').textContent==='Parallax').querySelectorAll('button')[1].click());
 await page.waitForFunction(()=>window.reforgedEditor?.state.level.name==='Parallax');
 await page.screenshot({path:'validation/reforged/release-editor.png'});
 assert.deepEqual(errors,[]);await writeFile('validation/reforged/'+(process.env.SITE_URL?'live-':'')+'catalog-results.json',JSON.stringify({names,scope:process.env.SKIP_GAMES?'Catalog previews and editor handoff':'Catalog, original-engine startups and editor handoff',results,errors},null,2)+'\n');console.log('CATALOG_PASS');
}finally{await browser.close();await new Promise(r=>server.close(r));}
