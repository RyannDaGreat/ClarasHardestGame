import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';
const origin=`http://127.0.0.1:${server.address().port}`;
const level=JSON.parse(await readFile('web/reforged/levels/Lv10.json'));
const byId=new Map(level.objects.map(o=>[o.id,o]));
function root(o){while(o.parent)o=byId.get(o.parent);return o;}
for(const o of level.objects)o.active=/^OB(Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint)/.test(root(o).id)||['OBForcefield.019','OBPlane.012','OBKiller.025'].includes(root(o).id);
byId.get('OBSpawnPoint.011').position=[0,-20,0];
byId.get('OBPlane.012').position=[0,0,-1.4284655570983887];
byId.get('OBPlane.012').scale=byId.get('OBPlane.012').scale.map(v=>v*.15);
byId.get('OBForcefield.019').position=[70,70,0];
byId.get('OBKiller.025').position=[-70,70,0];
level.name='Connections and motion verification';
const observer=(await readFile('web/reforged/play.py','utf8'))+`
_original_tick = reforged_tick
def reforged_tick():
    result = _original_tick()
    if result is None: return None
    data = json.loads(result)
    scene = GameLogic.getCurrentScene()
    data['fieldOn'] = scene.objects['OBCube.355']['On']
    data['switchOn'] = scene.objects['OBPlane.012']['On']
    data['rotation'] = [list(row) for row in scene.objects['OBCylinder.027'].localOrientation]
    return json.dumps(data)
`;
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>{console.error(e);errors.push(String(e));});
await page.setRequestInterception(true);page.on('request',r=>r.url().endsWith('/reforged/play.py')?r.respond({status:200,contentType:'text/plain',body:observer}):r.continue());
const result={};
try{
 await page.setViewport({width:1680,height:1050});await page.goto(origin+'/web/');
 await page.evaluate(l=>localStorage.setItem('reforged-workshop-v1',JSON.stringify(l)),level);
 await page.goto(origin+'/web/reforged/');await page.waitForFunction(()=>window.reforgedEditor);
 await page.evaluate(()=>{
  const e=reforgedEditor;e.select('OBPlane.012');
  const source=document.querySelector('[aria-label="Connection source"]');source.value=[...source.options].find(o=>o.textContent.endsWith('/ Activator')).value;source.dispatchEvent(new Event('change'));
  const target=document.querySelector('[aria-label="Connection destination"]');target.value='OBCube.355/actuators/act1';
  [...document.querySelectorAll('#inspector button')].find(b=>b.textContent==='Connect').click();
 });
 assert(await page.evaluate(()=>reforgedEditor.state.level.objects.find(o=>o.id==='OBPlane.012').logic.controllers.find(b=>b.name==='Activator').links.includes('OBCube.355/actuators/act1')));
 result.newConnection=true;
 await page.evaluate(()=>{
  for(const [id,value]of [['spacing',15],['subdivisions',3],['origin-x',2.5],['origin-y',-4]]){const f=document.getElementById(id);f.value=value;f.dispatchEvent(new Event('change'));}
  reforgedEditor.select('OBGrid.014');
  const input=[...document.querySelectorAll('#inspector label')].find(l=>l.firstChild.textContent==='World Z').querySelector('input');input.value=3.25;input.dispatchEvent(new Event('change'));
 });
 result.grid=await page.evaluate(()=>reforgedEditor.state.level.grid);
 assert.deepEqual(result.grid.origin,[2.5,-4]);assert.equal(result.grid.spacing,15);assert.equal(result.grid.subdivisions,3);
 result.vertex=await page.evaluate(()=>{const e=reforgedEditor,o=e.state.level.objects.find(x=>x.id==='OBGrid.014');return new DOMPoint(...o.geometry.vertices[0]).matrixTransform(e.worldMatrix(o)).z});assert(Math.abs(result.vertex-3.25)<1e-5);
 await page.evaluate(()=>reforgedEditor.select('OBCylinder.027'));
 for(let index=0;index<2;index++)await page.evaluate(index=>{
  const channel=[...document.querySelectorAll('#inspector details')].find(d=>d.firstChild.textContent==='Rotation Z');
  const inputs=[...channel.querySelectorAll('label')].filter(l=>l.firstChild.textContent==='Value').map(l=>l.querySelector('input'));
  inputs[index].value=9;inputs[index].dispatchEvent(new Event('change'));
 },index);
 result.animation=await page.evaluate(()=>reforgedEditor.state.level.objects.find(o=>o.id==='OBCylinder.027').animation);
 assert(result.animation.curves[2].points.every(p=>p[4]===9));
 await page.screenshot({path:'validation/reforged/motion-editor.png'});
 await page.click('#play');const frame=await(await page.$('#play-frame')).contentFrame();
 await frame.waitForFunction(()=>window.assetsReady,{timeout:300000});await frame.click('#start');
 await frame.waitForFunction(()=>window.reforgedStatus?.ticks>60,{timeout:120000});
 result.before=await frame.evaluate(()=>window.reforgedStatus);console.log('BEFORE',result.before);
 assert.equal(result.before.fieldOn,0);assert(Math.abs(result.before.rotation[0][0])<.001,'Authored 90-degree IPO rotation must run');
 await frame.click('#canvas');await page.keyboard.down('KeyW');await new Promise(r=>setTimeout(r,500));await page.keyboard.up('KeyW');
 await frame.waitForFunction(()=>window.reforgedStatus?.fieldOn===1,{timeout:15000});
 result.after=await frame.evaluate(()=>window.reforgedStatus);console.log('AFTER',result.after);
 await page.screenshot({path:'validation/reforged/connection-playtest.png'});
 assert.deepEqual(errors,[]);result.errors=errors;
 await writeFile('validation/reforged/connections-motion.json',JSON.stringify(result,null,2)+'\n');console.log('CONNECTIONS_MOTION_PASS');
}finally{await browser.close();await new Promise(r=>server.close(r));}
