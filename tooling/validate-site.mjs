import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]||'build');
const manifest=JSON.parse(await readFile(join(root,'assets/assets.json'),'utf8'));
let total=0;
async function walk(directory){
  for(const item of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,item.name);
    if(item.isSymbolicLink())throw new Error('Site must not contain symlinks: '+path);
    if(item.isDirectory())await walk(path);
    else {const size=(await stat(path)).size;total+=size;if(size>=100*1024*1024)throw new Error('Oversized file: '+path);}
  }
}
await walk(root);
if(total>=1024*1024*1024)throw new Error('Site exceeds GitHub Pages size cap');
const digest=createHash('sha256');let gameBytes=0;
for(const item of [...manifest.game.chunks,...manifest.files]){
  const path=resolve(root,'assets',item.url);
  if(!path.startsWith(join(root,'assets')+'/'))throw new Error('Asset URL escapes directory');
  const data=await readFile(path);
  if(data.length!==item.bytes||createHash('sha256').update(data).digest('hex')!==item.sha256)throw new Error('Invalid asset: '+item.url);
  if(!item.virtual){digest.update(data);gameBytes+=data.length;}
}
if(gameBytes!==manifest.game.bytes||digest.digest('hex')!==manifest.game.sha256)throw new Error('Invalid assembled game');
for(const path of ['index.html','loader.js','runtime/player.js','runtime/player.wasm','runtime/player.data'])await stat(join(root,path));
console.log(`Validated ${(total/1048576).toFixed(1)} MiB static site; original game hash ${manifest.game.sha256}`);
