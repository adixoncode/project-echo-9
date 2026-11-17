/** Read-only camera-pixel -> actual submitted triangles, including surface stream. */
import {buildCorridor} from '../src/corridor.js';
import {buildScene} from '../src/scene.js';
import {lookAngles,normalize} from '../src/math.js';
import {firstMeshHit} from '../tests/helpers/corridor-ray.mjs';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const c=buildCorridor(),legacy=buildScene(),position=Array.from(new Float32Array([-1.2,1.72,25.6])),[yaw,pitch]=lookAngles([-1.2,1.72,25.6],[-8.5,1.76,62]);
const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),pack=a=>Array.from(new Float32Array(a));
const right=pack([cy,0,sy]),up=pack([sy*sp,cp,-cy*sp]),forward=pack([sy*cp,-sp,-cy*cp]),tangent=pack([1920/1080*Math.tan(Math.PI*52/360),Math.tan(Math.PI*52/360)]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const samples=[];
for(const pixel of [[1600,600],[1750,500],[1500,800],[1450,540],[1850,700],[700,500],[700,545],[710,600]]){
 const ndc=[(pixel[0]+.5)/1920*2-1,1-(pixel[1]+.5)/1080*2],ray=normalize(forward.map((v,i)=>v+right[i]*ndc[0]*tangent[0]+up[i]*ndc[1]*tangent[1]));
 const hit=firstMeshHit(c.vertices,position,ray);const ranges=[[0,legacy.corridorDrawRange.firstVertex],[legacy.corridorDrawRange.firstVertex+legacy.corridorDrawRange.vertexCount,legacy.vertices.length/12]];
 let nearest=hit?{sector:'corridor',...hit}:null;
 for(const [a,b] of ranges){const q=firstMeshHit(legacy.vertices.subarray(a*12,b*12),position,ray,nearest?.distance??Infinity);if(q)nearest={sector:'legacy',...q,triangle:q.triangle+a/3};}
 const result={pixel,ndc,ray,nearest};
 if(nearest?.sector==='corridor'){
  const index=nearest.triangle*36,vi=[0,12,24].map(o=>Array.from(c.vertices.subarray(index+o,index+o+12))),si=[0,8,16].map(o=>Array.from(c.surfaces.subarray(nearest.triangle*24+o,nearest.triangle*24+o+8)));
  const ab=sub(vi[1].slice(0,3),vi[0].slice(0,3)),ac=sub(vi[2].slice(0,3),vi[0].slice(0,3)),ap=sub(nearest.world,vi[0].slice(0,3)),aa=dot(ab,ab),bb=dot(ab,ac),cc=dot(ac,ac),d=dot(ap,ab),e=dot(ap,ac),den=aa*cc-bb*bb,v=(cc*d-bb*e)/den,w=(aa*e-bb*d)/den,weights=[1-v-w,v,w];
  const interp=(data,n)=>Array.from({length:n},(_,i)=>data.reduce((s,q,j)=>s+weights[j]*q[i],0));
  const surface=interp(si,8),centres=vi.map((q,j)=>q.slice(0,3).map((p,i)=>p-si[j][i]));
  result.corridorSurface={triangleVertexNormalsColorsPbr:vi,triangleSurfaceStream:si,barycentricWeights:weights,primitiveLocalAtHit:surface.slice(0,3),family:surface[3],halfExtents:surface.slice(4,7),pbr:{emission:vi[0][9],roughness:vi[0][10],metal:vi[0][11]},axisAlignedCentre:centres.every(q=>q.every((p,i)=>Math.abs(p-centres[0][i])<1e-4))?centres[0]:null};
 }
 samples.push(result);
}
const report={scope:'Read-only CPU first-hit diagnosis against exact submitted current corridor and unchanged legacy non-corridor triangle ranges. Pixel centres; packedf32 camera basis/tangents. MSAA subpixel edge coverage not measured.',artifactSha256:createHash('sha256').update(await readFile('index.html')).digest('hex'),camera:{position,yaw,pitch,verticalFovDegrees:52,viewport:[1920,1080]},samples};
await writeFile('docs/qa/overhaul-v1/iteration-4b/round-1/verification/camera-ray-diagnosis.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(samples.map(s=>({pixel:s.pixel,hit:s.nearest,local:s.corridorSurface?.primitiveLocalAtHit,half:s.corridorSurface?.halfExtents,centre:s.corridorSurface?.axisAlignedCentre,pbr:s.corridorSurface?.pbr})),null,2));
