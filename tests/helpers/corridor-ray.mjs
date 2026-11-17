import {cross,dot} from '../../src/math.js';
// Independent double-sided Moller-Trumbore test against the actual baked mesh.
export function firstMeshHit(vertices,origin,direction,limit=Infinity,clip=null){
 let nearest=null;
 for(let i=0;i<vertices.length;i+=36){
  const a=Array.from(vertices.subarray(i,i+3)),b=Array.from(vertices.subarray(i+12,i+15)),c=Array.from(vertices.subarray(i+24,i+27)),e1=b.map((v,j)=>v-a[j]),e2=c.map((v,j)=>v-a[j]),p=cross(direction,e2),det=dot(e1,p);if(Math.abs(det)<1e-9)continue;
  const tvec=origin.map((v,j)=>v-a[j]),u=dot(tvec,p)/det;if(u<0||u>1)continue;
  const q=cross(tvec,e1),v=dot(direction,q)/det;if(v<0||u+v>1)continue;
  const distance=dot(e2,q)/det;if(distance<=1e-5||distance>=limit)continue;
  const world=origin.map((v,j)=>v+direction[j]*distance);if(clip&&dot(world.map((v,j)=>v-clip.position[j]),clip.direction)<.15)continue;
  nearest={triangle:i/36,distance,world};limit=distance;
 }
 return nearest;
}
