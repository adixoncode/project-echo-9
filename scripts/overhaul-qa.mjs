/** Fixed-camera, real WebGPU evidence. Never accepts hardware performance on SwiftShader. */
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(import.meta.dirname,'..'),baseline=process.argv.includes('--baseline');
const out=resolve(root,process.env.QA_DIR||'docs/qa/overhaul-v1/iteration-4a');await mkdir(out,{recursive:true});
const tag=process.env.QA_TAG||(baseline?'before':'after');
const url=process.env.ECHO_URL||`http://localhost:${baseline?4179:4173}/index.html?test=1&readback=1&view=4&quality=High`;
const artifact=process.env.ECHO_ARTIFACT||(baseline?'/tmp/echo9-4a-baseline/index.html':resolve(root,'index.html'));
const artifactSha256=createHash('sha256').update(await readFile(artifact)).digest('hex');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
const page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
const metadata={captureStartedAt:new Date().toISOString(),artifactSha256,url,browser:browser.version(),viewport:[1920,1080],seed:15515657,fixedTime:12,hardwareAcceptance:'BLOCKED',presentation:'Software WebGPU offscreen readback; real shader output, not hardware acceptance',views:[]};
async function waitFrames(before){
 await page.waitForFunction(n=>window.echo9?.getState().presentedFrames>=n+2||!document.querySelector('#error').hidden,before,{timeout:240000});
 const state=await page.evaluate(()=>window.echo9.getState());
 if(!state.ready)throw Error('Renderer failed: '+errors.join('\n'));
 if(state.renderSize[0]!==1920||state.renderSize[1]!==1080)throw Error('Render resolution differs from 1920×1080');
 return state;
}
try{
 await page.goto(url);await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:240000});
 if(!(await page.evaluate(()=>window.echo9?.ready)))throw Error('Initialization failed: '+errors.join('\n'));
 metadata.servedArtifactSha256=await page.evaluate(async()=>{const bytes=await(await fetch(location.pathname,{cache:'no-store'})).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');});
 if(metadata.servedArtifactSha256!==artifactSha256)throw Error('Served artifact differs from the SHA recorded for this capture');
 await page.evaluate(()=>{window.echo9.setMenu(false);window.echo9.setTime(12);document.querySelector('#hud').hidden=true;});
 for(const view of (process.argv.includes('--hero-only')?[]:[1,2,3,5,6])){
  const before=await page.evaluate(n=>{const count=window.echo9.getState().presentedFrames;window.echo9.setView(n);return count;},view);
  const state=await waitFrames(before);await page.screenshot({path:resolve(out,`${tag}-view-${view}.png`)});
  metadata.views.push({view,state});console.log(`${tag}: captured sector regression view ${view}`);
 }
 const hero={position:[-2.35,1.72,27.5],target:[-13.5,1.78,61],verticalFovDegrees:64};
 const before=await page.evaluate(hero=>{
  const record=window.echo9.views?.[3];
  if(record && (JSON.stringify(record.position)!==JSON.stringify(hero.position)||JSON.stringify(record.target)!==JSON.stringify(hero.target)))throw Error('Saved hero camera changed outside the approved configuration');
  const n=window.echo9.getState().presentedFrames;window.echo9.setView(4);window.echo9.camera.position.set(hero.position);
  const dx=hero.target[0]-hero.position[0],dy=hero.target[1]-hero.position[1],dz=hero.target[2]-hero.position[2];
  window.echo9.camera.yaw=Math.atan2(dx,-dz);window.echo9.camera.pitch=-Math.atan2(dy,Math.hypot(dx,dz));return n;
 },hero);
 metadata.hero={...hero,state:await waitFrames(before)};
 await page.screenshot({path:resolve(out,`${tag}-clean.png`)});
 await page.evaluate(()=>{document.querySelector('#hud').hidden=false;});await page.waitForTimeout(400);
 await page.screenshot({path:resolve(out,`${tag}-hud.png`)});
 metadata.report=await page.evaluate(()=>window.echo9.getReport());
 metadata.geometryDiagnostic=await page.evaluate(async()=>window.__echoGeometryDiagnostics?await window.__echoGeometryDiagnostics():null);
 metadata.hdrDiagnostics=await page.evaluate(async()=>window.echo9.getHdrDiagnostics?await window.echo9.getHdrDiagnostics():null);
 if(process.env.ECHO_SHADOW_SAMPLES){
  const samples=JSON.parse(await readFile(resolve(root,process.env.ECHO_SHADOW_SAMPLES),'utf8')).samples;
  metadata.shadowDiagnostics=await page.evaluate(samples=>window.echo9.getShadowDiagnostics(samples,1),samples);
 }
 metadata.errors=errors;
 metadata.unexpectedRequests=requests.filter(r=>!r.startsWith(new URL(url).origin)&&!r.startsWith('data:'));
 if(errors.length||metadata.unexpectedRequests.length)process.exitCode=1;
 console.log(JSON.stringify({tag,artifactSha256,hero:metadata.hero,errors},null,2));
}catch(error){metadata.failure=error.message;metadata.errors=errors;console.error(error);process.exitCode=1;}
finally{metadata.captureFinishedAt=new Date().toISOString();await writeFile(resolve(out,`${tag}-capture.json`),JSON.stringify(metadata,null,2)+'\n');await context.close();await browser.close();}
