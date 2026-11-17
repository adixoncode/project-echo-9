/** Phase4B round1: actual controlled C plus historicalA and axialB checks. */
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'docs/qa/overhaul-v1/iteration-4b/round-1');
await mkdir(out,{recursive:true});
const shots=[
 {id:'C',name:'Selected4B',position:[-1.2,1.72,25.6],target:[-8.5,1.76,62],verticalFovDegrees:52},
 {id:'A',name:'HistoricalCamera',position:[-2.35,1.72,27.5],target:[-13.5,1.78,61],verticalFovDegrees:64},
 {id:'B',name:'AxialConstructionCheck',position:[0,1.72,26],target:[0,1.75,65],verticalFovDegrees:52}
];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const metadata={captureStartedAt:new Date().toISOString(),browser:browser.version(),viewport:[1920,1080],deviceScaleFactor:1,quality:'High',msaa:4,time:12,seed:15515657,presentation:'Actual native WebGPU shaders; offscreen readback on software SwiftShader',hardwarePerformance:'BLOCKED',shots,modes:[]};
try{
 for(const mode of ['production','neutral']){
  const artifact=mode==='production'?resolve(root,'index.html'):'/tmp/echo9-4b-neutral/index.html';
  const port=mode==='production'?4173:4174;
  const url=`http://localhost:${port}/index.html?test=1&readback=1&view=4&quality=High&clean=1${mode==='neutral'?'&fog=0&bloom=0':''}`;
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
  const record={mode,url,artifactSha256:hash(await readFile(artifact)),images:[],errors};metadata.modes.push(record);
  try{
   await page.goto(url);await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:240000});
   if(!await page.evaluate(()=>window.echo9?.ready))throw Error('Renderer startup failed');
   record.servedArtifactSha256=await page.evaluate(async()=>{const b=await(await fetch(location.pathname,{cache:'no-store'})).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');});
   if(record.artifactSha256!==record.servedArtifactSha256)throw Error('Served artifact hash mismatch');
   for(const shot of shots){
    const before=await page.evaluate(shot=>{const e=window.echo9,b=e.getState().presentedFrames;e.setMenu(false);e.setTime(12);e.setView(4);e.setCameraShot(shot);document.querySelector('#hud').hidden=true;return b;},shot);
    await page.waitForFunction(n=>window.echo9.getState().presentedFrames>=n+2,before,{timeout:240000});
    const state=await page.evaluate(()=>window.echo9.getState());
    if(state.renderSize.join()!=='1920,1080'||state.verticalFovDegrees!==shot.verticalFovDegrees||state.time!==12)throw Error('Capture state mismatch');
    const file=`${mode}-${shot.id}.png`;await page.screenshot({path:resolve(out,file)});
    record.images.push({file,sha256:hash(await readFile(resolve(out,file))),shot,state});
    console.log(`${mode}-${shot.id} FullHD captured`,new Date().toISOString());
   }
   record.report=await page.evaluate(()=>window.echo9.getReport());
   record.geometryDiagnostic=await page.evaluate(async()=>window.__echoGeometryDiagnostics?await window.__echoGeometryDiagnostics():null);
   record.savedViewFovReset=await page.evaluate(()=>{window.echo9.setCameraShot({position:[0,1.72,26],target:[0,1.75,65],verticalFovDegrees:52});return window.echo9.setView(4).verticalFovDegrees;});
   record.routeFovReset=await page.evaluate(()=>{window.echo9.setCameraShot({position:[0,1.72,26],target:[0,1.75,65],verticalFovDegrees:52});window.echo9.startFlythrough();const f=window.echo9.getState().verticalFovDegrees;window.echo9.stopFlythrough();return f;});
   if(record.savedViewFovReset!==64||record.routeFovReset!==64)throw Error('Historical FOV reset regression');
   record.errors=errors;record.unexpectedRequests=requests.filter(x=>!x.startsWith(new URL(url).origin)&&!x.startsWith('data:'));
   if(errors.length||record.unexpectedRequests.length)throw Error('Browser error or external request');
  }catch(error){
   record.failure=error.message;
   record.failureDom=await Promise.race([page.evaluate(()=>({title:document.title,error:document.querySelector('#error')?.textContent,errorHidden:document.querySelector('#error')?.hidden,loading:document.querySelector('#loading')?.textContent,state:window.echo9?.getState()})).catch(e=>({inspectionFailure:e.message})),new Promise(r=>setTimeout(()=>r({inspectionFailure:'DOM inspection timeout'}),5000))]);
   await page.screenshot({path:resolve(out,`${mode}-failure.png`),timeout:15000}).catch(e=>{record.failureScreenshotError=e.message;});
   throw error;
  }finally{record.errors=errors;record.unexpectedRequests=requests.filter(x=>!x.startsWith(new URL(url).origin)&&!x.startsWith('data:'));await context.close();await writeFile(resolve(out,'capture.json'),JSON.stringify(metadata,null,2)+'\n');}
 }
}catch(error){metadata.failure=error.message;process.exitCode=1;console.error(error);}
finally{metadata.captureFinishedAt=new Date().toISOString();await writeFile(resolve(out,'capture.json'),JSON.stringify(metadata,null,2)+'\n');await browser.close();}
