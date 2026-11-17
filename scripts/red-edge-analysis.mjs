import {readFile,writeFile} from 'node:fs/promises';
import {CORRIDOR_LIGHT_TABLE} from '../src/corridor-lights.js';
import {receiverPlaneGradient,projectShadow} from '../tests/helpers/shadow-plane.mjs';
const dir='docs/qa/overhaul-v1/iteration-3/p0',tag=process.env.QA_TAG||'before',mesh=JSON.parse(await readFile(`${dir}/mesh-${tag}.json`,'utf8')),gpu=JSON.parse(await readFile(`${dir}/${tag}-gpu.json`,'utf8'));
const result={artifactSha256:gpu.artifactSha256,method:'Actual GPU depth32float texels compared using runtime analytic receiver-plane PCF and independent CPU mesh rays; no texture modification',samples:[]};
for(const s of mesh.samples){
 const g=gpu.reports[0].shadows.find(v=>v.pixel.join()===s.pixel.join()),l=CORRIDOR_LIGHT_TABLE[1],p=s.world.map((v,i)=>v+s.normal[i]*.006),projection=projectShadow(p,l),gradient=receiverPlaneGradient(s.world,s.normal,l),fraction=g.shadowUv.map(v=>((v*2048-.5)%1+1)%1);let visibility=0;
 const taps=g.taps.map((t,i)=>{const expected=g.receiverClip[2]+gradient[0]*(t.uv[0]-g.shadowUv[0])+gradient[1]*(t.uv[1]-g.shadowUv[1])-.000012,weight=(i%2?fraction[0]:1-fraction[0])*(i>=2?fraction[1]:1-fraction[1]),lit=expected<=t.storedDepth;visibility+=lit?weight:0;return {...t,expected,weight,lit};});
 result.samples.push({...s,gpu:{uv:g.shadowUv,receiverDepth:g.receiverClip[2],coverage:g.shadowUv.every(v=>v>=0&&v<=1)&&g.receiverClip[2]>=0&&g.receiverClip[2]<=1,taps,visibility},cpuProjection:projection});
}
await writeFile(`${dir}/${tag}-measurements.json`,JSON.stringify(result,null,2));
console.log(result.samples.map(s=>({pixel:s.pixel,coverage:s.gpu.coverage,cone:s.source.cone,visibility:s.gpu.visibility,mesh:s.redKeyVisible})));
