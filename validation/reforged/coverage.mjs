import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {server} from './server.mjs';
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[],scenes=[];
page.on('pageerror',e=>{errors.push(String(e));console.error(e);});
try{
 await page.setViewport({width:1680,height:1050});await page.goto(origin+'/web/reforged/');await page.waitForFunction(()=>window.reforgedEditor);
 for(const scene of ['Lv7','Lv8','Lv9','Lv10','Lv1A','Lv2A']){
  await page.evaluate(scene=>reforgedEditor.load('levels/'+scene+'.json'),scene);
  const result=await page.evaluate(()=>{
   const e=reforgedEditor,lib=e.state.library,level=e.state.level;
   const roots=level.objects.filter(o=>o.active&&!o.parent);
   const excluded=[],checked=[];
   for(const root of roots){
    if(/^(OBLamp|OBArial|OBMainCam|OBPanCam|OBPanPivot|OBBounds|OBSphere)/.test(root.id)||[10,11].includes(lib.objects[root.source].type)){excluded.push(root.id);continue;}
    const count=e.state.level.objects.length;e.select(root.id);
    const duplicate=[...document.querySelectorAll('#inspector button')].find(b=>b.textContent==='Duplicate');
    if(!duplicate)throw Error('No duplicate control: '+root.id);
    duplicate.click();e.validate(e.state.level);
    if(e.state.level.objects.length<=count)throw Error('Duplicate failed: '+root.id);
    document.querySelector('#undo').click();
    if(e.state.level.objects.length!==count)throw Error('Undo failed: '+root.id);
    const members=e.state.level.objects.filter(o=>{let p=o;while(p.parent)p=e.state.level.objects.find(x=>x.id===p.parent);return p.id===root.id});
    for(const member of members){
     e.select(member.id);const headings=[...document.querySelectorAll('#inspector summary')].map(n=>n.textContent);
     const meta=lib.objects[member.source];
     if(Object.keys(meta.propertyValues||{}).length&&!headings.includes('Game properties'))throw Error('No property editor: '+member.id);
     if(meta.animation&&!headings.includes('Motion path · animation keys'))throw Error('No animation editor: '+member.id);
     if(members.length>1&&!document.querySelector('[aria-label="Component part"]'))throw Error('No hierarchy selector');
    }
    checked.push({id:root.id,members:members.length});
   }
   return {scene:level.scene,roots:roots.length,excluded,checked,supported:checked.length,total:roots.length-excluded.length};
  });
  scenes.push(result);console.log(scene,result.supported+'/'+result.total,'gameplay roots inspected and duplicated');
 }
 await page.evaluate(()=>reforgedEditor.load('levels/Gauntlet.json'));
 const placement=await page.evaluate(()=>{
  const e=reforgedEditor,buttons=[...document.querySelectorAll('#components .component')];
  if(!buttons.some(b=>b.textContent.includes('Portal'))||!buttons.some(b=>b.textContent.includes('Turret')))throw Error('Inactive templates missing from palette');
  const portal=e.state.level.objects.find(o=>o.source==='OBPortal1.004');e.duplicate(portal,[0,0]);
  const id=e.state.selected,root=e.state.level.objects.find(o=>o.id===id),children=e.state.level.objects.filter(o=>o.parent===id);
  if(!root.active||!children.length||children.some(o=>!o.active))throw Error('Placed portal hierarchy inactive');
  e.remove(root);e.validate(e.state.level);
  return {portalChildren:children.length,active:true};
 });
 assert.deepEqual(errors,[]);await writeFile('validation/reforged/coverage.json',JSON.stringify({scope:'Original-template gameplay roots: GUI inspection, duplicate and undo; see README for independent behavior checks and exclusions.',scenes,placement,errors},null,2)+'\n');console.log('COVERAGE_PASS');
}finally{await browser.close();await new Promise(r=>server.close(r));}
