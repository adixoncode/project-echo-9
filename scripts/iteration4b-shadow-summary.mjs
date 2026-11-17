/** Reconstruct receiver-plane PCF from captured, unmodified GPU depth texels. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {receiverPlaneGradient} from '../tests/helpers/shadow-plane.mjs';
const capturePath=resolve(process.argv[2]||'docs/qa/overhaul-v1/iteration-4b/selected/capture.json');
const capture=JSON.parse(await readFile(capturePath,'utf8'));
const mode=capture.modes.find(m=>m.mode==='production'),light=mode.report.corridor.lightTable[1];
const source=JSON.parse(await readFile(new URL('../docs/qa/overhaul-v1/iteration-3/p0/mesh-before.json',import.meta.url),'utf8')).samples;
const samples=source.map(s=>{
 const g=mode.shadowDiagnostics.find(v=>v.pixel.join()===s.pixel.join());
 const gradient=receiverPlaneGradient(s.world,s.normal,light),fraction=g.shadowUv.map(v=>((v*2048-.5)%1+1)%1);let visibility=0;
 const taps=g.taps.map((t,i)=>{const expected=g.receiverClip[2]+gradient[0]*(t.uv[0]-g.shadowUv[0])+gradient[1]*(t.uv[1]-g.shadowUv[1])-.000012,weight=(i%2?fraction[0]:1-fraction[0])*(i>=2?fraction[1]:1-fraction[1]),lit=expected<=t.storedDepth;visibility+=lit?weight:0;return {...t,expected,weight,lit};});
 return {pixel:s.pixel,world:s.world,coverage:g.shadowUv.every(v=>v>=0&&v<=1)&&g.receiverClip[2]>=0&&g.receiverClip[2]<=1,visibility,taps};
});
const lit=['300,530','300,540','320,520','320,530'],blocked=['280,540','280,560'];
const checks=[...lit.map(key=>({sample:key,expectation:'formerly false-edge receiver lit',pass:samples.find(s=>s.pixel.join()===key).visibility>.99})),...blocked.map(key=>({sample:key,expectation:'real handle/panel occluded',pass:samples.find(s=>s.pixel.join()===key).visibility<.01}))];
const report={artifactSha256:mode.artifactSha256,method:'Actual depth32float GPU readback with receiver-plane PCF reconstruction at fixed world receivers. Pixel labels refer to historical iteration3, not current screen coordinates.',status:checks.every(c=>c.pass)&&samples.every(s=>s.coverage)?'PASS':'FAIL',checks,light,samples};
await writeFile(resolve(dirname(capturePath),'verification/p0-gpu-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks},null,2));if(report.status!=='PASS')process.exitCode=1;
