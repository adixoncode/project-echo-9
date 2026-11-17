/** Final fixed-camera production WebGPU A/B. No source mutation or rebake between states. */
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,process.env.QA_DIR||'docs/qa/overhaul-v1/iteration-3');await mkdir(out,{recursive:true});
const artifact=resolve(root,'index.html'),hash=bytes=>createHash('sha256').update(bytes).digest('hex'),artifactSha256=hash(await readFile(artifact));
const url=process.env.ECHO_URL||'http://localhost:4173/index.html?test=1&readback=1&view=4&quality=High&clean=1';
const metadata={captureStartedAt:new Date().toISOString(),artifactSha256,url,viewport:[1920,1080],deviceScaleFactor:1,seed:15515657,fixedTime:12,quality:'High',msaa:4,presentation:'Actual software WebGPU offscreen render and CPU readback',hardwareAcceptance:'BLOCKED',cachedProbeHeldConstant:true,scope:'Grade changes only the final transfer; detailAA changes live receiver noise/specular filtering. The cached probe remains the same AA-on bake in every state.',captures:[],errors:[],unexpectedRequests:[]};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--enable-unsafe-webgpu','--use-angle=swiftshader']});
const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),page=await context.newPage(),requests=[];
page.on('pageerror',e=>metadata.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')metadata.errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
const equal=(actual,expected,label)=>{if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(`${label}: ${JSON.stringify(actual)} differs from ${JSON.stringify(expected)}`);};
async function freshFrames(before){
 await page.waitForFunction(n=>window.echo9?.getState().presentedFrames>=n+2||!document.querySelector('#error').hidden,before,{timeout:300000});
 const state=await page.evaluate(()=>window.echo9.getState());if(!state.ready)throw Error('Renderer failed: '+metadata.errors.join('\n'));
 if(state.presentedFrames<before+2)throw Error('Did not observe two fresh presented frames');return state;
}
function compareRgb(first,second){
 const code=`import json,sys\nfrom PIL import Image,ImageChops\na=Image.open(sys.argv[1]).convert('RGB');b=Image.open(sys.argv[2]).convert('RGB')\nif a.size!=b.size: raise ValueError('Image sizes differ')\nd=ImageChops.difference(a,b);n=sum(1 for p in d.getdata() if p!=(0,0,0));print(json.dumps({'first':sys.argv[1],'second':sys.argv[2],'size':list(a.size),'changedPixels':n,'identicalRGB':n==0,'differenceBounds':d.getbbox()}))`;
 return JSON.parse(execFileSync('python',['-c',code,first,second],{encoding:'utf8'}));
}
try{
 metadata.browser=browser.version();await page.goto(url);await page.waitForFunction(()=>window.echo9?.ready||!document.querySelector('#error').hidden,null,{timeout:300000});
 if(!(await page.evaluate(()=>window.echo9?.ready)))throw Error('Initialization failed: '+metadata.errors.join('\n'));
 metadata.servedArtifactSha256=await page.evaluate(async()=>{const bytes=await(await fetch('index.html',{cache:'no-store'})).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');});
 equal(metadata.servedArtifactSha256,artifactSha256,'Served source SHA');
 const before=await page.evaluate(()=>{const n=window.echo9.getState().presentedFrames;window.echo9.setMenu(false);window.echo9.setView(4);window.echo9.setTime(12);document.querySelector('#hud').hidden=true;return n;});await freshFrames(before);
 const variants=[['default-ab',{grade:'agx',detailAA:true}],['legacy-grade',{grade:'legacy',detailAA:true}],['no-detail-aa',{grade:'agx',detailAA:false}],['restored-default-ab',{grade:'agx',detailAA:true}]];
 for(let i=0;i<variants.length;i++){
  const [name,flags]=variants[i];let diagnosticResult=null;
  const before=await page.evaluate(({flags,change})=>{const n=window.echo9.getState().presentedFrames;return {before:n,result:change?window.echo9.setCorridorDiagnostics(flags):null};},{flags,change:i!==0});diagnosticResult=before.result;
  const state=await freshFrames(before.before),report=await page.evaluate(()=>window.echo9.getReport());
  equal(report.corridor.hdr.displayCurve,flags.grade,`${name} actual grade`);equal(report.corridor.materials.detailAA,flags.detailAA,`${name} actual detailAA`);
  equal(state.renderSize,[1920,1080],`${name} render size`);equal(state.quality,'High',`${name} quality`);equal(state.time,12,`${name} scene time`);equal(report.msaa,4,`${name} MSAA`);equal(report.seed,15515657,`${name} seed`);equal(report.devicePixelRatio,1,`${name} DPR`);
  if(diagnosticResult)equal(diagnosticResult.cachedProbeHeldConstant,true,`${name} cache disclosure`);
  equal(state.hero,{position:[-2.35,1.72,27.5],target:[-13.5,1.78,61],verticalFov:64},`${name} hero`);
  const path=resolve(out,`${name}.png`);await page.screenshot({path});metadata.captures.push({name,path,requestedFlags:flags,actualFlags:{grade:report.corridor.hdr.displayCurve,detailAA:report.corridor.materials.detailAA},diagnosticResult,state,report});console.log(`Captured ${name}`);
 }
 metadata.defaultMatchesFinal=compareRgb(resolve(out,'default-ab.png'),resolve(out,'after-clean.png'));metadata.restoredMatchesDefault=compareRgb(resolve(out,'restored-default-ab.png'),resolve(out,'default-ab.png'));
 if(!metadata.defaultMatchesFinal.identicalRGB)throw Error('Default A/B does not exactly match authoritative after-clean RGB');
 if(!metadata.restoredMatchesDefault.identicalRGB)throw Error('Restored default does not exactly match initial default RGB');
 metadata.artifactSha256After=hash(await readFile(artifact));equal(metadata.artifactSha256After,artifactSha256,'Source unchanged after A/B');
 metadata.status='PASS';
}catch(error){metadata.status='FAIL';metadata.failure=error.message;process.exitCode=1;console.error(error);}
finally{
 metadata.unexpectedRequests=requests.filter(r=>!r.startsWith(new URL(url).origin)&&!r.startsWith('data:'));metadata.requests=requests;
 if(metadata.errors.length||metadata.unexpectedRequests.length){metadata.status='FAIL';process.exitCode=1;}
 metadata.captureFinishedAt=new Date().toISOString();await writeFile(resolve(out,'final-ab.json'),JSON.stringify(metadata,null,2)+'\n');await context.close();await browser.close();
}
console.log(JSON.stringify({status:metadata.status,artifactSha256,errors:metadata.errors,unexpectedRequests:metadata.unexpectedRequests,failure:metadata.failure||null},null,2));
