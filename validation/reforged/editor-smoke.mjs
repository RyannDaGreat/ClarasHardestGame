import puppeteer from '../node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('.');
const server=createServer(async(req,res)=>{
  try{
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path.startsWith('/web/runtime/player.'))path='/runtime/build/engine/'+path.split('/').pop();
    if(path.startsWith('/web/assets/'))path=path.replace('/web/assets/','/build/assets/');
    let full=resolve(root,'.'+path);if(!full.startsWith(root+'/'))throw Error('Invalid path');
    if((await stat(full)).isDirectory())full+='/index.html';
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[extname(full)]||'application/octet-stream');
    createReadStream(full).on('error',e=>{console.error(e);res.destroy(e)}).pipe(res);
  }catch(e){console.error(String(e));res.writeHead(404);res.end(String(e));}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>{errors.push(String(e));console.error(e)});
page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
try{
 await page.setViewport({width:1680,height:1050});
 await page.goto(`http://127.0.0.1:${server.address().port}/web/reforged/`);
 await page.waitForFunction(()=>window.reforgedEditor||!document.querySelector('#notice').hidden,{timeout:30000});
 await page.screenshot({path:'validation/reforged/editor.png'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log(await page.evaluate(()=>({objects:reforgedEditor.state.level.objects.length,scene:reforgedEditor.state.level.scene})));
 await page.evaluate(()=>reforgedEditor.addWall([-80,60],[-35,60]));
 await page.screenshot({path:'validation/reforged/editor-wall.png'});
 await page.click('#play');
 const frame=await (await page.$('#play-frame')).contentFrame();
 await frame.waitForFunction(()=>window.assetsReady||document.querySelector('#status').textContent.startsWith('Unable'),{timeout:300000});
 console.log(await frame.$eval('#status',e=>e.textContent));
 await frame.click('#start');
 await frame.waitForFunction(()=>window.reforgedStatus||/failed|Unable/.test(document.querySelector('#log').textContent),{timeout:120000});
 console.log(await frame.evaluate(()=>({status:window.reforgedStatus,log:document.querySelector('#log').textContent.slice(-1500)})));
 if(!await frame.evaluate(()=>window.reforgedStatus))throw Error('Original-engine playtest status missing');
 await page.screenshot({path:'validation/reforged/editor-playtest.png'});
}finally{await browser.close();await new Promise(r=>server.close(r));}
