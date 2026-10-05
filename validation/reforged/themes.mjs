import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {server} from './server.mjs';
const browser=await puppeteer.launch({headless:true});
const evidence='validation/reforged/themes';
await mkdir(evidence,{recursive:true});
const errors=[],results=[];
try{
 const editor=await browser.newPage(),game=await browser.newPage();
 for(const page of [editor,game]){await page.setViewport({width:1680,height:1050});page.on('pageerror',e=>{errors.push(String(e));console.error(e)});}
 const origin='http://127.0.0.1:'+server.address().port;
 await editor.bringToFront();
 await editor.goto(origin+'/web/reforged/');await editor.waitForFunction(()=>window.reforgedEditor,{polling:100});
 await game.goto(origin+'/web/');await game.waitForFunction(()=>document.querySelector('[data-theme-picker]').options.length===15);
 const names=await editor.$$eval('[data-theme-picker] option',options=>options.map(o=>o.value));
 for(const name of names){
  await editor.select('[data-theme-picker]',name);
  await game.waitForFunction(name=>document.documentElement.dataset.theme===name,{polling:100},name);
  await editor.screenshot({path:evidence+'/editor-'+name+'.png'});
  await game.screenshot({path:evidence+'/game-'+name+'.png'});
  const record=await editor.evaluate(()=>({theme:document.documentElement.dataset.theme,font:getComputedStyle(document.body).fontFamily,background:getComputedStyle(document.body).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth,selected:document.querySelector('[data-theme-picker]').value}));
  if(record.overflow)throw Error('Theme overflow: '+name);
  results.push(record);console.log('Theme synchronized:',name);
 }
 await editor.bringToFront();await editor.reload();await editor.waitForFunction(()=>window.reforgedEditor,{polling:100});
 if(await editor.$eval('[data-theme-picker]',e=>e.value)!==names.at(-1))throw Error('Theme not retained on reload');
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(evidence+'/results.json',JSON.stringify({results,errors,persistence:true},null,2)+'\n');
}finally{await browser.close();await new Promise(r=>server.close(r));}
