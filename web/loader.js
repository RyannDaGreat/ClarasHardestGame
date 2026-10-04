'use strict';
const canvas = document.querySelector('#canvas');
const startButton = document.querySelector('#start');
const statusElement = document.querySelector('#status');
const logElement = document.querySelector('#log');
const manifestURL = new URL('assets/assets.json', location.href);
const params = new URLSearchParams(location.search);
let assetsReady = false;
function log(message) { console.log(message); logElement.textContent += String(message) + '\n'; }
function failure(error) {
  console.error(error);
  statusElement.textContent = `Unable to start: ${error.message || error}`;
  logElement.textContent += String(error.stack || error) + '\n';
  startButton.textContent = 'Reload to retry';
}
var Module = {
  canvas, noInitialRun:true,
  locateFile:name=>new URL('runtime/' + name, location.href).href,
  print:log,
  printErr:message=>{console.error(message);logElement.textContent+=message+'\n';},
  onAbort:failure,
  onGameExit:code=>{statusElement.textContent=`Game stopped (${code}). Reload to play again.`;window.gameStarted=false;},
  onRuntimeInitialized:()=>{
    startButton.textContent='Load game';startButton.disabled=false;
    statusElement.textContent='Original game · about 390 MB download';window.runtimeReady=true;
  }
};
async function hash(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),
    byte=>byte.toString(16).padStart(2,'0')).join('');
}
async function checkedFetch(file) {
  const response=await fetch(new URL(file.url,manifestURL));
  if(!response.ok) throw new Error(`${file.url}: HTTP ${response.status}`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes.byteLength!==file.bytes) throw new Error(`${file.url}: incorrect byte length`);
  if(await hash(bytes)!==file.sha256) throw new Error(`${file.url}: SHA-256 mismatch`);
  return bytes;
}
function writeFile(path,bytes) {
  Module.FS.mkdirTree(path.slice(0,path.lastIndexOf('/')));
  Module.FS.writeFile(path,bytes,{canOwn:true});
}
async function loadGame(game) {
  const result=new Uint8Array(game.bytes);
  const offsets=[];let offset=0;
  for(const chunk of game.chunks){offsets.push(offset);offset+=chunk.bytes;}
  if(offset!==game.bytes) throw new Error('Game chunk lengths do not match manifest');
  let next=0,loaded=0;
  async function worker(){
    while(next<game.chunks.length){
      const index=next++,bytes=await checkedFetch(game.chunks[index]);
      result.set(bytes,offsets[index]);loaded+=bytes.length;
      statusElement.textContent=`Loading game: ${Math.round(loaded/1048576)} / ${Math.round(game.bytes/1048576)} MB`;
    }
  }
  await Promise.all([worker(),worker(),worker()]);
  if(await hash(result)!==game.sha256) throw new Error('Reassembled .blend SHA-256 mismatch');
  return result;
}
startButton.addEventListener('click',async()=>{
  startButton.disabled=true;
  try{
    if(!assetsReady){
      statusElement.textContent='Loading original game…';
      const response=await fetch(manifestURL);
      if(!response.ok) throw new Error(`Asset manifest: HTTP ${response.status}`);
      const manifest=await response.json();
      for(const missing of manifest.missing) log(`Original asset unavailable: ${missing.id} (${missing.path})`);
      writeFile('/game/game.blend',await loadGame(manifest.game));
      statusElement.textContent='Loading external textures and sound…';
      for(const file of manifest.files) writeFile(file.virtual,await checkedFetch(file));
      Module.FS.chdir('/game');
      log(`Verified unchanged .blend SHA-256 ${manifest.game.sha256}`);
      assetsReady=true;window.assetsReady=true;
      startButton.textContent='Play';startButton.disabled=false;
      statusElement.textContent='Ready — click Play to enable audio';
      return;
    }
    statusElement.textContent='Starting game…';canvas.focus();
    const args=['/game/game.blend'];
    if(params.has('scene')){args.push(params.get('scene'));log('Diagnostic scene startup omits earlier scene state.');}
    Module.callMain(args);
    if(!Module.originalEngineStarted) throw new Error('The original engine did not start. See the runtime log.');
    statusElement.textContent='Playing at 1920 × 1080';startButton.textContent='Playing';window.gameStarted=true;
  }catch(error){failure(error);}
});
document.querySelector('#fullscreen').addEventListener('click',()=>{
  canvas.requestFullscreen().catch(failure);canvas.focus();
});
canvas.addEventListener('click',()=>canvas.focus());
