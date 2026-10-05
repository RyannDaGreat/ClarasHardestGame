import {createRequire} from 'node:module';
const require = createRequire(new URL('../../validation/package.json', import.meta.url));
const {default:puppeteer} = await import(require.resolve('puppeteer'));
import{createServer}from'node:http';
import{createReadStream}from'node:fs';
import{readFile,writeFile,stat}from'node:fs/promises';
import{resolve,extname}from'node:path';
const root=resolve('.');
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
  await page.goto(`http://127.0.0.1:${server.address().port}/build/?scene=LvGen%20B`,{timeout:180000});
  await page.waitForFunction(()=>window.assetsReady,{timeout:300000});
  const script=await readFile('validation/reforged/python-probe.py','utf8');
  await page.evaluate(script=>{Module.FS.writeFile('/game/probe.py',script);const original=Module.callMain;Module.callMain=args=>original([...args,'/game/probe.py']);},script);
  await page.click('#start');
  await page.waitForFunction(()=>window.gameStarted || document.querySelector('#log').textContent.includes('Python startup failed'),{timeout:120000});
  if(!await page.evaluate(()=>window.gameStarted))throw Error('Original engine startup failed; inspect Python log');
  await new Promise(r=>setTimeout(r,2000));
  if(!logs.some(l=>l.includes('REFORGED_PYTHON_TICK_PASS')))throw Error('Python runtime tick was not confirmed');
  if(errors.length)throw Error(errors.join('\n'));
  await page.screenshot({path:'validation/reforged/python-probe.png'});
  console.log('PASS: genuine embedded Python2.6.2 JSON, BGE clone, placement, property, deletion, and five runtime ticks.');
}finally{await writeFile('.claude_logs/reforged-python-probe.log',logs.join('\n'));await browser.close();await new Promise(r=>server.close(r));}
