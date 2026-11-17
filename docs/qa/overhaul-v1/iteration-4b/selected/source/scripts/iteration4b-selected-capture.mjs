/** Selected reviewedR2 candidate: non-art named-shot integration and exact image identity proof. */
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'docs/qa/overhaul-v1/iteration-4b/selected');await mkdir(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex'),samples=JSON.parse(await readFile(resolve(root,'docs/qa/overhaul-v1/iteration-3/p0/mesh-before.json'),'utf8')).samples;
const shot={id:'C2',position:[-1.2,1.72,25.6],target:[-13,1.76,62],verticalFovDegrees:52};
const metadata={captureStartedAt:new Date().toISOString(),shot,viewport:[1920,1080],deviceScaleFactor:1,quality:'High',msaa:4,time:12,seed:15515657,presentation:'Actual native WebGPU/WGSL; software SwiftShader offscreen readback',hardwarePerformance:'BLOCKED',modes:[]};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});metadata.browser=browser.version();
const save=()=>writeFile(resolve(out,'capture.json'),JSON.stringify(metadata,null,2)+'\n');
try{
 for(const mode of ['production','neutral']){
  const artifact=mode==='production'?resolve(root,'index.html'):mode==='neutral'?'/tmp/echo9-4b-neutral/index.html':'/tmp/echo9-4b-oldlights/index.html';
  const port=mode==='production'?4173:mode==='neutral'?4174:4175,url=`http://localhost:${port}/index.html?shot=4b&test=1&readback=1&quality=High&clean=1${mode==='neutral'?'&fog=0&bloom=0':''}`;
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
  const record={mode,url,artifactSha256:hash(await readFile(artifact)),images:[],errors};metadata.modes.push(record);await save();
  try{
   await page.goto(url);await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:300000});if(!await page.evaluate(()=>window.echo9?.ready))throw Error('Renderer startup failed');
   record.initialNamedShot=await page.evaluate(()=>({state:window.echo9.getState(),title:document.querySelector('#view-title').textContent,selected:[...document.querySelectorAll('[data-view].selected')].map(b=>b.dataset.view)}));
   if(record.initialNamedShot.state.shot!=='4b'||record.initialNamedShot.state.verticalFovDegrees!==52||record.initialNamedShot.state.view!==7||record.initialNamedShot.selected.length||record.initialNamedShot.title!=='PRESSURE TRANSIT')throw Error('Named director URL/HUD/selection mismatch');
   record.servedArtifactSha256=await page.evaluate(async()=>{const b=await(await fetch(location.pathname,{cache:'no-store'})).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');});if(record.servedArtifactSha256!==record.artifactSha256)throw Error('Served artifact hash mismatch');
   const before=await page.evaluate(()=>{const n=window.echo9.getState().presentedFrames;window.echo9.setMenu(false);window.echo9.setTime(12);document.querySelector('#hud').hidden=true;return n;});await page.waitForFunction(n=>window.echo9.getState().presentedFrames>=n+2,before,{timeout:300000});
   record.state=await page.evaluate(()=>window.echo9.getState());if(record.state.renderSize.join()!=='1920,1080'||record.state.time!==12||record.state.verticalFovDegrees!==52)throw Error('Capture state mismatch');
   const file=`${mode}-C2.png`;await page.screenshot({path:resolve(out,file)});record.images.push({file,sha256:hash(await readFile(resolve(out,file))),state:record.state});await save();console.log(file+' captured '+new Date().toISOString());
   if(mode==='production'){
    await page.evaluate(()=>{document.body.classList.remove('clean');document.querySelector('#hud').hidden=false;});await page.screenshot({path:resolve(out,'production-C2-hud.png')});record.images.push({file:'production-C2-hud.png',sha256:hash(await readFile(resolve(out,'production-C2-hud.png')))});await page.evaluate(()=>{document.body.classList.add('clean');document.querySelector('#hud').hidden=true;});
    record.hdrDiagnostics=await page.evaluate(async()=>window.echo9.getHdrDiagnostics());
    record.shadowDiagnostics=await page.evaluate(async samples=>window.echo9.getShadowDiagnostics(samples,1),samples);record.shadowSampleScope='15fixed world receivers from iteration3/p0/mesh-before.json; historical pixel labels are not current C2coordinates';
    await save();console.log('Final HDR/P0 shadow diagnostics collected');
   }
   record.geometry=await page.evaluate(async()=>window.echo9.getGeometryDiagnostics());record.neutralGeometry=await page.evaluate(async()=>window.__echoGeometryDiagnostics?window.__echoGeometryDiagnostics():null);record.lightingAB=await page.evaluate(()=>window.__echoLightingAB||null);record.report=await page.evaluate(()=>window.echo9.getReport());
   record.resetProof=await page.evaluate(()=>{
    const e=window.echo9,views=[];for(let n=1;n<=6;n++){const state=e.setView(n);views.push({view:n,state,selected:[...document.querySelectorAll('[data-view].selected')].map(b=>Number(b.dataset.view))});}
    e.setDirectorShot();e.startFlythrough();const flight=e.getState();e.stopFlythrough();e.setTime(12);e.setDirectorShot();return {views,flight,restoredDirector:e.getState()};
   });
   if(record.resetProof.views.some(v=>v.state.verticalFovDegrees!==64||v.state.shot!==null||v.selected.join()!==String(v.view))||record.resetProof.flight.verticalFovDegrees!==64||record.resetProof.flight.shot!==null||record.resetProof.restoredDirector.verticalFovDegrees!==52||record.resetProof.restoredDirector.shot!=='4b')throw Error('Historical view/flythrough FOV reset regression');
   if(mode==='old-lights'){
    const prod=metadata.modes.find(m=>m.mode==='production');for(const key of ['vertexStreamSha256','positionNormalSha256','surfaceStreamSha256'])if(record.geometry[key]!==prod.geometry[key])throw Error('Old-light A/B mesh identity failed: '+key);
   }
   record.errors=errors;record.unexpectedRequests=requests.filter(x=>!x.startsWith(new URL(url).origin)&&!x.startsWith('data:'));if(errors.length||record.unexpectedRequests.length)throw Error('Browser error/external request');
  }catch(error){record.failure=error.message;record.failureDom=await Promise.race([page.evaluate(()=>({error:document.querySelector('#error')?.textContent,state:window.echo9?.getState()})).catch(e=>({error:e.message})),new Promise(r=>setTimeout(()=>r({error:'DOM timeout'}),5000))]);await page.screenshot({path:resolve(out,mode+'-failure.png'),timeout:15000}).catch(e=>record.failureScreenshotError=e.message);throw error;
  }finally{record.errors=errors;record.unexpectedRequests=requests.filter(x=>!x.startsWith(new URL(url).origin)&&!x.startsWith('data:'));await context.close();await save();}
 }
}catch(error){metadata.failure=error.message;process.exitCode=1;console.error(error);}
finally{metadata.captureFinishedAt=new Date().toISOString();await save();await browser.close();}
