import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.setViewport({width:1680,height:1100});
 await page.goto(`http://127.0.0.1:${server.address().port}/web/reforged/`);
 await page.waitForFunction(()=>window.reforgedEditor);
 assert.equal(await page.$eval('#perspective',e=>e.checked),false);
 await page.screenshot({path:'validation/reforged/editor-orthographic.png'});
 await page.click('#perspective');
 await page.waitForFunction(()=>reforgedEditor.state.perspective);
 await new Promise(r=>setTimeout(r,200));
 await page.screenshot({path:'validation/reforged/editor-perspective.png'});
 const target=await page.evaluate(()=>{
  const e=reforgedEditor;e.state.level.grid.snap=false;
  const o=e.state.level.objects.find(o=>o.active&&o.source.startsWith('OBFinish'));
  e.select(o.id);const p=e.worldMatrix(o).transformPoint(new DOMPoint(0,0,0));
  return {id:o.id,position:[...o.position],screen:e.screen(p.x,p.y,p.z)};
 });
 const box=await page.$eval('#map',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y}});
 await page.mouse.move(box.x+target.screen[0],box.y+target.screen[1]);
 await page.mouse.down();await page.mouse.move(box.x+target.screen[0]+30,box.y+target.screen[1],{steps:5});await page.mouse.up();
 const result=await page.evaluate(id=>{const e=reforgedEditor,o=e.state.level.objects.find(o=>o.id===id);e.state.level.grid.origin=[2.5,-4];e.state.level.grid.spacing=15;e.state.level.grid.subdivisions=3;e.state.level.grid.snap=true;return {selected:e.state.selected,position:o.position,snapped:[e.snapped(0,0),e.snapped(0,1)]};},target.id);
 assert.equal(result.selected,target.id);assert(result.position[0]>target.position[0]);assert.deepEqual(result.snapped,[2.5,1]);
 await page.reload();await page.waitForFunction(()=>window.reforgedEditor);assert.equal(await page.$eval('#perspective',e=>e.checked),false);
 assert.deepEqual(errors,[]);
 await fs.writeFile('validation/reforged/perspective-results.json',JSON.stringify({target,result,errors},null,2)+'\n');console.log('PERSPECTIVE_PASS',result);
}finally{await browser.close();await new Promise(r=>server.close(r));}
