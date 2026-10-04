import puppeteer from 'puppeteer';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const url=process.argv[2] || 'http://localhost:8765/build/';
const output=resolve(process.argv[3] || 'validation/output');
await mkdir(output,{recursive:true});
await mkdir('.claude_logs',{recursive:true});
const browser=await puppeteer.launch({headless:true,...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE}: {})});
const page=await browser.newPage();
const errors=[],logs=[],result={url,viewport:{width:1920,height:1180},audio:[],errors};
page.on('console',message=>logs.push(`[${message.type()}] ${message.text()}`));
page.on('pageerror',error=>errors.push(String(error.stack||error)));
page.on('requestfailed',request=>errors.push(`Request failed: ${request.url()}: ${request.failure()?.errorText}`));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const key=code=>page.keyboard.press(code,{delay:120});
const shot=name=>page.screenshot({path:resolve(output,name+'.png')});
async function audioSample(){
  return page.evaluate(async()=>{
    const context=typeof AL==='undefined'?null:AL.currentCtx;
    if(!context)return {error:'Missing original OpenAL context'};
    const analyser=context.audioCtx.createAnalyser();context.gain.connect(analyser);
    const data=new Float32Array(analyser.fftSize);let peak=0,sum=0,count=0;
    for(let i=0;i<10;i++){
      await new Promise(resolve=>setTimeout(resolve,100));analyser.getFloatTimeDomainData(data);
      for(const value of data){peak=Math.max(peak,Math.abs(value));sum+=value*value;count++;}
    }
    context.gain.disconnect(analyser);
    const playing=Object.values(context.sources).filter(source=>source.state===0x1012).map(source=>source.id);
    return {state:context.audioCtx.state,peak,rms:Math.sqrt(sum/count),error:context.err,sampleRate:context.audioCtx.sampleRate,playing};
  });
}
try{
  await page.setViewport({...result.viewport,deviceScaleFactor:1});
  await page.goto(url,{timeout:180000});
  await page.waitForFunction(()=>window.runtimeReady,{timeout:180000});
  await page.click('#start');
  await page.waitForFunction(()=>window.assetsReady,{timeout:300000});
  await page.click('#start');
  await page.waitForFunction(()=>window.gameStarted,{timeout:180000});
  await delay(1500);await shot('01-title');
  await key('Space');await delay(2500);await shot('02-menu');
  await key('KeyS');await delay(600);await shot('03-level-selected');
  await key('Enter');await delay(2000);await shot('04-level1');
  for(let track=1;track<=9;track++){
    await key('Digit'+track);await delay(300);
    const audio=await audioSample();result.audio.push({track,...audio});
    if(audio.state!=='running'||!(audio.peak>0)||audio.error)throw new Error(`Music ${track} failed: ${JSON.stringify(audio)}`);
  }
  await page.keyboard.down('ArrowUp');await delay(2000);await page.keyboard.up('ArrowUp');
  await delay(300);await shot('05-movement-collision');
  await key('Tab');await delay(1000);await shot('06-restart');
  await key('Backspace');await delay(1500);await shot('07-lv1-backspace-title');
  // Original Lv1 has no M handler. Its Backspace returns to Intro; test M in Lv2.
  await key('Space');await delay(2500);await key('KeyS');await delay(200);
  await key('KeyS');await delay(200);await key('Enter');await delay(1500);
  await key('KeyM');await delay(300);result.mutedAudio=await audioSample();await shot('08-lv2-music-off');
  // M toggles scene membership; a second press restores Music before selecting a track.
  await key('KeyM');await delay(300);await key('Digit1');await delay(300);result.resumedAudio=await audioSample();
  if(result.mutedAudio.peak>0.00001||!(result.resumedAudio.peak>0))throw new Error('Original Lv2 music toggle did not stop and restart playback');
  await key('Home');await delay(1500);await shot('09-home');
  result.canvas=await page.$eval('#canvas',canvas=>({width:canvas.width,height:canvas.height}));
  if(result.canvas.width!==1920||result.canvas.height!==1080)throw new Error('Incorrect drawing-buffer dimensions');
  if(errors.length)throw new Error(errors.join('\n'));
  result.pass=true;
  console.log('PASS: original engine startup, menu replay, nine music triggers, Lv2 music toggle, 1080p, no browser exceptions. Inspect screenshots for gameplay and visual fidelity.');
}catch(error){result.pass=false;result.failure=String(error.stack||error);throw error;}
finally{
  await writeFile(resolve(output,'results.json'),JSON.stringify(result,null,2)+'\n');
  await writeFile(resolve('.claude_logs','browser-smoke.log'),logs.join('\n')+'\n');
  await browser.close();
}
