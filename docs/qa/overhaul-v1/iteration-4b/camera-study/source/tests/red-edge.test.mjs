import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCorridor} from '../src/corridor.js';
import {CORRIDOR_LIGHT_TABLE} from '../src/corridor-lights.js';
import {normalize,dot} from '../src/math.js';
import {projectShadow} from './helpers/shadow-plane.mjs';
import {firstMeshHit} from './helpers/corridor-ray.mjs';
const vertices=buildCorridor().vertices,light=CORRIDOR_LIGHT_TABLE[1];
function visibility(world,normal=[-1,0,0]){const p=world.map((v,i)=>v+normal[i]*.006),delta=light.position.map((v,i)=>v-p[i]);return firstMeshHit(vertices,p,normalize(delta),Math.hypot(...delta)-1e-4,light);}
test('red pendant aperture leaves continuous falloff across both formerly clipped guard edges',()=>{
 for(const pair of [[[3.82,1.912,45.480],[3.82,1.737,45.480]],[[3.82,2.107,46.384],[3.82,1.923,46.385]]]){
  let previous=null;
  for(let step=0;step<=20;step++){
   const p=pair[0].map((v,i)=>v+(pair[1][i]-v)*step/20),projection=projectShadow(p,light),delta=p.map((v,i)=>v-light.position[i]),distance=Math.hypot(...delta),cosine=dot(normalize(delta),light.direction);
   assert.ok(projection.uv.every(v=>v>0&&v<1)&&projection.depth>0&&projection.depth<1);assert.ok(cosine>light.outerCos);assert.equal(visibility(p),null,'flood aperture must not self-shutter this unobstructed wall');
   const t=Math.min(1,Math.max(0,(cosine-light.outerCos)/(light.innerCos-light.outerCos))),irradiance=light.power*t*t*(3-2*t)/distance**2;
   if(previous!==null)assert.ok(Math.abs(irradiance-previous)<.1,'unoccluded falloff must vary smoothly over this narrow receiver span');previous=irradiance;
  }
 }
});
test('corrected pendant aperture preserves genuine nearby handle and panel occlusion',()=>{
 const caster=visibility([3.82,1.736,44.667]);assert.ok(caster,'real handle must still block red light');assert.ok(caster.distance<.2,'caster is attached to receiver, not lamp shutter');
 const panel=visibility([3.9,1.4,44.891]);assert.ok(panel);assert.ok(panel.distance<.2);
});
