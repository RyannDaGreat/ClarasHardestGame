import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {readFile,writeFile} from 'node:fs/promises';
import {server} from './server.mjs';
const level=JSON.parse(await readFile('web/reforged/levels/Switchback.json','utf8'));
const browser=await puppeteer.launch({headless:true});
const page=await browser.newPage(),errors=[],attempts=[];
page.on('pageerror',error=>{errors.push(String(error));console.error(error)});
page.on('console',message=>{if(message.type()==='error')console.error(message.text());});
const route=[
 [-52,-80],[-52,-64],[-12,-64],[-12,-92],[52,-92],[84,-92],
 [84,-40],[52,-40],[12,-40],[12,-12],[-52,-12],[-84,-12],
 [-84,40],[-52,40],[-12,40],[-12,12],[52,12],[84,12],
 [84,64],[52,64],[12,64],[12,92],[-52,92],[-84,92],[-84,80],
];
const sleep=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const maximumAttempts=8, respawnJump=30, maximumWaypointSteps=90;
let win=null;
try {
 await page.setViewport({width:1920,height:1180});
 await page.evaluateOnNewDocument(level=>localStorage.setItem('reforged-play-v1',JSON.stringify(level)),level);
 for(let attempt=0;attempt<maximumAttempts&&!win;attempt++) {
  const trace=[],result={attempt,initialWait:attempt*430,trace};attempts.push(result);
  await page.goto('http://127.0.0.1:'+server.address().port+'/web/?reforged=editor');
  await page.waitForFunction(()=>window.assetsReady||document.querySelector('#status').textContent.startsWith('Unable'),{timeout:300000});
  await page.click('#start');
  await page.waitForFunction(()=>window.reforgedStatus||/failed|Unable/.test(document.querySelector('#log').textContent),{timeout:120000});
  if(!await page.evaluate(()=>window.reforgedStatus))throw Error(await page.$eval('#log',element=>element.textContent));
  if(!attempt)await page.screenshot({path:'validation/reforged/switchback-start.png'});
  await page.click('#canvas');await sleep(result.initialWait);
  let previous=null;
  routeAttempt: for(const target of route) {
   let reached=false;
   for(let step=0;step<maximumWaypointSteps;step++) {
    const status=await page.evaluate(()=>window.reforgedStatus);
    trace.push({target,status});
    if(status.won){win=status;reached=true;break routeAttempt;}
    if(status.ships.length!==1){result.failure='Player destroyed';break routeAttempt;}
    const position=status.ships[0].position;
    if(previous&&Math.hypot(position[0]-previous[0],position[1]-previous[1])>respawnJump){
     result.failure='Original hazard caused player respawn';break routeAttempt;
    }
    previous=position;
    const dx=target[0]-position[0],dy=target[1]-position[1];
    if(Math.hypot(dx,dy)<3){reached=true;break;}
    const key=Math.abs(dx)>Math.abs(dy)?(dx>0?'d':'a'):(dy>0?'w':'s');
    await page.keyboard.down(key);await sleep(Math.hypot(dx,dy)>12?160:40);
    await page.keyboard.up(key);await sleep(110);
    if(step%20===0)console.log('Attempt',attempt,'route',target,'step',step,'position',position);
   }
   if(!reached){result.failure='Waypoint stalled: '+JSON.stringify(target);break;}
   console.log('Reached',target);
  }
  if(!result.failure&&!win){
   await page.waitForFunction(()=>window.reforgedStatus.won,{timeout:15000});
   win=await page.evaluate(()=>window.reforgedStatus);
  }
  console.log('Attempt result',attempt,result.failure||'WIN');
 }
 if(!win)throw Error('No successful keyboard route in '+maximumAttempts+' attempts');
 await page.screenshot({path:'validation/reforged/switchback-win.png'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('GENUINE_KEYBOARD_WIN',win);
} finally {
 await writeFile('validation/reforged/switchback-route.json',JSON.stringify({errors,route,attempts,win},null,2)+'\n');
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
