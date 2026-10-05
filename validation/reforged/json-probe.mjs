import {createRequire} from 'node:module';
const require = createRequire(new URL('../../validation/package.json', import.meta.url));
const {default:puppeteer} = await import(require.resolve('puppeteer'));
import{createServer}from'node:http';
import{createReadStream}from'node:fs';
import{readFile,writeFile,stat}from'node:fs/promises';
import{resolve,extname}from'node:path';
const root=resolve('.'); const scene=process.env.JSON_SCENE||'Lv10';
const server=createServer(async(req,res)=>{
  try{
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path.startsWith('/build/runtime/player.'))path='/runtime/build/engine/'+path.split('/').pop();
    let full=resolve(root,'.'+path);if(!full.startsWith(root+'/'))throw Error('Invalid path');
    if((await stat(full)).isDirectory())full+='/index.html';
    const types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
    res.setHeader('Content-Type',types[extname(full)]||'application/octet-stream');
    createReadStream(full).on('error',err=>{console.error(err);res.destroy(err)}).pipe(res);
  }catch(err){console.error(String(err));res.writeHead(404);res.end(String(err));}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true});const page=await browser.newPage();const logs=[];const errors=[];
page.on('console',m=>{logs.push(m.text());if(/REFORGED|Traceback|Error|Python.*failed/.test(m.text()))console.log(m.text())});
page.on('pageerror',e=>{errors.push(String(e));console.error(e)});
try{
  await page.setViewport({width:1920,height:1180});
  await page.goto(`http://127.0.0.1:${server.address().port}/build/?scene=${encodeURIComponent(scene)}`,{timeout:180000});
  await page.waitForFunction(()=>window.assetsReady,{timeout:300000});
  const level=await readFile('web/reforged/levels/'+scene.replaceAll(' ','-')+'.json','utf8');
  const script="import GameLogic\nprint('REFORGED_JSON_RUNTIME_PASS', GameLogic.getCurrentScene().name, len(GameLogic.getCurrentScene().objects))\n";
  await page.evaluate(({script,level})=>{Module.FS.writeFile('/game/probe.py',script);Module.FS.writeFile('/game/level.json',level);const original=Module.callMain;Module.callMain=args=>original([...args,'/game/probe.py','/game/level.json']);},{script,level});
  await page.click('#start');
  await page.waitForFunction(()=>window.gameStarted || /(startup|assembly) failed/.test(document.querySelector('#log').textContent),{timeout:120000});
  if(!await page.evaluate(()=>window.gameStarted))throw Error('Original engine startup failed; inspect Python log');
  await new Promise(r=>setTimeout(r,2000));
  if(!logs.some(l=>l.includes('REFORGED_JSON_RUNTIME_PASS')))throw Error('Python runtime tick was not confirmed');
  if(errors.length)throw Error(errors.join('\n'));
  await page.screenshot({path:'validation/reforged/'+scene.replaceAll(' ','-')+'-json.png'});
  console.log('PASS: JSON assembled into original Blender objects and logic before conversion.');
}finally{await writeFile('.claude_logs/reforged-json-probe.log',logs.join('\n'));await browser.close();await new Promise(r=>server.close(r));}
