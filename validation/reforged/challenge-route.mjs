import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {writeFile} from 'node:fs/promises';
import {server} from './server.mjs';
const browser=await puppeteer.launch({headless:true});
const page=await browser.newPage(),errors=[],trace=[];
page.on('pageerror',e=>{errors.push(String(e));console.error(e)});
page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
try{
 await page.setViewport({width:1920,height:1180});
 await page.goto('http://127.0.0.1:'+server.address().port+'/web/?reforged=challenge');
 await page.waitForFunction(()=>window.assetsReady||document.querySelector('#status').textContent.startsWith('Unable'),{timeout:300000});
 await page.click('#start');
 await page.waitForFunction(()=>window.reforgedStatus||/failed|Unable/.test(document.querySelector('#log').textContent),{timeout:120000});
 const initial=await page.evaluate(()=>window.reforgedStatus);
 if(!initial)throw Error(await page.$eval('#log',e=>e.textContent));
 console.log('Initial',initial);
 await page.screenshot({path:'validation/reforged/Gauntlet-start.png'});
 await page.click('#canvas');
 const route=[[-78,75],[0,75],[0,-75],[78,-75],[78,78]];
 for(const target of route){
  let reached=false;
  for(let step=0;step<350;step++){
   const status=await page.evaluate(()=>window.reforgedStatus);
   if(status.won){reached=true;break;}
   if(status.ships.length!==1)throw Error('Expected one player');
   const pos=status.ships[0].position,dx=target[0]-pos[0],dy=target[1]-pos[1];
   trace.push({target,status});
   if(Math.hypot(dx,dy)<3){reached=true;break;}
   const key=Math.abs(dx)>Math.abs(dy)?(dx>0?'d':'a'):(dy>0?'w':'s');
   await page.keyboard.down(key);
   await new Promise(r=>setTimeout(r,Math.hypot(dx,dy)>12?160:40));
   await page.keyboard.up(key);
   await new Promise(r=>setTimeout(r,110));
   if(step%20===0)console.log('Route',target,'step',step,'position',pos);
  }
  if(!reached)throw Error('Route failed at '+JSON.stringify(target));
  console.log('Reached',target);
 }
 await page.waitForFunction(()=>window.reforgedStatus.won,{timeout:15000});
 await page.screenshot({path:'validation/reforged/Gauntlet-win.png'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('GENUINE_KEYBOARD_WIN',await page.evaluate(()=>window.reforgedStatus));
}finally{
 await writeFile('validation/reforged/Gauntlet-route.json',JSON.stringify({errors,trace},null,2)+'\n');
 await browser.close();await new Promise(r=>server.close(r));
}
