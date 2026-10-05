import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {readFile,writeFile} from 'node:fs/promises';
import {server} from './server.mjs';
const browser=await puppeteer.launch({headless:true});
const page=await browser.newPage(),errors=[],trace=[],events=[];
page.on('pageerror',error=>{errors.push(String(error));console.error(error)});
page.on('console',message=>{if(message.type()==='error')console.error(message.text());if(/REFORGED_WIN/.test(message.text()))events.push(message.text());});
const level=await readFile('web/reforged/levels/Parallax.json','utf8');
const route=[
 {target:[-24,-78]},
 {target:[-24,-24],destination:'northeast'},
 {target:[24,72]},
 {target:[24,24],destination:'northwest'},
 {target:[-24,63]},
 {target:[-24,24],destination:'southeast'},
 {target:[24,-72]},
 {target:[24,-24],finish:true},
];
let result;
try{
 await page.setViewport({width:1920,height:1180});
 await page.evaluateOnNewDocument(value=>localStorage.setItem('reforged-play-v1',value),level);
 await page.goto('http://127.0.0.1:'+server.address().port+'/web/?reforged=editor');
 await page.waitForFunction(()=>window.assetsReady||document.querySelector('#status').textContent.startsWith('Unable'),{timeout:300000});
 await page.click('#start');
 await page.waitForFunction(()=>window.reforgedStatus||/failed|Unable/.test(document.querySelector('#log').textContent),{timeout:120000});
 if(!await page.evaluate(()=>window.reforgedStatus))throw Error(await page.$eval('#log',element=>element.textContent));
 await page.screenshot({path:'validation/reforged/parallax-start.png'});
 await page.click('#canvas');
 for(const [stage,step]of route.entries()){
  let reached=false;
  for(let attempt=0;attempt<320;attempt++){
   const status=await page.evaluate(()=>window.reforgedStatus);
   if(status.won){reached=true;break;}
   if(status.ships.length!==1){await new Promise(resolve=>setTimeout(resolve,100));continue;}
   const position=status.ships[0].position,dx=step.target[0]-position[0],dy=step.target[1]-position[1];
   trace.push({stage,target:step.target,status});
   const destination=step.destination;
   if(destination&&((destination==='northeast'&&position[0]>0&&position[1]>0)||(destination==='northwest'&&position[0]<0&&position[1]>0)||(destination==='southeast'&&position[0]>0&&position[1]<0))){reached=true;console.log('Native portal crossed',stage,position);break;}
   const distance=Math.hypot(dx,dy);
   if(distance<3&&!destination&&!step.finish){reached=true;break;}
   const key=Math.abs(dx)>Math.abs(dy)?(dx>0?'d':'a'):(dy>0?'w':'s');
   await page.keyboard.down(key);
   await new Promise(resolve=>setTimeout(resolve,distance>14?140:35));
   await page.keyboard.up(key);
   await new Promise(resolve=>setTimeout(resolve,80));
   if(attempt%25===0)console.log('Route',stage,'attempt',attempt,'position',position);
  }
  if(!reached)throw Error('Route failed at '+JSON.stringify(step));
  console.log('Reached stage',stage,await page.evaluate(()=>window.reforgedStatus));
  await page.screenshot({path:'validation/reforged/parallax-stage-'+stage+'.png'});
 }
 await page.waitForFunction(()=>window.reforgedStatus.won,{timeout:15000});
 await page.screenshot({path:'validation/reforged/parallax-win.png'});
 if(errors.length)throw Error(errors.join('\n'));
 result=await page.evaluate(()=>window.reforgedStatus);
 console.log('GENUINE_KEYBOARD_WIN',result);
}finally{
 await writeFile('validation/reforged/parallax-route.json',JSON.stringify({level:'Parallax',route,errors,events,result,trace},null,2)+'\n');
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
