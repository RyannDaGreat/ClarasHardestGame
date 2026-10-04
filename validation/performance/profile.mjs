import puppeteer from 'puppeteer';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const url=process.argv[2]||'http://127.0.0.1:8765/build/';
const scene=process.argv[3]||'Lv1';
const output=resolve(process.argv[4]||'validation/output/performance');
await mkdir(output,{recursive:true});
const browser=await puppeteer.launch({headless:process.env.HEADFUL!=='1',...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage();
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const messages={};page.on('console',message=>{const t=message.text();messages[t]=(messages[t]||0)+1;});
const errors=[];page.on('pageerror',error=>errors.push(String(error)));
try{
  await page.setViewport({width:1920,height:1180,deviceScaleFactor:1});
  const target=new URL(url);target.searchParams.set('scene',scene);
  await page.goto(target.href,{timeout:180000});
  await page.waitForFunction(()=>window.runtimeReady,{timeout:180000});
  await page.click('#start');await page.waitForFunction(()=>window.assetsReady,{timeout:300000});
  await page.click('#start');await page.waitForFunction(()=>window.gameStarted,{timeout:120000});
  if(process.env.PERF_PATCH)await page.evaluate(await readFile(process.env.PERF_PATCH,'utf8'));
  await delay(3000);
  if(process.env.DETACH_LOG==='1')await page.$eval('#log',log=>log.parentElement.remove());
  const gpu=await page.evaluate(()=>{
    const gl=GL.currentContext.GLctx, extension=gl.getExtension('WEBGL_debug_renderer_info');
    return {vendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
  });
  await page.evaluate(()=>{
    window.frameMetrics={frames:[],keys:[],draws:0};
    const gl=GL.currentContext.GLctx;
    for(const name of ['drawArrays','drawElements']){
      const draw=gl[name];gl[name]=function(...args){frameMetrics.draws++;return draw.apply(this,args);};
    }
    const run=MainLoop.runIter;
    MainLoop.runIter=function(func){const start=performance.now(),draws=frameMetrics.draws;run.call(this,func);frameMetrics.frames.push({start,duration:performance.now()-start,draws:frameMetrics.draws-draws});};
    addEventListener('keydown',event=>frameMetrics.keys.push({code:event.code,eventTime:event.timeStamp,handlerTime:performance.now()}),true);
  });
  const client=await page.createCDPSession();
  await client.send('Profiler.enable');await client.send('Profiler.setSamplingInterval',{interval:1000});await client.send('Profiler.start');
  for(let i=0;i<10;i++){await delay(700);await page.keyboard.press(i%2?'ArrowLeft':'ArrowRight',{delay:60});}
  await delay(2000);
  const {profile}=await client.send('Profiler.stop');
  const metrics=await page.evaluate(()=>frameMetrics);
  const drawStats=await page.evaluate(()=>window.drawStats);
  if(drawStats)await writeFile(resolve(output,scene+'-draws.json'),JSON.stringify(drawStats,null,2)+'\n');
  const sorted=values=>[...values].sort((a,b)=>a-b);
  const summary=values=>{const v=sorted(values);return {n:v.length,mean:v.reduce((a,b)=>a+b,0)/v.length,p50:v[Math.floor(v.length*.5)],p95:v[Math.floor(v.length*.95)],max:v.at(-1)};};
  const rendered=metrics.frames.filter(frame=>frame.draws>0);
  const renderPeriods=rendered.slice(1).map((frame,index)=>frame.start-rendered[index].start);
  const periods=metrics.frames.slice(1).map((frame,index)=>frame.start-metrics.frames[index].start);
  const keyboard=metrics.keys.map(key=>{
    const next=rendered.find(frame=>frame.start>=key.handlerTime);
    return {...key,queueDelay:key.handlerTime-key.eventTime,untilNextFrame:next?next.start-key.handlerTime:null,untilFrameEnd:next?next.start+next.duration-key.eventTime:null};
  });
  const data={url:target.href,scene,gpu,errors,messages,rendered:summary(rendered.map(frame=>frame.duration)),renderPeriods:summary(renderPeriods),renderFPS:1000/(renderPeriods.reduce((a,b)=>a+b,0)/renderPeriods.length),frames:summary(metrics.frames.map(frame=>frame.duration)),periods:summary(periods),fps:1000/(periods.reduce((a,b)=>a+b,0)/periods.length),keyboard,raw:metrics};
  await writeFile(resolve(output,scene+'.json'),JSON.stringify(data,null,2)+'\n');
  await writeFile(resolve(output,scene+'.cpuprofile'),JSON.stringify(profile));
  await page.screenshot({path:resolve(output,scene+'.png')});
  console.log(JSON.stringify({scene,gpu,callbackFPS:data.fps,renderFPS:data.renderFPS,renderedCPU:data.rendered,renderPeriods:data.renderPeriods,frameCPU:data.frames,framePeriods:data.periods,messages,keys:keyboard.map(({code,queueDelay,untilNextFrame,untilFrameEnd})=>({code,queueDelay,untilNextFrame,untilFrameEnd})),errors},null,2));
}finally{await browser.close();}
