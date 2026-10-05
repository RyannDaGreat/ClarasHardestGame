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

export {server};
