import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';
import {wallGeometry} from '../../web/reforged/geometry.js';
const origin=`http://127.0.0.1:${server.address().port}`;
const library=JSON.parse(await readFile('web/reforged/library.json'));
const base=JSON.parse(await readFile('web/reforged/levels/Gauntlet.json'));
const grid='OBGrid.014', mesh=library.meshes[library.objects[grid].data];
for(const object of base.objects){
 if(object.geometry)object.active=false;
 if(object.source==='OBSpawnPoint.004')object.position=[0,-16,0];
 if(object.source==='OBFinish.002')object.position=[0,22,0];
}
base.name='Carving verification';base.objects.push({id:'OBcarveProbe',source:grid,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],active:true,parent:null,logic:{sensors:[],controllers:[],actuators:[]},geometry:wallGeometry(mesh,[-20,0],[20,0],base.grid.spacing)});
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[];const results={};
page.on('pageerror',error=>{errors.push(String(error));console.error(error)});
try{
 await page.setViewport({width:1440,height:1000});
 await page.goto(origin+'/web/levels/');
 await page.waitForSelector('#bundled .card');
 assert.equal(await page.$$eval('#bundled .card',nodes=>nodes.length),3);
 await page.evaluate(level=>localStorage.setItem('reforged-workshop-v1',JSON.stringify(level)),base);
 for(const carve of [false,true]){
  await page.goto(origin+'/web/reforged/');
  await page.waitForFunction(()=>window.reforgedEditor,{timeout:60000});
  await page.evaluate(()=>{reforgedEditor.select('OBcarveProbe');reforgedEditor.fit();});
  if(carve){
   await page.click('[data-tool=carve]');
   const point=await page.evaluate(()=>{const r=document.querySelector('#map').getBoundingClientRect(),v=reforgedEditor.state.view;return{x:r.x+r.width/2-v.x*v.scale,y:r.y+r.height/2+v.y*v.scale}});
   await page.mouse.click(point.x,point.y);
   const removed=await page.evaluate(()=>reforgedEditor.state.level.objects.find(o=>o.id==='OBcarveProbe').geometry.disabledFaces);
   assert(removed.length>=6,'Carve must remove hidden sides and bottom too');results.removedFaces=removed;
   await page.screenshot({path:'validation/reforged/carved-editor.png'});
  }
  await page.click('#play');
  const frame=await(await page.$('#play-frame')).contentFrame();
  await frame.waitForFunction(()=>window.assetsReady,{timeout:300000});await frame.click('#start');
  await frame.waitForFunction(()=>window.reforgedStatus||/assembly failed/.test(document.querySelector('#log').textContent),{timeout:120000});
  assert(await frame.evaluate(()=>!!window.reforgedStatus),'Native assembly failed');
  await frame.click('#canvas');await page.keyboard.down('KeyW');await new Promise(r=>setTimeout(r,1800));await page.keyboard.up('KeyW');await new Promise(r=>setTimeout(r,150));
  const status=await frame.evaluate(()=>window.reforgedStatus);results[carve?'carved':'intact']=status;
  console.log(carve?'CARVED':'INTACT',JSON.stringify(status));
  await page.screenshot({path:`validation/reforged/carve-${carve?'pass':'blocked'}.png`});
  if(carve)assert(status.won&&status.ships[0].position[1]>10,'Ship must pass through carved cell to genuine finish');
  else assert(status.ships[0].position[1]<0&&!status.won,'Intact wall must block ship');
  await page.click('#close-play');
 }
 await page.click('#save-level');await page.goto(origin+'/web/levels/');await page.waitForSelector('#saved .card');
 assert.equal(await page.$eval('#saved h3',node=>node.textContent),base.name);
 await page.reload();await page.waitForSelector('#saved .card');results.savedReload=true;
 const file=await page.$('#file');await file.uploadFile('web/reforged/levels/Parallax.json');
 await page.waitForFunction(()=>document.querySelectorAll('#saved .card').length===2);results.imported=true;
 for(const width of [1280,1680]){await page.setViewport({width,height:1000});await page.goto(origin+'/web/reforged/');await page.waitForFunction(()=>window.reforgedEditor);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Editor width overflow');}
 assert.deepEqual(errors,[]);results.errors=errors;
 await writeFile('validation/reforged/authoring-results.json',JSON.stringify(results,null,2)+'\n');console.log('AUTHORING_CHECKS_PASS');
}finally{await browser.close();await new Promise(r=>server.close(r));}
