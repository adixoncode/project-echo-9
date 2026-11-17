// CPU ray evidence for the observed red-wall contours. Does not alter the runtime scene.
import {buildCorridor,CORRIDOR_HERO} from '../src/corridor.js';
import {CORRIDOR_LIGHT_TABLE} from '../src/corridor-lights.js';
import {lookAngles} from '../src/math.js';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {projectShadow} from '../tests/helpers/shadow-plane.mjs';
const vertices=buildCorridor().vertices,[yaw,pitch]=lookAngles(CORRIDOR_HERO.position,CORRIDOR_HERO.target),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),camera=CORRIDOR_HERO.position,light=CORRIDOR_LIGHT_TABLE[1];
const normalize=a=>{const d=Math.hypot(...a);return a.map(v=>v/d);};
function hit(origin,dir,limit=Infinity,clipLight=false){
 let best=limit,index=-1;
 for(let j=0;j<vertices.length;j+=36){
  const ax=vertices[j],ay=vertices[j+1],az=vertices[j+2],e1x=vertices[j+12]-ax,e1y=vertices[j+13]-ay,e1z=vertices[j+14]-az,e2x=vertices[j+24]-ax,e2y=vertices[j+25]-ay,e2z=vertices[j+26]-az;
  const px=dir[1]*e2z-dir[2]*e2y,py=dir[2]*e2x-dir[0]*e2z,pz=dir[0]*e2y-dir[1]*e2x,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-9)continue;
  const inv=1/det,tx=origin[0]-ax,ty=origin[1]-ay,tz=origin[2]-az,u=(tx*px+ty*py+tz*pz)*inv;if(u<0||u>1)continue;
  const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(dir[0]*qx+dir[1]*qy+dir[2]*qz)*inv;if(v<0||u+v>1)continue;
  const t=(e2x*qx+e2y*qy+e2z*qz)*inv;
  if(t>1e-5&&t<best){if(clipLight){const lp=origin.map((v,i)=>v+dir[i]*t-light.position[i]);if(lp.reduce((s,v,i)=>s+v*light.direction[i],0)<.15)continue;}best=t;index=j;}
 }
 return index<0?null:{distance:best,index,world:origin.map((v,i)=>v+dir[i]*best),triangle:Array.from(vertices.subarray(index,index+36)).filter((v,i)=>i%12<3)};
}
const samples=[];
for(const[x,y]of [[280,530],[280,540],[280,550],[280,560],[300,520],[300,530],[300,540],[300,550],[320,500],[320,510],[320,520],[320,530],[320,540],[330,525],[340,530]]){
 const sx=(2*(x+.5)/1920-1)*1920/1080*Math.tan(32*Math.PI/180),uy=(1-2*(y+.5)/1080)*Math.tan(32*Math.PI/180),dir=normalize([sy*cp+cy*sx+sy*sp*uy,-sp+cp*uy,-cy*cp+sy*sx-cy*sp*uy]),h=hit(camera,dir);
 const p=camera.map((v,i)=>v+dir[i]*h.distance),normal=Array.from(vertices.subarray(h.index+3,h.index+6));if(normal.reduce((s,v,i)=>s-v*dir[i],0)<0)for(let i=0;i<3;i++)normal[i]*=-1;
 const origin=p.map((v,i)=>v+normal[i]*.006),delta=light.position.map((v,i)=>v-origin[i]),occluder=hit(origin,normalize(delta),Math.hypot(...delta)-1e-4,true);
 const sourceDelta=p.map((v,i)=>v-light.position[i]),distance=Math.hypot(...sourceDelta),cosine=sourceDelta.reduce((s,v,i)=>s+v*light.direction[i]/distance,0),smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);},cone=smooth(light.outerCos,light.innerCos,cosine),shadowProjection=projectShadow(origin,light);
 const unClipped=hit(origin,normalize(delta),Math.hypot(...delta)-1e-4,false);
 const unClippedDepth=unClipped?unClipped.world.reduce((s,v,i)=>s+(v-light.position[i])*light.direction[i],0):null;
 samples.push({pixel:[x,y],world:p,normal,receiverTriangle:h.index/36,source:{distance,cosine,outerCos:light.outerCos,innerCos:light.innerCos,cone,unoccludedRadiance:light.color.map(v=>v*light.power*cone/distance**2)},shadowProjection,redKeyVisible:!occluder,occluder,unClippedOccluder:unClipped,unClippedForwardDepth:unClippedDepth});
}
const html=await readFile(new URL('../index.html',import.meta.url));console.log(JSON.stringify({artifactSha256:createHash('sha256').update(html).digest('hex'),method:'CPU ray/triangle visibility; matches spotlight near clip 0.15m and world receiver offset 0.006m; not a GPU render',samples},null,2));
