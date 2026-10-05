import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {readFile,writeFile} from 'node:fs/promises';
import {server} from './server.mjs';
const level=JSON.parse(await readFile('web/reforged/levels/Crossfire.json','utf8'));
const browser=await puppeteer.launch({headless:true});
const page=await browser.newPage(),errors=[],trace=[];
const POLL_MS=100,INITIAL_FIRE_MS=4500,MAX_ROUTE_POLLS=900;
const BAY_POSITIONS=[-24,24],BAY_WAIT_MS=750;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
page.on('pageerror',error=>{errors.push(String(error));console.error(error);});
page.on('console',message=>{if(message.type()==='error')console.error(message.text());});
let result;
try{
 await page.setViewport({width:1920,height:1180});
 await page.evaluateOnNewDocument(level=>localStorage.setItem('reforged-play-v1',JSON.stringify(level)),level);
 await page.goto('http://127.0.0.1:'+server.address().port+'/web/?reforged=editor');
 await page.waitForFunction(()=>window.assetsReady||document.querySelector('#status').textContent.startsWith('Unable'),{timeout:300000});
 await page.click('#start');
 await page.waitForFunction(()=>window.reforgedStatus||/failed|Unable/.test(document.querySelector('#log').textContent),{timeout:120000});
 if(!await page.evaluate(()=>window.reforgedStatus))throw Error(await page.$eval('#log',element=>element.textContent));
 await page.click('#canvas');
 await delay(INITIAL_FIRE_MS);
 await page.screenshot({path:'validation/reforged/crossfire-start.png'});
 console.log('Crossfire initial',await page.evaluate(()=>window.reforgedStatus));
 let previousX=-82,respawns=0,key=null,nextBay=0;
 for(let poll=0;poll<MAX_ROUTE_POLLS;poll++){
  const status=await page.evaluate(()=>window.reforgedStatus);
  trace.push({poll,key,status});
  if(status.won){result={won:true,respawns,status};break;}
  const ship=status.ships[0];
  if(!ship){if(key){await page.keyboard.up(key);key=null;}await delay(POLL_MS);continue;}
  const [x,y]=ship.position;
  if(x<previousX-20){respawns++;nextBay=0;if(key){await page.keyboard.up(key);key=null;}await delay(POLL_MS*(1+respawns%5));}
  previousX=x;
  if(nextBay<BAY_POSITIONS.length&&x>=BAY_POSITIONS[nextBay]){
   if(key){await page.keyboard.up(key);key=null;}
   console.log('Wait in shelter',nextBay,'position',ship.position,'tick',status.ticks);
   trace.push({action:'Wait in shelter',bay:nextBay,durationMs:BAY_WAIT_MS,status});
   nextBay++;await delay(BAY_WAIT_MS);continue;
  }
  const nextKey=Math.abs(y)>3?(y>0?'s':'w'):(x<82?'d':'a');
  if(nextKey!==key){if(key)await page.keyboard.up(key);key=nextKey;await page.keyboard.down(key);}
  if(poll%30===0)console.log('Crossfire route',poll,'respawns',respawns,'position',ship.position);
  await delay(POLL_MS);
 }
 if(key)await page.keyboard.up(key);
 if(!result?.won)throw Error('Crossfire keyboard route did not reach the genuine finish sensor');
 await page.screenshot({path:'validation/reforged/crossfire-win.png'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('GENUINE_KEYBOARD_WIN',result);
}finally{
 await writeFile('validation/reforged/crossfire-route.json',JSON.stringify({level:level.name,input:'Browser keyboard only; no engine writes',errors,result,trace},null,2)+'\n');
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
