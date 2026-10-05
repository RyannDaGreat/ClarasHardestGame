'use strict';
const canvas = document.querySelector('#canvas');
const player = document.querySelector('#player');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#start');
const startLabel = document.querySelector('#start-label');
const statusElement = document.querySelector('#status');
const storageStatus = document.querySelector('#storage-status');
const storageWarning = document.querySelector('#storage-warning');
const progress = document.querySelector('#progress');
const logElement = document.querySelector('#log');
const manifestURL = new URL('assets/assets.json', location.href);
const cacheName = 'rhg-assets-v1:' + manifestURL.pathname;
const params = new URLSearchParams(location.search);
const MIB = 1024 * 1024;
let assetCache = null;
let assetsReady = false;
let failed = false;
let loadedBytes = 0;
let totalBytes = 0;
let reforgedLevel = null;
window.cacheStats = {hits:0, downloads:0};

function log(message) {
  console.log(message);
  logElement.textContent += String(message) + '\n';
}
function warnStorage(error) {
  console.warn(error);
  logElement.textContent += `Browser storage: ${error.message || error}\n`;
  storageWarning.hidden = false;
  storageWarning.textContent = 'Browser storage is unavailable or full. You can play, but some files may download again.';
  storageStatus.textContent = 'Ready for this visit';
  assetCache = null;
}
function failure(error) {
  console.error(error);
  logElement.textContent += String(error.stack || error) + '\n';
  failed = true;
  overlay.hidden = false;
  progress.hidden = true;
  statusElement.textContent = `Unable to start: ${error.message || error}`;
  startLabel.textContent = 'Retry';
  startButton.disabled = false;
  startButton.setAttribute('aria-label', 'Reload to retry');
}
var Module = {
  canvas, noInitialRun:true,
  locateFile:name => new URL('runtime/' + name, location.href).href,
  print:log,
  printErr:message => {console.error(message); logElement.textContent += message + '\n';},
  onAbort:failure,
  onReforgedStatus:text => {
    const status = JSON.parse(text);
    window.reforgedStatus = status;
    if (status.won) {
      statusElement.textContent = 'Level complete!';
      document.querySelector('#reforged-win').hidden = false;
    }
  },
  onGameExit:code => {
    window.gameStarted = false;
    failed = true;
    overlay.hidden = false;
    statusElement.textContent = `Game stopped (${code}).`;
    startLabel.textContent = 'Play again';
    startButton.disabled = false;
  },
  onRuntimeInitialized:() => {
    window.runtimeReady = true;
    prepareGame().catch(failure);
  }
};
async function hash(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    byte => byte.toString(16).padStart(2, '0')).join('');
}
async function validBytes(bytes, file) {
  return bytes.byteLength === file.bytes && await hash(bytes) === file.sha256;
}
async function checkedFetch(file) {
  const url = new URL(file.url, manifestURL).href;
  if (assetCache) {
    let cached;
    try { cached = await assetCache.match(url); }
    catch (error) { warnStorage(error); }
    if (cached) {
      const bytes = new Uint8Array(await cached.arrayBuffer());
      if (await validBytes(bytes, file)) {
        window.cacheStats.hits++;
        return bytes;
      }
      log(`Cached file failed verification; downloading a fresh copy: ${file.url}`);
      try { await assetCache.delete(url); }
      catch (error) { warnStorage(error); }
    }
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${file.url}: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!await validBytes(bytes, file)) throw new Error(`${file.url}: size or SHA-256 mismatch`);
  window.cacheStats.downloads++;
  if (assetCache) {
    try { await assetCache.put(url, new Response(bytes)); }
    catch (error) { warnStorage(error); }
  }
  return bytes;
}
function advanceProgress(bytes) {
  loadedBytes += bytes;
  progress.value = loadedBytes;
  statusElement.textContent = `Preparing game · ${Math.round(loadedBytes / MIB)} / ${Math.round(totalBytes / MIB)} MB`;
}
function writeFile(path, bytes) {
  Module.FS.mkdirTree(path.slice(0, path.lastIndexOf('/')));
  Module.FS.writeFile(path, bytes, {canOwn:true});
}
async function loadGame(game) {
  const result = new Uint8Array(game.bytes);
  const offsets = [];
  let offset = 0;
  for (const chunk of game.chunks) {offsets.push(offset); offset += chunk.bytes;}
  if (offset !== game.bytes) throw new Error('Game chunk lengths do not match manifest');
  let next = 0;
  async function worker() {
    while (next < game.chunks.length) {
      const index = next++;
      const bytes = await checkedFetch(game.chunks[index]);
      result.set(bytes, offsets[index]);
      advanceProgress(bytes.length);
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  if (await hash(result) !== game.sha256) throw new Error('Reassembled .blend SHA-256 mismatch');
  return result;
}
async function prepareGame() {
  if (params.has('reforged')) {
    const mode = params.get('reforged');
    if (mode === 'editor') {
      const saved = localStorage.getItem('reforged-play-v1');
      if (!saved) throw new Error('No editor playtest is saved. Open the workshop first.');
      reforgedLevel = JSON.parse(saved);
    } else {
      const name = mode === 'challenge' ? 'Gauntlet' : mode;
      if (!['Gauntlet', 'Crossfire', 'Switchback', 'Parallax'].includes(name)) throw new Error('Unknown bundled Reforged level');
      const response = await fetch('reforged/levels/' + name + '.json');
      if (!response.ok) throw new Error(`Challenge: HTTP ${response.status}`);
      reforgedLevel = await response.json();
    }
    if (reforgedLevel.format !== 'reforged' || reforgedLevel.version !== 1) throw new Error('Unsupported Reforged level');
    const response = await fetch('reforged/play.py');
    if (!response.ok) throw new Error(`Playtest observer: HTTP ${response.status}`);
    writeFile('/game/reforged.py', await response.text());
    writeFile('/game/level.json', JSON.stringify(reforgedLevel));
    document.title = reforgedLevel.name + ' · Reforged';
    document.querySelector('.below-player > span').textContent = 'WASD to move · Arrow keys to move and turn · Backspace to respawn';
    document.querySelector('.controls-grid').innerHTML = '<p><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> Move in world directions</p><p><kbd>↑</kbd> <kbd>↓</kbd> Move forward/back<br><kbd>←</kbd> <kbd>→</kbd> Turn</p><p><kbd>Backspace</kbd> Respawn at the start</p><p>Reach the gold finish. Use the level browser to choose another challenge.</p>';
    document.querySelector('.brand').firstChild.textContent = reforgedLevel.name;
    document.querySelector('.edition').textContent = 'REFORGED · ORIGINAL ENGINE';
  }
  statusElement.textContent = 'Checking saved game…';
  if ('caches' in window) {
    try { assetCache = await caches.open(cacheName); }
    catch (error) { warnStorage(error); }
  } else {
    warnStorage(new Error('Cache API is unavailable in this browser'));
  }
  // Refresh the small manifest so an edited .blend is discovered on the next visit.
  const response = await fetch(manifestURL, {cache:'no-cache'});
  if (!response.ok) throw new Error(`Asset manifest: HTTP ${response.status}`);
  const manifest = await response.json();
  const files = [...manifest.game.chunks, ...manifest.files];
  totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  progress.max = totalBytes;
  progress.value = 0;
  for (const missing of manifest.missing) log(`Original asset unavailable: ${missing.id} (${missing.path})`);
  writeFile('/game/game.blend', await loadGame(manifest.game));
  for (const file of manifest.files) {
    const bytes = await checkedFetch(file);
    writeFile(file.virtual, bytes);
    advanceProgress(file.bytes);
  }
  Module.FS.chdir('/game');
  log(`Verified unchanged .blend SHA-256 ${manifest.game.sha256}`);
  if (assetCache) {
    // Retire outdated assets only after the current game has fully loaded.
    const current = new Set(files.map(file => new URL(file.url, manifestURL).href));
    try {
      for (const entry of await assetCache.keys()) {
        if (!current.has(entry.url)) await assetCache.delete(entry);
      }
      storageStatus.textContent = 'Game saved in this browser · faster next time';
    } catch (error) { warnStorage(error); }
  }
  assetsReady = true;
  window.assetsReady = true;
  progress.hidden = true;
  startLabel.textContent = 'Play';
  startButton.disabled = false;
  statusElement.textContent = 'Click to play';
}
startButton.addEventListener('click', () => {
  if (failed) {location.reload(); return;}
  if (!assetsReady || window.gameStarted) return;
  startButton.disabled = true;
  try {
    // Keep engine/audio startup inside this actual user gesture.
    if (assetCache && navigator.storage?.persist) {
      navigator.storage.persist().then(persistent => {
        log(persistent ? 'Persistent browser storage granted.' : 'Game cached; the browser may evict it when storage is needed.');
      }).catch(warnStorage);
    }
    statusElement.textContent = 'Starting game…';
    const args = ['/game/game.blend'];
    if (reforgedLevel) {
      args.push(reforgedLevel.scene, '/game/reforged.py', '/game/level.json');
    } else if (params.has('scene')) {
      args.push(params.get('scene'));
      log('Diagnostic scene startup omits earlier scene state.');
    }
    Module.callMain(args);
    if (!Module.originalEngineStarted) throw new Error('The original engine did not start. See the runtime log.');
    window.gameStarted = true;
    overlay.hidden = true;
    player.classList.add('playing');
    canvas.focus();
  } catch (error) {failure(error);}
});
document.querySelector('#fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await player.requestFullscreen();
    canvas.focus();
  } catch (error) {
    log(`Fullscreen unavailable: ${error.message}`);
    document.querySelector('#fullscreen').title = `Fullscreen unavailable: ${error.message}`;
  }
});
document.addEventListener('fullscreenchange', () => {
  document.querySelector('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});
document.querySelector('a[href="#controls"]').addEventListener('click', () => {
  document.querySelector('#controls').open = true;
});
canvas.addEventListener('click', () => canvas.focus());
